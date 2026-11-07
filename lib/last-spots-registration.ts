import { createHash, randomUUID } from 'crypto';
import { collection, doc, getDocs, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { Participant, ParticipantInput, Order, EventConfig } from './types';
import { generateParticipantToken, generateQRCodeDataUrl } from './qr';
import { formatFolioNumber, formatOrderNumber, getPricingStages, invalidateConfigCache, invalidateOrdersCache, invalidateParticipantsCache, recordAuditLog } from './db';
import { LAST_SPOTS_CLOSES, isLastSpotsOpen } from './last-spots-window';
import { resolvePublicAppUrl } from './app-url';

const normalize = (value: string) => value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export class LastSpotsError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function createLastSpotsOrder(input: ParticipantInput, access: string, requestKey: string): Promise<{ order: Order; participant: Participant; reused: boolean }> {
  if (!isLastSpotsOpen(access)) throw new LastSpotsError('El enlace de últimos cupos está cerrado.', 403);
  if (!/^[0-9a-f-]{36}$/i.test(requestKey)) throw new LastSpotsError('Solicitud inválida. Recarga el formulario.', 400);

  const email = normalize(input.email);
  const name = normalize(input.fullName);
  const payloadHash = hash(JSON.stringify({ ...input, email, fullName: name }));
  const requestRef = doc(db, 'last_spots_requests', requestKey);
  const emailRef = doc(db, 'last_spots_locks', `email-${hash(email)}`);
  const nameRef = doc(db, 'last_spots_locks', `name-${hash(name)}`);
  const configRef = doc(db, 'config', 'nnr-paraiso-2026');
  const capacityRef = doc(db, 'last_spots_capacity', '2026-11-07');
  const folioCounterRef = doc(db, 'counters', 'folios');
  const orderCounterRef = doc(db, 'counters', 'orders');

  // Read existing runners once to cover registrations made before this link existed.
  const existing = (await getDocs(collection(db, 'participants'))).docs.map(snap => snap.data() as Participant);
  const existingOrders = (await getDocs(collection(db, 'orders'))).docs.map(snap => snap.data() as Order);
  const duplicate = existing.find(p => p.status !== 'cancelled' && (normalize(p.email) === email || normalize(p.fullName) === name));
  const activeCount = existing.filter(p => p.status !== 'cancelled').length;
  const maxFolio = existing.reduce((max, p) => Math.max(max, Number(p.folio?.match(/^NNR-(\d+)$/)?.[1]) || 0), 0);
  const maxOrder = existingOrders.reduce((max, order) => Math.max(max, Number(order.orderNumber?.match(/^NNR-ORD-(\d+)$/)?.[1]) || 0), 1000);
  const stages = await getPricingStages();
  const stage = stages.find(s => s.active && s.id !== 'stage-team') || stages.find(s => s.active);
  if (!stage) throw new LastSpotsError('No hay una etapa de inscripción disponible.', 503);

  const orderId = `ord-${randomUUID()}`;
  const participantId = `p-${randomUUID()}`;
  const isRecreativa = input.modality === 'Recreativa' || input.category?.toLowerCase().includes('recreativ');
  const unitPrice = isRecreativa ? 250 : stage.price;
  const createdAt = new Date().toISOString();

  const result = await runTransaction(db, async tx => {
    const requestSnap = await tx.get(requestRef);
    if (requestSnap.exists()) {
      const saved = requestSnap.data();
      if (saved.payloadHash !== payloadHash || saved.access !== access) throw new LastSpotsError('Esta solicitud ya fue utilizada con otros datos.', 409);
      if (saved.deleted) throw new LastSpotsError('El registro anterior fue eliminado. Recarga el formulario para comenzar de nuevo.', 409);
      const [orderSnap, participantSnap] = await Promise.all([
        tx.get(doc(db, 'orders', saved.orderId)),
        tx.get(doc(db, 'participants', saved.participantId)),
      ]);
      if (!orderSnap.exists() || !participantSnap.exists()) throw new LastSpotsError('No se pudo recuperar este registro. Contacta a soporte.', 409);
      const participant = participantSnap.data() as Participant;
      return { order: { ...orderSnap.data(), participants: [participant] } as Order, participant, reused: true };
    }

    const [configSnap, capacitySnap, folioSnap, orderCounterSnap, emailSnap, nameSnap] = await Promise.all([
      tx.get(configRef), tx.get(capacityRef), tx.get(folioCounterRef), tx.get(orderCounterRef), tx.get(emailRef), tx.get(nameRef),
    ]);
    const locks = [emailSnap, nameSnap].filter(snap => snap.exists());
    const lockParticipants = await Promise.all(locks.map(snap => tx.get(doc(db, 'participants', snap.data()!.participantId))));
    if (lockParticipants.some(snap => snap.exists() && (snap.data() as Participant).status !== 'cancelled') || duplicate) {
      throw new LastSpotsError('Este nombre o correo ya tiene una inscripción activa.', 409);
    }
    if (!configSnap.exists()) throw new LastSpotsError('No se pudo consultar el cupo del evento.', 503);
    const config = configSnap.data() as EventConfig;
    if (!isLastSpotsOpen(access) || config.registrationOpen === false) throw new LastSpotsError('El enlace de últimos cupos está cerrado.', 403);
    const occupied = Math.max(Number(capacitySnap.data()?.occupied) || 0, activeCount, Number(config.currentTotalRegistered) || 0);
    if (occupied >= config.maxTotalQuota) throw new LastSpotsError('Se agotaron los últimos cupos disponibles.', 409);

    const nextFolio = Math.max(Number(folioSnap.data()?.value) || 1, maxFolio + 1);
    const nextOrder = Math.max(Number(orderCounterSnap.data()?.value) || 1001, maxOrder + 1);
    const folio = formatFolioNumber(nextFolio);
    const orderNumber = formatOrderNumber(nextOrder);
    const qrCodeDataUrl = await generateQRCodeDataUrl(`${resolvePublicAppUrl()}/participante/${folio}`);
    const { clubOrTeam, ...runnerInput } = input;
    const participant: Participant = {
      ...runnerInput,
      ...(clubOrTeam ? { clubOrTeam } : {}),
      email: email.trim(), fullName: input.fullName.trim(),
      id: participantId, orderId, folio, lastSpotsRequestKey: requestKey,
      qrToken: generateParticipantToken(folio), qrCodeDataUrl,
      modality: isRecreativa ? 'Recreativa' : 'Competitiva',
      kitDelivered: false, createdAt, status: 'pending', unitPrice, discountApplied: 0,
    };
    const order: Order = {
      id: orderId, orderNumber, customerName: participant.fullName,
      customerEmail: participant.email, customerPhone: participant.phone,
      participantsCount: 1, stageId: stage.id, stageName: stage.name,
      modality: participant.modality, unitPrice, subtotal: unitPrice,
      discountAmount: 0, totalAmount: unitPrice, paymentMethod: 'transfer',
      paymentStatus: 'pending', paymentReference: `SPEI-${orderNumber}`,
      createdAt, updatedAt: createdAt,
    };
    tx.set(doc(db, 'participants', participantId), participant);
    tx.set(doc(db, 'orders', orderId), order);
    tx.set(folioCounterRef, { value: nextFolio + 1 }, { merge: true });
    tx.set(orderCounterRef, { value: nextOrder + 1 }, { merge: true });
    tx.set(capacityRef, { occupied: occupied + 1, closesAt: LAST_SPOTS_CLOSES }, { merge: true });
    tx.set(configRef, { currentTotalRegistered: occupied + 1 }, { merge: true });
    tx.set(emailRef, { participantId });
    tx.set(nameRef, { participantId });
    tx.set(requestRef, { access, payloadHash, orderId, participantId, createdAt });
    return { order: { ...order, participants: [participant] }, participant, reused: false };
  });

  invalidateConfigCache();
  invalidateParticipantsCache();
  invalidateOrdersCache();
  if (!result.reused) {
    try {
      await recordAuditLog('ORDER_CREATED', 'order', result.order.id, result.order.customerEmail, 'customer', `Últimos cupos: orden ${result.order.orderNumber}`);
    } catch (err) {
      console.error('Could not record last-spots audit log:', err);
    }
  }
  return result;
}
