import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");
  console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);

  // Clean existing data in dependency order
  console.log("Cleaning existing data...");
  try { await prisma.vote.deleteMany(); console.log("  votes cleared"); } catch (e) { console.error("  votes clear failed:", e); }
  try { await prisma.notification.deleteMany(); console.log("  notifications cleared"); } catch (e) { console.error("  notifications clear failed:", e); }
  try { await prisma.submission.deleteMany(); console.log("  submissions cleared"); } catch (e) { console.error("  submissions clear failed:", e); }
  try { await prisma.mission.deleteMany(); console.log("  missions cleared"); } catch (e) { console.error("  missions clear failed:", e); }
  try { await prisma.transaction.deleteMany(); console.log("  transactions cleared"); } catch (e) { console.error("  transactions clear failed:", e); }
  try { await prisma.challenge.deleteMany(); console.log("  challenges cleared"); } catch (e) { console.error("  challenges clear failed:", e); }
  try { await prisma.creatorProfile.deleteMany(); console.log("  creatorProfiles cleared"); } catch (e) { console.error("  creatorProfiles clear failed:", e); }
  try { await prisma.brandProfile.deleteMany(); console.log("  brandProfiles cleared"); } catch (e) { console.error("  brandProfiles clear failed:", e); }
  try { await prisma.account.deleteMany(); console.log("  accounts cleared"); } catch (e) { console.error("  accounts clear failed:", e); }
  try { await prisma.session.deleteMany(); console.log("  sessions cleared"); } catch (e) { console.error("  sessions clear failed:", e); }
  try { await prisma.user.deleteMany(); console.log("  users cleared"); } catch (e) { console.error("  users clear failed:", e); }

  // Admin
  console.log("Creating admin...");
  let admin: Awaited<ReturnType<typeof prisma.user.create>>;
  try {
    admin = await prisma.user.create({
      data: {
        email: "admin@mafluencer.ma",
        name: "Admin Mafluencer",
        role: "ADMIN",
      },
    });
    console.log("  Created admin:", admin.email);
  } catch (e) {
    console.error("  FAILED creating admin:", e);
    throw e;
  }

  // Brand
  console.log("Creating brand...");
  let brandUser: Awaited<ReturnType<typeof prisma.user.findUniqueOrThrow>>;
  try {
    brandUser = await prisma.user.create({
      data: {
        email: "brand@mafluencer.ma",
        name: "Marjane Holdings",
        role: "BRAND",
        brandProfile: {
          create: {
            companyName: "Marjane Holdings",
            industry: "Retail",
            website: "marjane.ma",
            balance: 10000,
          },
        },
      },
    });
    console.log("  Created brand:", brandUser.email);
  } catch (e) {
    console.error("  FAILED creating brand:", e);
    throw e;
  }

  // Creator 1
  console.log("Creating creator 1...");
  try {
    const c = await prisma.user.create({
      data: {
        email: "creator1@mafluencer.ma",
        name: "Yassine Alami",
        role: "CREATOR",
        creatorProfile: {
          create: {
            bio: "Creator passionne base au Maroc.",
            city: "Casablanca",
            niches: ["Mode"],
            score: 250,
            level: "Rising",
            tiktokHandle: "@yassine_alami",
            instagramHandle: "@yassine.alami",
            followersCount: 15000,
            engagementRate: 4.5,
            pricePerPost: 1500,
            pricePerStory: 600,
            pricePerVideo: 3000,
            rating: 4.2,
          },
        },
      },
    });
    console.log("  Created creator 1:", c.email);
  } catch (e) {
    console.error("  FAILED creating creator 1:", e);
    throw e;
  }

  // Creator 2
  console.log("Creating creator 2...");
  try {
    const c = await prisma.user.create({
      data: {
        email: "creator2@mafluencer.ma",
        name: "Fatima Zahra Benali",
        role: "CREATOR",
        creatorProfile: {
          create: {
            bio: "Creator passionne base au Maroc.",
            city: "Rabat",
            niches: ["Food"],
            score: 300,
            level: "Rising",
            tiktokHandle: "@fatima_zahra_benali",
            instagramHandle: "@fatima.zahra.benali",
            followersCount: 22000,
            engagementRate: 5.1,
            pricePerPost: 1800,
            pricePerStory: 700,
            pricePerVideo: 3500,
            rating: 4.5,
          },
        },
      },
    });
    console.log("  Created creator 2:", c.email);
  } catch (e) {
    console.error("  FAILED creating creator 2:", e);
    throw e;
  }

  // Creator 3
  console.log("Creating creator 3...");
  try {
    const c = await prisma.user.create({
      data: {
        email: "creator3@mafluencer.ma",
        name: "Omar Tazi",
        role: "CREATOR",
        creatorProfile: {
          create: {
            bio: "Creator passionne base au Maroc.",
            city: "Marrakech",
            niches: ["Tech"],
            score: 180,
            level: "Rookie",
            tiktokHandle: "@omar_tazi",
            instagramHandle: "@omar.tazi",
            followersCount: 8000,
            engagementRate: 3.8,
            pricePerPost: 900,
            pricePerStory: 400,
            pricePerVideo: 2000,
            rating: 3.9,
          },
        },
      },
    });
    console.log("  Created creator 3:", c.email);
  } catch (e) {
    console.error("  FAILED creating creator 3:", e);
    throw e;
  }

  // Challenge 1
  console.log("Creating challenge 1...");
  const now = new Date();
  try {
    const ch = await prisma.challenge.create({
      data: {
        title: "Le Meilleur Outfit Ramadan 2025",
        description: "Montre ton meilleur look pour Ramadan. Creativite et authenticite recompensees.",
        category: "Mode",
        type: "FREE",
        status: "ACTIVE",
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        prizeAmount: 5000,
        rules: "Contenu original uniquement. Hashtag obligatoire. Minimum 30 secondes.",
        createdById: admin.id,
      },
    });
    console.log("  Created challenge 1:", ch.title);
  } catch (e) {
    console.error("  FAILED creating challenge 1:", e);
    throw e;
  }

  // Challenge 2
  console.log("Creating challenge 2...");
  try {
    const ch = await prisma.challenge.create({
      data: {
        title: "Street Food Maroc",
        description: "Presente ta recette ou ton spot street food prefere au Maroc.",
        category: "Food",
        type: "FREE",
        status: "ACTIVE",
        startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        prizeAmount: 3000,
        rules: "Tourne en exterieur. Montre la preparation. Bonne qualite audio.",
        createdById: admin.id,
      },
    });
    console.log("  Created challenge 2:", ch.title);
  } catch (e) {
    console.error("  FAILED creating challenge 2:", e);
    throw e;
  }

  console.log("Seed complete.");
}

main()
  .then(() => {
    console.log("Done. Disconnecting...");
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed with error:");
    console.error(e);
    if (e instanceof Error) {
      console.error("Message:", e.message);
      console.error("Stack:", e.stack);
    }
    await prisma.$disconnect();
    process.exit(1);
  });
