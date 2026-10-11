import { supabase, isSupabaseConfigured } from './supabase';
import { defaultSettings } from './mockData';

// Local storage keys
const STORAGE_KEYS = {
  VEHICLES: 'rentflow_vehicles',
  BOOKINGS: 'rentflow_bookings',
  CUSTOMERS: 'rentflow_customers',
  REVIEWS: 'rentflow_reviews',
  NOTIFICATIONS: 'rentflow_notifications',
  SETTINGS: 'rentflow_settings',
  CONTACTS: 'rentflow_contacts',
  CATEGORIES: 'rentflow_categories',
  LOCATIONS: 'rentflow_locations'
};

export const defaultCategories = [
  { id: 'cat-1', name: 'Car', description: 'Sedans, compacts, and eco-hybrids', icon: 'Car', seats_default: 5 },
  { id: 'cat-2', name: 'SUV', description: '4x4 cross-country commanding SUVs', icon: 'Shield', seats_default: 5 },
  { id: 'cat-3', name: 'Luxury Vehicle', description: 'VIP Flagship sedans & limousines', icon: 'Sparkles', seats_default: 5 },
  { id: 'cat-4', name: 'Van', description: 'Group passenger touring vans', icon: 'Clock', seats_default: 12 },
  { id: 'cat-5', name: 'Bus', description: 'Mini & luxury highway tourist coaches', icon: 'Car', seats_default: 32 },
  { id: 'cat-6', name: 'Motorbike', description: 'Hyper naked bikes & daily cruisers', icon: 'Gauge', seats_default: 2 },
  { id: 'cat-7', name: 'Three-Wheeler', description: 'Classic Sri Lankan tuk-tuk adventure vehicles', icon: 'MapPin', seats_default: 3 }
];

export const defaultLocations = [
  {
    id: 'aabd7f11-b665-4dd7-a965-8eca7af24a4d',
    name: 'Colombo Flagship Hub (Galle Face)',
    code: 'CMB-01',
    address: '45 Galle Face Terrace, Colombo 03',
    city: 'Colombo',
    type: 'both',
    contact_number: '+94 11 234 5678',
    operating_hours: '24/7 Service',
    is_active: true,
    extra_fee: 0
  },
  {
    id: 'fddc4c65-cfe6-4c19-a29e-36790f58c1f1',
    name: 'Bandaranaike Int Airport (BIA / CMB)',
    code: 'BIA-02',
    address: 'Arrivals Terminal Bay 4, Katunayake',
    city: 'Katunayake',
    type: 'both',
    contact_number: '+94 11 987 6543',
    operating_hours: '24/7 Flight Sync',
    is_active: true,
    extra_fee: 0
  },
  {
    id: '2590540a-eff0-4903-a6f1-70d7b7b6b28f',
    name: 'Kandy Hill Station Terminal',
    code: 'KDY-03',
    address: '12 William Gopallawa Mawatha, Kandy',
    city: 'Kandy',
    type: 'both',
    contact_number: '+94 81 222 3344',
    operating_hours: '06:00 AM - 10:00 PM',
    is_active: true,
    extra_fee: 0
  },
  {
    id: 'd2719273-288c-47ef-b5d6-33bfe1023186',
    name: 'Galle Coastal Hub (Fort)',
    code: 'GAL-04',
    address: '88 Rampart Street, Galle Fort',
    city: 'Galle',
    type: 'both',
    contact_number: '+94 91 333 4455',
    operating_hours: '07:00 AM - 09:00 PM',
    is_active: true,
    extra_fee: 0
  }
];

// Initialize localStorage and clear dummy data when Supabase is active
const initStorage = () => {
  if (isSupabaseConfigured()) {
    // Clean out old dummy data from localStorage so real DB data takes precedence
    try {
      const storedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (storedVehicles && storedVehicles.includes('vh-1')) {
        localStorage.removeItem(STORAGE_KEYS.VEHICLES);
      }
      const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (storedBookings && storedBookings.includes('bk-101')) {
        localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
      }
      const storedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (storedContacts && storedContacts.includes('ct-101')) {
        localStorage.removeItem(STORAGE_KEYS.CONTACTS);
      }
    } catch (e) {
      console.warn('Storage purge error:', e);
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(defaultLocations));
  }
};

