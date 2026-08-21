"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import UploadBox from "@/components/UploadBox";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">

      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent blur-3xl"
       
      />
      {/*
  <div className="container-px relative mx-auto max-w-4xl text-center">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold text-primary shadow-soft dark:border-line-dark dark:bg-card-dark"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Trusted by 40,000+ creators worldwide
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.05 }}
      className="text-balance text-hero-sm text-ink dark:text-ink-dark md:text-hero"
    >
      Compress Images Without{" "}
      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Losing Quality
      </span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12 }}
      className="mx-auto mt-5 max-w-xl text-balance text-base text-muted dark:text-muted-dark md:text-lg"
    >
      Compress, resize, convert, and optimize images in seconds. No
      registration required. Batch processing. Privacy-first.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.18 }}
      className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
    >
      <a
        href="#upload"
        className="btn-ripple group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:bg-primary-600 hover:shadow-lift hover:-translate-y-0.5"
      >
        Upload Images
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </a>

      <a
        href="#tools"
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-all duration-300 hover:border-primary/40 hover:text-primary dark:border-line-dark dark:bg-card-dark dark:text-ink-dark"
      >
        Explore Tools
      </a>
    </motion.div>
  </div>
*/}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="container-px relative mx-auto mt-0 max-w-6xl"
      >
        <UploadBox />
      </motion.div>

    </section>
  );
}
