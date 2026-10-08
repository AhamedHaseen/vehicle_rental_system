import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Fuel, Gauge, Zap, Shield, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useCurrency } from '../../context/CurrencyContext';

export const VehicleCard = ({ vehicle, onBookClick }) => {
  const { formatPrice } = useCurrency();
  const isAvailable = vehicle.status === 'available';

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 flex flex-col group">
      {/* Vehicle Media Header */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={vehicle.image_url}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
            {vehicle.category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <Badge status={vehicle.status} />
        </div>

        {/* Bottom Registration overlay */}
        <div className="absolute bottom-2.5 left-3 text-[11px] font-mono text-slate-300 bg-slate-950/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
          {vehicle.registration_no}
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">{vehicle.brand}</p>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                {vehicle.model}
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60">
              {vehicle.year}
            </span>
          </div>

          {/* Quick Specs Pill Row */}
          <div className="grid grid-cols-3 gap-2 my-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{vehicle.seats} Seats</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <Fuel className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{vehicle.fuel_type}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{vehicle.transmission}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Call to Action */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Daily Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-amber-400">
                {formatPrice(vehicle.price_per_day)}
              </span>
              <span className="text-xs text-slate-400">/day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/vehicle/${vehicle.id}`}>
              <Button variant="ghost" size="sm" className="text-xs">
                Specs
              </Button>
            </Link>
            <Button
              variant={isAvailable ? 'primary' : 'secondary'}
              size="sm"
              disabled={!isAvailable}
              onClick={() => onBookClick && onBookClick(vehicle)}
            >
              {isAvailable ? 'Book' : 'Reserved'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
