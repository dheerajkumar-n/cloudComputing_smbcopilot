require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const BusinessProfile = require('../models/BusinessProfile');
const InventoryItem = require('../models/InventoryItem');
const Employee = require('../models/Employee');
const Shift = require('../models/Shift');
const Supplier = require('../models/Supplier');
const businessConfigService = require('../services/businessConfigService');

const BUSINESSES = [
  { name: "Glamour Studio", businessType: "Salon", ownerName: "Maria Santos", phone: "555-0101" },
  { name: "QuickMart Corner", businessType: "Store", ownerName: "John Lee", phone: "555-0102" },
  { name: "Threads & Style", businessType: "Boutique", ownerName: "Priya Patel", phone: "555-0103" },
  { name: "SpinCycle Laundromat", businessType: "Laundromat", ownerName: "David Kim", phone: "555-0104" },
  { name: "Brew & Go Café", businessType: "Cafe", ownerName: "Sofia Rossi", phone: "555-0105" },
  { name: "FixIt Pro Shop", businessType: "ServiceShop", ownerName: "Carlos Mendez", phone: "555-0106" }
];

const EMPLOYEES_BY_TYPE = {
  Salon: [
    { name: "Emma Wilson", role: "Senior Stylist", hourlyRate: 22 },
    { name: "Jake Torres", role: "Colorist", hourlyRate: 20 },
    { name: "Lily Chen", role: "Nail Technician", hourlyRate: 18 },
    { name: "Amir Hassan", role: "Assistant Stylist", hourlyRate: 15 }
  ],
  Store: [
    { name: "Ryan Park", role: "Store Manager", hourlyRate: 20 },
    { name: "Tanya Brown", role: "Cashier", hourlyRate: 14 },
    { name: "Marco Rivera", role: "Stock Clerk", hourlyRate: 13 },
    { name: "Nia Williams", role: "Cashier", hourlyRate: 14 }
  ],
  Boutique: [
    { name: "Sophia Adams", role: "Store Manager", hourlyRate: 19 },
    { name: "Oliver James", role: "Sales Associate", hourlyRate: 15 },
    { name: "Isabella Moore", role: "Visual Merchandiser", hourlyRate: 17 }
  ],
  Laundromat: [
    { name: "Derek Hall", role: "Attendant", hourlyRate: 14 },
    { name: "Carmen Lopez", role: "Attendant", hourlyRate: 14 },
    { name: "Ben Foster", role: "Maintenance", hourlyRate: 16 }
  ],
  Cafe: [
    { name: "Luna Barrera", role: "Head Barista", hourlyRate: 18 },
    { name: "Sam Nguyen", role: "Barista", hourlyRate: 15 },
    { name: "Freya Jensen", role: "Kitchen Staff", hourlyRate: 14 },
    { name: "Kai Thompson", role: "Barista", hourlyRate: 15 }
  ],
  ServiceShop: [
    { name: "Tony Russo", role: "Lead Technician", hourlyRate: 25 },
    { name: "Andre Baptiste", role: "Mechanic", hourlyRate: 22 },
    { name: "Mia Gonzalez", role: "Service Advisor", hourlyRate: 18 },
    { name: "Darius King", role: "Apprentice", hourlyRate: 14 }
  ]
};

