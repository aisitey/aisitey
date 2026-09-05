"use client";

import { motion } from "framer-motion";
import { Archive, BrushCleaning, ClipboardCheck, LifeBuoy } from "lucide-react";
import { PiBlueprintBold } from "react-icons/pi";

const skills = [
  {
    name: "Blueprint",
    icon: <PiBlueprintBold className="size-5" />,
    description: "Plans before building. No more AI guessing.",
    prevents: "Drift",
  },
  {
    name: "Archive",
    icon: <Archive className="size-5" />,
    description: "Saves decisions and context. No more lost memory.",
    prevents: "Lost Memory",
  },
  {
    name: "Audit",
    icon: <ClipboardCheck className="size-5" />,
    description: "Reviews implementation. No more broken code.",
    prevents: "Inconsistency",
  },
  {
    name: "Rescue",
    icon: <LifeBuoy className="size-5" />,
    description: "Diagnoses failures. No more spiraling.",
    prevents: "Broken Sessions",
  },
  {
    name: "Polish",
    icon: <BrushCleaning className="size-5" />,
    description: "Unifies UI patterns. No more chaos.",
    prevents: "UI Chaos",
  },
];

export function Skills() {
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
            AGENT SKILLS
          </span>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-copy-primary md:text-5xl">
            AI hallucinates. We don't.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-copy-secondary">
            Five skills that keep AI agents on track. Each one prevents a
            specific failure mode.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-3xl border border-default bg-surface p-7 transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand transition-all group-hover:scale-110">
                {skill.icon}
              </div>

              <h3 className="mt-6 text-xl font-semibold text-copy-primary">
                {skill.name}
              </h3>

              <p className="mt-3 text-sm leading-6 text-copy-secondary">
                {skill.description}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                Prevents: {skill.prevents}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 text-center">
          <p className="text-base text-copy-muted">
            One skill for each failure mode. Open source. Always yours.
          </p>
        </div>
      </div>
    </section>
  );
}