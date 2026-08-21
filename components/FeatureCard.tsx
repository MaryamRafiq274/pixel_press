"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  index = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.07 }}
      className="group rounded-xl2 border border-line bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift dark:border-line-dark dark:bg-card-dark"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl2 bg-gradient-to-br from-primary-50 to-secondary-50 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 dark:from-primary/10 dark:to-secondary/10">
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <h3 className="text-base font-semibold text-ink dark:text-ink-dark">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted dark:text-muted-dark">
        {description}
      </p>
    </motion.div>
  );
}
