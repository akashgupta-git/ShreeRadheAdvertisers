export type MediaType = 'Unipole' | 'Hoarding' | 'Gantry' | 'Kiosk' | 'Digital LED';
export type MediaStatus = 'Available' | 'Booked' | 'Coming Soon';
export type PaymentStatus = 'Paid' | 'Pending' | 'Partially Paid';
export type PaymentMode = 'Cash' | 'Cheque' | 'Online' | 'Bank Transfer';

export interface MediaLocation {
  id: string;
  name: string;
  type: MediaType;
  state: string;
  district: string;
  city: string;
  address: string;
  status: MediaStatus;
  size: string;
  lighting: 'Front Lit' | 'Back Lit' | 'Non-Lit' | 'Digital';
  facing: string;
  image: string;
  pricePerMonth: number;
  bookedDates?: { start: string; end: string }[];
  occupancyRate: number;
  totalDaysBooked: number;
  deleted?: boolean;
  deletedAt?: string;
}

export interface Booking {
  id: string;
  mediaId: string;
  customerId: string;
  media?: MediaLocation;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMode?: PaymentMode;
}

export interface DistrictStats {
  district: string;
  state: string;
  totalMedia: number;
  available: number;
  booked: number;
  comingSoon: number;
  byType: Record<MediaType, { total: number; available: number; booked: number; comingSoon: number }>;
}

export const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Delhi NCR'];

export const districts: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Delhi NCR': ['New Delhi', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad'],
};

export const cities: Record<string, string[]> = {
  'Mumbai': ['Andheri', 'Bandra', 'Worli', 'Powai', 'Malad'],
  'Pune': ['Kothrud', 'Hinjewadi', 'Wakad', 'Viman Nagar', 'Koregaon Park'],
  'Bangalore': ['Koramangala', 'Whitefield', 'Indiranagar', 'Electronic City', 'HSR Layout'],
  'Chennai': ['Adyar', 'T Nagar', 'Anna Nagar', 'Velachery', 'Guindy'],
  'Ahmedabad': ['Satellite', 'Vastrapur', 'Navrangpura', 'SG Highway', 'Bodakdev'],
  'Jaipur': ['Malviya Nagar', 'C-Scheme', 'Vaishali Nagar', 'Mansarovar', 'Raja Park'],
  'New Delhi': ['Connaught Place', 'Karol Bagh', 'Saket', 'Dwarka', 'Vasant Kunj'],
};

export const mediaTypes: MediaType[] = ['Unipole', 'Hoarding', 'Gantry', 'Kiosk', 'Digital LED'];
export const customerGroups = ['Corporate', 'Government', 'Agency', 'Startup', 'Non-Profit'];

const generateMediaLocations = (): MediaLocation[] => {
  const locations: MediaLocation[] = [];
  let id = 1;

  const images = [
    'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
    'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800',
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800',
    'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800',
    'https://images.unsplash.com/photo-1572035563967-3c8c6c402c55?w=800',
    'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=800',
  ];

  const facings = [
    'North', 'South', 'East', 'West', 
    'From Mumbai towards Pune', 
    'Towards Airport Terminal 2', 
    'Facing Toll Plaza', 
    'City Center Inbound',
    'Highway Outbound'
  ];

  const sizes = ['20x10 ft', '30x15 ft', '40x20 ft', '50x25 ft', '60x30 ft'];
  const lightings: ('Front Lit' | 'Back Lit' | 'Non-Lit' | 'Digital')[] = ['Front Lit', 'Back Lit', 'Non-Lit', 'Digital'];
  const statuses: MediaStatus[] = ['Available', 'Booked', 'Coming Soon'];

  states.forEach(state => {
    const stateDistricts = districts[state] || [];
    stateDistricts.forEach(district => {
      const districtCities = cities[district] || [district];
      districtCities.forEach(city => {
        const numMedia = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < numMedia; i++) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const type = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
          
          locations.push({
            id: `OAM-${String(id).padStart(5, '0')}`,
            name: `${city} ${type} ${i + 1}`,
            type,
            state,
            district,
            city,
            address: `${Math.floor(Math.random() * 500) + 1}, Main Road, ${city}`,
            status,
            size: sizes[Math.floor(Math.random() * sizes.length)],
            lighting: type === 'Digital LED' ? 'Digital' : lightings[Math.floor(Math.random() * 3)],
            facing: facings[Math.floor(Math.random() * facings.length)],
            image: images[Math.floor(Math.random() * images.length)],
            pricePerMonth: Math.floor(Math.random() * 150000) + 50000,
            occupancyRate: Math.floor(Math.random() * 40) + 60,
            totalDaysBooked: Math.floor(Math.random() * 200) + 50,
            bookedDates: status === 'Booked' ? [
              { start: '2024-01-15', end: '2024-03-15' },
              { start: '2024-05-01', end: '2024-07-31' },
            ] : [],
          });
          id++;
        }
      });
    });
  });

  return locations;
};

