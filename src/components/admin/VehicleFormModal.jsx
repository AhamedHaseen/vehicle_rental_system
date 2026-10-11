import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { saveVehicle, getCategories, getLocations } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { Image as ImageIcon, X, Sparkles, Check } from 'lucide-react';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const STATUSES = ['available', 'rented', 'maintenance', 'deactivated'];

// Preset sample photos for fast filling
const PHOTO_PRESETS = {
  Car: {
    img1: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    img2: 'https://images.unsplash.com/photo-1590362891988-f77804703130?auto=format&fit=crop&w=1200&q=80',
    img3: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
  },
  SUV: {
    img1: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
    img2: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    img3: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'
  },
  Bus: {
    img1: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    img2: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    img3: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=1200&q=80'
  },
  Van: {
    img1: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=1200&q=80',
    img2: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=1200&q=80',
    img3: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=80'
  },
  'Luxury Vehicle': {
    img1: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    img2: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    img3: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80'
  }
};

const getInitialFormData = (vehicle) => {
  if (vehicle) {
    const gallery = Array.isArray(vehicle.gallery_urls) ? vehicle.gallery_urls : [];
    return {
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || 2024,
      category: vehicle.category || 'Car',
      registration_no: vehicle.registration_no || '',
      fuel_type: vehicle.fuel_type || 'Petrol',
      transmission: vehicle.transmission || 'Automatic',
      seats: vehicle.seats || 5,
      price_per_day: vehicle.price_per_day || 8500,
      price_per_hour: vehicle.price_per_hour || 1100,
      security_deposit: vehicle.security_deposit || 20000,
      status: vehicle.status || 'available',
      // Three Images for each vehicle
      image_url_1: vehicle.image_url || gallery[0] || '',
      image_url_2: gallery[1] || 'https://images.unsplash.com/photo-1590362891988-f77804703130?auto=format&fit=crop&w=1200&q=80',
      image_url_3: gallery[2] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      location: vehicle.location || 'Colombo Flagship Hub (Galle Face)',
      description: vehicle.description || '',
      features: vehicle.features || ['Apple CarPlay', 'Dual-Zone A/C', 'Reverse Camera'],
      newFeature: ''
    };
  }
  return {
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
    image_url_1: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1590362891988-f77804703130?auto=format&fit=crop&w=1200&q=80',
    image_url_3: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    location: 'Colombo Flagship Hub (Galle Face)',
    description: '',
    features: ['Apple CarPlay', 'Cruise Control', 'Climate Control'],
    newFeature: ''
  };
};

