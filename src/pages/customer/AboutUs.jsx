import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, Shield, Award, Users, MapPin, CheckCircle2, 
  Clock, Sparkles, ArrowRight, HeartHandshake, Gauge 
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AboutUs = () => {
  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About RentFlow</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          Redefining Vehicle Rentals with Precision & Luxury
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Founded with a mission to eliminate hidden fees and substandard rental fleets, RentFlow provides an uncompromising mobility experience across Sri Lanka.
        </p>
      </section>

      {/* Core Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Guaranteed Vehicle Condition</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every vehicle undergoes a 50-point mechanical and safety inspection before handover. No surprise dents or unserviced engines.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Transparent Fixed Pricing</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Clear daily rates, zero hidden deposit deductions, and genuine CDW coverage waivers ensure total peace of mind throughout your journey.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">24/7 Roadside Assistance</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Dedicated mobile recovery vans stationed along the Southern Expressway, Central Highlands, and Western Province.
          </p>
        </div>
      </section>

      {/* Fleet Standards & Island Hubs */}
      <section className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Network & Stations</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Flagship Pickup & Handover Hubs
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Pick up your vehicle at one station and drop off at another. Our digital handover system takes less than 3 minutes with verified odometer and fuel recordings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">Colombo Flagship Hub</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">45 Galle Face Terrace, Colombo 03</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block pt-1">Open 24/7</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">Bandaranaike Airport (CMB)</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Arrivals Terminal Gate 4</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block pt-1">Flight Sync Meet & Greet</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">Kandy Hill Station</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Peradeniya Road, Kandy</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block pt-1">Open 07:00 - 21:00</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">Galle Coastal Express</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Matara Road, Galle Fort Exit</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block pt-1">Open 07:00 - 22:00</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-700 dark:text-slate-300">Ready to select a vehicle for your next adventure?</span>
          <Link to="/catalog">
            <Button variant="primary" size="md" icon={ArrowRight}>
              Browse Complete Fleet
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
