import { useState, useEffect, useMemo } from 'react';
import { getBookings } from '../../services/dataService';
import { useCurrency } from '../../context/CurrencyContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  History, Search, Calendar, FileText,
  CheckCircle2, Printer, MapPin, Gauge,
  RefreshCw, Car, User, ArrowRight
} from 'lucide-react';

export const AdminHistory = () => {
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

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

  // Filter completed or returned rentals
  const historyList = useMemo(() => {
    return bookings.filter(b => {
      // Completed, or active, or historical
      const isHistory = b.booking_status === 'completed' || b.booking_status === 'cancelled' || b.return_timestamp;
      if (!isHistory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          b.customer_name?.toLowerCase().includes(q) ||
          b.booking_code?.toLowerCase().includes(q) ||
          b.vehicle_name?.toLowerCase().includes(q) ||
          b.customer_phone?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bookings, search]);

  const totalCompletedEarnings = historyList
    .filter(b => b.booking_status === 'completed')
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-[#0373b9] dark:text-[#38bdf8]" />
            <span>Rental & Operations History Log</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Archived logs of completed vehicle returns, odometer readings, and settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
          >
            Refresh History
          </Button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Completed Returns</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{historyList.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">Total Realized Revenue</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatPrice(totalCompletedEarnings)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-sky-500 uppercase tracking-wider block">Average Trip Duration</span>
            <span className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400">

            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search completed logs by customer, booking code, vehicle..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Vehicle Rented</th>
                <th className="py-3.5 px-4">Rental Period</th>
                <th className="py-3.5 px-4">Total Settled</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {historyList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <History className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                    <span>No closed rental history records found.</span>
                  </td>
                </tr>
              ) : (
                historyList.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    {/* Booking ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#0373b9] dark:text-[#38bdf8] block">
                        {b.booking_code}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {b.customer_name}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block">{b.customer_phone}</span>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-xs">
                        {b.vehicle_name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {b.pickup_location} → {b.return_location}
                      </span>
                    </td>

                    {/* Rental Period */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-700 dark:text-slate-300 block">
                        {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {b.duration_days} Days ({b.driver_option === 'with_driver' ? 'Chauffeur' : 'Self-Drive'})
                      </span>
                    </td>

                    {/* Total Settled */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(b.total_amount)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${b.booking_status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        }`}>
                        {b.booking_status === 'completed' ? 'Returned & Closed' : 'Cancelled'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={FileText}
                        onClick={() => setSelectedBooking(b)}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice / Return Receipt Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Completed Rental Pass: ${selectedBooking.booking_code}`}
          subtitle={`Returned by ${selectedBooking.customer_name} | Closed settlement report`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            {/* Header details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedBooking.vehicle_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stations:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedBooking.pickup_location} → {selectedBooking.return_location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedBooking.duration_days} Days</span>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="p-4 bg-[#0373b9]/5 dark:bg-[#0373b9]/15 rounded-xl border border-[#0373b9]/30 dark:border-[#0373b9]/40 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Base Price:</span>
                <span className="font-mono">{formatPrice(selectedBooking.base_price)}</span>
              </div>
              {selectedBooking.insurance_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">CDW Insurance:</span>
                  <span className="font-mono">{formatPrice(selectedBooking.insurance_fee)}</span>
                </div>
              )}
              {selectedBooking.additional_charges > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Additional Charges / Taxes:</span>
                  <span className="font-mono">{formatPrice(selectedBooking.additional_charges)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#0373b9]/30 dark:border-[#0373b9]/50 font-bold text-sm">
                <span>Total Amount Settled:</span>
                <span className="text-[#0373b9] dark:text-[#38bdf8] font-mono text-base">{formatPrice(selectedBooking.total_amount)}</span>
              </div>
            </div>

            {selectedBooking.pickup_notes && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400">
                <strong className="block text-slate-700 dark:text-slate-300 mb-0.5">Pickup Inspection Notes:</strong>
                {selectedBooking.pickup_notes}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Verified & Deposit Released
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                  Close
                </Button>
                <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
                  Print Receipt
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
