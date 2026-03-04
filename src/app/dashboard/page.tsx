"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  TrendingUp,
  Target,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getDeals, getContacts, getAuditLogs } from "@/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { WinRateChart } from "@/components/charts/win-rate-chart";
import type { Deal, Contact, AuditLog } from "@/lib/db/schema";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDeals(), getContacts(), getAuditLogs()]).then(
      ([d, c, l]) => {
        setDeals(d);
        setContacts(c);
        setLogs(l);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Promise.all([getDeals(), getContacts(), getAuditLogs()]).then(([d, c, l]) => {
        setDeals(d);
        setContacts(c);
        setLogs(l);
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <DashboardSkeleton />;

  const totalRevenue = deals
    .filter((d) => d.stage === "Won")
    .reduce((sum, d) => sum + d.value, 0);
  const pipelineValue = deals
    .filter((d) => !["Won", "Lost"].includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);
  const wonDeals = deals.filter((d) => d.stage === "Won").length;
  const closedDeals = deals.filter((d) => ["Won", "Lost"].includes(d.stage)).length;
  const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;
  const activeContacts = contacts.filter((c) => c.status === "active").length;

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      change: deals.length > 0 ? "Live from database" : "No records yet",
      icon: DollarSign,
      color: "text-emerald-400",
    },
    {
      title: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      change: deals.length > 0 ? "Live from database" : "No records yet",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Active Contacts",
      value: activeContacts.toString(),
      change: contacts.length > 0 ? "Live from database" : "No records yet",
      icon: Users,
      color: "text-violet-400",
    },
    {
      title: "Win Rate",
      value: `${winRate}%`,
      change: deals.length > 0 ? "Live from database" : "No records yet",
      icon: Target,
      color: "text-amber-400",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here&apos;s your CRM overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item} whileHover={{ y: -4, scale: 1.01 }}>
            <Card className="metallic-panel border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold sm:text-2xl">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg bg-muted p-2.5 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400/90">
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="metallic-panel border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>Pipeline revenue projection over 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart deals={deals} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="metallic-panel border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Win Rate</CardTitle>
              <CardDescription>Deal conversion performance</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center pb-6">
              <WinRateChart rate={winRate} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="metallic-panel border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="rounded-lg border border-border/30 p-8 text-center text-sm text-muted-foreground">
                  No activity yet. Actions from all users will appear here.
                </div>
              ) : (
                logs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-2 rounded-lg border border-border/30 p-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          <span className="capitalize">{log.action}</span>{" "}
                          <Badge variant="outline" className="ml-1 text-xs">
                            {log.entityType}
                          </Badge>
                        </p>
                        <p className="text-xs text-muted-foreground">{log.entityName}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground sm:pl-2">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-32" />
              <Skeleton className="mt-2 h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="mx-auto h-48 w-48 rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
