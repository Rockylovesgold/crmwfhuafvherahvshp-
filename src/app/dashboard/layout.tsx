import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import { CommandMenu } from "@/components/command-menu";
import { AiChatPanel } from "@/components/ai-chat-panel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(128,190,255,0.2),transparent_38%),radial-gradient(circle_at_82%_20%,rgba(192,255,255,0.15),transparent_34%),radial-gradient(circle_at_50%_120%,rgba(64,64,80,0.22),transparent_50%)]"
      />
      <div aria-hidden className="animated-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 pb-6 sm:p-4 sm:pb-8 md:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <CommandMenu />
      <AiChatPanel />
    </div>
  );
}