const SUPPLIERS_BY_TYPE = {
  Salon: [
    { name: "ProBeauty Supply Co.", contactName: "Rachel Green", category: "Hair Care", rating: 5, leadTimeDays: 2, phone: "555-2001" },
    { name: "StylePro Wholesale", contactName: "Tom Baker", category: "Tools & Equipment", rating: 4, leadTimeDays: 4, phone: "555-2002" },
    { name: "ColorWorld Dist.", contactName: "Ana Flores", category: "Color Products", rating: 4, leadTimeDays: 3, phone: "555-2003" }
  ],
  Store: [
    { name: "Metro Grocery Dist.", contactName: "Mike Chen", category: "Food & Beverages", rating: 5, leadTimeDays: 1, phone: "555-2004" },
    { name: "QuickShip Wholesale", contactName: "Lisa Park", category: "Snacks", rating: 4, leadTimeDays: 2, phone: "555-2005" },
    { name: "FreshDairy Direct", contactName: "Bob White", category: "Dairy", rating: 5, leadTimeDays: 1, phone: "555-2006" }
  ],
  Boutique: [
    { name: "Fashion Forward Dist.", contactName: "Claire Dupont", category: "Women's Fashion", rating: 5, leadTimeDays: 7, phone: "555-2007" },
    { name: "UrbanThread Supply", contactName: "James Cole", category: "Casual Wear", rating: 4, leadTimeDays: 5, phone: "555-2008" },
    { name: "AccessoriesPro", contactName: "Nina Patel", category: "Accessories", rating: 4, leadTimeDays: 6, phone: "555-2009" }
  ],
  Laundromat: [
    { name: "CleanAll Supply Inc.", contactName: "Greg Smith", category: "Cleaning Products", rating: 5, leadTimeDays: 2, phone: "555-2010" },
    { name: "Industrial Chem Co.", contactName: "Pat Morgan", category: "Industrial Cleaners", rating: 4, leadTimeDays: 3, phone: "555-2011" }
  ],
  Cafe: [
    { name: "BeanRoute Coffee", contactName: "Elena Rossi", category: "Coffee & Tea", rating: 5, leadTimeDays: 2, phone: "555-2012" },
    { name: "Fresh Farms Dairy", contactName: "Will Davis", category: "Dairy", rating: 5, leadTimeDays: 1, phone: "555-2013" },
    { name: "Baker's Best Supply", contactName: "Marie Curie", category: "Baking", rating: 4, leadTimeDays: 2, phone: "555-2014" }
  ],
  ServiceShop: [
    { name: "AutoParts Direct", contactName: "Steve Rogers", category: "Auto Parts", rating: 5, leadTimeDays: 1, phone: "555-2015" },
    { name: "ProTools Wholesale", contactName: "Hank Pym", category: "Tools", rating: 4, leadTimeDays: 3, phone: "555-2016" },
    { name: "FluidTech Supply", contactName: "Tony Stark", category: "Fluids & Chemicals", rating: 5, leadTimeDays: 1, phone: "555-2017" }
  ]
};

function getDemoShifts(businessId, employees, businessType) {
  const shifts = [];
  const today = new Date();

  if (businessType === 'Salon') {
    const apptData = [
      { customerName: "Alice Cooper", service: "Haircut & Color", time: "09:00", end: "11:00" },
      { customerName: "Beth Miller", service: "Highlights", time: "11:30", end: "13:00" },
      { customerName: "Carol White", service: "Blowout", time: "14:00", end: "15:00" },
      { customerName: "Diana Prince", service: "Manicure", time: "15:30", end: "16:30" }
    ];
    apptData.forEach((appt, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      shifts.push({
        businessId,
        employeeId: employees[i % employees.length]._id,
        employeeName: employees[i % employees.length].name,
        date,
        startTime: appt.time,
        endTime: appt.end,
        type: 'appointment',
        customerName: appt.customerName,
        service: appt.service,
        status: 'scheduled'
      });
    });
  }

  employees.forEach((emp, idx) => {
    for (let d = 0; d < 5; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      if (!isWeekend || idx === 0) {
        shifts.push({
          businessId,
          employeeId: emp._id,
          employeeName: emp.name,
          date,
          startTime: idx % 2 === 0 ? '08:00' : '14:00',
          endTime: idx % 2 === 0 ? '14:00' : '20:00',
          type: 'shift',
          role: emp.role,
          status: 'scheduled'
        });
      }
    }
  });

  return shifts;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      BusinessProfile.deleteMany({}),
      InventoryItem.deleteMany({}),
      Employee.deleteMany({}),
      Shift.deleteMany({}),
      Supplier.deleteMany({})
    ]);
    console.log('Cleared existing data');

    const config = businessConfigService.getConfig();

    for (const biz of BUSINESSES) {
      const profile = await BusinessProfile.create(biz);
      console.log(`Created: ${biz.name} (${biz.businessType})`);

      const bizConfig = config[biz.businessType];

      const inventoryDocs = bizConfig.defaultInventory.map(item => ({
        ...item,
        businessId: profile._id
      }));
      await InventoryItem.insertMany(inventoryDocs);
      console.log(`  → ${inventoryDocs.length} inventory items`);

      const empData = EMPLOYEES_BY_TYPE[biz.businessType] || [];
      const employees = await Employee.insertMany(
        empData.map(e => ({ ...e, businessId: profile._id }))
      );
      console.log(`  → ${employees.length} employees`);

      const supplierData = SUPPLIERS_BY_TYPE[biz.businessType] || [];
      await Supplier.insertMany(supplierData.map(s => ({ ...s, businessId: profile._id })));
      console.log(`  → ${supplierData.length} suppliers`);

      const shiftDocs = getDemoShifts(profile._id, employees, biz.businessType);
      await Shift.insertMany(shiftDocs);
      console.log(`  → ${shiftDocs.length} shifts/appointments`);
    }

    console.log('\n✅ Seed complete! All 6 businesses seeded with demo data.');
    console.log('\nBusiness IDs (save these for testing):');
    const all = await BusinessProfile.find();
    all.forEach(b => console.log(`  ${b.businessType}: ${b._id} — ${b.name}`));

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
