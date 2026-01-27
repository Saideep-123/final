import type { Product } from "./CartContext";

export const CATEGORIES = [
  "All",
  "Traditional Sweets",
  "Dry Fruit Sweets",
  "Snacks",
  "Pickles",
  "Gift Boxes",
];

const IMG_SWEET_1 =
  "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1200";
const IMG_SWEET_2 =
  "https://images.pexels.com/photos/6419716/pexels-photo-6419716.jpeg?auto=compress&cs=tinysrgb&w=1200";
const IMG_SWEET_3 =
  "https://images.pexels.com/photos/7474376/pexels-photo-7474376.jpeg?auto=compress&cs=tinysrgb&w=1200";
const IMG_SNACK_1 =
  "https://images.pexels.com/photos/4397888/pexels-photo-4397888.jpeg?auto=compress&cs=tinysrgb&w=1200";
const IMG_PICKLE_1 =
  "https://images.pexels.com/photos/4198024/pexels-photo-4198024.jpeg?auto=compress&cs=tinysrgb&w=1200";
const IMG_GIFT_1 =
  "https://images.pexels.com/photos/5638331/pexels-photo-5638331.jpeg?auto=compress&cs=tinysrgb&w=1200";

export const PRODUCTS: Product[] = [
  // ---- Traditional Sweets (1-18)
  { id: "p1", name: "Pootharekulu", price: 399, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_1 },
  { id: "p2", name: "Kaja Sweet", price: 299, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_2 },
  { id: "p3", name: "Gavvalu", price: 249, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_3 },
  { id: "p4", name: "Bellam Pootharekulu", price: 429, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_1 },
  { id: "p5", name: "Nuvvula Laddu", price: 219, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_2 },
  { id: "p6", name: "Sunnundalu", price: 279, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_3 },
  { id: "p7", name: "Boondi Laddu", price: 239, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_2 },
  { id: "p8", name: "Putharekulu (Dryfruit)", price: 499, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_1 },
  { id: "p9", name: "Ariselu", price: 329, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_3 },
  { id: "p10", name: "Bobbatlu / Puran Poli", price: 349, weight: "4 pcs", category: "Traditional Sweets", image: IMG_SWEET_2 },
  { id: "p11", name: "Mysore Pak", price: 299, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_1 },
  { id: "p12", name: "Milk Mysore Pak", price: 329, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_1 },
  { id: "p13", name: "Badusha", price: 259, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_2 },
  { id: "p14", name: "Gulab Jamun", price: 299, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_3 },
  { id: "p15", name: "Jangri", price: 279, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_2 },
  { id: "p16", name: "Rava Laddu", price: 199, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_1 },
  { id: "p17", name: "Kobbari (Coconut) Laddu", price: 209, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_3 },
  { id: "p18", name: "Malpuri", price: 289, weight: "250g", category: "Traditional Sweets", image: IMG_SWEET_2 },

  // ---- Dry Fruit Sweets (19-28)
  { id: "p19", name: "Dry Fruit Laddu", price: 499, weight: "250g", category: "Dry Fruit Sweets", image: IMG_SWEET_1 },
  { id: "p20", name: "Kaju Katli", price: 649, weight: "250g", category: "Dry Fruit Sweets", image: IMG_SWEET_2 },
  { id: "p21", name: "Badam Barfi", price: 699, weight: "250g", category: "Dry Fruit Sweets", image: IMG_SWEET_3 },
  { id: "p22", name: "Pista Roll", price: 749, weight: "250g", category: "Dry Fruit Sweets", image: IMG_SWEET_2 },
  { id: "p23", name: "Anjeer Barfi", price: 799, weight: "250g", category: "Dry Fruit Sweets", image: IMG_SWEET_1 },
  { id: "p24", name: "Dates & Nuts Laddu", price: 549, weight: "250g", category: "Dry Fruit Sweets", image: IMG_SWEET_3 },
  { id: "p25", name: "Kaju Pista Barfi", price: 799, weight: "250g", category: "Dry Fruit Sweets", image: IMG_SWEET_2 },
  { id: "p26", name: "Badam Halwa", price: 699, weight: "250g", category: "Dry Fruit Sweets", image: IMG_SWEET_1 },
  { id: "p27", name: "Kaju Pakkam", price: 699, weight: "250g", category: "Dry Fruit Sweets", image: IMG_SWEET_3 },
  { id: "p28", name: "Dry Fruit Pootharekulu", price: 599, weight: "250g", category: "Dry Fruit Sweets", image: IMG_SWEET_1 },

  // ---- Snacks (29-42)
  { id: "p29", name: "Chekkalu", price: 199, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p30", name: "Murukulu", price: 189, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p31", name: "Kara Boondi", price: 179, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p32", name: "Mixture", price: 179, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p33", name: "Nippat", price: 169, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p34", name: "Chakodi", price: 189, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p35", name: "Palli (Peanut) Chikki", price: 159, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p36", name: "Sesame Chikki", price: 169, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p37", name: "Banana Chips", price: 199, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p38", name: "Masala Cashew", price: 399, weight: "200g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p39", name: "Spicy Murukku", price: 199, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p40", name: "Corn Mixture", price: 199, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p41", name: "Ribbon Pakoda", price: 199, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },
  { id: "p42", name: "Thattai", price: 199, weight: "250g", category: "Snacks", image: IMG_SNACK_1 },

  // ---- Pickles (43-47)
  { id: "p43", name: "Avakaya Pickle", price: 249, weight: "250g", category: "Pickles", image: IMG_PICKLE_1 },
  { id: "p44", name: "Gongura Pickle", price: 269, weight: "250g", category: "Pickles", image: IMG_PICKLE_1 },
  { id: "p45", name: "Tomato Pickle", price: 229, weight: "250g", category: "Pickles", image: IMG_PICKLE_1 },
  { id: "p46", name: "Lemon Pickle", price: 229, weight: "250g", category: "Pickles", image: IMG_PICKLE_1 },
  { id: "p47", name: "Mixed Veg Pickle", price: 249, weight: "250g", category: "Pickles", image: IMG_PICKLE_1 },

  // ---- Gift Boxes (48-50)
  { id: "p48", name: "Sweet Combo Box (Small)", price: 899, weight: "Assorted", category: "Gift Boxes", image: IMG_GIFT_1 },
  { id: "p49", name: "Sweet Combo Box (Medium)", price: 1299, weight: "Assorted", category: "Gift Boxes", image: IMG_GIFT_1 },
  { id: "p50", name: "Festive Gift Hamper", price: 1799, weight: "Assorted", category: "Gift Boxes", image: IMG_GIFT_1 },
];
