import { getVehicles, getBookings, getLocations, saveContactMessage, createBooking } from './dataService';

// FAQ Knowledge Base for instant <100ms answers
const FAQ_KNOWLEDGE = [
  {
    keywords: ['deposit', 'security deposit', 'bond', 'caution money'],
    answer: "Our standard security deposit is **$200.00** for economic and midsize vehicles (or **$500.00** for premium luxury models). This deposit is **100% refundable** immediately upon vehicle return and inspection."
  },
  {
    keywords: ['age', 'minimum age', 'old do i have to be', 'driver age'],
    answer: "The minimum driver age is **21 years old**. Drivers between 21 and 24 must hold a valid driver's license for at least 1 year. Drivers aged 25+ can rent any vehicle in our luxury fleet."
  },
  {
    keywords: ['license', 'licence', 'documents', 'id card', 'passport'],
    answer: "To rent a vehicle, you need:\n1. A valid government-issued **Driver's License** (held for at least 1 year).\n2. A valid **National ID or Passport**.\n3. International travelers can use an **International Driving Permit (IDP)** alongside their home country license."
  },
  {
    keywords: ['fuel', 'gas', 'petrol', 'diesel', 'fuel policy'],
    answer: "We operate on a **Full-to-Full fuel policy**. You receive the vehicle with a 100% full tank and simply return it with a full tank to avoid refueling service fees."
  },
  {
    keywords: ['cancel', 'cancellation', 'refund', 'change booking'],
    answer: "We offer **Free Cancellation** up to **24 hours** prior to your scheduled pickup time with a 100% full refund. Cancellations within 24 hours incur a modest 1-day rental fee."
  },
  {
    keywords: ['insurance', 'coverage', 'damage', 'collision', 'cdw'],
    answer: "All RentFlow rentals include **Comprehensive Collision Damage Waiver (CDW)** and 24/7 Roadside Assistance. Optional Zero-Deductible Excess Protection can be added at checkout for complete peace of mind."
  },
  {
    keywords: ['hourly', 'hour rate', 'per hour', 'half day'],
    answer: "Yes! We offer flexible **hourly rates** calculated automatically (daily rate ÷ 8 hours). You can rent by the hour or by the day directly through our catalog."
  }
];

