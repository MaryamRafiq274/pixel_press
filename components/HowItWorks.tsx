"use client";

import { motion } from "framer-motion";
import { UploadCloud, SlidersHorizontal, Wand2, DownloadCloud } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload",
    description: "Drag in your images or select them from your device.",
  },
  {
    icon: SlidersHorizontal,
    title: "Choose Settings",
    description: "Pick a compression level, format, or resize target.",
  },
  {
    icon: Wand2,
    title: "Compress",
    description: "Our engine optimizes every file in a matter of seconds.",
  },
  {
    icon: DownloadCloud,
    title: "Download",
    description: "Save individually or grab them all as a single ZIP.",
  },
];

export default function HowItWorks() {
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
            How it works
          </h2>
          <p className="mt-3 text-muted dark:text-muted-dark">
            Four steps from full-size photo to optimized file, start to finish.
          </p>
        </motion.div>

        <div className="relative mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-8 hidden h-px bg-line dark:bg-line-dark lg:block"
          />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-surface bg-gradient-to-br from-primary to-secondary text-white shadow-lift dark:border-surface-dark">
                <step.icon className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <span className="mb-1 text-xs font-bold uppercase tracking-wider text-secondary">
                Step {i + 1}
              </span>
              <h3 className="text-base font-semibold text-ink dark:text-ink-dark">
                {step.title}
              </h3>
              <p className="mt-1.5 max-w-[220px] text-sm text-muted dark:text-muted-dark">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
