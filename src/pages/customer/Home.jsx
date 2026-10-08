import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, Shield, Clock, Star, 
  MapPin, Sparkles, ChevronRight, Gauge, ArrowRight,
  ShieldCheck, Award, Zap
} from 'lucide-react';
import { getVehicles, getReviews } from '../../services/dataService';
import { VehicleCard } from '../../components/customer/VehicleCard';
import { Button } from '../../components/common/Button';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { SpotlightCard } from '../../components/common/SpotlightCard';

const CATEGORIES = [
  { name: 'All', icon: Car, desc: 'Complete Fleet' },
  { name: 'Car', icon: Car, desc: 'Sedans & Hybrids' },
  { name: 'SUV', icon: Shield, desc: 'Commanding 4x4' },
  { name: 'Luxury Vehicle', icon: Sparkles, desc: 'VIP Flagship' },
  { name: 'Van', icon: Clock, desc: 'Group Touring' },
  { name: 'Motorbike', icon: Gauge, desc: 'Hyper Naked' },
  { name: 'Three-Wheeler', icon: MapPin, desc: 'Island Tuk-Tuk' }
];

export const Home = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Search Bar Form State
  const [searchCategory, setSearchCategory] = useState('');
  const [searchLocation, setSearchLocation] = useState('Colombo Flagship Hub');

  useEffect(() => {
    let isMounted = true;
    Promise.all([getVehicles(), getReviews()]).then(([vList, rList]) => {
      if (isMounted) {
        setVehicles(vList);
        setReviews(rList);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchCategory) query.set('category', searchCategory);
    navigate(`/catalog?${query.toString()}`);
  };

  const filteredVehicles = selectedCategory === 'All' 
    ? vehicles 
    : vehicles.filter(v => v.category === selectedCategory);

  return (
    <div className="w-full transition-colors duration-300">
      {/* SECTION 1: HERO & LIVE SEARCH HUB (Soft Cerulean Light Sky Tint) */}
      <section className="relative w-full pt-16 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#e0f2fe]/60 via-[#f0f9ff]/70 to-[#ffffff] dark:from-[#030712] dark:via-[#090f20]/80 dark:to-[#030712] border-b border-sky-100/80 dark:border-slate-800/80 overflow-hidden transition-colors duration-300">
        {/* Ambient background glow with smooth pulse */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-[#0077b6]/15 dark:bg-[#023e8a]/20 blur-[140px] rounded-full pointer-events-none -z-10 animate-ambient-glow" />

        <ScrollReveal direction="down" duration={700} className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0077b6]/10 dark:bg-[#023e8a]/20 border border-[#0077b6]/25 dark:border-[#38bdf8]/30 text-[#0077b6] dark:text-[#38bdf8] text-xs font-semibold shadow-sm transition-all duration-300 hover:scale-105">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sri Lanka's Premier Fleet & Chauffeur Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight transition-colors duration-300">
            Seamless Fleet Rentals, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077b6] via-[#023e8a] to-[#0096c7] dark:from-[#38bdf8] dark:via-[#60a5fa] dark:to-[#93c5fd] animate-gradient-text">
              Command The Journey.
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Reserve premium sedans, 4x4 SUVs, tour vans, and hyper bikes with verified condition, comprehensive CDW insurance, and instant digital handover.
          </p>
        </ScrollReveal>

        {/* Quick Search Floating Hub */}
        <ScrollReveal direction="up" delay={150} duration={650} className="mt-10 max-w-4xl mx-auto glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xl hover:shadow-2xl transition-all duration-300">
          <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Vehicle Type / Category
              </label>
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0077b6] transition-colors"
              >
                <option value="">All Categories (Fleet)</option>
                <option value="Car">Sedan & Hybrid</option>
                <option value="SUV">4x4 Off-Road SUV</option>
                <option value="Luxury Vehicle">Executive Luxury (VIP)</option>
                <option value="Van">Passenger Van</option>
                <option value="Motorbike">Motorbike</option>
                <option value="Three-Wheeler">Three-Wheeler</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Pickup & Return Hub
              </label>
              <select
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0077b6] transition-colors"
              >
                <option value="Colombo Flagship Hub">Colombo Flagship Hub (Galle Face)</option>
                <option value="Bandaranaike International Airport">Bandaranaike Int. Airport (CMB)</option>
                <option value="Kandy Hill Station Hub">Kandy Hill Station Hub</option>
                <option value="Galle Coastal Express Hub">Galle Coastal Express Hub</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="primary"
                size="md"
                type="submit"
                className="w-full h-[38px]"
                icon={ArrowRight}
              >
                Explore Available Fleet
              </Button>
            </div>
          </form>
        </ScrollReveal>
      </section>

      {/* SECTION 2: CATEGORY EXPLORER (Soft Powder Blue Tint) */}
      <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#f0f7fc] dark:bg-[#080d1a] border-b border-sky-100/80 dark:border-slate-800/60 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="auto" className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8] block mb-1">
                Curated Categories
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                Explore Fleet By Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Select a vehicle category to filter current live availability.</p>
            </div>
            <Link to="/catalog" className="text-xs text-[#0077b6] dark:text-[#38bdf8] hover:text-[#023e8a] font-bold flex items-center gap-1 transition-colors self-start sm:self-auto py-1">
              View All ({vehicles.length}) <ChevronRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <ScrollReveal
                  key={cat.name}
                  direction="auto"
                  delay={idx * 50}
                  duration={500}
                >
                  <button
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-200 btn-tactile cursor-pointer ${
                      isSelected
                        ? 'bg-[#0077b6] text-white border-[#0077b6] shadow-lg shadow-[#0077b6]/20 scale-102 dark:bg-[#023e8a] dark:border-[#38bdf8]'
                        : 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#0077b6]/60 hover:bg-[#e0f2fe]/40 hover:scale-102 shadow-xs'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 transition-colors ${isSelected ? 'text-white' : 'text-[#0077b6] dark:text-slate-400'}`} />
                    <h4 className={`font-bold text-xs truncate transition-colors ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{cat.name}</h4>
                    <p className={`text-[10px] truncate mt-0.5 transition-colors ${isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}`}>{cat.desc}</p>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURED FLEET VEHICLES GRID (Crisp Pure Surface) */}
      <section className="w-full py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#ffffff] dark:bg-[#030712] border-b border-slate-200/60 dark:border-slate-800/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="auto" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div className="space-y-1">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8] block">
                Instant Availability
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                Featured Vehicles Ready For Dispatch
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Pre-inspected, fully insured, and sanitized prior to handover.
              </p>
            </div>
            <Link to="/catalog" className="w-full sm:w-auto shrink-0">
              <Button variant="outline" size="sm" icon={ChevronRight} className="w-full sm:w-auto justify-center font-bold">
                View Full Fleet
              </Button>
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.slice(0, 6).map((vehicle, idx) => (
              <ScrollReveal
                key={vehicle.id}
                direction="auto"
                delay={idx * 75}
                duration={550}
              >
                <VehicleCard
                  vehicle={vehicle}
                  onBookClick={(v) => navigate(`/vehicle/${v.id}`)}
                />
              </ScrollReveal>
            ))}
          </div>

          {/* Mobile Bottom CTA to explore all vehicles */}
          <div className="mt-8 text-center sm:hidden">
            <Link to="/catalog" className="block w-full">
              <Button variant="primary" size="md" icon={ChevronRight} className="w-full justify-center h-12 text-xs font-bold shadow-lg shadow-[#0077b6]/20">
                Explore Full Fleet ({vehicles.length} Vehicles)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: TRUST PILLARS & FLEET ASSURANCE (Soft Azure Horizon Tint) */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#e0f2fe]/40 via-[#f8fafc] to-[#eaf4fb] dark:from-[#0b1426] dark:via-[#080e1b] dark:to-[#050912] border-b border-sky-200/60 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="auto" className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8]">
              Verified Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1 transition-colors duration-300">
              Why Travelers Choose RentFlow
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Industry-leading vehicle protection, direct fleet management, and zero unexpected charges.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollReveal direction="auto" delay={0} duration={550}>
              <div className="h-full p-6 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-[#0077b6]/10 text-[#0077b6] dark:bg-[#023e8a]/20 dark:text-[#38bdf8] flex items-center justify-center font-bold mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Comprehensive CDW Waiver</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                  Drive worry-free with full coverage against minor scrapes, glass cracks, and roadside incidents.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="auto" delay={80} duration={550}>
              <div className="h-full p-6 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-[#0077b6]/10 text-[#0077b6] dark:bg-[#023e8a]/20 dark:text-[#38bdf8] flex items-center justify-center font-bold mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">24/7 Islandwide Recovery</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                  Direct hotline dispatch with dedicated replacement vehicle logistics across all 9 provinces.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="auto" delay={160} duration={550}>
              <div className="h-full p-6 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-[#0077b6]/10 text-[#0077b6] dark:bg-[#023e8a]/20 dark:text-[#38bdf8] flex items-center justify-center font-bold mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">100% Guaranteed Rates</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                  Clear itemized quotes with fixed fuel policies and zero hidden counter charges at checkout.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="auto" delay={240} duration={550}>
              <div className="h-full p-6 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-[#0077b6]/10 text-[#0077b6] dark:bg-[#023e8a]/20 dark:text-[#38bdf8] flex items-center justify-center font-bold mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">3-Minute Digital Handover</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                  Present your QR reservation pass, sign the condition report, and receive your keys instantly.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS (Soft Modern Muted Surface) */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#f8fafc] dark:bg-[#060a14] border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <ScrollReveal direction="auto" className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8]">
                Effortless Experience
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1 transition-colors duration-300">
                How RentFlow Works
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Book in 60 seconds with transparent terms and rapid roadside dispatch.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ScrollReveal direction="auto" delay={0} duration={550}>
                <SpotlightCard
                  className="h-full p-6 sm:p-7 space-y-3 relative"
                  spotlightSize={260}
                  proximity={80}
                  intensity={0.25}
                >
                  <span className="text-4xl font-black text-[#0077b6]/20 dark:text-[#38bdf8]/20 absolute top-5 right-6 select-none pointer-events-none">
                    01
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-[#0077b6]/10 text-[#0077b6] dark:text-[#38bdf8] flex items-center justify-center font-bold">
                    <Car className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Select Your Vehicle</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Browse our real-time available catalog. Compare specifications, seat capacities, daily rates, and fuel economy.
                  </p>
                </SpotlightCard>
              </ScrollReveal>

              <ScrollReveal direction="auto" delay={120} duration={550}>
                <SpotlightCard
                  className="h-full p-6 sm:p-7 space-y-3 relative"
                  spotlightSize={260}
                  proximity={80}
                  intensity={0.25}
                >
                  <span className="text-4xl font-black text-[#0077b6]/20 dark:text-[#38bdf8]/20 absolute top-5 right-6 select-none pointer-events-none">
                    02
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-[#0077b6]/10 text-[#0077b6] dark:text-[#38bdf8] flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Instant Pass & Handover</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Complete digital booking with full CDW protection. Receive a verified reservation pass and meet our agent for 3-minute key handover.
                  </p>
                </SpotlightCard>
              </ScrollReveal>

              <ScrollReveal direction="auto" delay={240} duration={550}>
                <SpotlightCard
                  className="h-full p-6 sm:p-7 space-y-3 relative"
                  spotlightSize={260}
                  proximity={80}
                  intensity={0.25}
                >
                  <span className="text-4xl font-black text-[#0077b6]/20 dark:text-[#38bdf8]/20 absolute top-5 right-6 select-none pointer-events-none">
                    03
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-[#0077b6]/10 text-[#0077b6] dark:text-[#38bdf8] flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Drive & Swift Check-in</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Enjoy unlimited island adventures. Return to any of our 4 hubs with streamlined fuel & odometer inspection and instant deposit release.
                  </p>
                </SpotlightCard>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: VERIFIED CUSTOMER EXPERIENCES (Soft Pearl Slate Tint) */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#edf4f9] dark:bg-[#091122] border-b border-sky-200/60 dark:border-slate-800/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="auto" className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8] block mb-1">
                Guest Reviews
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                Verified Renter Experiences
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real ratings submitted by tourists, families, and corporate executives.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <ScrollReveal
                key={rev.id}
                direction="auto"
                delay={idx * 100}
                duration={550}
              >
                <div className="h-full glass-card p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 flex flex-col justify-between hover:border-[#0077b6]/40 hover:-translate-y-1 transition-all duration-300">
                  <div>
                    <div className="flex items-center gap-1 mb-3 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-semibold text-slate-900 dark:text-slate-200">{rev.customer_name}</h5>
                      <span className="text-[10px] text-slate-500">{rev.date}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Verified Trip
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: INTERACTIVE VIP CALL-TO-ACTION BANNER */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-[#f0f9ff]/50 dark:bg-[#030712] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="zoom" duration={700}>
            <div className="bg-gradient-to-r from-[#0077b6] via-[#023e8a] to-[#03045e] dark:from-[#023e8a] dark:via-[#0077b6] dark:to-[#0096c7] rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden transition-all duration-300">
              {/* Subtle light orb in corner */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl space-y-4 relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-200 inline-block px-3 py-1 bg-white/10 rounded-full">
                  Instant Online Reservation
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Ready to Hit the Open Road in Sri Lanka?
                </h2>
                <p className="text-sky-100 text-sm leading-relaxed max-w-xl">
                  Choose your ideal sedan, SUV, or tour van now. Get instant digital confirmation and zero counter delays upon arrival.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link to="/catalog">
                    <button className="px-6 py-3 rounded-xl bg-white text-[#0077b6] font-bold text-sm hover:bg-sky-50 hover:shadow-lg transition-all duration-200 btn-tactile">
                      Browse All Vehicles
                    </button>
                  </Link>
                  <Link to="/contact">
                    <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all duration-200 btn-tactile">
                      Contact Station Hubs
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
