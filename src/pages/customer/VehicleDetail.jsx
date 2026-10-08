import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  getVehicleById, getReviews, addReview, createBooking 
} from '../../services/dataService';
import confetti from 'canvas-confetti';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Shield, ArrowLeft, Star, 
  MapPin, CheckCircle2, ChevronRight, Clock, Award,
  Send, MessageSquarePlus, Calendar, User, Phone, UserCheck, Car
} from 'lucide-react';

const HUBS = [
  "Colombo Flagship Hub (45 Galle Face Terrace)",
  "Bandaranaike International Airport (CMB Terminal)",
  "Kandy Hill Station Hub",
  "Galle Coastal Express Hub"
];

export const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  // Default dates: tomorrow to +3 days
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const threeDaysLater = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  }, []);

  // Inline Reservation Form State
  const [customerName, setCustomerName] = useState(user?.full_name || 'Kamal Perera');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+94 77 123 4567');
  const [driverOption, setDriverOption] = useState('without_driver'); // 'without_driver' | 'with_driver'
  const [startDate, setStartDate] = useState(tomorrow);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(threeDaysLater);
  const [endTime, setEndTime] = useState('18:00');
  const [pickupLocation, setPickupLocation] = useState(HUBS[0]);
  const [returnLocation, setReturnLocation] = useState(HUBS[0]);
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Online Portal');
  const [notes, setNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Review & Rating State
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

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
        <div className="w-12 h-12 border-4 border-[#0077b6]/20 border-t-[#0077b6] dark:border-[#023e8a]/20 dark:border-t-[#38bdf8] rounded-full animate-spin mx-auto" />
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

  const isBookable = vehicle.status !== 'maintenance';
  const gallery = vehicle.gallery_urls?.length > 0 ? vehicle.gallery_urls : [vehicle.image_url];

  // Inline Booking Calculations
  const startObj = new Date(`${startDate}T${startTime}`);
  const endObj = new Date(`${endDate}T${endTime}`);
  const diffHours = Math.max(24, (endObj - startObj) / (1000 * 60 * 60));
  const durationDays = Math.max(1, Math.ceil(diffHours / 24));

  const driverDailyRate = 2500;
  const driverFee = driverOption === 'with_driver' ? durationDays * driverDailyRate : 0;
  const basePrice = durationDays * Number(vehicle.price_per_day || 0);
  const insurancePerDay = 2000;
  const insuranceFee = includeInsurance ? durationDays * insurancePerDay : 0;
  const securityDeposit = Number(vehicle.security_deposit || 20000);
  const tax = Math.round((basePrice + driverFee) * 0.025);
  const totalAmount = basePrice + driverFee + insuranceFee + tax;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (endObj <= startObj) {
      error('Invalid Dates', 'Return date must be after pickup date.');
      return;
    }

    if (!customerName.trim()) {
      error('Contact Details Required', 'Please enter your full name for the booking.');
      return;
    }

    if (!customerPhone.trim()) {
      error('Contact Details Required', 'Please enter your contact phone number.');
      return;
    }

    const bookingUser = user || {
      id: 'user-cust-001',
      full_name: customerName.trim(),
      email: 'kamal@example.com',
      phone: customerPhone.trim(),
      role: 'customer'
    };

    setIsSubmittingBooking(true);
    try {
      const newBooking = await createBooking({
        customer_id: bookingUser.id,
        customer_name: customerName.trim(),
        customer_email: user?.email || 'customer@rentflow.lk',
        customer_phone: customerPhone.trim(),
        driver_option: driverOption,
        driver_fee: driverFee,
        vehicle_id: vehicle.id,
        vehicle_name: `${vehicle.brand} ${vehicle.model} (${vehicle.registration_no})`,
        start_date: startObj.toISOString(),
        end_date: endObj.toISOString(),
        duration_days: durationDays,
        base_price: basePrice,
        insurance_fee: insuranceFee,
        security_deposit: securityDeposit,
        additional_charges: tax,
        total_amount: totalAmount,
        pickup_location: pickupLocation,
        return_location: returnLocation,
        pickup_notes: notes,
        payment_status: paymentMethod === 'Cash at Pickup' ? 'pending' : 'paid',
        payment_method: paymentMethod
      });

      try {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      } catch {
        // confetti fallback
      }

      success('Reservation Confirmed!', `Booking ${newBooking.booking_code} created successfully.`);
      navigate('/my-bookings');
    } catch (err) {
      error('Booking Failed', err.message || 'Could not complete reservation.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/catalog" className="hover:text-[#0077b6] dark:hover:text-[#38bdf8] flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
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
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase bg-slate-950/80 backdrop-blur-md text-[#38bdf8] border border-[#023e8a]/40">
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
                    className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${activeImage === img ? 'border-[#0077b6] dark:border-[#38bdf8] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
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
                <span className="text-xs font-bold text-[#0077b6] dark:text-[#38bdf8] uppercase tracking-widest">{vehicle.brand}</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {vehicle.model} ({vehicle.year})
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{vehicle.registration_no}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8]" /> {vehicle.location || 'Colombo Flagship Hub'}
                  </span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Daily Rental Rate</span>
                <span className="text-2xl sm:text-3xl font-black text-[#0077b6] dark:text-[#38bdf8]">
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
                <span className="text-xs font-mono font-bold text-[#023e8a] dark:text-[#38bdf8] mt-1 block">
                  {vehicle.odometer_km ? `${vehicle.odometer_km.toLocaleString()} KM` : 'Under 25,000 KM'}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Reviews & Interactive Feedback Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Customer Ratings & Reviews</span>
                  {reviews.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {(reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviews.length).toFixed(1)} / 5.0
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verified renter impressions ({reviews.length} feedback submissions)
                </p>
              </div>

              <Button
                variant={showReviewForm ? "secondary" : "outline"}
                size="sm"
                icon={MessageSquarePlus}
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? "Close Form" : "Add Rating & Feedback"}
              </Button>
            </div>

            {/* Interactive Add Review Form */}
            {showReviewForm && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!reviewComment.trim()) {
                    error('Feedback Required', 'Please share your driving experience or feedback.');
                    return;
                  }

                  setIsSubmittingReview(true);
                  try {
                    const reviewer = reviewerName.trim() || user?.full_name || 'Verified Renter';
                    const newRev = {
                      vehicle_id: vehicle.id,
                      customer_name: reviewer,
                      rating: Number(newRating),
                      comment: reviewComment.trim()
                    };
                    await addReview(newRev);
                    const freshReviews = await getReviews(vehicle.id);
                    setReviews(freshReviews);
                    setReviewComment('');
                    setShowReviewForm(false);
                    success('Review Published!', 'Thank you! Your feedback and star rating have been added.');
                  } catch (err) {
                    error('Submission Failed', err.message || 'Could not post your review.');
                  } finally {
                    setIsSubmittingReview(false);
                  }
                }}
                className="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Share Your Experience
                  </h4>
                  <span className="text-[11px] font-semibold text-[#0077b6] dark:text-[#38bdf8]">
                    {newRating === 5 ? '5 Stars - Outstanding' : newRating === 4 ? '4 Stars - Very Good' : newRating === 3 ? '3 Stars - Good' : newRating === 2 ? '2 Stars - Fair' : '1 Star - Poor'}
                  </span>
                </div>

                {/* 5-Star Interactive Rating Picker */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Your Rating (Click to Select)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || newRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewRating(star)}
                          className="p-1 rounded-lg hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                          title={`${star} Star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${isFilled
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                              }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reviewer Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder={user?.full_name || 'e.g. Kamal Perera'}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                  />
                </div>

                {/* Feedback Comment */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Feedback & Comments
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe pickup condition, ride comfort, engine responsiveness, AC cooling, or fuel efficiency..."
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={Send}
                    isLoading={isSubmittingReview}
                  >
                    Publish Vehicle Feedback
                  </Button>
                </div>
              </form>
            )}

            {/* Existing Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center py-6 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <p className="text-xs text-slate-500 italic">
                  No reviews yet for this vehicle. Be the first to share your rental feedback!
                </p>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className="text-xs text-[#0077b6] dark:text-[#38bdf8] font-bold hover:underline"
                >
                  + Write the first review
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{r.customer_name}</span>
                      <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                        {[...Array(Number(r.rating || 5))].map((_, i) => (
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

        {/* Right 1 Column: Instant Inline Reservation Form & Pricing */}
        <div className="space-y-6">
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/95 lg:sticky lg:top-24 space-y-5 shadow-xl">
            {/* Header / Pricing */}
            <div className="flex items-baseline justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">Daily Rental</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#0077b6] dark:text-[#38bdf8]">
                    {formatPrice(vehicle.price_per_day)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/day</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hourly Rate</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {formatPrice(vehicle.price_per_hour || 1200)}/hr
                </span>
              </div>
            </div>

            {/* If vehicle is not bookable */}
            {!isBookable ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-center space-y-2">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {vehicle.status === 'maintenance' ? 'Vehicle is currently under maintenance.' : 'Vehicle is currently reserved.'}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Please explore other vehicles in our fleet or contact station hubs for reservation queue.
                </p>
              </div>
            ) : (
              /* Inline Booking Form */
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                {/* Duration Pill */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0077b6]/10 dark:bg-[#023e8a]/20 border border-[#0077b6]/25 text-xs text-[#0077b6] dark:text-[#38bdf8] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Duration: <strong className="text-slate-900 dark:text-white">{durationDays} {durationDays === 1 ? 'Day' : 'Days'}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {startDate} &rarr; {endDate}
                  </span>
                </div>

                {/* Contact Information */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8]" />
                    <span>Primary Contact Details</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Kamal Perera"
                          required
                          className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="e.g. +94 77 123 4567"
                          required
                          className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Preference (With Driver vs Without Driver) */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      <UserCheck className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8]" />
                      <span>Driver Option</span>
                    </div>
                    {driverOption === 'with_driver' && (
                      <span className="text-[10px] font-bold text-[#0077b6] dark:text-[#38bdf8] bg-[#0077b6]/10 dark:bg-[#023e8a]/20 px-2 py-0.5 rounded-full">
                        +{formatPrice(driverDailyRate)}/day
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDriverOption('without_driver')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        driverOption === 'without_driver'
                          ? 'border-[#0077b6] bg-[#0077b6]/10 dark:bg-[#023e8a]/25 text-[#0077b6] dark:text-[#38bdf8] ring-1 ring-[#0077b6]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 font-bold text-xs text-slate-900 dark:text-white">
                        <Car className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8]" />
                        <span>Without Driver</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        Self-drive rental. Valid license required.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDriverOption('with_driver')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        driverOption === 'with_driver'
                          ? 'border-[#0077b6] bg-[#0077b6]/10 dark:bg-[#023e8a]/25 text-[#0077b6] dark:text-[#38bdf8] ring-1 ring-[#0077b6]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 font-bold text-xs text-slate-900 dark:text-white">
                        <UserCheck className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8]" />
                        <span>With Driver</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        Professional chauffeur service included.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Pickup Schedule */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8]" />
                    <span>Pickup Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Date</label>
                      <input
                        type="date"
                        value={startDate}
                        min={tomorrow}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Pickup Station Hub</label>
                    <select
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
                    >
                      {HUBS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Return Schedule */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#38bdf8]" />
                    <span>Return Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Date</label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Return Station Hub</label>
                    <select
                      value={returnLocation}
                      onChange={(e) => setReturnLocation(e.target.value)}
                      className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
                    >
                      {HUBS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Insurance Protection Toggle */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                        CDW Plus Damage Waiver
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        Zero deductible on scrapes & roadside (+{formatPrice(insurancePerDay)}/day)
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={includeInsurance}
                      onChange={(e) => setIncludeInsurance(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0077b6]"></div>
                  </label>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Online Portal', 'Credit Card', 'Cash at Pickup'].map((method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`h-9 px-1 rounded-lg border text-[11px] font-bold transition-all text-center flex items-center justify-center cursor-pointer ${
                          paymentMethod === method
                            ? 'bg-[#0077b6]/15 border-[#0077b6] text-[#0077b6] dark:bg-[#023e8a]/30 dark:border-[#38bdf8] dark:text-[#38bdf8]'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Special Requests (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Flight UL-504 arriving 8am, child seat"
                    className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium"
                  />
                </div>

                {/* Live Price Breakdown */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Base Rental ({durationDays}d × {formatPrice(vehicle.price_per_day)})</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(basePrice)}</span>
                  </div>
                  {driverOption === 'with_driver' && (
                    <div className="flex justify-between text-[#0077b6] dark:text-[#38bdf8] font-medium">
                      <span>Chauffeur Service ({durationDays}d × {formatPrice(driverDailyRate)})</span>
                      <span className="font-bold">{formatPrice(driverFee)}</span>
                    </div>
                  )}
                  {includeInsurance && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>CDW Insurance Coverage</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(insuranceFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Levy & GST (2.5%)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span>Refundable Deposit (Held)</span>
                    <span className="font-bold text-[#0077b6] dark:text-[#38bdf8]">{formatPrice(securityDeposit)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                    <span>Total Payable</span>
                    <span className="text-xl font-black text-[#0077b6] dark:text-[#38bdf8]">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmittingBooking}
                  className="w-full h-12 text-sm font-bold shadow-xl shadow-[#0077b6]/25"
                >
                  Confirm & Reserve Vehicle
                </Button>
              </form>
            )}

            {/* Trust Highlights */}
            <div className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero cancellation fees up to 24h before pickup</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>24/7 Islandwide roadside recovery network</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Guaranteed model reserved — no bait-and-switch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
