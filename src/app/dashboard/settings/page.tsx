"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Save, Shield, Bell, Database } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Authenticated User";
  const email = session?.user?.email ?? "hidden@example.com";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and CRM preferences.</p>
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>Your personal account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/20 text-lg font-bold text-primary">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <Badge className="mt-1" variant="secondary">Admin</Badge>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input defaultValue={name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue={email} type="email" />
            </div>
          </div>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Deal stage changes", "New contacts added", "Weekly pipeline summary"].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-lg border border-border/30 p-3">
              <span className="text-sm">{item}</span>
              <Badge variant="outline">Enabled</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data & Integration
          </CardTitle>
          <CardDescription>Database connection and integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border/30 p-3">
            <div>
              <p className="text-sm font-medium">PostgreSQL Database</p>
              <p className="text-xs text-muted-foreground">Connected via Neon Serverless</p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400">Connected</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/30 p-3">
            <div>
              <p className="text-sm font-medium">AI Model</p>
              <p className="text-xs text-muted-foreground">Rock Mount AI v2 — Lead Scoring</p>
            </div>
            <Badge className="bg-primary/20 text-primary glow-blue">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
