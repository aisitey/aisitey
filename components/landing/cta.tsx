"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export function CTA() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-brand/20 bg-brand-soft px-6 py-20 text-center md:px-12"
        >
          {/* Decorative elements with animation */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute left-10 top-10 h-24 w-24 rounded-full bg-brand/10 blur-2xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="pointer-events-none absolute bottom-10 right-10 h-32 w-32 rounded-full bg-highlight/10 blur-3xl"
          />

          <div className="relative">
            {/* Eyebrow */}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.4 }}
              className="text-sm font-medium tracking-wide text-brand"
            >
              START BUILDING
            </motion.span>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-copy-primary md:text-5xl"
            >
              Ready to build with context?
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-base leading-7 text-copy-secondary md:text-lg"
            >
              Get the seven context files that will change how you work with
              AI agents. Free and open source.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {/* Templates button */}
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/templates"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25"
                >
                  <FileText className="size-4" />
                  View the Templates
                  <ArrowRight className="size-4" />
                </Link>
              </motion.div>

              {/* GitHub button */}
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <a
                  href="https://github.com/WalaaMoFekry/aisitey-contexts"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-default bg-surface px-6 py-3 text-sm font-medium text-copy-primary transition-colors hover:border-brand/30 hover:text-brand hover:shadow-lg hover:shadow-brand/10"
                >
                  <FaGithub className="size-4" />
                  View on GitHub
                </a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}