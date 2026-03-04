"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus, DollarSign, Calendar, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getDeals, getContacts, updateDealStage, createDeal } from "@/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateLeadScore } from "@/lib/ai-scoring";
import { toast } from "sonner";
import type { Deal, Contact, DealStage } from "@/lib/db/schema";

const stageConfig: { id: DealStage; label: string; color: string }[] = [
  { id: "Lead", label: "Lead", color: "bg-slate-500" },
  { id: "Qualified", label: "Qualified", color: "bg-blue-500" },
  { id: "Proposal", label: "Proposal", color: "bg-amber-500" },
  { id: "Won", label: "Won", color: "bg-emerald-500" },
  { id: "Lost", label: "Lost", color: "bg-red-500" },
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [d, c] = await Promise.all([getDeals(), getContacts()]);
    setDeals(d);
    setContacts(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 7000);
    return () => clearInterval(interval);
  }, [loadData]);

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const dealId = result.draggableId;
    const newStage = result.destination.droppableId as DealStage;

    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );

    const res = await updateDealStage({ dealId, stage: newStage });
    if (res.success) {
      toast.success(`Deal moved to ${newStage}`);
    } else {
      toast.error(res.error);
      loadData();
    }
  }

  async function handleCreateDeal(formData: FormData) {
    const result = await createDeal({
      title: formData.get("title") as string,
      value: Number(formData.get("value")),
      stage: "Lead",
      priority: "Medium",
    });
    if (result.success) {
      toast.success("Deal created");
      setDialogOpen(false);
      loadData();
    } else {
      toast.error(result.error);
    }
  }

  function getContactName(contactId: string | null): string {
    if (!contactId) return "Unassigned";
    return contacts.find((c) => c.id === contactId)?.name ?? "Unknown";
  }

  if (loading) return <PipelineSkeleton />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground">
            {deals.length} deals — {formatCurrency(deals.reduce((s, d) => s + d.value, 0))} total
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Deal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deal</DialogTitle>
              <DialogDescription>Add a deal to your pipeline.</DialogDescription>
            </DialogHeader>
            <form action={handleCreateDeal} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input name="title" required placeholder="Enterprise License" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Value ($) *</label>
                <Input name="value" type="number" required placeholder="50000" min="1" />
              </div>
              <Button type="submit" className="w-full">Create Deal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stageConfig.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);

            return (
              <motion.div
                key={stage.id}
                className="min-w-[280px] flex-1"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.05 }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                    <h3 className="text-sm font-semibold">{stage.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {stageDeals.length}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(stageValue)}
                  </span>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] space-y-2 rounded-lg border border-dashed p-2 transition-colors ${
                        snapshot.isDraggingOver
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/30 bg-muted/20"
                      }`}
                    >
                      {stageDeals.map((deal, index) => {
                        const score = calculateLeadScore(deal);
                        return (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`rounded-lg border border-border/50 bg-card p-3 transition-shadow ${
                                  snapshot.isDragging ? "shadow-lg shadow-primary/10" : ""
                                }`}
                              >
                                <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.15 }}>
                                  <div className="mb-2 flex items-start justify-between">
                                    <h4 className="text-sm font-medium leading-tight">
                                      {deal.title}
                                    </h4>
                                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                                      <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                                        <circle
                                          cx="18" cy="18" r="14"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          className="text-muted/30"
                                        />
                                        <circle
                                          cx="18" cy="18" r="14"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          strokeDasharray={`${score.score * 0.88} 88`}
                                          strokeLinecap="round"
                                          className={score.color}
                                        />
                                      </svg>
                                      <span className={`absolute text-[9px] font-bold ${score.color}`}>
                                        {score.score}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <DollarSign className="h-3 w-3" />
                                      {formatCurrency(deal.value)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <Flame className="h-3 w-3" />
                                      {getContactName(deal.contactId)}
                                    </div>
                                    {deal.expectedCloseDate && (
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(deal.expectedCloseDate)}
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-2 flex items-center justify-between">
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${
                                        deal.priority === "Urgent"
                                          ? "border-red-500/30 text-red-400"
                                          : deal.priority === "High"
                                          ? "border-amber-500/30 text-amber-400"
                                          : "border-border text-muted-foreground"
                                      }`}
                                    >
                                      {deal.priority}
                                    </Badge>
                                    <span className={`text-[10px] font-medium ${score.color}`}>
                                      {score.label}
                                    </span>
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </motion.div>
            );
          })}
        </div>
      </DragDropContext>
    </motion.div>
  );
}

function PipelineSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="min-w-[280px] flex-1 space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
