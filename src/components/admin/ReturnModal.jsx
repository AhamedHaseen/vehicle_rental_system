import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Fuel, Gauge, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';
import { performReturnCheckin } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';

export const ReturnModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const { success, error } = useToast();
  const { formatPrice } = useCurrency();

  const pickupKm = booking?.odometer_pickup_km || 15000;
  const [returnKm, setReturnKm] = useState(pickupKm + 250);
  const [returnFuel, setReturnFuel] = useState(100);
  const [lateFee, setLateFee] = useState(0);
  const [damageFee, setDamageFee] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  const drivenKm = Math.max(0, Number(returnKm) - pickupKm);
  const totalAdjustments = Number(lateFee || 0) + Number(damageFee || 0);

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (Number(returnKm) < pickupKm) {
      error('Invalid Odometer', 'Return odometer cannot be less than the pickup odometer reading.');
      return;
    }

    setIsSubmitting(true);
    try {
      await performReturnCheckin(booking.id, {
        fuelLevel: Number(returnFuel),
        odometer: Number(returnKm),
        notes: notes.trim(),
        lateFee: Number(lateFee || 0),
        damageFee: Number(damageFee || 0)
      });

      success('Check-in Completed', `Vehicle returned and set to AVAILABLE. Booking ${booking.booking_code} COMPLETED.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      error('Return check-in failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vehicle Return & Final Inspection"
      subtitle={`Process return check-in, odometer reading and security deposit settlement for ${booking.booking_code}.`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleConfirm} className="space-y-5 text-sm">
        {/* Booking summary header */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">{booking.vehicle_name}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Renter: {booking.customer_name} ({booking.customer_phone})</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Pickup Odometer</span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{pickupKm.toLocaleString()} KM</span>
          </div>
        </div>

        {/* Odometer and Mileage calculation */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Return Odometer (KM)
            </label>
            <input
              type="number"
              value={returnKm}
              min={pickupKm}
              onChange={(e) => setReturnKm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
              Trip Distance: +{drivenKm.toLocaleString()} KM
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Return Fuel ({returnFuel}%)
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={returnFuel}
                onChange={(e) => setReturnFuel(e.target.value)}
                className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold shrink-0 w-10 text-right">
                {returnFuel}%
              </span>
            </div>
            {returnFuel < (booking?.fuel_pickup_percent || 100) && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block">
                Deficit vs Pickup: {(booking?.fuel_pickup_percent || 100) - returnFuel}%
              </span>
            )}
          </div>
        </div>

        {/* Additional Charges / Adjustments */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Fee Adjustments & Damages
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Late Return Fee (LKR)</label>
              <input
                type="number"
                min="0"
                value={lateFee}
                onChange={(e) => setLateFee(e.target.value)}
                placeholder="0"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Damage Assessment (LKR)</label>
              <input
                type="number"
                min="0"
                value={damageFee}
                onChange={(e) => setDamageFee(e.target.value)}
                placeholder="0"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Return Condition notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Return Inspection Remarks
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Vehicle returned clean, interior spotless, tires in good shape, keys handed over."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Adjustment Summary */}
        <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-600 dark:text-slate-400">Extra Surcharges to Deduct from Deposit:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
            {formatPrice(totalAdjustments)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="emerald"
            size="md"
            type="submit"
            isLoading={isSubmitting}
            icon={CheckCircle2}
          >
            Complete Return & Release Fleet
          </Button>
        </div>
      </form>
    </Modal>
  );
};
