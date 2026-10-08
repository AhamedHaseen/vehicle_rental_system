import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, Shield, Award, Clock, ArrowRight, Star, 
  Calendar, MapPin, Sparkles, CheckCircle2, ChevronRight, Fuel, Gauge
} from 'lucide-react';
import { getVehicles, getReviews } from '../../services/dataService';
import { VehicleCard } from '../../components/customer/VehicleCard';
import { BookingModal } from '../../components/customer/BookingModal';
import { Button } from '../../components/common/Button';
import { useCurrency } from '../../context/CurrencyContext';

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
  const { formatPrice } = useCurrency();
  const [vehicles, setVehicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState(null);

  // Search Bar Form State
  const [searchCategory, setSearchCategory] = useState('');
  const [searchLocation, setSearchLocation] = useState('Colombo Flagship Hub');

  useEffect(() => {
    const load = async () => {
      const vList = await getVehicles();
      setVehicles(vList);
      const rList = await getReviews();
      setReviews(rList);
    };
    load();
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
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sri Lanka's Premier Fleet & Chauffeur Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Seamless Fleet Rentals, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600">
              Command The Journey.
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Reserve premium sedans, 4x4 SUVs, tour vans, and hyper bikes with verified condition, comprehensive CDW insurance, and instant digital handover.
          </p>
        </div>

        {/* Quick Search Floating Hub */}
        <div className="mt-10 max-w-4xl mx-auto glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xl">
          <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Vehicle Type / Category
              </label>
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
        </div>
      </section>

      {/* Category Pills Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Explore Fleet By Category</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select a vehicle category to filter current live availability.</p>
          </div>
          <Link to="/catalog" className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 font-semibold flex items-center gap-1">
            View All ({vehicles.length}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`p-3.5 rounded-xl border text-left transition-all btn-tactile ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-md'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'}`} />
                <h4 className="font-bold text-xs truncate text-slate-900 dark:text-slate-100">{cat.name}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{cat.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Fleet Vehicles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Featured Vehicles Ready For Dispatch</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pre-inspected, fully insured, and cleaned prior to handover.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.slice(0, 6).map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onBookClick={(v) => setSelectedVehicleForBooking(v)}
            />
          ))}
        </div>
      </section>

      {/* How It Works - 3 Step Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Effortless Experience</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">How RentFlow Works</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Book in 60 seconds with transparent terms and rapid roadside dispatch.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <span className="text-4xl font-black text-amber-500/20 absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Select Your Vehicle</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Browse our real-time available catalog. Compare specifications, seat capacities, daily rates, and fuel economy.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <span className="text-4xl font-black text-amber-500/20 absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Instant Pass & Handover</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Complete digital booking with full CDW protection. Receive a verified reservation pass and meet our agent for 3-minute key handover.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <span className="text-4xl font-black text-amber-500/20 absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Drive & Swift Check-in</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Enjoy unlimited island adventures. Return to any of our 4 hubs with streamlined fuel & odometer inspection and instant deposit release.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verified Renter Experiences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real ratings submitted by tourists, families, and corporate executives.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
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
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedVehicleForBooking && (
        <BookingModal
          isOpen={Boolean(selectedVehicleForBooking)}
          onClose={() => setSelectedVehicleForBooking(null)}
          vehicle={selectedVehicleForBooking}
          onBookingSuccess={() => {
            navigate('/my-bookings');
          }}
        />
      )}
    </div>
  );
};
