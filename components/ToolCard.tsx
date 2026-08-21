"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  comingSoon?: boolean;
  index?: number;
}

export default function ToolCard({
  icon: Icon,
  title,
  description,
  href,
  comingSoon = false,
  index = 0,
}: ToolCardProps) {
  return (
    <motion.a
      href={comingSoon ? undefined : href}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.45,
        delay: (index % 5) * 0.06,
      }}
      className={`group relative flex flex-col rounded-xl2 border border-line bg-white p-6 shadow-soft transition-all duration-300 dark:border-line-dark dark:bg-card-dark ${
        comingSoon
          ? "cursor-default opacity-80"
          : "hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift"
      }`}
    >
      {comingSoon && (
        <span className="absolute right-4 top-4 rounded-full bg-accent-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent-600 dark:bg-accent/10 dark:text-accent">
          Coming Soon
        </span>
      )}

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl2 bg-secondary-50 text-secondary-600 transition-transform duration-300 group-hover:scale-110 dark:bg-secondary/10 dark:text-secondary">
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>

      <h3 className="flex items-center gap-1 text-base font-semibold text-ink dark:text-ink-dark">
        {title}

        {!comingSoon && (
          <ArrowUpRight className="h-3.5 w-3.5 text-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
      </h3>

      <p className="mt-1.5 text-sm leading-relaxed text-muted dark:text-muted-dark">
        {description}
      </p>
    </motion.a>
  );
}