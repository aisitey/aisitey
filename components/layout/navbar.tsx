"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  SignInButton,
  SignUpButton,
  useAuth,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Templates", href: "/templates" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed left-1/2 top-4 z-50 w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex h-14 items-center rounded-2xl border border-default bg-surface/95 px-4 shadow-sm backdrop-blur-md">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 group"
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image
              src="/aisitey-logo.png"
              alt="aisitey logo"
              width={28}
              height={28}
              className="rounded-lg"
            />
          </motion.div>
          <span className="text-lg font-semibold tracking-tight text-brand transition-colors group-hover:text-brand-dark">
            aisitey
          </span>
        </Link>
        {/* Desktop Navigation */}
        <div className="ml-8 hidden min-w-0 flex-1 items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setActiveLink(link.href)}
              onMouseLeave={() => setActiveLink(null)}
              className={`relative shrink-0 text-sm transition-all duration-200 ${
                activeLink === link.href
                  ? "text-brand font-medium"
                  : "text-copy-secondary hover:text-brand"
              }`}
            >
              {link.label}
              {/* Animated underline */}
              <motion.span
                initial={false}
                animate={{
                  scaleX: activeLink === link.href ? 1 : 0,
                  opacity: activeLink === link.href ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="absolute -bottom-1 left-0 h-0.5 w-full origin-left rounded-full bg-brand"
              />
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="ml-auto flex size-9 items-center justify-center rounded-xl border border-default lg:hidden"
        >
          {isMobileMenuOpen ? (
            <X className="size-4" />
          ) : (
            <Menu className="size-4" />
          )}
        </motion.button>

        {/* Auth */}
        <div className="ml-6 hidden shrink-0 items-center gap-3 lg:flex">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden rounded-xl px-4 py-2 text-sm font-medium text-copy-secondary transition-all hover:text-brand hover:bg-brand-soft sm:block"
              >
                Dashboard
              </Link>
              <UserButton />
            </div>
          ) : (
            <>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-copy-secondary transition-colors hover:text-brand hover:bg-subtle"
                >
                  Sign In
                </motion.button>
              </SignInButton>

              <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl bg-brand px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25"
                >
                  Get Started
                </motion.button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-2 rounded-2xl border border-default bg-surface p-4 shadow-lg lg:hidden"
        >
          <div className="space-y-1">
            {links.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm text-copy-secondary transition-colors hover:bg-subtle hover:text-brand"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <div className="my-2 border-t border-default" />

            {isSignedIn ? (
              <div className="space-y-2 px-4 py-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-brand hover:bg-brand-soft"
                >
                  Dashboard
                </Link>
                <UserButton />
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-4 py-2">
                <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                  <button className="rounded-xl px-4 py-2 text-sm font-medium text-copy-secondary hover:bg-subtle">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                  <button className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
