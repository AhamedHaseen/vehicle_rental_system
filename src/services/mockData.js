export const initialVehicles = [
  {
    id: "vh-001",
    vehicle_code: "VH001",
    registration_no: "CAB-1234",
    brand: "Toyota",
    model: "Prius Hybrid",
    year: 2024,
    category: "Car",
    fuel_type: "Hybrid",
    transmission: "Automatic",
    seats: 5,
    price_per_day: 8500,
    price_per_hour: 1100,
    security_deposit: 20000,
    status: "available",
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590362891988-f77804703130?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Apple CarPlay / Android Auto", "Adaptive Cruise Control", "Lane Keep Assist", "EV Eco Mode", "Ultra HD Reverse Cam"],
    specs: {
      engine: "1.8L 4-Cylinder Hybrid",
      power: "121 HP",
      consumption: "24.5 km/L",
      bootCapacity: "502 Litres",
      topSpeed: "180 km/h"
    },
    odometer_km: 18450,
    fuel_level_percent: 95,
    location: "Colombo Flagship Hub",
    description: "The pinnacle of urban efficiency and serene comfort. Outstanding fuel efficiency makes this hybrid the perfect executive daily cruiser or family touring sedan across Sri Lanka."
  },
  {
    id: "vh-002",
    vehicle_code: "VH002",
    registration_no: "CBA-8899",
    brand: "Mercedes-Benz",
    model: "C-Class AMG Line",
    year: 2023,
    category: "Luxury Vehicle",
    fuel_type: "Petrol",
    transmission: "Automatic",
    seats: 5,
    price_per_day: 32000,
    price_per_hour: 4200,
    security_deposit: 60000,
    status: "available",
    image_url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Burmester 3D Surround Sound", "Panoramic Glass Sunroof", "Heated AMG Nappa Leather", "Head-Up Display", "360° Surround Cameras"],
    specs: {
      engine: "2.0L Turbocharged Inline-4",
      power: "255 HP @ 5800 RPM",
      acceleration: "5.9s (0-100 km/h)",
      consumption: "13.8 km/L",
      bootCapacity: "455 Litres"
    },
    odometer_km: 11200,
    fuel_level_percent: 100,
    location: "Colombo Flagship Hub",
    description: "Flawless German engineering meets sports-inspired aggression. The AMG styling package and refined cabin deliver an unforgettable chauffeur or self-drive experience."
  },
  {
    id: "vh-003",
    vehicle_code: "VH003",
    registration_no: "WP-KS-4501",
    brand: "Toyota",
    model: "Land Cruiser Prado TX-L",
    year: 2024,
    category: "SUV",
    fuel_type: "Diesel",
    transmission: "Automatic",
    seats: 7,
    price_per_day: 38000,
    price_per_hour: 4800,
    security_deposit: 75000,
    status: "rented",
    image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Full-Time 4WD with Low Range", "Kinetic Dynamic Suspension", "7 Premium Leather Seats", "Center Console Cool Box", "Tri-Zone Climate Control"],
    specs: {
      engine: "2.8L D-4D Turbo Diesel",
      power: "201 HP",
      torque: "500 Nm @ 1600 RPM",
      clearance: "215 mm Ground Clearance",
      towing: "3000 kg"
    },
    odometer_km: 9800,
    fuel_level_percent: 85,
    location: "Kandy Hill Station",
    description: "Built to conquer rugged mountain passes and long expeditions without breaking a sweat. Seats seven in commanding luxury with true off-road pedigree."
  },
  {
    id: "vh-004",
    vehicle_code: "VH004",
    registration_no: "NC-PE-9022",
    brand: "Toyota",
    model: "KDH HiAce Luxury Van",
    year: 2022,
    category: "Van",
    fuel_type: "Diesel",
    transmission: "Manual",
    seats: 14,
    price_per_day: 18500,
    price_per_hour: 2400,
    security_deposit: 30000,
    status: "available",
    image_url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["High-Roof Extra Long Body", "Individual Line A/C Vents", "Plush Reclining Velvet Seats", "Tour Sound System with Mic", "Huge Luggage Compartment"],
    specs: {
      engine: "3.0L Turbo Diesel Intercooled",
      capacity: "14 Passengers + Driver",
      power: "134 HP",
      luggage: "Up to 10 Large Suitcases",
      fuelTank: "70 Litres"
    },
    odometer_km: 36500,
    fuel_level_percent: 90,
    location: "Colombo Flagship Hub",
    description: "The preferred choice for corporate delegations, family tours, and airport transfers. High roofline allows effortless movement and expansive visibility."
  },
  {
    id: "vh-005",
    vehicle_code: "VH005",
    registration_no: "SP-BI-3344",
    brand: "Yamaha",
    model: "MT-09 Hyper Naked",
    year: 2023,
    category: "Motorbike",
    fuel_type: "Petrol",
    transmission: "Manual",
    seats: 2,
    price_per_day: 9500,
    price_per_hour: 1300,
    security_deposit: 25000,
    status: "available",
    image_url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Quick Shift System (QSS)", "Full Color 3.5\" TFT Display", "Lean-Sensitive Traction Control", "Slide Control & Wheelie Mitigator", "Akrapovic Tuned Exhaust"],
    specs: {
      engine: "890cc CP3 Liquid-Cooled Triple",
      power: "117 HP @ 10,000 RPM",
      weight: "189 kg Wet Weight",
      tankCapacity: "14 Litres",
      seatHeight: "825 mm"
    },
    odometer_km: 6200,
    fuel_level_percent: 100,
    location: "Galle Coastal Hub",
    description: "Pure adrenaline on two wheels. The torque-rich crossplane engine and agile aluminum chassis make southern expressway and coastal cruising breathtaking."
  },
  {
    id: "vh-006",
    vehicle_code: "VH006",
    registration_no: "WP-AAJ-7711",
    brand: "Bajaj",
    model: "RE 4-Stroke Tourist Edition",
    year: 2023,
    category: "Three-Wheeler",
    fuel_type: "Petrol",
    transmission: "Manual",
    seats: 3,
    price_per_day: 4200,
    price_per_hour: 600,
    security_deposit: 10000,
    status: "available",
    image_url: "https://images.unsplash.com/photo-1588636142475-a62d56692870?auto=format&fit=crop&w=1200&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1588636142475-a62d56692870?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Reinforced Roof Luggage Rack", "Heavy-Duty Transparent Rain Curtains", "Dual High-Speed USB Ports", "Digital Odometer & Fuel Meter", "Spare Tire Mounted"],
    specs: {
      engine: "199cc DTS-i 4-Stroke",
      power: "10.2 HP",
      mileage: "32 km/L",
      payload: "350 kg",
      cooling: "Forced Air Cooled"
    },
    odometer_km: 14200,
    fuel_level_percent: 100,
    location: "Colombo Flagship Hub",
    description: "The authentic Sri Lankan adventure vehicle. Fun, nimble, and iconic for cruising coastal roads, village trails, and lively city streets with breeze and flair."
  },
  {
    id: "vh-007",
    vehicle_code: "VH007",
    registration_no: "WP-CAE-5522",
    brand: "Honda",
    model: "Vezel e:HEV Z",
    year: 2023,
    category: "SUV",
    fuel_type: "Hybrid",
    transmission: "Automatic",
    seats: 5,
    price_per_day: 12500,
    price_per_hour: 1600,
    security_deposit: 25000,
    status: "available",
    image_url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["Honda SENSING Suite", "Ultra Magic Folding Seats", "Hands-Free Kick Tailgate", "Panoramic Glass Skyroof", "Wireless Smartphone Charger"],
    specs: {
      engine: "1.5L e:HEV Dual Motor Hybrid",
      power: "131 HP Combined",
      consumption: "22.0 km/L",
      clearance: "195 mm",
      drive: "Real-Time AWD"
    },
    odometer_km: 12100,
    fuel_level_percent: 85,
    location: "Colombo Flagship Hub",
    description: "Sleek coupe-SUV styling combined with Honda's intelligent e:HEV hybrid powertrain. Exceptionally quiet cabin and flexible cargo space."
  },
  {
    id: "vh-008",
    vehicle_code: "VH008",
    registration_no: "WP-CBD-9102",
    brand: "BMW",
    model: "7 Series 740Li M-Sport",
    year: 2024,
    category: "Luxury Vehicle",
    fuel_type: "Petrol",
    transmission: "Automatic",
    seats: 4,
    price_per_day: 65000,
    price_per_hour: 8500,
    security_deposit: 150000,
    status: "maintenance",
    image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    gallery_urls: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80"
    ],
    features: ["31.3\" BMW Theatre Screen 8K", "Executive Lounge Reclining Rear Seat", "Bowers & Wilkins 4D Sound (36 Speakers)", "Swarovski Crystal Iconic Glow Lights", "Automatic Self-Opening Doors"],
    specs: {
      engine: "3.0L TwinPower Turbo In-line 6",
      power: "375 HP",
      acceleration: "5.4s (0-100 km/h)",
      topSpeed: "250 km/h (Governed)",
      length: "5391 mm Flagship Limousine"
    },
    odometer_km: 4100,
    fuel_level_percent: 100,
    location: "Colombo Flagship Hub",
    description: "The crown jewel of ultra-luxury. A rolling VIP cinema and sanctuary crafted for diplomats, state banquets, high-profile weddings, and high-net-worth VIPs."
  }
];

