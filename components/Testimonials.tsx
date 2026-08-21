"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Maya Chen",
    role: "Front-End Developer",
    quote:
      "Cut our product page weight by more than half without any visible quality loss. Deploys are noticeably faster now.",
    initials: "MC",
  },
  {
    name: "Daniel Ortiz",
    role: "E-commerce Store Owner",
    quote:
      "Batch uploading a whole catalog used to eat my afternoon. Now I drop in a folder and it's done before my coffee cools.",
    initials: "DO",
  },
  {
    name: "Priya Nandakumar",
    role: "Freelance Photographer",
    quote:
      "The quality is genuinely hard to tell apart from the originals. Clients haven't noticed a single difference.",
    initials: "PN",
  },
];

export default function Testimonials() {
  return (
    <></>
    /*<section className="bg-white/60 py-20 dark:bg-card-dark/40 md:py-28">
      <div className="container-px mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-section-sm text-ink dark:text-ink-dark md:text-section">
            Loved by teams and solo creators
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="flex flex-col rounded-xl2 border border-line bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:border-line-dark dark:bg-card-dark"
            >
              <div className="mb-3 flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-ink dark:text-ink-dark">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink dark:text-ink-dark">
                    {t.name}
                  </span>
                  <span className="block text-xs text-muted dark:text-muted-dark">
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>*/
  );
}
