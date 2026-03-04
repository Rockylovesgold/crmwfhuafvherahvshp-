"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function BrandLogo({ collapsed = false, className }: BrandLogoProps) {
  const logoPath = process.env.NEXT_PUBLIC_BRAND_LOGO_PATH || "/rockmount-logo.png";

  return (
    <motion.div
      className={cn("flex items-center gap-2", className)}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <motion.div
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-primary/20 to-[#80BEFF]/20 glow-blue"
        whileHover={{ scale: 1.06, rotate: -1.5 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
      >
        <Image
          src={logoPath}
          alt="Rock Mount AI logo"
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
          onError={(event) => {
            const target = event.currentTarget;
            target.style.display = "none";
          }}
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(192,255,255,0.35),transparent_55%)]"
          animate={{ opacity: [0.2, 0.55, 0.2] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <Sparkles className="absolute h-4 w-4 text-primary" />
      </motion.div>
      {!collapsed ? (
        <span className="bg-gradient-to-r from-white via-[#C0FFFF] to-[#80BEFF] bg-clip-text text-lg font-bold tracking-tight text-transparent">
          Rock Mount <span className="glow-text-blue text-primary">AI</span>
        </span>
      ) : null}
    </motion.div>
  );
}
