"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { useState } from "react";

export function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

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
            {/* Video Placeholder / Actual Video */}
            <div className="relative aspect-video">
              {isPlaying ? (
                <iframe
                  src="https://www.youtube.com/embed/AkTQAbGNfhk?autoplay=1"
                  title="aisitey demo"
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="group absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-brand-soft to-subtle"
                >
                  {/* Play Button */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="flex size-20 items-center justify-center rounded-full bg-brand text-white shadow-xl shadow-brand/30"
                  >
                    <Play className="size-8 fill-white" />
                  </motion.div>

                  {/* Text */}
                  <p className="mt-6 text-sm font-medium text-copy-primary">
                    Watch Demo
                  </p>
                  <p className="mt-1 text-xs text-copy-muted">
                    2 min overview
                  </p>
                </button>
              )}
            </div>
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