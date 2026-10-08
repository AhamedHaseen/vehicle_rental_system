import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, MapPin, DollarSign, Clock, Shield, 
  FileText, Star, XCircle, CheckCircle2, QrCode, ArrowRight, Car
} from 'lucide-react';
import { getBookings, updateBookingStatus } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ReviewModal } from '../../components/customer/ReviewModal';

export const MyBookings = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activePassBooking, setActivePassBooking] = useState(null);
  const [activeReceiptBooking, setActiveReceiptBooking] = useState(null);
  const [activeReviewBooking, setActiveReviewBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const list = await getBookings(user?.id);
    setBookings(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      await updateBookingStatus(cancelModalBooking.id, 'cancelled', {
        cancellation_reason: 'Cancelled by customer online portal'
      });
      success('Booking Cancelled', `Reservation ${cancelModalBooking.booking_code} has been cancelled.`);
      setCancelModalBooking(null);
      loadData();
    } catch (err) {
      error('Failed to cancel booking', err.message);
    }
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.booking_status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            My Bookings & Reservations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track active rentals, access digital handover passes, and review past journeys.
          </p>
        </div>

        <Link to="/catalog">
          <Button variant="primary" size="sm" icon={Car}>
            Browse More Vehicles
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
        {['all', 'confirmed', 'active', 'pending', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-colors ${
              filter === tab
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            {tab === 'all' ? `All (${bookings.length})` : tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-4">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No reservations found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any {filter !== 'all' ? filter : ''} bookings at the moment.
          </p>
          <Link to="/catalog">
            <Button variant="primary" size="sm">Explore Available Fleet</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const isPending = b.booking_status === 'pending';
            const isConfirmed = b.booking_status === 'confirmed';
            const isActive = b.booking_status === 'active';
            const isCompleted = b.booking_status === 'completed';
            const isCancelled = b.booking_status === 'cancelled';
            const canCancel = isPending || isConfirmed;

            const startDateFormatted = new Date(b.start_date).toLocaleDateString('en-LK', {
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const endDateFormatted = new Date(b.end_date).toLocaleDateString('en-LK', {
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div
                key={b.id}
                className="glass-card rounded-2xl border border-slate-800/80 p-5 sm:p-6 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Vehicle & Code Header */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-900 text-amber-400 rounded-md border border-amber-500/20">
                        {b.booking_code}
                      </span>
                      <Badge status={b.booking_status} />
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        b.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        Payment: {b.payment_status?.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      {b.vehicle_name}
                    </h3>

                    {/* Timeline Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-2">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[11px] block">Pickup Schedule</span>
                          <span>{startDateFormatted}</span>
                          <span className="text-[11px] text-slate-500 block">Hub: {b.pickup_location}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[11px] block">Return Schedule</span>
                          <span>{endDateFormatted}</span>
                          <span className="text-[11px] text-slate-500 block">Hub: {b.return_location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Total Amount */}
                  <div className="lg:text-right border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800 shrink-0">
                    <span className="text-xs text-slate-400 block font-medium">Total Amount</span>
                    <span className="text-2xl font-extrabold text-amber-400 block">
                      {formatPrice(b.total_amount)}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Duration: {b.duration_days} Days
                    </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                    {/* Digital Pass Button */}
                    <Button
                      variant="dark"
                      size="sm"
                      icon={QrCode}
                      onClick={() => setActivePassBooking(b)}
                    >
                      Digital Pass
                    </Button>

                    {/* Receipt Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FileText}
                      onClick={() => setActiveReceiptBooking(b)}
                    >
                      Invoice
                    </Button>

                    {/* Review Button for completed bookings */}
                    {isCompleted && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Star}
                        onClick={() => setActiveReviewBooking(b)}
                      >
                        Rate Trip
                      </Button>
                    )}

                    {/* Cancel Button */}
                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        onClick={() => setCancelModalBooking(b)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Pass Modal */}
      {activePassBooking && (
        <Modal
          isOpen={Boolean(activePassBooking)}
          onClose={() => setActivePassBooking(null)}
          title="Digital Reservation Pass"
          subtitle="Present this QR code and booking reference to the station agent at handover."
          maxWidth="max-w-md"
        >
          <div className="space-y-5 text-center text-xs">
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `RENTFLOW-PASS-${activePassBooking.booking_code}`
                  )}`}
                  alt="Reservation QR"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pass Code</span>
                <p className="font-mono text-xl font-extrabold text-amber-400">{activePassBooking.booking_code}</p>
              </div>

              <div className="text-left bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <p className="text-slate-300 font-semibold">{activePassBooking.vehicle_name}</p>
                <p className="text-slate-400 text-[11px]">Renter: {activePassBooking.customer_name}</p>
                <p className="text-slate-400 text-[11px]">Station: {activePassBooking.pickup_location}</p>
              </div>
            </div>

            <Button variant="primary" size="sm" onClick={() => setActivePassBooking(null)} className="w-full">
              Done
            </Button>
          </div>
        </Modal>
      )}

      {/* Invoice Receipt Modal */}
      {activeReceiptBooking && (
        <Modal
          isOpen={Boolean(activeReceiptBooking)}
          onClose={() => setActiveReceiptBooking(null)}
          title="Rental Payment Receipt"
          subtitle={`Receipt for transaction reference ${activeReceiptBooking.booking_code}`}
          maxWidth="max-w-lg"
        >
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-slate-100 text-sm">RentFlow Ltd.</h4>
                <p className="text-slate-400">45 Galle Face Terrace, Colombo 03</p>
                <p className="text-slate-400 font-mono">GST / VAT: LK-990124-V</p>
              </div>
              <div className="text-right">
                <span className="text-amber-400 font-bold font-mono text-sm">{activeReceiptBooking.booking_code}</span>
                <p className="text-slate-400">{new Date(activeReceiptBooking.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex justify-between text-slate-400">
                <span>Vehicle:</span>
                <span className="font-semibold text-slate-200">{activeReceiptBooking.vehicle_name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Duration:</span>
                <span className="font-semibold text-slate-200">{activeReceiptBooking.duration_days} Days</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Base Rental:</span>
                <span className="font-semibold text-slate-200">{formatPrice(activeReceiptBooking.base_price)}</span>
              </div>
              {activeReceiptBooking.insurance_fee > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>CDW Insurance Waiver:</span>
                  <span className="font-semibold text-slate-200">{formatPrice(activeReceiptBooking.insurance_fee)}</span>
                </div>
              )}
              {activeReceiptBooking.additional_charges > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Taxes & Surcharges:</span>
                  <span className="font-semibold text-slate-200">{formatPrice(activeReceiptBooking.additional_charges)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-100 font-bold text-sm pt-2 border-t border-slate-800">
                <span>Grand Total Paid:</span>
                <span className="text-amber-400 font-mono text-base">{formatPrice(activeReceiptBooking.total_amount)}</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Button variant="secondary" size="sm" onClick={() => window.print()} className="w-full">
                Print Official Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Modal */}
      {activeReviewBooking && (
        <ReviewModal
          isOpen={Boolean(activeReviewBooking)}
          onClose={() => setActiveReviewBooking(null)}
          booking={activeReviewBooking}
          onSuccess={loadData}
        />
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <Modal
          isOpen={Boolean(cancelModalBooking)}
          onClose={() => setCancelModalBooking(null)}
          title="Confirm Booking Cancellation"
          subtitle="Are you sure you want to cancel this vehicle reservation?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              In accordance with our 24-hour cancellation policy, your full payment and pre-authorized security deposit of{' '}
              <strong className="text-amber-400">{formatPrice(cancelModalBooking.total_amount)}</strong> will be released back to your original payment method.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setCancelModalBooking(null)}>
                Keep Reservation
              </Button>
              <Button variant="danger" size="sm" onClick={handleCancelBooking}>
                Yes, Cancel Reservation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
