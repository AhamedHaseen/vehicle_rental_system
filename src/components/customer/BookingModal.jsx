import { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { createBooking } from '../../services/dataService';
import confetti from 'canvas-confetti';
import { Calendar, Shield, Clock, User, Phone, UserCheck, Car } from 'lucide-react';

const HUBS = [
  "Colombo Flagship Hub (45 Galle Face Terrace)",
  "Bandaranaike International Airport (CMB Terminal)",
  "Kandy Hill Station Hub",
  "Galle Coastal Express Hub"
];

export const BookingModal = ({ isOpen, onClose, vehicle, onBookingSuccess }) => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  // Set default dates (tomorrow to +3 days)
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const threeDaysLater = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  }, []);

  const [customerName, setCustomerName] = useState(user?.full_name || 'Kamal Perera');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+94 77 123 4567');
  const [driverOption, setDriverOption] = useState('without_driver'); // 'without_driver' | 'with_driver'
  const [startDate, setStartDate] = useState(tomorrow);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(threeDaysLater);
  const [endTime, setEndTime] = useState('18:00');
  const [pickupLocation, setPickupLocation] = useState(HUBS[0]);
  const [returnLocation, setReturnLocation] = useState(HUBS[0]);
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Online Portal');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!vehicle) return null;

  // Calculate duration in days
  const startObj = new Date(`${startDate}T${startTime}`);
  const endObj = new Date(`${endDate}T${endTime}`);
  const diffHours = Math.max(24, (endObj - startObj) / (1000 * 60 * 60));
  const durationDays = Math.max(1, Math.ceil(diffHours / 24));

  const driverDailyRate = 2500;
  const driverFee = driverOption === 'with_driver' ? durationDays * driverDailyRate : 0;
  const basePrice = durationDays * Number(vehicle.price_per_day || 0);
  const insurancePerDay = 2000;
  const insuranceFee = includeInsurance ? durationDays * insurancePerDay : 0;
  const securityDeposit = Number(vehicle.security_deposit || 20000);
  const tax = Math.round((basePrice + driverFee) * 0.025);
  const totalAmount = basePrice + driverFee + insuranceFee + tax; // Security deposit is held/refundable

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (endObj <= startObj) {
      error('Invalid Dates', 'Return date must be after pickup date.');
      return;
    }

    if (!customerName.trim()) {
      error('Contact Required', 'Please enter your full name for the booking.');
      return;
    }

    if (!customerPhone.trim()) {
      error('Contact Required', 'Please enter your contact phone number.');
      return;
    }

    // Fallback to active demo customer if user is browsing as guest
    const bookingUser = user || {
      id: 'user-cust-001',
      full_name: customerName.trim(),
      email: 'kamal@example.com',
      phone: customerPhone.trim(),
      role: 'customer'
    };

    setIsSubmitting(true);
    try {
      const newBooking = await createBooking({
        customer_id: bookingUser.id,
        customer_name: customerName.trim(),
        customer_email: user?.email || 'customer@rentflow.lk',
        customer_phone: customerPhone.trim(),
        driver_option: driverOption,
        driver_fee: driverFee,
        vehicle_id: vehicle.id,
        vehicle_name: `${vehicle.brand} ${vehicle.model} (${vehicle.registration_no})`,
        start_date: startObj.toISOString(),
        end_date: endObj.toISOString(),
        duration_days: durationDays,
        base_price: basePrice,
        insurance_fee: insuranceFee,
        security_deposit: securityDeposit,
        additional_charges: tax,
        total_amount: totalAmount,
        pickup_location: pickupLocation,
        return_location: returnLocation,
        pickup_notes: notes,
        payment_status: paymentMethod === 'Cash at Pickup' ? 'pending' : 'paid',
        payment_method: paymentMethod
      });

      // Confetti celebration (safely wrapped)
      try {
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch {
        // safe fallback if canvas is unavailable
      }

      success('Reservation Confirmed!', `Booking ${newBooking.booking_code} created successfully.`);
      if (onBookingSuccess) onBookingSuccess(newBooking);
      onClose();
    } catch (err) {
      error('Booking Failed', err.message || 'Could not complete reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reserve Vehicle"
      subtitle={`Configure dates, insurance and pickup point for ${vehicle.brand} ${vehicle.model}.`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleConfirm} className="space-y-4 text-sm">
        {/* Selected vehicle summary card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={vehicle.image_url}
              alt={vehicle.model}
              className="w-20 sm:w-24 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700/60 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8]">
                {vehicle.brand}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">
                {vehicle.model} ({vehicle.year})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{vehicle.registration_no}</p>
            </div>
          </div>
          <div className="sm:text-right shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Daily Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#0077b6] dark:text-[#38bdf8]">
                {formatPrice(vehicle.price_per_day)}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">/day</span>
            </div>
          </div>
        </div>

        {/* Rental Duration Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#0077b6]/10 dark:bg-[#023e8a]/20 border border-[#0077b6]/25 text-xs text-[#0077b6] dark:text-[#38bdf8] font-semibold">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
            <span>Rental Duration: <strong className="font-bold text-slate-900 dark:text-white ml-1">{durationDays} {durationDays === 1 ? 'Day' : 'Days'}</strong></span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {startDate} ({startTime}) &rarr; {endDate} ({endTime})
          </span>
        </div>

        {/* Primary Contact Details */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-200/60 dark:border-slate-800">
            <User className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
            <span>Primary Contact Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Kamal Perera"
                  required
                  className="w-full h-11 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0077b6]/40 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +94 77 123 4567"
                  required
                  className="w-full h-11 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0077b6]/40 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Driver Preference (With Driver vs Without Driver) */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
              <span>Chauffeur & Driver Service</span>
            </div>
            {driverOption === 'with_driver' && (
              <span className="text-xs font-bold text-[#0077b6] dark:text-[#38bdf8] bg-[#0077b6]/10 dark:bg-[#023e8a]/20 px-2.5 py-1 rounded-full">
                +{formatPrice(driverDailyRate)}/day
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDriverOption('without_driver')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                driverOption === 'without_driver'
                  ? 'border-[#0077b6] bg-[#0077b6]/10 dark:bg-[#023e8a]/25 text-[#0077b6] dark:text-[#38bdf8] ring-1 ring-[#0077b6]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 font-bold text-xs text-slate-900 dark:text-white">
                <Car className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
                <span>Without Driver (Self-Drive)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Enjoy full autonomy. Valid driver's license required at key handover.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDriverOption('with_driver')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                driverOption === 'with_driver'
                  ? 'border-[#0077b6] bg-[#0077b6]/10 dark:bg-[#023e8a]/25 text-[#0077b6] dark:text-[#38bdf8] ring-1 ring-[#0077b6]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 font-bold text-xs text-slate-900 dark:text-white">
                <UserCheck className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
                <span>With Professional Driver</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Experienced, certified chauffeur provided. Sit back and enjoy the ride.
              </p>
            </button>
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pickup Card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
              <span>Pickup Schedule</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Pickup Date</label>
                <input
                  type="date"
                  value={startDate}
                  min={tomorrow}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-11 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0077b6]/40 cursor-pointer font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Pickup Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-11 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0077b6]/40 cursor-pointer font-medium"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Pickup Location Hub</label>
              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full h-11 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0077b6]/40 cursor-pointer font-medium"
              >
                {HUBS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Return Card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <Clock className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
              <span>Return Schedule</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Return Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-11 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0077b6]/40 cursor-pointer font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Return Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-11 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0077b6]/40 cursor-pointer font-medium"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Return Location Hub</label>
              <select
                value={returnLocation}
                onChange={(e) => setReturnLocation(e.target.value)}
                className="w-full h-11 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0077b6]/40 cursor-pointer font-medium"
              >
                {HUBS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Protection & Insurance Toggle */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#0077b6] dark:text-[#38bdf8] shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                Comprehensive Damage Waiver (CDW Plus)
              </h5>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 leading-relaxed">
                Protects against accidental scrapes, glass chips, and roadside breakdown with zero deductible.
              </p>
              <span className="text-[11px] text-[#0077b6] dark:text-[#38bdf8] font-bold block mt-1">
                +{formatPrice(insurancePerDay)} / day
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={includeInsurance}
              onChange={(e) => setIncludeInsurance(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0077b6] dark:peer-checked:bg-[#023e8a]"></div>
          </label>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Online Portal', 'Credit Card', 'Cash at Pickup'].map((method) => (
              <button
                type="button"
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center cursor-pointer ${
                  paymentMethod === method
                    ? 'bg-[#0077b6]/15 border-[#0077b6] text-[#0077b6] dark:bg-[#023e8a]/30 dark:border-[#38bdf8] dark:text-[#38bdf8] shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#0077b6]/50'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Special requests / Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Special Requests / Flight Number (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Flight UL-504 arriving 8am, child safety seat requested"
            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0077b6]/40 font-medium"
          />
        </div>

        {/* Itemized Price Breakdown */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Base Rental ({durationDays} days × {formatPrice(vehicle.price_per_day)})</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(basePrice)}</span>
          </div>
          {driverOption === 'with_driver' && (
            <div className="flex justify-between items-center text-[#0077b6] dark:text-[#38bdf8] font-medium">
              <span>Chauffeur Service ({durationDays} days × {formatPrice(driverDailyRate)})</span>
              <span className="font-bold">{formatPrice(driverFee)}</span>
            </div>
          )}
          {includeInsurance && (
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>CDW Insurance Coverage ({durationDays} days)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(insuranceFee)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Fleet Levy & GST (2.5%)</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <span>Refundable Security Deposit (Held on card)</span>
            <span className="font-bold text-[#0077b6] dark:text-[#38bdf8]">{formatPrice(securityDeposit)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
            <span>Total Payable Amount</span>
            <span className="text-xl sm:text-2xl text-[#0077b6] dark:text-[#38bdf8] font-black">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose} type="button" className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSubmitting}
            className="w-full sm:w-auto px-8 h-12 text-sm font-bold shadow-lg shadow-[#0077b6]/25"
          >
            Confirm & Reserve Vehicle
          </Button>
        </div>
      </form>
    </Modal>
  );
};