export class AIChatService {
  /**
   * Process a customer message and return a rich response within milliseconds.
   */
  static async processMessage(userInput, context = {}) {
    const rawInput = (userInput || '').trim();
    const query = rawInput.toLowerCase();
    const currentUser = context.user || null;

    // Fast simulated thinking delay (180ms) for natural responsive UX
    await new Promise(resolve => setTimeout(resolve, 180));

    // 0. Check for "Can I book via RentFlow AI" or Direct Booking request
    if (
      query.includes('can book') ||
      query.includes('book via ai') ||
      query.includes('book through ai') ||
      query.includes('how to book') ||
      query.includes('i want to book') ||
      query.includes('reserve a car') ||
      query.includes('book a car') ||
      query.startsWith('book ')
    ) {
      return await this.handleDirectBookingIntent(query, currentUser);
    }

    // 1. Check for Booking Reference Lookup (e.g., RF-1234 or "track booking")
    const bookingRefMatch = rawInput.match(/\b(RF-[\w-]+)\b/i) || query.match(/booking\s+(#?[\w-]+)/i);
    if (bookingRefMatch || query.includes('track') || query.includes('status of my booking') || query.includes('check my booking')) {
      return await this.handleBookingLookup(bookingRefMatch ? (bookingRefMatch[1] || bookingRefMatch[0]).toUpperCase() : null, currentUser, query);
    }

    // 2. Check for Inquiry Submission intent
    if (
      query.includes('contact human') ||
      query.includes('speak to agent') ||
      query.includes('talk to someone') ||
      query.includes('submit inquiry') ||
      query.includes('custom request') ||
      query.includes('leave a message') ||
      query.includes('callback') ||
      query.includes('quote')
    ) {
      return {
        type: 'inquiry_form',
        text: "I can connect you directly with our fleet dispatch team! Fill in your message below, and our coordinator will respond within 15 minutes.",
        prefill: {
          name: currentUser?.full_name || '',
          email: currentUser?.email || '',
          phone: currentUser?.phone || '',
          subject: 'Customer Fleet Inquiry'
        }
      };
    }

    // 3. Check for Location / Hubs query
    if (query.includes('location') || query.includes('where are you') || query.includes('pickup point') || query.includes('hubs') || query.includes('branch') || query.includes('airport')) {
      return await this.handleLocationsQuery();
    }

    // 4. Check FAQ & Policy Answers
    for (const faq of FAQ_KNOWLEDGE) {
      if (faq.keywords.some(kw => query.includes(kw))) {
        return {
          type: 'text',
          text: faq.answer,
          suggestedActions: [
            { label: '🚗 Browse Available Fleet', query: 'Show available cars' },
            { label: '📝 Submit Custom Inquiry', query: 'Submit inquiry' }
          ]
        };
      }
    }

    // 5. Check for Vehicle & Fleet Search Queries
    const vehicleKeywords = ['car', 'suv', 'van', 'bus', 'vehicle', 'fleet', 'drive', 'rent', 'available', 'cheap', 'budget', 'luxury', 'automatic', 'manual', 'petrol', 'diesel', 'hybrid', 'electric'];
    const isVehicleQuery = vehicleKeywords.some(kw => query.includes(kw)) || query.includes('how much') || query.includes('price');

    if (isVehicleQuery) {
      return await this.handleFleetSearch(query);
    }

    // 6. Greetings & Casual Hello
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings|hola)\b/i.test(query)) {
      const greetingName = currentUser?.full_name ? ` ${currentUser.full_name}` : '';
      return {
        type: 'text',
        text: `Hello${greetingName}! 👋 Welcome to **RentFlow**. I am your automated AI rental concierge.\n\nI can help you with:\n* 🚗 **Finding & comparing available vehicles**\n* 🔍 **Tracking your existing booking status**\n* 💰 **Rental rates, insurance & deposit questions**\n* 📝 **Submitting an inquiry directly to our dispatch team**\n\nWhat can I assist you with today?`,
        suggestedActions: [
          { label: '🚗 Available Fleet', query: 'Show available cars' },
          { label: '💰 Rates & Deposit', query: 'What is the security deposit?' },
          { label: '📦 Check My Booking', query: 'Check my booking status' },
          { label: '📝 Leave Inquiry', query: 'Submit inquiry' }
        ]
      };
    }

    // 7. Fallback General Assistance
    return {
      type: 'text',
      text: "I can help you explore our verified fleet, review rental policies, check booking statuses, or file an inquiry directly with our dispatch team.\n\nCould you please pick from the options below or ask a specific question?",
      suggestedActions: [
        { label: '🚗 Search Available Cars', query: 'Show available cars' },
        { label: '💰 Pricing & Deposits', query: 'What is the deposit policy?' },
        { label: '📍 Pickup Hubs', query: 'Where are your locations?' },
        { label: '📞 Request Human Dispatch', query: 'Submit inquiry' }
      ]
    };
  }

