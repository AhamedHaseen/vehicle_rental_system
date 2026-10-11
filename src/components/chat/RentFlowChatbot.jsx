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
  MapPin,
  FileText
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
      { label: 'Rates & Deposit', query: 'What are the rates and security deposit?' },
      { label: 'Track Booking', query: 'Track my booking' },
      { label: 'View Bookings', query: 'View my bookings' },
      { label: 'Cancel Booking', query: 'How do I cancel my booking?' },
      { label: 'History', query: 'Show my rental history' }
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
      confirmBtn: "Submit Booking Request",
      confirming: "Submitting request...",
      passTitle: "Reservation Request Submitted",
      pendingNote: "Your booking request is awaiting admin approval. Our team will review and confirm it shortly.",
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
      { label: 'கட்டணம் & வைப்புத்தொகை', query: 'கட்டணம் மற்றும் வைப்புத்தொகை விபரம்' },
      { label: 'முன்பதிவு கண்காணிப்பு', query: 'எனது முன்பதிவை கண்காணிக்க' },
      { label: 'முன்பதிவுகளை பார்க்க', query: 'எனது முன்பதிவுகளை பார்க்க' },
      { label: 'முன்பதிவு ரத்து', query: 'முன்பதிவை ரத்து செய்வது எப்படி?' },
      { label: 'வாடகை வரலாறு', query: 'எனது முந்தைய பயண வரலாறு' }
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
      confirmBtn: "முன்பதிவு கோரிக்கையை அனுப்புக",
      confirming: "கோரிக்கை அனுப்பப்படுகிறது...",
      passTitle: "முன்பதிவு கோரிக்கை அனுப்பப்பட்டது",
      pendingNote: "உங்கள் முன்பதிவு நிர்வாகியின் அனுமதிக்காக காத்திருக்கிறது. விரைவில் உறுதிசெய்யப்படும்.",
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
      { label: 'ගාස්තු සහ ඇප තැන්පතු', query: 'ගාස්තු සහ ඇප තැන්පතුව කීයද?' },
      { label: 'වෙන්කිරීම් පරීක්ෂාව', query: 'මගේ වෙන්කිරීම පරීක්ෂා කරන්න' },
      { label: 'වෙන්කිරීම් බලන්න', query: 'මගේ වෙන්කිරීම් බලන්න' },
      { label: 'වෙන්කිරීම අවලංගු කිරීම', query: 'වෙන්කිරීම අවලංගු කරන්නේ කෙසේද?' },
      { label: 'කුලී ඉතිහාසය', query: 'මගේ කුලී ඉතිහාසය පෙන්වන්න' }
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
      confirmBtn: "වෙන්කිරීමේ ඉල්ලීම යොමු කරන්න",
      confirming: "ඉල්ලීම යොමු වෙමින් පවතී...",
      passTitle: "වෙන්කිරීමේ ඉල්ලීම යොමු කරන ලදී",
      pendingNote: "ඔබගේ වෙන්කිරීම පරිපාලකගේ අනුමැතිය සඳහා පොරොත්තුවෙන් පවතී.",
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
        isAvailable: response.isAvailable,
        alternatives: response.alternatives,
        unavailableVehicle: response.unavailableVehicle,
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

      success('Request Submitted', `Booking request ${created.booking_code || created.id} submitted! Awaiting admin approval.`);

      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? {
                ...m,
                type: 'ai_booking_success',
                text: `**${t.labels.passTitle}**\n\nReference: \`${created.booking_code || created.id}\`\n\n⏳ *Status:* **Pending Admin Approval**\n\n${t.labels.pendingNote}`,
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
          className="flex items-center gap-2.5 px-4.5 py-3 bg-[#0077b6] hover:bg-[#023e8a] text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm font-semibold"
          aria-label="Open Chat"
        >
          <MessageSquare className="w-4.5 h-4.5 text-white" />
          <span>RentFlow AI</span>
        </button>
      )}

      {/* Chat Window Modal - Simple, Professional, Increased Comfortable Size */}
      {isOpen && (
        <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-200 w-[95vw] sm:w-[460px] md:w-[480px] h-[640px] max-h-[88vh]">
          {/* Professional Clean Header */}
          <div className="flex items-center justify-between px-4.5 py-3.5 bg-slate-900 text-white select-none border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0077b6] flex items-center justify-center text-white shadow-sm">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">RentFlow AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">{t.labels.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Clean Language Segmented Switcher */}
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
                {Object.values(LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
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
                className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 text-xs sm:text-[13px] leading-relaxed">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble */}
                <div
                  className={`max-w-[88%] rounded-xl p-3.5 sm:p-4 shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0077b6] text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  {/* Vehicle Recommendations Card List */}
                  {msg.vehicles && msg.vehicles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {/* Interactive Fleet Filter Chips Bar */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                        {[
                          { label: 'All', query: 'Show available cars' },
                          { label: '🚗 Cars', query: 'Show available sedans' },
                          { label: '🚙 SUVs', query: 'Show available SUVs' },
                          { label: '🚐 Vans', query: 'Show available vans' },
                          { label: '🌿 Hybrid', query: 'Show hybrid vehicles' },
                          { label: '💰 Budget', query: 'Show budget cars' }
                        ].map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleSendMessage(chip.query)}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-750 hover:bg-[#0077b6] hover:text-white text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap transition-colors"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>

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
                                onClick={() => handleSendMessage(`Show details of ${v.model || v.brand}`)}
                                className="py-1 px-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-[10px] font-medium transition-colors"
                              >
                                {t.labels.viewSpecs}
                              </button>
                              <button
                                onClick={() => {
                                  setIsOpen(false);
                                  navigate(`/vehicles/${v.id}`);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Open full page"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vehicle Full Technical Specifications & Details Card */}
                  {msg.type === 'vehicle_details' && msg.vehicle && (
                    <VehicleDetailsCard
                      vehicle={msg.vehicle}
                      isAvailable={msg.isAvailable}
                      t={t}
                      formatPrice={formatPrice}
                      onBook={() => handleInitiateAIBooking(msg.vehicle)}
                      onWaitlist={() => handleSendMessage(`Inquiry for unavailable ${msg.vehicle.model || msg.vehicle.brand}`)}
                      onViewFull={() => {
                        setIsOpen(false);
                        navigate(`/vehicles/${msg.vehicle.id}`);
                      }}
                    />
                  )}

                  {/* Responsive Unavailable Vehicle Notice with Alternatives */}
                  {msg.type === 'unavailable_notice' && (
                    <div className="mt-2.5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2 text-left">
                      <div className="flex items-center justify-between pb-1 border-b border-amber-200 dark:border-amber-800/60">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                          ⚠️ Notice: Active Rental
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 uppercase">
                          Currently Rented
                        </span>
                      </div>

                      {msg.vehicles && msg.vehicles.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                            Closest Ready-to-Drive Alternatives:
                          </span>
                          {msg.vehicles.map((v) => (
                            <div key={v.id} className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-[11px]">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
                                {v.brand} {v.model || v.name}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-bold text-[#0077b6]">{formatPrice(v.price_per_day)}</span>
                                <button
                                  onClick={() => handleInitiateAIBooking(v)}
                                  className="px-2 py-0.5 bg-[#0077b6] text-white rounded text-[10px] font-semibold"
                                >
                                  Book
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => handleSendMessage("Submit inquiry")}
                        className="w-full mt-1 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-md font-semibold text-[11px] transition-colors"
                      >
                        📝 Join Priority Waitlist / Request Dispatch
                      </button>
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

                  {/* Booking Status Card (both active lookup and newly submitted AI bookings) */}
                  {msg.booking && (
                    <BookingStatusCard
                      booking={msg.booking}
                      formatPrice={formatPrice}
                      t={t}
                      onViewMyBookings={() => {
                        setIsOpen(false);
                        navigate('/my-bookings');
                      }}
                    />
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

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Suggested Chips */}
                {msg.suggestedActions && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[92%]">
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
                        className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:border-[#0077b6] hover:text-[#0077b6] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors shadow-2xs"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-slate-400 text-xs sm:text-[13px]">
                <div className="w-4 h-4 border-2 border-[#0077b6] border-t-transparent rounded-full animate-spin" />
                <span className="italic text-xs">RentFlow AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-[13px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 flex items-center justify-center bg-[#0077b6] hover:bg-[#023e8a] disabled:opacity-40 text-white rounded-xl transition-colors shrink-0 shadow-sm"
                title="Send"
              >
                <Send className="w-4 h-4" />
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

// Clean High-End Booking Status Card Component
const BookingStatusCard = ({ booking, formatPrice, t, onViewMyBookings }) => {
  if (!booking) return null;

  const rawStatus = (booking.booking_status || booking.status || 'confirmed').toLowerCase();

  const statusConfig = {
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500'
    },
    active: {
      label: 'Active Trip',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500'
    },
    completed: {
      label: 'Completed',
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-500'
    },
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500'
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500'
    }
  };

  const statusInfo = statusConfig[rawStatus] || statusConfig.confirmed;

  const vehicleName = booking.vehicle?.brand 
    ? `${booking.vehicle.brand} ${booking.vehicle.model || booking.vehicle.name}`
    : (booking.vehicle_name || 'Reserved Fleet Vehicle');

  const vehicleImage = booking.vehicle?.image_url || 
    booking.vehicle?.images?.[0] || 
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';

  const startDateStr = booking.start_date 
    ? new Date(booking.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
    : 'Scheduled';
  const endDateStr = booking.end_date 
    ? new Date(booking.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
    : 'Scheduled';

  const isWithDriver = booking.driver_option === 'with_driver' || booking.with_driver;

  return (
    <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-left shadow-sm">
      {/* Top Header: Reference & Status Badge */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
          <span className="text-xs font-mono font-bold text-[#0077b6] dark:text-[#38bdf8] tracking-wide">
            {booking.booking_code || booking.booking_reference || booking.id}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} animate-pulse`} />
          {statusInfo.label}
        </span>
      </div>

      {/* Vehicle Media & Name */}
      <div className="flex items-center gap-3">
        <img
          src={vehicleImage}
          alt={vehicleName}
          className="w-20 h-14 object-cover rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';
          }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
            {vehicleName}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isWithDriver ? '👔 Chauffeur Driven' : '🚗 Self-Drive Rental'}
          </p>
        </div>
      </div>

      {/* Dates & Pickup Location */}
      <div className="bg-white dark:bg-slate-800/80 rounded-lg p-2.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs sm:text-[13px]">
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Dates:</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {startDateStr} → {endDateStr}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Hub:</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[190px]" title={booking.pickup_location}>
            {booking.pickup_location || 'Colombo Flagship Hub'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-700/60 font-bold text-xs sm:text-[13px]">
          <span className="text-slate-600 dark:text-slate-400">Total Price:</span>
          <span className="text-sm font-bold text-[#0077b6] dark:text-[#38bdf8]">
            {formatPrice(booking.total_amount || booking.total_price || 0)}
          </span>
        </div>
      </div>

      {/* Direct My Bookings Action Button */}
      <button
        type="button"
        onClick={onViewMyBookings}
        className="w-full py-2.5 px-3.5 bg-[#0077b6] hover:bg-[#023e8a] active:scale-[0.98] text-white rounded-lg font-semibold text-xs sm:text-[13px] transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        <span>{t.labels.viewInBookings || 'View in My Bookings'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
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
        booking_status: 'pending',
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

// Full Vehicle Technical Specifications & Details Card Component
const VehicleDetailsCard = ({ vehicle, isAvailable, t, formatPrice, onBook, onWaitlist, onViewFull }) => {
  const specs = vehicle.specs || {};
  const features = Array.isArray(vehicle.features) && vehicle.features.length > 0
    ? vehicle.features
    : ['Air Conditioning', 'Bluetooth Audio', 'ABS Brakes', 'Reverse Camera'];

  return (
    <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5 text-left">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
        <img
          src={vehicle.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
          alt={vehicle.name}
          className="w-18 h-13 object-cover rounded-md bg-slate-200 dark:bg-slate-800 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
              {vehicle.brand} {vehicle.model || vehicle.name} {vehicle.year ? `(${vehicle.year})` : ''}
            </h4>
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                isAvailable
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
              }`}
            >
              {isAvailable ? 'Available' : 'Rented Out'}
            </span>
          </div>

          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-[#0077b6] dark:text-[#38bdf8]">
              {formatPrice(vehicle.price_per_day)}{t.labels.perDay}
            </span>
            <span className="text-[10px] text-slate-500">
              • {formatPrice(vehicle.price_per_hour || Math.round(vehicle.price_per_day / 8))}{t.labels.perHour}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            Deposit: {formatPrice(25000)} (Refundable)
          </span>
        </div>
      </div>

      {/* Technical Specifications Grid */}
      <div>
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Technical Specifications:
        </h5>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[9px]">Engine / Powertrain</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{specs.engine || `${vehicle.fuel_type || 'Petrol'} Engine`}</span>
          </div>
          <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[9px]">Transmission</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.transmission || 'Automatic'}</span>
          </div>
          <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[9px]">Fuel Efficiency</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{specs.fuelEfficiency || '18-22 km/L (Eco)'}</span>
          </div>
          <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[9px]">Seating Capacity</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.seats || 5} Passengers</span>
          </div>
          <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[9px]">Max Power Output</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{specs.power || 'Factory Calibrated'}</span>
          </div>
          <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[9px]">Odometer Reading</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.odometer_km ? `${Number(vehicle.odometer_km).toLocaleString()} KM` : '15,000 KM'}</span>
          </div>
        </div>
      </div>

      {/* Key Features */}
      {features.length > 0 && (
        <div>
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Features & Equipment:
          </h5>
          <div className="flex flex-wrap gap-1">
            {features.map((feat, fIdx) => (
              <span key={fIdx} className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] text-slate-700 dark:text-slate-300 font-medium">
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
        {isAvailable ? (
          <button
            onClick={onBook}
            className="flex-1 py-1.5 bg-[#0077b6] hover:bg-[#023e8a] text-white rounded-md font-bold text-xs transition-colors"
          >
            ⚡ {t.labels.instantBook}
          </button>
        ) : (
          <button
            onClick={onWaitlist}
            className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-xs transition-colors"
          >
            📝 Join Priority Waitlist
          </button>
        )}
        <button
          onClick={onViewFull}
          className="py-1.5 px-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-xs font-medium transition-colors"
        >
          Catalog Page
        </button>
      </div>
    </div>
  );
};
