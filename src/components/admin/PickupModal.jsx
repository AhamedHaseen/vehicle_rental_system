import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Fuel, Gauge, FileText, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import { performPickupHandover } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';

export const PickupModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const { success, error } = useToast();
  const [fuelLevel, setFuelLevel] = useState(booking?.fuel_pickup_percent || 100);
  const [odometer, setOdometer] = useState(booking?.odometer_pickup_km || 15000);
  const [idVerified, setIdVerified] = useState(true);
  const [licenseVerified, setLicenseVerified] = useState(true);
  const [depositCollected, setDepositCollected] = useState(true);
  const [notes, setNotes] = useState(booking?.pickup_notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!idVerified || !licenseVerified) {
      error('Verification Required', 'Please verify customer identity and driver license before vehicle handover.');
      return;
    }

    setIsSubmitting(true);
    try {
      await performPickupHandover(booking.id, {
        fuelLevel: Number(fuelLevel),
        odometer: Number(odometer),
        notes: notes.trim()
      });

      success('Handover Confirmed', `Vehicle handed over. Booking ${booking.booking_code} is now ACTIVE.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      error('Pickup Handover Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vehicle Handover & Pickup Inspection"
      subtitle={`Verify documentation and record physical status for ${booking.booking_code}.`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleConfirm} className="space-y-5 text-sm">
        {/* Customer & Vehicle Header */}
        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Renter</span>
            <h4 className="font-bold text-slate-100">{booking.customer_name}</h4>
            <p className="text-xs text-slate-400">{booking.customer_phone} • {booking.customer_email}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Vehicle</span>
            <h5 className="font-semibold text-slate-200 text-xs">{booking.vehicle_name}</h5>
            <span className="text-[11px] text-amber-400 font-mono font-bold">{booking.pickup_location}</span>
          </div>
        </div>

        {/* Verification Checkboxes */}
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2.5">
          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-amber-400" /> Pre-Handover Checklist
          </h5>
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={idVerified}
              onChange={(e) => setIdVerified(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
            />
            <span>National Identity Card / Passport physical document verified</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={licenseVerified}
              onChange={(e) => setLicenseVerified(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
            />
            <span>Valid Driving License inspected and matches vehicle category</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={depositCollected}
              onChange={(e) => setDepositCollected(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
            />
            <span>Security deposit pre-authorization completed</span>
          </label>
        </div>

        {/* Physical Metrics: Odometer & Fuel Level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Odometer at Pickup (KM)
            </label>
            <input
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              Fuel Level ({fuelLevel}%)
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={fuelLevel}
                onChange={(e) => setFuelLevel(e.target.value)}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-amber-400 font-bold shrink-0 w-10 text-right">
                {fuelLevel}%
              </span>
            </div>
          </div>
        </div>

        {/* Handover Inspection Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Vehicle Condition & Inspection Notes
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Minor scratch on rear left bumper noted; spare tire and jack confirmed."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Submit Actions */}
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
            Confirm Vehicle Handover
          </Button>
        </div>
      </form>
    </Modal>
  );
};
