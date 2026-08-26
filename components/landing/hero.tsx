"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { Package } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center px-6 pt-28">
      <div className="mx-auto w-full max-w-5xl text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-default bg-surface px-4 py-2 text-sm text-copy-secondary"
        >
          <span className="h-2 w-2 rounded-full bg-ai" />
          Context-driven AI development system
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-4xl text-5xl font-semibold tracking-tight text-copy-primary sm:text-6xl md:text-7xl"
        >
          Build with{" "}
          <span className="relative inline-block text-brand">
            context,
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute bottom-2 left-0 h-3 w-full origin-left rounded-full bg-brand/20 -z-10"
            />
          </span>
          <br />
          not chaos.
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-copy-secondary"
        >
          aisitey gives your AI agents a complete project memory — context,
          architecture, standards, and workflow rules. So they build exactly
          what you need, nothing more, nothing less.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <a
              href="https://github.com/aisitey/aisitey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25"
            >
              <FaGithub className="size-4" />
              View on GitHub
            </a>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <a
              href="https://www.npmjs.com/package/aisitey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-default bg-surface px-6 py-3 text-sm font-medium text-copy-primary transition-colors hover:border-brand/30 hover:text-brand hover:shadow-lg hover:shadow-brand/10"
            >
              <Package className="size-4" />
              Quick Start
            </a>
          </motion.div>
        </motion.div>

        {/* Flow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-copy-muted"
        >
          <span>Idea</span>
          <span>→</span>
          <span>Context Files</span>
          <span>→</span>
          <span>AI Agent</span>
          <span>→</span>
          <span className="font-medium text-brand">Product</span>
        </motion.div>
      </div>
    </section>
  );
}