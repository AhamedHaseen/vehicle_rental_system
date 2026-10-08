import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { createBooking } from '../../services/dataService';
import confetti from 'canvas-confetti';
import { 
  Calendar, MapPin, Shield, CreditCard, CheckCircle2, 
  Clock, DollarSign, Info, Car 
} from 'lucide-react';

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

  const basePrice = durationDays * Number(vehicle.price_per_day || 0);
  const insurancePerDay = 2000;
  const insuranceFee = includeInsurance ? durationDays * insurancePerDay : 0;
  const securityDeposit = Number(vehicle.security_deposit || 20000);
  const tax = Math.round(basePrice * 0.025);
  const totalAmount = basePrice + insuranceFee + tax; // Security deposit is held/refundable

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!user) {
      error('Sign In Required', 'Please sign in or select Demo Customer to confirm this booking.');
      return;
    }

    if (endObj <= startObj) {
      error('Invalid Dates', 'Return date must be after pickup date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newBooking = await createBooking({
        customer_id: user.id,
        customer_name: user.full_name || 'Valued Customer',
        customer_email: user.email,
        customer_phone: user.phone || '+94 77 123 4567',
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

      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

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
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleConfirm} className="space-y-6 text-sm">
        {/* Selected vehicle summary card */}
        <div className="flex items-center gap-4 p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
          <img
            src={vehicle.image_url}
            alt={vehicle.model}
            className="w-20 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700/60"
          />
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {vehicle.category}
            </span>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {vehicle.brand} {vehicle.model} ({vehicle.year})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{vehicle.registration_no}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Rate</span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">
              {formatPrice(vehicle.price_per_day)}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">/day</span>
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Pickup Schedule
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={startDate}
                  min={tomorrow}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Pickup Location</label>
              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {HUBS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Return Schedule
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Return Location</label>
              <select
                value={returnLocation}
                onChange={(e) => setReturnLocation(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {HUBS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Protection & Insurance Toggle */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-slate-900 dark:text-slate-200 text-xs">
                Comprehensive Damage Waiver (CDW Plus)
              </h5>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5 leading-relaxed">
                Protects against accidental scrapes, glass chips, and roadside breakdown. Zero deductible.
              </p>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                +{formatPrice(insurancePerDay)}/day
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={includeInsurance}
              onChange={(e) => setIncludeInsurance(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {['Online Portal', 'Credit Card', 'Cash at Pickup'].map((method) => (
              <button
                type="button"
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                  paymentMethod === method
                    ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Special requests / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Special Requests / Flight Number
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Flight UL-504 arriving 8am, child seat requested"
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Itemized Price Breakdown */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Base Rental ({durationDays} days × {formatPrice(vehicle.price_per_day)})</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(basePrice)}</span>
          </div>
          {includeInsurance && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>CDW Insurance Coverage ({durationDays} days)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(insuranceFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Fleet Levy & GST (2.5%)</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
            <span>Refundable Security Deposit (Held on card)</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{formatPrice(securityDeposit)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
            <span>Total Payable Amount</span>
            <span className="text-xl text-amber-600 dark:text-amber-400 font-extrabold">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="md" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSubmitting}
            className="w-full sm:w-auto"
          >
            Confirm & Reserve Vehicle
          </Button>
        </div>
      </form>
    </Modal>
  );
};
