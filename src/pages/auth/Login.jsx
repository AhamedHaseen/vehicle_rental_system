import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Car, Lock, Mail, UserCheck, Sparkles, ArrowRight } from 'lucide-react';

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
        navigate('/catalog');
      }
    } catch (err) {
      error('Sign In Failed', err.message || 'Invalid credentials provided.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const u = loginAsDemo('customer');
    success('Demo Access Granted', `Logged in as ${u.full_name}`);
    navigate('/catalog');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0077b6] to-[#023e8a] flex items-center justify-center mx-auto shadow-lg shadow-[#0077b6]/25">
            <Car className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Sign In to RentFlow</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">Access customer reservations and fleet rentals</p>
        </div>

        {/* 1-Click Fast Evaluation Button */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8] flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5" /> Instant 1-Click Demo Evaluation
          </span>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors btn-tactile cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]"
          >
            <UserCheck className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
            <span>Instant Customer Demo Access</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Or with email</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Password</label>
              <button
                type="button"
                onClick={() => success('Password Reset', 'Password reset email simulation dispatched.')}
                className="text-[11px] text-[#0077b6] dark:text-[#38bdf8] hover:underline"
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
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

        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-[#0077b6] dark:text-[#38bdf8] hover:underline font-semibold">
            Register new account
          </Link>
        </p>
      </div>
    </div>
  );
};
