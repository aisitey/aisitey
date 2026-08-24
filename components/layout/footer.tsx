import Link from "next/link";
import { BsTwitterX } from "react-icons/bs";
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t border-default bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-brand"
            >
              aisitey
            </Link>

            <p className="mt-2 max-w-sm text-sm leading-6 text-copy-muted">
              Build with context, not chaos. A structured system for AI-driven
              development.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            <Link
              href="/templates"
              className="text-sm text-copy-secondary transition-colors hover:text-brand"
            >
              Templates
            </Link>

            <Link
              href="/pricing"
              className="text-sm text-copy-secondary transition-colors hover:text-brand"
            >
              Pricing
            </Link>

            <Link
              href="/blog"
              className="text-sm text-copy-secondary transition-colors hover:text-brand"
            >
              Blog
            </Link>

            <Link
              href="/about"
              className="text-sm text-copy-secondary transition-colors hover:text-brand"
            >
              About
            </Link>

            <a
              href="https://www.npmjs.com/package/aisitey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-red-500 transition-colors hover:text-red-600"
            >
              npm
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 border-t border-default pt-6">
          {/* Social + Copyright Row */}
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Copyright */}
            <p className="text-sm text-copy-muted">
              © {new Date().getFullYear()} aisitey.com All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/WalaaMoFekry/aisitey-contexts"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-xl border border-default text-copy-secondary transition-all hover:border-brand/30 hover:text-brand hover:shadow-sm"
                aria-label="GitHub"
              >
                <FaGithub className="size-4" />
              </a>

              <a
                href="https://x.com/aisiteycom"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-xl border border-default text-copy-secondary transition-all hover:border-brand/30 hover:text-brand hover:shadow-sm"
                aria-label="X (Twitter)"
              >
                <BsTwitterX className="size-4" />
              </a>

              <a
                href="https://www.youtube.com/@aisiteycom"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-xl border border-default text-copy-secondary transition-all hover:border-brand/30 hover:text-brand hover:shadow-sm"
                aria-label="YouTube"
              >
                <FaYoutube className="size-4" />
              </a>

              <a
                href="https://www.linkedin.com/in/walaa-mohammed-88b51a319/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-xl border border-default text-copy-secondary transition-all hover:border-brand/30 hover:text-brand hover:shadow-sm"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="size-4" />
              </a>
            </div>

            {/* Tagline */}
            <p className="text-xs text-copy-muted">
              Built with AI. Directed by humans.
            </p>
          </div>

          {/* Legal Links Row */}
          <div className="mt-6 flex items-center justify-center gap-4 border-t border-default pt-6">
            <Link
              href="/privacy"
              className="text-xs text-copy-muted transition-colors hover:text-copy-secondary"
            >
              Privacy Policy
            </Link>
            <span className="text-xs text-copy-faint">•</span>
            <Link
              href="/terms"
              className="text-xs text-copy-muted transition-colors hover:text-copy-secondary"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}