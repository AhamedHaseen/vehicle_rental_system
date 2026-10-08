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
    const saved = localStorage.getItem('rentflow_active_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.customer;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { success: true, user: data.user };
      }

      // Local / Mock validation
      if (email.toLowerCase().includes('admin')) {
        const adminUser = loginAsDemo('admin');
        return { success: true, user: adminUser };
      } else {
        const customerUser = loginAsDemo('customer');
        return { success: true, user: customerUser };
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, fullName, phone, role = 'customer' }) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone, role }
          }
        });
        if (error) throw error;
        return { success: true, user: data.user };
      }

      // Local mock register
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        full_name: fullName,
        phone,
        role,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
      };
      setUser(newUser);
      localStorage.setItem('rentflow_active_user', JSON.stringify(newUser));
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
