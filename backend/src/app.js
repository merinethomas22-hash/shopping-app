const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const sequelize = require('./config/database');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', require('./routes/order.routes'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const User = require('./models/user.model');
const Product = require('./models/product.model');
const Review = require('./models/review.model');

// Define associations
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Sync Database
sequelize.sync({ alter: true }).then(async () => {
  console.log('Database synced');
  
  // Seed admin
  try {
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@babypro.com',
        password: 'adminpassword',
        role: 'admin'
      });
      console.log('Default admin seeded: admin@babypro.com / adminpassword');
    }
  } catch (err) {
    console.error('Failed to seed admin:', err);
  }

  // Seed default products
  try {
    const productCount = await Product.count();
    if (productCount === 0) {
      const dummyProducts = [
        { name: 'Organic Cotton Onesie', price: 1499.00, category: 'Clothes', description: 'Soft organic cotton onesie for baby comfort.', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&h=300&q=80', stock: 50 },
        { name: 'Educational Wooden Toy', price: 2499.00, category: 'Toys', description: 'Non-toxic, safe wooden stacking educational toy.', image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=400&h=300&q=80', stock: 30 },
        { name: 'Silicone Feeding Set', price: 1199.00, category: 'Feeding', description: 'Food grade silicone baby plates and bowls.', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=400&h=300&q=80', stock: 40 },
        { name: 'Premium Stroller', price: 18999.00, category: 'Strollers', description: 'All-terrain stroller with shock absorption.', image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=400&h=300&q=80', stock: 15 },
        { name: 'Soft Baby Blanket', price: 899.00, category: 'Bedding', description: 'Super soft muslin cotton baby swaddle blanket.', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&h=300&q=80', stock: 60 },
        { name: 'Diaper Bag Backpack', price: 3499.00, category: 'Accessories', description: 'Spacious diaper bag with insulated bottle holders.', image: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=400&h=300&q=80', stock: 25 },
        { name: 'Baby Bath Tub', price: 2199.00, category: 'Bath', description: 'Ergonomic baby folding bath tub with thermometer.', image: 'https://images.unsplash.com/photo-1508808789047-9759676051a0?auto=format&fit=crop&w=400&h=300&q=80', stock: 20 },
        { name: 'Digital Thermometer', price: 599.00, category: 'Health', description: 'Fast, accurate digital clinical thermometer for infant care.', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&h=300&q=80', stock: 100 },
        { name: 'Teething Ring Set', price: 399.00, category: 'Toys', description: 'Soothe baby sore gums with non-toxic teething rings.', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&h=300&q=80', stock: 80 },
        { name: 'Baby Monitor Camera', price: 8499.00, category: 'Safety', description: 'High definition remote audio-video camera stream with night vision.', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&h=300&q=80', stock: 12 }
      ];
      await Product.bulkCreate(dummyProducts);
      console.log('Default products seeded successfully!');
    }
  } catch (err) {
    console.error('Failed to seed products:', err);
  }
}).catch(err => {
  console.error('Failed to sync database:', err);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
