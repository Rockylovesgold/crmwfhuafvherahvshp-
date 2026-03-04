import type { Deal, DealStage } from "@/lib/db/schema";

interface LeadScore {
  score: number;
  label: string;
  color: string;
}

const stageWeights: Record<DealStage, number> = {
  Lead: 15,
  Qualified: 40,
  Proposal: 65,
  Won: 100,
  Lost: 0,
};

const priorityMultipliers: Record<string, number> = {
  Urgent: 1.3,
  High: 1.15,
  Medium: 1.0,
  Low: 0.85,
};

export function calculateLeadScore(deal: Deal): LeadScore {
  const base = stageWeights[deal.stage];
  const multiplier = priorityMultipliers[deal.priority] ?? 1;
  const valueBonus = Math.min(deal.value / 100000, 15);
  const recencyBonus = getRecencyBonus(deal.createdAt);

  const raw = base * multiplier + valueBonus + recencyBonus;
  const score = Math.min(Math.round(raw), 100);

  return {
    score,
    label: score >= 75 ? "Hot" : score >= 45 ? "Warm" : "Cold",
    color: score >= 75 ? "text-red-400" : score >= 45 ? "text-amber-400" : "text-blue-400",
  };
}

function getRecencyBonus(createdAt: Date): number {
  const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 7) return 10;
  if (daysSinceCreation < 30) return 5;
  return 0;
}