initStorage();

const getLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to local storage [${key}]:`, err);
  }
};

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const isValidUUID = (str) => {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// ==================== PICKUP & DROP LOCATIONS ====================
export const getLocations = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        setLocal(STORAGE_KEYS.LOCATIONS, data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase getLocations error:', e);
    }
  }
  return getLocal(STORAGE_KEYS.LOCATIONS, defaultLocations);
};

export const saveLocation = async (locationData) => {
  const isUpdate = Boolean(locationData.id);
  const id = locationData.id || generateUUID();
  const payload = {
    id,
    name: (locationData.name || '').trim(),
    code: locationData.code ? locationData.code.trim().toUpperCase() : `LOC-${Math.floor(10 + Math.random() * 90)}`,
    address: (locationData.address || '').trim(),
    city: (locationData.city || '').trim(),
    type: locationData.type || 'both', // 'pickup', 'drop', 'both'
    contact_number: locationData.contact_number || '',
    operating_hours: locationData.operating_hours || '24/7 Service',
    is_active: locationData.is_active !== undefined ? Boolean(locationData.is_active) : true,
    extra_fee: Number(locationData.extra_fee || 0),
    updated_at: new Date().toISOString()
  };

  const current = getLocal(STORAGE_KEYS.LOCATIONS, defaultLocations);
  let updated;
  if (isUpdate) {
    updated = current.map(l => l.id === id ? { ...l, ...payload } : l);
  } else {
    payload.created_at = new Date().toISOString();
    updated = [payload, ...current];
  }
  setLocal(STORAGE_KEYS.LOCATIONS, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('locations').upsert(payload).select().single();
      if (!error && data) return data;
      if (error) console.error('Supabase saveLocation error:', error);
    } catch (e) {
      console.warn('Supabase saveLocation exception:', e);
    }
  }
  return payload;
};

export const deleteLocation = async (locationId) => {
  const current = getLocal(STORAGE_KEYS.LOCATIONS, defaultLocations);
  const updated = current.filter(l => l.id !== locationId);
  setLocal(STORAGE_KEYS.LOCATIONS, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('locations').delete().eq('id', locationId);
      if (error) console.error('Supabase deleteLocation error:', error);
    } catch (e) {
      console.warn('Supabase deleteLocation exception:', e);
    }
  }
  return updated;
};

// ==================== VEHICLES (FLEET) ====================
export const getVehicles = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        setLocal(STORAGE_KEYS.VEHICLES, data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch vehicles failed:', e);
    }
  }
  return getLocal(STORAGE_KEYS.VEHICLES, []);
};

export const getVehicleById = async (id) => {
  const vehicles = await getVehicles();
  return vehicles.find(v => v.id === id || v.vehicle_code === id);
};

export const saveVehicle = async (vehicleData) => {
  const isUpdate = Boolean(vehicleData.id);
  const id = vehicleData.id || generateUUID();

  const cleanVehicle = {
    id,
    vehicle_code: vehicleData.vehicle_code || `VH${Math.floor(100 + Math.random() * 900)}`,
    registration_no: (vehicleData.registration_no || '').toUpperCase().trim(),
    brand: (vehicleData.brand || '').trim(),
    model: (vehicleData.model || '').trim(),
    year: Number(vehicleData.year) || new Date().getFullYear(),
    category: vehicleData.category || 'Car',
    fuel_type: vehicleData.fuel_type || 'Petrol',
    transmission: vehicleData.transmission || 'Automatic',
    seats: Number(vehicleData.seats) || 5,
    price_per_day: Number(vehicleData.price_per_day) || 8500,
    price_per_hour: Number(vehicleData.price_per_hour || 0),
    security_deposit: Number(vehicleData.security_deposit || 20000),
    status: vehicleData.status || 'available',
    image_url: vehicleData.image_url || '',
    gallery_urls: vehicleData.gallery_urls || [vehicleData.image_url],
    features: vehicleData.features || [],
    specs: vehicleData.specs || {},
    odometer_km: Number(vehicleData.odometer_km || 15000),
    fuel_level_percent: Number(vehicleData.fuel_level_percent || 100),
    location: vehicleData.location || 'Colombo Flagship Hub (Galle Face)',
    description: (vehicleData.description || '').trim(),
    updated_at: new Date().toISOString()
  };

  const vehicles = getLocal(STORAGE_KEYS.VEHICLES, []);
  let updated;
  if (isUpdate) {
    updated = vehicles.map(v => v.id === id ? { ...v, ...cleanVehicle } : v);
  } else {
    cleanVehicle.created_at = new Date().toISOString();
    updated = [cleanVehicle, ...vehicles];
  }
  setLocal(STORAGE_KEYS.VEHICLES, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('vehicles').upsert(cleanVehicle).select().single();
      if (!error && data) return data;
      if (error) console.error('Supabase saveVehicle error:', error);
    } catch (e) {
      console.warn('Supabase save error:', e);
    }
  }
  return cleanVehicle;
};

export const deleteVehicle = async (vehicleId) => {
  const vehicles = getLocal(STORAGE_KEYS.VEHICLES, []);
  const updated = vehicles.filter(v => v.id !== vehicleId);
  setLocal(STORAGE_KEYS.VEHICLES, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);
      if (error) console.error('Supabase delete error:', error);
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }
  return updated;
};

export const updateVehicleStatus = async (vehicleId, status) => {
  const vehicles = getLocal(STORAGE_KEYS.VEHICLES, []);
  const updated = vehicles.map(v => v.id === vehicleId ? { ...v, status } : v);
  setLocal(STORAGE_KEYS.VEHICLES, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('vehicles').update({ status, updated_at: new Date().toISOString() }).eq('id', vehicleId);
    } catch (e) {
      console.warn('Supabase updateVehicleStatus error:', e);
    }
  }
  return updated;
};

// ==================== BOOKINGS ====================
export const getBookings = async (customerId = null) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (customerId && isValidUUID(customerId)) query = query.eq('customer_id', customerId);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        // Merge Supabase bookings with local bookings so newly created bookings are NEVER overwritten/lost
        const local = getLocal(STORAGE_KEYS.BOOKINGS, []);
        const map = new Map();
        data.forEach(b => map.set(b.id, b));
        local.forEach(b => {
          if (!map.has(b.id)) {
            map.set(b.id, b);
          }
        });
        const merged = Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setLocal(STORAGE_KEYS.BOOKINGS, merged);
        if (customerId) {
          return merged.filter(b => b.customer_id === customerId);
        }
        return merged;
      }
      if (error) {
        console.warn('Supabase bookings query error:', error);
      }
    } catch (e) {
      console.warn('Supabase bookings fetch failed:', e);
    }
  }
  const all = getLocal(STORAGE_KEYS.BOOKINGS, []);
  if (customerId) {
    return all.filter(b => b.customer_id === customerId);
  }
  return all;
};

export const createBooking = async (bookingData) => {
  const id = bookingData.id || generateUUID();
  const bookingCode = bookingData.booking_code || `RF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const cleanBooking = {
    id,
    booking_code: bookingCode,
    customer_id: isValidUUID(bookingData.customer_id) ? bookingData.customer_id : null,
    customer_name: (bookingData.customer_name || 'Customer').trim(),
    customer_email: (bookingData.customer_email || '').trim(),
    customer_phone: (bookingData.customer_phone || '').trim(),
    vehicle_id: isValidUUID(bookingData.vehicle_id) ? bookingData.vehicle_id : null,
    vehicle_name: (bookingData.vehicle_name || '').trim(),
    vehicle_registration: (bookingData.vehicle_registration || (bookingData.vehicle_name && bookingData.vehicle_name.includes('(') ? bookingData.vehicle_name.split('(')[1]?.replace(')', '').trim() : '')).trim(),
    start_date: new Date(bookingData.start_date || Date.now()).toISOString(),
    end_date: new Date(bookingData.end_date || Date.now() + 86400000).toISOString(),
    duration_days: Number(bookingData.duration_days) || 1,
    base_price: Number(bookingData.base_price) || 0,
    insurance_fee: Number(bookingData.insurance_fee || 0),
    security_deposit: Number(bookingData.security_deposit || 0),
    advance_amount: Number(bookingData.advance_amount || 0),
    total_amount: Number(bookingData.total_amount) || 0,
    booking_status: ['pending', 'confirmed', 'active', 'completed', 'cancelled'].includes(bookingData.booking_status) ? bookingData.booking_status : 'pending',
    payment_status: ['pending', 'paid', 'refunded', 'partially_paid'].includes(bookingData.payment_status) ? bookingData.payment_status : 'pending',
    pickup_location: bookingData.pickup_location || 'Colombo Flagship Hub (Galle Face)',
    return_location: bookingData.return_location || 'Colombo Flagship Hub (Galle Face)',
    with_driver: Boolean(bookingData.with_driver || bookingData.driver_option === 'with_driver'),
    pickup_notes: bookingData.pickup_notes || '',
    return_notes: bookingData.return_notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const bookings = getLocal(STORAGE_KEYS.BOOKINGS, []);
  const updated = [cleanBooking, ...bookings.filter(b => b.id !== id && b.booking_code !== bookingCode)];
  setLocal(STORAGE_KEYS.BOOKINGS, updated);

  addNotification({
    user_id: 'admin',
    title: 'New Booking Request',
    message: `${cleanBooking.customer_name} reserved ${cleanBooking.vehicle_name} (${cleanBooking.booking_code})`,
    type: 'booking'
  });

  if (isSupabaseConfigured() && supabase) {
    try {
      let { data, error } = await supabase.from('bookings').insert(cleanBooking).select().single();
      // If foreign key constraint on customer_id or vehicle_id failed, retry gracefully
      if (error && error.code === '23503') {
        console.warn('Foreign key reference rejected by Supabase, retrying with nullable FKs:', error);
        const retryBooking = { ...cleanBooking, customer_id: null };
        const retry = await supabase.from('bookings').insert(retryBooking).select().single();
        if (!retry.error && retry.data) data = retry.data;
      }
      if (data) {
        // sync back to local storage
        const currentLocal = getLocal(STORAGE_KEYS.BOOKINGS, []);
        const merged = [data, ...currentLocal.filter(b => b.id !== data.id && b.booking_code !== data.booking_code)];
        setLocal(STORAGE_KEYS.BOOKINGS, merged);
        return data;
      }
      if (error) console.error('Supabase createBooking error:', error);
    } catch (e) {
      console.warn('Supabase create booking error:', e);
    }
  }
  return cleanBooking;
};

