import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Car, Lock, Mail, ShieldCheck, UserCheck, Sparkles, ArrowRight } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loginAsDemo } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        success('Signed In', `Welcome back, ${res.user.full_name || 'Renter'}!`);
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/catalog');
        }
      }
    } catch (err) {
      error('Sign In Failed', err.message || 'Invalid credentials provided.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const u = loginAsDemo(role);
    success('Demo Access Granted', `Logged in as ${u.full_name} (${role.toUpperCase()})`);
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/catalog');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Car className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Sign In to RentFlow</h1>
          <p className="text-xs text-slate-400">Access customer reservations or administrator fleet console</p>
        </div>

        {/* 1-Click Fast Evaluation Buttons */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5" /> Instant 1-Click Demo Evaluation
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors btn-tactile"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-2 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 border border-purple-800/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors btn-tactile"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500">Or with email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">Password</label>
              <button
                type="button"
                onClick={() => success('Password Reset', 'Password reset email simulation dispatched.')}
                className="text-[11px] text-amber-400 hover:text-amber-300"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2 font-bold"
            icon={ArrowRight}
          >
            Sign In to Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-amber-400 hover:text-amber-300 font-semibold">
            Register new account
          </Link>
        </p>
      </div>
    </div>
  );
};
