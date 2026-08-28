'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  RefreshCw,
  Eye,
  ExternalLink,
  ShieldCheck,
  X,
  Loader2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { Order } from '@/lib/types';

export default function AdminPagosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Review modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [processing, setProcessing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.data) setOrders(data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdatePayment = async (orderId: string, newStatus: 'approved' | 'rejected') => {
    setProcessing(true);
    setModalError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(null);
        fetchOrders();
      } else {
        setModalError(data.error || 'Error al actualizar pago');
      }
    } catch {
      setModalError('Error de conexión con el servidor');
    } finally {
      setProcessing(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setOrderToDelete(null);
        fetchOrders();
      } else {
        alert('Error al eliminar la orden');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Filtered orders
  const filtered = orders.filter(o => {
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      o.orderNumber.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerEmail.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'all' || o.paymentStatus === statusFilter;

    const matchesMethod =
      methodFilter === 'all' || o.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Módulo Financiero
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            PAGOS Y ÓRDENES ({orders.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Conciliación de transferencias bancarias SPEI y transacciones Mercado Pago.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por orden, titular, correo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Todos los Estados</option>
            <option value="approved">Aprobados</option>
            <option value="pending">Pendientes de Pago</option>
            <option value="rejected">Rechazados</option>
          </select>

          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Todos los Métodos</option>
            <option value="mercadopago">Mercado Pago</option>
            <option value="transfer">Transferencia SPEI</option>
            <option value="demo">Modo Demo / Cortesía</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Orden</th>
                <th className="py-3.5 px-4">Comprador</th>
                <th className="py-3.5 px-4">Corredores</th>
                <th className="py-3.5 px-4">Método</th>
                <th className="py-3.5 px-4 text-right">Monto Total</th>
                <th className="py-3.5 px-4">Estatus</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron órdenes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map(o => (
                  <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{o.customerName}</div>
                      <div className="text-[11px] text-slate-400">{o.customerEmail} · {o.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="font-bold text-white">{o.participantsCount}</span> corredor(es)
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-200 capitalize">{o.paymentMethod}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-white">
                      ${o.totalAmount.toLocaleString()} MXN
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        o.paymentStatus === 'approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : o.paymentStatus === 'pending'
                          ? 'bg-yellow-950 text-yellow-400 border border-yellow-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}>
                        {o.paymentStatus === 'approved' ? '✓ Aprobado' : o.paymentStatus === 'pending' ? '⏳ Pendiente' : '✗ Rechazado'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Revisar
                        </button>
                        <Link
                          href={`/confirmacion/${o.id}`}
                          target="_blank"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-lg"
                          title="Ver Boletos"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setOrderToDelete(o)}
                          className="p-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-400 rounded-lg transition-colors"
                          title="Eliminar Orden"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW & APPROVAL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                Detalles de Orden: {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl space-y-2 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Titular:</span>
                  <strong className="text-white">{selectedOrder.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white">{selectedOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Método de Pago:</span>
                  <span className="text-cyan-300 font-bold uppercase">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto Total:</span>
                  <span className="text-yellow-400 font-mono font-bold text-sm">${selectedOrder.totalAmount} MXN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estatus Actual:</span>
                  <span className="font-bold uppercase text-white">{selectedOrder.paymentStatus}</span>
                </div>
              </div>

              {/* Runners in order */}
              <div>
                <span className="block font-bold text-slate-300 mb-2">Corredores incluidos en esta orden:</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedOrder.participants?.map(p => (
                    <div key={p.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div>
                        <strong className="text-white">{p.fullName}</strong>
                        <span className="text-[10px] text-slate-400 block">{p.folio} · Talla {p.shirtSize}</span>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">{p.category}</span>
                    </div>
                  ))}
                </div>
              </div>

              {modalError && (
                <div className="p-2.5 bg-rose-950 border border-rose-500 rounded-xl text-rose-300 text-xs">
                  {modalError}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2">
                {selectedOrder.paymentStatus !== 'rejected' && (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleUpdatePayment(selectedOrder.id, 'rejected')}
                    className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold rounded-xl text-xs"
                  >
                    Rechazar Pago
                  </button>
                )}

                {selectedOrder.paymentStatus !== 'approved' && (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleUpdatePayment(selectedOrder.id, 'approved')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    )}
                    <span>Aprobar y Activar Boletos QR</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-rose-950/30">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-2 bg-rose-950/50 rounded-xl border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">¿Seguro que quieres eliminar?</h3>
            </div>
            
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Estás a punto de eliminar por completo la orden <strong className="text-white">{orderToDelete.orderNumber}</strong> de <strong className="text-white">{orderToDelete.customerName}</strong>.
              <br />
              <span className="text-rose-400 text-xs mt-2 block font-medium">
                Esta acción cancelará el pago y eliminará permanentemente a todos los {orderToDelete.participantsCount} corredores asociados. ¡Esta acción es irreversible!
              </span>
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-semibold transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteOrder}
                disabled={processing}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-950/40 text-sm"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin animate-spin text-white" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