export const updateBookingStatus = async (bookingId, status, extraFields = {}) => {
  const bookings = getLocal(STORAGE_KEYS.BOOKINGS, []);
  const updated = bookings.map(b => {
    if (b.id === bookingId) {
      return { ...b, booking_status: status, ...extraFields, updated_at: new Date().toISOString() };
    }
    return b;
  });
  setLocal(STORAGE_KEYS.BOOKINGS, updated);

  const targetBooking = bookings.find(b => b.id === bookingId);
  if (targetBooking) {
    if (status === 'active' && targetBooking.vehicle_id) {
      updateVehicleStatus(targetBooking.vehicle_id, 'rented');
    } else if ((status === 'completed' || status === 'cancelled') && targetBooking.vehicle_id) {
      updateVehicleStatus(targetBooking.vehicle_id, 'available');
    }

    addNotification({
      user_id: targetBooking.customer_id || 'customer',
      title: `Booking ${status.toUpperCase()}`,
      message: `Your booking for ${targetBooking.vehicle_name} is now marked as ${status}.`,
      type: 'booking'
    });
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('bookings').update({ booking_status: status, ...extraFields, updated_at: new Date().toISOString() }).eq('id', bookingId);
    } catch (e) {
      console.warn('Supabase update status error:', e);
    }
  }
  return updated;
};

