"use client";

import { Search, Bell, MessageSquare, Moon, Sun, Menu } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandLogo } from "@/components/brand-logo";
import { useCommandMenu } from "@/hooks/use-command-menu";
import { getInitials } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/pipeline", label: "Pipeline" },
  { href: "/dashboard/contacts", label: "Contacts" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { setOpen } = useCommandMenu();
  const displayName = session?.user?.name ?? "Authenticated User";
  const displayEmail = session?.user?.email ?? "hidden@example.com";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-4 md:px-6">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] border-r border-border/60 bg-sidebar/95 p-0 backdrop-blur-xl">
              <SheetHeader className="border-b border-border/60 px-4 py-4">
                <SheetTitle className="flex items-center">
                  <BrandLogo />
                </SheetTitle>
              </SheetHeader>
              <nav className="space-y-2 px-3 py-4">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg border border-border/40 bg-card/60 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  variant="destructive"
                  className="mt-2 w-full"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign out
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

      <motion.button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 overflow-hidden rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(128,190,255,0.2)_48%,transparent_100%)]"
          animate={{ x: ["-110%", "130%"] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search everything...</span>
        <span className="sm:hidden">Search...</span>
        <kbd className="ml-3 hidden rounded border border-border bg-background px-1.5 py-0.5 text-xs font-mono md:inline">
          ⌘K
        </kbd>
      </motion.button>
      </div>

      <div className="flex items-center gap-2">
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
          <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
