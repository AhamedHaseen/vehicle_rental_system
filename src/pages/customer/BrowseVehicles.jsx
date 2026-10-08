import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, RotateCcw, Car
} from 'lucide-react';
import { getVehicles } from '../../services/dataService';
import { VehicleCard } from '../../components/customer/VehicleCard';
import { Button } from '../../components/common/Button';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { useCurrency } from '../../context/CurrencyContext';

const CATEGORIES = ['All', 'Car', 'SUV', 'Luxury Vehicle', 'Van', 'Motorbike', 'Three-Wheeler'];
const FUEL_TYPES = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['All', 'Automatic', 'Manual'];

export const BrowseVehicles = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search Toyota, Mercedes, Prado..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
          />
        </div>
      </ScrollReveal>

      {/* Top Filter Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 space-y-4 shadow-xs">
        {/* Category Pills Row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vehicle Category
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-[#0077b6] dark:text-[#38bdf8] hover:text-[#023e8a] flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-[#0077b6] text-white shadow-md shadow-[#0077b6]/25 dark:bg-[#023e8a]'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          {/* Fuel Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Fuel Type</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
            >
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{f === 'All' ? 'All Fuel Types' : f}</option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Transmission</label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
            >
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Transmissions' : t}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Max Daily Rate</label>
              <span className="text-xs font-mono font-bold text-[#0077b6] dark:text-[#38bdf8]">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="4000"
              max="80000"
              step="2000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#0077b6] h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer mt-1.5"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 w-full">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-[#0077b6] focus:ring-[#0077b6] w-4 h-4 cursor-pointer"
              />
              <span className="font-medium">Available Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Full Width Grid) */}
      <main className="space-y-4">
          {/* Sorting and Results count bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span>Showing <strong className="text-slate-900 dark:text-slate-100 font-bold">{filteredVehicles.length}</strong> available fleet options</span>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0077b6] cursor-pointer font-semibold"
              >
                <option value="featured">Featured (Curated)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="year_desc">Latest Year (Newest)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(category !== 'All' || fuelType !== 'All' || transmission !== 'All' || searchKeyword.trim() || availableOnly || maxPrice < 80000) && (
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50/80 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Filters:</span>
              {category !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0077b6]/10 text-[#0077b6] dark:text-[#38bdf8] border border-[#0077b6]/20">
                  {category}
                  <button onClick={() => setCategory('All')} className="hover:text-slate-900 dark:hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {fuelType !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0077b6]/10 text-[#0077b6] dark:text-[#38bdf8] border border-[#0077b6]/20">
                  {fuelType}
                  <button onClick={() => setFuelType('All')} className="hover:text-slate-900 dark:hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {transmission !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0077b6]/10 text-[#0077b6] dark:text-[#38bdf8] border border-[#0077b6]/20">
                  {transmission}
                  <button onClick={() => setTransmission('All')} className="hover:text-slate-900 dark:hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {searchKeyword.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0077b6]/10 text-[#0077b6] dark:text-[#38bdf8] border border-[#0077b6]/20">
                  "{searchKeyword}"
                  <button onClick={() => setSearchKeyword('')} className="hover:text-slate-900 dark:hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {availableOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Available Only
                  <button onClick={() => setAvailableOnly(false)} className="hover:text-slate-900 dark:hover:text-white ml-0.5">✕</button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-500 hover:text-rose-600 hover:underline font-semibold ml-auto"
              >
                Reset All
              </button>
            </div>
          )}

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
                    onBookClick={(v) => navigate(`/vehicles/${v.id}`)}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}
        </main>
    </div>
  );
};
