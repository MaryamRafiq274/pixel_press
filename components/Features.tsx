"use client";

import { motion } from "framer-motion";
import {
  Minimize2,
  Maximize2,
  RefreshCw,
  Layers2,
  PackageOpen,
  FolderDown,
  Eraser,
  Smartphone,
} from "lucide-react";
import FeatureCard from "@/components/FeatureCard";

const FEATURES = [
  {
    icon: Minimize2,
    title: "Compress Images",
    description: "Shrink file size up to 80% with smart, lossless-feeling algorithms.",
  },
  {
    icon: Maximize2,
    title: "Resize Images",
    description: "Scale to exact dimensions or presets without stretching or blur.",
  },
  {
    icon: RefreshCw,
    title: "Convert Image Format",
    description: "Switch between JPG, PNG, WEBP, and AVIF in a single click.",
  },
  {
    icon: Layers2,
    title: "Image Overlay",
    description: "Layer logos, text, or graphics precisely on top of any photo.",
  },
  {
    icon: PackageOpen,
    title: "Bulk Processing",
    description: "Handle hundreds of images at once with consistent settings.",
  },
  {
    icon: FolderDown,
    title: "ZIP Download",
    description: "Grab every processed file together in one compressed archive.",
  },
  {
    icon: Eraser,
    title: "Metadata Removal",
    description: "Strip EXIF and location data to keep your files clean and private.",
  },
  {
    icon: Smartphone,
    title: "Social Media Resize",
    description: "One-tap presets sized for Instagram, X, LinkedIn, and more.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container-px mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-section-sm text-ink dark:text-ink-dark md:text-section">
            Everything you need, in one place
          </h2>
          <p className="mt-3 text-muted dark:text-muted-dark">
            A complete toolkit for every stage of your image workflow — built
            for speed, precision, and privacy.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} index={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
