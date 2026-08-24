"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  FolderTree,
  Palette,
  Code2,
  Sparkles,
  Target,
  Check,
  Plus,
  Loader2,
  Settings,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Project = {
  id: string;
  name: string;
  description: string | null;
  tech_stack: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectDocument = {
  id: string;
  project_id: string;
  file_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const contextFiles = [
  {
    name: "project-overview.md",
    title: "Project Overview",
    description: "Project purpose, goals, features, scope, and success criteria.",
    icon: FileText,
    href: "project-overview",
  },
  {
    name: "architecture.md",
    title: "Architecture",
    description: "Tech stack, system boundaries, folders, and core entities.",
    icon: FolderTree,
    href: "architecture",
  },
  {
    name: "ui-context.md",
    title: "UI Context",
    description: "Visual system, components, layouts, and interface rules.",
    icon: Palette,
    href: "ui-context",
  },
  {
    name: "code-standards.md",
    title: "Code Standards",
    description: "Coding conventions, patterns, naming, and quality rules.",
    icon: Code2,
    href: "code-standards",
  },
  {
    name: "ai-workflow-rules.md",
    title: "AI Workflow Rules",
    description: "Rules that guide AI agents while working on the project.",
    icon: Sparkles,
    href: "ai-workflow-rules",
  },
  {
    name: "memory.md",
    title: "Memory",
    description: "Persistent project decisions, context, and important history.",
    icon: Target,
    href: "memory",
  },
  {
    name: "progress-tracker.md",
    title: "Progress Tracker",
    description: "Current implementation progress, completed work, and next steps.",
    icon: Check,
    href: "progress-tracker",
  },
];

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();

  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`/api/projects/${projectId}/documents`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load project");
        }

        setProject(data.project);
        setDocuments(data.documents ?? []);
      } catch (error) {
        console.error("Load project error:", error);
        setError(error instanceof Error ? error.message : "Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (isLoading) {
  return (
    <main className="min-h-screen bg-base">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Back skeleton */}
        <Skeleton className="h-4 w-24" />

        {/* Header skeleton */}
        <div className="mt-8">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-8 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/2" />
        </div>

        {/* Info cards skeleton */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>

        {/* Context files skeleton */}
        <div className="mt-10">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-default bg-surface p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="mt-2 h-3 w-1/2" />
                    <Skeleton className="mt-4 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-5/6" />
                    <Skeleton className="mt-4 h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

  if (error || !project) {
    return (
      <main className="min-h-screen bg-base">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-copy-muted transition hover:text-copy-primary"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </button>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-500">
            {error || "Project not found"}
          </div>
        </div>
      </main>
    );
  }

  const generatedFileNames = new Set(documents.map((d) => d.file_name));

  return (
    <main className="min-h-screen bg-base">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-copy-muted transition hover:text-copy-primary"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mt-8 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-brand">
              Project
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
              {project.name}
            </h1>

            {project.description && (
              <p className="mt-2 max-w-2xl text-sm text-copy-muted">
                {project.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push(`/dashboard/projects/${projectId}/settings`)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-default px-4 py-2.5 text-sm font-medium text-copy-primary transition hover:border-brand hover:text-brand"
          >
            <Settings className="size-4" />
            Settings
          </button>
        </div>

        {/* Project Info */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-default bg-surface px-5 py-4">
            <p className="text-xs text-copy-muted">Status</p>
            <p className="mt-1 text-sm font-medium text-copy-primary">
              {project.status || "active"}
            </p>
          </div>

          <div className="rounded-xl border border-default bg-surface px-5 py-4">
            <p className="text-xs text-copy-muted">Tech Stack</p>
            <p className="mt-1 text-sm font-medium text-copy-primary">
              {project.tech_stack || "Not specified"}
            </p>
          </div>

          <div className="rounded-xl border border-default bg-surface px-5 py-4">
            <p className="text-xs text-copy-muted">Project ID</p>
            <p className="mt-1 break-all font-mono text-xs text-copy-primary">
              {projectId}
            </p>
          </div>
        </div>

        {/* Context Files */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-copy-primary">
                Context Files
              </h2>
              <p className="mt-1 text-sm text-copy-muted">
                Seven files that define the project context.
              </p>
            </div>

            <span className="rounded-full border border-default bg-surface px-3 py-1 text-xs font-medium text-copy-muted">
              {generatedFileNames.size} / 7 Generated
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {contextFiles.map((file) => {
              const Icon = file.icon;
              const isGenerated = generatedFileNames.has(file.name);
              const isFirstMissing =
                !isGenerated &&
                contextFiles.findIndex((f) => !generatedFileNames.has(f.name)) ===
                  contextFiles.indexOf(file);

              return (
                <div
                  key={file.name}
                  className={`group rounded-2xl border p-5 transition ${
                    isGenerated
                      ? "border-green-500/30 bg-green-50/50 hover:border-green-500/50"
                      : isFirstMissing
                        ? "border-brand/50 bg-brand-soft/50 hover:border-brand"
                        : "border-default bg-surface hover:border-brand/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                        isGenerated ? "bg-green-500/10" : "bg-brand/10"
                      }`}
                    >
                      <Icon
                        className={`size-5 ${
                          isGenerated ? "text-green-600" : "text-brand"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-copy-primary">
                            {file.title}
                          </h3>
                          <p className="mt-1 font-mono text-xs text-copy-muted">
                            {file.name}
                          </p>
                        </div>

                        {isGenerated ? (
                          <span className="shrink-0 rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-600">
                            Generated
                          </span>
                        ) : isFirstMissing ? (
                          <span className="shrink-0 rounded-full bg-brand px-2.5 py-1 text-[11px] font-medium text-white">
                            Next
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-default px-2.5 py-1 text-[11px] text-copy-muted">
                            Locked
                          </span>
                        )}
                      </div>

                      <p className="mt-4 text-sm leading-6 text-copy-muted">
                        {file.description}
                      </p>

                      <div className="mt-5">
                        {isGenerated ? (
                          <Link
                            href={`/dashboard/projects/${projectId}/context/${file.href}`}
                            className="inline-flex items-center text-sm font-medium text-brand transition hover:text-brand-dark"
                          >
                            Open & Edit →
                          </Link>
                        ) : isFirstMissing ? (
                          <Link
                            href={`/dashboard/projects/${projectId}/context/${file.href}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:text-brand-dark"
                          >
                            <Plus className="size-4" />
                            Create
                          </Link>
                        ) : (
                          <span className="text-sm text-copy-faint">Locked</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}