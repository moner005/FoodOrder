import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
const database = new URL(connectionString);
const password = process.env.FOODORDER_PREVIEW_PASSWORD;
if (database.hostname !== '127.0.0.1' || database.pathname !== '/foodorder_integrated') {
  throw new Error('Preview fixtures require the dedicated local foodorder_integrated database.');
}
if (!password || password.length < 12) {
  throw new Error('Set FOODORDER_PREVIEW_PASSWORD to at least 12 characters.');
}

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const pizza = photo('photo-1579751626657-72bc17010498');
const pasta = photo('photo-1473093226795-af9932fe5856');
const salad = photo('photo-1512621776951-a57141f2eefd');
const makeId = (number) => `91b58e1d-08f7-49f3-9201-${String(number).padStart(12, '0')}`;

const venues = [
  {
    id: 1, slug: 'salford-and-co', name: 'Salford & Co', cuisine: 'Seasonal neighborhood cooking',
    description: 'A neighborhood kitchen serving fresh, comforting meals made with care.',
    address: '18 Market Lane, Willow Quarter', image: photo('photo-1414235077428-338989a2e8c0'),
    deliveryFee: '2.50', minimumSubtotal: '12.00', deliveryAreas: ['Willow Quarter'],
    meals: [
      ['Margherita Pizza', 'Tomato, mozzarella and fresh basil on a hand-stretched base.', '12.50', pizza, true],
      ['Seasonal Green Bowl', 'Fresh garden leaves, tomatoes and lemon dressing.', '9.50', salad, true],
    ],
  },
  {
    id: 2, slug: 'al-forno', name: 'Al Forno', cuisine: 'Pizza & Italian',
    description: 'Hand-stretched dough and oven-baked plates for a relaxed dinner.',
    address: '42 Cedar Street, Willow Quarter', image: photo('photo-1513104890138-7c749659a591'),
    deliveryFee: '3.00', minimumSubtotal: '15.00', deliveryAreas: ['Willow Quarter'],
    meals: [
      ['Wood-fired Margherita', 'San Marzano tomatoes, mozzarella and basil.', '15.50', pizza, true],
      ['Roasted Mushroom Pizza', 'Roasted mushrooms, thyme and mozzarella.', '17.50', pizza, false],
    ],
  },
  {
    id: 3, slug: 'olive-and-ember', name: 'Olive & Ember', cuisine: 'Italian-inspired kitchen',
    description: 'Wood-fired favorites, generous bowls, and a little something sweet.',
    address: '7 Olive Lane, Old Market', image: photo('photo-1513104890138-7c749659a591'),
    deliveryFee: '2.50', minimumSubtotal: '12.00', deliveryAreas: ['Old Market'],
    meals: [['Basil Tagliatelle', 'Fresh ribbons of pasta with a bright basil sauce.', '14.00', pasta, true]],
  },
  {
    id: 4, slug: 'bella-vita', name: 'Bella Vita', cuisine: 'Italian comfort food',
    description: 'A welcoming table with familiar Italian comfort dishes.',
    address: '5 Garden Walk, Old Market', image: photo('photo-1517248135467-4c7edcad34c4'),
    deliveryFee: '2.50', minimumSubtotal: '12.00', deliveryAreas: ['Old Market'],
    meals: [['Garden Pesto Pasta', 'Pasta with fresh herbs and seasonal vegetables.', '13.50', pasta, true]],
  },
  {
    id: 5, slug: 'golden-fork', name: 'Golden Fork', cuisine: 'Modern local plates',
    description: 'A small neighborhood dining room currently taking a day off.',
    address: '26 Orchard Road, Willow Quarter', image: photo('photo-1559339352-11d035aa65de'),
    deliveryFee: '2.50', minimumSubtotal: '12.00', deliveryAreas: ['Willow Quarter'], isOpen: false,
    meals: [['Orchard Harvest Bowl', 'A seasonal mix of vegetables and fresh herbs.', '12.00', salad, true]],
  },
  {
    id: 6, slug: 'cedar-kitchen', name: 'Cedar Kitchen', cuisine: 'Local comfort food',
    description: 'A fictional restaurant waiting for platform approval.',
    address: '12 Cedar Lane, Willow Quarter',
    deliveryFee: '2.00', minimumSubtotal: '10.00', deliveryAreas: ['Willow Quarter'], status: 'PENDING',
    meals: [['Cedar Garden Bowl', 'Seasonal greens and grains.', '12.50', salad, true]],
  },
];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
try {
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.$transaction(async (tx) => {
    if (await tx.user.findUnique({ where: { id: makeId(101) }, select: { id: true } })) return;
    for (const account of [
      { id: 101, role: 'ADMIN', email: 'admin@example.test', name: 'Preview Admin' },
      { id: 102, role: 'RESTAURANT_OWNER', email: 'owner@example.test', name: 'Preview Owner' },
      { id: 103, role: 'CUSTOMER', email: 'customer@example.test', name: 'Preview Customer',
        address: '12 Sample Street', phone: '2025550104' },
    ]) {
      const { id, ...data } = account;
      await tx.user.create({
        data: { ...data, id: makeId(id), password: hashedPassword },
      });
    }

    for (const venue of venues) {
      const { id, meals, ...data } = venue;
      const restaurantId = makeId(id);
      await tx.restaurant.create({
        data: { status: 'ACTIVE', ...data, id: restaurantId },
      });
      const categoryId = makeId(id * 10 + 200);
      await tx.category.create({
        data: { id: categoryId, name: 'Main dishes', restaurantId },
      });
      for (const [index, [name, description, price, image, isAvailable]] of meals.entries()) {
        const mealId = makeId(id * 10 + 300 + index);
        await tx.meal.create({
          data: { id: mealId, name, description, price, image, isAvailable, restaurantId, categoryId },
        });
      }
    }
    await tx.restaurantMember.create({
      data: { id: makeId(401), userId: makeId(102), restaurantId: makeId(1), role: 'RESTAURANT_OWNER' },
    });
  });
  console.log('Local FoodOrder preview catalog and accounts are ready.');
} finally {
  await prisma.$disconnect();
}
