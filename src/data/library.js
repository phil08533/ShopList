export const CATEGORIES = [
  'Dairy',
  'Meat & Seafood',
  'Produce',
  'Frozen',
  'Bakery',
  'Snacks',
  'Drinks',
  'Baking',
  'Pantry',
  'Canned Goods',
  'Condiments',
  'Cleaning Supplies',
  'Bathroom',
  'Laundry',
  'Pet Supplies',
  'Paper Products',
  'Other',
];

export const UNITS = [
  'item(s)', 'gallon(s)', 'liter(s)', 'oz', 'lb(s)', 'kg',
  'dozen', 'pack(s)', 'bag(s)', 'box(es)', 'can(s)', 'bottle(s)',
  'jar(s)', 'loaf/loaves', 'roll(s)', 'sheet(s)',
];

export const ITEM_LIBRARY = [
  // Dairy
  { name: 'Milk', category: 'Dairy', unit: 'gallon(s)', usageDays: 7, threshold: 1 },
  { name: 'Almond Milk', category: 'Dairy', unit: 'gallon(s)', usageDays: 10, threshold: 1 },
  { name: 'Oat Milk', category: 'Dairy', unit: 'gallon(s)', usageDays: 10, threshold: 1 },
  { name: 'Eggs', category: 'Dairy', unit: 'dozen', usageDays: 7, threshold: 1 },
  { name: 'Butter', category: 'Dairy', unit: 'lb(s)', usageDays: 14, threshold: 1 },
  { name: 'Cheese', category: 'Dairy', unit: 'pack(s)', usageDays: 14, threshold: 1 },
  { name: 'Shredded Cheese', category: 'Dairy', unit: 'bag(s)', usageDays: 14, threshold: 1 },
  { name: 'Cream Cheese', category: 'Dairy', unit: 'pack(s)', usageDays: 21, threshold: 1 },
  { name: 'Sour Cream', category: 'Dairy', unit: 'item(s)', usageDays: 21, threshold: 1 },
  { name: 'Yogurt', category: 'Dairy', unit: 'item(s)', usageDays: 7, threshold: 2 },
  { name: 'Heavy Cream', category: 'Dairy', unit: 'item(s)', usageDays: 14, threshold: 1 },
  { name: 'Cottage Cheese', category: 'Dairy', unit: 'item(s)', usageDays: 10, threshold: 1 },

  // Meat & Seafood
  { name: 'Chicken Breast', category: 'Meat & Seafood', unit: 'lb(s)', usageDays: 7, threshold: 1 },
  { name: 'Ground Beef', category: 'Meat & Seafood', unit: 'lb(s)', usageDays: 7, threshold: 1 },
  { name: 'Salmon', category: 'Meat & Seafood', unit: 'lb(s)', usageDays: 7, threshold: 1 },
  { name: 'Shrimp', category: 'Meat & Seafood', unit: 'lb(s)', usageDays: 14, threshold: 1 },
  { name: 'Turkey', category: 'Meat & Seafood', unit: 'lb(s)', usageDays: 7, threshold: 1 },
  { name: 'Bacon', category: 'Meat & Seafood', unit: 'pack(s)', usageDays: 14, threshold: 1 },
  { name: 'Sausage', category: 'Meat & Seafood', unit: 'pack(s)', usageDays: 10, threshold: 1 },
  { name: 'Tuna (canned)', category: 'Canned Goods', unit: 'can(s)', usageDays: 30, threshold: 2 },

  // Produce
  { name: 'Apples', category: 'Produce', unit: 'lb(s)', usageDays: 7, threshold: 1 },
  { name: 'Bananas', category: 'Produce', unit: 'item(s)', usageDays: 5, threshold: 3 },
  { name: 'Oranges', category: 'Produce', unit: 'lb(s)', usageDays: 7, threshold: 1 },
  { name: 'Strawberries', category: 'Produce', unit: 'item(s)', usageDays: 5, threshold: 1 },
  { name: 'Blueberries', category: 'Produce', unit: 'item(s)', usageDays: 5, threshold: 1 },
  { name: 'Grapes', category: 'Produce', unit: 'lb(s)', usageDays: 7, threshold: 1 },
  { name: 'Broccoli', category: 'Produce', unit: 'item(s)', usageDays: 7, threshold: 1 },
  { name: 'Spinach', category: 'Produce', unit: 'bag(s)', usageDays: 7, threshold: 1 },
  { name: 'Lettuce', category: 'Produce', unit: 'item(s)', usageDays: 7, threshold: 1 },
  { name: 'Carrots', category: 'Produce', unit: 'bag(s)', usageDays: 14, threshold: 1 },
  { name: 'Celery', category: 'Produce', unit: 'item(s)', usageDays: 14, threshold: 1 },
  { name: 'Tomatoes', category: 'Produce', unit: 'item(s)', usageDays: 7, threshold: 2 },
  { name: 'Bell Peppers', category: 'Produce', unit: 'item(s)', usageDays: 7, threshold: 2 },
  { name: 'Onions', category: 'Produce', unit: 'lb(s)', usageDays: 21, threshold: 1 },
  { name: 'Garlic', category: 'Produce', unit: 'item(s)', usageDays: 21, threshold: 1 },
  { name: 'Potatoes', category: 'Produce', unit: 'lb(s)', usageDays: 14, threshold: 1 },
  { name: 'Sweet Potatoes', category: 'Produce', unit: 'lb(s)', usageDays: 14, threshold: 1 },
  { name: 'Avocados', category: 'Produce', unit: 'item(s)', usageDays: 5, threshold: 1 },
  { name: 'Cucumbers', category: 'Produce', unit: 'item(s)', usageDays: 7, threshold: 1 },
  { name: 'Zucchini', category: 'Produce', unit: 'item(s)', usageDays: 7, threshold: 1 },
  { name: 'Mushrooms', category: 'Produce', unit: 'item(s)', usageDays: 7, threshold: 1 },
  { name: 'Lemon', category: 'Produce', unit: 'item(s)', usageDays: 14, threshold: 2 },
  { name: 'Lime', category: 'Produce', unit: 'item(s)', usageDays: 14, threshold: 2 },

  // Frozen
  { name: 'Frozen Peas', category: 'Frozen', unit: 'bag(s)', usageDays: 30, threshold: 1 },
  { name: 'Frozen Corn', category: 'Frozen', unit: 'bag(s)', usageDays: 30, threshold: 1 },
  { name: 'Frozen Chicken', category: 'Frozen', unit: 'bag(s)', usageDays: 30, threshold: 1 },
  { name: 'Frozen Pizza', category: 'Frozen', unit: 'item(s)', usageDays: 14, threshold: 1 },
  { name: 'Ice Cream', category: 'Frozen', unit: 'item(s)', usageDays: 21, threshold: 1 },
  { name: 'Frozen Waffles', category: 'Frozen', unit: 'box(es)', usageDays: 14, threshold: 1 },
  { name: 'Frozen Berries', category: 'Frozen', unit: 'bag(s)', usageDays: 30, threshold: 1 },

  // Bakery
  { name: 'Bread', category: 'Bakery', unit: 'loaf/loaves', usageDays: 7, threshold: 1 },
  { name: 'Bagels', category: 'Bakery', unit: 'pack(s)', usageDays: 7, threshold: 1 },
  { name: 'English Muffins', category: 'Bakery', unit: 'pack(s)', usageDays: 7, threshold: 1 },
  { name: 'Tortillas', category: 'Bakery', unit: 'pack(s)', usageDays: 14, threshold: 1 },
  { name: 'Pita Bread', category: 'Bakery', unit: 'pack(s)', usageDays: 7, threshold: 1 },
  { name: 'Hamburger Buns', category: 'Bakery', unit: 'pack(s)', usageDays: 7, threshold: 1 },

  // Pantry
  { name: 'Rice', category: 'Pantry', unit: 'lb(s)', usageDays: 30, threshold: 1 },
  { name: 'Pasta', category: 'Pantry', unit: 'lb(s)', usageDays: 30, threshold: 1 },
  { name: 'Oats', category: 'Pantry', unit: 'item(s)', usageDays: 21, threshold: 1 },
  { name: 'Cereal', category: 'Pantry', unit: 'box(es)', usageDays: 14, threshold: 1 },
  { name: 'Peanut Butter', category: 'Pantry', unit: 'jar(s)', usageDays: 30, threshold: 1 },
  { name: 'Jelly', category: 'Pantry', unit: 'jar(s)', usageDays: 30, threshold: 1 },
  { name: 'Honey', category: 'Pantry', unit: 'jar(s)', usageDays: 60, threshold: 1 },
  { name: 'Olive Oil', category: 'Pantry', unit: 'bottle(s)', usageDays: 30, threshold: 1 },
  { name: 'Vegetable Oil', category: 'Pantry', unit: 'bottle(s)', usageDays: 30, threshold: 1 },
  { name: 'Flour', category: 'Baking', unit: 'lb(s)', usageDays: 30, threshold: 1 },
  { name: 'Sugar', category: 'Baking', unit: 'lb(s)', usageDays: 30, threshold: 1 },
  { name: 'Brown Sugar', category: 'Baking', unit: 'lb(s)', usageDays: 30, threshold: 1 },
  { name: 'Baking Soda', category: 'Baking', unit: 'item(s)', usageDays: 90, threshold: 1 },
  { name: 'Baking Powder', category: 'Baking', unit: 'item(s)', usageDays: 90, threshold: 1 },
  { name: 'Vanilla Extract', category: 'Baking', unit: 'bottle(s)', usageDays: 90, threshold: 1 },
  { name: 'Salt', category: 'Pantry', unit: 'item(s)', usageDays: 90, threshold: 1 },
  { name: 'Black Pepper', category: 'Pantry', unit: 'item(s)', usageDays: 60, threshold: 1 },
  { name: 'Garlic Powder', category: 'Pantry', unit: 'item(s)', usageDays: 60, threshold: 1 },
  { name: 'Onion Powder', category: 'Pantry', unit: 'item(s)', usageDays: 60, threshold: 1 },
  { name: 'Cumin', category: 'Pantry', unit: 'item(s)', usageDays: 90, threshold: 1 },
  { name: 'Paprika', category: 'Pantry', unit: 'item(s)', usageDays: 90, threshold: 1 },
  { name: 'Chicken Broth', category: 'Pantry', unit: 'can(s)', usageDays: 30, threshold: 2 },
  { name: 'Soy Sauce', category: 'Condiments', unit: 'bottle(s)', usageDays: 60, threshold: 1 },

  // Canned Goods
  { name: 'Diced Tomatoes', category: 'Canned Goods', unit: 'can(s)', usageDays: 30, threshold: 2 },
  { name: 'Tomato Sauce', category: 'Canned Goods', unit: 'can(s)', usageDays: 30, threshold: 2 },
  { name: 'Black Beans', category: 'Canned Goods', unit: 'can(s)', usageDays: 30, threshold: 2 },
  { name: 'Kidney Beans', category: 'Canned Goods', unit: 'can(s)', usageDays: 30, threshold: 2 },
  { name: 'Chickpeas', category: 'Canned Goods', unit: 'can(s)', usageDays: 30, threshold: 2 },
  { name: 'Corn (canned)', category: 'Canned Goods', unit: 'can(s)', usageDays: 30, threshold: 2 },
  { name: 'Coconut Milk', category: 'Canned Goods', unit: 'can(s)', usageDays: 30, threshold: 1 },

  // Condiments
  { name: 'Ketchup', category: 'Condiments', unit: 'bottle(s)', usageDays: 30, threshold: 1 },
  { name: 'Mustard', category: 'Condiments', unit: 'bottle(s)', usageDays: 30, threshold: 1 },
  { name: 'Mayonnaise', category: 'Condiments', unit: 'jar(s)', usageDays: 30, threshold: 1 },
  { name: 'Hot Sauce', category: 'Condiments', unit: 'bottle(s)', usageDays: 30, threshold: 1 },
  { name: 'Ranch Dressing', category: 'Condiments', unit: 'bottle(s)', usageDays: 21, threshold: 1 },
  { name: 'Italian Dressing', category: 'Condiments', unit: 'bottle(s)', usageDays: 21, threshold: 1 },
  { name: 'Vinegar', category: 'Condiments', unit: 'bottle(s)', usageDays: 60, threshold: 1 },
  { name: 'Worcestershire Sauce', category: 'Condiments', unit: 'bottle(s)', usageDays: 60, threshold: 1 },

  // Snacks
  { name: 'Chips', category: 'Snacks', unit: 'bag(s)', usageDays: 7, threshold: 1 },
  { name: 'Crackers', category: 'Snacks', unit: 'box(es)', usageDays: 14, threshold: 1 },
  { name: 'Granola Bars', category: 'Snacks', unit: 'box(es)', usageDays: 14, threshold: 1 },
  { name: 'Popcorn', category: 'Snacks', unit: 'bag(s)', usageDays: 14, threshold: 1 },
  { name: 'Trail Mix', category: 'Snacks', unit: 'bag(s)', usageDays: 14, threshold: 1 },
  { name: 'Almonds', category: 'Snacks', unit: 'bag(s)', usageDays: 21, threshold: 1 },
  { name: 'Pretzels', category: 'Snacks', unit: 'bag(s)', usageDays: 14, threshold: 1 },
  { name: 'Cookies', category: 'Snacks', unit: 'pack(s)', usageDays: 14, threshold: 1 },

  // Drinks
  { name: 'Water (bottles)', category: 'Drinks', unit: 'pack(s)', usageDays: 7, threshold: 1 },
  { name: 'Orange Juice', category: 'Drinks', unit: 'gallon(s)', usageDays: 7, threshold: 1 },
  { name: 'Apple Juice', category: 'Drinks', unit: 'gallon(s)', usageDays: 14, threshold: 1 },
  { name: 'Coffee', category: 'Drinks', unit: 'bag(s)', usageDays: 14, threshold: 1 },
  { name: 'Tea Bags', category: 'Drinks', unit: 'box(es)', usageDays: 30, threshold: 1 },
  { name: 'Soda', category: 'Drinks', unit: 'pack(s)', usageDays: 7, threshold: 1 },
  { name: 'Sports Drinks', category: 'Drinks', unit: 'pack(s)', usageDays: 14, threshold: 1 },

  // Household
  { name: 'Dish Soap', category: 'Cleaning Supplies', unit: 'bottle(s)', usageDays: 30, threshold: 1 },
  { name: 'Laundry Detergent', category: 'Laundry', unit: 'item(s)', usageDays: 30, threshold: 1 },
  { name: 'Dishwasher Pods', category: 'Cleaning Supplies', unit: 'pack(s)', usageDays: 30, threshold: 1 },
  { name: 'All-Purpose Cleaner', category: 'Cleaning Supplies', unit: 'bottle(s)', usageDays: 30, threshold: 1 },
  { name: 'Paper Towels', category: 'Paper Products', unit: 'roll(s)', usageDays: 14, threshold: 2 },
  { name: 'Toilet Paper', category: 'Paper Products', unit: 'roll(s)', usageDays: 7, threshold: 4 },
  { name: 'Trash Bags', category: 'Cleaning Supplies', unit: 'roll(s)', usageDays: 30, threshold: 1 },
  { name: 'Sponges', category: 'Cleaning Supplies', unit: 'pack(s)', usageDays: 14, threshold: 1 },
  { name: 'Shampoo', category: 'Bathroom', unit: 'bottle(s)', usageDays: 30, threshold: 1 },
  { name: 'Conditioner', category: 'Bathroom', unit: 'bottle(s)', usageDays: 30, threshold: 1 },
  { name: 'Body Wash', category: 'Bathroom', unit: 'bottle(s)', usageDays: 30, threshold: 1 },
  { name: 'Toothpaste', category: 'Bathroom', unit: 'item(s)', usageDays: 30, threshold: 1 },
  { name: 'Deodorant', category: 'Bathroom', unit: 'item(s)', usageDays: 30, threshold: 1 },
  { name: 'Hand Soap', category: 'Bathroom', unit: 'bottle(s)', usageDays: 21, threshold: 1 },
];

export function searchLibrary(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return ITEM_LIBRARY.filter(item => item.name.toLowerCase().includes(q)).slice(0, 8);
}
