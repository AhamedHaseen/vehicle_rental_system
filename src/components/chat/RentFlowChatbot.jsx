import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { AIChatService } from '../../services/aiChatService';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Calendar,
  Users,
  Check,
  ArrowRight,
  ExternalLink,
  MapPin
} from 'lucide-react';

const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    native: 'English',
    greeting: "👋 Welcome to **RentFlow AI**.\n\nI can help you browse available vehicles, book rentals in Sri Lankan Rupees (**Rs.**), track existing bookings, or answer rental policy questions.",
    inputPlaceholder: "Type your message or ask about cars...",
    chips: [
      { label: 'Book a Car via AI', query: 'I want to book a car' },
      { label: 'Available Fleet', query: 'Show available cars' },
      { label: 'Rates & Deposit', query: 'What is the security deposit?' },
      { label: 'Track Booking', query: 'Check my booking status' }
    ],
    labels: {
      status: "Online • Sri Lanka",
      perDay: "/day",
      perHour: "/hr",
      instantBook: "Book via AI",
      viewSpecs: "Details",
      bookFormTitle: "AI Booking Reservation",
      pickupDate: "Pickup Date",
      returnDate: "Return Date",
      hubLocation: "Pickup & Return Hub",
      chauffeur: "Include Chauffeur (+Rs. 4,500/day)",
      summaryRental: "Rental Fee:",
      summaryDeposit: "Refundable Deposit:",
      estimatedTotal: "Total Amount:",
      confirmBtn: "Confirm Booking",
      confirming: "Processing booking...",
      passTitle: "Booking Confirmed",
      viewInBookings: "View in My Bookings",
      inquiryTitle: "Leave an Inquiry",
      submitInquiryBtn: "Submit Inquiry"
    }
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    native: 'தமிழ்',
    greeting: "👋 **RentFlow AI** உதவி மையத்திற்கு நல்வரவு.\n\nநீங்கள் இலங்கை ரூபாவில் (**Rs.**) வாகனங்களை முன்பதிவு செய்யலாம், கிடைக்கும் வாகனங்களை அறியலாம் அல்லது உங்கள் முன்பதிவை சரிபார்க்கலாம்.",
    inputPlaceholder: "செய்தியை தட்டச்சு செய்க அல்லது வினவுக...",
    chips: [
      { label: 'வாகனம் முன்பதிவு', query: 'வாகனம் முன்பதிவு செய்ய வேண்டும்' },
      { label: 'கிடைக்கும் வாகனங்கள்', query: 'கிடைக்கும் கார்களைக் காட்டு' },
      { label: 'வைப்புத்தொகை விபரம்', query: 'பிணை வைப்புத்தொகை எவ்வளவு?' },
      { label: 'முன்பதிவு நிலை', query: 'எனது முன்பதிவை சரிபார்க்க' }
    ],
    labels: {
      status: "நேரலை • இலங்கை",
      perDay: "/நாள்",
      perHour: "/மணி",
      instantBook: "முன்பதிவு செய்க",
      viewSpecs: "விபரம்",
      bookFormTitle: "நேரடி AI முன்பதிவு",
      pickupDate: "பெறும் திகதி",
      returnDate: "ஒப்படைக்கும் திகதி",
      hubLocation: "நிலையம்",
      chauffeur: "சாரதியுடன் (+ரூ. 4,500/நாள்)",
      summaryRental: "வாடகைக் கட்டணம்:",
      summaryDeposit: "மீளளிக்கப்படும் வைப்புத்தொகை:",
      estimatedTotal: "மொத்தக் கட்டணம்:",
      confirmBtn: "முன்பதிவை உறுதி செய்க",
      confirming: "முன்பதிவு செய்யப்படுகிறது...",
      passTitle: "முன்பதிவு உறுதி செய்யப்பட்டது",
      viewInBookings: "எனது முன்பதிவுகளில் பார்க்க",
      inquiryTitle: "விசாரணை படிவம்",
      submitInquiryBtn: "விசாரணையை அனுப்புக"
    }
  },
  si: {
    code: 'si',
    name: 'Sinhala',
    native: 'සිංහල',
    greeting: "👋 **RentFlow AI** සහායක වෙත සාදරයෙන් පිළිගනිමු.\n\nඔබට ශ්‍රී ලංකා රුපියල් වලින් (**Rs.**) වාහන වෙන්කරවා ගත හැක, පවතින වාහන සොයාගත හැක සහ ඔබගේ වෙන්කිරීම් පරීක්ෂා කළ හැක.",
    inputPlaceholder: "පණිවිඩයක් හෝ ප්‍රශ්නයක් ඇතුළත් කරන්න...",
    chips: [
      { label: 'වාහනයක් වෙන්කරන්න', query: 'මට වාහනයක් වෙන්කරන්න ඕනෙ' },
      { label: 'පවතින වාහන', query: 'පවතින වාහන පෙන්වන්න' },
      { label: 'ඇප තැන්පතු විස්තර', query: 'ඇප තැන්පතුව කීයද?' },
      { label: 'වෙන්කිරීම් පරීක්ෂාව', query: 'මගේ වෙන්කිරීම පරීක්ෂා කරන්න' }
    ],
    labels: {
      status: "සක්‍රීයයි • ශ්‍රී ලංකා",
      perDay: "/දිනකට",
      perHour: "/පැයකට",
      instantBook: "වෙන්කරන්න",
      viewSpecs: "විස්තර",
      bookFormTitle: "සෘජු AI වෙන්කිරීම",
      pickupDate: "ලබාගන්නා දිනය",
      returnDate: "ආපසු භාරදෙන දිනය",
      hubLocation: "ස්ථානය",
      chauffeur: "රියදුරු සමඟ (+රු. 4,500/දිනකට)",
      summaryRental: "කුලී ගාස්තුව:",
      summaryDeposit: "ආපසු ගෙවන ඇප තැන්පතුව:",
      estimatedTotal: "මුළු මුදල:",
      confirmBtn: "වෙන්කිරීම තහවුරු කරන්න",
      confirming: "තහවුරු වෙමින් පවතී...",
      passTitle: "වෙන්කිරීම සාර්ථකයි",
      viewInBookings: "මගේ වෙන්කිරීම් බලන්න",
      inquiryTitle: "විමසීම් පෝරමය",
      submitInquiryBtn: "විමසීම යොමු කරන්න"
    }
  }
};

