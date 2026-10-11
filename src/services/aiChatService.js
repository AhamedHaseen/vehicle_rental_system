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
      en: "We offer **100% Free Cancellation** up to **24 hours** prior to your pickup time.\n\nTo cancel a reservation, open **[My Bookings](/my-bookings)**, locate your booking card, and click **Cancel Booking**.",
      ta: "வாகனம் எடுக்கும் நேரத்திற்கு **24 மணித்தியாலங்களுக்கு முன்னர்** ரத்து செய்தால் **100% முழு பணமும் இலவசமாக மீளளிக்கப்படும்**.\n\nமுன்பதிவை ரத்து செய்ய, **[எனது முன்பதிவுகள்](/my-bookings)** பகுதிக்குச் சென்று **Cancel Booking** பொத்தானை அழுத்தவும்.",
      si: "ලබාගැනීමේ වේලාවට පැය **24 කට පෙර** වෙන්කිරීම අවලංගු කළහොත් **100% ක් නොමිලේ මුදල් ආපසු ලබාදේ**.\n\nවෙන්කිරීම අවලංගු කිරීමට, **[මගේ වෙන්කිරීම්](/my-bookings)** වෙත ගොස් **Cancel Booking** ක්ලික් කරන්න."
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
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
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

    // Quick natural thinking delay
    await new Promise(resolve => setTimeout(resolve, 150));

    // 0. Check for Vehicle Details Intent (e.g. "details of prius", "specs of bmw", or "show details")
    if (
      query.includes('detail') ||
      query.includes('spec') ||
      query.includes('features of') ||
      query.includes('about the') ||
      query.includes('technical spec') ||
      query.includes('engine') ||
      query.includes('odometer') ||
      query.includes('விபரம்') ||
      query.includes('விவரம்') ||
      query.includes('විස්තර') ||
      query.startsWith('view ')
    ) {
      const detailsResult = await this.handleVehicleDetails(query, activeLang);
      if (detailsResult) return detailsResult;
    }

    // 1. Check for Direct Booking intent (in English, Tamil, Sinhala)
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

    // 2. Check for Cancel Booking Intent
    const isCancelBookingQuery = (
      query.includes('cancel booking') ||
      query.includes('cancel my booking') ||
      query.includes('how to cancel') ||
      query.includes('how do i cancel') ||
      query.includes('cancellation') ||
      query.includes('cancel reservation') ||
      query.includes('முன்பதிவு ரத்து') ||
      query.includes('ரத்து செய்வது எப்படி') ||
      query.includes('ரத்து செய்க') ||
      query.includes('වෙන්කිරීම අවලංගු') ||
      query.includes('අවලංගු කරන්නේ කෙසේද')
    );

    if (isCancelBookingQuery) {
      return await this.handleCancelBookingIntent(currentUser, activeLang);
    }

    // 3. Check for Rental History Intent
    const isRentalHistoryQuery = (
      query.includes('rental history') ||
      query.includes('trip history') ||
      query.includes('past booking') ||
      query.includes('past bookings') ||
      query.includes('previous booking') ||
      query.includes('previous bookings') ||
      query.includes('past rental') ||
      query.includes('my history') ||
      query === 'history' ||
      query.includes('show history') ||
      query.includes('வாடகை வரலாறு') ||
      query.includes('பயண வரலாறு') ||
      query.includes('முந்தைய பயணம்') ||
      query.includes('කුලී ඉතිහාසය') ||
      query.includes('ගමන් ඉතිහාසය') ||
      query.includes('පෙර වෙන්කිරීම්')
    );

    if (isRentalHistoryQuery) {
      return await this.handleRentalHistoryIntent(currentUser, activeLang);
    }

    // 4. Check for Rates & Deposit Intent
    const isRatesAndDepositQuery = (
      query.includes('rates and deposit') ||
      query.includes('rates & deposit') ||
      query.includes('rates and security deposit') ||
      query.includes('what are the rates') ||
      query.includes('rental rates') ||
      query.includes('rate & deposit') ||
      query.includes('security deposit') ||
      query.includes('deposit amount') ||
      query.includes('கட்டணம் & வைப்புத்தொகை') ||
      query.includes('கட்டணம் மற்றும் வைப்புத்தொகை') ||
      query.includes('பிணை வைப்புத்தொகை') ||
      query.includes('வைப்புத்தொகை விபரம்') ||
      query.includes('ගාස්තු සහ ඇප තැන්පතු') ||
      query.includes('ඇප තැන්පතු විස්තර') ||
      query.includes('ඇප තැන්පතුව කීයද')
    );

    if (isRatesAndDepositQuery) {
      return this.handleRatesAndDeposit(activeLang);
    }

    // 5. Check for Booking Reference Lookup (e.g., RF-2026-881, #RF-2026-881, or "booking status")
    let explicitRef = null;
    const rfMatch = rawInput.match(/\b(RF-[A-Za-z0-9-]+)\b/i) || rawInput.match(/\b(bk-[A-Za-z0-9-]+)\b/i);
    if (rfMatch) {
      explicitRef = rfMatch[1].toUpperCase();
    } else {
      const hashMatch = rawInput.match(/#([A-Za-z0-9-]{3,})/i);
      if (hashMatch) {
        explicitRef = hashMatch[1].toUpperCase();
      } else {
        const labeledCode = rawInput.match(/(?:booking\s+(?:code|ref|reference|no|num|id|number)|code|reference|ref)\s*[:#-]?\s*([A-Za-z0-9-]+)/i);
        if (labeledCode) {
          const candidate = labeledCode[1].trim();
          const nonCodes = ['status', 'details', 'detail', 'info', 'check', 'active', 'update', 'please', 'now', 'car', 'vehicle', 'reservation'];
          if (!nonCodes.includes(candidate.toLowerCase())) {
            explicitRef = candidate.toUpperCase();
          }
        }
      }
    }

    const isBookingStatusQuery = (
      explicitRef !== null ||
      query.includes('booking status') ||
      query.includes('status of my booking') ||
      query.includes('status of booking') ||
      query.includes('status of the booking') ||
      query.includes('check my booking') ||
      query.includes('check booking') ||
      query.includes('check my bookings') ||
      query.includes('track booking') ||
      query.includes('track my booking') ||
      query.includes('track') ||
      query.includes('my booking') ||
      query.includes('my bookings') ||
      query.includes('view in my bookings') ||
      query.includes('view my bookings') ||
      query.includes('already booked') ||
      query.includes('allready booked') ||
      query.includes('booked car') ||
      query.includes('booked vehicle') ||
      query.includes('show booked') ||
      query.includes('show my booking') ||
      query.includes('reservation status') ||
      query.includes('booking detail') ||
      query.includes('booking info') ||
      (query.includes('booking') && (query.includes('status') || query.includes('check') || query.includes('track') || query.includes('find') || query.includes('show') || query.includes('where') || query.includes('view'))) ||
      // Tamil triggers
      query.includes('முன்பதிவு நிலை') ||
      query.includes('முன்பதிவு நிலவரம்') ||
      query.includes('எனது முன்பதிவு') ||
      query.includes('முன்பதிவை சரிபார்க்க') ||
      query.includes('முன்பதிவு செய்த') ||
      (query.includes('முன்பதிவு') && (query.includes('நிலை') || query.includes('சரிபார்க்க') || query.includes('பார்க்க'))) ||
      // Sinhala triggers
      query.includes('වෙන්කිරීමේ තත්වය') ||
      query.includes('මගේ වෙන්කිරීම') ||
      query.includes('වෙන්කිරීම පරීක්ෂා') ||
      query.includes('වෙන්කිරීම් පරීක්ෂාව') ||
      query.includes('වෙන්කර ඇති') ||
      query.includes('තත්වය') ||
      query.includes('පරීක්ෂා')
    );

    if (isBookingStatusQuery) {
      return await this.handleBookingLookup(
        explicitRef,
        currentUser,
        activeLang
      );
    }

    // 3. Check for Inquiry Submission intent
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

    // 4. Check for Location / Hubs query
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

    // 5. Check FAQ & Policy Answers
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

    // 6. Check for Vehicle & Fleet Search / Filtering Queries
    const vehicleKeywords = [
      'car', 'suv', 'van', 'bus', 'vehicle', 'fleet', 'drive', 'rent', 'available', 'cheap', 'budget', 'luxury', 'automatic', 'manual', 'petrol', 'diesel', 'hybrid', 'electric',
      'all', 'filter',
      'கார்', 'வாகனம்', 'பஸ்', 'வேன்', 'விலை',
      'කාර්', 'වාහන', 'වෑන්', 'බස්', 'මිල', 'ගාස්තු'
    ];
    const isVehicleQuery = vehicleKeywords.some(kw => query.includes(kw)) || query.includes('how much') || query.includes('price');

    if (isVehicleQuery) {
      return await this.handleFleetSearch(query, activeLang);
    }

    // 7. Greetings & Casual Hello
    if (/^(hi|hello|hey|good morning|vanakkam|ayubowan|வணக்கம்|ආයුබෝවන්)\b/i.test(query)) {
      const greetingTexts = {
        en: `Hello! 👋 Welcome to **RentFlow Sri Lanka**.\n\nI can help you:\n* 🚗 **Browse & filter available vehicles in LKR (Rs.)**\n* 🔍 **View full technical specs & features of any car**\n* ⚡ **Book instantly directly inside this chat**\n* 📦 **Track your existing reservation status**\n\nHow can I help you today?`,
        ta: `வணக்கம்! 👋 **RentFlow இலங்கை** உதவி மையத்திற்கு நல்வரவு.\n\nநான் உங்களுக்கு:\n* 🚗 **இலங்கை ரூபாவில் (Rs.) கிடைக்கும் வாகனங்களை வடிகட்டி அறிய**\n* 🔍 **ஒவ்வொரு வாகனத்தின் முழுமையான தொழில்நுட்ப விபரங்களை பார்க்க**\n* ⚡ **இங்கேயே நேரடியாக முன்பதிவு செய்ய**\n* 📦 **உங்கள் முன்பதிவு நிலையை அறிய**\n\nஉதவ முடியும். உங்கள் தேவை என்ன?`,
        si: `ආයුබෝවන්! 👋 **RentFlow ශ්‍රී ලංකා** වෙත සාදරයෙන් පිළිගනිමු.\n\nමට ඔබට:\n* 🚗 **ශ්‍රී ලංකා රුපියල් වලින් (Rs.) වාහන තෝරාගැනීමට**\n* 🔍 **ඕනෑම වාහනයක සම්පූර්ණ තාක්ෂණික විස්තර බැලීමට**\n* ⚡ **මෙහිදීම සෘජුවම වාහන වෙන්කරවා ගැනීමට**\n* 📦 **ඔබගේ වෙන්කිරීම් පරීක්ෂා කිරීමට**\n\nසහාය විය හැක. ඔබට අවශ්‍ය කුමක්ද?`
      };

      return {
        type: 'text',
        text: greetingTexts[activeLang] || greetingTexts.en,
        suggestedActions: this.getSuggestedActions(activeLang)
      };
    }

    // 8. General Fallback
    const fallbackTexts = {
      en: "I can help you explore our verified fleet, review full technical specifications, filter available vehicles, or book directly in Sri Lankan Rupees (Rs.).\n\nPlease choose an option below:",
      ta: "வாகனங்களை வடிகட்ட, தொழில்நுட்ப விபரங்களை அறிய அல்லது நேரடியாக முன்பதிவு செய்ய நான் உதவுகிறேன்.\n\nகீழே உள்ள தெரிவுகளில் ஒன்றை தெரிவு செய்க:",
      si: "වාහන පෙරහන් කිරීමට, සම්පූර්ණ තාක්ෂණික විස්තර බැලීමට හෝ සෘජුවම වෙන්කරවා ගැනීමට මට සහාය විය හැක.\n\nපහතින් විකල්පයක් තෝරන්න:"
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
        { label: 'வாகனம் முன்பதிவு', query: 'வாகனம் முன்பதிவு செய்ய வேண்டும்' },
        { label: 'கிடைக்கும் வாகனங்கள்', query: 'கிடைக்கும் கார்களைக் காட்டு' },
        { label: 'கட்டணம் & வைப்புத்தொகை', query: 'கட்டணம் மற்றும் வைப்புத்தொகை விபரம்' },
        { label: 'முன்பதிவு கண்காணிப்பு', query: 'எனது முன்பதிவை கண்காணிக்க' },
        { label: 'முன்பதிவுகளை பார்க்க', query: 'எனது முன்பதிவுகளை பார்க்க' },
        { label: 'முன்பதிவு ரத்து', query: 'முன்பதிவை ரத்து செய்வது எப்படி?' },
        { label: 'வாடகை வரலாறு', query: 'எனது முந்தைய பயண வரலாறு' }
      ];
    }
    if (lang === 'si') {
      return [
        { label: 'වාහනයක් වෙන්කරන්න', query: 'මට වාහනයක් වෙන්කරන්න ඕනෙ' },
        { label: 'පවතින වාහන', query: 'පවතින වාහන පෙන්වන්න' },
        { label: 'ගාස්තු සහ ඇප තැන්පතු', query: 'ගාස්තු සහ ඇප තැන්පතුව කීයද?' },
        { label: 'වෙන්කිරීම් පරීක්ෂාව', query: 'මගේ වෙන්කිරීම පරීක්ෂා කරන්න' },
        { label: 'වෙන්කිරීම් බලන්න', query: 'මගේ වෙන්කිරීම් බලන්න' },
        { label: 'වෙන්කිරීම අවලංගු කිරීම', query: 'වෙන්කිරීම අවලංගු කරන්නේ කෙසේද?' },
        { label: 'කුලී ඉතිහාසය', query: 'මගේ කුලී ඉතිහාසය පෙන්වන්න' }
      ];
    }
    return [
      { label: 'Book a Car via AI', query: 'I want to book a car' },
      { label: 'Available Fleet', query: 'Show available cars' },
      { label: 'Rates & Deposit', query: 'What are the rates and security deposit?' },
      { label: 'Track Booking', query: 'Track my booking' },
      { label: 'View Bookings', query: 'View my bookings' },
      { label: 'Cancel Booking', query: 'How do I cancel my booking?' },
      { label: 'History', query: 'Show my rental history' }
    ];
  }

  /**
   * Handle Rates & Security Deposit Overview
   */
  static handleRatesAndDeposit(lang = 'en') {
    const responses = {
      en: `💰 **Rental Rates & Security Deposit Overview**:\n\n` +
          `• **Security Deposit**: Standard deposit is **Rs. 25,000** for economic & midsize cars (or **Rs. 50,000** for luxury models). **100% Refundable** immediately upon vehicle return inspection.\n` +
          `• **Daily Rates**: Economy hatchbacks from **Rs. 8,500/day**, Sedans from **Rs. 12,000/day**, Premium SUVs from **Rs. 22,000/day**.\n` +
          `• **Flexible Hourly Rates**: Available for short trips (calculated as daily rate ÷ 8 hours).\n` +
          `• **Optional Chauffeur**: Available at **+Rs. 4,500/day** with experienced local drivers.\n` +
          `• **Fuel Policy**: Full-to-Full. Clean pricing in Sri Lankan Rupees (**Rs.**) with zero hidden fees!`,
      ta: `💰 **வாடகைக் கட்டணங்கள் & பிணை வைப்புத்தொகை விபரம்**:\n\n` +
          `• **பிணை வைப்புத்தொகை (Security Deposit)**: சாதாரண வாகனங்களுக்கு **ரூ. 25,000**, ஆடம்பர மாடல்களுக்கு **ரூ. 50,000**. வாகனம் ஒப்படைக்கப்பட்டதும் **100% முழுமையாக திருப்பித் தரப்படும்**.\n` +
          `• **நாள் கட்டணம்**: சாதாரண கார்கள் **ரூ. 8,500/நாள்** முதல், சொகுசு கார்கள் **ரூ. 12,000/நாள்** முதல், SUV கார்கள் **ரூ. 22,000/நாள்** முதல் தொடங்குகின்றன.\n` +
          `• **மணித்தியால வாடகை**: குறுகிய பயணங்களுக்கு மணித்தியால அடிப்படையிலும் பெறலாம்.\n` +
          `• **சாரதி சேவை (விருப்பத்தேர்வு)**: **+ரூ. 4,500/நாள்** கட்டணத்தில் தொழில்முறை சாரதி.\n` +
          `• **எரிபொருள்**: Full-to-Full கொள்கை. மறைமுகக் கட்டணங்கள் எதுவுமில்லை!`,
      si: `💰 **කුලී ගාස්තු සහ ඇප තැන්පතු විස්තර**:\n\n` +
          `• **ඇප තැන්පතුව (Security Deposit)**: සාමාන්‍ය වාහන සඳහා **රු. 25,000** ක් වන අතර සුඛෝපභෝගී මාදිලි සඳහා **රු. 50,000** කි. වාහනය නැවත භාරදීමේදී **100% ක් සම්පූර්ණයෙන්ම ආපසු ගෙවනු ලැබේ**.\n` +
          `• **දෛනික ගාස්තු**: ආර්ථික පන්තියේ කාර් **දිනකට රු. 8,500** සිට, සෙඩාන් **දිනකට රු. 12,000** සිට, සුඛෝපභෝගී SUV **දිනකට රු. 22,000** සිට.\n` +
          `• **පැයක ගාස්තු**: නගරය තුළ කෙටි ගමන් සඳහා පැය අනුවද කුලියට ගත හැක.\n` +
          `• **රියදුරු සේවාව**: දිනකට **+රු. 4,500** කට පළපුරුදු රියදුරෙකු සමඟ ලබාගත හැක.\n` +
          `• **ඉන්ධන ප්‍රතිපත්තිය**: Full-to-Full ක්‍රමය. සැඟවුණු ගාස්තු කිසිවක් නොමැත!`
    };

    return {
      type: 'text',
      text: responses[lang] || responses.en,
      suggestedActions: [
        { label: 'Book a Car via AI', query: 'I want to book a car' },
        { label: 'Available Fleet', query: 'Show available cars' },
        { label: 'Track Booking', query: 'Track my booking' }
      ]
    };
  }

  /**
   * Handle Cancellation guidance and active reservation lookup
   */
  static async handleCancelBookingIntent(currentUser, lang = 'en') {
    try {
      const bookings = await getBookings();
      const vehicles = await getVehicles();

      let userBookings = [];
      if (currentUser) {
        userBookings = bookings.filter(b => 
          b.customer_id === currentUser.id ||
          (currentUser.email && (b.customer_email || '').toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.phone && b.customer_phone === currentUser.phone)
        );
      } else {
        userBookings = bookings.filter(b => !b.customer_id || b.customer_id === 'guest');
      }

      // Filter active or pending bookings
      const activeBookings = userBookings.filter(b => 
        ['active', 'confirmed', 'pending'].includes(b.booking_status || b.status)
      );

      if (activeBookings.length > 0) {
        const target = activeBookings[0];
        const vehicle = vehicles.find(v => v.id === target.vehicle_id) || {
          brand: target.vehicle_name?.split(' ')[0] || 'Rental',
          model: target.vehicle_name?.split(' ').slice(1).join(' ') || 'Vehicle'
        };
        const status = (target.booking_status || target.status || 'confirmed').toUpperCase();

        const cancelTexts = {
          en: `🛡️ **100% Free Cancellation Policy**:\n\n` +
              `You can cancel any booking **free of charge** up to **24 hours** before pickup.\n\n` +
              `**Your Active Reservation:**\n` +
              `• **Code:** \`${target.booking_code || target.id}\`\n` +
              `• **Vehicle:** ${vehicle.brand} ${vehicle.model || vehicle.name || target.vehicle_name || 'Vehicle'}\n` +
              `• **Status:** [${status}]\n` +
              `• **Refund:** 100% refundable security deposit and fees will be reimbursed.\n\n` +
              `To confirm cancellation, click **Go to My Bookings** below:`,
          ta: `🛡️ **100% இலவச முன்பதிவு ரத்து உத்தரவாதம்**:\n\n` +
              `வாகனம் எடுப்பதற்கு **24 மணிநேரத்திற்கு முன்னர்** ரத்து செய்தால் **100% முழுமையாக ரத்து செய்து பணத்தை மீளப்பெறலாம்**.\n\n` +
              `**உங்கள் தற்போதைய முன்பதிவு:**\n` +
              `• **இலக்கம்:** \`${target.booking_code || target.id}\`\n` +
              `• **வாகனம்:** ${vehicle.brand} ${vehicle.model || vehicle.name || target.vehicle_name || 'Vehicle'}\n` +
              `• **நிலை:** [${status}]\n\n` +
              `முன்பதிவை ரத்து செய்ய கீழே உள்ள **எனது முன்பதிவுகளில் ரத்து செய்க** பொத்தானை அழுத்தவும்:`,
          si: `🛡️ **100% නොමිලේ වෙන්කිරීම් අවලංගු කිරීමේ සහතිකය**:\n\n` +
              `වාහනය ලබාගැනීමට පැය **24 කට පෙර** අවලංගු කළහොත් කිසිදු අමතර ගාස්තුවකින් තොරව **100% මුදල් ආපසු ලබාගත හැක**.\n\n` +
              `**ඔබගේ සක්‍රීය වෙන්කිරීම:**\n` +
              `• **අංකය:** \`${target.booking_code || target.id}\`\n` +
              `• **වාහනය:** ${vehicle.brand} ${vehicle.model || vehicle.name || target.vehicle_name || 'Vehicle'}\n` +
              `• **තත්වය:** [${status}]\n\n` +
              `වෙන්කිරීම අවලංගු කිරීමට පහතින් ඇති **මගේ වෙන්කිරීම් වෙතින් අවලංගු කරන්න** ක්ලික් කරන්න:`
        };

        return {
          type: 'text',
          text: cancelTexts[lang] || cancelTexts.en,
          suggestedActions: [
            { label: 'Open My Bookings to Cancel', link: '/my-bookings' },
            { label: 'Track Booking', query: 'Track my booking' },
            { label: 'Available Fleet', query: 'Show available cars' }
          ]
        };
      }

      const noActiveTexts = {
        en: `🛡️ **RentFlow Cancellation & Refund Policy**:\n\n` +
            `• **100% Free Cancellation** is provided up to 24 hours prior to scheduled pickup.\n` +
            `• Full refund of all rental fees and security deposits is immediately dispatched.\n\n` +
            `You do not have any active vehicle reservations currently pending cancellation.`,
        ta: `🛡️ **RentFlow முன்பதிவு ரத்து கொள்கை**:\n\n` +
            `• வாகனம் எடுப்பதற்கு 24 மணிநேரத்திற்கு முன் ரத்து செய்தால் **100% இலவச ரத்து**.\n` +
            `• அனைத்து வைப்புத்தொகைகளும் உடனடியாக மீளளிக்கப்படும்.\n\n` +
            `உங்களிடம் தற்போது ரத்து செய்வதற்குரிய முன்பதிவுகள் எதுவும் இல்லை.`,
        si: `🛡️ **RentFlow අවලංගු කිරීමේ ප්‍රතිපත්තිය**:\n\n` +
            `• වාහනය ලබාගැනීමට පැය 24 කට පෙර **100% නොමිලේ අවලංගු කළ හැක**.\n` +
            `• සියලුම තැන්පතු සහ මුදල් වහාම ආපසු ගෙවනු ලැබේ.\n\n` +
            `ඔබ සතුව දැනට අවලංගු කිරීමට සක්‍රීය වෙන්කිරීම් නොමැත.`
      };

      return {
        type: 'text',
        text: noActiveTexts[lang] || noActiveTexts.en,
        suggestedActions: [
          { label: 'Book a Car via AI', query: 'I want to book a car' },
          { label: 'Available Fleet', query: 'Show available cars' },
          { label: 'View Bookings', link: '/my-bookings' }
        ]
      };
    } catch (err) {
      console.warn('handleCancelBookingIntent error:', err);
      return {
        type: 'text',
        text: "You can manage or cancel your reservations anytime in [My Bookings](/my-bookings).",
        suggestedActions: [{ label: 'My Bookings', link: '/my-bookings' }]
      };
    }
  }

  /**
   * Handle Rental Journey History Overview
   */
  static async handleRentalHistoryIntent(currentUser, lang = 'en') {
    try {
      const bookings = await getBookings();
      const vehicles = await getVehicles();

      let userBookings = [];
      if (currentUser) {
        userBookings = bookings.filter(b => 
          b.customer_id === currentUser.id ||
          (currentUser.email && (b.customer_email || '').toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.phone && b.customer_phone === currentUser.phone)
        );
      } else {
        userBookings = bookings.filter(b => !b.customer_id || b.customer_id === 'guest');
      }

      const completed = userBookings.filter(b => 
        (b.booking_status || b.status) === 'completed' ||
        (b.booking_status || b.status) === 'cancelled'
      );

      if (completed.length > 0) {
        const completedItems = completed.slice(0, 3).map(b => {
          const v = vehicles.find(veh => veh.id === b.vehicle_id);
          const name = v ? `${v.brand} ${v.model || v.name}` : (b.vehicle_name || 'RentFlow Car');
          const status = (b.booking_status || b.status || 'completed').toUpperCase();
          const amount = b.total_price ? `Rs. ${Number(b.total_price).toLocaleString()}` : '';
          return `• **${name}** [${status}] • ${b.start_date || 'Past'} to ${b.end_date || 'Past'} ${amount ? `• **${amount}**` : ''}`;
        }).join('\n');

        const historyTexts = {
          en: `📜 **Your Rental Journey History**:\n\n` +
              `You have **${completed.length}** past journey record(s) with RentFlow Sri Lanka:\n\n` +
              `${completedItems}\n\n` +
              `You can download tax invoices and review inspection details in **My Bookings**.`,
          ta: `📜 **உங்கள் முந்தைய பயண வரலாறு**:\n\n` +
              `RentFlow நிறுவனத்தில் உங்கள் **${completed.length}** முந்தைய பயண பதிவுகள்:\n\n` +
              `${completedItems}\n\n` +
              `முழுமையான ரசீதுகளை **எனது முன்பதிவுகள்** பக்கத்தில் பார்வையிடலாம்.`,
          si: `📜 **ඔබගේ පෙර කුලී ගමන් ඉතිහාසය**:\n\n` +
              `RentFlow සමඟ ඔබගේ පෙර සංචාර වාර්තා **${completed.length}** ක් ඇත:\n\n` +
              `${completedItems}\n\n` +
              `සම්පූර්ණ බිල්පත් **මගේ වෙන්කිරීම්** වෙතින් ලබාගත හැක.`
        };

        return {
          type: 'text',
          text: historyTexts[lang] || historyTexts.en,
          suggestedActions: [
            { label: 'View All in My Bookings', link: '/my-bookings' },
            { label: 'Book a Car via AI', query: 'I want to book a car' },
            { label: 'Available Fleet', query: 'Show available cars' }
          ]
        };
      }

      // Check if user has active/pending bookings instead
      const activeList = userBookings.filter(b => ['active', 'confirmed', 'pending'].includes(b.booking_status || b.status));
      if (activeList.length > 0) {
        const activeTexts = {
          en: `📜 **Rental History**:\n\n` +
              `You currently have **${activeList.length} active/upcoming reservation(s)** in progress! Once your vehicle journey is completed and returned, your detailed trip history and invoices will appear here.`,
          ta: `📜 **வாடகை வரலாறு**:\n\n` +
              `உங்களிடம் தற்போது **${activeList.length} முன்பதிவு(கள்)** செயல்பாட்டில் உள்ளன. உங்கள் பயணம் நிறைவடைந்ததும் முழு வரலாறு இங்கே தோன்றும்.`,
          si: `📜 **කුලී ඉතිහාසය**:\n\n` +
              `ඔබ සතුව දැනට සක්‍රීය වෙන්කිරීම් **${activeList.length}** ක් ඇත. ඔබගේ ගමන අවසන් වූ පසු සම්පූර්ණ ඉතිහාසය මෙහි සටහන් වේ.`
        };

        return {
          type: 'text',
          text: activeTexts[lang] || activeTexts.en,
          suggestedActions: [
            { label: 'Track Booking', query: 'Track my booking' },
            { label: 'View Bookings', link: '/my-bookings' }
          ]
        };
      }

      const noHistoryTexts = {
        en: `📜 **Rental History**:\n\n` +
            `You do not have any completed rental journeys yet. Reserve your first car with RentFlow AI to kick off your trip!`,
        ta: `📜 **வாடகை வரலாறு**:\n\n` +
            `உங்களுக்கு இதுவரை எந்த பயண வரலாறும் இல்லை. RentFlow AI மூலம் உங்கள் முதல் வாகனத்தை இப்போதே முன்பதிவு செய்யுங்கள்!`,
        si: `📜 **කුලී ඉතිහාසය**:\n\n` +
            `ඔබට තවමත් සම්පූර්ණ කරන ලද කුලී ඉතිහාසයක් නොමැත. RentFlow AI සමඟ ඔබගේ පළමු වාහනය දැන්ම වෙන්කරවා ගන්න!`
      };

      return {
        type: 'text',
        text: noHistoryTexts[lang] || noHistoryTexts.en,
        suggestedActions: [
          { label: 'Book a Car via AI', query: 'I want to book a car' },
          { label: 'Available Fleet', query: 'Show available cars' },
          { label: 'Rates & Deposit', query: 'What are the rates and security deposit?' }
        ]
      };
    } catch (err) {
      console.warn('handleRentalHistoryIntent error:', err);
      return {
        type: 'text',
        text: "You can view your full rental history in [My Bookings](/my-bookings).",
        suggestedActions: [{ label: 'My Bookings', link: '/my-bookings' }]
      };
    }
  }

  /**
   * Handle full vehicle technical details view
   */
  static async handleVehicleDetails(query, lang = 'en') {
    try {
      const vehicles = await getVehicles();
      if (!vehicles || vehicles.length === 0) return null;

      // Extract requested vehicle model or brand
      let matchedVehicle = null;
      for (const v of vehicles) {
        if (v.id && query.includes(v.id.toLowerCase())) {
          matchedVehicle = v;
          break;
        }
        if (v.model && query.includes(v.model.toLowerCase())) {
          matchedVehicle = v;
          break;
        }
        if (v.brand && query.includes(v.brand.toLowerCase())) {
          matchedVehicle = v;
          break;
        }
      }

      // If generic "details" without a specific vehicle name, take the first available vehicle
      if (!matchedVehicle) {
        matchedVehicle = vehicles.find(v => v.status === 'available') || vehicles[0];
      }

      if (!matchedVehicle) return null;

      const isAvailable = matchedVehicle.status === 'available';

      // Find alternatives if this vehicle is currently rented or unavailable
      const alternatives = !isAvailable
        ? vehicles.filter(v => v.status === 'available' && v.id !== matchedVehicle.id).slice(0, 2)
        : [];

      const texts = {
        en: isAvailable
          ? `Here are the **complete technical specifications & features** for the **${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name}**:`
          : `⚠️ **The ${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name} is currently out on an active rental.**\n\nHere are its specifications, along with **ready-to-drive alternatives** currently available in Sri Lanka:`,
        ta: isAvailable
          ? `**${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name}** வாகனத்தின் **முழுமையான தொழில்நுட்ப விபரங்கள் & சிறப்பம்சங்கள்** இதோ:`
          : `⚠️ **${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name} வாகனம் தற்போது வாடகையில் உள்ளது (தற்போது கிடைக்கவில்லை).**\n\nஅதன் விபரங்கள் மற்றும் உடனடியாக கிடைக்கக்கூடிய மாற்று வாகனங்கள் இதோ:`,
        si: isAvailable
          ? `**${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name}** වාහනයේ **සම්පූර්ණ තාක්ෂණික විස්තර සහ පහසුකම්** මෙන්න:`
          : `⚠️ **${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name} වාහනය දැනට කුලියට ගෙන ඇති බැවින් ලබාගත නොහැක.**\n\nඑහි විස්තර සහ මේ වන විට ලබාගත හැකි විකල්ප වාහන මෙන්න:`
      };

      return {
        type: 'vehicle_details',
        text: texts[lang] || texts.en,
        vehicle: matchedVehicle,
        isAvailable,
        alternatives,
        suggestedActions: [
          isAvailable
            ? { label: '⚡ Book This Car via AI', query: `Book ${matchedVehicle.model || matchedVehicle.brand}` }
            : { label: '📝 Priority Waitlist / Inquiry', query: `Inquiry for unavailable ${matchedVehicle.model || matchedVehicle.brand}` },
          { label: '🚗 Explore Other Fleet', query: 'Show available cars' }
        ]
      };
    } catch (err) {
      console.warn('handleVehicleDetails error:', err);
      return null;
    }
  }

  /**
   * Search vehicles live from database with interactive filtering & responsive unavailable messaging
   */
  static async handleFleetSearch(query, lang = 'en') {
    try {
      const allVehicles = await getVehicles();
      const availableVehicles = allVehicles.filter(v => v.status === 'available');

      let filterType = 'all';
      let filtered = [...availableVehicles];

      // Check filters
      if (query.includes('suv') || query.includes('ජීප්')) {
        filterType = 'suv';
        filtered = availableVehicles.filter(v => (v.category_id || '').toLowerCase().includes('suv') || (v.category || '').toLowerCase().includes('suv') || (v.name || '').toLowerCase().includes('suv') || (v.model || '').toLowerCase().includes('suv'));
      } else if (query.includes('van') || query.includes('வேன்') || query.includes('වෑන්')) {
        filterType = 'van';
        filtered = availableVehicles.filter(v => (v.category_id || '').toLowerCase().includes('van') || (v.category || '').toLowerCase().includes('van') || (v.name || '').toLowerCase().includes('van'));
      } else if (query.includes('car') || query.includes('sedan') || query.includes('கார்') || query.includes('කාර්')) {
        filterType = 'car';
        filtered = availableVehicles.filter(v => (v.category_id || '').toLowerCase().includes('car') || (v.category || '').toLowerCase().includes('car') || (v.seats && v.seats <= 5));
      } else if (query.includes('hybrid') || query.includes('eco')) {
        filterType = 'hybrid';
        filtered = availableVehicles.filter(v => (v.fuel_type || '').toLowerCase().includes('hybrid') || (v.model || '').toLowerCase().includes('prius') || (v.model || '').toLowerCase().includes('vezel') || (v.model || '').toLowerCase().includes('axio'));
      } else if (query.includes('budget') || query.includes('cheap') || query.includes('குறைந்த') || query.includes('අඩු')) {
        filterType = 'budget';
        filtered = availableVehicles.filter(v => Number(v.price_per_day || 0) <= 15000);
        if (filtered.length === 0) {
          filtered = [...availableVehicles].sort((a, b) => Number(a.price_per_day || 0) - Number(b.price_per_day || 0)).slice(0, 3);
        }
      } else if (query.includes('auto')) {
        filterType = 'auto';
        filtered = availableVehicles.filter(v => (v.transmission || '').toLowerCase().includes('auto'));
      }

      // Check if user specifically requested a model that is CURRENTLY UNAVAILABLE
      for (const v of allVehicles) {
        if ((v.model && query.includes(v.model.toLowerCase())) || (v.brand && query.includes(v.brand.toLowerCase()))) {
          if (v.status !== 'available') {
            const alternatives = availableVehicles.slice(0, 3);
            const unavailableTexts = {
              en: `⚠️ **The ${v.brand} ${v.model || v.name} is currently out on an active rental.**\n\nIt is expected to return soon. Here are **${alternatives.length} ready-to-drive alternatives** currently available for immediate handover:`,
              ta: `⚠️ **${v.brand} ${v.model || v.name} வாகனம் தற்போது வாடகையில் உள்ளது (தற்போது கிடைக்கவில்லை).**\n\nஉடனடியாக நீங்கள் வாடகைக்கு எடுக்கக்கூடிய **${alternatives.length} மாற்று வாகனங்கள்** இதோ:`,
              si: `⚠️ **${v.brand} ${v.model || v.name} වාහනය දැනට කුලියට ගෙන ඇති බැවින් ලබාගත නොහැක.**\n\nමේ වන විට වහාම ලබාගත හැකි **විකල්ප වාහන ${alternatives.length} ක්** මෙන්න:`
            };

            return {
              type: 'unavailable_notice',
              text: unavailableTexts[lang] || unavailableTexts.en,
              unavailableVehicle: v,
              vehicles: alternatives,
              filterType,
              suggestedActions: [
                { label: '📝 Priority Waitlist / Inquiry', query: `Inquiry for unavailable ${v.model || v.brand}` },
                { label: '🚗 View All Available Cars', query: 'Show available cars' }
              ]
            };
          }
        }
      }

      // If NO vehicles matched the filter
      if (filtered.length === 0) {
        const alternatives = availableVehicles.slice(0, 3);
        const noMatchTexts = {
          en: `⚠️ **All vehicles under the "${filterType.toUpperCase()}" filter are currently booked.**\n\nNo units are available in this category right now. However, here are our top ready-to-drive alternatives:`,
          ta: `⚠️ **"${filterType.toUpperCase()}" பிரிவில் உள்ள அனைத்து வாகனங்களும் தற்போது முன்பதிவு செய்யப்பட்டுள்ளன.**\n\nஉடனடியாக கிடைக்கக்கூடிய பிற மாற்று வாகனங்கள் இதோ:`,
          si: `⚠️ **"${filterType.toUpperCase()}" කාණ්ඩයේ සියලුම වාහන දැනට කුලියට ගෙන ඇත.**\n\nකෙසේ වෙතත්, මේ වන විට වහාම ලබාගත හැකි විකල්ප වාහන මෙන්න:`
        };

        return {
          type: 'unavailable_notice',
          text: noMatchTexts[lang] || noMatchTexts.en,
          vehicles: alternatives,
          filterType,
          suggestedActions: [
            { label: '📝 Submit Custom Fleet Inquiry', query: `Inquiry for ${filterType} vehicles` },
            { label: '🚗 View All Available Cars', query: 'Show available cars' }
          ]
        };
      }

      // Limit results to 4
      const displayVehicles = filtered.slice(0, 4);

      const headers = {
        en: `Here are **${displayVehicles.length} available vehicles** in Sri Lanka (use the filter chips below to adjust):`,
        ta: `இலங்கையில் உடனடியாக கிடைக்கக்கூடிய **${displayVehicles.length} வாகனங்கள்** இதோ (கீழே உள்ள தெரிவுகள் மூலம் வடிகட்டலாம்):`,
        si: `ශ්‍රී ලංකාවේ වෙන්කරවා ගත හැකි **වාහන ${displayVehicles.length} ක්** මෙන්න (පහත බොත්තම් මඟින් පෙරහන් කරන්න):`
      };

      return {
        type: 'vehicles',
        text: headers[lang] || headers.en,
        vehicles: displayVehicles,
        filterType,
        totalAvailable: availableVehicles.length,
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
      const allVehicles = await getVehicles();
      const availableVehicles = allVehicles.filter(v => v.status === 'available');

      let matchedVehicle = null;
      for (const v of allVehicles) {
        if (v.model && query.includes(v.model.toLowerCase())) {
          matchedVehicle = v;
          break;
        }
        if (v.brand && query.includes(v.brand.toLowerCase())) {
          matchedVehicle = v;
          break;
        }
      }

      // If user requested a specific vehicle that is CURRENTLY UNAVAILABLE
      if (matchedVehicle && matchedVehicle.status !== 'available') {
        const alternatives = availableVehicles.slice(0, 3);
        const unavailableTexts = {
          en: `⚠️ **${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name} is currently out on rental.**\n\nYou can book any of our closely matching available alternatives right now, or submit a priority waitlist inquiry:`,
          ta: `⚠️ **${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name} வாகனம் தற்போது வாடகையில் உள்ளது.**\n\nஉடனடியாக கிடைக்கக்கூடிய மாற்று வாகனங்களில் ஒன்றை நீங்கள் முன்பதிவு செய்யலாம்:`,
          si: `⚠️ **${matchedVehicle.brand} ${matchedVehicle.model || matchedVehicle.name} වාහනය දැනට කුලියට ගෙන ඇත.**\n\nමේ වන විට ලබාගත හැකි විකල්ප වාහන වලින් එකක් ඔබට වෙන්කරගත හැක:`
        };

        return {
          type: 'unavailable_notice',
          text: unavailableTexts[lang] || unavailableTexts.en,
          unavailableVehicle: matchedVehicle,
          vehicles: alternatives,
          suggestedActions: [
            { label: '📝 Priority Waitlist / Inquiry', query: `Inquiry for unavailable ${matchedVehicle.model || matchedVehicle.brand}` },
            { label: '🚗 Available Fleet', query: 'Show available cars' }
          ]
        };
      }

      const titles = {
        en: {
          single: (name) => `⚡ **Direct AI Reservation: ${name}**\n\nSelect your dates and pickup hub below to confirm directly with our dispatch system:`,
          list: `⚡ **Select an available vehicle below to start an instant in-chat reservation:**`
        },
        ta: {
          single: (name) => `⚡ **நேரடி AI முன்பதிவு: ${name}**\n\nதிகதி மற்றும் நிலையத்தை தேர்வு செய்து முன்பதிவை உறுதி செய்க:`,
          list: `⚡ **முன்பதிவு செய்ய கீழே உள்ள வாகனங்களில் ஒன்றை தேர்வு செய்க:**`
        },
        si: {
          single: (name) => `⚡ **සෘජු AI වෙන්කිරීම: ${name}**\n\nදිනය සහ ස්ථානය තෝරා වෙන්කිරීම තහවුරු කරන්න:`,
          list: `⚡ **වෙන්කරවා ගැනීම සඳහා පහතින් වාහනයක් තෝරාගන්න:**`
        }
      };

      const langObj = titles[lang] || titles.en;

      if (matchedVehicle && matchedVehicle.status === 'available') {
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

      const resolveVehicle = (foundBooking) => {
        let vehicle = vehicles.find(v => v.id === foundBooking.vehicle_id);
        if (!vehicle && foundBooking.vehicle_name) {
          vehicle = vehicles.find(v => 
            v.brand && foundBooking.vehicle_name.toLowerCase().includes(v.brand.toLowerCase())
          );
        }
        if (!vehicle) {
          vehicle = {
            id: foundBooking.vehicle_id || 'vh-default',
            brand: foundBooking.vehicle_name?.split(' ')[0] || 'Rental',
            model: foundBooking.vehicle_name?.split(' ').slice(1).join(' ') || 'Fleet Vehicle',
            name: foundBooking.vehicle_name || 'RentFlow Fleet Vehicle',
            category: 'Car',
            image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
          };
        }
        return vehicle;
      };

      // 1. If user provided a specific reference number or code:
      if (reference) {
        const cleanRef = reference.replace(/#/g, '').trim().toUpperCase();
        const found = bookings.find(b => 
          (b.booking_code || '').toUpperCase().includes(cleanRef) || 
          (b.booking_reference || '').toUpperCase().includes(cleanRef) || 
          (b.id || '').toUpperCase().includes(cleanRef)
        );

        if (found) {
          const vehicle = resolveVehicle(found);
          const status = (found.booking_status || found.status || 'confirmed').toUpperCase();
          const foundTexts = {
            en: `Found reservation record **${found.booking_code || found.booking_reference || found.id}** [${status}]:`,
            ta: `முன்பதிவு இலக்கம் **${found.booking_code || found.booking_reference || found.id}** காணப்பட்டது [${status}]:`,
            si: `අංක **${found.booking_code || found.booking_reference || found.id}** සහිත වෙන්කිරීම හමුවිය [${status}]:`
          };

          return {
            type: 'booking',
            text: foundTexts[lang] || foundTexts.en,
            booking: { ...found, vehicle },
            suggestedActions: [
              { label: 'View in My Bookings', query: 'view in my bookings' },
              { label: 'Browse Available Fleet', query: 'Show available cars' }
            ]
          };
        } else {
          // If explicit reference not found, check if currentUser has any bookings anyway
          let userBookings = [];
          if (currentUser) {
            userBookings = bookings.filter(b => 
              b.customer_id === currentUser.id ||
              (currentUser.email && (b.customer_email || '').toLowerCase() === currentUser.email.toLowerCase()) ||
              (currentUser.phone && b.customer_phone === currentUser.phone)
            );
          }

          if (userBookings.length > 0) {
            const fallbackBooking = userBookings[0];
            const vehicle = resolveVehicle(fallbackBooking);
            const status = (fallbackBooking.booking_status || fallbackBooking.status || 'confirmed').toUpperCase();

            const notFoundTexts = {
              en: `⚠️ No record matches reference **${cleanRef}**. However, here is your active reservation **${fallbackBooking.booking_code || fallbackBooking.id}** [${status}]:`,
              ta: `⚠️ **${cleanRef}** இலக்கத்திற்குரிய பதிவு காணப்படவில்லை. ஆனால் உங்கள் முன்பதிவு **${fallbackBooking.booking_code || fallbackBooking.id}** [${status}] இதோ:`,
              si: `⚠️ **${cleanRef}** අංකයට අදාළ වාර්තාවක් නැත. කෙසේ වෙතත් ඔබගේ සක්‍රීය වෙන්කිරීම **${fallbackBooking.booking_code || fallbackBooking.id}** [${status}] මෙන්න:`
            };

            return {
              type: 'booking',
              text: notFoundTexts[lang] || notFoundTexts.en,
              booking: { ...fallbackBooking, vehicle },
              suggestedActions: [
                { label: 'View in My Bookings', query: 'view in my bookings' },
                { label: 'Browse Available Fleet', query: 'Show available cars' }
              ]
            };
          }

          const notFoundTexts = {
            en: `⚠️ No active reservation was found matching reference **${cleanRef}**. Please double-check the booking code or check **My Bookings**.`,
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

      // 2. No specific code provided (e.g. user clicked "View in My Bookings", "Track Booking", or asked "already booked car")
      let targetBooking = null;

      if (currentUser) {
        const userBookings = bookings.filter(b => 
          b.customer_id === currentUser.id ||
          (currentUser.email && (b.customer_email || '').toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.phone && b.customer_phone === currentUser.phone)
        );

        if (userBookings.length > 0) {
          // Customer ALREADY HAS booked cars: Show details of active/latest reservation
          targetBooking = userBookings.find(b => ['active', 'confirmed', 'pending'].includes(b.booking_status || b.status)) || userBookings[0];
          const vehicle = resolveVehicle(targetBooking);
          const status = (targetBooking.booking_status || targetBooking.status || 'confirmed').toUpperCase();

          const countNote = userBookings.length > 1 ? ` (Showing 1 of ${userBookings.length} reservations)` : '';
          const statusTexts = {
            en: `Here are the details of your booked vehicle **${targetBooking.booking_code || targetBooking.id}** [${status}]${countNote}:`,
            ta: `நீங்கள் முன்பதிவு செய்த வாகனத்தின் விபரங்கள் **${targetBooking.booking_code || targetBooking.id}** [${status}]:`,
            si: `ඔබ වෙන්කර ඇති **${targetBooking.booking_code || targetBooking.id}** [${status}] වාහනයේ විස්තර මෙන්න:`
          };

          return {
            type: 'booking',
            text: statusTexts[lang] || statusTexts.en,
            booking: { ...targetBooking, vehicle },
            suggestedActions: [
              { label: 'View in My Bookings', link: '/my-bookings' },
              { label: 'Browse Available Fleet', query: 'Show available cars' }
            ]
          };
        } else {
          // Logged-in user has NO vehicle bookings
          const noUserBookingTexts = {
            en: "You do not have any vehicle bookings at the moment. Would you like to explore our available fleet and reserve a car?",
            ta: "தங்களிடம் தற்போது எந்த வாகன முன்பதிவுகளும் இல்லை. கிடைக்கும் வாகனங்களை பார்வையிட்டு முன்பதிவு செய்ய விரும்புகிறீர்களா?",
            si: "ඔබ සතුව දැනට කිසිදු වාහන වෙන්කිරීමක් නොමැත. පවතින වාහන පරීක්ෂා කර බලා වෙන්කරවා ගැනීමට කැමතිද?"
          };

          return {
            type: 'text',
            text: noUserBookingTexts[lang] || noUserBookingTexts.en,
            suggestedActions: [
              { label: 'Available Fleet', query: 'Show available cars' },
              { label: 'Book a Car via AI', query: 'I want to book a car' }
            ]
          };
        }
      }

      // Guest customer: check if any recent reservation was made in local session
      const guestBookings = bookings.filter(b => !b.customer_id || b.customer_id === 'guest');
      if (guestBookings.length > 0) {
        targetBooking = guestBookings.find(b => ['active', 'confirmed', 'pending'].includes(b.booking_status || b.status)) || guestBookings[0];
        const vehicle = resolveVehicle(targetBooking);
        const status = (targetBooking.booking_status || targetBooking.status || 'confirmed').toUpperCase();

        const statusTexts = {
          en: `Here are the details of your booked vehicle **${targetBooking.booking_code || targetBooking.id}** [${status}]:`,
          ta: `நீங்கள் முன்பதிவு செய்த வாகனத்தின் விபரங்கள் **${targetBooking.booking_code || targetBooking.id}** [${status}]:`,
          si: `ඔබ වෙන්කර ඇති **${targetBooking.booking_code || targetBooking.id}** [${status}] වාහනයේ විස්තර මෙන්න:`
        };

        return {
          type: 'booking',
          text: statusTexts[lang] || statusTexts.en,
          booking: { ...targetBooking, vehicle },
          suggestedActions: [
            { label: 'View in My Bookings', link: '/my-bookings' },
            { label: 'Browse Available Fleet', query: 'Show available cars' }
          ]
        };
      }

      // Truly no bookings
      const noBookingTexts = {
        en: "You do not have any vehicle bookings at the moment. If you have a Booking Reference Number (e.g. `RF-2026-881`), please enter it to track, or browse our available fleet!",
        ta: "தங்களிடம் தற்போது எந்த வாகன முன்பதிவுகளும் இல்லை. உங்களிடம் முன்பதிவு இலக்கம் (எ.கா: `RF-2026-881`) இருந்தால் உள்ளிடவும்.",
        si: "ඔබ සතුව දැනට කිසිදු වාහන වෙන්කිරීමක් නොමැත. වෙන්කිරීමේ අංකයක් (උදා: `RF-2026-881`) තිබේ නම් ඇතුළත් කරන්න."
      };

      return {
        type: 'text',
        text: noBookingTexts[lang] || noBookingTexts.en,
        suggestedActions: [
          { label: 'Available Fleet', query: 'Show available cars' },
          { label: 'Book a Car via AI', query: 'I want to book a car' }
        ]
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
