"use client";

import { motion } from "framer-motion";

const FORMATS = ["JPG", "PNG", "WEBP", "AVIF", "GIF", "BMP", "SVG", "TIFF", "HEIC", "ICO"];

export default function SupportedFormats() {
  return (
    <></>
    /*<section className="py-16 md:py-20">
      <div className="container-px mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-section-sm text-ink dark:text-ink-dark md:text-section">
            Supported formats
          </h2>
          <p className="mt-3 text-muted dark:text-muted-dark">
            Work with the file types you already use, on either end of the pipeline.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {FORMATS.map((format, i) => (
            <motion.span
              key={format}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="flex h-16 w-16 items-center justify-center rounded-xl2 border border-line bg-white text-xs font-bold text-ink shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:text-secondary-600 dark:border-line-dark dark:bg-card-dark dark:text-ink-dark md:h-20 md:w-20 md:text-sm"
            >
              {format}
            </motion.span>
          ))}
        </div>
      </div>
    </section>*/
  );
}
