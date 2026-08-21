import Link from "next/link";
import {
  Layers,
  Twitter,
  Github,
  Linkedin,
  Instagram,
} from "lucide-react";

const FOOTER_LINKS = {
  Tools: [
    { label: "Compress Image", href: "/#home" },
    { label: "Resize Image", href: "/image-resizer" },
    { label: "Image Converter", href: "/image-converter" },
    { label: "Watermark Image", href: "/watermark-image" },
  ],

  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Guides", href: "/guides" },
    { label: "API Docs", href: "/api-docs" },
    { label: "Changelog", href: "/changelog" },
  ],

  Legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "GDPR", href: "/gdpr" },
  ],
};

const SOCIALS = [
  {
    icon: Twitter,
    label: "Twitter",
    href: "#",
  },
  {
    icon: Github,
    label: "GitHub",
    href: "#",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "#",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "#",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white/60 dark:border-line-dark dark:bg-card-dark/40">
      <div className="container-px mx-auto max-w-6xl py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl2 bg-gradient-to-br from-primary to-secondary text-white">
                <Layers className="h-5 w-5" strokeWidth={2.4} />
              </span>

              <span className="text-lg font-bold text-ink dark:text-ink-dark">
                PixelPress
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted dark:text-muted-dark">
              Fast, privacy-first image tools for developers, designers, and
              creators — no registration required.
            </p>

            {/* Social Links */}
            <div className="mt-5 flex gap-2">
              {SOCIALS.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl2 border border-line text-muted transition-colors duration-300 hover:border-primary/40 hover:text-primary dark:border-line-dark dark:text-muted-dark"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">
                {heading}
              </h3>

              <ul className="mt-4 flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors duration-300 hover:text-primary dark:text-muted-dark"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted dark:border-line-dark dark:text-muted-dark sm:flex-row">
          <p>© {new Date().getFullYear()} PixelPress. All rights reserved.</p>

          <p>Built for bloggers, developers, designers &amp; creators.</p>
        </div>
      </div>
    </footer>
  );
}