export const mediaLocations = generateMediaLocations();

export const getDistrictStats = (): DistrictStats[] => {
  const statsMap = new Map<string, DistrictStats>();

  mediaLocations.forEach(location => {
    const key = `${location.state}-${location.district}`;
    
    if (!statsMap.has(key)) {
      // FIX: Use reduce to initialize the object with proper typing instead of 'as any'
      const byType = mediaTypes.reduce((acc, type) => {
        acc[type] = { total: 0, available: 0, booked: 0, comingSoon: 0 };
        return acc;
      }, {} as Record<MediaType, { total: number; available: number; booked: number; comingSoon: number }>);

      statsMap.set(key, {
        district: location.district,
        state: location.state,
        totalMedia: 0,
        available: 0,
        booked: 0,
        comingSoon: 0,
        byType,
      });
    }

    const stats = statsMap.get(key)!;
    stats.totalMedia++;
    
    if (location.status === 'Available') stats.available++;
    else if (location.status === 'Booked') stats.booked++;
    else stats.comingSoon++; 

    stats.byType[location.type].total++;
    if (location.status === 'Available') stats.byType[location.type].available++;
    else if (location.status === 'Booked') stats.byType[location.type].booked++;
    else stats.byType[location.type].comingSoon++;
  });

  return Array.from(statsMap.values());
};

export const getMediaById = (id: string): MediaLocation | undefined => {
  return mediaLocations.find(m => m.id === id);
};

export const getDashboardStats = () => {
  const total = mediaLocations.length;
  const available = mediaLocations.filter(m => m.status === 'Available').length;
  const booked = mediaLocations.filter(m => m.status === 'Booked').length;
  const comingSoon = mediaLocations.filter(m => m.status === 'Coming Soon').length;
  const statesCount = new Set(mediaLocations.map(m => m.state)).size;
  const districtsCount = new Set(mediaLocations.map(m => m.district)).size;

  return { total, available, booked, comingSoon, statesCount, districtsCount };
};