export const VehicleFormModal = ({ isOpen, onClose, vehicle, onSaveSuccess }) => {
  const { success, error } = useToast();
  const isEditing = Boolean(vehicle);

  const [categoriesList, setCategoriesList] = useState(['Car', 'Bus', 'SUV', 'Van', 'Luxury Vehicle', 'Motorbike', 'Three-Wheeler']);
  const [locationsList, setLocationsList] = useState([]);
  const [formData, setFormData] = useState(() => getInitialFormData(vehicle));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(vehicle));
      getCategories().then((cats) => {
        if (cats && cats.length > 0) {
          setCategoriesList(cats.map(c => c.name));
        }
      });
      getLocations().then((locs) => {
        if (locs && locs.length > 0) {
          setLocationsList(locs.map(l => l.name));
        }
      });
    }
  }, [isOpen, vehicle]);

  const applyPresetPhotos = (categoryKey) => {
    const preset = PHOTO_PRESETS[categoryKey] || PHOTO_PRESETS.Car;
    setFormData(prev => ({
      ...prev,
      image_url_1: preset.img1,
      image_url_2: preset.img2,
      image_url_3: preset.img3
    }));
    success('Photos Pre-filled', `Applied 3 HD images for ${categoryKey}`);
  };

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

    if (!formData.image_url_1) {
      error('Image Required', 'Please provide at least the primary vehicle exterior image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const img1 = formData.image_url_1.trim();
      const img2 = formData.image_url_2 ? formData.image_url_2.trim() : img1;
      const img3 = formData.image_url_3 ? formData.image_url_3.trim() : img1;

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
        price_per_hour: Number(formData.price_per_hour || Math.round(formData.price_per_day / 8)),
        security_deposit: Number(formData.security_deposit),
        status: formData.status,
        image_url: img1,
        gallery_urls: [img1, img2, img3],
        location: formData.location,
        description: formData.description.trim(),
        features: formData.features
      };

      await saveVehicle(payload);
      success(isEditing ? 'Vehicle Updated' : 'Vehicle Added', `${payload.brand} ${payload.model} saved with 3 images.`);
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
      subtitle="Configure specs, pricing, category, and 3 gallery photos for this vehicle."
      maxWidth="max-w-3xl"
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
              placeholder="e.g. Toyota, Mercedes-Benz, Leyland"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Model *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g. Prius, Coaster Bus, Land Cruiser"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Manufacturing Year</label>
            <input
              type="number"
              value={formData.year}
              min="2010"
              max="2027"
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
            />
          </div>
        </div>

        {/* Row 2: Category, Registration, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Vehicle Category</label>
            <select
              value={formData.category}
              onChange={(e) => {
                const newCat = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  category: newCat,
                  seats: newCat === 'Bus' ? 32 : newCat === 'Van' ? 12 : prev.seats
                }));
              }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0373b9] font-medium"
            >
              {categoriesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Registration Plate *</label>
            <input
              type="text"
              value={formData.registration_no}
              onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
              placeholder="e.g. CAB-1234, WP-NA-8899"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 capitalize focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
            >
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Passenger Seats</label>
            <input
              type="number"
              min="1"
              max="65"
              value={formData.seats}
              onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
            />
          </div>
        </div>

        {/* Row 4: Pricing Schedule */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[#0373b9] dark:text-[#38bdf8] font-bold mb-1">Daily Rate (LKR) *</label>
            <input
              type="number"
              min="500"
              value={formData.price_per_day}
              onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
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
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Security Deposit (LKR)</label>
            <input
              type="number"
              min="0"
              value={formData.security_deposit}
              onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
            />
          </div>
        </div>

        {/* 3 IMAGES SECTION (Requirement 2) */}
        <div className="p-4 bg-[#0373b9]/5 dark:bg-[#0373b9]/15 rounded-2xl border border-[#0373b9]/25 dark:border-[#0373b9]/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#0373b9]/20 dark:border-[#0373b9]/30">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#0373b9] dark:text-[#38bdf8]" />
                <span>Three Vehicle Images (Primary, Interior & Angle Profile)</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                All 3 photos will display on the vehicle details page and customer booking pass.
              </p>
            </div>
            
            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
              {['Car', 'SUV', 'Bus', 'Van', 'Luxury Vehicle'].map((catKey) => (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => applyPresetPhotos(catKey)}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 hover:bg-[#0373b9]/15 dark:hover:bg-[#0373b9]/25 text-[10px] font-semibold border border-[#0373b9]/30 text-[#0373b9] dark:text-[#38bdf8] transition-colors"
                >
                  {catKey}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Image 1: Exterior / Hero */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                1. Exterior / Front (Main) *
              </label>
              <input
                type="url"
                value={formData.image_url_1}
                onChange={(e) => setFormData({ ...formData, image_url_1: e.target.value })}
                placeholder="https://... (Front view)"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-[11px] text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                required
              />
              <div className="aspect-[16/10] w-full rounded-lg bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                {formData.image_url_1 ? (
                  <img
                    src={formData.image_url_1}
                    alt="Exterior preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">No Image</div>
                )}
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">Exterior</span>
              </div>
            </div>

            {/* Image 2: Interior / Cockpit */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                2. Interior / Cockpit
              </label>
              <input
                type="url"
                value={formData.image_url_2}
                onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                placeholder="https://... (Cabin view)"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-[11px] text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
              />
              <div className="aspect-[16/10] w-full rounded-lg bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                {formData.image_url_2 ? (
                  <img
                    src={formData.image_url_2}
                    alt="Interior preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">No Image</div>
                )}
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">Interior</span>
              </div>
            </div>

            {/* Image 3: Angle / Side Profile */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                3. Angle / Rear / Side
              </label>
              <input
                type="url"
                value={formData.image_url_3}
                onChange={(e) => setFormData({ ...formData, image_url_3: e.target.value })}
                placeholder="https://... (Side profile)"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-[11px] text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
              />
              <div className="aspect-[16/10] w-full rounded-lg bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                {formData.image_url_3 ? (
                  <img
                    src={formData.image_url_3}
                    alt="Angle preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">No Image</div>
                )}
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">Side Angle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Station Hub Location</label>
            {locationsList.length > 0 ? (
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
              >
                {locationsList.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
              />
            )}
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Overview Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Executive luxury transport with spacious luggage boot"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
            />
          </div>
        </div>

        {/* Features Tags */}
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
              placeholder="Type feature (e.g. WiFi Router, Reclining Seats) & press Enter"
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
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
