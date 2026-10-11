import { getVehicles, getBookings, getLocations, saveContactMessage, createBooking } from './dataService';

// Multilingual Sri Lankan Knowledge Base (LKR / Rs.)
const FAQ_KNOWLEDGE_TRILINGUAL = [
  {
    keywords: [
      'deposit', 'security deposit', 'bond', 'caution money',
      'வைப்பு', 'பிணை', 'வைப்புத்தொகை',
      'තැන්පතු', 'ඇප', 'ඇප මුදල'
    ],
    answers: {
      en: "Our standard security deposit is **Rs. 25,000** for economic & midsize vehicles (or **Rs. 50,000** for luxury models). This deposit is **100% refundable** immediately upon vehicle inspection.",
      ta: "எங்கள் நிலையான பிணை வைப்புத்தொகை (Security Deposit) சாதாரண வாகனங்களுக்கு **ரூ. 25,000** ஆகும் (ஆடம்பர வாகனங்களுக்கு **ரூ. 50,000**). வாகனத்தை மீள ஒப்படைக்கும் போது இது **100% முழுமையாக திருப்பித் தரப்படும்**.",
      si: "අපගේ සම්මත ඇප තැන්පතුව (Security Deposit) සාමාන්‍ය වාහන සඳහා **රු. 25,000** ක් වන අතර (සුඛෝපභෝගී වාහන සඳහා **රු. 50,000** කි). වාහනය නැවත භාරදීමේදී මෙම මුදල **100% ක් ආපසු ලබාදෙනු ලැබේ**."
    }
  },
  {
    keywords: [
      'age', 'minimum age', 'old do i have to be', 'driver age',
      'வயது', 'சாரதி வயது',
      'වයස', 'අවම වයස'
    ],
    answers: {
      en: "The minimum driver age is **21 years old**. Drivers must hold a valid driver's license for at least 1 year. Drivers aged 25+ can rent any vehicle in our luxury fleet.",
      ta: "சாரதியின் குறைந்தபட்ச வயது **21 ஆண்டுகள்** ஆகும். குறைந்தது 1 வருடம் பழமையான செல்லுபடியாகும் சாரதி அனுமதிப்பத்திரம் வைத்திருக்க வேண்டும்.",
      si: "රියදුරුගේ අවම වයස **අවුරුදු 21** ක් විය යුතුය. අඩුම තරමේ වසර 1 ක් පැරණි වලංගු රියදුරු බලපත්‍රයක් තිබිය යුතුය."
    }
  },
  {
    keywords: [
      'license', 'licence', 'documents', 'id card', 'passport',
      'அனுமதிப்பத்திரம்', 'ஆவணங்கள்', 'அடையாள அட்டை',
      'බලපත්‍රය', 'ලියකියවිලි', 'හැඳුනුම්පත'
    ],
    answers: {
      en: "To rent a vehicle in Sri Lanka, you need:\n1. Valid **Sri Lankan Driver's License** or **International Driving Permit (IDP)**.\n2. Valid **National Identity Card (NIC) or Passport**.\n3. Proof of address or hotel stay.",
      ta: "இலங்கையில் வாகனம் வாடகைக்கு எடுக்க தேவையானவை:\n1. செல்லுபடியாகும் **சாரதி அனுமதிப்பத்திரம் (Driving License)** அல்லது **சர்வதேச சாரதி அனுமதிப்பத்திரம் (IDP)**.\n2. **தேசிய அடையாள அட்டை (NIC) அல்லது கடவுச்சீட்டு (Passport)**.\n3. தங்கும் முகவரி ஆவணம்.",
      si: "ශ්‍රී ලංකාව තුළ වාහනයක් කුලියට ගැනීමට අවශ්‍ය ලියකියවිලි:\n1. වලංගු **ශ්‍රී ලාංකික රියදුරු බලපත්‍රය** හෝ **ජාත්‍යන්තර රියදුරු බලපත්‍රය (IDP)**.\n2. **ජාතික හැඳුනුම්පත (NIC) හෝ විදේශ ගමන් බලපත්‍රය (Passport)**.\n3. නවාතැන් තොරතුරු."
    }
  },
  {
    keywords: [
      'fuel', 'gas', 'petrol', 'diesel', 'fuel policy',
      'எரிபொருள்', 'பெட்ரோல்', 'டீசல்',
      'ඉන්ධන', 'පෙට්‍රල්', 'ඩීසල්'
    ],
    answers: {
      en: "We operate on a **Full-to-Full fuel policy**. You receive the vehicle with a 100% full tank and simply return it with a full tank to avoid refueling service fees.",
      ta: "நாங்கள் **முழு தாங்கி (Full-to-Full)** எரிபொருள் கொள்கையை பின்பற்றுகிறோம். வாகனம் எடுக்கும் போது முழு தாங்கி எரிபொருளுடன் வழங்கப்படும், அதேபோல் திருப்பித் தரும்போதும் முழு தாங்கியுடன் ஒப்படைக்க வேண்டும்.",
      si: "අපගේ සියලුම වාහන සඳහා **Full-to-Full** ඉන්ධන ප්‍රතිපත්තිය ක්‍රියාත්මක වේ. ලබාගන්නා විට සම්පූර්ණ ඉන්ධන ටැංකියක් සහිතව ලැබෙන අතර ආපසු භාරදීමේදීද සම්පූර්ණ ටැංකියක් සමඟ භාරදිය යුතුය."
    }
  },
  {
    keywords: [
      'cancel', 'cancellation', 'refund', 'change booking',
      'ரத்து', 'மீளளிப்பு',
      'අවලංගු', 'මුදල් ආපසු'
    ],
    answers: {
      en: "We offer **Free Cancellation** up to **24 hours** prior to your scheduled pickup time with a 100% full refund.",
      ta: "வாகனம் எடுக்கும் நேரத்திற்கு **24 மணித்தியாலங்களுக்கு முன்னர்** ரத்து செய்தால் **100% முழு பணமும் இலவசமாக மீளளிக்கப்படும்**.",
      si: "ලබාගැනීමේ වේලාවට පැය **24 කට පෙර** වෙන්කිරීම අවලංගු කළහොත් **100% ක් නොමිලේ මුදල් ආපසු ලබාදේ**."
    }
  },
  {
    keywords: [
      'hourly', 'hour rate', 'per hour', 'half day',
      'மணித்தியால', 'மணித்தியால கட்டணம்',
      'පැයකට', 'පැයක ගාස්තුව'
    ],
    answers: {
      en: "Yes! We offer flexible **hourly rates** calculated automatically (daily rate ÷ 8 hours). You can rent by the hour or by the day directly in Sri Lankan Rupees.",
      ta: "ஆம்! மணித்தியால அடிப்படையில் வாடகைக்கு எடுக்கலாம் (நாள் கட்டணம் ÷ 8 மணித்தியாலங்கள்). இலங்கை ரூபாவில் கட்டணங்கள் கணக்கிடப்படும்.",
      si: "ඔව්! අපගේ පැයක ගාස්තු ක්‍රමය මඟින් ඔබට අවශ්‍ය පැය ගණනට පමණක් වාහන කුලියට ගත හැක (දින ගාස්තුව ÷ පැය 8). ශ්‍රී ලංකා රුපියල් වලින් ගෙවීම් කළ හැක."
    }
  }
];