export const performPickupHandover = async (bookingId, { fuelLevel, odometer, notes }) => {
  return updateBookingStatus(bookingId, 'active', {
    fuel_pickup_percent: fuelLevel,
    odometer_pickup_km: odometer,
    pickup_notes: notes,
    pickup_timestamp: new Date().toISOString()
  });
};

export const performReturnCheckin = async (bookingId, { fuelLevel, odometer, notes, lateFee = 0, damageFee = 0 }) => {
  const bookings = getLocal(STORAGE_KEYS.BOOKINGS, []);
  const target = bookings.find(b => b.id === bookingId);
  const totalExtra = (Number(lateFee) || 0) + (Number(damageFee) || 0);

  return updateBookingStatus(bookingId, 'completed', {
    fuel_return_percent: fuelLevel,
    odometer_return_km: odometer,
    return_notes: notes,
    late_fee: lateFee,
    damage_fee: damageFee,
    additional_charges: (target?.additional_charges || 0) + totalExtra,
    total_amount: (target?.total_amount || 0) + totalExtra,
    return_timestamp: new Date().toISOString()
  });
};

// ==================== CUSTOMERS (PROFILES) ====================
export const getCustomers = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) return data;
    } catch (e) {
      console.warn('Supabase getCustomers error:', e);
    }
  }
  return getLocal(STORAGE_KEYS.CUSTOMERS, []);
};