export const initialCustomers = [
  {
    id: "user-cust-001",
    full_name: "Kamal Perera",
    email: "kamal@example.com",
    phone: "+94 77 123 4567",
    role: "customer",
    status: "active",
    driving_license_no: "B-9876543",
    id_card_no: "199012345678",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    total_rentals: 4,
    total_spent: 124500,
    joined_date: "2024-01-15"
  },
  {
    id: "user-cust-002",
    full_name: "Niroshani Silva",
    email: "niroshani@example.com",
    phone: "+94 71 889 2211",
    role: "customer",
    status: "active",
    driving_license_no: "B-4412988",
    id_card_no: "199488330192",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    total_rentals: 2,
    total_spent: 64000,
    joined_date: "2024-03-20"
  },
  {
    id: "user-cust-003",
    full_name: "David Robertson",
    email: "david.r@tourist.uk",
    phone: "+44 7911 123456",
    role: "customer",
    status: "active",
    driving_license_no: "UK-9021-X",
    id_card_no: "PASSPORT-77218",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    total_rentals: 1,
    total_spent: 76000,
    joined_date: "2024-05-10"
  }
];

export const initialBookings = [
  {
    id: "bk-1001",
    booking_code: "RF-2026-881",
    customer_id: "user-cust-001",
    customer_name: "Kamal Perera",
    customer_email: "kamal@example.com",
    customer_phone: "+94 77 123 4567",
    vehicle_id: "vh-001",
    vehicle_name: "Toyota Prius Hybrid (CAB-1234)",
    start_date: "2026-10-12T09:00:00.000Z",
    end_date: "2026-10-15T18:00:00.000Z",
    duration_days: 3,
    base_price: 25500,
    insurance_fee: 3000,
    security_deposit: 20000,
    additional_charges: 0,
    total_amount: 28500,
    booking_status: "confirmed",
    payment_status: "paid",
    pickup_location: "Colombo Flagship Hub",
    return_location: "Colombo Flagship Hub",
    pickup_notes: "Customer requested child car seat installation.",
    return_notes: "",
    fuel_pickup_percent: 95,
    odometer_pickup_km: 18450,
    fuel_return_percent: null,
    odometer_return_km: null,
    created_at: "2026-10-06T10:15:00.000Z"
  },
  {
    id: "bk-1002",
    booking_code: "RF-2026-882",
    customer_id: "user-cust-002",
    customer_name: "Niroshani Silva",
    customer_email: "niroshani@example.com",
    customer_phone: "+94 71 889 2211",
    vehicle_id: "vh-003",
    vehicle_name: "Toyota Land Cruiser Prado (WP-KS-4501)",
    start_date: "2026-10-07T08:00:00.000Z",
    end_date: "2026-10-10T20:00:00.000Z",
    duration_days: 3,
    base_price: 114000,
    insurance_fee: 9000,
    security_deposit: 75000,
    additional_charges: 0,
    total_amount: 123000,
    booking_status: "active",
    payment_status: "paid",
    pickup_location: "Kandy Hill Station",
    return_location: "Colombo Flagship Hub",
    pickup_notes: "Handed over vehicle with full tank and clean condition.",
    return_notes: "",
    fuel_pickup_percent: 100,
    odometer_pickup_km: 9800,
    fuel_return_percent: null,
    odometer_return_km: null,
    created_at: "2026-10-04T14:30:00.000Z"
  },
  {
    id: "bk-1003",
    booking_code: "RF-2026-883",
    customer_id: "user-cust-003",
    customer_name: "David Robertson",
    customer_email: "david.r@tourist.uk",
    customer_phone: "+44 7911 123456",
    vehicle_id: "vh-002",
    vehicle_name: "Mercedes-Benz C-Class AMG (CBA-8899)",
    start_date: "2026-10-18T10:00:00.000Z",
    end_date: "2026-10-20T10:00:00.000Z",
    duration_days: 2,
    base_price: 64000,
    insurance_fee: 6000,
    security_deposit: 60000,
    additional_charges: 0,
    total_amount: 70000,
    booking_status: "pending",
    payment_status: "pending",
    pickup_location: "Bandaranaike International Airport (CMB)",
    return_location: "Colombo Flagship Hub",
    pickup_notes: "Meet & greet at arrival terminal exit.",
    return_notes: "",
    created_at: "2026-10-07T18:45:00.000Z"
  },
  {
    id: "bk-1004",
    booking_code: "RF-2026-879",
    customer_id: "user-cust-001",
    customer_name: "Kamal Perera",
    customer_email: "kamal@example.com",
    customer_phone: "+94 77 123 4567",
    vehicle_id: "vh-005",
    vehicle_name: "Yamaha MT-09 Hyper Naked (SP-BI-3344)",
    start_date: "2026-09-28T09:00:00.000Z",
    end_date: "2026-09-30T17:00:00.000Z",
    duration_days: 2,
    base_price: 19000,
    insurance_fee: 2000,
    security_deposit: 25000,
    additional_charges: 0,
    total_amount: 21000,
    booking_status: "completed",
    payment_status: "paid",
    pickup_location: "Galle Coastal Hub",
    return_location: "Galle Coastal Hub",
    pickup_notes: "Protective helmet and gloves provided.",
    return_notes: "Returned clean and undamaged. Full fuel tank returned.",
    fuel_pickup_percent: 100,
    odometer_pickup_km: 5800,
    fuel_return_percent: 100,
    odometer_return_km: 6200,
    late_fee: 0,
    damage_fee: 0,
    created_at: "2026-09-25T11:00:00.000Z"
  }
];

