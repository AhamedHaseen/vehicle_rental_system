import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      {/* Trust Badges Bar */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/50 py-8 bg-white/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#023e8a]/10 text-[#023e8a] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-900 dark:text-slate-200 text-sm">Comprehensive Fleet Insurance</h5>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Zero-excess waiver options available for all vehicles.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#023e8a]/10 text-[#023e8a] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-900 dark:text-slate-200 text-sm">24/7 Islandwide Roadside Assistance</h5>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Rapid dispatch recovery across Colombo, Kandy & Galle.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#023e8a]/10 text-[#023e8a] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-900 dark:text-slate-200 text-sm">Transparent Guaranteed Rates</h5>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">No hidden handover fees or surprise fuel markups.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#023e8a] to-[#0077b6] flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Rent<span className="text-[#023e8a] dark:text-[#38bdf8]">Flow</span>
            </span>
          </Link>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
            Premium vehicle rental ecosystem built for travelers, executives, and logistics fleets. Verified condition and seamless digital booking.
          </p>
        </div>

        <div>
          <h4 className="text-slate-900 dark:text-slate-200 font-semibold text-sm mb-3">Fleet Categories</h4>
          <ul className="space-y-2">
            <li><Link to="/catalog?category=Car" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">Sedans & Hybrids</Link></li>
            <li><Link to="/catalog?category=SUV" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">4x4 SUVs & Off-Roaders</Link></li>
            <li><Link to="/catalog?category=Luxury Vehicle" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">Executive Luxury (Mercedes / BMW)</Link></li>
            <li><Link to="/catalog?category=Van" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">Group Vans & Touring (HiAce)</Link></li>
            <li><Link to="/catalog?category=Motorbike" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">Hyper Naked Motorbikes</Link></li>
            <li><Link to="/catalog?category=Three-Wheeler" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">Iconic Tuk-Tuks</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-900 dark:text-slate-200 font-semibold text-sm mb-3">Rental Resources</h4>
          <ul className="space-y-2">
            <li><Link to="/catalog" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">Browse Available Fleet</Link></li>
            <li><Link to="/my-bookings" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">Reservation Passes & Receipts</Link></li>
            <li><Link to="/about" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">About RentFlow Network</Link></li>
            <li><Link to="/contact" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">Contact & Station Hubs</Link></li>
            <li><Link to="/login" className="hover:text-[#023e8a] dark:hover:text-[#38bdf8] transition-colors">Customer & Admin Sign In</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-900 dark:text-slate-200 font-semibold text-sm mb-3">Flagship Hub & Contact</h4>
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#023e8a] dark:text-[#38bdf8] shrink-0 mt-0.5" />
            <span className="leading-relaxed">45 Galle Face Terrace, Colombo 03, Sri Lanka</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-[#023e8a] dark:text-[#38bdf8] shrink-0" />
            <span>+94 11 234 5678 (24/7 Hotline)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#023e8a] dark:text-[#38bdf8] shrink-0" />
            <span>support@rentflow.lk</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} RentFlow Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-slate-700 dark:hover:text-slate-300">Terms of Service</a>
            <a href="#privacy" className="hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</a>
            <a href="#security" className="hover:text-slate-700 dark:hover:text-slate-300">Security & RLS</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
