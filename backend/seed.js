require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

// Categories must match the frontend filters exactly:
// Jewelry, Crochet, Ceramics, Candles, Home Essential
// Images are served from frontend/public
const products = [
  // ===== JEWELRY ===== //
  { name: 'Pearl Choker Necklace', description: 'Hand-strung freshwater pearls on silk thread with a gold-plated clasp.', price: 650, category: 'Jewelry', stock: 12, image: '/jewelry.jpeg' },
  { name: 'Baroque Pearl Necklace', description: 'Irregular baroque pearls, each one unique, finished with a lobster clasp.', price: 950, category: 'Jewelry', stock: 3, image: '/jewelry.jpeg' },
  { name: 'Layered Pearl Necklace', description: 'Two delicate strands of seed pearls designed to be worn together.', price: 780, category: 'Jewelry', stock: 8, image: '/jewelry.jpeg' },
  { name: 'Pearl Pendant Necklace', description: 'A single teardrop pearl on a fine gold-tone chain.', price: 450, category: 'Jewelry', stock: 15, image: '/jewelry.jpeg' },
  { name: 'Pearl Drop Earrings', description: 'Lightweight freshwater pearl drops on hypoallergenic hooks.', price: 280, category: 'Jewelry', stock: 20, image: '/jewelry.jpeg' },
  { name: 'Freshwater Pearl Bracelet', description: 'Stretch bracelet of creamy freshwater pearls, fits most wrists.', price: 350, category: 'Jewelry', stock: 10, image: '/jewelry.jpeg' },

  // ===== CROCHET ===== //
  { name: 'Crochet Tote Bag', description: 'Sturdy cotton tote crocheted by hand, roomy enough for daily essentials.', price: 550, category: 'Crochet', stock: 7, image: '/crochet.jpeg' },
  { name: 'Granny Square Cardigan', description: 'Colorful granny-square cardigan in soft acrylic yarn, one size.', price: 1200, category: 'Crochet', stock: 2, image: '/crochet.jpeg' },
  { name: 'Amigurumi Bunny Toy', description: 'Soft stuffed bunny crocheted in baby-safe cotton yarn.', price: 300, category: 'Crochet', stock: 14, image: '/crochet.jpeg' },
  { name: 'Crochet Bucket Hat', description: 'Breathable cotton bucket hat, perfect for summer days.', price: 350, category: 'Crochet', stock: 9, image: '/crochet.jpeg' },
  { name: 'Crochet Coaster Set', description: 'Set of six round coasters in neutral tones.', price: 200, category: 'Crochet', stock: 18, image: '/crochet.jpeg' },
  { name: 'Crochet Baby Blanket', description: 'Warm and gentle blanket crocheted in a classic shell stitch.', price: 900, category: 'Crochet', stock: 5, image: '/crochet.jpeg' },

  // ===== CERAMICS ===== //
  { name: 'Speckled Ceramic Mug', description: 'Wheel-thrown stoneware mug with a speckled cream glaze, 350 ml.', price: 280, category: 'Ceramics', stock: 16, image: '/ceramic.jpeg' },
  { name: 'Hand-Painted Floral Mug', description: 'Ceramic mug hand-painted with delicate floral details, 300 ml.', price: 320, category: 'Ceramics', stock: 11, image: '/ceramic.jpeg' },
  { name: 'Glazed Coffee Mug', description: 'Deep blue reactive glaze mug, microwave and dishwasher safe.', price: 250, category: 'Ceramics', stock: 20, image: '/ceramic.jpeg' },
  { name: 'Ceramic Couple Mugs Set', description: 'Matching pair of handmade mugs, a perfect gift.', price: 600, category: 'Ceramics', stock: 6, image: '/ceramic.jpeg' },
  { name: 'Ceramic Trinket Dish', description: 'Small glazed dish for rings and earrings.', price: 180, category: 'Ceramics', stock: 13, image: '/ceramic.jpeg' },
  { name: 'Handmade Ceramic Vase', description: 'Minimal bud vase with a matte finish.', price: 450, category: 'Ceramics', stock: 4, image: '/ceramic.jpeg' },

  // ===== CANDLES ===== //
  { name: 'Vanilla Soy Candle', description: 'Natural soy wax candle in a reusable glass jar, about 40 hours burn time.', price: 220, category: 'Candles', stock: 15, image: '/candles.jpeg' },
  { name: 'Lavender Scented Candle', description: 'Calming lavender candle poured by hand with a cotton wick.', price: 240, category: 'Candles', stock: 12, image: '/candles.jpeg' },
  { name: 'Beeswax Pillar Candle', description: 'Pure beeswax pillar candle with a warm honey scent.', price: 300, category: 'Candles', stock: 8, image: '/candles.jpeg' },

  // ===== HOME ESSENTIAL ===== //
  { name: 'Macrame Wall Hanging', description: 'Boho macrame wall hanging knotted from natural cotton rope.', price: 600, category: 'Home Essential', stock: 5, image: '/homeess.jpeg' },
  { name: 'Woven Storage Basket', description: 'Hand-woven basket for blankets, toys or plants.', price: 400, category: 'Home Essential', stock: 9, image: '/homeess.jpeg' },
  { name: 'Embroidered Cushion Cover', description: 'Cotton cushion cover with hand embroidery, 45 x 45 cm.', price: 350, category: 'Home Essential', stock: 10, image: '/homeess.jpeg' },
];

const seed = async () => {
  const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('ERROR: Set MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('MongoDB Connected');

  // Public signup always creates role "User", so the first admin has to come from here
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (admin) {
    admin.role = 'Admin';
    await admin.save();
    console.log(`Existing user ${ADMIN_EMAIL} set to Admin (password unchanged)`);
  } else {
    const salt = await bcrypt.genSalt(10);
    admin = await User.create({
      firstName: 'Craftora',
      lastName: 'Admin',
      email: ADMIN_EMAIL,
      password: await bcrypt.hash(ADMIN_PASSWORD, salt),
      role: 'Admin',
    });
    console.log(`Admin created: ${ADMIN_EMAIL}`);
  }

  // Only seed an empty collection so re-running never duplicates products
  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`Products skipped: collection already has ${existing}`);
  } else {
    await Product.insertMany(products.map((p) => ({
      ...p,
      title: p.name,
      images: [p.image],
      seller: admin._id,
    })));
    console.log(`Inserted ${products.length} products`);
  }

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