export const initialReviews = [
  {
    id: "rev-01",
    vehicle_id: "vh-005",
    customer_id: "user-cust-001",
    customer_name: "Kamal Perera",
    rating: 5,
    comment: "Unbelievable experience riding the MT-09 down the Southern coastal strip! The bike was in pristine condition, pickup took less than 3 minutes.",
    date: "2026-10-01"
  },
  {
    id: "rev-02",
    vehicle_id: "vh-001",
    customer_id: "user-cust-002",
    customer_name: "Niroshani Silva",
    rating: 5,
    comment: "The Prius Hybrid drove like brand new. Super economical for our family round trip to Nuwara Eliya. Highly recommend RentFlow!",
    date: "2026-09-20"
  },
  {
    id: "rev-03",
    vehicle_id: "vh-003",
    customer_id: "user-cust-003",
    customer_name: "David Robertson",
    rating: 5,
    comment: "Prado was the best decision for Ella and Yala Safari tracks. Spotless interior, seamless airport handover. 10/10 service.",
    date: "2026-09-14"
  }
];

export const initialNotifications = [
  {
    id: "notif-01",
    user_id: "user-cust-001",
    title: "Booking Confirmed",
    message: "Your booking for Toyota Prius Hybrid (CAB-1234) has been confirmed for Oct 12, 2026.",
    type: "booking",
    is_read: false,
    created_at: "2026-10-06T10:16:00.000Z"
  },
  {
    id: "notif-02",
    user_id: "user-cust-001",
    title: "Upcoming Pickup Reminder",
    message: "Reminder: Your vehicle pickup is scheduled in 4 days at Colombo Flagship Hub. Bring your driver's license.",
    type: "pickup_reminder",
    is_read: false,
    created_at: "2026-10-08T08:00:00.000Z"
  },
  {
    id: "notif-03",
    user_id: "admin",
    title: "New Booking Request",
    message: "David Robertson submitted a new booking request for Mercedes-Benz C-Class (RF-2026-883).",
    type: "booking",
    is_read: false,
    created_at: "2026-10-07T18:45:00.000Z"
  }
];

export const defaultSettings = {
  company_info: {
    name: "RentFlow Luxury & Fleet Rentals",
    email: "support@rentflow.lk",
    phone: "+94 11 234 5678",
    address: "45 Galle Face Terrace, Colombo 03, Sri Lanka",
    currency: "LKR",
    currencySymbol: "Rs.",
    operatingHours: "24/7 Roadside & Dispatch"
  },
  rental_policies: {
    minRentalDays: 1,
    cancellationGraceHours: 24,
    securityDepositDefault: 20000,
    insurancePerDay: 1500,
    taxPercent: 2.5,
    weekendSurchargePercent: 10,
    lateReturnFeePerHour: 1500
  }
};
