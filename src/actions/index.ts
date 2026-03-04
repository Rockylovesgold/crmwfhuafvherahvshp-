"use server";

import { desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  auditLogs,
  contacts,
  deals,
  type AuditLog,
  type Contact,
  type Deal,
  type DealStage,
} from "@/lib/db/schema";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  title: z.string().optional(),
  companyId: z.string().uuid().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

const dealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.number().positive("Value must be positive"),
  stage: z.enum(["Lead", "Qualified", "Proposal", "Won", "Lost"]).default("Lead"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  description: z.string().optional(),
  expectedCloseDate: z.string().optional(),
});

const updateDealStageSchema = z.object({
  dealId: z.string().uuid(),
  stage: z.enum(["Lead", "Qualified", "Proposal", "Won", "Lost"]),
});

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

async function createAuditLog(input: {
  action: string;
  entityType: string;
  entityId?: string | null;
  entityName?: string | null;
  details?: string | null;
}) {
  const db = getDb();
  if (!db) return;

  await db.insert(auditLogs).values({
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    entityName: input.entityName ?? null,
    details: input.details ?? null,
  });
}

function noDatabaseMessage() {
  return "No database configured. Set DATABASE_URL to enable shared CRM data.";
}

export async function getContacts(): Promise<Contact[]> {
  try {
    const db = getDb();
    if (!db) return [];
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  } catch {
    return [];
  }
}

export async function getDeals(): Promise<Deal[]> {
  try {
    const db = getDb();
    if (!db) return [];
    return await db.select().from(deals).orderBy(desc(deals.createdAt));
  } catch {
    return [];
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const db = getDb();
    if (!db) return [];
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  } catch {
    return [];
  }
}

export async function createContact(input: z.infer<typeof contactSchema>): Promise<ActionResult<Contact>> {
  try {
    const db = getDb();
    if (!db) return { success: false, error: noDatabaseMessage() };

    const parsed = contactSchema.parse(input);
    const [created] = await db
      .insert(contacts)
      .values({
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone ?? null,
        title: parsed.title ?? null,
        companyId: parsed.companyId ?? null,
        status: parsed.status,
      })
      .returning();

    await createAuditLog({
      action: "created",
      entityType: "contact",
      entityId: created.id,
      entityName: created.name,
      details: `Contact ${created.name} created`,
    });

    return { success: true, data: created };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to create contact. Check your database connection." };
  }
}

export async function updateContact(
  id: string,
  input: z.infer<typeof contactSchema>
): Promise<ActionResult<Contact>> {
  try {
    const db = getDb();
    if (!db) return { success: false, error: noDatabaseMessage() };

    const parsed = contactSchema.parse(input);
    const [updated] = await db
      .update(contacts)
      .set({
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone ?? null,
        title: parsed.title ?? null,
        companyId: parsed.companyId ?? null,
        status: parsed.status,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, id))
      .returning();

    if (!updated) return { success: false, error: "Contact not found" };

    await createAuditLog({
      action: "updated",
      entityType: "contact",
      entityId: updated.id,
      entityName: updated.name,
      details: `Contact ${updated.name} updated`,
    });

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update contact. Check your database connection." };
  }
}

export async function deleteContact(id: string): Promise<ActionResult<null>> {
  try {
    const db = getDb();
    if (!db) return { success: false, error: noDatabaseMessage() };

    const [deleted] = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    if (!deleted) return { success: false, error: "Contact not found" };

    await createAuditLog({
      action: "deleted",
      entityType: "contact",
      entityId: deleted.id,
      entityName: deleted.name,
      details: `Contact ${deleted.name} deleted`,
    });

    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to delete contact. Check your database connection." };
  }
}

export async function createDeal(input: z.infer<typeof dealSchema>): Promise<ActionResult<Deal>> {
  try {
    const db = getDb();
    if (!db) return { success: false, error: noDatabaseMessage() };

    const parsed = dealSchema.parse(input);
    const [created] = await db
      .insert(deals)
      .values({
        title: parsed.title,
        value: parsed.value,
        stage: parsed.stage,
        priority: parsed.priority,
        probability: parsed.stage === "Lead" ? 20 : parsed.stage === "Qualified" ? 50 : 75,
        contactId: parsed.contactId ?? null,
        companyId: parsed.companyId ?? null,
        description: parsed.description ?? null,
        expectedCloseDate: parsed.expectedCloseDate ? new Date(parsed.expectedCloseDate) : null,
      })
      .returning();

    await createAuditLog({
      action: "created",
      entityType: "deal",
      entityId: created.id,
      entityName: created.title,
      details: `Deal ${created.title} created`,
    });

    return { success: true, data: created };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to create deal. Check your database connection." };
  }
}

export async function updateDealStage(input: z.infer<typeof updateDealStageSchema>): Promise<ActionResult<Deal>> {
  try {
    const db = getDb();
    if (!db) return { success: false, error: noDatabaseMessage() };

    const parsed = updateDealStageSchema.parse(input);
    const probabilityMap: Record<DealStage, number> = {
      Lead: 20,
      Qualified: 50,
      Proposal: 75,
      Won: 100,
      Lost: 0,
    };

    const [updated] = await db
      .update(deals)
      .set({
        stage: parsed.stage,
        probability: probabilityMap[parsed.stage],
        updatedAt: new Date(),
      })
      .where(eq(deals.id, parsed.dealId))
      .returning();

    if (!updated) return { success: false, error: "Deal not found" };

    await createAuditLog({
      action: "moved",
      entityType: "deal",
      entityId: updated.id,
      entityName: updated.title,
      details: `Deal moved to ${updated.stage}`,
    });

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update deal stage. Check your database connection." };
  }
}

export async function deleteDeal(id: string): Promise<ActionResult<null>> {
  try {
    const db = getDb();
    if (!db) return { success: false, error: noDatabaseMessage() };

    const [deleted] = await db.delete(deals).where(eq(deals.id, id)).returning();
    if (!deleted) return { success: false, error: "Deal not found" };

    await createAuditLog({
      action: "deleted",
      entityType: "deal",
      entityId: deleted.id,
      entityName: deleted.title,
      details: `Deal ${deleted.title} deleted`,
    });

    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to delete deal. Check your database connection." };
  }
}

export async function searchAll(query: string) {
  try {
    const db = getDb();
    if (!db || !query.trim()) {
      return { contacts: [] as Contact[], deals: [] as Deal[] };
    }

    const q = `%${query.trim()}%`;
    const foundContacts = await db
      .select()
      .from(contacts)
      .where(or(ilike(contacts.name, q), ilike(contacts.email, q)))
      .orderBy(desc(contacts.createdAt))
      .limit(5);

    const foundDeals = await db
      .select()
      .from(deals)
      .where(or(ilike(deals.title, q), ilike(deals.description, q)))
      .orderBy(desc(deals.createdAt))
      .limit(5);

    return { contacts: foundContacts, deals: foundDeals };
  } catch {
    return { contacts: [] as Contact[], deals: [] as Deal[] };
  }
}
