let dishes = {
  create: [
    // ==================== STARTERS ====================
    {
      name: 'Tandoori Paneer Tikka',
      description: 'Soft cottage cheese chunks marinated in yogurt and Indian spices, charred in a tandoor.',
      price: 320.00, 
      category: 'Starters',
      image_url: 'https://images.unsplash.com/photo-1599487405270-81f1cdcaa0fc?w=600',
      calories: 350, 
      cooking_method: 'Tandoor Grilled - Paneer cubes marinated for 4 hours in spiced yogurt, skewered with bell peppers and onions, grilled in a clay tandoor at 400°C for 8-10 minutes until charred edges appear. Basted with butter before serving.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Paneer (cottage cheese)', quantity: '200g', unit: 'grams' },
          { name: 'Greek Yogurt', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Ginger-Garlic Paste', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Tandoori Masala', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Red Chili Powder', quantity: '1 tsp', unit: 'teaspoon' },
          { name: 'Garam Masala', quantity: '1/2 tsp', unit: 'teaspoon' },
          { name: 'Lemon Juice', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Mustard Oil', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Bell Peppers (Capsicum)', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Onion', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Butter', quantity: '1 tbsp', unit: 'tablespoon' }
        ]
      }
    },
    {
      name: 'Crispy Spring Rolls',
      description: 'Golden fried rolls stuffed with crunchy vegetables and glass noodles.',
      price: 280.00, 
      category: 'Starters',
      image_url: 'https://images.unsplash.com/photo-1605856417539-780c8502cecc?w=600',
      calories: 400, 
      cooking_method: 'Deep Fried - Vegetables and soaked glass noodles stir-fried with soy sauce and seasonings. Wrapped tightly in spring roll pastry sheets, sealed with cornstarch slurry. Deep-fried in vegetable oil at 180°C for 3-4 minutes until golden brown and crispy. Served with sweet chili sauce.',
      recommended_for: 'Snack', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Spring Roll Pastry Sheets', quantity: '4 pieces', unit: 'pieces' },
          { name: 'Cabbage', quantity: '1 cup', unit: 'cup' },
          { name: 'Carrot', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Glass Noodles', quantity: '50g', unit: 'grams' },
          { name: 'Spring Onions', quantity: '1/4 cup', unit: 'cup' },
          { name: 'Soy Sauce', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Sesame Oil', quantity: '1 tsp', unit: 'teaspoon' },
          { name: 'Black Pepper', quantity: '1/2 tsp', unit: 'teaspoon' },
          { name: 'Cornstarch Slurry', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Vegetable Oil', quantity: 'for frying', unit: 'as needed' }
        ]
      }
    },
    {
      name: 'Classic Bruschetta',
      description: 'Toasted artisan bread topped with fresh tomatoes, garlic, basil, and olive oil.',
      price: 250.00, 
      category: 'Starters',
      image_url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600',
      calories: 220, 
      cooking_method: 'Toasted - Artisan ciabatta bread sliced 1-inch thick diagonally, brushed generously with garlic-infused extra virgin olive oil. Toasted in a preheated oven at 200°C for 5 minutes until golden and crisp. Topped with fresh tomato-basil mixture just before serving to maintain bread crunch.',
      recommended_for: 'Lunch', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Ciabatta Bread', quantity: '4 slices', unit: 'slices' },
          { name: 'Roma Tomatoes', quantity: '4 medium', unit: 'pieces' },
          { name: 'Fresh Garlic', quantity: '3 cloves', unit: 'cloves' },
          { name: 'Fresh Basil', quantity: '8 leaves', unit: 'leaves' },
          { name: 'Extra Virgin Olive Oil', quantity: '3 tbsp', unit: 'tablespoon' },
          { name: 'Balsamic Glaze', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Sea Salt', quantity: '1/2 tsp', unit: 'teaspoon' },
          { name: 'Black Pepper', quantity: '1/4 tsp', unit: 'teaspoon' }
        ]
      }
    },
    {
      name: 'Chicken Malai Tikka',
      description: 'Boneless chicken chunks marinated in a rich creamy blend of cashew and cream.',
      price: 380.00, 
      category: 'Starters',
      image_url: 'https://images.unsplash.com/photo-1599487405908-410a8b1a4cb9?w=600',
      calories: 450, 
      cooking_method: 'Tandoor Grilled - Boneless chicken thighs marinated overnight in a rich paste of cashews, fresh cream, cheese, and mild spices. Skewered and grilled in a tandoor at 350°C for 10-12 minutes until juicy and charred. Finished with a butter brush and a sprinkle of chaat masala.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Chicken Thighs', quantity: '300g', unit: 'grams' },
          { name: 'Fresh Cream', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Cashew Paste', quantity: '1/4 cup', unit: 'cup' },
          { name: 'Processed Cheese', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Ginger-Garlic Paste', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Green Chili Paste', quantity: '1 tsp', unit: 'teaspoon' },
          { name: 'White Pepper Powder', quantity: '1/2 tsp', unit: 'teaspoon' },
          { name: 'Cardamom Powder', quantity: '1/4 tsp', unit: 'teaspoon' },
          { name: 'Lemon Juice', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Butter', quantity: '1 tbsp', unit: 'tablespoon' }
        ]
      }
    },
    {
      name: 'Lamb Seekh Kebab',
      description: 'Minced lamb mixed with aromatic spices, shaped on skewers and chargrilled.',
      price: 420.00, 
      category: 'Starters',
      image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600',
      calories: 520, 
      cooking_method: 'Chargrilled - Lean lamb mince mixed with finely chopped onions, ginger, garlic, green chilies, fresh coriander, and a blend of garam masala and roasted chickpea flour. Kneaded for 10 minutes until sticky. Shaped onto skewers and grilled over hot charcoal for 12 minutes, turning frequently, until charred outside and juicy inside.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Lamb Mince', quantity: '400g', unit: 'grams' },
          { name: 'Onion', quantity: '1 medium', unit: 'piece' },
          { name: 'Ginger', quantity: '1 inch', unit: 'piece' },
          { name: 'Garlic', quantity: '4 cloves', unit: 'cloves' },
          { name: 'Green Chilies', quantity: '2 pieces', unit: 'pieces' },
          { name: 'Fresh Coriander', quantity: '1/4 cup', unit: 'cup' },
          { name: 'Garam Masala', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Roasted Chickpea Flour', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Red Chili Powder', quantity: '1 tsp', unit: 'teaspoon' },
          { name: 'Cumin Powder', quantity: '1 tsp', unit: 'teaspoon' },
          { name: 'Salt', quantity: 'to taste', unit: 'as needed' }
        ]
      }
    },

    // ==================== MAIN COURSE ====================
    {
      name: 'Butter Chicken Masala',
      description: 'Tender chicken simmered in a velvety tomato-butter gravy with aromatic spices.',
      price: 490.00, 
      category: 'Main Course',
      image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600',
      calories: 650, 
      cooking_method: 'Slow Cooked - Chicken pieces marinated in yogurt and spices, then tandoor-grilled for smoky flavor. Gravy prepared by simmering fresh tomato puree with butter, cream, cashew paste, and aromatic spices for 45 minutes on low heat. Grilled chicken added to gravy and simmered for additional 15 minutes. Finished with a swirl of fresh cream and dried fenugreek leaves.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Chicken (bone-in)', quantity: '500g', unit: 'grams' },
          { name: 'Tomato Puree', quantity: '2 cups', unit: 'cup' },
          { name: 'Butter', quantity: '4 tbsp', unit: 'tablespoon' },
          { name: 'Fresh Cream', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Cashew Paste', quantity: '1/4 cup', unit: 'cup' },
          { name: 'Yogurt', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Ginger-Garlic Paste', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Kashmiri Red Chili Powder', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Garam Masala', quantity: '1 tsp', unit: 'teaspoon' },
          { name: 'Honey', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Dried Fenugreek Leaves', quantity: '1 tbsp', unit: 'tablespoon' }
        ]
      }
    },
    {
      name: 'Paneer Butter Masala',
      description: 'Rich and creamy curry made with paneer, spices, onions, tomatoes, and cashews.',
      price: 420.00, 
      category: 'Main Course',
      image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=600',
      calories: 550, 
      cooking_method: 'Simmered - Paneer cubes lightly pan-fried until golden. Gravy prepared by slow-cooking onion-tomato masala with ginger, garlic, and whole spices. Cashew paste and cream added for richness. Paneer simmered in the gravy for 10 minutes to absorb flavors. Finished with a dollop of butter and fresh cream.',
      recommended_for: 'Lunch & Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Paneer', quantity: '250g', unit: 'grams' },
          { name: 'Tomato Puree', quantity: '1.5 cups', unit: 'cup' },
          { name: 'Onion Paste', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Butter', quantity: '3 tbsp', unit: 'tablespoon' },
          { name: 'Fresh Cream', quantity: '1/3 cup', unit: 'cup' },
          { name: 'Cashew Paste', quantity: '3 tbsp', unit: 'tablespoon' },
          { name: 'Ginger-Garlic Paste', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Red Chili Powder', quantity: '1 tsp', unit: 'teaspoon' },
          { name: 'Cardamom Powder', quantity: '1/2 tsp', unit: 'teaspoon' },
          { name: 'Kasuri Methi', quantity: '1 tsp', unit: 'teaspoon' }
        ]
      }
    },
    {
      name: 'Wild Mushroom Risotto',
      description: 'Creamy Arborio rice with porcini mushrooms, truffle essence, and parmesan.',
      price: 550.00, 
      category: 'Main Course',
      image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db378?w=600',
      calories: 600, 
      cooking_method: 'Slow Cooked - Arborio rice slowly toasted in butter. Mushroom stock added ladle by ladle while constantly stirring for 18-20 minutes until rice is al dente and creamy. Mixed mushrooms sautéed separately and folded in. Finished with grated parmesan, truffle oil, and fresh parsley.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Arborio Rice', quantity: '200g', unit: 'grams' },
          { name: 'Porcini Mushrooms', quantity: '50g', unit: 'grams' },
          { name: 'Mixed Wild Mushrooms', quantity: '150g', unit: 'grams' },
          { name: 'Parmesan Cheese', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Shallots', quantity: '2 pieces', unit: 'pieces' },
          { name: 'White Wine', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Mushroom Stock', quantity: '4 cups', unit: 'cup' },
          { name: 'Butter', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Truffle Oil', quantity: '1 tsp', unit: 'teaspoon' },
          { name: 'Fresh Parsley', quantity: '2 tbsp', unit: 'tablespoon' }
        ]
      }
    },
    {
      name: 'Grilled Atlantic Salmon',
      description: 'Fresh salmon fillet grilled with lemon-herb butter, served with asparagus.',
      price: 850.00, 
      category: 'Main Course',
      image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=600',
      calories: 480, 
      cooking_method: 'Grilled - Salmon fillet skin scored to crisp evenly. Marinated with lemon, dill, garlic, and olive oil for 30 minutes. Grilled skin-side down on a hot cast-iron grill for 4 minutes, flipped and grilled for 3 more minutes until medium. Basted with lemon-herb butter. Served with grilled asparagus spears and crushed potatoes.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Atlantic Salmon Fillet', quantity: '200g', unit: 'grams' },
          { name: 'Lemon', quantity: '1 piece', unit: 'piece' },
          { name: 'Fresh Dill', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Garlic', quantity: '2 cloves', unit: 'cloves' },
          { name: 'Olive Oil', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Butter', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Asparagus', quantity: '6 spears', unit: 'spears' },
          { name: 'Baby Potatoes', quantity: '100g', unit: 'grams' },
          { name: 'Salt', quantity: 'to taste', unit: 'as needed' },
          { name: 'Black Pepper', quantity: 'to taste', unit: 'as needed' }
        ]
      }
    },
    {
      name: 'Hyderabadi Chicken Biryani',
      description: 'Fragrant basmati rice layered with marinated chicken, saffron, and whole spices.',
      price: 450.00, 
      category: 'Main Course',
      image_url: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600',
      calories: 700, 
      cooking_method: 'Dum Cooked - Chicken marinated in yogurt and spices for 6 hours. Basmati rice par-boiled with whole spices. Layers of rice and marinated chicken assembled in a heavy-bottomed pot. Sealed with dough and slow-cooked (dum) on low heat for 45 minutes. Finished with fried onions, saffron-infused milk, and fresh mint.',
      recommended_for: 'Lunch', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Basmati Rice', quantity: '2 cups', unit: 'cup' },
          { name: 'Chicken (bone-in)', quantity: '500g', unit: 'grams' },
          { name: 'Yogurt', quantity: '1 cup', unit: 'cup' },
          { name: 'Fried Onions', quantity: '1 cup', unit: 'cup' },
          { name: 'Saffron', quantity: '1/4 tsp', unit: 'teaspoon' },
          { name: 'Warm Milk', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Ginger-Garlic Paste', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Green Chilies', quantity: '4 pieces', unit: 'pieces' },
          { name: 'Fresh Mint', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Fresh Coriander', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Biryani Masala', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Ghee', quantity: '1/4 cup', unit: 'cup' }
        ]
      }
    },

    // ==================== PIZZA ====================
    {
      name: 'Margherita Neapolitan Pizza',
      description: 'Wood-fired crust topped with San Marzano tomatoes, fresh mozzarella, and basil.',
      price: 420.00, 
      category: 'Pizza',
      image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
      calories: 850, 
      cooking_method: 'Wood Fired - Hand-stretched dough proofed for 24 hours. Topped with crushed San Marzano tomatoes, fresh buffalo mozzarella, basil leaves, and a drizzle of extra virgin olive oil. Baked in a wood-fired oven at 450°C for 90 seconds until crust is charred and bubbly.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Pizza Dough', quantity: '250g', unit: 'grams' },
          { name: 'San Marzano Tomatoes', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Buffalo Mozzarella', quantity: '125g', unit: 'grams' },
          { name: 'Fresh Basil', quantity: '8 leaves', unit: 'leaves' },
          { name: 'Extra Virgin Olive Oil', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Sea Salt', quantity: '1/2 tsp', unit: 'teaspoon' }
        ]
      }
    },
    {
      name: 'Spicy Pepperoni Pizza',
      description: 'Loaded with Italian pepperoni, spicy jalapeños, and extra cheese.',
      price: 550.00, 
      category: 'Pizza',
      image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600',
      calories: 950, 
      cooking_method: 'Baked - Hand-tossed crust topped with homemade pizza sauce, shredded mozzarella, spicy pepperoni slices, fresh jalapeños, and red pepper flakes. Baked in a stone-bottom oven at 275°C for 12-14 minutes until cheese is bubbly and pepperoni edges are crispy.',
      recommended_for: 'Lunch', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Pizza Dough', quantity: '300g', unit: 'grams' },
          { name: 'Pizza Sauce', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Mozzarella Cheese', quantity: '200g', unit: 'grams' },
          { name: 'Pepperoni', quantity: '25 slices', unit: 'slices' },
          { name: 'Jalapeños', quantity: '1/4 cup', unit: 'cup' },
          { name: 'Red Pepper Flakes', quantity: '1/2 tsp', unit: 'teaspoon' },
          { name: 'Oregano', quantity: '1/2 tsp', unit: 'teaspoon' }
        ]
      }
    },

    // ==================== PASTA ====================
    {
      name: 'Penne Arrabbiata',
      description: 'Penne pasta tossed in a fiery, garlic-infused tomato sauce.',
      price: 360.00, 
      category: 'Pasta',
      image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600',
      calories: 500, 
      cooking_method: 'Pan Tossed - Penne pasta boiled in salted water until al dente. Sauce prepared by sautéing garlic and red chili flakes in olive oil, adding fresh tomato puree and simmering for 15 minutes. Tossed with pasta and fresh parsley. Served with grated parmesan.',
      recommended_for: 'Lunch', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Penne Pasta', quantity: '200g', unit: 'grams' },
          { name: 'Tomato Puree', quantity: '2 cups', unit: 'cup' },
          { name: 'Garlic', quantity: '6 cloves', unit: 'cloves' },
          { name: 'Red Chili Flakes', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Olive Oil', quantity: '1/4 cup', unit: 'cup' },
          { name: 'Fresh Parsley', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Parmesan Cheese', quantity: '1/4 cup', unit: 'cup' }
        ]
      }
    },
    {
      name: 'Fettuccine Alfredo',
      description: 'Rich, creamy parmesan and butter sauce blanketing fresh fettuccine ribbons.',
      price: 420.00, 
      category: 'Pasta',
      image_url: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600',
      calories: 750, 
      cooking_method: 'Sautéed - Fresh fettuccine cooked until al dente. Sauce made by melting butter, adding heavy cream and freshly grated parmesan, whisking until smooth. Pasta tossed in the sauce, finished with black pepper and more parmesan. Optional grilled chicken or sautéed mushrooms add-on.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Fresh Fettuccine', quantity: '250g', unit: 'grams' },
          { name: 'Heavy Cream', quantity: '1 cup', unit: 'cup' },
          { name: 'Parmesan Cheese', quantity: '1 cup', unit: 'cup' },
          { name: 'Butter', quantity: '4 tbsp', unit: 'tablespoon' },
          { name: 'Garlic', quantity: '2 cloves', unit: 'cloves' },
          { name: 'Black Pepper', quantity: '1/2 tsp', unit: 'teaspoon' },
          { name: 'Nutmeg', quantity: '1/4 tsp', unit: 'teaspoon' }
        ]
      }
    },

    // ==================== BURGERS ====================
    {
      name: 'The Royal Cheeseburger',
      description: 'Double beef patty, aged cheddar, caramelized onions, and house sauce.',
      price: 480.00, 
      category: 'Burger',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      calories: 850, 
      cooking_method: 'Griddled - Fresh beef patties (80/20 blend) seasoned simply with salt and pepper. Griddled at high heat for 2-3 minutes per side for medium-rare. American cheese melted on patties. Toasted brioche bun layered with house sauce, caramelized onions, lettuce, tomato, pickles, and the double patties.',
      recommended_for: 'Lunch', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Brioche Bun', quantity: '1 piece', unit: 'piece' },
          { name: 'Beef Patty (80/20)', quantity: '2 pieces (150g each)', unit: 'pieces' },
          { name: 'Aged Cheddar Cheese', quantity: '2 slices', unit: 'slices' },
          { name: 'Caramelized Onions', quantity: '1/4 cup', unit: 'cup' },
          { name: 'House Sauce', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Lettuce', quantity: '2 leaves', unit: 'leaves' },
          { name: 'Tomato', quantity: '2 slices', unit: 'slices' },
          { name: 'Pickles', quantity: '3 slices', unit: 'slices' }
        ]
      }
    },
    {
      name: 'Crispy Chicken Burger',
      description: 'Buttermilk fried chicken breast, spicy mayo, and crunchy lettuce.',
      price: 390.00, 
      category: 'Burger',
      image_url: 'https://images.unsplash.com/photo-1615719417316-d34cb0255a02?w=600',
      calories: 700, 
      cooking_method: 'Fried - Chicken breast brined in buttermilk and hot sauce for 8 hours. Dredged in seasoned flour mixture (flour, paprika, garlic powder, cayenne). Deep-fried at 175°C for 6-7 minutes until golden and internal temperature reaches 75°C. Served on a toasted potato bun with spicy mayo, lettuce, and pickles.',
      recommended_for: 'Snack', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Potato Bun', quantity: '1 piece', unit: 'piece' },
          { name: 'Chicken Breast', quantity: '180g', unit: 'grams' },
          { name: 'Buttermilk', quantity: '1 cup', unit: 'cup' },
          { name: 'Hot Sauce', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'All-Purpose Flour', quantity: '1 cup', unit: 'cup' },
          { name: 'Paprika', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Garlic Powder', quantity: '1 tsp', unit: 'teaspoon' },
          { name: 'Spicy Mayo', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Lettuce', quantity: '1 leaf', unit: 'leaf' }
        ]
      }
    },

    // ==================== DESSERTS ====================
    {
      name: 'Molten Chocolate Lava Cake',
      description: 'Warm chocolate cake with a flowing, gooey center. Served with ice cream.',
      price: 250.00, 
      category: 'Dessert',
      image_url: 'https://images.unsplash.com/photo-1624353365286-cb18d6168e3a?w=600',
      calories: 450, 
      cooking_method: 'Baked - High-quality dark chocolate and butter melted together. Eggs and sugar whipped to ribbon stage. Folded into chocolate mixture with minimal flour. Ramekins buttered and dusted with cocoa powder. Baked at 220°C for exactly 11 minutes until edges set but center remains liquid. Inverted and served immediately with vanilla ice cream.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Dark Chocolate (70%)', quantity: '150g', unit: 'grams' },
          { name: 'Unsalted Butter', quantity: '100g', unit: 'grams' },
          { name: 'Eggs', quantity: '3 pieces', unit: 'pieces' },
          { name: 'Sugar', quantity: '1/2 cup', unit: 'cup' },
          { name: 'All-Purpose Flour', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Vanilla Ice Cream', quantity: '1 scoop', unit: 'scoop' }
        ]
      }
    },
    {
      name: 'Classic Italian Tiramisu',
      description: 'Espresso-soaked ladyfingers layered with mascarpone cream and cocoa.',
      price: 320.00, 
      category: 'Dessert',
      image_url: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600',
      calories: 380, 
      cooking_method: 'Chilled - Egg yolks whipped with sugar until pale. Mascarpone folded in gently. Egg whites whipped separately and folded in for lightness. Ladyfingers quickly dipped in espresso mixed with rum. Layered in a dish: soaked ladyfingers followed by mascarpone cream. Repeated and chilled for 6 hours. Dusted with cocoa powder before serving.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Ladyfingers', quantity: '24 pieces', unit: 'pieces' },
          { name: 'Mascarpone Cheese', quantity: '500g', unit: 'grams' },
          { name: 'Eggs', quantity: '4 pieces', unit: 'pieces' },
          { name: 'Sugar', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Espresso Coffee', quantity: '1 cup', unit: 'cup' },
          { name: 'Dark Rum', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Cocoa Powder', quantity: '2 tbsp', unit: 'tablespoon' }
        ]
      }
    },
    {
      name: 'New York Cheesecake',
      description: 'Rich, dense, and smooth cheesecake with a buttery graham cracker crust.',
      price: 290.00, 
      category: 'Dessert',
      image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600',
      calories: 520, 
      cooking_method: 'Baked - Graham cracker crumbs mixed with melted butter and sugar, pressed into springform pan and pre-baked. Cream cheese, sugar, and vanilla beaten until smooth. Eggs added one at a time. Sour cream folded in. Batter poured over crust and baked in water bath at 160°C for 60 minutes. Oven door left slightly ajar to cool slowly for 1 hour, preventing cracks. Chilled overnight.',
      recommended_for: 'Snack', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Graham Crackers', quantity: '200g', unit: 'grams' },
          { name: 'Melted Butter', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Cream Cheese', quantity: '900g', unit: 'grams' },
          { name: 'Sugar', quantity: '1.5 cups', unit: 'cup' },
          { name: 'Eggs', quantity: '4 pieces', unit: 'pieces' },
          { name: 'Sour Cream', quantity: '1/2 cup', unit: 'cup' },
          { name: 'Vanilla Extract', quantity: '1 tbsp', unit: 'tablespoon' }
        ]
      }
    },
    {
      name: 'Gulab Jamun',
      description: 'Soft, spongy milk solids dumplings soaked in rose-scented sugar syrup.',
      price: 220.00, 
      category: 'Dessert',
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
      calories: 420, 
      cooking_method: 'Deep Fried - Milk powder dough mixed with ghee and baking powder, kneaded into smooth dough. Rolled into small balls without cracks. Deep-fried at 140°C for 8-10 minutes until golden brown. Soaked immediately in warm sugar syrup infused with cardamom, rose water, and saffron for at least 2 hours. Served warm or at room temperature.',
      recommended_for: 'Dinner', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Milk Powder', quantity: '1 cup', unit: 'cup' },
          { name: 'All-Purpose Flour', quantity: '1/4 cup', unit: 'cup' },
          { name: 'Ghee', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Baking Powder', quantity: '1/2 tsp', unit: 'teaspoon' },
          { name: 'Milk', quantity: '1/4 cup', unit: 'cup' },
          { name: 'Sugar', quantity: '2 cups', unit: 'cup' },
          { name: 'Water', quantity: '2 cups', unit: 'cup' },
          { name: 'Cardamom', quantity: '4 pods', unit: 'pods' },
          { name: 'Rose Water', quantity: '1 tsp', unit: 'teaspoon' },
          { name: 'Saffron', quantity: 'a few strands', unit: 'pinch' }
        ]
      }
    },

    // ==================== BEVERAGES ====================
    {
      name: 'Mango Lassi',
      description: 'Refreshing traditional yogurt drink blended with sweet Alphonso mangoes.',
      price: 180.00, 
      category: 'Beverage',
      image_url: 'https://images.unsplash.com/photo-1620067645145-21d743aeba4e?w=600',
      calories: 210, 
      cooking_method: 'Blended - Ripe Alphonso mango pulp blended with thick yogurt, sugar, and a pinch of cardamom. Blended until smooth and frothy. Served chilled in a tall glass, garnished with a sprinkle of cardamom powder and a mango slice.',
      recommended_for: 'Lunch', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Alphonso Mango Pulp', quantity: '1 cup', unit: 'cup' },
          { name: 'Greek Yogurt', quantity: '1 cup', unit: 'cup' },
          { name: 'Sugar', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Cardamom Powder', quantity: '1/4 tsp', unit: 'teaspoon' },
          { name: 'Ice Cubes', quantity: '1/2 cup', unit: 'cup' }
        ]
      }
    },
    {
      name: 'Iced Caramel Macchiato',
      description: 'Espresso poured over milk and ice, topped with a caramel drizzle.',
      price: 210.00, 
      category: 'Beverage',
      image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600',
      calories: 180, 
      cooking_method: 'Brewed - Fresh vanilla syrup mixed with cold milk over ice. Double shot of espresso brewed at 92°C and poured carefully over the back of a spoon to create layers. Topped with a generous crosshatch of caramel sauce. Served with a straw for mixing.',
      recommended_for: 'Breakfast', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Espresso Shot', quantity: '2 shots (60ml)', unit: 'shots' },
          { name: 'Cold Milk', quantity: '3/4 cup', unit: 'cup' },
          { name: 'Vanilla Syrup', quantity: '2 tbsp', unit: 'tablespoon' },
          { name: 'Caramel Sauce', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Ice Cubes', quantity: '1 cup', unit: 'cup' }
        ]
      }
    },
    {
      name: 'Fresh Lime Soda',
      description: 'Freshly squeezed lime juice with soda water, choice of sweet or salted.',
      price: 140.00, 
      category: 'Beverage',
      image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600',
      calories: 80, 
      cooking_method: 'Muddled - Fresh limes juiced and muddled with sugar or salt. Shaken with ice and topped with chilled soda water. Served immediately with lime wheel garnish.',
      recommended_for: 'Lunch', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Fresh Lime', quantity: '2 pieces', unit: 'pieces' },
          { name: 'Soda Water', quantity: '1 cup', unit: 'cup' },
          { name: 'Sugar/Salt', quantity: '1 tbsp', unit: 'tablespoon' },
          { name: 'Ice Cubes', quantity: '1 cup', unit: 'cup' },
          { name: 'Mint Leaves', quantity: '2 leaves', unit: 'leaves' }
        ]
      }
    },
    {
      name: 'Masala Chai',
      description: 'Traditional Indian spiced tea with milk, ginger, and aromatic spices.',
      price: 120.00, 
      category: 'Beverage',
      image_url: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600',
      calories: 120, 
      cooking_method: 'Simmered - Water boiled with fresh ginger, cardamom, cloves, cinnamon, and black peppercorns. Loose Assam tea leaves added and simmered for 2 minutes. Full-fat milk added and brought to a rolling boil. Strained and sweetened to taste. Served piping hot.',
      recommended_for: 'Breakfast', 
      is_available: true,
      ingredients: {
        create: [
          { name: 'Assam Tea Leaves', quantity: '2 tsp', unit: 'teaspoon' },
          { name: 'Full-Fat Milk', quantity: '1 cup', unit: 'cup' },
          { name: 'Water', quantity: '1 cup', unit: 'cup' },
          { name: 'Fresh Ginger', quantity: '1 inch', unit: 'piece' },
          { name: 'Green Cardamom', quantity: '2 pods', unit: 'pods' },
          { name: 'Cloves', quantity: '2 pieces', unit: 'pieces' },
          { name: 'Cinnamon Stick', quantity: '1 small', unit: 'piece' },
          { name: 'Sugar', quantity: 'to taste', unit: 'as needed' }
        ]
      }
    }
  ]
}