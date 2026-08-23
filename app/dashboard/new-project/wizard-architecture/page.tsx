"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Code2,
  FolderTree,
  Database,
  Lock,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const frameworkOptions = [
  "Next.js + TypeScript",
  "Vue 3 + TypeScript",
  "React + TypeScript",
  "Laravel",
  "Flutter",
  "Node.js + Express",
  "Python + Django",
  "Custom",
];

const uiOptions = [
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Chakra UI",
  "shadcn/ui",
  "Custom",
];

const databaseOptions = [
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "SQLite",
  "Supabase",
  "Firebase",
  "Custom",
];

const authOptions = [
  "Clerk",
  "Auth0",
  "NextAuth",
  "Firebase Auth",
  "Supabase Auth",
  "Custom",
];

export default function WizardArchitecturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get("project_id");

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(
    projectIdFromUrl || null
  );

  const [formData, setFormData] = useState({
    framework: "",
    ui: "",
    database: "",
    auth: "",
    folders: [
      { name: "app/", responsibility: "" },
      { name: "components/", responsibility: "" },
      { name: "lib/", responsibility: "" },
    ],
    entities: [
      { name: "", fields: "", relations: "" },
    ],
  });

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.framework !== "" &&
          formData.ui !== "" &&
          formData.database !== "" &&
          formData.auth !== ""
        );
      case 2:
        return formData.folders.some(
          (f) => f.name.trim() !== "" && f.responsibility.trim() !== ""
        );
      case 3:
        return formData.entities.some((e) => e.name.trim() !== "");
      default:
        return false;
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileType: "architecture",
          ...formData,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate");
      }

      toast.success("architecture.md generated!", {
        description: "File downloaded successfully.",
      });

      // Download
      const blob = new Blob([data.file.content], { type: "text/markdown" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "architecture.md";
      a.click();
      window.URL.revokeObjectURL(url);

      // Redirect to project page
      if (savedProjectId) {
        router.push(`/dashboard/projects/${savedProjectId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Failed to generate", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-base">
      <Navbar />

      <div className="flex-1 pt-32">
        <div className="mx-auto max-w-3xl px-6 pb-32">
          {/* Progress */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl border-2 transition-all ${
                      currentStep >= step
                        ? "border-brand bg-brand text-white"
                        : "border-default bg-surface text-copy-muted"
                    }`}
                  >
                    {currentStep > step ? <Check className="size-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`h-0.5 w-16 md:w-24 ${
                        currentStep > step ? "bg-brand" : "bg-default"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-brand">
                Step {currentStep} of 4: Architecture
              </p>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Tech Stack */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Code2 className="size-6 text-brand" />
                    Tech Stack
                  </h2>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Framework
                    </label>
                    <select
                      value={formData.framework}
                      onChange={(e) =>
                        setFormData({ ...formData, framework: e.target.value })
                      }
                      className="w-full rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                    >
                      <option value="">Select framework</option>
                      {frameworkOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      UI Library
                    </label>
                    <select
                      value={formData.ui}
                      onChange={(e) =>
                        setFormData({ ...formData, ui: e.target.value })
                      }
                      className="w-full rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                    >
                      <option value="">Select UI library</option>
                      {uiOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Database
                    </label>
                    <select
                      value={formData.database}
                      onChange={(e) =>
                        setFormData({ ...formData, database: e.target.value })
                      }
                      className="w-full rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                    >
                      <option value="">Select database</option>
                      {databaseOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Auth Provider
                    </label>
                    <select
                      value={formData.auth}
                      onChange={(e) =>
                        setFormData({ ...formData, auth: e.target.value })
                      }
                      className="w-full rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                    >
                      <option value="">Select auth provider</option>
                      {authOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: System Boundaries */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <FolderTree className="size-6 text-brand" />
                    System Boundaries
                  </h2>

                  {formData.folders.map((folder, index) => (
                    <div key={index} className="rounded-2xl border border-default bg-surface p-5">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={folder.name}
                          onChange={(e) => {
                            const newFolders = [...formData.folders];
                            newFolders[index].name = e.target.value;
                            setFormData({ ...formData, folders: newFolders });
                          }}
                          placeholder="folder/"
                          className="flex-1 rounded-xl border border-default px-4 py-2.5 text-sm font-mono outline-none focus:border-brand"
                        />
                        <button
                          onClick={() => {
                            const newFolders = formData.folders.filter(
                              (_, i) => i !== index
                            );
                            setFormData({ ...formData, folders: newFolders });
                          }}
                          className="rounded-xl border border-default px-3 text-red-400"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={folder.responsibility}
                        onChange={(e) => {
                          const newFolders = [...formData.folders];
                          newFolders[index].responsibility = e.target.value;
                          setFormData({ ...formData, folders: newFolders });
                        }}
                        placeholder="Responsibility"
                        className="w-full rounded-xl border border-default px-4 py-2.5 text-sm outline-none focus:border-brand"
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newFolders = [
                        ...formData.folders,
                        { name: "", responsibility: "" },
                      ];
                      setFormData({ ...formData, folders: newFolders });
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                  >
                    <Plus className="size-4" />
                    Add Folder
                  </button>
                </div>
              )}

              {/* Step 3: Core Entities */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Database className="size-6 text-brand" />
                    Core Entities
                  </h2>

                  {formData.entities.map((entity, index) => (
                    <div key={index} className="rounded-2xl border border-default bg-surface p-5 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={entity.name}
                          onChange={(e) => {
                            const newEntities = [...formData.entities];
                            newEntities[index].name = e.target.value;
                            setFormData({ ...formData, entities: newEntities });
                          }}
                          placeholder="Entity name (e.g. User)"
                          className="flex-1 rounded-xl border border-default px-4 py-2.5 text-sm outline-none focus:border-brand"
                        />
                        <button
                          onClick={() => {
                            const newEntities = formData.entities.filter(
                              (_, i) => i !== index
                            );
                            setFormData({ ...formData, entities: newEntities });
                          }}
                          className="rounded-xl border border-default px-3 text-red-400"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={entity.fields}
                        onChange={(e) => {
                          const newEntities = [...formData.entities];
                          newEntities[index].fields = e.target.value;
                          setFormData({ ...formData, entities: newEntities });
                        }}
                        placeholder="Fields (comma separated)"
                        className="w-full rounded-xl border border-default px-4 py-2.5 text-sm outline-none focus:border-brand"
                      />
                      <input
                        type="text"
                        value={entity.relations}
                        onChange={(e) => {
                          const newEntities = [...formData.entities];
                          newEntities[index].relations = e.target.value;
                          setFormData({ ...formData, entities: newEntities });
                        }}
                        placeholder="Relations (e.g. has many Projects)"
                        className="w-full rounded-xl border border-default px-4 py-2.5 text-sm outline-none focus:border-brand"
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newEntities = [
                        ...formData.entities,
                        { name: "", fields: "", relations: "" },
                      ];
                      setFormData({ ...formData, entities: newEntities });
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                  >
                    <Plus className="size-4" />
                    Add Entity
                  </button>
                </div>
              )}

              {/* Step 4: Generate */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-center">
                    Ready to generate architecture.md!
                  </h2>
                  <div className="rounded-2xl border border-default bg-surface p-6">
                    <h3 className="font-medium">Summary</h3>
                    <div className="mt-4 space-y-2 text-sm text-copy-secondary">
                      <p>Framework: {formData.framework}</p>
                      <p>UI: {formData.ui}</p>
                      <p>Database: {formData.database}</p>
                      <p>Auth: {formData.auth}</p>
                      <p>Folders: {formData.folders.length}</p>
                      <p>Entities: {formData.entities.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-default px-5 py-2.5 text-sm font-medium text-copy-primary disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate"}
                <Sparkles className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}