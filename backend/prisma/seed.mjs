import prisma from "../src/config/prisma.mjs";

const defaultInterests = [
  { name: "Technology" },
  { name: "Gaming" },
  { name: "Finance" },
  { name: "Health" },
  { name: "Sports" },
  { name: "Shopping" },
  { name: "Travel" }
];

async function main() {
  console.log("Seeding default interests into PostgreSQL...");
  for (const interest of defaultInterests) {
    const upserted = await prisma.interest.upsert({
      where: { name: interest.name },
      update: {},
      create: {
        name: interest.name
      }
    });
    console.log(`- Upserted interest: ${upserted.name}`);
  }
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
