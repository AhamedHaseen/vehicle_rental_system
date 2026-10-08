import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  getVehicleById, getReviews 
} from '../../services/dataService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { BookingModal } from '../../components/customer/BookingModal';
import { useCurrency } from '../../context/CurrencyContext';
import { 
  Shield, ArrowLeft, Star, 
  MapPin, CheckCircle2, ChevronRight, Clock, Award 
} from 'lucide-react';

export const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const v = await getVehicleById(id);
      if (!isMounted) return;
      setVehicle(v);
      if (v) {
        setActiveImage(v.image_url);
        const rList = await getReviews(v.id);
        if (isMounted) setReviews(rList);
      }
      if (isMounted) setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">Vehicle Not Found</h2>
        <p className="text-xs text-slate-400">The vehicle with id "{id}" could not be located in our fleet.</p>
        <Link to="/catalog">
          <Button variant="primary" size="sm">Browse Fleet</Button>
        </Link>
      </div>
    );
  }

  const isAvailable = vehicle.status === 'available';
  const gallery = vehicle.gallery_urls?.length > 0 ? vehicle.gallery_urls : [vehicle.image_url];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/catalog" className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
          <ArrowLeft className="w-3.5 h-3.5" /> Fleet
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <span className="text-slate-600 dark:text-slate-400">{vehicle.category}</span>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <span className="text-slate-900 dark:text-slate-200 font-semibold">{vehicle.brand} {vehicle.model}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Media Gallery & Technical Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Visual Media Display */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-2 space-y-3">
            <div className="relative h-[360px] sm:h-[440px] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img
                src={activeImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                  {vehicle.category}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <Badge status={vehicle.status} />
              </div>
            </div>

            {/* Thumbnail Row */}
            {gallery.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 px-1">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeImage === img ? 'border-amber-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Title & Description */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">{vehicle.brand}</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {vehicle.model} ({vehicle.year})
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{vehicle.registration_no}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> {vehicle.location || 'Colombo Flagship Hub'}
                  </span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Daily Rental Rate</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                  {formatPrice(vehicle.price_per_day)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/day</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800">
              {vehicle.description || "Fully inspected vehicle maintained to the highest safety and cleanliness standards. Ready for city touring, corporate transit, or highway expeditions."}
            </p>

            {/* Features Tags */}
            {vehicle.features?.length > 0 && (
              <div className="pt-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Key Equipment & Features</h4>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feat, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Specifications Bento Grid */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Technical Specifications</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Engine / Powertrain</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                  {vehicle.specs?.engine || `${vehicle.fuel_type} Engine`}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Max Power Output</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                  {vehicle.specs?.power || 'Factory Calibrated'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Transmission</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                  {vehicle.transmission}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Fuel Efficiency</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                  {vehicle.specs?.consumption || vehicle.specs?.mileage || 'Economical'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Seating Capacity</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                  {vehicle.seats} Passengers
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Odometer Reading</span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-1 block">
                  {vehicle.odometer_km ? `${vehicle.odometer_km.toLocaleString()} KM` : 'Under 25,000 KM'}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Reviews */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Customer Ratings & Reviews</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">{reviews.length} submitted</span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 italic">
                No reviews yet for this vehicle. Be the first to rent and share your journey!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{r.customer_name}</span>
                      <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">"{r.comment}"</p>
                    <span className="text-[10px] text-slate-500 block">{r.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Instant Booking Action Card & Rental Policies */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 sticky top-24 space-y-6 shadow-2xl">
            <div>
              <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Pricing Summary</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {formatPrice(vehicle.price_per_day)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/day</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Hourly rate: {formatPrice(vehicle.price_per_hour || 1200)}/hr (minimum 4 hours)
              </p>
            </div>

            <div className="space-y-3 py-4 border-y border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Security Deposit (Refundable)</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{formatPrice(vehicle.security_deposit || 20000)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Fuel Policy</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Full-to-Full</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Included Mileage</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Unlimited Islandwide</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Cancellation</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Free up to 24h</span>
              </div>
            </div>

            <Button
              variant={isAvailable ? 'primary' : 'secondary'}
              size="lg"
              disabled={!isAvailable}
              className="w-full text-base font-bold shadow-lg shadow-amber-500/20"
              onClick={() => setIsBookingOpen(true)}
            >
              {isAvailable ? 'Proceed to Reservation' : 'Currently Rented Out'}
            </Button>

            {/* Trust highlights */}
            <div className="space-y-2.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Comprehensive damage waiver included option</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>24/7 Islandwide roadside recovery network</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Guaranteed model reserved — no bait-and-switch</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          vehicle={vehicle}
          onBookingSuccess={() => navigate('/my-bookings')}
        />
      )}
    </div>
  );
};
