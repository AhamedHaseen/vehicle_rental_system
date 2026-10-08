import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { saveVehicle } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { Car, Image as ImageIcon, Plus, X } from 'lucide-react';

const CATEGORIES = ['Car', 'Van', 'SUV', 'Motorbike', 'Three-Wheeler', 'Luxury Vehicle'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const STATUSES = ['available', 'rented', 'maintenance', 'deactivated'];

export const VehicleFormModal = ({ isOpen, onClose, vehicle, onSaveSuccess }) => {
  const { success, error } = useToast();
  const isEditing = Boolean(vehicle);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'Car',
    registration_no: '',
    fuel_type: 'Hybrid',
    transmission: 'Automatic',
    seats: 5,
    price_per_day: 8500,
    price_per_hour: 1100,
    security_deposit: 20000,
    status: 'available',
    image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    location: 'Colombo Flagship Hub',
    description: '',
    features: ['Apple CarPlay', 'Reverse Camera', 'Adaptive Cruise', 'Climate Control'],
    newFeature: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || 2024,
        category: vehicle.category || 'Car',
        registration_no: vehicle.registration_no || '',
        fuel_type: vehicle.fuel_type || 'Petrol',
        transmission: vehicle.transmission || 'Automatic',
        seats: vehicle.seats || 5,
        price_per_day: vehicle.price_per_day || 8000,
        price_per_hour: vehicle.price_per_hour || 1000,
        security_deposit: vehicle.security_deposit || 20000,
        status: vehicle.status || 'available',
        image_url: vehicle.image_url || '',
        location: vehicle.location || 'Colombo Flagship Hub',
        description: vehicle.description || '',
        features: vehicle.features || ['Bluetooth', 'A/C'],
        newFeature: ''
      });
    } else {
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        category: 'Car',
        registration_no: '',
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        seats: 5,
        price_per_day: 8500,
        price_per_hour: 1100,
        security_deposit: 20000,
        status: 'available',
        image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        location: 'Colombo Flagship Hub',
        description: '',
        features: ['Apple CarPlay', 'Cruise Control', 'Climate Control'],
        newFeature: ''
      });
    }
  }, [vehicle, isOpen]);

  const handleAddFeature = () => {
    if (!formData.newFeature.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, prev.newFeature.trim()],
      newFeature: ''
    }));
  };

  const handleRemoveFeature = (idx) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.registration_no) {
      error('Missing Information', 'Brand, model, and registration number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...(vehicle ? { id: vehicle.id, vehicle_code: vehicle.vehicle_code } : {}),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        category: formData.category,
        registration_no: formData.registration_no.trim().toUpperCase(),
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        seats: Number(formData.seats),
        price_per_day: Number(formData.price_per_day),
        price_per_hour: Number(formData.price_per_hour),
        security_deposit: Number(formData.security_deposit),
        status: formData.status,
        image_url: formData.image_url.trim(),
        location: formData.location,
        description: formData.description.trim(),
        features: formData.features
      };

      await saveVehicle(payload);
      success(isEditing ? 'Vehicle Updated' : 'Vehicle Added', `${payload.brand} ${payload.model} saved to fleet.`);
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      error('Save Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Vehicle: ${vehicle.brand} ${vehicle.model}` : "Add New Fleet Vehicle"}
      subtitle="Configure technical specifications, pricing schedule, and image media."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Row 1: Brand & Model & Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Brand *</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g. Toyota, Mercedes-Benz"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Model *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g. Prius, Land Cruiser"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Year</label>
            <input
              type="number"
              value={formData.year}
              min="2015"
              max="2027"
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Row 2: Category, Registration, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Registration No. *</label>
            <input
              type="text"
              value={formData.registration_no}
              onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
              placeholder="e.g. CAB-1234, WP-KS-4501"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 capitalize focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Fuel, Transmission, Seats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Fuel Type</label>
            <select
              value={formData.fuel_type}
              onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Transmission</label>
            <select
              value={formData.transmission}
              onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Seats Count</label>
            <input
              type="number"
              min="1"
              max="60"
              value={formData.seats}
              onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Row 4: Pricing Schedule (Per Day, Per Hour, Deposit) */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-amber-600 dark:text-amber-400 font-semibold mb-1">Daily Rental (LKR) *</label>
            <input
              type="number"
              min="100"
              value={formData.price_per_day}
              onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Hourly Rate (LKR)</label>
            <input
              type="number"
              min="0"
              value={formData.price_per_hour}
              onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Security Deposit (LKR)</label>
            <input
              type="number"
              min="0"
              value={formData.security_deposit}
              onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Media: Image URL */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            Vehicle Image URL (or Supabase Storage URL)
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Overview Description</label>
          <textarea
            rows="2"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Vehicle specifications, recommended usage and performance..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Features Tag Input */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Vehicle Features</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {formData.features.map((feat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md text-[11px] border border-slate-300 dark:border-slate-700"
              >
                {feat}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(i)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.newFeature}
              onChange={(e) => setFormData({ ...formData, newFeature: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
              placeholder="Type feature (e.g. Panoramic Sunroof) and press Enter"
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <Button variant="secondary" size="sm" type="button" onClick={handleAddFeature}>
              Add
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Vehicle to Fleet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
