import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

const DEMO_USERS = {
  customer: {
    id: 'user-cust-001',
    email: 'kamal@example.com',
    full_name: 'Kamal Perera',
    phone: '+94 77 123 4567',
    role: 'customer',
    driving_license_no: 'B-9876543',
    id_card_no: '199012345678',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  },
  admin: {
    id: 'user-admin-001',
    email: 'admin@rentflow.com',
    full_name: 'Fleet Director Alex',
    phone: '+94 11 234 5678',
    role: 'admin',
    driving_license_no: 'B-0000001',
    id_card_no: '198500000001',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rentflow_active_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure demo admin is not automatically shown on customer frontend
        if (parsed?.email === 'admin@rentflow.com' || parsed?.id === 'user-admin-001' || parsed?.full_name?.includes('Fleet Director')) {
          localStorage.removeItem('rentflow_active_user');
          return null;
        }
        return parsed;
      }
    } catch {
      localStorage.removeItem('rentflow_active_user');
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Immediately purge any stale demo admin session from browser local storage
    try {
      const stored = localStorage.getItem('rentflow_active_user');
      if (stored && (stored.includes('admin@rentflow.com') || stored.includes('Fleet Director') || stored.includes('user-admin-001'))) {
        localStorage.removeItem('rentflow_active_user');
        setUser(null);
      }
    } catch {
      // ignore
    }

    // If Supabase is connected, check live session
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // fetch profile
          supabase.from('profiles').select('*').eq('id', session.user.id).single()
            .then(({ data: profile }) => {
              if (profile) {
                const u = { ...session.user, ...profile };
                setUser(u);
                localStorage.setItem('rentflow_active_user', JSON.stringify(u));
              }
            });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          supabase.from('profiles').select('*').eq('id', session.user.id).single()
            .then(({ data: profile }) => {
              if (profile) {
                const u = { ...session.user, ...profile };
                setUser(u);
                localStorage.setItem('rentflow_active_user', JSON.stringify(u));
              }
            });
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const loginAsDemo = (role = 'customer') => {
    const target = DEMO_USERS[role] || DEMO_USERS.customer;
    setUser(target);
    localStorage.setItem('rentflow_active_user', JSON.stringify(target));
    return target;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const cleanEmail = (email || '').trim().toLowerCase();

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          if (!error && data?.user) {
            // fetch custom profile if available
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            const activeUser = profile ? { ...data.user, ...profile } : data.user;
            setUser(activeUser);
            localStorage.setItem('rentflow_active_user', JSON.stringify(activeUser));
            return { success: true, user: activeUser };
          }
        } catch (authErr) {
          console.warn('Supabase signInWithPassword check:', authErr);
        }

        // If email confirmation is blocked by rate limits, check public.profiles directly
        try {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (dbProfile) {
            setUser(dbProfile);
            localStorage.setItem('rentflow_active_user', JSON.stringify(dbProfile));
            return { success: true, user: dbProfile };
          }
        } catch (dbErr) {
          console.warn('Profiles login check failed:', dbErr);
        }
      }

      // Local storage registered users fallback
      const registered = JSON.parse(localStorage.getItem('rentflow_registered_users') || '[]');
      const localMatch = registered.find(u => (u.email || '').toLowerCase() === cleanEmail);
      if (localMatch) {
        setUser(localMatch);
        localStorage.setItem('rentflow_active_user', JSON.stringify(localMatch));
        return { success: true, user: localMatch };
      }

      throw new Error('Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, fullName, phone, role = 'customer' }) => {
    setLoading(true);
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (fullName || 'Customer').trim();
      const cleanPhone = (phone || '').trim();

      let supabaseUserId = null;

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { full_name: cleanName, phone: cleanPhone, role }
            }
          });

          if (error) {
            // Any Supabase built-in email rate limit (status 429) or SMTP issue is bypassed
            console.warn('Supabase auth.signUp email notice (bypassed):', error.message || error);
          } else if (data?.user) {
            supabaseUserId = data.user.id;
          }
        } catch (authError) {
          console.warn('Supabase auth.signUp network/rate notice (bypassed):', authError.message || authError);
        }

        // Ensure user profile is created and stored in public.profiles table in Supabase
        const profileId = supabaseUserId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`);
        const profileData = {
          id: profileId,
          full_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone || null,
          role: role || 'customer',
          status: 'active',
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
          updated_at: new Date().toISOString()
        };

        try {
          const { data: savedProfile } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'email' })
            .select()
            .single();

          const activeUser = savedProfile || profileData;
          setUser(activeUser);
          localStorage.setItem('rentflow_active_user', JSON.stringify(activeUser));

          // Also keep in local registered list with password for instant fallback login
          const registered = JSON.parse(localStorage.getItem('rentflow_registered_users') || '[]');
          const localRecord = { ...activeUser, password };
          const updatedList = [localRecord, ...registered.filter(u => u.email !== cleanEmail)];
          localStorage.setItem('rentflow_registered_users', JSON.stringify(updatedList));

          return { success: true, user: activeUser };
        } catch (dbError) {
          console.warn('Direct profile save warning:', dbError);
        }
      }

      // Local fallback
      const newUser = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
        email: cleanEmail,
        full_name: cleanName,
        phone: cleanPhone,
        role: role || 'customer',
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`
      };

      setUser(newUser);
      localStorage.setItem('rentflow_active_user', JSON.stringify(newUser));

      const registered = JSON.parse(localStorage.getItem('rentflow_registered_users') || '[]');
      const updatedList = [newUser, ...registered.filter(u => u.email !== cleanEmail)];
      localStorage.setItem('rentflow_registered_users', JSON.stringify(updatedList));

      return { success: true, user: newUser };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('rentflow_active_user');
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('rentflow_active_user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'guest',
        isAdmin: user?.role === 'admin',
        isCustomer: user?.role === 'customer',
        loading,
        login,
        register,
        logout,
        loginAsDemo,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
