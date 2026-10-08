import { supabase, isSupabaseConfigured } from './supabase';
import { initialVehicles, initialBookings, initialCustomers, initialReviews, initialNotifications, defaultSettings } from './mockData';

// Local storage keys
const STORAGE_KEYS = {
  VEHICLES: 'rentflow_vehicles',
  BOOKINGS: 'rentflow_bookings',
  CUSTOMERS: 'rentflow_customers',
  REVIEWS: 'rentflow_reviews',
  NOTIFICATIONS: 'rentflow_notifications',
  SETTINGS: 'rentflow_settings',
};

// Initialize localStorage if empty
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(initialVehicles));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(initialBookings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(initialReviews));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
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

// ==================== VEHICLES ====================
export const getVehicles = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetch failed, using local store:', e);
    }
  }
  return getLocal(STORAGE_KEYS.VEHICLES, initialVehicles);
};

export const getVehicleById = async (id) => {
  const vehicles = await getVehicles();
  return vehicles.find(v => v.id === id || v.vehicle_code === id);
};

export const saveVehicle = async (vehicleData) => {
  const vehicles = getLocal(STORAGE_KEYS.VEHICLES, initialVehicles);
  let updated;
  if (vehicleData.id) {
    updated = vehicles.map(v => v.id === vehicleData.id ? { ...v, ...vehicleData, updated_at: new Date().toISOString() } : v);
  } else {
    const newId = `vh-${Date.now()}`;
    const newCode = `VH${String(vehicles.length + 1).padStart(3, '0')}`;
    const newVehicle = {
      ...vehicleData,
      id: newId,
      vehicle_code: newCode,
      created_at: new Date().toISOString(),
    };
    updated = [newVehicle, ...vehicles];
  }
  setLocal(STORAGE_KEYS.VEHICLES, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('vehicles').upsert(vehicleData);
    } catch (e) {
      console.warn('Supabase save error:', e);
    }
  }
  return updated;
};

export const deleteVehicle = async (vehicleId) => {
  const vehicles = getLocal(STORAGE_KEYS.VEHICLES, initialVehicles);
  const updated = vehicles.filter(v => v.id !== vehicleId);
  setLocal(STORAGE_KEYS.VEHICLES, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('vehicles').delete().eq('id', vehicleId);
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }
  return updated;
};

// ==================== BOOKINGS ====================
export const getBookings = async (customerId = null) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('bookings').select('*, vehicles(*)').order('created_at', { ascending: false });
      if (customerId) query = query.eq('customer_id', customerId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase bookings fetch failed:', e);
    }
  }
  const all = getLocal(STORAGE_KEYS.BOOKINGS, initialBookings);
  if (customerId) {
    return all.filter(b => b.customer_id === customerId);
  }
  return all;
};

