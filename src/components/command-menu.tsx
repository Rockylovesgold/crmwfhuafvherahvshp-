"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Users, Kanban, LayoutDashboard, Settings, Search, User, DollarSign } from "lucide-react";
import { useCommandMenu } from "@/hooks/use-command-menu";
import { searchAll } from "@/actions";
import type { Contact, Deal } from "@/lib/db/schema";

export function CommandMenu() {
  const router = useRouter();
  const { open, setOpen } = useCommandMenu();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ contacts: Contact[]; deals: Deal[] }>({
    contacts: [],
    deals: [],
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const doSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (value.length > 1) {
      const res = await searchAll(value);
      setResults(res);
    } else {
      setResults({ contacts: [], deals: [] });
    }
  }, []);

  function runCommand(command: () => void) {
    setOpen(false);
    command();
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search contacts, deals, pages..." value={query} onValueChange={doSearch} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/pipeline"))}>
            <Kanban className="mr-2 h-4 w-4" />
            Pipeline
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/contacts"))}>
            <Users className="mr-2 h-4 w-4" />
            Contacts
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        {results.contacts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Contacts">
              {results.contacts.map((contact) => (
                <CommandItem key={contact.id} onSelect={() => runCommand(() => router.push("/dashboard/contacts"))}>
                  <User className="mr-2 h-4 w-4" />
                  <div>
                    <p>{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.email}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results.deals.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Deals">
              {results.deals.map((deal) => (
                <CommandItem key={deal.id} onSelect={() => runCommand(() => router.push("/dashboard/pipeline"))}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  <div>
                    <p>{deal.title}</p>
                    <p className="text-xs text-muted-foreground">{deal.stage} — ${deal.value.toLocaleString()}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
