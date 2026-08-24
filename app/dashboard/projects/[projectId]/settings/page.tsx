"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type ProjectSettings = {
  name: string;
  description: string;
  tech_stack: string;
  status: string;
  created_at: string;
};

const defaultSettings: ProjectSettings = {
  name: "",
  description: "",
  tech_stack: "",
  status: "active",
  created_at: "",
};

export default function ProjectSettingsPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  const [settings, setSettings] = useState<ProjectSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const loadSettings = async () => {
      try {
        setIsLoading(true);

const response = await fetch(`/api/projects/${projectId}/settings`);

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load project");
        }

        if (data.project) {
          setSettings({
            name: data.project.name || "",
            description: data.project.description || "",
            tech_stack: data.project.tech_stack || "",
            status: data.project.status || "active",
            created_at: data.project.created_at || "",
          });
        }
      } catch (error) {
        console.error("Load settings error:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [projectId]);

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settings.name,
          description: settings.description,
          tech_stack: settings.tech_stack,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      toast.success("Settings saved!", {
        description: "Project settings have been updated.",
      });
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete project");
      }

      toast.success("Project deleted!", {
        description: "The project has been removed.",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Delete project error:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base">
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push(`/dashboard/projects/${projectId}`)}
          className="inline-flex items-center gap-2 text-sm text-copy-muted transition hover:text-copy-primary"
        >
          <ArrowLeft className="size-4" />
          Back to Project
        </button>

        {/* Header */}
        <div className="mt-8">
          <p className="font-mono text-xs text-brand">project-settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
            Project Settings
          </h1>
          <p className="mt-2 text-sm text-copy-muted">
            Configure your project information.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {/* General */}
          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold text-copy-primary">
              General
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Project Name
                </label>
                <input
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="My Project"
                  className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={4}
                  placeholder="Describe this project..."
                  className="w-full resize-none rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tech Stack
                </label>
                <input
                  value={settings.tech_stack}
                  onChange={(e) => setSettings({ ...settings, tech_stack: e.target.value })}
                  placeholder="Next.js + TypeScript"
                  className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {settings.created_at && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Created At
                  </label>
                  <p className="rounded-xl border border-default bg-base px-4 py-3 text-sm text-copy-muted">
                    {new Date(settings.created_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Save */}
          <section className="sticky bottom-6 rounded-2xl border border-default bg-surface/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-copy-primary">
                  Project Settings
                </p>
                <p className="mt-1 text-xs text-copy-muted">
                  Save your project configuration.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:opacity-40"
              >
                <Save className="size-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-red-500/20 bg-surface p-6">
            <h2 className="text-lg font-semibold text-red-400">
              Danger Zone
            </h2>
            <p className="mt-1 text-sm text-copy-muted">
              Permanently delete this project and its data.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:border-red-400 hover:bg-red-500/5 disabled:opacity-40"
              >
                <Trash2 className="size-4" />
                Delete Project
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-default bg-surface p-6 shadow-2xl">
            <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10">
              <Trash2 className="size-5 text-red-500" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-copy-primary">
              Delete Project?
            </h2>

            <p className="mt-2 text-sm leading-6 text-copy-muted">
              Are you sure you want to delete{" "}
              <span className="font-medium text-copy-primary">{settings.name}</span>?
            </p>

            <p className="mt-2 text-xs text-red-500">
              This action cannot be undone.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-default px-5 py-2.5 text-sm font-medium text-copy-primary hover:border-brand"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}