export class AIChatService {
  /**
   * Detect language from input text or fallback to context lang
   */
  static detectLanguage(text, fallbackLang = 'en') {
    if (!text) return fallbackLang;
    // Check for Tamil Unicode range \u0B80-\u0BFF
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    // Check for Sinhala Unicode range \u0D80-\u0DFF
    if (/[\u0D80-\u0DFF]/.test(text)) return 'si';
    return fallbackLang;
  }

  /**
   * Process a customer message and return rich trilingual response in < 250ms
   */
  static async processMessage(userInput, context = {}) {
    const rawInput = (userInput || '').trim();
    const query = rawInput.toLowerCase();
    const currentUser = context.user || null;
    const activeLang = this.detectLanguage(rawInput, context.lang || 'en');

    // Quick thinking delay for realistic natural chat feel
    await new Promise(resolve => setTimeout(resolve, 180));

    // 0. Check for Direct Booking intent (in English, Tamil, Sinhala)
    if (
      query.includes('can book') ||
      query.includes('book via ai') ||
      query.includes('book through ai') ||
      query.includes('how to book') ||
      query.includes('i want to book') ||
      query.includes('reserve a car') ||
      query.includes('book a car') ||
      query.startsWith('book ') ||
      query.includes('முன்பதிவு') ||
      query.includes('கார் வேண்டும்') ||
      query.includes('வாடகைக்கு') ||
      query.includes('වෙන්කරන්න') ||
      query.includes('වාහනයක් ගන්න') ||
      query.includes('කුලියට')
    ) {
      return await this.handleDirectBookingIntent(query, currentUser, activeLang);
    }

    // 1. Check for Booking Reference Lookup (e.g., RF-1234 or "track booking")
    const bookingRefMatch = rawInput.match(/\b(RF-[\w-]+)\b/i) || query.match(/booking\s+(#?[\w-]+)/i);
    if (
      bookingRefMatch ||
      query.includes('track') ||
      query.includes('status of my booking') ||
      query.includes('check my booking') ||
      query.includes('நிலை') ||
      query.includes('පරීක්ෂා')
    ) {
      return await this.handleBookingLookup(
        bookingRefMatch ? (bookingRefMatch[1] || bookingRefMatch[0]).toUpperCase() : null,
        currentUser,
        activeLang
      );
    }

    // 2. Check for Inquiry Submission intent
    if (
      query.includes('contact human') ||
      query.includes('speak to agent') ||
      query.includes('submit inquiry') ||
      query.includes('leave a message') ||
      query.includes('callback') ||
      query.includes('தொடர்பு') ||
      query.includes('விමසීම') ||
      query.includes('කතා කරන්න')
    ) {
      const inquiryTexts = {
        en: "I can connect you directly with our Sri Lanka dispatch coordinators! Please leave your details below:",
        ta: "எங்கள் இலங்கை வாகன முகாமையாளருடன் உங்களை இணைக்கிறேன்! தயவுசெய்து உங்கள் விபரங்களை கீழே உள்ளிடுங்கள்:",
        si: "අපගේ ශ්‍රී ලංකා සම්බන්ධීකාරක කණ්ඩායම සමඟ ඔබව සම්බන්ධ කළ හැක! කරුණාකර ඔබගේ විස්තර පහතින් ඇතුළත් කරන්න:"
      };

      return {
        type: 'inquiry_form',
        text: inquiryTexts[activeLang] || inquiryTexts.en,
        prefill: {
          name: currentUser?.full_name || '',
          email: currentUser?.email || '',
          phone: currentUser?.phone || '',
          subject: 'Customer Fleet Inquiry (LKR)'
        }
      };
    }

    // 3. Check for Location / Hubs query
    if (
      query.includes('location') ||
      query.includes('where are you') ||
      query.includes('hubs') ||
      query.includes('airport') ||
      query.includes('இடம்') ||
      query.includes('நிலையம்') ||
      query.includes('ස්ථාන') ||
      query.includes('ගුවන් තොටුපල')
    ) {
      return await this.handleLocationsQuery(activeLang);
    }

    // 4. Check FAQ & Policy Answers
    for (const faq of FAQ_KNOWLEDGE_TRILINGUAL) {
      if (faq.keywords.some(kw => query.includes(kw))) {
        const answer = faq.answers[activeLang] || faq.answers.en;
        return {
          type: 'text',
          text: answer,
          suggestedActions: this.getSuggestedActions(activeLang)
        };
      }
    }

    // 5. Check for Vehicle & Fleet Search Queries
    const vehicleKeywords = [
      'car', 'suv', 'van', 'bus', 'vehicle', 'fleet', 'drive', 'rent', 'available', 'cheap', 'budget', 'luxury', 'automatic', 'manual', 'petrol', 'diesel', 'hybrid', 'electric',
      'கார்', 'வாகனம்', 'பஸ்', 'வேன்', 'விலை',
      'කාර්', 'වාහන', 'වෑන්', 'බස්', 'මිල', 'ගාස්තු'
    ];
    const isVehicleQuery = vehicleKeywords.some(kw => query.includes(kw)) || query.includes('how much') || query.includes('price');

    if (isVehicleQuery) {
      return await this.handleFleetSearch(query, activeLang);
    }

    // 6. Greetings & Casual Hello
    if (/^(hi|hello|hey|good morning|vanakkam|ayubowan|வணக்கம்|ආයුබෝවන්)\b/i.test(query)) {
      const greetingTexts = {
        en: `Hello! 👋 Welcome to **RentFlow Sri Lanka**.\n\nI can help you:\n* 🚗 **Browse & compare available vehicles in LKR (Rs.)**\n* ⚡ **Book instantly directly inside this chat**\n* 🔍 **Track your active booking status**\n* 💰 **Answer deposit & pricing questions**\n\nHow can I help you today?`,
        ta: `வணக்கம்! 👋 **RentFlow இலங்கை** உதவி மையத்திற்கு நல்வரவு.\n\nநான் உங்களுக்கு:\n* 🚗 **இலங்கை ரூபாவில் (Rs.) கிடைக்கும் வாகனங்களை கண்டறிய**\n* ⚡ **இங்கேயே நேரடியாக முன்பதிவு செய்ய**\n* 🔍 **உங்கள் முன்பதிவு நிலையை அறிய**\n* 💰 **வைப்புத்தொகை மற்றும் கட்டண விபரங்களை பெற**\n\nஉதவ முடியும். உங்கள் தேவை என்ன?`,
        si: `ආයුබෝවන්! 👋 **RentFlow ශ්‍රී ලංකා** වෙත සාදරයෙන් පිළිගනිමු.\n\nමට ඔබට:\n* 🚗 **ශ්‍රී ලංකා රුපියල් වලින් (Rs.) වාහන තොරතුරු සොයාගැනීමට**\n* ⚡ **මෙහිදීම සෘජුවම වාහන වෙන්කරවා ගැනීමට**\n* 🔍 **ඔබගේ වෙන්කිරීම් පරීක්ෂා කිරීමට**\n* 💰 **තැන්පතු සහ ගාස්තු විස්තර ලබාදීමට**\n\nසහාය විය හැක. ඔබට අවශ්‍ය කුමක්ද?`
      };

      return {
        type: 'text',
        text: greetingTexts[activeLang] || greetingTexts.en,
        suggestedActions: this.getSuggestedActions(activeLang)
      };
    }

    // 7. General Fallback
    const fallbackTexts = {
      en: "I can help you explore our verified Sri Lankan fleet, review rental policies, check booking statuses, or book directly in Sri Lankan Rupees (Rs.).\n\nPlease choose an option below:",
      ta: "இலங்கை முழுவதிலும் கிடைக்கும் வாகனங்களை பார்வையிட, கட்டணங்களை அறிய அல்லது நேரடியாக முன்பதிவு செய்ய நான் உதவுகிறேன்.\n\nகீழே உள்ள தெரிவுகளில் ஒன்றை தெரிவு செய்க:",
      si: "ශ්‍රී ලංකාව පුරා පවතින අපගේ වාහන සෙවීමට, ගාස්තු දැනගැනීමට හෝ සෘජුවම වෙන්කරවා ගැනීමට මට සහාය විය හැක.\n\nපහතින් විකල්පයක් තෝරන්න:"
    };

    return {
      type: 'text',
      text: fallbackTexts[activeLang] || fallbackTexts.en,
      suggestedActions: this.getSuggestedActions(activeLang)
    };
  }

  static getSuggestedActions(lang = 'en') {
    if (lang === 'ta') {
      return [
        { label: '⚡ உடனடி முன்பதிவு', query: 'வாகனம் முன்பதிவு செய்ய வேண்டும்' },
        { label: '🚗 கிடைக்கும் வாகனங்கள்', query: 'கிடைக்கும் கார்களைக் காட்டு' },
        { label: '💰 வைப்புத்தொகை (ரூ. 25,000)', query: 'பிணை வைப்புத்தொகை எவ்வளவு?' },
        { label: '📦 முன்பதிவு நிலை', query: 'எனது முன்பதிவை சரிபார்க்க' }
      ];
    }
    if (lang === 'si') {
      return [
        { label: '⚡ ක්ෂණිකව වෙන්කරන්න', query: 'මට වාහනයක් වෙන්කරන්න ඕනෙ' },
        { label: '🚗 පවතින වාහන', query: 'පවතින වාහන පෙන්වන්න' },
        { label: '💰 තැන්පතුව (රු. 25,000)', query: 'ඇප තැන්පතුව කීයද?' },
        { label: '📦 වෙන්කිරීම් පරීක්ෂාව', query: 'මගේ වෙන්කිරීම පරීක්ෂා කරන්න' }
      ];
    }
    return [
      { label: '⚡ Instant Book via AI', query: 'I want to book a car' },
      { label: '🚗 Available Fleet', query: 'Show available cars' },
      { label: '💰 Deposit & Rates (Rs.)', query: 'What is the security deposit?' },
      { label: '📦 Track Booking', query: 'Check my booking status' }
    ];
  }

  /**
   * Search vehicles live from database with LKR prices
   */
  static async handleFleetSearch(query, lang = 'en') {
    try {
      const vehicles = await getVehicles();
      let filtered = vehicles.filter(v => v.status === 'available');

      if (query.includes('suv')) {
        filtered = filtered.filter(v => (v.category_id || '').toLowerCase().includes('suv') || (v.name || '').toLowerCase().includes('suv') || (v.model || '').toLowerCase().includes('suv'));
      } else if (query.includes('van') || query.includes('வேன்') || query.includes('වෑන්')) {
        filtered = filtered.filter(v => (v.category_id || '').toLowerCase().includes('van') || (v.name || '').toLowerCase().includes('van'));
      } else if (query.includes('bus') || query.includes('பஸ்') || query.includes('බස්')) {
        filtered = filtered.filter(v => (v.category_id || '').toLowerCase().includes('bus') || (v.name || '').toLowerCase().includes('bus'));
      }

      if (filtered.length === 0) {
        filtered = vehicles.filter(v => v.status === 'available').slice(0, 4);
      } else {
        filtered = filtered.slice(0, 4);
      }

      const headers = {
        en: `Here are **${filtered.length} matching vehicles** ready for immediate reservation in Sri Lanka:`,
        ta: `இலங்கையில் உடனடியாக முன்பதிவு செய்யக்கூடிய **${filtered.length} வாகனங்கள்** இதோ:`,
        si: `ශ්‍රී ලංකාවේ වෙන්කරවා ගැනීමට සූදානම් **වාහන ${filtered.length} ක්** මෙන්න:`
      };

      return {
        type: 'vehicles',
        text: headers[lang] || headers.en,
        vehicles: filtered,
        suggestedActions: this.getSuggestedActions(lang)
      };
    } catch (err) {
      console.warn('Fleet search error:', err);
      return {
        type: 'text',
        text: "Please head to our [Catalog](/catalog) to explore all live vehicles."
      };
    }
  }

  /**
   * Direct booking intent handler
   */
  static async handleDirectBookingIntent(query, currentUser, lang = 'en') {
    try {
      const vehicles = await getVehicles();
      const availableVehicles = vehicles.filter(v => v.status === 'available');

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
      }

      if (!matchedVehicle && (query.includes('suv') || query.includes('ජීප්'))) {
        matchedVehicle = availableVehicles.find(v => (v.category_id || '').toLowerCase().includes('suv'));
      }

      const titles = {
        en: {
          single: (name) => `⚡ **Yes! You can book directly via RentFlow AI.**\n\nI have prepared an instant in-chat reservation for the **${name}** below:`,
          list: "⚡ **Yes! You can book any vehicle directly via RentFlow AI in seconds.**\n\nSelect any car below to launch an instant in-chat reservation:"
        },
        ta: {
          single: (name) => `⚡ **ஆம்! நீங்கள் நேரடியாக RentFlow AI மூலம் முன்பதிவு செய்யலாம்.**\n\n**${name}** வாகனத்திற்கான முன்பதிவு படிவம் இதோ:`,
          list: "⚡ **ஆம்! நீங்கள் விரும்பிய வாகனத்தை நேரடியாக RentFlow AI மூலம் உடனடியாக முன்பதிவு செய்யலாம்.**\n\nகீழே உள்ள வாகனங்களில் ஒன்றை தேர்வு செய்க:"
        },
        si: {
          single: (name) => `⚡ **ඔව්! ඔබට RentFlow AI හරහා සෘජුවම වාහන වෙන්කරගත හැක.**\n\n**${name}** සඳහා වෙන්කිරීමේ පෝරමය පහතින් සකස් කර ඇත:`,
          list: "⚡ **ඔව්! ඔබට අවශ්‍ය ඕනෑම වාහනයක් මෙහිදීම ක්ෂණිකව වෙන්කරගත හැක.**\n\nපහතින් වාහනයක් තෝරාගන්න:"
        }
      };

      const langObj = titles[lang] || titles.en;

      if (matchedVehicle) {
        return {
          type: 'ai_booking_flow',
          text: langObj.single(`${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name}`),
          vehicle: matchedVehicle,
          prefill: {
            customer_name: currentUser?.full_name || '',
            customer_email: currentUser?.email || '',
            customer_phone: currentUser?.phone || ''
          }
        };
      }

      const topVehicles = availableVehicles.slice(0, 4);
      return {
        type: 'vehicles',
        text: langObj.list,
        vehicles: topVehicles,
        isBookingPrompt: true,
        suggestedActions: this.getSuggestedActions(lang)
      };
    } catch (err) {
      console.warn('handleDirectBookingIntent error:', err);
      return {
        type: 'text',
        text: "Please explore our [Catalog](/catalog) or choose an available car below."
      };
    }
  }

  /**
   * Handle booking reference lookup
   */
  static async handleBookingLookup(reference, currentUser, lang = 'en') {
    try {
      const bookings = await getBookings();
      const vehicles = await getVehicles();

      if (reference) {
        const cleanRef = reference.replace(/#/g, '').trim().toUpperCase();
        const found = bookings.find(b => (b.booking_reference || '').toUpperCase().includes(cleanRef) || (b.booking_code || '').toUpperCase().includes(cleanRef) || (b.id || '').toUpperCase().includes(cleanRef));

        if (found) {
          const vehicle = vehicles.find(v => v.id === found.vehicle_id);
          const foundTexts = {
            en: `Found booking record for reference **${found.booking_code || found.booking_reference || found.id}**:`,
            ta: `முன்பதிவு இலக்கம் **${found.booking_code || found.booking_reference || found.id}** காணப்பட்டது:`,
            si: `අංක **${found.booking_code || found.booking_reference || found.id}** සහිත වෙන්කිරීම හමුවිය:`
          };

          return {
            type: 'booking',
            text: foundTexts[lang] || foundTexts.en,
            booking: { ...found, vehicle },
            suggestedActions: this.getSuggestedActions(lang)
          };
        } else {
          const notFoundTexts = {
            en: `⚠️ No active reservation was found matching reference **${cleanRef}**. Please verify your booking code.`,
            ta: `⚠️ **${cleanRef}** இலக்கத்திற்குரிய முன்பதிவு எதுவும் காணப்படவில்லை. தயவுசெய்து இலக்கத்தை சரிபார்க்கவும்.`,
            si: `⚠️ **${cleanRef}** අංකයට අදාළ වෙන්කිරීමක් හමු නොවීය. කරුණාකර අංකය පරීක්ෂා කරන්න.`
          };

          return {
            type: 'text',
            text: notFoundTexts[lang] || notFoundTexts.en,
            suggestedActions: this.getSuggestedActions(lang)
          };
        }
      }

      return {
        type: 'text',
        text: lang === 'ta' ? "முன்பதிவை சரிபார்க்க, தயவுசெய்து உங்கள் முன்பதிவு இலக்கத்தை (எ.கா: `RF-2026-101`) பதிவிடுங்கள்." : lang === 'si' ? "ඔබගේ වෙන්කිරීම පරීක්ෂා කිරීමට කරුණාකර වෙන්කිරීමේ අංකය (උදා: `RF-2026-101`) ඇතුළත් කරන්න." : "To track your booking instantly, please provide your **Booking Reference Number** (e.g. `RF-2026-101`).",
        suggestedActions: this.getSuggestedActions(lang)
      };
    } catch (err) {
      console.warn('Booking lookup error:', err);
      return {
        type: 'text',
        text: "Unable to retrieve booking records right now."
      };
    }
  }

  /**
   * Locations query
   */
  static async handleLocationsQuery(lang = 'en') {
    try {
      const locations = await getLocations();
      if (locations && locations.length > 0) {
        const listText = locations.map(loc => `* **${loc.name}**: ${loc.address}, ${loc.city}`).join('\n');
        const locTexts = {
          en: `We operate at **${locations.length} authorized pickup hubs** across Sri Lanka with 24/7 key handover:\n\n${listText}`,
          ta: `இலங்கையில் **${locations.length} பிரதான நிலையங்கள்** மூலம் 24 மணி நேரமும் சேவைகளை வழங்குகிறோம்:\n\n${listText}`,
          si: `ශ්‍රී ලංකාව පුරා ප්‍රධාන මධ්‍යස්ථාන **${locations.length} ක්** මඟින් පැය 24 පුරාම සේවා සපයනු ලැබේ:\n\n${listText}`
        };

        return {
          type: 'text',
          text: locTexts[lang] || locTexts.en,
          suggestedActions: this.getSuggestedActions(lang)
        };
      }
    } catch (err) {
      console.warn('Locations query error:', err);
    }

    return {
      type: 'text',
      text: "Our hubs include **Bandaranaike Int Airport (CMB)**, **Colombo Flagship Hub (Galle Face)**, **Galle Coastal Depot**, and **Kandy Terminal**."
    };
  }

  /**
   * Confirm AI booking
   */
  static async confirmAIBooking(bookingData) {
    return await createBooking(bookingData);
  }

  /**
   * Submit inquiry
   */
  static async submitInquiry({ name, email, phone, subject, message }) {
    if (!name || !email || !message) {
      throw new Error("Name, email, and message are required.");
    }
    return await saveContactMessage({
      name,
      email,
      phone: phone || '',
      subject: subject || 'Multilingual AI Chatbot Inquiry',
      message
    });
  }
}