export const RentFlowChatbot = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [currentLang, setCurrentLang] = useState('en');
  const t = LANGUAGES[currentLang] || LANGUAGES.en;

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: t.greeting,
      suggestedActions: t.chips
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleLanguageChange = (langKey) => {
    setCurrentLang(langKey);
    const newT = LANGUAGES[langKey] || LANGUAGES.en;
    setMessages(prev => [
      ...prev,
      {
        id: `lang-switch-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `**${newT.native}**\n\n${newT.greeting}`,
        suggestedActions: newT.chips
      }
    ]);
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await AIChatService.processMessage(text, { user, lang: currentLang });

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.text,
        type: response.type,
        vehicle: response.vehicle,
        vehicles: response.vehicles,
        booking: response.booking,
        prefill: response.prefill,
        suggestedActions: response.suggestedActions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "Sorry, a temporary network error occurred. Please try again.",
          suggestedActions: t.chips
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: t.greeting,
        suggestedActions: t.chips
      }
    ]);
  };

  const handleInitiateAIBooking = (vehicle) => {
    const bookingMessage = {
      id: `ai-book-${Date.now()}`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'ai_booking_flow',
      vehicle,
      text: `${t.labels.bookFormTitle}: **${vehicle.brand} ${vehicle.model || vehicle.name}**`,
      prefill: {
        customer_name: user?.full_name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || ''
      }
    };
    setMessages(prev => [...prev, bookingMessage]);
  };

  const handleConfirmAIBooking = async (bookingData, msgId) => {
    try {
      const created = await AIChatService.confirmAIBooking({
        ...bookingData,
        customer_id: user?.id || null
      });

      success('Reservation Confirmed', `Booking ${created.booking_code || created.id} recorded successfully!`);

      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? {
                ...m,
                type: 'ai_booking_success',
                text: `**${t.labels.passTitle}**\n\nReference: \`${created.booking_code || created.id}\``,
                booking: created
              }
            : m
        )
      );
    } catch (err) {
      toastError('Booking Error', err.message);
    }
  };

  const handleInlineInquirySubmit = async (formData, msgId) => {
    try {
      await AIChatService.submitInquiry(formData);
      success('Inquiry Submitted', 'Our coordinator will contact you shortly.');

      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? {
                ...m,
                type: 'inquiry_success',
                text: `✅ **Inquiry Submitted**\n\nThank you, **${formData.name}**. We will contact you at **${formData.email}** or **${formData.phone}**.`
              }
            : m
        )
      );
    } catch (err) {
      toastError('Submission Error', err.message);
    }
  };

  const renderFormattedText = (raw) => {
    if (!raw) return null;
    const parts = raw.split('\n');

    return (
      <div className="space-y-1 leading-relaxed text-[13px]">
        {parts.map((paragraph, idx) => {
          if (!paragraph.trim()) return <div key={idx} className="h-0.5" />;

          const isBullet = paragraph.trim().startsWith('* ') || paragraph.trim().startsWith('- ');
          const lineContent = isBullet ? paragraph.trim().slice(2) : paragraph;

          const formatted = lineContent.split(/(\*\*.*?\*\*|\`.*?\`)/g).map((segment, sIdx) => {
            if (segment.startsWith('**') && segment.endsWith('**')) {
              return <strong key={sIdx} className="font-semibold text-slate-900 dark:text-slate-100">{segment.slice(2, -2)}</strong>;
            }
            if (segment.startsWith('`') && segment.endsWith('`')) {
              return <code key={sIdx} className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-750 text-[#0077b6] dark:text-[#38bdf8] font-mono text-[11px]">{segment.slice(1, -1)}</code>;
            }
            return segment;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-[#0077b6] mt-1 text-[8px]">•</span>
                <span>{formatted}</span>
              </div>
            );
          }

          return <p key={idx}>{formatted}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Launcher Button - Simple, using only message icon and name */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0077b6] hover:bg-[#023e8a] text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 text-xs font-semibold"
          aria-label="Open Chat"
        >
          <MessageSquare className="w-4 h-4 text-white" />
          <span>RentFlow AI</span>
        </button>
      )}

      {/* Chat Window Modal - Simple, Professional, Fixed Size (No Maximize Gimmick) */}
      {isOpen && (
        <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-200 w-[92vw] sm:w-[410px] h-[580px] max-h-[82vh]">
          {/* Professional Clean Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white select-none border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0077b6] flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">RentFlow AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{t.labels.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Clean Language Segmented Switcher */}
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px]">
                {Object.values(LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      currentLang === lang.code
                        ? 'bg-[#0077b6] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Reset */}
              <button
                onClick={handleResetChat}
                title="Restart chat"
                className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble */}
                <div
                  className={`max-w-[88%] rounded-xl p-3 shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0077b6] text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  {/* Vehicle Recommendations Card List */}
                  {msg.vehicles && msg.vehicles.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      {msg.vehicles.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-left"
                        >
                          <img
                            src={v.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
                            alt={v.name}
                            className="w-16 h-12 object-cover rounded-md bg-slate-200 dark:bg-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                                {v.brand} {v.model || v.name}
                              </h4>
                              <span className="text-[11px] font-bold text-[#0077b6] dark:text-[#38bdf8] shrink-0">
                                {formatPrice(v.price_per_day)}{t.labels.perDay}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{v.seats || 5}</span>
                              <span>•</span>
                              <span className="capitalize">{v.transmission || 'Auto'}</span>
                              <span>•</span>
                              <span className="capitalize">{v.fuel_type || 'Petrol'}</span>
                            </div>

                            <div className="mt-1.5 flex items-center gap-1.5">
                              <button
                                onClick={() => handleInitiateAIBooking(v)}
                                className="flex-1 py-1 px-2 bg-[#0077b6] hover:bg-[#023e8a] text-white rounded-md font-semibold text-[10px] transition-colors"
                              >
                                {t.labels.instantBook}
                              </button>
                              <button
                                onClick={() => {
                                  setIsOpen(false);
                                  navigate(`/vehicles/${v.id}`);
                                }}
                                className="py-1 px-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-[10px] transition-colors"
                              >
                                {t.labels.viewSpecs}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* In-Chat Booking Checkout Form */}
                  {msg.type === 'ai_booking_flow' && msg.vehicle && (
                    <AIBookingForm
                      vehicle={msg.vehicle}
                      prefill={msg.prefill || {}}
                      user={user}
                      t={t}
                      formatPrice={formatPrice}
                      onConfirm={(data) => handleConfirmAIBooking(data, msg.id)}
                    />
                  )}

                  {/* Booking Confirmed Card */}
                  {msg.type === 'ai_booking_success' && msg.booking && (
                    <div className="mt-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-2 text-left">
                      <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200 dark:border-emerald-800/60">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          {t.labels.passTitle}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#0077b6] dark:text-[#38bdf8]">
                          {msg.booking.booking_code || msg.booking.id}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {msg.booking.vehicle_name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(msg.booking.start_date).toLocaleDateString()} → {new Date(msg.booking.end_date).toLocaleDateString()} ({msg.booking.duration_days} Days)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {msg.booking.pickup_location}
                        </p>
                        <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                          <span>Total:</span>
                          <span className="text-[#0077b6] dark:text-[#38bdf8]">{formatPrice(msg.booking.total_amount)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/my-bookings');
                        }}
                        className="w-full py-1.5 bg-[#0077b6] text-white hover:bg-[#023e8a] rounded-md font-semibold text-xs transition-colors"
                      >
                        {t.labels.viewInBookings}
                      </button>
                    </div>
                  )}

                  {/* Booking Status Card */}
                  {msg.booking && msg.type !== 'ai_booking_success' && (
                    <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-[#0077b6] dark:text-[#38bdf8]">
                          {msg.booking.booking_code || msg.booking.booking_reference || msg.booking.id}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400">
                          {msg.booking.booking_status || msg.booking.status || 'Active'}
                        </span>
                      </div>
                      {msg.booking.vehicle && (
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {msg.booking.vehicle.brand} {msg.booking.vehicle.model || msg.booking.vehicle.name}
                        </p>
                      )}
                      <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-1 text-xs">
                        <span>Total:</span>
                        <span>{formatPrice(msg.booking.total_amount || msg.booking.total_price)}</span>
                      </div>
                    </div>
                  )}

                  {/* Inquiry Form */}
                  {msg.type === 'inquiry_form' && (
                    <InquiryForm
                      prefill={msg.prefill || {}}
                      t={t}
                      onSubmit={(data) => handleInlineInquirySubmit(data, msg.id)}
                    />
                  )}
                </div>

                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Suggested Chips */}
                {msg.suggestedActions && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => {
                          if (action.link) {
                            setIsOpen(false);
                            navigate(action.link);
                          } else {
                            handleSendMessage(action.query);
                          }
                        }}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:border-[#0077b6] hover:text-[#0077b6] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <div className="w-4 h-4 border-2 border-[#0077b6] border-t-transparent rounded-full animate-spin" />
                <span className="italic text-[11px]">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 bg-[#0077b6] hover:bg-[#023e8a] disabled:opacity-40 text-white rounded-xl transition-colors"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Clean Professional Inquiry Form
const InquiryForm = ({ prefill = {}, t, onSubmit }) => {
  const [name, setName] = useState(prefill.name || '');
  const [email, setEmail] = useState(prefill.email || '');
  const [phone, setPhone] = useState(prefill.phone || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: 'Chatbot Direct Inquiry',
        message: message.trim()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2 text-left">
      <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
        {t.labels.inquiryTitle}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name *"
          required
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email *"
          required
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100"
        />
      </div>

      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone (+94...)"
        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100"
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your message / requirements *"
        rows={2}
        required
        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100 resize-none"
      />

      <button
        type="submit"
        disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()}
        className="w-full py-1.5 bg-[#0077b6] hover:bg-[#023e8a] disabled:opacity-50 text-white rounded-md font-semibold text-xs transition-colors"
      >
        {t.labels.submitInquiryBtn}
      </button>
    </form>
  );
};

// Clean Professional AI Booking Reservation Form (LKR / Rs.)
const AIBookingForm = ({ vehicle, prefill = {}, user, t, formatPrice, onConfirm }) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(threeDaysLater);
  const [pickupLocation, setPickupLocation] = useState('Bandaranaike Int Airport (BIA / CMB)');
  const [withDriver, setWithDriver] = useState(false);
  const [name, setName] = useState(prefill.customer_name || user?.full_name || '');
  const [email, setEmail] = useState(prefill.customer_email || user?.email || '');
  const [phone, setPhone] = useState(prefill.customer_phone || user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(end - start, 86400000);
  const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const dailyRate = Number(vehicle?.price_per_day || 15000);
  const driverDailyRate = 4500;
  const driverCost = withDriver ? driverDailyRate * durationDays : 0;
  const basePrice = (dailyRate * durationDays) + driverCost;
  const securityDeposit = 25000;
  const totalAmount = basePrice + securityDeposit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        vehicle_id: vehicle.id,
        vehicle_name: `${vehicle.brand} ${vehicle.model || vehicle.name}`,
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        start_date: startDate,
        end_date: endDate,
        duration_days: durationDays,
        base_price: basePrice,
        security_deposit: securityDeposit,
        total_amount: totalAmount,
        booking_status: 'confirmed',
        payment_status: 'pending',
        pickup_location: pickupLocation,
        return_location: pickupLocation,
        with_driver: withDriver
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2.5 text-left">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-700">
        <img
          src={vehicle.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
          alt={vehicle.name}
          className="w-14 h-10 object-cover rounded-md bg-slate-200 dark:bg-slate-800 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
            {vehicle.brand} {vehicle.model || vehicle.name}
          </h4>
          <span className="text-xs font-bold text-[#0077b6] dark:text-[#38bdf8]">
            {formatPrice(dailyRate)}{t.labels.perDay}
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-0.5">{t.labels.pickupDate}</label>
          <input
            type="date"
            value={startDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-0.5">{t.labels.returnDate}</label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Hub Location */}
      <div>
        <label className="block text-slate-600 dark:text-slate-400 font-semibold text-[10px] mb-0.5">{t.labels.hubLocation}</label>
        <select
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs text-slate-900 dark:text-slate-100"
        >
          <option value="Bandaranaike Int Airport (BIA / CMB)">Bandaranaike Int Airport (BIA / CMB)</option>
          <option value="Colombo Flagship Hub (Galle Face)">Colombo Flagship Hub (Galle Face)</option>
          <option value="Galle Coastal Depot">Galle Coastal Depot</option>
          <option value="Kandy Hill Station Terminal">Kandy Hill Station Terminal</option>
        </select>
      </div>

      {/* Chauffeur Toggle */}
      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={withDriver}
          onChange={(e) => setWithDriver(e.target.checked)}
          className="rounded text-[#0077b6] w-3.5 h-3.5"
        />
        <span>{t.labels.chauffeur}</span>
      </label>

      {/* Contact Details */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Legal Name *"
          required
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs text-slate-900 dark:text-slate-100"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (+94...)"
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs text-slate-900 dark:text-slate-100"
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address *"
        required
        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs text-slate-900 dark:text-slate-100"
      />

      {/* Summary */}
      <div className="p-2 bg-white dark:bg-slate-800 rounded-md text-xs space-y-1 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between">
          <span>{durationDays} Days Rental:</span>
          <span>{formatPrice(basePrice)}</span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>Deposit (Refundable):</span>
          <span>{formatPrice(securityDeposit)}</span>
        </div>
        <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
          <span>Total Amount:</span>
          <span className="text-[#0077b6] dark:text-[#38bdf8]">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !name.trim() || !email.trim()}
        className="w-full py-2 bg-[#0077b6] hover:bg-[#023e8a] disabled:opacity-50 text-white rounded-md font-semibold text-xs transition-colors"
      >
        {isSubmitting ? t.labels.confirming : t.labels.confirmBtn}
      </button>
    </form>
  );
};
