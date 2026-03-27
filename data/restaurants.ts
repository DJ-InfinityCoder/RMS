// ─── Restaurant Data with Menu Items, Categories, Offers ─────────────────────

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  ingredients: string[];
  allergens: string[];
  category: string;
  image: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export interface CriticReview {
  id: string;
  name: string;
  credential: string;
  rating: number;
  review: string;
  avatar: string;
  badge: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
}

export interface TableSlot {
  time: string;
  totalSeats: number;
  bookedSeats: number;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  latitude: number;
  longitude: number;
  image: string;
  cuisine: string[];
  description: string;
  phone: string;
  address: string;
  menuItems: MenuItem[];
  reviews: Review[];
  criticReviews: CriticReview[];
  offers: Offer[];
  tableSlots: TableSlot[];
}

export const restaurants: Restaurant[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Rose Garden Restaurant',
    rating: 4.7,
    deliveryTime: '20 min',
    latitude: 28.8125,
    longitude: 77.1325,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=70',
    cuisine: ['Indian', 'Chinese', 'Continental'],
    description: 'Fine dining experience with modern fusion cuisine. Pre-order your meals or book a table now.',
    phone: '+91 98765 43210',
    address: 'Sector 15, Noida, UP 201301',
    menuItems: [
      {
        id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
        name: 'Veg Biryani',
        description: 'Fragrant basmati rice with fresh vegetables and aromatic spices.',
        price: 220,
        calories: 450,
        ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Saffron', 'Ghee', 'Spices'],
        allergens: ['Dairy'],
        category: 'Rice',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=70',
      },
      {
        id: '2a3b4c5d-6e7f-8g9h-0i1j-2k3l4m5n6o7p',
        name: 'Paneer Butter Masala',
        description: 'Soft paneer cubes in a rich, creamy tomato gravy.',
        price: 280,
        calories: 520,
        ingredients: ['Paneer', 'Butter', 'Cream', 'Tomatoes', 'Cashews'],
        allergens: ['Dairy', 'Nuts'],
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&q=70',
      },
      {
        id: '3a4b5c6d-7e8f-9g0h-1i2j-3k4l5m6n7o8p',
        name: 'Dal Makhani',
        description: 'Black lentils slow-cooked overnight with butter and cream.',
        price: 240,
        calories: 380,
        ingredients: ['Black Lentils', 'Butter', 'Cream', 'Tomatoes', 'Spices'],
        allergens: ['Dairy'],
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=70',
      },
    ],
    reviews: [
      {
        id: 'r1',
        user: 'John Doe',
        rating: 5,
        comment: 'Amazing food and quick service! The burgers are top notch.',
        date: '2 days ago',
        avatar: 'https://i.pravatar.cc/150?img=68',
      },
    ],
    criticReviews: [
      {
        id: 'c1',
        name: 'Gordon R.',
        credential: 'Michelin Star Chef',
        rating: 4.8,
        review: 'The culinary execution here is exquisite. Highly recommended for the discerning palate.',
        avatar: 'https://i.pravatar.cc/150?img=11',
        badge: 'Verified Critic',
      },
    ],
    offers: [
      { id: 'o1', title: 'Lunch Special', description: '20% off on all heavy meals', code: 'LUNCH20' },
      { id: 'o2', title: 'Free Lassi', description: 'Get a free mango lassi with every main course', code: 'FREELASSI' },
    ],
    tableSlots: [
      { time: '12:00 PM', totalSeats: 20, bookedSeats: 14 },
      { time: '1:00 PM', totalSeats: 20, bookedSeats: 20 },
      { time: '7:00 PM', totalSeats: 20, bookedSeats: 8 },
      { time: '8:00 PM', totalSeats: 20, bookedSeats: 18 },
      { time: '9:00 PM', totalSeats: 20, bookedSeats: 5 },
    ],
  },
  {
    id: 'b87ac10b-58cc-4372-a567-0e02b2c3d480',
    name: 'American Spicy Burger',
    rating: 4.3,
    deliveryTime: '25 min',
    latitude: 28.8025,
    longitude: 77.1325,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=70',
    cuisine: ['American', 'Fast Food', 'Burger'],
    description: 'Best burgers in town with premium patties and secret sauces.',
    phone: '+91 98765 43211',
    address: 'Sector 18, Noida, UP 201301',
    menuItems: [
      {
        id: '4a5b6c7d-8e9f-0g1h-2i3j-4k5l6m7n8o9p',
        name: 'Classic Smash Burger',
        description: 'Double beef patty with cheddar cheese and special sauce.',
        price: 250,
        calories: 850,
        ingredients: ['Beef', 'Cheddar', 'Lettuce', 'Bun', 'Special Sauce'],
        allergens: ['Gluten', 'Dairy'],
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70',
      },
      {
        id: '5a6b7c8d-9e0f-1g2h-3i4j-5k6l7m8n9o0p',
        name: 'Spicy Chicken Burger',
        description: 'Spicy chicken burger with jalapenos and signature mayo.',
        price: 220,
        calories: 720,
        ingredients: ['Chicken', 'Jalapenos', 'Mayo', 'Bun'],
        allergens: ['Gluten', 'Eggs'],
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=70',
      },
    ],
    reviews: [
      {
        id: 'r3',
        user: 'Mike Johnson',
        rating: 5,
        comment: 'Best burgers in town! The smash burger is juicy perfection.',
        date: '3 days ago',
        avatar: 'https://i.pravatar.cc/150?img=33',
      },
    ],
    criticReviews: [],
    offers: [
      { id: 'o3', title: 'Combo Deal', description: 'Burger + Fries + Drink for ₹380', code: 'COMBO380' },
    ],
    tableSlots: [
      { time: '12:00 PM', totalSeats: 12, bookedSeats: 6 },
      { time: '1:00 PM', totalSeats: 12, bookedSeats: 12 },
      { time: '7:00 PM', totalSeats: 12, bookedSeats: 3 },
      { time: '8:00 PM', totalSeats: 12, bookedSeats: 10 },
    ],
  },
  {
    id: 'c97ac10b-58cc-4372-a567-0e02b2c3d481',
    name: 'Pizza Palace',
    rating: 4.5,
    deliveryTime: '30 min',
    latitude: 28.8125,
    longitude: 77.1225,
    image: 'https://images.unsplash.com/photo-1548365328-9f547fb09594?w=600&q=70',
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    description: 'Authentic Italian pizzas baked in wood-fired ovens.',
    phone: '+91 98765 43212',
    address: 'GIP Mall, Sector 38, Noida',
    menuItems: [
      {
        id: '6a7b8c9d-0e1f-2g3h-4i5j-6k7l8m9n0o1p',
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni with mozzarella on hand-tossed dough.',
        price: 450,
        calories: 780,
        ingredients: ['Flour', 'Mozzarella', 'Pepperoni', 'Tomato Sauce'],
        allergens: ['Gluten', 'Dairy'],
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=70',
      },
      {
        id: '7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p',
        name: 'Margherita Pizza',
        description: 'Fresh basil, mozzarella, and San Marzano tomatoes.',
        price: 380,
        calories: 650,
        ingredients: ['Flour', 'Mozzarella', 'Tomatoes', 'Basil'],
        allergens: ['Gluten', 'Dairy'],
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=70',
      },
    ],
    reviews: [
      {
        id: 'r4',
        user: 'Sara Williams',
        rating: 5,
        comment: 'The pepperoni pizza is absolutely divine! Crispy crust and generous toppings.',
        date: '1 day ago',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
    ],
    criticReviews: [],
    offers: [
      { id: 'o4', title: 'Buy 1 Get 1', description: 'Buy any large pizza, get a medium free!', code: 'BOGO' },
    ],
    tableSlots: [
      { time: '12:00 PM', totalSeats: 30, bookedSeats: 12 },
      { time: '1:00 PM', totalSeats: 30, bookedSeats: 28 },
      { time: '7:00 PM', totalSeats: 30, bookedSeats: 15 },
      { time: '8:00 PM', totalSeats: 30, bookedSeats: 30 },
      { time: '9:00 PM', totalSeats: 30, bookedSeats: 20 },
    ],
  },
];

// Helper: get all unique categories across all restaurants
export const getAllCategories = (): string[] => {
  const cats = new Set<string>();
  restaurants.forEach((r) => r.menuItems.forEach((m) => cats.add(m.category)));
  return Array.from(cats);
};

// Helper: search restaurants by item/category name
export const searchByItemOrCategory = (query: string): Restaurant[] => {
  const q = query.toLowerCase().trim();
  if (!q) return restaurants;
  return restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
      r.menuItems.some(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      )
  );
};
