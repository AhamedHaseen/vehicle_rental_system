import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AIChatService } from '../../services/aiChatService';
import {
  Sparkles,
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  RotateCcw,
  Car,
  Calendar,
  Fuel,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export const RentFlowChatbot = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Message list state
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "👋 Hi! I'm the **RentFlow AI Assistant**.\n\nYou can **book vehicles directly with me**, check live fleet availability, track existing bookings, or submit custom inquiries. How can I assist you?",
      suggestedActions: [
        { label: '⚡ Instant Book via AI', query: 'I want to book a car' },
        { label: '🚗 Available Fleet', query: 'Show available cars' },
        { label: '💰 Rates & Deposit', query: 'What is the security deposit?' },
        { label: '📦 Track Booking', query: 'Check my booking status' }
      ]
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

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
      const response = await AIChatService.processMessage(text, { user });

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

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "I experienced a brief connection hiccup. Please feel free to rephrase or try again.",
          suggestedActions: [
            { label: '🚗 Available Fleet', query: 'Show available cars' },
            { label: '📝 Submit Inquiry', query: 'Submit inquiry' }
          ]
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
        text: "Conversation reset! How can I assist you with your rental today?",
        suggestedActions: [
          { label: '⚡ Book a Car via AI', query: 'I want to book a car' },
          { label: '🚗 Available Fleet', query: 'Show available cars' },
          { label: '💰 Rates & Deposit', query: 'What is the security deposit?' },
          { label: '📦 Track Booking', query: 'Check my booking status' }
        ]
      }
    ]);
  };

  // Launch direct in-chat AI booking flow
  const handleInitiateAIBooking = (vehicle) => {
    const bookingMessage = {
      id: `ai-book-${Date.now()}`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'ai_booking_flow',
      vehicle,
      text: `⚡ **Direct AI Reservation: ${vehicle.brand} ${vehicle.model || vehicle.name}**\n\nChoose your dates and pickup hub below to confirm directly with our dispatch system:`,
      prefill: {
        customer_name: user?.full_name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || ''
      }
    };
    setMessages(prev => [...prev, bookingMessage]);
  };

  // Confirm booking directly into database
  const handleConfirmAIBooking = async (bookingData, msgId) => {
    try {
      const created = await AIChatService.confirmAIBooking({
        ...bookingData,
        customer_id: user?.id || null
      });

      success('Reservation Confirmed', `Your booking ${created.booking_code || created.id} has been confirmed!`);

      // Update message state to show full confirmation pass
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? {
                ...m,
                type: 'ai_booking_success',
                text: `🎉 **Booking Confirmed via RentFlow AI!**\n\nYour vehicle is reserved with instant digital verification.`,
                booking: created
              }
            : m
        )
      );
    } catch (err) {
      toastError('Booking Failed', err.message);
    }
  };

  // Inline inquiry submit handler
  const handleInlineInquirySubmit = async (formData, msgId) => {
    try {
      await AIChatService.submitInquiry(formData);
      success('Inquiry Dispatched', 'Your inquiry was saved to our database! A dispatch coordinator will contact you shortly.');

      // Update message state to show inquiry confirmed
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? {
                ...m,
                type: 'inquiry_success',
                text: `✅ **Inquiry Recorded Successfully!**\n\nThank you, **${formData.name}**. We have dispatched your request to our fleet manager (Ref: \`INQ-${Date.now().toString().slice(-4)}\`). We will contact you at **${formData.email}** or **${formData.phone}** within 15 minutes.`
              }
            : m
        )
      );
    } catch (err) {
      toastError('Submission Error', err.message);
    }
  };

  // Helper for markdown-like bold and line-breaks
  const renderFormattedText = (raw) => {
    if (!raw) return null;
    const parts = raw.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed text-[13px]">
        {parts.map((paragraph, idx) => {
          if (!paragraph.trim()) return <div key={idx} className="h-1" />;

          // Bullet point
          const isBullet = paragraph.trim().startsWith('* ') || paragraph.trim().startsWith('- ');
          const lineContent = isBullet ? paragraph.trim().slice(2) : paragraph;

          // Replace **bold**
          const formatted = lineContent.split(/(\*\*.*?\*\*|\`.*?\`)/g).map((segment, sIdx) => {
            if (segment.startsWith('**') && segment.endsWith('**')) {
              return <strong key={sIdx} className="font-semibold text-slate-900 dark:text-slate-100">{segment.slice(2, -2)}</strong>;
            }
            if (segment.startsWith('`') && segment.endsWith('`')) {
              return <code key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0077b6] dark:text-[#38bdf8] font-mono text-[11px]">{segment.slice(1, -1)}</code>;
            }
            return segment;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#0077b6] dark:text-[#38bdf8] mt-1 text-[8px]">•</span>
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
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
            setHasUnread(false);
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white rounded-full shadow-2xl hover:shadow-[#0077b6]/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
          aria-label="Open AI Assistant"
        >
          {/* Pulsing beacon */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>

          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
          </div>

          <span className="text-xs font-bold tracking-wide">RentFlow AI</span>

          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-bounce" />
          )}
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div
          className={`flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 w-[92vw] sm:w-[410px] ${
            isMinimized ? 'h-14' : 'h-[580px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <Car className="w-4 h-4 text-cyan-200" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0077b6] rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold tracking-tight">RentFlow AI Concierge</h3>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-200 rounded border border-emerald-400/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-cyan-100/80 flex items-center gap-1">
                  <span>Sub-second Database Grounding</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Reset Button */}
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimize/Maximize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800 dark:text-slate-200 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 shadow-sm transition-all ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-[#0077b6] to-[#0096c7] text-white rounded-br-xs'
                          : 'bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                      }`}
                    >
                      {renderFormattedText(msg.text)}

                      {/* Interactive Vehicle Cards */}
                      {msg.vehicles && msg.vehicles.length > 0 && (
                        <div className="mt-3 space-y-2.5">
                          {msg.vehicles.map((v) => (
                            <div
                              key={v.id}
                              className="group flex flex-col sm:flex-row items-center gap-3 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#0077b6] dark:hover:border-[#0077b6] transition-all shadow-xs"
                            >
                              <img
                                src={v.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
                                alt={v.name}
                                className="w-full sm:w-20 h-16 object-cover rounded-lg bg-slate-200 dark:bg-slate-800"
                              />
                              <div className="flex-1 w-full text-left">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                                    {v.brand} {v.model || v.name}
                                  </h4>
                                  <span className="text-[10px] font-extrabold text-[#0077b6] dark:text-[#38bdf8]">
                                    ${Number(v.price_per_day || 0).toFixed(0)}/day
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                  <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{v.seats || 5}</span>
                                  <span>•</span>
                                  <span className="capitalize">{v.transmission || 'Auto'}</span>
                                  <span>•</span>
                                  <span className="capitalize">{v.fuel_type || 'Petrol'}</span>
                                </div>
                                <div className="mt-2.5 flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleInitiateAIBooking(v)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white hover:opacity-95 rounded-lg font-bold text-[10px] shadow-xs transition-all"
                                  >
                                    <Sparkles className="w-3 h-3 text-cyan-200" />
                                    <span>Instant Book via AI</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setIsOpen(false);
                                      navigate(`/vehicles/${v.id}`);
                                    }}
                                    className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0077b6] rounded-lg transition-colors"
                                    title="View full specs"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interactive AI In-Chat Booking Flow */}
                      {msg.type === 'ai_booking_flow' && msg.vehicle && (
                        <AIBookingForm
                          vehicle={msg.vehicle}
                          prefill={msg.prefill || {}}
                          user={user}
                          onConfirm={(data) => handleConfirmAIBooking(data, msg.id)}
                        />
                      )}

                      {/* Interactive AI Booking Success Digital Pass */}
                      {msg.type === 'ai_booking_success' && msg.booking && (
                        <div className="mt-3 p-3.5 bg-white dark:bg-slate-900 border border-emerald-500/40 dark:border-emerald-500/40 rounded-xl space-y-2.5 shadow-sm text-left">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </span>
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                Digital Pass Issued
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-extrabold text-[#0077b6] dark:text-[#38bdf8]">
                              {msg.booking.booking_code || msg.booking.id}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs">
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              🚗 {msg.booking.vehicle_name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              📅 {new Date(msg.booking.start_date).toLocaleDateString()} → {new Date(msg.booking.end_date).toLocaleDateString()} ({msg.booking.duration_days} Days)
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              📍 {msg.booking.pickup_location}
                            </p>
                            <div className="flex items-center justify-between font-extrabold text-[#0077b6] dark:text-[#38bdf8] pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                              <span>Total Confirmed:</span>
                              <span>${Number(msg.booking.total_amount || 0).toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="pt-1 flex gap-2">
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                navigate('/my-bookings');
                              }}
                              className="flex-1 py-1.5 px-2 bg-[#0077b6] text-white hover:bg-[#023e8a] rounded-lg font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                            >
                              <span>View in My Bookings</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Interactive Booking Status Card */}
                      {msg.booking && (
                        <div className="mt-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-[#0077b6] dark:text-[#38bdf8]">
                              {msg.booking.booking_reference || msg.booking.id}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                msg.booking.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                  : msg.booking.status === 'active'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                              }`}
                            >
                              {msg.booking.status || 'Active'}
                            </span>
                          </div>

                          {msg.booking.vehicle && (
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              🚗 {msg.booking.vehicle.brand} {msg.booking.vehicle.model || msg.booking.vehicle.name}
                            </p>
                          )}

                          <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{msg.booking.start_date} → {msg.booking.end_date}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <span>Total Amount:</span>
                              <span className="text-[#0077b6] dark:text-[#38bdf8]">${Number(msg.booking.total_price || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interactive Inquiry Form */}
                      {msg.type === 'inquiry_form' && (
                        <InquiryForm
                          prefill={msg.prefill || {}}
                          onSubmit={(data) => handleInlineInquirySubmit(data, msg.id)}
                        />
                      )}
                    </div>

                    <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                      {msg.timestamp}
                    </span>

                    {/* Suggested Action Quick Chips */}
                    {msg.suggestedActions && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
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
                            className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#0077b6]/10 dark:hover:bg-[#0077b6]/20 text-slate-700 dark:text-slate-300 hover:text-[#0077b6] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#0077b6] animate-spin" />
                    </div>
                    <span className="italic text-[11px]">Consulting real-time fleet database...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
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
                    placeholder="Ask about cars, pricing, or ref # (e.g. RF-1234)..."
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                    disabled={isLoading}
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-2.5 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
                    title="Send"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1 mt-2">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                    24/7 Verified Dispatch Grounding
                  </span>
                  <span>Instant &lt; 1s reply</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Inline Form for Capturing Contact Inquiries directly in Chat
const InquiryForm = ({ prefill = {}, onSubmit }) => {
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
    <form onSubmit={handleSubmit} className="mt-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-left">
      <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
        <MessageSquare className="w-3 h-3 text-[#0077b6]" />
        <span>Dispatch Inquiry Dispatcher</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Full Name *"
          required
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address *"
          required
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
        />
      </div>

      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone Number (e.g. +94 77 123 4567)"
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="How can we assist you with your rental? (Dates, car model, custom request) *"
        rows={2}
        required
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0077b6] resize-none"
      />

      <button
        type="submit"
        disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()}
        className="w-full py-1.5 px-3 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white rounded-lg font-bold text-[11px] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
      >
        {isSubmitting ? (
          <span>Dispatching to Database...</span>
        ) : (
          <>
            <span>Submit Inquiry</span>
            <Check className="w-3 h-3" />
          </>
        )}
      </button>
    </form>
  );
};

// Inline Interactive AI Booking Reservation Form
const AIBookingForm = ({ vehicle, prefill = {}, user, onConfirm }) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(threeDaysLater);
  const [pickupLocation, setPickupLocation] = useState('Bandaranaike Int Airport (CMB)');
  const [withDriver, setWithDriver] = useState(false);
  const [name, setName] = useState(prefill.customer_name || user?.full_name || '');
  const [email, setEmail] = useState(prefill.customer_email || user?.email || '');
  const [phone, setPhone] = useState(prefill.customer_phone || user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(end - start, 86400000);
  const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const dailyRate = Number(vehicle?.price_per_day || 65);
  const driverCost = withDriver ? 30 * durationDays : 0;
  const basePrice = (dailyRate * durationDays) + driverCost;
  const securityDeposit = 200;
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
    <form onSubmit={handleSubmit} className="mt-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-left shadow-xs">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <img
          src={vehicle.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
          alt={vehicle.name}
          className="w-14 h-11 object-cover rounded-lg bg-slate-200 dark:bg-slate-800"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
            {vehicle.brand} {vehicle.model || vehicle.name}
          </h4>
          <span className="text-[11px] font-extrabold text-[#0077b6] dark:text-[#38bdf8]">
            ${dailyRate}/day • ${vehicle.price_per_hour || Math.round(dailyRate / 8)}/hr
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-0.5">Pickup Date</label>
          <input
            type="date"
            value={startDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-slate-100 text-xs"
          />
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-0.5">Return Date</label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-slate-100 text-xs"
          />
        </div>
      </div>

      {/* Hub Location */}
      <div>
        <label className="block text-slate-600 dark:text-slate-400 font-semibold text-[10px] mb-0.5">Pickup & Return Hub</label>
        <select
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 text-[11px]"
        >
          <option value="Bandaranaike Int Airport (CMB)">Bandaranaike Int Airport (CMB)</option>
          <option value="Colombo Flagship Hub (Galle Face)">Colombo Flagship Hub (Galle Face)</option>
          <option value="Galle Coastal Depot">Galle Coastal Depot</option>
          <option value="Kandy City Central">Kandy City Central</option>
        </select>
      </div>

      {/* Chauffeur Toggle */}
      <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={withDriver}
          onChange={(e) => setWithDriver(e.target.checked)}
          className="rounded text-[#0077b6] focus:ring-0"
        />
        <span>Include Professional Chauffeur (+$30/day)</span>
      </label>

      {/* Contact Details */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Legal Name *"
          required
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile Phone"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100"
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address *"
        required
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 dark:text-slate-100"
      />

      {/* Price Summary */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
        <div className="flex justify-between">
          <span>{durationDays} Days Rental:</span>
          <span>${basePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Refundable Deposit:</span>
          <span>${securityDeposit.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700 text-xs">
          <span>Estimated Total:</span>
          <span className="text-[#0077b6] dark:text-[#38bdf8]">${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !name.trim() || !email.trim()}
        className="w-full py-2 px-3 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white rounded-lg font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-md"
      >
        {isSubmitting ? (
          <span>Confirming with Dispatch...</span>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>Confirm & Reserve via RentFlow AI</span>
          </>
        )}
      </button>
    </form>
  );
};
