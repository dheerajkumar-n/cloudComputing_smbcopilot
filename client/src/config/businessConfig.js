export const BUSINESS_TYPES = {
  Salon: {
    label: "Hair Salon / Spa",
    emoji: "💇",
    subtitle: "Manage bookings & restock beauty supplies",
    color: "#FF6B9D",
    gradient: "linear-gradient(135deg, #FF6B9D 0%, #C44B97 100%)",
    modules: [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "appointments", label: "Appointments", icon: "📅" },
      { id: "staff", label: "Staff & Shifts", icon: "👥" },
      { id: "inventory", label: "Beauty Inventory", icon: "🧴" },
      { id: "suppliers", label: "Suppliers", icon: "🚚" },
      { id: "analytics", label: "Analytics", icon: "📈" }
    ],
    samplePrompts: [
      "Check low stock beauty products",
      "Show today's appointments",
      "Which products need reordering?",
      "Show active staff members"
    ]
  },
  Store: {
    label: "Convenience Store",
    emoji: "🏪",
    subtitle: "Track inventory & manage suppliers",
    color: "#4ECDC4",
    gradient: "linear-gradient(135deg, #4ECDC4 0%, #1A9B8F 100%)",
    modules: [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "inventory", label: "Inventory", icon: "📦" },
      { id: "suppliers", label: "Suppliers", icon: "🚚" },
      { id: "staff", label: "Staff", icon: "👥" },
      { id: "analytics", label: "Analytics", icon: "📈" }
    ],
    samplePrompts: [
      "What items are running low?",
      "Compare my suppliers",
      "Reorder low stock items",
      "Show sales analytics"
    ]
  },
  Boutique: {
    label: "Clothing Boutique",
    emoji: "👕",
    subtitle: "Track stock, trends & pricing",
    color: "#A78BFA",
    gradient: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
    modules: [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "inventory", label: "Stock & Trends", icon: "👗" },
      { id: "suppliers", label: "Suppliers", icon: "🚚" },
      { id: "staff", label: "Sales Team", icon: "👥" },
      { id: "analytics", label: "Analytics", icon: "📈" }
    ],
    samplePrompts: [
      "Check clothing inventory levels",
      "What items are low in stock?",
      "Show my fashion suppliers",
      "View team schedule"
    ]
  },
  Laundromat: {
    label: "Laundromat",
    emoji: "🧺",
    subtitle: "Manage supplies, staff & maintenance",
    color: "#60A5FA",
    gradient: "linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)",
    modules: [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "inventory", label: "Supplies", icon: "🧴" },
      { id: "staff", label: "Staff & Hours", icon: "👥" },
      { id: "suppliers", label: "Suppliers", icon: "🚚" },
      { id: "analytics", label: "Analytics", icon: "📈" }
    ],
    samplePrompts: [
      "Check detergent supply levels",
      "Reorder cleaning supplies",
      "Show attendant schedule",
      "View usage analytics"
    ]
  },
  Cafe: {
    label: "Café / Food Truck",
    emoji: "☕",
    subtitle: "Manage ingredients & daily sales",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    modules: [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "inventory", label: "Ingredients", icon: "🧃" },
      { id: "suppliers", label: "Suppliers", icon: "🚚" },
      { id: "staff", label: "Staff", icon: "👥" },
      { id: "analytics", label: "Analytics", icon: "📈" }
    ],
    samplePrompts: [
      "Check coffee bean stock",
      "Reorder low ingredients",
      "Show barista schedule",
      "View daily sales report"
    ]
  },
  ServiceShop: {
    label: "Local Service Shop",
    emoji: "🧰",
    subtitle: "Schedule jobs & manage parts inventory",
    color: "#F97316",
    gradient: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    modules: [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "inventory", label: "Parts & Tools", icon: "🔧" },
      { id: "staff", label: "Technicians", icon: "👥" },
      { id: "suppliers", label: "Suppliers", icon: "🚚" },
      { id: "analytics", label: "Analytics", icon: "📈" }
    ],
    samplePrompts: [
      "Check parts inventory",
      "Reorder engine oil and filters",
      "Show technician schedule",
      "View job completion analytics"
    ]
  }
};

export const ALL_BUSINESS_TYPES = Object.keys(BUSINESS_TYPES);
