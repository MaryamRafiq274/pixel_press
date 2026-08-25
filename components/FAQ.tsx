"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Is minifyme really free to use?",
    answer:
      "Yes. Core compression, resizing, and conversion tools are free with no account required. Advanced batch and API features are available on paid plans.",
  },
  {
    question: "Do you store my uploaded images?",
    answer:
      "Files are processed in memory and automatically deleted from our servers shortly after your session ends. We never use your images for training or marketing.",
  },
  {
    question: "What's the maximum file size and batch limit?",
    answer:
      "Free accounts can upload files up to 25MB each, with unlimited images per batch. Paid plans raise the per-file limit and add priority processing.",
  },
  {
    question: "Will compression reduce visual quality?",
    answer:
      "Our algorithm targets the smallest file size at a quality level that's visually indistinguishable from the original for nearly all use cases.",
  },
  {
    question: "Can I use minifyme in my own app?",
    answer:
      "Yes — a developer API is available so you can integrate compression, resizing, and conversion directly into your own product or pipeline.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-0 mb-20">
      <div className="container-px mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-section-sm text-ink dark:text-ink-dark md:text-section">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="mt-10 flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl2 border border-line bg-white shadow-soft dark:border-line-dark dark:bg-card-dark"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-ink dark:text-ink-dark md:text-base">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary-50 text-primary dark:bg-primary/10"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-muted dark:text-muted-dark">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