export const getChartData = () => {
  const byCity = mediaLocations.reduce((acc, m) => {
    acc[m.city] = (acc[m.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityData = Object.entries(byCity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const stats = getDashboardStats();
  const statusData = [
    { name: 'Available', value: stats.available, fill: 'hsl(var(--success))' },
    { name: 'Booked', value: stats.booked, fill: 'hsl(var(--destructive))' },
    { name: 'Coming Soon', value: stats.comingSoon, fill: 'hsl(var(--warning))' },
  ];

  const monthlyData = [
    { month: 'Jan', bookings: 45, revenue: 225 },
    { month: 'Feb', bookings: 52, revenue: 260 },
    { month: 'Mar', bookings: 61, revenue: 305 },
    { month: 'Apr', bookings: 58, revenue: 290 },
    { month: 'May', bookings: 71, revenue: 355 },
    { month: 'Jun', bookings: 68, revenue: 340 },
    { month: 'Jul', bookings: 75, revenue: 375 },
    { month: 'Aug', bookings: 82, revenue: 410 },
    { month: 'Sep', bookings: 78, revenue: 390 },
    { month: 'Oct', bookings: 85, revenue: 425 },
    { month: 'Nov', bookings: 92, revenue: 460 },
    { month: 'Dec', bookings: 88, revenue: 440 },
  ];

  return { cityData, statusData, monthlyData };
};

export const recentBookings = [
  { id: 'BK-001', mediaId: 'OAM-00001', client: 'ABC Corp', startDate: '2024-01-15', endDate: '2024-03-15', amount: 450000 },
  { id: 'BK-002', mediaId: 'OAM-00015', client: 'XYZ Ltd', startDate: '2024-02-01', endDate: '2024-04-30', amount: 520000 },
  { id: 'BK-003', mediaId: 'OAM-00023', client: 'Tech Solutions', startDate: '2024-01-20', endDate: '2024-02-28', amount: 180000 },
  { id: 'BK-004', mediaId: 'OAM-00042', client: 'Global Ads', startDate: '2024-03-01', endDate: '2024-05-31', amount: 680000 },
  { id: 'BK-005', mediaId: 'OAM-00056', client: 'Media Plus', startDate: '2024-02-15', endDate: '2024-04-15', amount: 390000 },
];

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  group: string;
  totalBookings: number;
  totalSpent: number;
}

export const customers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Rajesh Kumar',
    company: 'Tech Solutions Pvt Ltd',
    email: 'rajesh@techsolutions.com',
    phone: '+91 98765 43210',
    address: '123, Tech Park, Electronic City, Bangalore',
    group: 'Corporate',
    totalBookings: 8,
    totalSpent: 4500000
  },
  {
    id: 'CUST-002',
    name: 'Priya Sharma',
    company: 'Green Earth Organics',
    email: 'priya@greenearth.com',
    phone: '+91 98989 89898',
    address: '45, Green Avenue, Pune',
    group: 'Startup',
    totalBookings: 5,
    totalSpent: 2800000
  },
  {
    id: 'CUST-003',
    name: 'Amit Patel',
    company: 'Gujrat Textiles',
    email: 'amit@gtextiles.com',
    phone: '+91 76543 21098',
    address: 'GIDC, Surat, Gujarat',
    group: 'Corporate',
    totalBookings: 12,
    totalSpent: 8500000
  },
  {
    id: 'CUST-004',
    name: 'Sneha Reddy',
    company: 'Urban Styles',
    email: 'sneha@urbanstyles.com',
    phone: '+91 91234 56789',
    address: 'Banjara Hills, Hyderabad',
    group: 'Agency',
    totalBookings: 3,
    totalSpent: 1200000
  },
  {
    id: 'CUST-005',
    name: 'Vikram Singh',
    company: 'Royal Rajasthan Heritage',
    email: 'vikram@royalheritage.com',
    phone: '+91 99887 76655',
    address: 'Civil Lines, Jaipur',
    group: 'Government',
    totalBookings: 15,
    totalSpent: 9200000
  }
];

export const getBookingsByCustomerId = (customerId: string): Booking[] => {
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return [];

  const bookings: Booking[] = [];
  
  for (let i = 0; i < customer.totalBookings; i++) {
    const randomMedia = mediaLocations[Math.floor(Math.random() * mediaLocations.length)];
    const status = i === 0 ? 'Active' : (i < 3 ? 'Upcoming' : 'Completed');
    
    // Calculate Amount
    const amount = randomMedia.pricePerMonth * 3;

    // Determine Payment Status & Amount Paid
    let paymentStatus: PaymentStatus;
    let amountPaid: number;
    let paymentMode: PaymentMode | undefined;
    const modes: PaymentMode[] = ['Cash', 'Cheque', 'Online', 'Bank Transfer'];

    if (status === 'Completed') {
      paymentStatus = 'Paid';
      amountPaid = amount;
      paymentMode = modes[Math.floor(Math.random() * modes.length)];
    } else {
      // Randomly assign payment status for Active/Upcoming
      const rand = Math.random();
      if (rand > 0.6) {
        paymentStatus = 'Paid';
        amountPaid = amount;
        paymentMode = modes[Math.floor(Math.random() * modes.length)];
      } else if (rand > 0.3) {
        paymentStatus = 'Partially Paid';
        amountPaid = Math.floor(amount * (Math.random() * 0.5 + 0.2)); // 20% to 70% paid
        paymentMode = modes[Math.floor(Math.random() * modes.length)];
      } else {
        paymentStatus = 'Pending';
        amountPaid = 0;
        paymentMode = undefined;
      }
    }

    bookings.push({
      id: `BK-${customerId.split('-')[1]}-${String(i + 1).padStart(3, '0')}`,
      mediaId: randomMedia.id,
      customerId: customerId,
      media: randomMedia,
      status: status,
      startDate: status === 'Completed' ? '2023-01-01' : '2024-04-01',
      endDate: status === 'Completed' ? '2023-03-01' : '2024-06-01',
      amount: amount,
      amountPaid: amountPaid,
      paymentStatus: paymentStatus,
      paymentMode: paymentMode,
    });
  }
  
  return bookings;
};

// Export ALL bookings by flattening the results from all customers
export const bookings = customers.flatMap(c => getBookingsByCustomerId(c.id));

export const getCustomerById = (id: string) => {
  return customers.find(c => c.id === id);
};

export const getPaymentStats = () => {
  let totalRevenue = 0; // Total collected
  let pendingDues = 0;  // Total remaining to be collected
  let partialCount = 0;
  let pendingCount = 0;
  let paidCount = 0;

  bookings.forEach(b => {
    totalRevenue += b.amountPaid;
    pendingDues += (b.amount - b.amountPaid);

    if (b.paymentStatus === 'Partially Paid') partialCount++;
    else if (b.paymentStatus === 'Pending') pendingCount++;
    else if (b.paymentStatus === 'Paid') paidCount++;
  });

  return {
    totalRevenue,
    pendingDues,
    partialCount,
    pendingCount,
    paidCount
  };
};