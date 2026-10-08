import React, { useState, useEffect } from 'react';
import { getBookings } from '../../services/dataService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useCurrency } from '../../context/CurrencyContext';
import { CreditCard, DollarSign, Search, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminPayments = () => {
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeReceipt, setActiveReceipt] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const list = await getBookings();
    setBookings(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCollected = bookings.reduce(
    (sum, b) => b.payment_status === 'paid' ? sum + Number(b.total_amount || 0) : sum,
    0
  );

  const pendingCollection = bookings.reduce(
    (sum, b) => b.payment_status === 'pending' ? sum + Number(b.total_amount || 0) : sum,
    0
  );

  const filtered = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.payment_status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Payments & Financial Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of online gateways, security deposits, and in-person settlements.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadData}>
          Refresh Ledger
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Settled Online & Paid</span>
          <h3 className="text-2xl font-black text-emerald-400">{formatPrice(totalCollected)}</h3>
          <p className="text-[11px] text-slate-400">Total verified incoming transactions</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Pending Collection</span>
          <h3 className="text-2xl font-black text-amber-400">{formatPrice(pendingCollection)}</h3>
          <p className="text-[11px] text-slate-400">Cash on pickup or unpaid pending requests</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Ticket Size</span>
          <h3 className="text-2xl font-black text-slate-100">
            {formatPrice(bookings.length ? Math.round(totalCollected / bookings.length) : 0)}
          </h3>
          <p className="text-[11px] text-slate-400">Across {bookings.length} reservations</p>
        </div>
      </div>

      {/* Filter and Ledger Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'refunded'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <span className="text-slate-400">Displaying <strong className="text-slate-100">{filtered.length}</strong> transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Booking Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    TXN-{b.id.replace('bk-', '').toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                    {b.booking_code}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {b.customer_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {b.payment_method || 'Online Portal'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                    {formatPrice(b.total_amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={b.payment_status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FileText}
                      onClick={() => setActiveReceipt(b)}
                    >
                      Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Receipt Modal */}
      {activeReceipt && (
        <Modal
          isOpen={Boolean(activeReceipt)}
          onClose={() => setActiveReceipt(null)}
          title="Payment Ledger Receipt"
          subtitle={`Verified transaction log for ${activeReceipt.booking_code}`}
          maxWidth="max-w-md"
        >
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <div className="text-center pb-3 border-b border-slate-800">
              <h4 className="font-bold text-slate-100 text-sm">RentFlow Dispatch Billing</h4>
              <p className="text-slate-400 font-mono text-[11px]">TXN-{activeReceipt.id.toUpperCase()}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Renter:</span>
                <span className="font-semibold text-slate-200">{activeReceipt.customer_name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vehicle:</span>
                <span className="font-semibold text-slate-200">{activeReceipt.vehicle_name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Method:</span>
                <span className="font-semibold text-slate-200">{activeReceipt.payment_method || 'Online'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Status:</span>
                <span className="font-semibold text-emerald-400 uppercase">{activeReceipt.payment_status}</span>
              </div>
              <div className="flex justify-between text-slate-100 font-bold text-sm pt-2 border-t border-slate-800">
                <span>Total Settled:</span>
                <span className="text-amber-400 font-mono text-base">{formatPrice(activeReceipt.total_amount)}</span>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => window.print()} className="w-full">
              Print Commercial Receipt
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
