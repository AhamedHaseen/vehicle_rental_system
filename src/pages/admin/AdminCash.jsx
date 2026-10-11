import { useState, useEffect, useMemo } from 'react';
import { getBookings, updateBookingCash } from '../../services/dataService';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { 
  Banknote, Search, CheckCircle2, Clock, 
  ArrowRight, DollarSign, Wallet, FileText,
  AlertCircle, RefreshCw, UserCheck
} from 'lucide-react';

export const AdminCash = () => {
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All'); // All, advance, done, pending

  // Cash Action Modal
  const [activeBooking, setActiveBooking] = useState(null);
  const [cashStatusInput, setCashStatusInput] = useState('advance');
  const [advanceAmountInput, setAdvanceAmountInput] = useState('');
  const [cashNotesInput, setCashNotesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getBookings();
      setBookings(list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCashModal = (booking) => {
    setActiveBooking(booking);
    setCashStatusInput(booking.cash_status || 'advance');
    setAdvanceAmountInput(booking.advance_amount || Math.round((booking.total_amount || 0) * 0.4));
    setCashNotesInput(booking.cash_notes || '');
  };

  const handleSaveCash = async (e) => {
    e.preventDefault();
    if (!activeBooking) return;

    setIsSubmitting(true);
    try {
      const total = Number(activeBooking.total_amount || 0);
      let adv = Number(advanceAmountInput) || 0;
      let remaining = Math.max(0, total - adv);

      if (cashStatusInput === 'done') {
        adv = total;
        remaining = 0;
      } else if (cashStatusInput === 'pending') {
        adv = 0;
        remaining = total;
      }

      await updateBookingCash(activeBooking.id, {
        cash_status: cashStatusInput,
        advance_amount: adv,
        remaining_amount: remaining,
        cash_notes: cashNotesInput.trim(),
        payment_status: cashStatusInput === 'done' ? 'paid' : 'pending'
      });

      success('Cash Details Updated', `Updated settlement for ${activeBooking.customer_name}.`);
      setActiveBooking(null);
      loadData();
    } catch (err) {
      error('Update Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickMarkDone = async (booking) => {
    try {
      await updateBookingCash(booking.id, {
        cash_status: 'done',
        advance_amount: Number(booking.total_amount || 0),
        remaining_amount: 0,
        payment_status: 'paid',
        cash_notes: 'Full cash payment settled in counter.'
      });
      success('Cash Settled', `Marked as DONE for ${booking.customer_name}.`);
      loadData();
    } catch (err) {
      error('Failed', err.message);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const status = b.cash_status || (b.payment_status === 'paid' ? 'done' : 'pending');
      if (filterTab !== 'All' && status !== filterTab) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          b.customer_name?.toLowerCase().includes(q) ||
          b.customer_phone?.toLowerCase().includes(q) ||
          b.booking_code?.toLowerCase().includes(q) ||
          b.vehicle_name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bookings, search, filterTab]);

  // Aggregate stats
  const totalCashCollected = bookings.reduce((sum, b) => {
    const status = b.cash_status || (b.payment_status === 'paid' ? 'done' : 'pending');
    if (status === 'done') return sum + Number(b.total_amount || 0);
    if (status === 'advance') return sum + Number(b.advance_amount || 0);
    return sum;
  }, 0);

  const totalAdvancesHeld = bookings.reduce((sum, b) => {
    const status = b.cash_status || (b.payment_status === 'paid' ? 'done' : 'pending');
    if (status === 'advance') return sum + Number(b.advance_amount || 0);
    return sum;
  }, 0);

  const totalRemainingPending = bookings.reduce((sum, b) => {
    const status = b.cash_status || (b.payment_status === 'paid' ? 'done' : 'pending');
    if (status === 'advance') return sum + Number(b.remaining_amount || 0);
    if (status === 'pending') return sum + Number(b.total_amount || 0);
    return sum;
  }, 0);

  const doneCount = bookings.filter(b => (b.cash_status || (b.payment_status === 'paid' ? 'done' : 'pending')) === 'done').length;
  const advanceCount = bookings.filter(b => (b.cash_status || (b.payment_status === 'paid' ? 'done' : 'pending')) === 'advance').length;
  const pendingCount = bookings.filter(b => (b.cash_status || (b.payment_status === 'paid' ? 'done' : 'pending')) === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Banknote className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Cash Details & Advance Ledger</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Track who gave cash, advance down payments, and final completed settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
          >
            Refresh Ledger
          </Button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Cash Collected</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatPrice(totalCashCollected)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-sky-500 uppercase tracking-wider block">Advances Held ({advanceCount})</span>
            <span className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
              {formatPrice(totalAdvancesHeld)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">Pending Balance</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {formatPrice(totalRemainingPending)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0373b9] dark:text-[#38bdf8] uppercase tracking-wider block">Fully Settled (Done)</span>
            <span className="text-xl sm:text-2xl font-black text-[#0373b9] dark:text-[#38bdf8]">
              {doneCount} Bookings
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, phone, booking ID..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'All', label: 'All Records' },
            { id: 'advance', label: `Advance Paid (${advanceCount})` },
            { id: 'done', label: `Done / Full (${doneCount})` },
            { id: 'pending', label: `Pending Cash (${pendingCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cash Details Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Customer Who Gave Cash</th>
                <th className="py-3.5 px-4">Booking & Vehicle</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Advance Paid</th>
                <th className="py-3.5 px-4">Remaining Balance</th>
                <th className="py-3.5 px-4">Cash Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No cash records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const status = b.cash_status || (b.payment_status === 'paid' ? 'done' : 'pending');
                  const total = Number(b.total_amount || 0);
                  const adv = status === 'done' ? total : status === 'pending' ? 0 : Number(b.advance_amount || 0);
                  const remaining = status === 'done' ? 0 : status === 'pending' ? total : Math.max(0, total - adv);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {b.customer_name}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block">{b.customer_phone}</span>
                        {b.cash_notes && (
                          <span className="text-[10px] text-[#0373b9] dark:text-[#38bdf8] italic block mt-0.5">
                            Note: {b.cash_notes}
                          </span>
                        )}
                      </td>

                      {/* Booking Code & Vehicle */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#0373b9] dark:text-[#38bdf8] block">
                          {b.booking_code}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate block max-w-xs">
                          {b.vehicle_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {b.duration_days} Days rental ({b.payment_method || 'Cash'})
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {formatPrice(total)}
                      </td>

                      {/* Advance Paid */}
                      <td className="py-3.5 px-4">
                        <span className={`font-mono font-bold text-sm ${adv > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`}>
                          {formatPrice(adv)}
                        </span>
                        {status === 'advance' && (
                          <span className="text-[10px] text-sky-500 font-semibold block">Down payment</span>
                        )}
                      </td>

                      {/* Remaining Balance */}
                      <td className="py-3.5 px-4">
                        <span className={`font-mono font-bold text-sm ${remaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-500'}`}>
                          {remaining > 0 ? formatPrice(remaining) : 'Rs 0 (Settled)'}
                        </span>
                      </td>

                      {/* Cash Status Chip */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          status === 'done'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : status === 'advance'
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}>
                          {status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                          {status === 'advance' && <Clock className="w-3 h-3" />}
                          {status === 'pending' && <AlertCircle className="w-3 h-3" />}
                          <span>{status === 'done' ? 'DONE (PAID)' : status === 'advance' ? 'ADVANCE PAID' : 'PENDING CASH'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status !== 'done' && (
                            <button
                              onClick={() => handleQuickMarkDone(b)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold shadow-xs transition-colors"
                              title="Mark Full Payment Done"
                            >
                              Mark Done
                            </button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openCashModal(b)}
                          >
                            Update Cash
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Update Modal */}
      {activeBooking && (
        <Modal
          isOpen={Boolean(activeBooking)}
          onClose={() => setActiveBooking(null)}
          title={`Cash Settlement: ${activeBooking.customer_name}`}
          subtitle={`Vehicle: ${activeBooking.vehicle_name} | Total: ${formatPrice(activeBooking.total_amount)}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveCash} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Cash Payment Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'advance', label: 'Advance' },
                  { id: 'done', label: 'Done (Full)' },
                  { id: 'pending', label: 'Pending' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCashStatusInput(opt.id)}
                    className={`py-2 px-2 rounded-xl font-bold text-center border transition-all ${
                      cashStatusInput === opt.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {cashStatusInput === 'advance' && (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Advance Amount Paid (LKR) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={activeBooking.total_amount}
                  value={advanceAmountInput}
                  onChange={(e) => setAdvanceAmountInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Remaining balance to collect at return: <strong className="text-amber-500 font-mono">{formatPrice(Math.max(0, activeBooking.total_amount - (Number(advanceAmountInput) || 0)))}</strong>
                </span>
              </div>
            )}

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Cash Receipt Notes / Handover Staff
              </label>
              <textarea
                rows="2"
                value={cashNotesInput}
                onChange={(e) => setCashNotesInput(e.target.value)}
                placeholder="e.g. Received Rs 20,000 in cash by Station Officer at pickup counter"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setActiveBooking(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                Save Cash Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
