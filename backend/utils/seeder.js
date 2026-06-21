require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { Coupon } = require('../models/misc');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Restaurant.deleteMany();
    await MenuItem.deleteMany();
    await Coupon.deleteMany();
    console.log('Cleared existing data');

    // ✅ Plain text passwords — model pre-save hook hashes them automatically
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eatloop.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });

    const owner1 = await User.create({
      name: 'Raj Kumar',
      email: 'raj@eatloop.com',
      password: 'password123',
      role: 'restaurant_owner',
      phone: '9876543210',
      isVerified: true
    });

    const owner2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@eatloop.com',
      password: 'password123',
      role: 'restaurant_owner',
      phone: '9876543211',
      isVerified: true
    });

    const customer = await User.create({
      name: 'Aman Singh',
      email: 'aman@eatloop.com',
      password: 'password123',
      role: 'customer',
      phone: '9876543212',
      isVerified: true
    });

    console.log('Users created');

    // Restaurants
    const restaurant1 = await Restaurant.create({
      owner: owner1._id,
      name: 'Spice Garden',
      description: 'Authentic Indian cuisine with rich flavors',
      email: 'spicegarden@mail.com',
      logo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200',
coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
      phone: '9876540001',
      cuisine: ['Indian', 'North Indian', 'Biryani'],
      categories: ['Starters', 'Main Course', 'Biryani', 'Desserts', 'Beverages'],
      address: { street: '12 MG Road', city: 'Bhubaneswar', state: 'Odisha', pincode: '751001', coordinates: { lat: 20.2961, lng: 85.8245 } },
      rating: 4.3, totalReviews: 128,
      deliveryTime: { min: 25, max: 40 },
      deliveryFee: 30, minOrder: 199,
      status: 'approved', isOpen: true, isFeatured: true,
      preparationTime: 20, totalOrders: 520, totalRevenue: 78000,
      openingHours: {
        monday: { open: '10:00', close: '22:00', isClosed: false },
        tuesday: { open: '10:00', close: '22:00', isClosed: false },
        wednesday: { open: '10:00', close: '22:00', isClosed: false },
        thursday: { open: '10:00', close: '22:00', isClosed: false },
        friday: { open: '10:00', close: '23:00', isClosed: false },
        saturday: { open: '10:00', close: '23:00', isClosed: false },
        sunday: { open: '11:00', close: '22:00', isClosed: false }
      }
    });

    const restaurant2 = await Restaurant.create({
      owner: owner2._id,
      name: 'Pizza Palace',
      description: 'Wood-fired pizzas and Italian classics',
      email: 'pizzapalace@mail.com',
      phone: '9876540002',
      logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      cuisine: ['Italian', 'Pizza', 'Pasta'],
      categories: ['Pizza', 'Pasta', 'Garlic Bread', 'Desserts', 'Beverages'],
      address: { street: '45 Janpath', city: 'Bhubaneswar', state: 'Odisha', pincode: '751003', coordinates: { lat: 20.2970, lng: 85.8300 } },
      rating: 4.5, totalReviews: 210,
      deliveryTime: { min: 30, max: 50 },
      deliveryFee: 40, minOrder: 299,
      status: 'approved', isOpen: true, isFeatured: true,
      preparationTime: 25, totalOrders: 380, totalRevenue: 95000,
      openingHours: {
        monday: { open: '11:00', close: '23:00', isClosed: false },
        tuesday: { open: '11:00', close: '23:00', isClosed: false },
        wednesday: { open: '11:00', close: '23:00', isClosed: false },
        thursday: { open: '11:00', close: '23:00', isClosed: false },
        friday: { open: '11:00', close: '23:30', isClosed: false },
        saturday: { open: '11:00', close: '23:30', isClosed: false },
        sunday: { open: '12:00', close: '22:00', isClosed: false }
      }
    });

    const restaurant3 = await Restaurant.create({
      owner: owner1._id,
      name: 'Burger Barn',
      description: 'Juicy burgers and crispy fries',
      email: 'burgerbarn@mail.com',
      phone: '9876540003',
      cuisine: ['American', 'Burgers', 'Fast Food'],
      categories: ['Burgers', 'Fries', 'Wraps', 'Milkshakes', 'Combos'],
      address: { street: '8 Station Road', city: 'Cuttack', state: 'Odisha', pincode: '753001', coordinates: { lat: 20.4625, lng: 85.8830 } },
      rating: 4.1, totalReviews: 95,
      deliveryTime: { min: 20, max: 35 },
      deliveryFee: 25, minOrder: 149,
      status: 'approved', isOpen: true, isFeatured: false,
      preparationTime: 15, totalOrders: 290, totalRevenue: 42000,
      openingHours: {
        monday: { open: '10:00', close: '22:00', isClosed: false },
        tuesday: { open: '10:00', close: '22:00', isClosed: false },
        wednesday: { open: '10:00', close: '22:00', isClosed: false },
        thursday: { open: '10:00', close: '22:00', isClosed: false },
        friday: { open: '10:00', close: '23:00', isClosed: false },
        saturday: { open: '10:00', close: '23:00', isClosed: false },
        sunday: { open: '11:00', close: '21:00', isClosed: false }
      }
    });

    const restaurant4 = await Restaurant.create({
      owner: owner2._id,
      name: 'The Biryani House',
      description: 'Authentic Hyderabadi dum biryani since 1995',
      email: 'biryanihouse@mail.com',
      phone: '9876540004',
      cuisine: ['Biryani', 'Mughlai', 'North Indian'],
      categories: ['Biryani', 'Kebabs', 'Curries', 'Desserts', 'Beverages'],
      address: { street: '22 Gandhi Nagar', city: 'Bhubaneswar', state: 'Odisha', pincode: '751002', coordinates: { lat: 20.2980, lng: 85.8260 } },
      rating: 4.6, totalReviews: 312,
      deliveryTime: { min: 30, max: 50 },
      deliveryFee: 0, minOrder: 299,
      status: 'approved', isOpen: true, isFeatured: true,
      preparationTime: 35, totalOrders: 890, totalRevenue: 180000,
      openingHours: {
        monday: { open: '10:00', close: '23:00', isClosed: false },
        tuesday: { open: '10:00', close: '23:00', isClosed: false },
        wednesday: { open: '10:00', close: '23:00', isClosed: false },
        thursday: { open: '10:00', close: '23:00', isClosed: false },
        friday: { open: '10:00', close: '23:30', isClosed: false },
        saturday: { open: '10:00', close: '23:30', isClosed: false },
        sunday: { open: '11:00', close: '22:00', isClosed: false }
      }
    });

    const restaurant5 = await Restaurant.create({
      owner: owner1._id,
      name: 'South Spice',
      description: 'Authentic South Indian — Dosa, Idli, Vada',
      email: 'southspice@mail.com',
      phone: '9876540005',
      cuisine: ['South Indian', 'Tamil', 'Kerala'],
      categories: ['Dosa', 'Idli & Vada', 'Rice Meals', 'Chutneys', 'Filter Coffee'],
      address: { street: '14 IRC Village', city: 'Bhubaneswar', state: 'Odisha', pincode: '751015', coordinates: { lat: 20.3010, lng: 85.8180 } },
      rating: 4.4, totalReviews: 203,
      deliveryTime: { min: 20, max: 35 },
      deliveryFee: 15, minOrder: 149,
      status: 'approved', isOpen: true, isFeatured: true,
      preparationTime: 15, totalOrders: 560, totalRevenue: 72000,
      openingHours: {
        monday: { open: '07:00', close: '22:00', isClosed: false },
        tuesday: { open: '07:00', close: '22:00', isClosed: false },
        wednesday: { open: '07:00', close: '22:00', isClosed: false },
        thursday: { open: '07:00', close: '22:00', isClosed: false },
        friday: { open: '07:00', close: '22:30', isClosed: false },
        saturday: { open: '07:00', close: '22:30', isClosed: false },
        sunday: { open: '08:00', close: '21:00', isClosed: false }
      }
    });

    const restaurant6 = await Restaurant.create({
      owner: owner2._id,
      name: 'Cake & Bake',
      description: 'Fresh bakery, cakes, pastries and coffee',
      email: 'cakebake@mail.com',
      phone: '9876540006',
      cuisine: ['Bakery', 'Desserts', 'Coffee', 'Cafe'],
      categories: ['Cakes', 'Pastries', 'Cookies', 'Coffee', 'Sandwiches'],
      address: { street: '3 Patia Square', city: 'Bhubaneswar', state: 'Odisha', pincode: '751024', coordinates: { lat: 20.3500, lng: 85.8200 } },
      rating: 4.7, totalReviews: 445,
      deliveryTime: { min: 20, max: 35 },
      deliveryFee: 25, minOrder: 199,
      status: 'approved', isOpen: true, isFeatured: true,
      preparationTime: 10, totalOrders: 1100, totalRevenue: 220000,
      openingHours: {
        monday: { open: '08:00', close: '21:00', isClosed: false },
        tuesday: { open: '08:00', close: '21:00', isClosed: false },
        wednesday: { open: '08:00', close: '21:00', isClosed: false },
        thursday: { open: '08:00', close: '21:00', isClosed: false },
        friday: { open: '08:00', close: '22:00', isClosed: false },
        saturday: { open: '08:00', close: '22:00', isClosed: false },
        sunday: { open: '09:00', close: '20:00', isClosed: false }
      }
    });

    console.log('Restaurants created');

    // Menu Items
    await MenuItem.create([
      { restaurant: restaurant1._id, name: 'Chicken Biryani', description: 'Fragrant basmati rice with tender chicken', price: 249, category: 'Biryani', isVeg: false, spiceLevel: 'medium', rating: 4.5, totalOrders: 180, nutrition: { calories: 520, protein: 32, carbs: 65, fat: 18, fiber: 3 }, tags: ['bestseller', 'spicy'] },
      { restaurant: restaurant1._id, name: 'Paneer Butter Masala', description: 'Creamy tomato-based curry with soft paneer', price: 199, category: 'Main Course', isVeg: true, spiceLevel: 'mild', rating: 4.3, totalOrders: 145, nutrition: { calories: 380, protein: 18, carbs: 22, fat: 24, fiber: 4 }, tags: ['veg', 'popular'] },
      { restaurant: restaurant1._id, name: 'Dal Tadka', description: 'Yellow lentils tempered with cumin and garlic', price: 149, category: 'Main Course', isVeg: true, spiceLevel: 'mild', rating: 4.2, totalOrders: 120, nutrition: { calories: 290, protein: 14, carbs: 38, fat: 10, fiber: 8 }, tags: ['veg', 'healthy'] },
      { restaurant: restaurant1._id, name: 'Chicken Tikka', description: 'Tender chicken grilled in tandoor', price: 289, category: 'Starters', isVeg: false, spiceLevel: 'hot', rating: 4.6, totalOrders: 160, nutrition: { calories: 310, protein: 38, carbs: 8, fat: 14, fiber: 1 }, tags: ['bestseller'] },
      { restaurant: restaurant1._id, name: 'Gulab Jamun', description: 'Soft dumplings soaked in rose syrup', price: 99, category: 'Desserts', isVeg: true, spiceLevel: 'mild', rating: 4.4, totalOrders: 90, nutrition: { calories: 220, protein: 4, carbs: 42, fat: 6, fiber: 0 }, tags: ['sweet'] },
      { restaurant: restaurant1._id, name: 'Masala Chai', description: 'Traditional Indian spiced tea', price: 49, category: 'Beverages', isVeg: true, spiceLevel: 'mild', rating: 4.0, totalOrders: 200, nutrition: { calories: 80, protein: 2, carbs: 12, fat: 3, fiber: 0 }, tags: ['drink'] },

      { restaurant: restaurant2._id, name: 'Margherita Pizza', description: 'Classic pizza with mozzarella and basil', price: 299, category: 'Pizza', isVeg: true, spiceLevel: 'mild', rating: 4.5, totalOrders: 130, nutrition: { calories: 650, protein: 22, carbs: 80, fat: 24, fiber: 4 }, tags: ['classic', 'veg'] },
      { restaurant: restaurant2._id, name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce with grilled chicken', price: 399, category: 'Pizza', isVeg: false, spiceLevel: 'medium', rating: 4.6, totalOrders: 110, nutrition: { calories: 720, protein: 35, carbs: 78, fat: 28, fiber: 3 }, tags: ['bestseller'] },
      { restaurant: restaurant2._id, name: 'Pasta Arrabiata', description: 'Penne in spicy tomato sauce', price: 249, category: 'Pasta', isVeg: true, spiceLevel: 'hot', rating: 4.2, totalOrders: 80, nutrition: { calories: 420, protein: 14, carbs: 72, fat: 10, fiber: 5 }, tags: ['veg'] },
      { restaurant: restaurant2._id, name: 'Garlic Bread', description: 'Toasted bread with herb butter', price: 129, category: 'Garlic Bread', isVeg: true, spiceLevel: 'mild', rating: 4.4, totalOrders: 200, nutrition: { calories: 280, protein: 8, carbs: 36, fat: 12, fiber: 2 }, tags: ['side'] },
      { restaurant: restaurant2._id, name: 'Tiramisu', description: 'Italian coffee dessert', price: 199, category: 'Desserts', isVeg: true, spiceLevel: 'mild', rating: 4.7, totalOrders: 60, nutrition: { calories: 310, protein: 6, carbs: 34, fat: 16, fiber: 1 }, tags: ['dessert'] },

      { restaurant: restaurant3._id, name: 'Classic Beef Burger', description: 'Juicy beef patty with special sauce', price: 199, category: 'Burgers', isVeg: false, spiceLevel: 'mild', rating: 4.3, totalOrders: 95, nutrition: { calories: 580, protein: 28, carbs: 48, fat: 30, fiber: 3 }, tags: ['bestseller'] },
      { restaurant: restaurant3._id, name: 'Veggie Delight Burger', description: 'Crispy veggie patty with fresh toppings', price: 149, category: 'Burgers', isVeg: true, spiceLevel: 'mild', rating: 4.0, totalOrders: 60, nutrition: { calories: 420, protein: 14, carbs: 58, fat: 16, fiber: 5 }, tags: ['veg'] },
      { restaurant: restaurant3._id, name: 'Loaded Fries', description: 'Crispy fries with cheese and jalapenos', price: 129, category: 'Fries', isVeg: true, spiceLevel: 'medium', rating: 4.4, totalOrders: 150, nutrition: { calories: 380, protein: 8, carbs: 52, fat: 18, fiber: 4 }, tags: ['crispy'] },
      { restaurant: restaurant3._id, name: 'Oreo Milkshake', description: 'Thick milkshake with Oreo cookies', price: 159, category: 'Milkshakes', isVeg: true, spiceLevel: 'mild', rating: 4.6, totalOrders: 80, nutrition: { calories: 420, protein: 10, carbs: 68, fat: 14, fiber: 1 }, tags: ['cold'] },

      { restaurant: restaurant4._id, name: 'Hyderabadi Dum Biryani', description: 'Slow-cooked basmati rice with mutton', price: 349, category: 'Biryani', isVeg: false, spiceLevel: 'hot', rating: 4.8, totalOrders: 420, nutrition: { calories: 680, protein: 38, carbs: 72, fat: 24, fiber: 3 }, tags: ['bestseller'] },
      { restaurant: restaurant4._id, name: 'Veg Dum Biryani', description: 'Aromatic biryani with fresh vegetables', price: 249, category: 'Biryani', isVeg: true, spiceLevel: 'medium', rating: 4.5, totalOrders: 280, nutrition: { calories: 520, protein: 12, carbs: 85, fat: 16, fiber: 6 }, tags: ['veg'] },
      { restaurant: restaurant4._id, name: 'Seekh Kebab', description: 'Minced mutton kebabs on skewers', price: 299, category: 'Kebabs', isVeg: false, spiceLevel: 'hot', rating: 4.6, totalOrders: 190, nutrition: { calories: 340, protein: 32, carbs: 8, fat: 20, fiber: 1 }, tags: ['grilled'] },

      { restaurant: restaurant5._id, name: 'Masala Dosa', description: 'Crispy rice crepe with potato filling', price: 89, category: 'Dosa', isVeg: true, spiceLevel: 'mild', rating: 4.6, totalOrders: 380, nutrition: { calories: 320, protein: 8, carbs: 52, fat: 10, fiber: 4 }, tags: ['bestseller', 'veg'] },
      { restaurant: restaurant5._id, name: 'Idli Sambar', description: '3 soft steamed idlis with sambar', price: 69, category: 'Idli & Vada', isVeg: true, spiceLevel: 'mild', rating: 4.5, totalOrders: 290, nutrition: { calories: 240, protein: 10, carbs: 44, fat: 4, fiber: 5 }, tags: ['healthy', 'veg'] },
      { restaurant: restaurant5._id, name: 'Filter Coffee', description: 'Traditional South Indian filter coffee', price: 49, category: 'Filter Coffee', isVeg: true, spiceLevel: 'mild', rating: 4.7, totalOrders: 500, nutrition: { calories: 60, protein: 2, carbs: 8, fat: 3, fiber: 0 }, tags: ['drink', 'popular'] },

      { restaurant: restaurant6._id, name: 'Chocolate Truffle Cake', description: 'Rich dark chocolate with truffle ganache', price: 449, category: 'Cakes', isVeg: true, spiceLevel: 'mild', rating: 4.9, totalOrders: 520, nutrition: { calories: 480, protein: 6, carbs: 62, fat: 24, fiber: 2 }, tags: ['bestseller'] },
      { restaurant: restaurant6._id, name: 'Blueberry Cheesecake', description: 'Creamy cheesecake with blueberry compote', price: 349, category: 'Cakes', isVeg: true, spiceLevel: 'mild', rating: 4.7, totalOrders: 310, nutrition: { calories: 420, protein: 8, carbs: 48, fat: 22, fiber: 1 }, tags: ['popular'] },
      { restaurant: restaurant6._id, name: 'Cold Brew Coffee', description: 'Smooth slow-brewed cold coffee', price: 129, category: 'Coffee', isVeg: true, spiceLevel: 'mild', rating: 4.6, totalOrders: 380, nutrition: { calories: 80, protein: 1, carbs: 14, fat: 2, fiber: 0 }, tags: ['cold', 'popular'] },
    ]);

    console.log('Menu items created');

    // Coupons
    await Coupon.create([
      { code: 'WELCOME50', description: '50% off on first order', discountType: 'percentage', discountValue: 50, minOrderAmount: 199, maxDiscountAmount: 100, usageLimit: 1000, validFrom: new Date(), validTill: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), isActive: true, firstOrderOnly: true },
      { code: 'EATLOOP30', description: 'Flat ₹30 off on orders above ₹299', discountType: 'fixed', discountValue: 30, minOrderAmount: 299, usageLimit: 500, validFrom: new Date(), validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true },
      { code: 'HUNGRY100', description: 'Flat ₹100 off on orders above ₹599', discountType: 'fixed', discountValue: 100, minOrderAmount: 599, usageLimit: 200, validFrom: new Date(), validTill: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), isActive: true },
    ]);

    console.log('Coupons created');
    console.log('\n✅ Seeding complete!\n');
    console.log('Test Accounts:');
    console.log('Admin:     admin@eatloop.com / admin123');
    console.log('Owner:     raj@eatloop.com / password123');
    console.log('Owner 2:   priya@eatloop.com / password123');
    console.log('Customer:  aman@eatloop.com / password123');
    console.log('\nCoupon Codes: WELCOME50, EATLOOP30, HUNGRY100');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();