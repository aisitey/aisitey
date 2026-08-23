"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FolderKanban, Trash2, Loader2, X } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

type Project = {
  id: string;
  name: string;
  description: string | null;
  tech_stack: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/projects");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load projects");
      }

      setProjects(data.projects ?? []);
    } catch (error) {
      console.error("Load projects error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load projects",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async () => {
    if (!projectToDelete || deletingId) {
      return;
    }

    try {
      setDeletingId(projectToDelete.id);
      setError("");

      const response = await fetch(
        `/api/projects/${projectToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to delete project",
        );
      }

      setProjects((current) =>
        current.filter(
          (project) => project.id !== projectToDelete.id,
        ),
      );

      setProjectToDelete(null);
    } catch (error) {
      console.error("Delete project error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete project",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-base">
      <Navbar />

      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 xl:py-20 2xl:py-32 2xl:px-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-copy-primary">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-copy-muted">
                Manage your projects and build their AI context.
              </p>
            </div>

            <Link
              href="/dashboard/new-project"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark"
            >
              <Plus className="size-4" />
              New Project
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Projects */}
          <section className="mt-10">
            {isLoading ? (
              <div className="flex min-h-64 items-center justify-center rounded-2xl border border-default bg-surface">
                <Loader2 className="size-6 animate-spin text-brand" />
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border border-default bg-surface p-10">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10">
                    <FolderKanban className="size-7 text-brand" />
                  </div>

                  <h2 className="mt-5 text-lg font-semibold text-copy-primary">
                    No projects yet
                  </h2>

                  <p className="mt-2 max-w-md text-sm text-copy-muted">
                    Create your first project to start building its
                    architecture, UI context, coding standards, and AI
                    workflow rules.
                  </p>

                  <Link
                    href="/dashboard/new-project"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-default px-5 py-2.5 text-sm font-medium text-copy-primary transition hover:border-brand hover:text-brand"
                  >
                    <Plus className="size-4" />
                    Create your first project
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group rounded-2xl border border-default bg-surface p-6 transition hover:border-brand/40"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="min-w-0 flex-1"
                      >
                        <div className="flex size-11 items-center justify-center rounded-xl bg-brand/10">
                          <FolderKanban className="size-5 text-brand" />
                        </div>

                        <h2 className="mt-5 truncate text-lg font-semibold text-copy-primary transition group-hover:text-brand">
                          {project.name}
                        </h2>

                        {project.description && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-copy-muted">
                            {project.description}
                          </p>
                        )}
                      </Link>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setProjectToDelete(project)}
                        disabled={deletingId === project.id}
                        aria-label={`Delete ${project.name}`}
                        className="rounded-lg p-2 text-copy-muted transition hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    </div>

                    {project.tech_stack && (
                      <div className="mt-5 border-t border-default pt-4">
                        <p className="truncate text-xs text-copy-muted">
                          {project.tech_stack}
                        </p>
                      </div>
                    )}

                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="mt-5 block text-sm font-medium text-brand"
                    >
                      Open Project →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingId) {
              setProjectToDelete(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-default bg-surface p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10">
                <Trash2 className="size-5 text-red-500" />
              </div>

              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={!!deletingId}
                aria-label="Close"
                className="rounded-lg p-2 text-copy-muted transition hover:bg-base hover:text-copy-primary disabled:opacity-40"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-5">
              <h2 className="text-xl font-semibold text-copy-primary">
                Delete project?
              </h2>

              <p className="mt-2 text-sm leading-6 text-copy-muted">
                Are you sure you want to delete{" "}
                <span className="font-medium text-copy-primary">
                  {projectToDelete.name}
                </span>
                ?
              </p>

              <p className="mt-2 text-xs text-red-500">
                This action cannot be undone.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={!!deletingId}
                className="rounded-xl border border-default px-5 py-2.5 text-sm font-medium text-copy-primary transition hover:border-brand disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={!!deletingId}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Delete Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}