export const updateCustomerStatus = async (customerId, status) => {
  const customers = getLocal(STORAGE_KEYS.CUSTOMERS, []);
  const updated = customers.map(c => c.id === customerId ? { ...c, status } : c);
  setLocal(STORAGE_KEYS.CUSTOMERS, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('profiles').update({ status, updated_at: new Date().toISOString() }).eq('id', customerId);
    } catch (e) {
      console.warn('Supabase updateCustomerStatus error:', e);
    }
  }
  return updated;
};

// ==================== REVIEWS ====================
export const getReviews = async (vehicleId = null) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let q = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (vehicleId) q = q.eq('vehicle_id', vehicleId);
      const { data, error } = await q;
      if (!error && Array.isArray(data)) return data;
    } catch (e) {
      console.warn('Supabase reviews error:', e);
    }
  }
  const all = getLocal(STORAGE_KEYS.REVIEWS, []);
  if (vehicleId) return all.filter(r => r.vehicle_id === vehicleId);
  return all;
};

export const addReview = async (review) => {
  const id = generateUUID();
  const cleanReview = {
    id,
    ...review,
    created_at: new Date().toISOString()
  };
  const reviews = getLocal(STORAGE_KEYS.REVIEWS, []);
  const updated = [cleanReview, ...reviews];
  setLocal(STORAGE_KEYS.REVIEWS, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('reviews').insert(cleanReview);
    } catch (e) {
      console.warn('Supabase addReview error:', e);
    }
  }
  return updated;
};

// ==================== NOTIFICATIONS ====================
export const getNotifications = async (userId) => {
  const all = getLocal(STORAGE_KEYS.NOTIFICATIONS, []);
  if (!userId) return all;
  return all.filter(n => n.user_id === userId || n.user_id === 'all');
};

export const addNotification = (notif) => {
  const notifs = getLocal(STORAGE_KEYS.NOTIFICATIONS, []);
  const newNotif = {
    ...notif,
    id: `notif-${Date.now()}`,
    is_read: false,
    created_at: new Date().toISOString()
  };
  const updated = [newNotif, ...notifs];
  setLocal(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
};

export const markNotificationRead = (notifId) => {
  const notifs = getLocal(STORAGE_KEYS.NOTIFICATIONS, []);
  const updated = notifs.map(n => n.id === notifId ? { ...n, is_read: true } : n);
  setLocal(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
};

// ==================== SETTINGS ====================
export const getSystemSettings = () => {
  return getLocal(STORAGE_KEYS.SETTINGS, defaultSettings);
};

export const updateSystemSettings = async (newSettings) => {
  setLocal(STORAGE_KEYS.SETTINGS, newSettings);
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('system_settings').upsert({
        key: 'general_config',
        value: newSettings,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase updateSystemSettings error:', e);
    }
  }
  return newSettings;
};

// ==================== CATEGORIES ====================
export const getCategories = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        setLocal(STORAGE_KEYS.CATEGORIES, data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase categories error:', e);
    }
  }
  return getLocal(STORAGE_KEYS.CATEGORIES, defaultCategories);
};

