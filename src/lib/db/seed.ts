import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { faker } from "@faker-js/faker";
import * as schema from "./schema";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("No DATABASE_URL set — skipping DB seed. Using mock data instead.");
    return;
  }

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  console.log("Seeding database...");

  const companyData = Array.from({ length: 10 }, () => ({
    name: faker.company.name(),
    industry: faker.helpers.arrayElement([
      "Technology", "Healthcare", "Finance", "Manufacturing", "Energy",
      "Retail", "Consulting", "Education", "Logistics", "Media",
    ]),
    website: faker.internet.url(),
    revenue: faker.number.float({ min: 1_000_000, max: 50_000_000 }),
    employeeCount: faker.number.int({ min: 50, max: 5000 }),
  }));

  const companies = await db.insert(schema.companies).values(companyData).returning();
  console.log(`Inserted ${companies.length} companies`);

  const contactData = Array.from({ length: 20 }, () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    title: faker.person.jobTitle(),
    companyId: faker.helpers.arrayElement(companies).id,
    status: faker.helpers.arrayElement(["active", "active", "active", "inactive"]),
  }));

  const contacts = await db.insert(schema.contacts).values(contactData).returning();
  console.log(`Inserted ${contacts.length} contacts`);

  const stages = ["Lead", "Qualified", "Proposal", "Won", "Lost"] as const;
  const priorities = ["Low", "Medium", "High", "Urgent"] as const;

  const dealData = Array.from({ length: 10 }, () => {
    const stage = faker.helpers.arrayElement(stages);
    return {
      title: `${faker.commerce.productName()} Deal`,
      value: faker.number.float({ min: 25000, max: 500000 }),
      stage,
      priority: faker.helpers.arrayElement(priorities),
      probability: stage === "Lead" ? faker.number.int({ min: 10, max: 30 })
        : stage === "Qualified" ? faker.number.int({ min: 30, max: 60 })
        : stage === "Proposal" ? faker.number.int({ min: 55, max: 80 })
        : stage === "Won" ? 100 : 0,
      contactId: faker.helpers.arrayElement(contacts).id,
      companyId: faker.helpers.arrayElement(companies).id,
      expectedCloseDate: faker.date.future(),
      description: faker.lorem.sentence(),
    };
  });

  const deals = await db.insert(schema.deals).values(dealData).returning();
  console.log(`Inserted ${deals.length} deals`);

  const logData = Array.from({ length: 15 }, () => ({
    action: faker.helpers.arrayElement(["created", "updated", "moved", "deleted"]),
    entityType: faker.helpers.arrayElement(["deal", "contact", "company"]),
    entityName: faker.company.name(),
    details: faker.lorem.sentence(),
  }));

  const logs = await db.insert(schema.auditLogs).values(logData).returning();
  console.log(`Inserted ${logs.length} audit logs`);

  console.log("Seeding complete!");
}

seed().catch(console.error);
