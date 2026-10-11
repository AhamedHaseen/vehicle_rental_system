import { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { saveVehicle, getCategories, getLocations } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { 
  X, UploadCloud, Camera, Trash2, Link2, 
  CheckCircle2, Car, Wrench, Sparkles, ChevronRight,
  Gauge, Zap, Check, ArrowRight, ArrowLeft
} from 'lucide-react';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
const STATUSES = ['available', 'rented', 'maintenance', 'deactivated'];

const SUGGESTED_FEATURES = [
  'Apple CarPlay', 'Android Auto', 'Reverse Camera', 'Dual-Zone A/C',
  'Cruise Control', 'Bluetooth Audio', 'GPS Navigation', 'Leather Seats',
  'Keyless Push Start', '360° Camera System', 'Sunroof', 'Parking Sensors'
];

/**
 * Standard Sri Lankan & Fleet rental calculation:
 * Standard 8-hour daily operational divisor, rounded to nearest 50.
 */
const calculateHourlyRate = (daily) => {
  const d = parseFloat(daily);
  if (!d || isNaN(d) || d <= 0) return 0;
  return Math.round((d / 8) / 50) * 50 || Math.round(d / 8);
};

/**
 * Client-side high-fidelity image compression:
 * Reads user's selected file from computer/device, resizes to max 1200px width/height,
 * and encodes to lightweight JPEG (~60-120KB) base64 data URL.
 */
const compressAndConvertImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file must be an image'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

const getInitialFormData = (vehicle) => {
  if (vehicle) {
    const gallery = Array.isArray(vehicle.gallery_urls) ? vehicle.gallery_urls : [];
    const daily = vehicle.price_per_day || 8500;
    const specs = vehicle.specs || {};
    return {
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      category: vehicle.category || 'Car',
      registration_no: vehicle.registration_no || '',
      fuel_type: vehicle.fuel_type || 'Petrol',
      transmission: vehicle.transmission || 'Automatic',
      seats: vehicle.seats || 5,
      price_per_day: daily,
      price_per_hour: vehicle.price_per_hour || calculateHourlyRate(daily),
      security_deposit: vehicle.security_deposit || 20000,
      status: vehicle.status || 'available',
      image_url_1: vehicle.image_url || gallery[0] || '',
      image_url_2: gallery[1] || '',
      image_url_3: gallery[2] || '',
      location: vehicle.location || 'Colombo Flagship Hub (Galle Face)',
      description: vehicle.description || '',
      features: Array.isArray(vehicle.features) ? vehicle.features : ['Apple CarPlay', 'Dual-Zone A/C', 'Reverse Camera'],
      newFeature: '',
      // Technical Specifications
      engine: specs.engine || `${vehicle.fuel_type || 'Petrol'} Engine`,
      power: specs.power || 'Factory Calibrated',
      consumption: specs.consumption || specs.mileage || 'Economical',
      odometer_km: vehicle.odometer_km || 15000
    };
  }
  const defaultDaily = 8500;
  return {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'Car',
    registration_no: '',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    price_per_day: defaultDaily,
    price_per_hour: calculateHourlyRate(defaultDaily),
    security_deposit: 20000,
    status: 'available',
    image_url_1: '',
    image_url_2: '',
    image_url_3: '',
    location: 'Colombo Flagship Hub (Galle Face)',
    description: '',
    features: ['Apple CarPlay', 'Cruise Control', 'Climate Control'],
    newFeature: '',
    // Technical Specifications
    engine: 'Petrol Engine',
    power: 'Factory Calibrated',
    consumption: 'Economical',
    odometer_km: 15000
  };
};

export const VehicleFormModal = ({ isOpen, onClose, vehicle, onSaveSuccess }) => {
  const { success, error } = useToast();
  const isEditing = Boolean(vehicle);

  // Active form section tab: 'details' | 'features' | 'specs'
  const [activeTab, setActiveTab] = useState('details');

  const [categoriesList, setCategoriesList] = useState(['Car', 'Bus', 'SUV', 'Van', 'Luxury Vehicle', 'Motorbike', 'Three-Wheeler']);
  const [locationsList, setLocationsList] = useState([]);
  const [formData, setFormData] = useState(() => getInitialFormData(vehicle));
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image mode: 'upload' (local file selector) or 'url' (direct web address)
  const [imageInputMode, setImageInputMode] = useState('upload');

  // Hidden file input refs
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);
  const fileInputRef3 = useRef(null);
  const batchFileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
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

  // Automatically calculate hourly rate when daily rate changes
  const handleDailyPriceChange = (e) => {
    const newDaily = e.target.value;
    const computedHourly = calculateHourlyRate(newDaily);
    setFormData(prev => ({
      ...prev,
      price_per_day: newDaily,
      price_per_hour: computedHourly > 0 ? computedHourly : ''
    }));
  };

  // Handle single image file selection
  const handleFileChange = async (file, slotKey) => {
    if (!file) return;
    try {
      const dataUrl = await compressAndConvertImage(file);
      setFormData(prev => ({
        ...prev,
        [slotKey]: dataUrl
      }));
      success('Image Loaded', 'Photo loaded successfully');
    } catch (err) {
      error('Image Error', err.message);
    }
  };

  // Handle multi/batch selection (pick up to 3 files at once)
  const handleBatchFileChange = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    if (files.length === 0) return;

    try {
      const promises = files.map(f => compressAndConvertImage(f));
      const results = await Promise.all(promises);

      setFormData(prev => ({
        ...prev,
        image_url_1: results[0] || prev.image_url_1,
        image_url_2: results[1] || prev.image_url_2,
        image_url_3: results[2] || prev.image_url_3
      }));
      success('Images Loaded', `Loaded ${results.length} photo(s).`);
    } catch (err) {
      error('Batch Upload Error', err.message);
    }
  };

  const handleAddFeature = (featureName) => {
    const feat = (featureName || formData.newFeature).trim();
    if (!feat) return;
    if (formData.features.includes(feat)) {
      setFormData(prev => ({ ...prev, newFeature: '' }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, feat],
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
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.brand || !formData.model || !formData.registration_no) {
      error('Missing Information', 'Brand, model, and registration number are required.');
      setActiveTab('details');
      return;
    }

    if (!formData.image_url_1) {
      error('Photo Required', 'Please select or upload at least the primary exterior photo.');
      setActiveTab('details');
      return;
    }

    setIsSubmitting(true);
    try {
      const img1 = (formData.image_url_1 || '').trim ? formData.image_url_1.trim() : formData.image_url_1;
      const img2 = formData.image_url_2 ? ((formData.image_url_2.trim ? formData.image_url_2.trim() : formData.image_url_2)) : img1;
      const img3 = formData.image_url_3 ? ((formData.image_url_3.trim ? formData.image_url_3.trim() : formData.image_url_3)) : img1;

      const dailyRate = Number(formData.price_per_day);
      const computedHourly = Number(formData.price_per_hour) || calculateHourlyRate(dailyRate);

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
        price_per_day: dailyRate,
        price_per_hour: computedHourly,
        security_deposit: Number(formData.security_deposit),
        status: formData.status,
        image_url: img1,
        gallery_urls: [img1, img2, img3],
        location: formData.location,
        description: (formData.description || '').trim(),
        features: formData.features,
        odometer_km: Number(formData.odometer_km || 15000),
        specs: {
          engine: (formData.engine || `${formData.fuel_type} Engine`).trim(),
          power: (formData.power || 'Factory Calibrated').trim(),
          consumption: (formData.consumption || 'Economical').trim()
        }
      };

      await saveVehicle(payload);
      success(isEditing ? 'Vehicle Updated' : 'Vehicle Added', `${payload.brand} ${payload.model} saved to database with full specs.`);
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
      subtitle="Complete vehicle details, features, and technical specifications."
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* 3-PART SECTION TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'details'
                ? 'bg-white dark:bg-slate-800 text-[#0373b9] dark:text-[#38bdf8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>1. Car Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'features'
                ? 'bg-white dark:bg-slate-800 text-[#0373b9] dark:text-[#38bdf8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Features of Car</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8]">
              {formData.features.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'specs'
                ? 'bg-white dark:bg-slate-800 text-[#0373b9] dark:text-[#38bdf8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>3. Technical Specifications</span>
          </button>
        </div>

        {/* ---------------- SECTION 1: CAR DETAILS ---------------- */}
        {activeTab === 'details' && (
          <div className="space-y-4 animate-in fade-in duration-150">
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
                  min="2000"
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

            {/* Row 3: Pricing Schedule */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#0373b9] dark:text-[#38bdf8] font-bold mb-1">
                  Daily Rate (LKR) *
                </label>
                <input
                  type="number"
                  min="100"
                  value={formData.price_per_day}
                  onChange={handleDailyPriceChange}
                  placeholder="e.g. 8500"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Hourly Rate (LKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                  placeholder="e.g. 1100"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Security Deposit (LKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.security_deposit}
                  onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                />
              </div>
            </div>

            {/* Row 4: Hub Location & Description */}
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

            {/* Row 5: 3 Vehicle Images (Select from Device) */}
            <div className="p-4 bg-[#0373b9]/5 dark:bg-[#0373b9]/15 rounded-2xl border border-[#0373b9]/25 dark:border-[#0373b9]/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#0373b9]/20 dark:border-[#0373b9]/30">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#0373b9] dark:text-[#38bdf8]" />
                    <span>Vehicle Images (Select from Device)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Click any slot below to select photos from your device (PNG, JPG, WEBP).
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={batchFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleBatchFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => batchFileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-[#0373b9] hover:bg-[#025a92] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Select 3 Images at Once</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageInputMode(imageInputMode === 'upload' ? 'url' : 'upload')}
                    className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium flex items-center gap-1 transition-colors"
                  >
                    {imageInputMode === 'upload' ? <Link2 className="w-3 h-3" /> : <UploadCloud className="w-3 h-3" />}
                    <span>{imageInputMode === 'upload' ? 'Or paste URL' : 'File Upload'}</span>
                  </button>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input ref={fileInputRef1} type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0], 'image_url_1')} className="hidden" />
              <input ref={fileInputRef2} type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0], 'image_url_2')} className="hidden" />
              <input ref={fileInputRef3} type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0], 'image_url_3')} className="hidden" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Slot 1: Exterior / Front */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      1. Front Exterior (Main) *
                    </label>
                    {formData.image_url_1 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                  {imageInputMode === 'url' && (
                    <input
                      type="url"
                      value={formData.image_url_1}
                      onChange={(e) => setFormData({ ...formData, image_url_1: e.target.value })}
                      placeholder="https://... (Front view URL)"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-[11px] text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                    />
                  )}
                  <div
                    onClick={() => fileInputRef1.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0], 'image_url_1');
                    }}
                    className={`aspect-[16/10] w-full rounded-xl overflow-hidden border-2 cursor-pointer transition-all relative group flex flex-col items-center justify-center ${
                      formData.image_url_1 ? 'border-[#0373b9]/40 bg-slate-900' : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0373b9] bg-white/70 dark:bg-slate-900/70'
                    }`}
                  >
                    {formData.image_url_1 ? (
                      <>
                        <img src={formData.image_url_1} alt="Front exterior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display = 'none'; }} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                          <span className="text-white text-[11px] font-bold flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                            <Camera className="w-3.5 h-3.5" /> Change Photo
                          </span>
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); setFormData({ ...formData, image_url_1: '' }); }} className="text-rose-300 hover:text-rose-100 text-[10px] font-semibold flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 text-center">
                        <div className="w-8 h-8 rounded-full bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] flex items-center justify-center mx-auto mb-1">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Click to Select Photo</span>
                      </div>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">Exterior (Main)</span>
                  </div>
                </div>

                {/* Slot 2: Interior / Cabin */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      2. Interior / Cabin
                    </label>
                    {formData.image_url_2 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                  {imageInputMode === 'url' && (
                    <input
                      type="url"
                      value={formData.image_url_2}
                      onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                      placeholder="https://... (Interior cabin URL)"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-[11px] text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                    />
                  )}
                  <div
                    onClick={() => fileInputRef2.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0], 'image_url_2');
                    }}
                    className={`aspect-[16/10] w-full rounded-xl overflow-hidden border-2 cursor-pointer transition-all relative group flex flex-col items-center justify-center ${
                      formData.image_url_2 ? 'border-[#0373b9]/40 bg-slate-900' : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0373b9] bg-white/70 dark:bg-slate-900/70'
                    }`}
                  >
                    {formData.image_url_2 ? (
                      <>
                        <img src={formData.image_url_2} alt="Interior cabin" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display = 'none'; }} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                          <span className="text-white text-[11px] font-bold flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                            <Camera className="w-3.5 h-3.5" /> Change Photo
                          </span>
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); setFormData({ ...formData, image_url_2: '' }); }} className="text-rose-300 hover:text-rose-100 text-[10px] font-semibold flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 text-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto mb-1">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Select Interior Photo</span>
                      </div>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">Interior Cabin</span>
                  </div>
                </div>

                {/* Slot 3: Angle / Side Profile */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      3. Side / Rear Angle
                    </label>
                    {formData.image_url_3 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                  {imageInputMode === 'url' && (
                    <input
                      type="url"
                      value={formData.image_url_3}
                      onChange={(e) => setFormData({ ...formData, image_url_3: e.target.value })}
                      placeholder="https://... (Side profile URL)"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-[11px] text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                    />
                  )}
                  <div
                    onClick={() => fileInputRef3.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0], 'image_url_3');
                    }}
                    className={`aspect-[16/10] w-full rounded-xl overflow-hidden border-2 cursor-pointer transition-all relative group flex flex-col items-center justify-center ${
                      formData.image_url_3 ? 'border-[#0373b9]/40 bg-slate-900' : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0373b9] bg-white/70 dark:bg-slate-900/70'
                    }`}
                  >
                    {formData.image_url_3 ? (
                      <>
                        <img src={formData.image_url_3} alt="Side profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display = 'none'; }} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                          <span className="text-white text-[11px] font-bold flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                            <Camera className="w-3.5 h-3.5" /> Change Photo
                          </span>
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); setFormData({ ...formData, image_url_3: '' }); }} className="text-rose-300 hover:text-rose-100 text-[10px] font-semibold flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 text-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto mb-1">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Select Angle Photo</span>
                      </div>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">Side Angle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SECTION 2: FEATURES OF CAR ---------------- */}
        {activeTab === 'features' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0373b9] dark:text-[#38bdf8]" />
                    <span>Selected Vehicle Features ({formData.features.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    These equipment highlights will show under "Key Equipment & Features" on the customer booking page.
                  </p>
                </div>
              </div>

              {/* Active features tags */}
              <div className="flex flex-wrap gap-2 min-h-[48px] p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {formData.features.length === 0 ? (
                  <span className="text-slate-400 text-xs italic self-center">
                    No features added yet. Click suggested items below or type a custom feature.
                  </span>
                ) : (
                  formData.features.map((feat, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] border border-[#0373b9]/25 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-slate-400 hover:text-rose-500 ml-0.5"
                        title="Remove feature"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add custom feature input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={formData.newFeature}
                  onChange={(e) => setFormData({ ...formData, newFeature: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                  placeholder="Type custom feature (e.g. WiFi Dongle, Child Safety Lock, Panoramic Roof) & press Enter"
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                />
                <Button variant="secondary" size="md" type="button" onClick={() => handleAddFeature()}>
                  Add Feature
                </Button>
              </div>
            </div>

            {/* Quick add popular suggested features */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                Click to Quick-Add Suggested Features:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_FEATURES.map((item) => {
                  const isAdded = formData.features.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        if (isAdded) {
                          const idx = formData.features.indexOf(item);
                          handleRemoveFeature(idx);
                        } else {
                          handleAddFeature(item);
                        }
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        isAdded
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#0373b9] hover:text-[#0373b9]'
                      }`}
                    >
                      {isAdded ? <Check className="w-3 h-3 text-emerald-500" /> : <span>+</span>}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SECTION 3: TECHNICAL SPECIFICATIONS ---------------- */}
        {activeTab === 'specs' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#0373b9] dark:text-[#38bdf8]" />
                  <span>Technical Specifications (Database Persisted)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  These 6 powertrain and mechanical specifications display directly in the customer vehicle specifications grid.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Engine / Powertrain */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    1. Engine / Powertrain
                  </label>
                  <input
                    type="text"
                    value={formData.engine}
                    onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                    placeholder="e.g. 1.8L VVT-i Hybrid Engine, 2.8L Turbo Diesel"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. Petrol Engine, Hybrid e:HEV, Turbo Diesel</span>
                </div>

                {/* 2. Max Power Output */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    2. Max Power Output
                  </label>
                  <input
                    type="text"
                    value={formData.power}
                    onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                    placeholder="e.g. 121 HP @ 5200 RPM, Factory Calibrated"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. Factory Calibrated, 204 BHP, 136 kW</span>
                </div>

                {/* 3. Transmission */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    3. Transmission
                  </label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                  >
                    {TRANSMISSIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. Automatic, Manual, e-CVT</span>
                </div>

                {/* 4. Fuel Efficiency */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    4. Fuel Efficiency
                  </label>
                  <input
                    type="text"
                    value={formData.consumption}
                    onChange={(e) => setFormData({ ...formData, consumption: e.target.value })}
                    placeholder="e.g. Economical, 22 km/L (Combined), 14 km/L"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. Economical, 24 km/L, 12 km/L</span>
                </div>

                {/* 5. Seating Capacity */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    5. Seating Capacity (Passengers)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="65"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Displays as "{formData.seats} Passengers"</span>
                </div>

                {/* 6. Odometer Reading */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    6. Odometer Reading (KM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.odometer_km}
                    onChange={(e) => setFormData({ ...formData, odometer_km: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Displays as "{Number(formData.odometer_km || 0).toLocaleString()} KM"
                  </span>
                </div>

                {/* Fuel Type */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Powertrain Fuel Source
                  </label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
                  >
                    {FUEL_TYPES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Live Specifications Preview Bento Box */}
            <div className="p-3.5 bg-[#0373b9]/5 dark:bg-[#0373b9]/15 rounded-xl border border-[#0373b9]/25 space-y-2">
              <span className="text-[10px] font-bold text-[#0373b9] dark:text-[#38bdf8] uppercase tracking-wider block">
                Live Customer Page Preview:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px]">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">Engine</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block mt-0.5">{formData.engine || `${formData.fuel_type} Engine`}</strong>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">Power</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block mt-0.5">{formData.power || 'Factory Calibrated'}</strong>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">Gearbox</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block mt-0.5">{formData.transmission}</strong>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">Economy</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block mt-0.5">{formData.consumption || 'Economical'}</strong>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">Seats</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block mt-0.5">{formData.seats} Pass.</strong>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">Odometer</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block mt-0.5">{Number(formData.odometer_km || 0).toLocaleString()} KM</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Navigation and Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            {activeTab === 'features' && (
              <Button variant="secondary" size="sm" type="button" onClick={() => setActiveTab('details')}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back: Car Details
              </Button>
            )}
            {activeTab === 'specs' && (
              <Button variant="secondary" size="sm" type="button" onClick={() => setActiveTab('features')}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back: Features
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'details' && (
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => {
                  if (!formData.brand || !formData.model || !formData.registration_no) {
                    error('Required Details', 'Please fill brand, model and registration plate first.');
                    return;
                  }
                  setActiveTab('features');
                }}
              >
                Next: Features <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}

            {activeTab === 'features' && (
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setActiveTab('specs')}
              >
                Next: Technical Specs <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}

            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Save Vehicle to Fleet'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
