"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const canCreate = name.trim().length > 0;

  const handleCreate = async () => {
    if (!canCreate || isCreating) return;

    setIsCreating(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          tech_stack: techStack.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.project) {
        throw new Error(data.error || "Failed to create project");
      }

      router.push(`/dashboard/projects/${data.project.id}`);
    } catch (error) {
      console.error("Create project error:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-base">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-copy-muted transition hover:text-copy-primary"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-copy-primary">
            Create New Project
          </h1>

          <p className="mt-2 text-sm text-copy-muted">
            Start by defining the basic information about your project.
          </p>
        </div>

        {/* Form */}
        <div className="mt-10 rounded-2xl border border-default bg-surface p-6">
          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <label
                htmlFor="project-name"
                className="mb-2 block text-sm font-medium text-copy-primary"
              >
                Project Name
              </label>

              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="My SaaS Application"
                autoFocus
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm text-copy-primary outline-none transition placeholder:text-copy-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="project-description"
                className="mb-2 block text-sm font-medium text-copy-primary"
              >
                Description
              </label>

              <textarea
                id="project-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What are you building and what problem does it solve?"
                rows={5}
                className="w-full resize-none rounded-xl border border-default bg-base px-4 py-3 text-sm text-copy-primary outline-none transition placeholder:text-copy-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label
                htmlFor="tech-stack"
                className="mb-2 block text-sm font-medium text-copy-primary"
              >
                Tech Stack
              </label>

              <input
                id="tech-stack"
                type="text"
                value={techStack}
                onChange={(event) => setTechStack(event.target.value)}
                placeholder="Next.js, TypeScript, Supabase, Tailwind CSS"
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm text-copy-primary outline-none transition placeholder:text-copy-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
              />

              <p className="mt-2 text-xs text-copy-muted">
                You can change or expand this later.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-default pt-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-default px-5 py-2.5 text-sm font-medium text-copy-primary transition hover:border-brand"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={!canCreate || isCreating}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-4" />

              {isCreating ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}