export const saveCategory = async (catData) => {
  const isUpdate = Boolean(catData.id);
  const id = catData.id || generateUUID();
  const payload = {
    id,
    name: catData.name.trim(),
    icon_name: catData.icon || catData.icon_name || 'Car',
    description: (catData.description || '').trim(),
    is_active: catData.is_active !== undefined ? Boolean(catData.is_active) : true,
    created_at: catData.created_at || new Date().toISOString()
  };

  const categories = getLocal(STORAGE_KEYS.CATEGORIES, defaultCategories);
  let updated;
  if (isUpdate) {
    updated = categories.map(c => c.id === id ? { ...c, ...payload } : c);
  } else {
    updated = [...categories, payload];
  }
  setLocal(STORAGE_KEYS.CATEGORIES, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('categories').upsert(payload);
    } catch (e) {
      console.warn('Supabase saveCategory error:', e);
    }
  }
  return updated;
};

export const deleteCategory = async (catId) => {
  const categories = getLocal(STORAGE_KEYS.CATEGORIES, defaultCategories);
  const updated = categories.filter(c => c.id !== catId && c.name !== catId);
  setLocal(STORAGE_KEYS.CATEGORIES, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('categories').delete().or(`id.eq.${catId},name.eq.${catId}`);
    } catch (e) {
      console.warn('Supabase deleteCategory error:', e);
    }
  }
  return updated;
};

// ==================== CONTACT INQUIRIES ====================
export const getContacts = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        setLocal(STORAGE_KEYS.CONTACTS, data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase getContacts error:', e);
    }
  }
  return getLocal(STORAGE_KEYS.CONTACTS, []);
};

export const saveContactMessage = async (contactData) => {
  const id = generateUUID();
  const newContact = {
    id,
    name: contactData.name.trim(),
    email: contactData.email.trim(),
    phone: contactData.phone || '',
    subject: contactData.category || contactData.subject || 'General Inquiry',
    message: contactData.message.trim(),
    status: 'new',
    created_at: new Date().toISOString()
  };

  const contacts = getLocal(STORAGE_KEYS.CONTACTS, []);
  const updated = [newContact, ...contacts];
  setLocal(STORAGE_KEYS.CONTACTS, updated);

  addNotification({
    user_id: 'admin',
    title: 'New Customer Inquiry',
    message: `${newContact.name} submitted an inquiry: ${newContact.subject}`,
    type: 'contact'
  });

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('contacts').insert(newContact);
    } catch (e) {
      console.warn('Supabase contact save error:', e);
    }
  }

  return newContact;
};

export const updateContactStatus = async (contactId, status) => {
  const contacts = getLocal(STORAGE_KEYS.CONTACTS, []);
  const updated = contacts.map(c => c.id === contactId ? { ...c, status } : c);
  setLocal(STORAGE_KEYS.CONTACTS, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('contacts').update({ status }).eq('id', contactId);
    } catch (e) {
      console.warn('Supabase updateContactStatus error:', e);
    }
  }
  return updated;
};

export const deleteContact = async (contactId) => {
  const contacts = getLocal(STORAGE_KEYS.CONTACTS, []);
  const updated = contacts.filter(c => c.id !== contactId);
  setLocal(STORAGE_KEYS.CONTACTS, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('contacts').delete().eq('id', contactId);
    } catch (e) {
      console.warn('Supabase deleteContact error:', e);
    }
  }
  return updated;
};

// ==================== CASH DETAILS & ADVANCE SETTLEMENT ====================
export const updateBookingCash = async (bookingId, cashData) => {
  const bookings = getLocal(STORAGE_KEYS.BOOKINGS, []);
  const updated = bookings.map(b => {
    if (b.id === bookingId) {
      return {
        ...b,
        ...cashData,
        updated_at: new Date().toISOString()
      };
    }
    return b;
  });
  setLocal(STORAGE_KEYS.BOOKINGS, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('bookings').update({
        ...cashData,
        updated_at: new Date().toISOString()
      }).eq('id', bookingId);
    } catch (e) {
      console.warn('Supabase updateBookingCash error:', e);
    }
  }
  return updated;
};
