const config = {
  Salon: {
    label: 'Hair Salon / Spa',
    emoji: '💇',
    modules: ['appointments', 'staff', 'inventory', 'suppliers', 'analytics'],
    aiContext: 'hair salon and spa — services include haircuts, coloring, styling, manicures',
    supplyKeywords: ['shampoo', 'conditioner', 'hair dye', 'styling products', 'tools'],
    defaultInventory: [
      { name: 'Shampoo', category: 'Hair Care', quantity: 20, reorderPoint: 5, unit: 'bottles', cost: 8 },
      { name: 'Conditioner', category: 'Hair Care', quantity: 15, reorderPoint: 5, unit: 'bottles', cost: 8 },
      { name: 'Hair Dye', category: 'Color', quantity: 8, reorderPoint: 3, unit: 'boxes', cost: 15 },
      { name: 'Styling Gel', category: 'Styling', quantity: 12, reorderPoint: 4, unit: 'jars', cost: 6 },
      { name: 'Hair Scissors', category: 'Tools', quantity: 6, reorderPoint: 2, unit: 'pairs', cost: 45 },
      { name: 'Hair Dryer', category: 'Tools', quantity: 4, reorderPoint: 1, unit: 'units', cost: 80 },
      { name: 'Bleach Powder', category: 'Color', quantity: 3, reorderPoint: 2, unit: 'bags', cost: 12 }
    ]
  },
  Store: {
    label: 'Convenience Store',
    emoji: '🏪',
    modules: ['inventory', 'suppliers', 'staff', 'analytics'],
    aiContext: 'convenience store selling groceries, beverages, snacks, and household items',
    supplyKeywords: ['milk', 'bread', 'beverages', 'snacks', 'dairy'],
    defaultInventory: [
      { name: 'Milk', category: 'Dairy', quantity: 30, reorderPoint: 10, unit: 'gallons', cost: 4 },
      { name: 'Bread', category: 'Bakery', quantity: 25, reorderPoint: 8, unit: 'loaves', cost: 3 },
      { name: 'Soda (24-pack)', category: 'Beverages', quantity: 20, reorderPoint: 8, unit: 'cases', cost: 12 },
      { name: 'Chips', category: 'Snacks', quantity: 40, reorderPoint: 15, unit: 'bags', cost: 2 },
      { name: 'Eggs', category: 'Dairy', quantity: 20, reorderPoint: 6, unit: 'dozens', cost: 4 },
      { name: 'Water Bottles', category: 'Beverages', quantity: 48, reorderPoint: 12, unit: 'packs', cost: 5 },
      { name: 'Candy Bars', category: 'Snacks', quantity: 60, reorderPoint: 20, unit: 'boxes', cost: 1 }
    ]
  },
  Boutique: {
    label: 'Clothing Boutique',
    emoji: '👕',
    modules: ['inventory', 'trends', 'staff', 'analytics'],
    aiContext: 'clothing boutique selling fashion apparel, accessories, and seasonal items',
    supplyKeywords: ['dresses', 'jeans', 't-shirts', 'jackets', 'accessories'],
    defaultInventory: [
      { name: 'Summer Dresses', category: "Women's", quantity: 15, reorderPoint: 5, unit: 'pieces', cost: 30 },
      { name: 'Denim Jeans', category: 'Unisex', quantity: 20, reorderPoint: 8, unit: 'pieces', cost: 40 },
      { name: 'T-Shirts', category: 'Casual', quantity: 35, reorderPoint: 10, unit: 'pieces', cost: 15 },
      { name: 'Blazers', category: 'Formal', quantity: 8, reorderPoint: 3, unit: 'pieces', cost: 75 },
      { name: 'Sneakers', category: 'Footwear', quantity: 12, reorderPoint: 4, unit: 'pairs', cost: 60 },
      { name: 'Handbags', category: 'Accessories', quantity: 10, reorderPoint: 3, unit: 'pieces', cost: 50 },
      { name: 'Scarves', category: 'Accessories', quantity: 25, reorderPoint: 8, unit: 'pieces', cost: 20 }
    ]
  },
  Laundromat: {
    label: 'Laundromat',
    emoji: '🧺',
    modules: ['inventory', 'staff', 'maintenance', 'analytics'],
    aiContext: 'laundromat with self-service and full-service washing, drying, and dry cleaning',
    supplyKeywords: ['detergent', 'fabric softener', 'bleach', 'dryer sheets'],
    defaultInventory: [
      { name: 'Laundry Detergent', category: 'Supplies', quantity: 50, reorderPoint: 15, unit: 'boxes', cost: 10 },
      { name: 'Fabric Softener', category: 'Supplies', quantity: 30, reorderPoint: 10, unit: 'bottles', cost: 7 },
      { name: 'Dryer Sheets', category: 'Supplies', quantity: 40, reorderPoint: 12, unit: 'boxes', cost: 8 },
      { name: 'Bleach', category: 'Supplies', quantity: 20, reorderPoint: 6, unit: 'bottles', cost: 5 },
      { name: 'Stain Remover', category: 'Supplies', quantity: 25, reorderPoint: 8, unit: 'bottles', cost: 6 },
      { name: 'Washing Machine Cleaner', category: 'Maintenance', quantity: 10, reorderPoint: 3, unit: 'packs', cost: 12 },
      { name: 'Coin Rolls', category: 'Operations', quantity: 100, reorderPoint: 20, unit: 'rolls', cost: 10 }
    ]
  },
  Cafe: {
    label: 'Café / Food Truck',
    emoji: '☕',
    modules: ['inventory', 'suppliers', 'staff', 'analytics'],
    aiContext: 'cafe and food truck serving coffee, pastries, sandwiches, and beverages',
    supplyKeywords: ['coffee beans', 'milk', 'flour', 'sugar', 'cups'],
    defaultInventory: [
      { name: 'Coffee Beans', category: 'Coffee', quantity: 10, reorderPoint: 3, unit: 'kg', cost: 20 },
      { name: 'Milk', category: 'Dairy', quantity: 20, reorderPoint: 5, unit: 'liters', cost: 2 },
      { name: 'Sugar', category: 'Sweeteners', quantity: 15, reorderPoint: 4, unit: 'kg', cost: 2 },
      { name: 'Pastry Flour', category: 'Baking', quantity: 8, reorderPoint: 2, unit: 'kg', cost: 3 },
      { name: 'Disposable Cups', category: 'Supplies', quantity: 500, reorderPoint: 100, unit: 'pieces', cost: 0.1 },
      { name: 'Espresso Pods', category: 'Coffee', quantity: 200, reorderPoint: 50, unit: 'pods', cost: 0.5 },
      { name: 'Oat Milk', category: 'Dairy', quantity: 12, reorderPoint: 4, unit: 'liters', cost: 3 }
    ]
  },
  ServiceShop: {
    label: 'Local Service Shop',
    emoji: '🧰',
    modules: ['inventory', 'staff', 'jobs', 'analytics'],
    aiContext: 'local repair and service shop handling mechanical, electrical, and general repair jobs',
    supplyKeywords: ['engine oil', 'brake pads', 'filters', 'spark plugs', 'tools'],
    defaultInventory: [
      { name: 'Engine Oil (5W-30)', category: 'Fluids', quantity: 20, reorderPoint: 6, unit: 'liters', cost: 8 },
      { name: 'Brake Pads', category: 'Brakes', quantity: 8, reorderPoint: 3, unit: 'sets', cost: 35 },
      { name: 'Air Filters', category: 'Filters', quantity: 15, reorderPoint: 5, unit: 'pieces', cost: 12 },
      { name: 'Spark Plugs', category: 'Ignition', quantity: 24, reorderPoint: 8, unit: 'pieces', cost: 4 },
      { name: 'Wrench Set', category: 'Tools', quantity: 5, reorderPoint: 2, unit: 'sets', cost: 60 },
      { name: 'WD-40', category: 'Supplies', quantity: 10, reorderPoint: 3, unit: 'cans', cost: 7 },
      { name: 'Transmission Fluid', category: 'Fluids', quantity: 12, reorderPoint: 4, unit: 'liters', cost: 10 }
    ]
  }
};

module.exports = {
  getConfig: () => config,
  getBusinessConfig: (type) => config[type] || null,
  getModules: (type) => (config[type] ? config[type].modules : []),
  getAllTypes: () => Object.keys(config),
  getModuleMap: () => {
    const map = {};
    Object.entries(config).forEach(([type, val]) => {
      map[type] = val.modules;
    });
    return map;
  }
};
