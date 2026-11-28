import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
const database = connectionString && new URL(connectionString);
if (database?.protocol !== 'postgresql:' || database.hostname !== '127.0.0.1' || database.pathname !== '/foodorder_integrated') {
  throw new Error('The Lattakia catalog seed requires the dedicated local foodorder_integrated database.');
}

const restaurants = [
  {
    slug: 'lattakia-sensation',
    name: 'Sensation · سينسيشن',
    cuisine: 'Syrian & Levantine',
    address: 'Mashroua Yassin, Lattakia, Syria',
  },
  {
    slug: 'lattakia-napoli',
    name: 'Napoli · نابولي',
    cuisine: 'Pizza & Italian',
    address: 'Al Quds Street, Lattakia, Syria',
  },
  {
    slug: 'lattakia-lahma-wa-fahma',
    name: 'Lahma wa Fahma · لحمة وفحمة',
    address: 'Port Said Street, Lattakia, Syria',
  },
  {
    slug: 'lattakia-gate',
    name: 'Lattakia Gate · بوابة اللاذقية',
    cuisine: 'Syrian & Levantine',
    address: 'Damsarkho Highway, Lattakia, Syria',
  },
  {
    slug: 'lattakia-samos',
    name: 'Samo’s · ساموز',
    cuisine: 'Grills',
    address: 'End of Al Ziraa Highway, Lattakia, Syria',
  },
  {
    slug: 'lattakia-al-sarai',
    name: 'Al Sarai · السراي',
    address: 'Al Qasr Road, Lattakia, Syria',
  },
];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
try {
  const { count } = await prisma.restaurant.createMany({
    data: restaurants.map((restaurant) => ({ ...restaurant, status: 'ACTIVE', isOpen: false })),
    skipDuplicates: true,
  });
  console.log(`Lattakia catalog: added ${count}, already present ${restaurants.length - count}.`);
} finally {
  await prisma.$disconnect();
}
