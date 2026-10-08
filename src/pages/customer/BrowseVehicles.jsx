import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, RotateCcw, Filter, Car
} from 'lucide-react';
import { getVehicles } from '../../services/dataService';
import { VehicleCard } from '../../components/customer/VehicleCard';
import { BookingModal } from '../../components/customer/BookingModal';
import { Button } from '../../components/common/Button';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { useCurrency } from '../../context/CurrencyContext';

const CATEGORIES = ['All', 'Car', 'SUV', 'Luxury Vehicle', 'Van', 'Motorbike', 'Three-Wheeler'];
const FUEL_TYPES = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['All', 'Automatic', 'Manual'];

export const BrowseVehicles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState(null);

  // Filters State
  const categoryParam = searchParams.get('category') || 'All';
  const [searchKeyword, setSearchKeyword] = useState('');
  const [category, setCategory] = useState(categoryParam);
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);

  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    setCategory(categoryParam);
  }

  const [fuelType, setFuelType] = useState('All');
  const [transmission, setTransmission] = useState('All');
  const [maxPrice, setMaxPrice] = useState(80000);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getVehicles().then((list) => {
      if (isMounted) {
        setVehicles(list);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered & Sorted fleet
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Keyword search
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const match = 
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.registration_no.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Category filter
      if (category !== 'All' && v.category !== category) return false;

      // Fuel filter
      if (fuelType !== 'All' && v.fuel_type !== fuelType) return false;

      // Transmission filter
      if (transmission !== 'All' && v.transmission !== transmission) return false;

      // Price slider
      if (Number(v.price_per_day) > maxPrice) return false;

      // Availability filter
      if (availableOnly && v.status !== 'available') return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price_per_day - b.price_per_day;
      if (sortBy === 'price_desc') return b.price_per_day - a.price_per_day;
      if (sortBy === 'year_desc') return b.year - a.year;
      return 0; // featured default
    });
  }, [vehicles, searchKeyword, category, fuelType, transmission, maxPrice, availableOnly, sortBy]);

  const handleResetFilters = () => {
    setSearchKeyword('');
    setCategory('All');
    setFuelType('All');
    setTransmission('All');
    setMaxPrice(80000);
    setAvailableOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Search Bar */}
      <ScrollReveal direction="down" duration={600} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Vehicle Fleet Catalog
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Displaying {filteredVehicles.length} of {vehicles.length} vehicles ready for immediate islandwide reservation.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search Toyota, Mercedes, Prado..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
            />
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </ScrollReveal>

      {/* Main Content Layout (Sidebar Filters + Vehicle Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className={`md:block ${showMobileFilters ? 'block' : 'hidden'} space-y-6 glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 h-fit sticky top-24`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8]" /> Filters
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-[#0077b6] dark:text-[#38bdf8] hover:text-[#023e8a] flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Vehicle Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Vehicle Category</label>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    category === cat
                      ? 'bg-[#0077b6]/15 text-[#0077b6] dark:text-[#38bdf8] font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat}</span>
                  {category === cat && <span className="w-1.5 h-1.5 rounded-full bg-[#0077b6] dark:bg-[#38bdf8]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Max Daily Rate</label>
              <span className="text-xs font-mono font-bold text-[#0077b6] dark:text-[#38bdf8]">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="4000"
              max="80000"
              step="2000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#0077b6] h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>{formatPrice(4000)}</span>
              <span>{formatPrice(80000)}</span>
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Fuel Type</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
            >
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Transmission</label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
            >
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-[#0077b6] focus:ring-[#0077b6] w-4 h-4"
              />
              <span>Available Vehicles Only</span>
            </label>
          </div>
        </aside>

        {/* Vehicles Catalog Grid */}
        <main className="md:col-span-3 space-y-4">
          {/* Sorting and Results count bar */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span>Showing <strong className="text-slate-900 dark:text-slate-100">{filteredVehicles.length}</strong> matching vehicles</span>
            
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
              >
                <option value="featured">Featured / Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="year_desc">Latest Year (Newest)</option>
              </select>
            </div>
          </div>

          {/* Grid Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-4">
              <Car className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200">No vehicles match your search filters</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Try widening your price range, clearing specific transmission/fuel preferences, or resetting filters.
              </p>
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle, idx) => (
                <ScrollReveal
                  key={vehicle.id}
                  direction="auto"
                  delay={(idx % 6) * 65}
                  duration={500}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    onBookClick={(v) => setSelectedVehicleForBooking(v)}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {selectedVehicleForBooking && (
        <BookingModal
          isOpen={Boolean(selectedVehicleForBooking)}
          onClose={() => setSelectedVehicleForBooking(null)}
          vehicle={selectedVehicleForBooking}
          onBookingSuccess={() => {}}
        />
      )}
    </div>
  );
};
