const KEYWORDS = {
  Produce: ['apple','banana','orange','lemon','lime','grape','berry','avocado','tomato','potato','sweet potato','onion','garlic','ginger','carrot','celery','broccoli','cauliflower','spinach','lettuce','kale','arugula','cucumber','zucchini','squash','pumpkin','corn','mushroom','pepper','bell pepper','jalapeño','jalapen','chili','basil','cilantro','parsley','thyme','rosemary','mint','dill','scallion','green onion','leek','asparagus','artichoke','eggplant','beet','radish','cabbage','bok choy','mango','pineapple','peach','plum','cherry','watermelon','melon','shallot','fennel','herb','sprout','coriander'],
  'Meat & Seafood': ['chicken','beef','pork','lamb','turkey','veal','duck','goat','bacon','ham','sausage','salami','pepperoni','prosciutto','salmon','shrimp','prawn','tuna','cod','tilapia','halibut','crab','lobster','clam','mussel','oyster','scallop','anchovy','sardine','mince','ground beef','ground turkey','steak','fillet','brisket','ribs','chorizo','venison','liver','wing','thigh','breast','drumstick'],
  'Dairy & Eggs': ['milk','butter','cream','cheese','egg','yogurt','sour cream','cream cheese','ricotta','mozzarella','parmesan','cheddar','gouda','brie','feta','cottage','buttermilk','ghee','half and half','whipping cream','double cream','skimmed'],
  Bakery: ['bread','roll','bun','bagel','tortilla','pita','naan','croissant','muffin','wrap','baguette','brioche','flatbread'],
  Frozen: ['frozen'],
  'Canned & Dry Goods': ['rice','pasta','noodle','spaghetti','linguine','penne','macaroni','flour','sugar','oat','quinoa','lentil','chickpea','kidney bean','black bean','navy bean','cannellini','canned','can of','tin of','breadcrumb','cornstarch','cornmeal','baking powder','baking soda','yeast','cocoa powder','chocolate chip','dried fruit','raisin','couscous','barley','bulgur','polenta'],
  'Oils, Sauces & Spices': ['oil','vinegar','soy sauce','fish sauce','worcestershire','oyster sauce','hot sauce','ketchup','mustard','mayo','mayonnaise','honey','maple syrup','jam','jelly','peanut butter','almond butter','tahini','salt','pepper','cumin','paprika','turmeric','cinnamon','nutmeg','oregano','garlic powder','onion powder','chili powder','curry','cayenne','bay leaf','vanilla','cardamom','clove','allspice','coriander powder','fenugreek','spice','seasoning','sauce','paste','dressing','marinade','sriracha','tabasco','stock cube','bouillon'],
  Beverages: ['water','juice','wine','beer','broth','stock','tea','coffee','soda','almond milk','oat milk','coconut water'],
};

export const SECTION_ORDER = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Frozen',
  'Canned & Dry Goods',
  'Oils, Sauces & Spices',
  'Beverages',
  'Other',
];

export function getStoreSection(name) {
  const n = (name ?? '').toLowerCase();
  for (const [section, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(kw => n.includes(kw))) return section;
  }
  return 'Other';
}
