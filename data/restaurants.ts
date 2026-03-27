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
    id: '1',
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
        id: 'm1',
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
        id: 'm2',
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
        id: 'm3',
        name: 'Dal Makhani',
        description: 'Black lentils slow-cooked overnight with butter and cream.',
        price: 240,
        calories: 380,
        ingredients: ['Black Lentils', 'Butter', 'Cream', 'Tomatoes', 'Spices'],
        allergens: ['Dairy'],
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=70',
      },
      {
        id: 'm4',
        name: 'Butter Naan',
        description: 'Soft tandoori bread brushed with butter.',
        price: 50,
        calories: 260,
        ingredients: ['Flour', 'Butter', 'Yeast', 'Milk'],
        allergens: ['Gluten', 'Dairy'],
        category: 'Breads',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=70',
      },
      {
        id: 'm5',
        name: 'Gulab Jamun',
        description: 'Deep-fried milk dumplings soaked in cardamom sugar syrup.',
        price: 120,
        calories: 340,
        ingredients: ['Milk Solids', 'Sugar', 'Cardamom', 'Ghee'],
        allergens: ['Dairy', 'Gluten'],
        category: 'Dessert',
        image: 'https://images.unsplash.com/photo-1666190050572-7e0f1e0d10cc?w=400&q=70',
      },
      {
        id: 'm6',
        name: 'Mango Lassi',
        description: 'Chilled yogurt drink blended with fresh mango pulp.',
        price: 90,
        calories: 180,
        ingredients: ['Yogurt', 'Mango', 'Sugar', 'Cardamom'],
        allergens: ['Dairy'],
        category: 'Drinks',
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=70',
      },
      {
        id: 'm7',
        name: 'Chicken Tikka',
        description: 'Juicy marinated chicken baked in tandoor.',
        price: 320,
        calories: 380,
        ingredients: ['Chicken', 'Yogurt', 'Spices', 'Lemon'],
        allergens: ['Dairy'],
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=70',
      },
      {
        id: 'm8',
        name: 'Pizza Margherita',
        description: 'Classic pizza with mozzarella, tomatoes & basil.',
        price: 350,
        calories: 680,
        ingredients: ['Flour', 'Mozzarella', 'Tomatoes', 'Basil', 'Olive Oil'],
        allergens: ['Gluten', 'Dairy'],
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=70',
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
      {
        id: 'r2',
        user: 'Alice Smith',
        rating: 4,
        comment: 'Great ambience, but the waiting time was a bit long.',
        date: '1 week ago',
        avatar: 'https://i.pravatar.cc/150?img=47',
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
    id: '2',
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
        id: 'b1',
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
        id: 'b2',
        name: 'Spicy Chicken Burger',
        description: 'Spicy chicken burger with jalapenos and signature mayo.',
        price: 220,
        calories: 720,
        ingredients: ['Chicken', 'Jalapenos', 'Mayo', 'Bun'],
        allergens: ['Gluten', 'Eggs'],
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=70',
      },
      {
        id: 'b3',
        name: 'Loaded Fries',
        description: 'Crispy fries topped with melted cheese, bacon & sour cream.',
        price: 180,
        calories: 620,
        ingredients: ['Potatoes', 'Cheese', 'Bacon', 'Sour Cream'],
        allergens: ['Dairy', 'Gluten'],
        category: 'Sides',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=70',
      },
      {
        id: 'b4',
        name: 'Cola Float',
        description: 'Classic cola topped with a scoop of vanilla ice cream.',
        price: 120,
        calories: 280,
        ingredients: ['Cola', 'Vanilla Ice Cream'],
        allergens: ['Dairy'],
        category: 'Drinks',
        image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&q=70',
      },
      {
        id: 'b5',
        name: 'Veggie Delight Burger',
        description: 'Grilled vegetable patty with pesto and fresh greens.',
        price: 200,
        calories: 420,
        ingredients: ['Mixed Veg Patty', 'Pesto', 'Lettuce', 'Tomato', 'Bun'],
        allergens: ['Gluten', 'Nuts'],
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=70',
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
    id: '3',
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
        id: 'p1',
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
        id: 'p2',
        name: 'Margherita Pizza',
        description: 'Fresh basil, mozzarella, and San Marzano tomatoes.',
        price: 380,
        calories: 650,
        ingredients: ['Flour', 'Mozzarella', 'Tomatoes', 'Basil'],
        allergens: ['Gluten', 'Dairy'],
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=70',
      },
      {
        id: 'p3',
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter and herbs.',
        price: 150,
        calories: 320,
        ingredients: ['Bread', 'Garlic', 'Butter', 'Herbs'],
        allergens: ['Gluten', 'Dairy'],
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1573140401552-3fab0b5a0e76?w=400&q=70',
      },
      {
        id: 'p4',
        name: 'Pasta Alfredo',
        description: 'Creamy white sauce pasta with mushrooms.',
        price: 320,
        calories: 580,
        ingredients: ['Pasta', 'Cream', 'Parmesan', 'Mushrooms', 'Garlic'],
        allergens: ['Gluten', 'Dairy'],
        category: 'Pasta',
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=70',
      },
      {
        id: 'p5',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with mascarpone and espresso.',
        price: 260,
        calories: 420,
        ingredients: ['Mascarpone', 'Espresso', 'Cocoa', 'Ladyfingers'],
        allergens: ['Dairy', 'Gluten', 'Eggs'],
        category: 'Dessert',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=70',
      },
      {
        id: 'p6',
        name: 'BBQ Chicken Pizza',
        description: 'Tandoori chicken with barbecue sauce and red onions.',
        price: 520,
        calories: 820,
        ingredients: ['Flour', 'Chicken', 'BBQ Sauce', 'Mozzarella', 'Onions'],
        allergens: ['Gluten', 'Dairy'],
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=70',
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
      {
        id: 'r5',
        user: 'Rahul Kumar',
        rating: 4,
        comment: 'Good pizza but slightly overpriced. Service was good though.',
        date: '5 days ago',
        avatar: 'https://i.pravatar.cc/150?img=8',
      },
    ],
    criticReviews: [
      {
        id: 'c2',
        name: 'Julia C.',
        credential: 'Senior Food Editor',
        rating: 4.5,
        review: 'A delightful experience. The ingredients are fresh and the presentation is superb.',
        avatar: 'https://i.pravatar.cc/150?img=5',
        badge: 'Top Reviewer',
      },
    ],
    offers: [
      { id: 'o4', title: 'Buy 1 Get 1', description: 'Buy any large pizza, get a medium free!', code: 'BOGO' },
      { id: 'o5', title: 'Student Discount', description: '15% off with valid student ID', code: 'STUDENT15' },
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
