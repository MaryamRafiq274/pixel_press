"use client";

import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  Infinity as InfinityIcon,
  Layers,
  BadgeCheck,
  FolderDown,
  Search,
} from "lucide-react";

const REASONS = [
  { icon: Zap, title: "Fast Processing", description: "Most images compress in under two seconds." },
  { icon: ShieldCheck, title: "Privacy First", description: "Files are auto-deleted from our servers after processing." },
  { icon: InfinityIcon, title: "Unlimited Uploads", description: "No daily caps, no artificial throttling." },
  { icon: Layers, title: "Multiple Formats", description: "Full support for modern and legacy image types." },
  { icon: BadgeCheck, title: "No Watermark", description: "Every output file is clean, yours, and unbranded." },
  { icon: FolderDown, title: "Batch Download", description: "Export an entire session as one ZIP archive." },
  { icon: Search, title: "SEO Friendly", description: "Lighter images mean faster pages and better rankings." },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white/60 py-20 dark:bg-card-dark/40 md:py-28">
      <div className="container-px mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-section-sm text-ink dark:text-ink-dark md:text-section">
            Why creators choose PixelPress
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.07 }}
              className="rounded-xl2 border border-line bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:border-line-dark dark:bg-card-dark"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary dark:bg-primary/10">
                <reason.icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">
                {reason.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted dark:text-muted-dark">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