export const createBooking = async (bookingData) => {
  const bookings = getLocal(STORAGE_KEYS.BOOKINGS, initialBookings);
  const newBooking = {
    ...bookingData,
    id: `bk-${Date.now()}`,
    booking_code: `RF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    booking_status: 'pending',
    payment_status: bookingData.payment_status || 'paid',
    created_at: new Date().toISOString()
  };
  const updated = [newBooking, ...bookings];
  setLocal(STORAGE_KEYS.BOOKINGS, updated);

  // Auto-mark vehicle as rented if confirmed, or leave available until confirmed
  // Notify admin
  addNotification({
    user_id: 'admin',
    title: 'New Booking Request',
    message: `${newBooking.customer_name} reserved ${newBooking.vehicle_name} (${newBooking.booking_code})`,
    type: 'booking'
  });

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('bookings').insert(newBooking);
    } catch (e) {
      console.warn('Supabase create booking error:', e);
    }
  }
  return newBooking;
};

export const updateBookingStatus = async (bookingId, status, extraFields = {}) => {
  const bookings = getLocal(STORAGE_KEYS.BOOKINGS, initialBookings);
  const updated = bookings.map(b => {
    if (b.id === bookingId) {
      return { ...b, booking_status: status, ...extraFields, updated_at: new Date().toISOString() };
    }
    return b;
  });
  setLocal(STORAGE_KEYS.BOOKINGS, updated);

  // If status is active, set vehicle status to rented
  const targetBooking = bookings.find(b => b.id === bookingId);
  if (targetBooking) {
    if (status === 'active') {
      updateVehicleStatus(targetBooking.vehicle_id, 'rented');
    } else if (status === 'completed' || status === 'cancelled') {
      updateVehicleStatus(targetBooking.vehicle_id, 'available');
    }

    // Send customer notification
    addNotification({
      user_id: targetBooking.customer_id,
      title: `Booking ${status.toUpperCase()}`,
      message: `Your booking for ${targetBooking.vehicle_name} is now marked as ${status}.`,
      type: 'booking'
    });
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('bookings').update({ booking_status: status, ...extraFields }).eq('id', bookingId);
    } catch (e) {
      console.warn('Supabase update status error:', e);
    }
  }
  return updated;
};

export const updateVehicleStatus = (vehicleId, status) => {
  const vehicles = getLocal(STORAGE_KEYS.VEHICLES, initialVehicles);
  const updated = vehicles.map(v => v.id === vehicleId ? { ...v, status } : v);
  setLocal(STORAGE_KEYS.VEHICLES, updated);
};

// ==================== PICKUP / RETURN WORKFLOW ====================
export const performPickupHandover = async (bookingId, { fuelLevel, odometer, notes }) => {
  return updateBookingStatus(bookingId, 'active', {
    fuel_pickup_percent: fuelLevel,
    odometer_pickup_km: odometer,
    pickup_notes: notes,
    pickup_timestamp: new Date().toISOString()
  });
};

export const performReturnCheckin = async (bookingId, { fuelLevel, odometer, notes, lateFee = 0, damageFee = 0 }) => {
  const bookings = getLocal(STORAGE_KEYS.BOOKINGS, initialBookings);
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

// ==================== CUSTOMERS ====================
export const getCustomers = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'customer');
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getCustomers error:', e);
    }
  }
  return getLocal(STORAGE_KEYS.CUSTOMERS, initialCustomers);
};

export const updateCustomerStatus = async (customerId, status) => {
  const customers = getLocal(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  const updated = customers.map(c => c.id === customerId ? { ...c, status } : c);
  setLocal(STORAGE_KEYS.CUSTOMERS, updated);
  return updated;
};

// ==================== REVIEWS ====================
export const getReviews = async (vehicleId = null) => {
  const all = getLocal(STORAGE_KEYS.REVIEWS, initialReviews);
  if (vehicleId) return all.filter(r => r.vehicle_id === vehicleId);
  return all;
};

export const addReview = async (review) => {
  const reviews = getLocal(STORAGE_KEYS.REVIEWS, initialReviews);
  const newReview = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toISOString().split('T')[0]
  };
  const updated = [newReview, ...reviews];
  setLocal(STORAGE_KEYS.REVIEWS, updated);
  return updated;
};

// ==================== NOTIFICATIONS ====================
export const getNotifications = async (userId) => {
  const all = getLocal(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  if (!userId) return all;
  return all.filter(n => n.user_id === userId || n.user_id === 'all');
};

export const addNotification = (notif) => {
  const notifs = getLocal(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
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
  const notifs = getLocal(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  const updated = notifs.map(n => n.id === notifId ? { ...n, is_read: true } : n);
  setLocal(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
};

// ==================== SETTINGS ====================
export const getSystemSettings = () => {
  return getLocal(STORAGE_KEYS.SETTINGS, defaultSettings);
};

export const updateSystemSettings = (newSettings) => {
  setLocal(STORAGE_KEYS.SETTINGS, newSettings);
  return newSettings;
};
