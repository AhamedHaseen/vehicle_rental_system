import { useState, useEffect, useMemo } from 'react';
import { 
  getBookings, updateBookingStatus 
} from '../../services/dataService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PickupModal } from '../../components/admin/PickupModal';
import { ReturnModal } from '../../components/admin/ReturnModal';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { Search, Eye, RefreshCw } from 'lucide-react';

export const AdminBookings = () => {
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [activeInspectBooking, setActiveInspectBooking] = useState(null);
  const [pickupBooking, setPickupBooking] = useState(null);
  const [returnBooking, setReturnBooking] = useState(null);

  const loadData = async () => {
    const list = await getBookings();
    setBookings(list);
  };

  useEffect(() => {
    let isMounted = true;
    getBookings().then((list) => {
      if (isMounted) setBookings(list);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async (id) => {
    try {
      await updateBookingStatus(id, 'confirmed');
      success('Booking Approved', 'Customer reservation is now Confirmed.');
      loadData();
    } catch (err) {
      error('Approval failed', err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await updateBookingStatus(id, 'cancelled', { cancellation_reason: 'Rejected by administrator' });
      success('Booking Rejected', 'Reservation cancelled.');
      loadData();
    } catch (err) {
      error('Reject failed', err.message);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match = 
          b.booking_code.toLowerCase().includes(q) ||
          b.customer_name.toLowerCase().includes(q) ||
          b.customer_phone?.toLowerCase().includes(q) ||
          b.vehicle_name?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'all' && b.booking_status !== statusFilter) return false;
      return true;
    });
  }, [bookings, search, statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Booking & Rental Dispatch Operations
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Approve reservations, conduct vehicle handover inspections, and process return check-ins.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadData}>
          Refresh Pipeline
        </Button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
              }`}
            >
              {tab === 'all' ? `All (${bookings.length})` : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, customer name..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Booking Code</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Schedule & Hub</th>
                <th className="py-3 px-4">Financials</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  {/* Code */}
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                    {b.booking_code}
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 dark:text-slate-200 block">{b.customer_name}</span>
                    <span className="text-[11px] text-slate-500">{b.customer_phone}</span>
                  </td>

                  {/* Vehicle */}
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-300">
                    {b.vehicle_name}
                  </td>

                  {/* Schedule */}
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    <span className="block font-medium">
                      {new Date(b.start_date).toLocaleDateString()} &rarr; {new Date(b.end_date).toLocaleDateString()}
                    </span>
                    <span className="text-[11px] text-slate-500 block">{b.pickup_location}</span>
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">
                      {formatPrice(b.total_amount)}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase ${
                      b.payment_status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {b.payment_status}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <Badge status={b.booking_status} />
                  </td>

                  {/* Operations Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {b.booking_status === 'pending' && (
                        <>
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => handleApprove(b.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(b.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {b.booking_status === 'confirmed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setPickupBooking(b)}
                        >
                          Handover
                        </Button>
                      )}

                      {b.booking_status === 'active' && (
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => setReturnBooking(b)}
                        >
                          Return Check-in
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => setActiveInspectBooking(b)}
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {activeInspectBooking && (
        <Modal
          isOpen={Boolean(activeInspectBooking)}
          onClose={() => setActiveInspectBooking(null)}
          title={`Booking File: ${activeInspectBooking.booking_code}`}
          subtitle="Full reservation specifications, telemetry logs, and customer contacts."
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase font-bold">Renter Contact</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{activeInspectBooking.customer_name}</p>
                <p className="text-slate-600 dark:text-slate-400">{activeInspectBooking.customer_email}</p>
                <p className="text-slate-600 dark:text-slate-400 font-mono">{activeInspectBooking.customer_phone}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase font-bold">Assigned Vehicle</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{activeInspectBooking.vehicle_name}</p>
                <p className="text-slate-600 dark:text-slate-400">Duration: {activeInspectBooking.duration_days} Days</p>
                <Badge status={activeInspectBooking.booking_status} className="mt-1" />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase font-bold">Telemetry Handover Log</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block">Pickup Odometer:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {activeInspectBooking.odometer_pickup_km ? `${activeInspectBooking.odometer_pickup_km.toLocaleString()} KM` : 'Pending Handover'}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block">Pickup Fuel:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {activeInspectBooking.fuel_pickup_percent ? `${activeInspectBooking.fuel_pickup_percent}%` : 'Pending Handover'}
                  </span>
                </div>
              </div>

              {activeInspectBooking.odometer_return_km && (
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Return Odometer:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {activeInspectBooking.odometer_return_km.toLocaleString()} KM
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Return Fuel:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {activeInspectBooking.fuel_return_percent}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {activeInspectBooking.pickup_notes && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-bold block mb-0.5">Special Requests & Notes:</span>
                <p className="text-slate-700 dark:text-slate-300">{activeInspectBooking.pickup_notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-sm">
              <span className="text-slate-700 dark:text-slate-300">Total Billed Amount:</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono text-base">{formatPrice(activeInspectBooking.total_amount)}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Handover & Return Modals */}
      {pickupBooking && (
        <PickupModal
          isOpen={Boolean(pickupBooking)}
          onClose={() => setPickupBooking(null)}
          booking={pickupBooking}
          onSuccess={loadData}
        />
      )}

      {returnBooking && (
        <ReturnModal
          isOpen={Boolean(returnBooking)}
          onClose={() => setReturnBooking(null)}
          booking={returnBooking}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
