import { Order } from './order.model';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001254', customerName: 'Manoj Kumar', customerEmail: 'manoj@example.com', customerPhone: '+91 9876543210',
    date: 'July 15, 2026', status: 'delivered', paymentMethod: 'Credit Card',
    shippingAddress: '123, ABC Street, New Delhi, 110001, India', billingAddress: '123, ABC Street, New Delhi, 110001, India',
    shipping: 50, taxRate: 0.18,
    items: [
      { name: 'Herbal Face Wash', sku: 'HW-101', icon: 'bi-droplet', price: 250, quantity: 2 },
      { name: 'Organic Green Tea', sku: 'GT-202', icon: 'bi-cup-hot', price: 450, quantity: 1 },
    ],
  },
  {
    id: 'ORD-001252', customerName: 'Priya Sharma', customerEmail: 'priya@example.com', customerPhone: '+91 9812345670',
    date: 'July 14, 2026', status: 'pending', paymentMethod: 'UPI',
    shippingAddress: '45, MG Road, Bengaluru, 560001, India', billingAddress: '45, MG Road, Bengaluru, 560001, India',
    shipping: 40, taxRate: 0.18,
    items: [
      { name: 'Aloe Vera Gel', sku: 'AV-303', icon: 'bi-flower1', price: 300, quantity: 2 },
      { name: 'Vitamin C Serum', sku: 'VC-118', icon: 'bi-eyedropper', price: 600, quantity: 1 },
    ],
  },
  {
    id: 'ORD-001253', customerName: 'Amit Singh', customerEmail: 'amit@example.com', customerPhone: '+91 9898989898',
    date: 'July 14, 2026', status: 'shipped', paymentMethod: 'Net Banking',
    shippingAddress: '78, Park Street, Kolkata, 700016, India', billingAddress: '78, Park Street, Kolkata, 700016, India',
    shipping: 60, taxRate: 0.18,
    items: [
      { name: 'Charcoal Face Mask', sku: 'CF-410', icon: 'bi-circle-half', price: 350, quantity: 1 },
      { name: 'Bamboo Toothbrush Set', sku: 'BT-512', icon: 'bi-brush', price: 250, quantity: 2 },
    ],
  },
  {
    id: 'ORD-001255', customerName: 'Neha Verma', customerEmail: 'neha@example.com', customerPhone: '+91 9765432109',
    date: 'July 13, 2026', status: 'cancelled', paymentMethod: 'Credit Card',
    shippingAddress: '9, Residency Road, Pune, 411001, India', billingAddress: '9, Residency Road, Pune, 411001, India',
    shipping: 0, taxRate: 0.18,
    items: [{ name: 'Rose Water Toner', sku: 'RW-115', icon: 'bi-droplet-half', price: 220, quantity: 1 }],
  },
  {
    id: 'ORD-001256', customerName: 'Rahul Mehta', customerEmail: 'rahul@example.com', customerPhone: '+91 9911223344',
    date: 'July 12, 2026', status: 'delivered', paymentMethod: 'Cash on Delivery',
    shippingAddress: '221B, Sector 12, Noida, 201301, India', billingAddress: '221B, Sector 12, Noida, 201301, India',
    shipping: 45, taxRate: 0.18,
    items: [
      { name: 'Herbal Shampoo', sku: 'HS-221', icon: 'bi-droplet', price: 380, quantity: 2 },
    ],
  },
  {
    id: 'ORD-001257', customerName: 'Sanya Kapoor', customerEmail: 'sanya@example.com', customerPhone: '+91 9090909090',
    date: 'July 12, 2026', status: 'pending', paymentMethod: 'UPI',
    shippingAddress: '5, Marine Drive, Mumbai, 400020, India', billingAddress: '5, Marine Drive, Mumbai, 400020, India',
    shipping: 55, taxRate: 0.18,
    items: [{ name: 'Sunscreen SPF 50', sku: 'SS-330', icon: 'bi-sun', price: 480, quantity: 1 }],
  },
  {
    id: 'ORD-001258', customerName: 'Vikram Rao', customerEmail: 'vikram@example.com', customerPhone: '+91 9012345678',
    date: 'July 11, 2026', status: 'shipped', paymentMethod: 'Debit Card',
    shippingAddress: '31, Anna Salai, Chennai, 600002, India', billingAddress: '31, Anna Salai, Chennai, 600002, India',
    shipping: 60, taxRate: 0.18,
    items: [
      { name: 'Beard Oil', sku: 'BO-410', icon: 'bi-droplet', price: 350, quantity: 1 },
      { name: 'Charcoal Face Wash', sku: 'CF-102', icon: 'bi-circle-half', price: 280, quantity: 1 },
    ],
  },
  {
    id: 'ORD-001259', customerName: 'Kavita Joshi', customerEmail: 'kavita@example.com', customerPhone: '+91 9345678901',
    date: 'July 10, 2026', status: 'delivered', paymentMethod: 'Credit Card',
    shippingAddress: '14, Civil Lines, Jaipur, 302006, India', billingAddress: '14, Civil Lines, Jaipur, 302006, India',
    shipping: 50, taxRate: 0.18,
    items: [{ name: 'Body Lotion', sku: 'BL-505', icon: 'bi-droplet', price: 320, quantity: 2 }],
  },
  {
    id: 'ORD-001260', customerName: 'Arjun Nair', customerEmail: 'arjun@example.com', customerPhone: '+91 9223344556',
    date: 'July 9, 2026', status: 'pending', paymentMethod: 'Net Banking',
    shippingAddress: '2, Marine Lines, Kochi, 682001, India', billingAddress: '2, Marine Lines, Kochi, 682001, India',
    shipping: 40, taxRate: 0.18,
    items: [{ name: 'Hair Growth Serum', sku: 'HG-620', icon: 'bi-eyedropper', price: 700, quantity: 1 }],
  },
  {
    id: 'ORD-001261', customerName: 'Isha Gupta', customerEmail: 'isha@example.com', customerPhone: '+91 9556677889',
    date: 'July 9, 2026', status: 'cancelled', paymentMethod: 'UPI',
    shippingAddress: '77, Model Town, Ludhiana, 141002, India', billingAddress: '77, Model Town, Ludhiana, 141002, India',
    shipping: 0, taxRate: 0.18,
    items: [{ name: 'Anti-Dandruff Shampoo', sku: 'AD-210', icon: 'bi-droplet', price: 340, quantity: 1 }],
  },
  {
    id: 'ORD-001262', customerName: 'Rohit Desai', customerEmail: 'rohit@example.com', customerPhone: '+91 9887766554',
    date: 'July 8, 2026', status: 'delivered', paymentMethod: 'Credit Card',
    shippingAddress: '10, Race Course Road, Vadodara, 390007, India', billingAddress: '10, Race Course Road, Vadodara, 390007, India',
    shipping: 45, taxRate: 0.18,
    items: [{ name: 'Lip Balm Combo', sku: 'LB-140', icon: 'bi-heart', price: 199, quantity: 3 }],
  },
  {
    id: 'ORD-001263', customerName: 'Meera Iyer', customerEmail: 'meera@example.com', customerPhone: '+91 9776655443',
    date: 'July 7, 2026', status: 'shipped', paymentMethod: 'UPI',
    shippingAddress: '6, Jubilee Hills, Hyderabad, 500033, India', billingAddress: '6, Jubilee Hills, Hyderabad, 500033, India',
    shipping: 60, taxRate: 0.18,
    items: [{ name: 'Face Serum Combo', sku: 'FS-260', icon: 'bi-eyedropper', price: 890, quantity: 1 }],
  },
];
