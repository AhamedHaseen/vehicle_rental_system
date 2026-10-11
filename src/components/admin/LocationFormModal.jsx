import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { saveLocation } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';

export const LocationFormModal = ({ isOpen, onClose, location, onSaveSuccess }) => {
  const { success, error } = useToast();
  const isEditing = Boolean(location);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('both');
  const [contactNumber, setContactNumber] = useState('');
  const [operatingHours, setOperatingHours] = useState('24/7 Service');
  const [extraFee, setExtraFee] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (location) {
        setName(location.name || '');
        setCode(location.code || '');
        setCity(location.city || '');
        setAddress(location.address || '');
        setType(location.type || 'both');
        setContactNumber(location.contact_number || '');
        setOperatingHours(location.operating_hours || '24/7 Service');
        setExtraFee(location.extra_fee || 0);
        setIsActive(location.is_active !== undefined ? location.is_active : true);
      } else {
        setName('');
        setCode(`LOC-${Math.floor(10 + Math.random() * 90)}`);
        setCity('Colombo');
        setAddress('');
        setType('both');
        setContactNumber('+94 11 234 5678');
        setOperatingHours('24/7 Service');
        setExtraFee(0);
        setIsActive(true);
      }
    }
  }, [isOpen, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Name required', 'Please provide a location / hub name.');
      return;
    }
    if (!city.trim() || !address.trim()) {
      error('Address required', 'Please specify city and full physical address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveLocation({
        ...(location ? { id: location.id } : {}),
        name: name.trim(),
        code: code.trim().toUpperCase(),
        city: city.trim(),
        address: address.trim(),
        type,
        contact_number: contactNumber.trim(),
        operating_hours: operatingHours.trim(),
        extra_fee: Number(extraFee) || 0,
        is_active: isActive
      });

      success(
        isEditing ? 'Location Updated' : 'Location Added',
        `Hub "${name}" is now saved and active in the booking dispatch system.`
      );
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      error('Save failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Location: ${location.name}` : 'Include New Pickup & Drop Location'}
      subtitle="Configure physical address, operating schedule, service category, and transit surcharges."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Hub / Station Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Bandaranaike Int Airport (BIA)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0373b9]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Hub Code
            </label>
            <input
              type="text"
              placeholder="e.g., CMB-01"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 text-xs uppercase font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0373b9]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              City / Region *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Colombo, Katunayake, Kandy"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0373b9]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Hub Capability (Type)
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0373b9]"
            >
              <option value="both">Both Pickup & Drop</option>
              <option value="pickup">Pickup Only</option>
              <option value="drop">Drop / Return Only</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Physical Street Address *
          </label>
          <textarea
            required
            rows={2}
            placeholder="e.g., Arrivals Terminal Bay 4, Airport Road, Katunayake"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0373b9]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Operating Schedule
            </label>
            <input
              type="text"
              placeholder="e.g., 24/7 Service or 06:00 AM - 10:00 PM"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0373b9]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Station Contact Number
            </label>
            <input
              type="text"
              placeholder="e.g., +94 11 234 5678"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0373b9]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Delivery / Transfer Surcharge (LKR)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="0"
              value={extraFee}
              onChange={(e) => setExtraFee(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0373b9]"
            />
            <span className="text-[10px] text-slate-400">0 for standard free pickup</span>
          </div>

          <div className="pt-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#0373b9] focus:ring-[#0373b9] border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Active in Customer Booking Dropdown
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="bg-[#0373b9] hover:bg-[#025a92] text-white"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Location' : 'Save Location'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