  /**
   * Search vehicles live from database with smart filtering
   */
  static async handleFleetSearch(query) {
    try {
      const vehicles = await getVehicles();
      let filtered = vehicles.filter(v => v.status === 'available');

      // Category / Type matching
      if (query.includes('suv')) {
        filtered = filtered.filter(v => (v.category_id || '').toLowerCase().includes('suv') || (v.name || '').toLowerCase().includes('suv') || (v.model || '').toLowerCase().includes('suv'));
      } else if (query.includes('van')) {
        filtered = filtered.filter(v => (v.category_id || '').toLowerCase().includes('van') || (v.name || '').toLowerCase().includes('van') || (v.model || '').toLowerCase().includes('van'));
      } else if (query.includes('bus')) {
        filtered = filtered.filter(v => (v.category_id || '').toLowerCase().includes('bus') || (v.name || '').toLowerCase().includes('bus') || (v.model || '').toLowerCase().includes('bus'));
      } else if (query.includes('sedan') || query.includes('car')) {
        filtered = filtered.filter(v => (v.category_id || '').toLowerCase().includes('car') || (v.category_id || '').toLowerCase().includes('sedan') || (v.seats && v.seats <= 5));
      }

      // Fuel type matching
      if (query.includes('petrol') || query.includes('gasoline')) {
        filtered = filtered.filter(v => (v.fuel_type || '').toLowerCase().includes('petrol'));
      } else if (query.includes('diesel')) {
        filtered = filtered.filter(v => (v.fuel_type || '').toLowerCase().includes('diesel'));
      } else if (query.includes('hybrid')) {
        filtered = filtered.filter(v => (v.fuel_type || '').toLowerCase().includes('hybrid'));
      } else if (query.includes('electric') || query.includes('ev')) {
        filtered = filtered.filter(v => (v.fuel_type || '').toLowerCase().includes('electric'));
      }

      // Transmission matching
      if (query.includes('automatic') || query.includes('auto')) {
        filtered = filtered.filter(v => (v.transmission || '').toLowerCase().includes('auto'));
      } else if (query.includes('manual')) {
        filtered = filtered.filter(v => (v.transmission || '').toLowerCase().includes('manual'));
      }

      // Budget / Cheap matching
      if (query.includes('cheap') || query.includes('budget') || query.includes('lowest')) {
        filtered.sort((a, b) => Number(a.price_per_day || 0) - Number(b.price_per_day || 0));
      } else if (query.includes('luxury') || query.includes('premium')) {
        filtered.sort((a, b) => Number(b.price_per_day || 0) - Number(a.price_per_day || 0));
      }

      // If no exact match after filters, fall back to all available vehicles
      if (filtered.length === 0) {
        filtered = vehicles.filter(v => v.status === 'available').slice(0, 4);
      } else {
        filtered = filtered.slice(0, 4);
      }

      return {
        type: 'vehicles',
        text: `Here are **${filtered.length} matching vehicles** ready for immediate reservation:`,
        vehicles: filtered,
        suggestedActions: [
          { label: '💰 Check Deposit & Terms', query: 'What is the deposit policy?' },
          { label: '📝 Need Custom Fleet Quote?', query: 'Submit inquiry' }
        ]
      };
    } catch (err) {
      console.warn('Fleet search error:', err);
      return {
        type: 'text',
        text: "I couldn't load the real-time fleet right this second. Please head to our [Catalog](/catalog) to explore all live vehicles."
      };
    }
  }

