const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Rfq = require('./models/Rfq');
const Quotation = require('./models/Quotation');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/b2b-rfq-marketplace';

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing old data...');
    await Quotation.deleteMany({});
    await Rfq.deleteMany({});
    await User.deleteMany({});

    console.log('Seeding demo users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Buyer
    const buyer = await User.create({
      name: 'Aditya Sharma',
      email: 'buyer@demo.com',
      password: hashedPassword,
      role: 'BUYER',
      companyName: 'Apex Global Procurement Ltd.',
      location: 'Bengaluru, India',
    });

    const buyer2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@globaltech.com',
      password: hashedPassword,
      role: 'BUYER',
      companyName: 'NovaTech Industries USA',
      location: 'Chicago, IL, USA',
    });

    // Create Suppliers
    const supplier1 = await User.create({
      name: 'Vikram Mehta',
      email: 'supplier@demo.com',
      password: hashedPassword,
      role: 'SUPPLIER',
      companyName: 'Zenith Industrial & Metals Corp.',
      location: 'Mumbai, India',
    });

    const supplier2 = await User.create({
      name: 'Elena Rostova',
      email: 'vendor@demo.com',
      password: hashedPassword,
      role: 'SUPPLIER',
      companyName: 'NextGen Hardware & Logistics',
      location: 'Frankfurt, Germany',
    });

    const supplier3 = await User.create({
      name: 'Rajesh Patel',
      email: 'rajesh@solarenergy.in',
      password: hashedPassword,
      role: 'SUPPLIER',
      companyName: 'SunPower Renewable Components',
      location: 'Ahmedabad, India',
    });

    console.log('Seeding sample RFQs...');
    const now = new Date();

    // Helper for future deadlines
    const futureDate = (days) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d;
    };

    const rfq1 = await Rfq.create({
      buyer: buyer._id,
      title: 'Grade 316L Stainless Steel Seamless Pipes',
      description:
        'Requirement for 2,500 meters of ASTM A312 Grade 316L seamless stainless steel pipes. Outer diameter 2 inches, schedule 40. High corrosion resistance required for chemical manufacturing plant piping network. Material test certificates (MTC 3.1) required with shipment.',
      quantity: 2500,
      unit: 'Meters',
      location: 'Visakhapatnam Port / Warehouse A-4, India',
      deadline: futureDate(14),
      category: 'Metals & Manufacturing',
      targetBudget: 45000,
      status: 'OPEN',
    });

    const rfq2 = await Rfq.create({
      buyer: buyer._id,
      title: 'Commercial Monocrystalline 550W Solar PV Modules',
      description:
        'Procurement of Tier-1 bifacial monocrystalline solar panels with minimum 21.5% module efficiency. Must carry 25-year linear power warranty and IEC 61215/61730 certifications. Suitable for 500kW rooftop commercial solar installation.',
      quantity: 900,
      unit: 'Panels',
      location: 'Bengaluru Logistics Park, Karnataka',
      deadline: futureDate(21),
      category: 'Energy & Power',
      targetBudget: 85000,
      status: 'OPEN',
    });

    const rfq3 = await Rfq.create({
      buyer: buyer._id,
      title: '100% GOTS Certified Organic Combed Cotton Yarn (30s Count)',
      description:
        'Sourcing 10 metric tons of ring-spun organic combed cotton yarn for sustainable apparel manufacturing. Count 30/1 Ne, evenness CV% below 11.5, tensile strength > 16.5 cN/tex. Organic certificate (GOTS) must accompany batch sample.',
      quantity: 10000,
      unit: 'Kilograms',
      location: 'Tirupur Textile Hub, Tamil Nadu',
      deadline: futureDate(7),
      category: 'Textiles & Apparel',
      targetBudget: 38000,
      status: 'OPEN',
    });

    const rfq4 = await Rfq.create({
      buyer: buyer2._id,
      title: 'Enterprise Cloud Architecture & ISO 27001 Security Audit',
      description:
        'Seeking certified cybersecurity firm to conduct comprehensive cloud vulnerability assessment, penetration testing (VAPT), and ISO/IEC 27001 readiness review across AWS and Azure infrastructure supporting 1M+ active users.',
      quantity: 1,
      unit: 'Project Contract',
      location: 'Remote / Hybrid (Headquarters: Chicago, IL)',
      deadline: futureDate(30),
      category: 'IT Services & Consulting',
      targetBudget: 25000,
      status: 'OPEN',
    });

    const rfq5 = await Rfq.create({
      buyer: buyer2._id,
      title: 'Heavy-Duty Corrugated Shipping Boxes (Double Wall 5-Ply)',
      description:
        'Custom printed corrugated boxes for e-commerce export packaging. Dimensions: 45cm x 30cm x 30cm. Bursting strength minimum 14 kg/cm², ECT 44. Water-resistant outer liner and single-color flexo branding print.',
      quantity: 15000,
      unit: 'Boxes',
      location: 'Dallas Distribution Hub, TX, USA',
      deadline: futureDate(10),
      category: 'Packaging & Paper',
      targetBudget: 18000,
      status: 'OPEN',
    });

    console.log('Seeding quotations...');
    // Quotations for RFQ 1 (Steel Pipes)
    await Quotation.create({
      rfq: rfq1._id,
      supplier: supplier1._id,
      price: 42500,
      deliveryTime: '10 business days',
      notes:
        'All pipes strictly manufactured to ASTM A312. Complete EN 10204 3.1 inspection certification and mill test reports provided. Price includes insured road transit to Visakhapatnam.',
      status: 'PENDING',
    });

    await Quotation.create({
      rfq: rfq1._id,
      supplier: supplier2._id,
      price: 44000,
      deliveryTime: '7 business days',
      notes:
        'Premium European grade 316L seamless pipes stocked in ready warehouse inventory. Express dispatch within 48 hours of PO confirmation.',
      status: 'PENDING',
    });

    // Quotations for RFQ 2 (Solar Panels)
    await Quotation.create({
      rfq: rfq2._id,
      supplier: supplier3._id,
      price: 81000,
      deliveryTime: '15 business days',
      notes:
        'Official tier-1 550W bifacial modules with 21.8% efficiency. 12-year product warranty + 30-year performance guarantee. Batch flash test data provided.',
      status: 'PENDING',
    });

    // Quotation for RFQ 3 (Cotton Yarn)
    await Quotation.create({
      rfq: rfq3._id,
      supplier: supplier1._id,
      price: 36800,
      deliveryTime: '5 business days',
      notes:
        '100% GOTS certified organic yarn from certified organic farm co-ops. Moisture test and Uster statistics verified. Free pre-shipment cone samples available.',
      status: 'PENDING',
    });

    console.log('Seed completed successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
