import { Link } from 'react-router-dom';
import { Users, Fuel, Gauge, ArrowRight, Eye, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const VehicleCard = ({ vehicle, onBookClick }) => {
  const { formatPrice } = useCurrency();
  const isAvailable = vehicle.status === 'available';

  // High-contrast, non-transparent status badge helper
  const renderStatusBadge = () => {
    switch (vehicle.status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-md shadow-emerald-950/40 border border-emerald-400/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>Available</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-600 text-white shadow-md shadow-rose-950/40 border border-rose-400/40">
            <Wrench className="w-3.5 h-3.5 text-white" />
            <span>Maintenance</span>
          </span>
        );
      case 'reserved':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-600 text-white shadow-md shadow-amber-950/40 border border-amber-400/40">
            <Clock className="w-3.5 h-3.5 text-white" />
            <span>Reserved</span>
          </span>
        );
    }
  };

  return (
    <div className="group relative flex flex-col rounded-3xl glass-card overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 hover:border-[#0077b6]/50 dark:hover:border-[#38bdf8]/50 hover:shadow-2xl hover:shadow-[#0077b6]/15 hover:-translate-y-2 transition-all duration-300">
      {/* Top Media Showcase Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <img
          src={vehicle.image_url}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Ambient Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/25 pointer-events-none" />

        {/* Floating Top Status Badge (Available, Reserved, Maintenance) */}
        <div className="absolute top-3.5 right-3.5 pointer-events-none">
          {renderStatusBadge()}
        </div>

        {/* Quick View Hover Overlay Button */}
        <Link
          to={`/vehicle/${vehicle.id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-none group-hover:pointer-events-auto"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105">
            <Eye className="w-3.5 h-3.5 text-[#0077b6]" />
            <span>View Full Specs</span>
          </span>
        </Link>
      </div>

      {/* Card Content Body */}
      <div className="p-5 pb-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Title and Brand */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8]">
              {vehicle.brand}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {vehicle.year} Model
            </span>
          </div>

          <Link to={`/vehicle/${vehicle.id}`} className="block group/title">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover/title:text-[#0077b6] dark:group-hover/title:text-[#38bdf8] transition-colors truncate">
              {vehicle.model}
            </h3>
          </Link>

          {/* Clean Specs Strip: NO wrapping, full text ("4 Seats • Petrol • Automatic") */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <Users className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8] shrink-0" />
              <span>{vehicle.seats} Seats</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Fuel className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8] shrink-0" />
              <span>{vehicle.fuel_type}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Gauge className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8] shrink-0" />
              <span>{vehicle.transmission}</span>
            </div>
          </div>
        </div>

        {/* Price display row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Daily Rental Rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#0077b6] dark:text-[#38bdf8]">
              {formatPrice(vehicle.price_per_day)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/day</span>
          </div>
        </div>
      </div>

      {/* Full-Width Transparent Booking Button Ending at Card Edge */}
      <button
        disabled={!isAvailable}
        onClick={() => onBookClick && onBookClick(vehicle)}
        className={`w-full py-3.5 px-4 border-t font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 group/btn btn-tactile ${
          isAvailable
            ? 'border-slate-200 dark:border-slate-800 bg-transparent hover:bg-[#0077b6] dark:hover:bg-[#0077b6] text-[#0077b6] dark:text-[#38bdf8] hover:text-white dark:hover:text-white cursor-pointer'
            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 cursor-not-allowed'
        }`}
      >
        <span>
          {vehicle.status === 'available'
            ? 'Book Vehicle Now'
            : vehicle.status === 'maintenance'
            ? 'Under Maintenance'
            : 'Currently Reserved'}
        </span>
        {isAvailable && (
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-200" />
        )}
      </button>
    </div>
  );
};
