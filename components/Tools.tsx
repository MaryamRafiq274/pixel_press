"use client";

import { motion } from "framer-motion";
import {
  Minimize2,
  Maximize2,
  RefreshCw,
  Layers2,
  Crop,
  RotateCw,
  FlipHorizontal2,
  Stamp,
  FileImage,
  Images,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";

const TOOLS = [
  {
    icon: Minimize2,
    title: "Compress Image",
    description: "Reduce file size while preserving visual quality.",
    href: "/#home",
  },
  {
    icon: Maximize2,
    title: "Resize Image",
    description: "Set exact pixel dimensions or scale by percentage.",
    href: "/image-resizer",
  },
  {
    icon: RefreshCw,
    title: "Image Converter",
    description: "Convert between JPG, PNG, WEBP, AVIF, and more.",
    href: "/image-converter",
  },
  {
    icon: Layers2,
    title: "Overlay Image",
    description: "Combine two images into a single composed layer.",
    href: "/overlay-image",
  },
  {
    icon: Crop,
    title: "Crop Image",
    description: "Trim to a precise frame or aspect ratio.",
    href: "/crop-image",
  },
  {
    icon: RotateCw,
    title: "Rotate Image",
    description: "Rotate to any angle in fixed or free-form steps.",
    href: "/rotate-image",
  },
  {
    icon: FlipHorizontal2,
    title: "Flip Image",
    description: "Mirror an image horizontally or vertically.",
    href: "/flip-image",
  },
  {
    icon: Stamp,
    title: "Watermark Image",
    description: "Add a text or logo watermark across a batch.",
    href: "/watermark-image",
    comingSoon: true,
  },
  {
    icon: FileImage,
    title: "Image to PDF",
    description: "Turn one or more images into a single PDF file.",
    href: "/image-to-pdf",
    comingSoon: true,
  },
  {
    icon: Images,
    title: "PDF to Image",
    description: "Export each PDF page as a standalone image.",
    href: "/pdf-to-image",
    comingSoon: true,
  },
];

export default function Tools() {
  return (
    <section id="tools" className="py-20 md:py-28">
      <div className="container-px mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-section-sm text-ink dark:text-ink-dark md:text-section">
            A tool for every task
          </h2>

          <p className="mt-3 text-muted dark:text-muted-dark">
            From quick compression to full format conversion — pick the tool
            that fits what you&apos;re building.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {TOOLS.map((tool, i) => (
            <ToolCard
              key={tool.title}
              index={i}
              {...tool}
            />
          ))}
        </div>
      </div>
    </section>
  );
}