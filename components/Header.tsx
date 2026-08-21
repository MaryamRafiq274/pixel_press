"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "ImageConverter", href: "/image-converter" },
  { label: "ImageSizer", href: "/image-resizer" },
  /*{ label: "Image Tools", href: "#tools" },
  { label: "PDF Tools", href: "#tools" },
  { label: "Developer Tools", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },*/
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-surface-dark/80 backdrop-blur-lg border-b border-line dark:border-line-dark shadow-soft"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl2 bg-gradient-to-br from-primary to-secondary text-white shadow-soft transition-transform duration-300 group-hover:scale-105">
            <Layers className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink dark:text-ink-dark">
            PixelPress
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors duration-300 hover:text-primary dark:text-muted-dark dark:hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex h-10 w-10 items-center justify-center rounded-xl2 border border-line text-muted transition-colors duration-300 hover:border-primary hover:text-primary dark:border-line-dark dark:text-muted-dark"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a
            href="#upload"
            className="btn-ripple rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:bg-primary-600 hover:shadow-lift"
          >
            Compress Image
          </a>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl2 text-ink lg:hidden dark:text-ink-dark"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-line bg-white lg:hidden dark:border-line-dark dark:bg-surface-dark"
          >
            <div className="container-px mx-auto flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl2 px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-primary dark:text-muted-dark dark:hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex items-center gap-3 px-3">
                <button
                  onClick={toggleTheme}
                  className="flex h-10 w-10 items-center justify-center rounded-xl2 border border-line text-muted dark:border-line-dark dark:text-muted-dark"
                  aria-label="Toggle dark mode"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <a
                  href="#upload"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white shadow-soft"
                >
                  Compress Image
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