  /**
   * Handle booking lookup via reference number or logged in user
   */
  static async handleBookingLookup(reference, currentUser, query) {
    try {
      const bookings = await getBookings();
      const vehicles = await getVehicles();

      // If user typed a specific reference
      if (reference) {
        const cleanRef = reference.replace(/#/g, '').trim().toUpperCase();
        const found = bookings.find(b => (b.booking_reference || '').toUpperCase().includes(cleanRef) || (b.id || '').toUpperCase().includes(cleanRef));

        if (found) {
          const vehicle = vehicles.find(v => v.id === found.vehicle_id);
          return {
            type: 'booking',
            text: `Found booking record for reference **${found.booking_reference || found.id}**:`,
            booking: { ...found, vehicle },
            suggestedActions: [
              { label: '🚗 Explore More Cars', query: 'Show available cars' },
              { label: '📞 Help with this Booking', query: `Inquiry regarding booking ${found.booking_reference || found.id}` }
            ]
          };
        } else {
          return {
            type: 'text',
            text: `⚠️ No active reservation was found matching reference **${cleanRef}**. Please ensure the code format is correct (e.g. \`RF-1234\`) or check [My Bookings](/my-bookings).`,
            suggestedActions: [
              { label: '📝 Contact Support', query: `Cannot find booking ${cleanRef}` }
            ]
          };
        }
      }

      // If user has bookings and is logged in
      if (currentUser?.id || currentUser?.email) {
        const userBookings = bookings.filter(b => b.customer_id === currentUser.id || (b.customer_email || '').toLowerCase() === (currentUser.email || '').toLowerCase());
        if (userBookings.length > 0) {
          const latest = userBookings[0];
          const vehicle = vehicles.find(v => v.id === latest.vehicle_id);
          return {
            type: 'booking',
            text: `Here is your most recent reservation (**${latest.booking_reference || latest.id}**):`,
            booking: { ...latest, vehicle },
            suggestedActions: [
              { label: '📋 View All My Bookings', query: 'Go to my bookings' }
            ]
          };
        }
      }

      return {
        type: 'text',
        text: "To track your booking instantly, please provide your **Booking Reference Number** (for example: `RF-9041`).",
        suggestedActions: [
          { label: '📋 View My Bookings Page', link: '/my-bookings' }
        ]
      };
    } catch (err) {
      console.warn('Booking lookup error:', err);
      return {
        type: 'text',
        text: "Unable to retrieve booking records right now. You can view all your active bookings on your [My Bookings](/my-bookings) page."
      };
    }
  }

  /**
   * Handle locations query from database
   */
  static async handleLocationsQuery() {
    try {
      const locations = await getLocations();
      if (locations && locations.length > 0) {
        const listText = locations.map(loc => `* **${loc.name}**: ${loc.address}, ${loc.city}`).join('\n');
        return {
          type: 'text',
          text: `We offer convenient pickup and drop-off at **${locations.length} authorized locations** across Sri Lanka:\n\n${listText}\n\nAll hubs feature 24/7 key handover and express check-in.`,
          suggestedActions: [
            { label: '🚗 Find Cars Near Me', query: 'Show available cars' }
          ]
        };
      }
    } catch (err) {
      console.warn('Locations query error:', err);
    }
    return {
      type: 'text',
      text: "Our primary hubs include **Bandaranaike International Airport (CMB)**, **Colombo Central Downtown**, and the **Galle Coastal Depot**, with 24/7 express dispatch."
    };
  }

  /**
   * Handle direct booking via RentFlow AI
   */
  static async handleDirectBookingIntent(query, currentUser) {
    try {
      const vehicles = await getVehicles();
      const availableVehicles = vehicles.filter(v => v.status === 'available');

      // Check if user specified a particular model or brand (e.g. "prius", "bmw", "suv", "van")
      let matchedVehicle = null;
      for (const v of availableVehicles) {
        if (v.model && query.includes(v.model.toLowerCase())) {
          matchedVehicle = v;
          break;
        }
        if (v.brand && query.includes(v.brand.toLowerCase())) {
          matchedVehicle = v;
          break;
        }
        if (v.name && query.includes(v.name.toLowerCase())) {
          matchedVehicle = v;
          break;
        }
      }

      if (!matchedVehicle && query.includes('suv')) {
        matchedVehicle = availableVehicles.find(v => (v.category_id || '').toLowerCase().includes('suv') || (v.name || '').toLowerCase().includes('suv'));
      } else if (!matchedVehicle && query.includes('van')) {
        matchedVehicle = availableVehicles.find(v => (v.category_id || '').toLowerCase().includes('van') || (v.name || '').toLowerCase().includes('van'));
      }

      // If a specific vehicle was requested or matched
      if (matchedVehicle) {
        return {
          type: 'ai_booking_flow',
          text: `⚡ **Yes! You can book directly via RentFlow AI.**\n\nI have prepared an instant in-chat reservation for the **${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name}** below:`,
          vehicle: matchedVehicle,
          prefill: {
            customer_name: currentUser?.full_name || '',
            customer_email: currentUser?.email || '',
            customer_phone: currentUser?.phone || ''
          }
        };
      }

      // Otherwise, show list of available cars with "Instant Book via AI" button
      const topVehicles = availableVehicles.slice(0, 4);
      return {
        type: 'vehicles',
        text: `⚡ **Yes! You can book any vehicle directly via RentFlow AI in seconds.**\n\nSelect any car below to open an instant in-chat booking reservation:`,
        vehicles: topVehicles,
        isBookingPrompt: true,
        suggestedActions: [
          { label: '💰 Check Deposit & Terms', query: 'What is the deposit policy?' },
          { label: '📝 Submit Custom Inquiry', query: 'Submit inquiry' }
        ]
      };
    } catch (err) {
      console.warn('handleDirectBookingIntent error:', err);
      return {
        type: 'text',
        text: "You can book directly through RentFlow! Please explore our [Catalog](/catalog) or choose an available car below."
      };
    }
  }

  /**
   * Confirm and finalize an AI booking directly into database
   */
  static async confirmAIBooking(bookingData) {
    return await createBooking(bookingData);
  }

  /**
   * Submit an inquiry directly to the Supabase database
   */
  static async submitInquiry({ name, email, phone, subject, message }) {
    if (!name || !email || !message) {
      throw new Error("Name, email, and message are required to submit an inquiry.");
    }
    const result = await saveContactMessage({
      name,
      email,
      phone: phone || '',
      subject: subject || 'AI Chatbot Customer Inquiry',
      message
    });
    return result;
  }
}
