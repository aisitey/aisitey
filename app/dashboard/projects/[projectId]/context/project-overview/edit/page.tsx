"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  FileText,
  Save,
  Loader2,
} from "lucide-react";

export default function ProjectOverviewEditPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();

  const projectId = params.projectId;

  const [content, setContent] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `/api/projects/${projectId}/context/project-overview`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Failed to load project overview",
          );
        }

        setProjectName(data.project?.name || "");

        if (!data.document) {
          throw new Error(
            "Project overview has not been generated yet.",
          );
        }

        setContent(data.document.content || "");
      } catch (error) {
        console.error(
          "[project-overview-editor] Load error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load project overview",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId || isSaving) return;

    try {
      setIsSaving(true);
      setSaved(false);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/context/project-overview`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to save project overview",
        );
      }

      setContent(data.document?.content ?? content);
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "[project-overview-editor] Save error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save project overview",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-sm text-copy-muted">
            <Loader2 className="size-4 animate-spin" />
            Loading project overview...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(`/dashboard/projects/${projectId}`)
          }
          className="inline-flex items-center gap-2 text-sm text-copy-muted transition hover:text-copy-primary"
        >
          <ArrowLeft className="size-4" />
          Back to Project
        </button>

        {/* Header */}
        <div className="mt-8 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-brand" />

              <p className="font-mono text-xs text-brand">
                project-overview.md
              </p>
            </div>

            <h1 className="mt-3 text-3xl font-semibold text-copy-primary">
              Project Overview
            </h1>

            <p className="mt-2 text-sm text-copy-muted">
              {projectName
                ? `Review and edit the project overview for ${projectName}.`
                : "Review and edit your project overview."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saved ? (
              <Check className="size-4" />
            ) : (
              <Save className="size-4" />
            )}

            {isSaving
              ? "Saving..."
              : saved
                ? "Saved"
                : "Save Changes"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Editor */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-default bg-surface">
          <div className="flex items-center justify-between border-b border-default px-5 py-3">
            <div>
              <p className="text-sm font-medium text-copy-primary">
                Markdown Editor
              </p>

              <p className="mt-0.5 text-xs text-copy-muted">
                Edit the generated context file directly.
              </p>
            </div>

            <span className="font-mono text-xs text-copy-muted">
              {content.length} characters
            </span>
          </div>

          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setSaved(false);
            }}
            spellCheck={false}
            className="min-h-[650px] w-full resize-y bg-base px-6 py-6 font-mono text-sm leading-7 text-copy-primary outline-none"
            placeholder="# Project Overview"
          />
        </section>

        {/* Bottom actions */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-copy-muted">
            Changes are saved directly to project documents.
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl border border-default px-4 py-2 text-sm font-medium text-copy-primary transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            Save
          </button>
        </div>
      </div>
    </main>
  );
}