"use client";

import { motion } from "framer-motion";
import { ImageDown, Gauge, TrendingDown, FileStack } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

const STATS = [
  {
    icon: ImageDown,
    value: 128430,
    suffix: "",
    label: "Compressed Today",
  },
  {
    icon: FileStack,
    value: 41.2,
    suffix: "M",
    decimals: 1,
    label: "Images Processed",
  },
  {
    icon: TrendingDown,
    value: 68,
    suffix: "%",
    label: "Average Savings",
  },
  {
    icon: Gauge,
    value: 10,
    suffix: "+",
    label: "Supported Formats",
  },
];

export default function Stats() {
  return (
    <section className="border-y border-line bg-white/60 py-14 dark:border-line-dark dark:bg-card-dark/40">
      <div className="container-px mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-xl2 border border-line bg-white p-5 text-center shadow-soft transition-shadow duration-300 hover:shadow-lift dark:border-line-dark dark:bg-card-dark md:p-7"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl2 bg-primary-50 text-primary dark:bg-primary/10">
                <stat.icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <p className="text-2xl font-bold text-ink dark:text-ink-dark md:text-3xl">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals ?? 0}
                />
              </p>
              <p className="mt-1 text-xs font-medium text-muted dark:text-muted-dark md:text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
