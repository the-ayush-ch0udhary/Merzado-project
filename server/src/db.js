const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let isConnectedToMongo = false;

// In-Memory Fallback Collections
const memoryStore = {
  users: [],
  rfqs: [],
  quotations: [],
};

// Seed initial in-memory data
const seedInMemoryData = async () => {
  if (memoryStore.users.length > 0) return;

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const buyer1 = {
    _id: 'user_buyer_1',
    id: 'user_buyer_1',
    name: 'Aditya Sharma',
    email: 'buyer@demo.com',
    password: passwordHash,
    role: 'BUYER',
    companyName: 'Apex Global Procurement Ltd.',
    location: 'Bengaluru, India',
    createdAt: new Date('2026-09-01T10:00:00Z'),
  };

  const buyer2 = {
    _id: 'user_buyer_2',
    id: 'user_buyer_2',
    name: 'Sarah Jenkins',
    email: 'sarah@globaltech.com',
    password: passwordHash,
    role: 'BUYER',
    companyName: 'NovaTech Industries USA',
    location: 'Chicago, IL, USA',
    createdAt: new Date('2026-09-05T10:00:00Z'),
  };

  const supplier1 = {
    _id: 'user_supplier_1',
    id: 'user_supplier_1',
    name: 'Vikram Mehta',
    email: 'supplier@demo.com',
    password: passwordHash,
    role: 'SUPPLIER',
    companyName: 'Zenith Industrial & Metals Corp.',
    location: 'Mumbai, India',
    createdAt: new Date('2026-09-02T10:00:00Z'),
  };

  const supplier2 = {
    _id: 'user_supplier_2',
    id: 'user_supplier_2',
    name: 'Elena Rostova',
    email: 'vendor@demo.com',
    password: passwordHash,
    role: 'SUPPLIER',
    companyName: 'NextGen Hardware & Logistics',
    location: 'Frankfurt, Germany',
    createdAt: new Date('2026-09-03T10:00:00Z'),
  };

  memoryStore.users.push(buyer1, buyer2, supplier1, supplier2);

  const future = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  const rfq1 = {
    _id: 'rfq_1',
    id: 'rfq_1',
    buyer: buyer1._id,
    title: 'Grade 316L Stainless Steel Seamless Pipes',
    description:
      'Requirement for 2,500 meters of ASTM A312 Grade 316L seamless stainless steel pipes. Outer diameter 2 inches, schedule 40. High corrosion resistance required for chemical manufacturing plant piping network. Material test certificates (MTC 3.1) required with shipment.',
    quantity: 2500,
    unit: 'Meters',
    location: 'Visakhapatnam Port / Warehouse A-4, India',
    deadline: future(14),
    category: 'Metals & Manufacturing',
    targetBudget: 45000,
    status: 'OPEN',
    createdAt: new Date('2026-09-18T08:30:00Z'),
  };

  const rfq2 = {
    _id: 'rfq_2',
    id: 'rfq_2',
    buyer: buyer1._id,
    title: 'Commercial Monocrystalline 550W Solar PV Modules',
    description:
      'Procurement of Tier-1 bifacial monocrystalline solar panels with minimum 21.5% module efficiency. Must carry 25-year linear power warranty and IEC 61215/61730 certifications. Suitable for 500kW rooftop commercial solar installation.',
    quantity: 900,
    unit: 'Panels',
    location: 'Bengaluru Logistics Park, Karnataka',
    deadline: future(21),
    category: 'Energy & Power',
    targetBudget: 85000,
    status: 'OPEN',
    createdAt: new Date('2026-09-19T09:15:00Z'),
  };

  const rfq3 = {
    _id: 'rfq_3',
    id: 'rfq_3',
    buyer: buyer1._id,
    title: '100% GOTS Certified Organic Combed Cotton Yarn (30s Count)',
    description:
      'Sourcing 10 metric tons of ring-spun organic combed cotton yarn for sustainable apparel manufacturing. Count 30/1 Ne, evenness CV% below 11.5, tensile strength > 16.5 cN/tex. Organic certificate (GOTS) must accompany batch sample.',
    quantity: 10000,
    unit: 'Kilograms',
    location: 'Tirupur Textile Hub, Tamil Nadu',
    deadline: future(7),
    category: 'Textiles & Apparel',
    targetBudget: 38000,
    status: 'OPEN',
    createdAt: new Date('2026-09-20T11:00:00Z'),
  };

  const rfq4 = {
    _id: 'rfq_4',
    id: 'rfq_4',
    buyer: buyer2._id,
    title: 'Enterprise Cloud Architecture & ISO 27001 Security Audit',
    description:
      'Seeking certified cybersecurity firm to conduct comprehensive cloud vulnerability assessment, penetration testing (VAPT), and ISO/IEC 27001 readiness review across AWS and Azure infrastructure supporting 1M+ active users.',
    quantity: 1,
    unit: 'Project Contract',
    location: 'Remote / Hybrid (Chicago HQ)',
    deadline: future(30),
    category: 'IT Services & Consulting',
    targetBudget: 25000,
    status: 'OPEN',
    createdAt: new Date('2026-09-21T07:45:00Z'),
  };

  const rfq5 = {
    _id: 'rfq_5',
    id: 'rfq_5',
    buyer: buyer2._id,
    title: 'Heavy-Duty Corrugated Shipping Boxes (Double Wall 5-Ply)',
    description:
      'Custom printed corrugated boxes for e-commerce export packaging. Dimensions: 45cm x 30cm x 30cm. Bursting strength minimum 14 kg/cm², ECT 44. Water-resistant outer liner and single-color flexo branding print.',
    quantity: 15000,
    unit: 'Boxes',
    location: 'Dallas Distribution Hub, TX, USA',
    deadline: future(10),
    category: 'Packaging & Paper',
    targetBudget: 18000,
    status: 'OPEN',
    createdAt: new Date('2026-09-21T12:00:00Z'),
  };

  memoryStore.rfqs.push(rfq1, rfq2, rfq3, rfq4, rfq5);

  const quote1 = {
    _id: 'quote_1',
    id: 'quote_1',
    rfq: rfq1._id,
    supplier: supplier1._id,
    price: 42500,
    deliveryTime: '10 business days',
    notes:
      'All pipes strictly manufactured to ASTM A312. Complete EN 10204 3.1 inspection certification and mill test reports provided. Price includes insured road transit to Visakhapatnam.',
    status: 'PENDING',
    createdAt: new Date('2026-09-19T14:20:00Z'),
  };

  const quote2 = {
    _id: 'quote_2',
    id: 'quote_2',
    rfq: rfq1._id,
    supplier: supplier2._id,
    price: 44000,
    deliveryTime: '7 business days',
    notes:
      'Premium European grade 316L seamless pipes stocked in ready warehouse inventory. Express dispatch within 48 hours of PO confirmation.',
    status: 'PENDING',
    createdAt: new Date('2026-09-20T10:10:00Z'),
  };

  const quote3 = {
    _id: 'quote_3',
    id: 'quote_3',
    rfq: rfq3._id,
    supplier: supplier1._id,
    price: 36800,
    deliveryTime: '5 business days',
    notes:
      '100% GOTS certified organic yarn from certified organic farm co-ops. Moisture test and Uster statistics verified. Free pre-shipment cone samples available.',
    status: 'PENDING',
    createdAt: new Date('2026-09-21T09:30:00Z'),
  };

  memoryStore.quotations.push(quote1, quote2, quote3);
  console.log('✓ Initialized in-memory demo data with realistic RFQs & quotes.');
};

// Initialize DB
const initDatabase = async (uri) => {
  try {
    console.log(`Connecting to MongoDB at: ${uri} (timeout: 2.5s)...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnectedToMongo = true;
    console.log('✓ Successfully connected to live MongoDB database!');
  } catch (err) {
    isConnectedToMongo = false;
    console.log('-----------------------------------------------------------');
    console.log('ℹ️  MongoDB server is not reachable locally.');
    console.log('⚡ ProcureFlow Resilient Engine activated (In-Memory Datastore).');
    console.log('   All APIs, authentication, RFQ CRUD, and bidding work 100%!');
    console.log('   (To use live MongoDB, set MONGODB_URI in server/.env)');
    console.log('-----------------------------------------------------------');
    await seedInMemoryData();
  }
};

module.exports = {
  initDatabase,
  getIsConnected: () => isConnectedToMongo,
  memoryStore,
  seedInMemoryData,
};
