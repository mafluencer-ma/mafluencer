import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NICHES   = ["Mode", "Food", "Tech", "Sport", "Voyage", "Beauté", "Gaming", "Lifestyle"];
const CITIES   = ["Casablanca", "Rabat", "Marrakech", "Fes", "Tanger", "Agadir"];
const LEVELS   = ["Rookie", "Rising", "Star", "Elite", "Legend"] as const;
const CATEGORIES = ["Mode", "Food", "Tech", "Sport", "Lifestyle", "Humour"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("🌱 Seeding Mafluencer database...");

  // ── Clean existing data ───────────────────────────────────────────────────────
  await prisma.vote.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.brandProfile.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin ─────────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: "admin@mafluencer.ma",
      name:  "Admin Mafluencer",
      role:  "ADMIN",
      image: `https://api.dicebear.com/7.x/initials/svg?seed=Admin`,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ── Brands ────────────────────────────────────────────────────────────────────
  const brandData = [
    { name: "Marjane Holdings",   industry: "Retail",   website: "marjane.ma" },
    { name: "Inwi Telecom",       industry: "Telecom",  website: "inwi.ma" },
    { name: "Attijariwafa Bank",  industry: "Finance",  website: "attijariwafa.com" },
  ];

  const brands = await Promise.all(
    brandData.map(async (b, i) => {
      const user = await prisma.user.create({
        data: {
          email: `brand${i + 1}@mafluencer.ma`,
          name:  b.name,
          role:  "BRAND",
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(b.name)}`,
          brandProfile: {
            create: {
              companyName: b.name,
              industry:    b.industry,
              website:     b.website,
              balance:     randInt(5000, 50000),
            },
          },
        },
        include: { brandProfile: true },
      });
      return user;
    })
  );
  console.log(`✅ Brands: ${brands.map((b) => b.name).join(", ")}`);

  // ── Creators ──────────────────────────────────────────────────────────────────
  const creatorNames = [
    "Yassine Alami",  "Fatima Zahra Benali", "Omar Tazi",        "Nadia Chraibi",
    "Mehdi Idrissi",  "Salma Bennani",       "Karim Berrada",    "Rim Lahlou",
    "Amine El Fassi", "Kenza Mouline",
  ];

  const creators = await Promise.all(
    creatorNames.map(async (name, i) => {
      const score    = randInt(0, 950);
      const level    = score < 200 ? "Rookie" : score < 400 ? "Rising" : score < 600 ? "Star" : score < 800 ? "Elite" : "Legend";
      const niches   = [rand(NICHES), rand(NICHES)].filter((v, idx, a) => a.indexOf(v) === idx);

      const user = await prisma.user.create({
        data: {
          email: `creator${i + 1}@mafluencer.ma`,
          name,
          role:  "CREATOR",
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          creatorProfile: {
            create: {
              bio:             `Creator passionné de ${niches[0].toLowerCase()} basé à ${rand(CITIES)}.`,
              city:            rand(CITIES),
              niches,
              score,
              level,
              tiktokHandle:    `@${name.toLowerCase().replace(/\s+/g, "_")}`,
              instagramHandle: `@${name.toLowerCase().replace(/\s+/g, ".")}`,
              followersCount:  randInt(1000, 500000),
              engagementRate:  parseFloat((Math.random() * 10 + 1).toFixed(1)),
              pricePerPost:    randInt(500, 8000),
              pricePerStory:   randInt(200, 3000),
              pricePerVideo:   randInt(1000, 15000),
              rating:          parseFloat((Math.random() * 2 + 3).toFixed(1)),
            },
          },
        },
        include: { creatorProfile: true },
      });
      return user;
    })
  );
  console.log(`✅ Creators: ${creators.length} créés`);

  // ── Challenges ────────────────────────────────────────────────────────────────
  const now  = new Date();
  const challengeData = [
    {
      title:       "Le Meilleur Outfit Ramadan 2025",
      description: "Montre ton meilleur look pour Ramadan. Créativité et authenticité récompensées.",
      category:    "Mode",
      type:        "FREE" as const,
      status:      "ACTIVE" as const,
      startDate:   new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate:     new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      prizeAmount: 5000,
      rules:       "1. Contenu original uniquement\n2. Hashtag #MafluencerMode obligatoire\n3. Minimum 30 secondes\n4. Pas de filtre excessif",
    },
    {
      title:       "Street Food Maroc",
      description: "Présente ta recette ou ton spot street food préféré au Maroc.",
      category:    "Food",
      type:        "FREE" as const,
      status:      "ACTIVE" as const,
      startDate:   new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endDate:     new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
      prizeAmount: 3000,
      rules:       "1. Tourné en extérieur\n2. Montre la préparation ou la dégustation\n3. Hashtag #StreetFoodMaroc\n4. Bonne qualité audio",
    },
    {
      title:       "Défi Tech Maroc — Startup Review",
      description: "Revue d'une startup tech marocaine ou d'un gadget innovant.",
      category:    "Tech",
      type:        "SPONSORED" as const,
      status:      "VOTING" as const,
      startDate:   new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      endDate:     new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      prizeAmount: 8000,
      rules:       "1. Revue honnête\n2. Minimum 60 secondes\n3. Citer les sources\n4. Hashtag #TechMaroc2025",
    },
    {
      title:       "Fitness Challenge — 30 Jours",
      description: "Documente ta transformation ou ton entraînement sur 30 jours.",
      category:    "Sport",
      type:        "FREE" as const,
      status:      "COMPLETED" as const,
      startDate:   new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      endDate:     new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      prizeAmount: 4000,
      rules:       "1. Au moins 3 vidéos\n2. Montre la progression\n3. Hashtag #FitnessMaroc\n4. Conseils pratiques inclus",
    },
    {
      title:       "Voyage Découverte — Maroc Caché",
      description: "Explore un endroit méconnu du Maroc et fais-nous le découvrir.",
      category:    "Lifestyle",
      type:        "FREE" as const,
      status:      "DRAFT" as const,
      startDate:   new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate:     new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
      prizeAmount: 6000,
      rules:       "1. Lieu peu connu\n2. Raconte l'histoire du lieu\n3. Drone ou bonne caméra\n4. Hashtag #MarocCaché",
    },
  ];

  const challenges = await Promise.all(
    challengeData.map((c) =>
      prisma.challenge.create({
        data: {
          ...c,
          createdById: admin.id,
          brandId: c.type === "SPONSORED" ? brands[0].brandProfile?.id : null,
        },
      })
    )
  );
  console.log(`✅ Challenges: ${challenges.length} créés`);

  // ── Submissions ───────────────────────────────────────────────────────────────
  const activeAndVoting = challenges.filter(
    (c) => c.status === "ACTIVE" || c.status === "VOTING" || c.status === "COMPLETED"
  );

  const submissionStatuses: Array<"APPROVED" | "PENDING" | "REJECTED"> = ["APPROVED", "APPROVED", "APPROVED", "PENDING", "REJECTED"];
  const submissions: Awaited<ReturnType<typeof prisma.submission.create>>[] = [];

  for (const challenge of activeAndVoting) {
    const participatingCreators = creators.slice(0, Math.min(creators.length, 6));
    for (const creator of participatingCreators) {
      const status = rand(submissionStatuses);
      const sub = await prisma.submission.create({
        data: {
          challengeId:  challenge.id,
          creatorId:    creator.id,
          videoUrl:     `https://example.com/videos/${challenge.id}/${creator.id}.mp4`,
          thumbnailUrl: `https://picsum.photos/seed/${creator.id + challenge.id}/400/300`,
          caption:      `Ma participation au défi "${challenge.title}" ! 🎬 #Mafluencer`,
          views:        randInt(100, 50000),
          likes:        randInt(10, 5000),
          shares:       randInt(0, 500),
          comments:     randInt(0, 200),
          score:        status === "APPROVED" ? randInt(50, 300) : 0,
          rank:         null,
          status,
        },
      });
      if (status === "APPROVED") submissions.push(sub);
    }
  }
  console.log(`✅ Submissions: ${submissions.length} approuvées créées`);

  // ── Votes ─────────────────────────────────────────────────────────────────────
  const votingChallenge = challenges.find((c) => c.status === "VOTING");
  if (votingChallenge) {
    const challengeSubs = submissions.filter((s) => s.challengeId === votingChallenge.id);
    let voteCount = 0;
    for (const sub of challengeSubs) {
      const voters = creators.filter((c) => c.id !== sub.creatorId).slice(0, 5);
      for (const voter of voters) {
        try {
          await prisma.vote.create({
            data: { submissionId: sub.id, voterId: voter.id, value: 1 },
          });
          voteCount++;
        } catch {
          // Ignore duplicate votes
        }
      }
    }
    console.log(`✅ Votes: ${voteCount} créés pour le défi en vote`);
  }

  // ── Missions ──────────────────────────────────────────────────────────────────
  const missionData = [
    { status: "PAID",      title: "Campagne Ramadan Inwi 2025",    budget: 5000 },
    { status: "DELIVERED", title: "Lancement App Marjane Mobile",  budget: 3500 },
    { status: "ACCEPTED",  title: "Revue Produit Attijariwafa",     budget: 2000 },
    { status: "PENDING",   title: "Story Série Été 2025 — Inwi",    budget: 4500 },
    { status: "PENDING",   title: "UGC Ouverture Marjane Outlet",   budget: 6000 },
  ] as const;

  await Promise.all(
    missionData.map(async (m, i) => {
      const brand   = brands[i % brands.length];
      const creator = creators[i % creators.length];
      return prisma.mission.create({
        data: {
          brandId:     brand.id,
          creatorId:   creator.id,
          title:       m.title,
          brief:       `Brief de la mission ${m.title}. Le creator doit produire un contenu authentique qui reflète les valeurs de notre marque. Minimum 60 secondes, bonne qualité audio et vidéo requise.`,
          budget:      m.budget,
          type:        rand(["POST", "STORY", "VIDEO", "UGC"] as const),
          status:      m.status,
          deliveryDate:new Date(now.getTime() + randInt(7, 30) * 24 * 60 * 60 * 1000),
          contentUrl:  m.status === "DELIVERED" || m.status === "PAID"
            ? `https://example.com/content/${i}.mp4`
            : null,
        },
      });
    })
  );
  console.log(`✅ Missions: ${missionData.length} créées`);

  // ── Notifications ──────────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId:  creators[0].id,
        type:    "CHALLENGE_SUBMISSION_APPROVED",
        title:   "Soumission approuvée ✓",
        message: `Ta soumission pour "${challenges[0].title}" a été approuvée.`,
        link:    "/dashboard/creator/challenges",
        read:    false,
      },
      {
        userId:  creators[0].id,
        type:    "MISSION_RECEIVED",
        title:   `Nouvelle mission de ${brands[0].name}`,
        message: `"${missionData[0].title}" — Accepte ou refuse dans les 48h.`,
        link:    "/dashboard/creator/missions",
        read:    false,
      },
      {
        userId:  brands[0].id,
        type:    "MISSION_ACCEPTED",
        title:   `Mission acceptée`,
        message: `"${missionData[0].title}" a été acceptée. Le creator travaille dessus.`,
        link:    "/dashboard/brand/missions",
        read:    true,
      },
    ],
  });
  console.log("✅ Notifications: créées");

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed terminé !");
  console.log(`   Admin:     admin@mafluencer.ma`);
  console.log(`   Brands:    brand1@mafluencer.ma … brand3@mafluencer.ma`);
  console.log(`   Creators:  creator1@mafluencer.ma … creator10@mafluencer.ma`);
  console.log(`   Password:  (pas de password — login via magic link ou Google)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
