import { useState } from 'react';
import { 
  Phone, Mail, MapPin, Send, Sparkles 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const ContactUs = () => {
  const { success } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Car',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      success('Inquiry Dispatched', 'Thank you! A rental dispatch coordinator will contact you shortly.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'Car',
        message: ''
      });
    }, 600);
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#023e8a]/10 border border-[#023e8a]/20 text-[#023e8a] dark:text-[#38bdf8] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>24/7 Dispatch & Inquiries</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Connect with RentFlow
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Need a custom corporate fleet, chauffeur service, or airport handover assistance? Our team is available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#023e8a]/10 text-[#023e8a] dark:text-[#38bdf8] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">24/7 Roadside Hotline</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">+94 11 234 5678 / +94 77 987 6543</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">Available 24 hours daily</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#023e8a]/10 text-[#023e8a] dark:text-[#38bdf8] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Direct Support Email</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">support@rentflow.lk</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">corporate@rentflow.lk</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#023e8a]/10 text-[#023e8a] dark:text-[#38bdf8] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Flagship Headquarters</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                45 Galle Face Terrace, Colombo 03, Western Province, Sri Lanka
              </p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Send an Inquiry or Custom Request</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Submit your inquiry and we will get back to you within 15 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priyantha Silva"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#023e8a]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@domain.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#023e8a]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#023e8a]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Fleet Category of Interest</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#023e8a]"
                >
                  <option value="Car">Sedan & Hybrid</option>
                  <option value="SUV">4x4 SUV & Prado</option>
                  <option value="Luxury Vehicle">Luxury VIP (Mercedes / BMW)</option>
                  <option value="Van">Passenger Van (HiAce)</option>
                  <option value="Motorbike">Motorbike</option>
                  <option value="Three-Wheeler">Three-Wheeler</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Inquiry / Special Requirement *</label>
              <textarea
                rows="4"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Specify your travel dates, preferred pickup location, chauffeur requirements, or corporate fleet size..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#023e8a] leading-relaxed"
                required
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              icon={Send}
              className="w-full sm:w-auto"
            >
              Dispatch Inquiry
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
