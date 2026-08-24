"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function VideoSection() {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-medium tracking-wide text-brand">
            WATCH DEMO
          </span>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-copy-primary md:text-5xl">
            See aisitey in action.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-copy-secondary">
            Watch how context-driven development turns your ideas into
            structured projects that AI agents can build.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-default bg-surface shadow-2xl shadow-brand/10">
            {/* الفيديو يظهر مباشرة */}
            <iframe
              src="https://www.youtube.com/embed/AkTQAbGNfhk"
              title="aisitey demo"
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Decorative elements */}
          <div className="pointer-events-none absolute -left-4 -top-4 h-24 w-24 rounded-full bg-brand/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-highlight/10 blur-3xl" />
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-default bg-surface px-4 py-2">
            <Sparkles className="size-4 text-brand" />
            <span className="text-sm text-copy-secondary">
              See how it works in less than 2 minutes
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}