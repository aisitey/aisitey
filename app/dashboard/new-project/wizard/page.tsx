"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FolderTree,
  FileText,
  Target,
  Sparkles,
  Plus,
  X,
  Code2,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

const steps = [
  {
    id: 1,
    title: "Project Overview",
    file: "project-overview.md",
    icon: <FolderTree className="size-5" />,
  },
  {
    id: 2,
    title: "Architecture",
    file: "architecture.md",
    icon: <Code2 className="size-5" />,
  },
  {
    id: 3,
    title: "UI Context",
    file: "ui-context.md",
    icon: <Palette className="size-5" />,
  },
  {
    id: 4,
    title: "Code Standards",
    file: "code-standards.md",
    icon: <FileText className="size-5" />,
  },
  {
    id: 5,
    title: "AI Workflow",
    file: "ai-workflow-rules.md",
    icon: <Sparkles className="size-5" />,
  },
  {
    id: 6,
    title: "Memory",
    file: "memory.md",
    icon: <Target className="size-5" />,
  },
  {
    id: 7,
    title: "Progress Tracker",
    file: "progress-tracker.md",
    icon: <Check className="size-5" />,
  },
];

export default function WizardPage() {
  return (
    <Suspense fallback={null}>
      <WizardContent />
    </Suspense>
  );
}

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepFromUrl = searchParams.get("step");
  const projectIdFromUrl = searchParams.get("project_id");

  const [currentStep, setCurrentStep] = useState(1);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [completedFiles, setCompletedFiles] = useState<string[]>([]);
  const [generatedFile, setGeneratedFile] = useState<{ name: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    overview: "",
    goals: [""],
    coreFlow: [""],
    features: [{ category: "", items: [""] }],
    inScope: [""],
    outScope: [""],
    successCriteria: [""],
  });

  // Load everything
  useEffect(() => {
    const savedStep = localStorage.getItem("aisitey-wizard-step");
    const savedData = localStorage.getItem("aisitey-wizard-data");
    const savedProjectIdFromStorage = localStorage.getItem("aisitey-wizard-project-id");
    const savedCompletedFiles = localStorage.getItem("aisitey-wizard-completed-files");

    if (stepFromUrl) {
      setCurrentStep(parseInt(stepFromUrl));
    } else if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }

    if (projectIdFromUrl) {
      setSavedProjectId(projectIdFromUrl);
    } else if (savedProjectIdFromStorage) {
      setSavedProjectId(savedProjectIdFromStorage);
    }

    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error("Failed to parse saved data:", error);
      }
    }

    if (savedCompletedFiles) {
      try {
        setCompletedFiles(JSON.parse(savedCompletedFiles));
      } catch (error) {
        console.error("Failed to parse completed files:", error);
      }
    }

    setIsLoaded(true);
  }, [stepFromUrl, projectIdFromUrl]);

  // Save step
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("aisitey-wizard-step", currentStep.toString());
  }, [currentStep, isLoaded]);

  // Save formData
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("aisitey-wizard-data", JSON.stringify(formData));
  }, [formData, isLoaded]);

  // Save project id
  useEffect(() => {
    if (!isLoaded) return;
    if (savedProjectId) {
      localStorage.setItem("aisitey-wizard-project-id", savedProjectId);
    }
  }, [savedProjectId, isLoaded]);

  // Save completed files
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("aisitey-wizard-completed-files", JSON.stringify(completedFiles));
  }, [completedFiles, isLoaded]);

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== "" && formData.overview.trim() !== "";
      case 2:
        return (
          formData.goals.some((g) => g.trim() !== "") &&
          formData.coreFlow.some((c) => c.trim() !== "")
        );
      case 3:
        return formData.features.some(
          (f) => f.category.trim() !== "" && f.items.some((i) => i.trim() !== "")
        );
      case 4:
        return (
          formData.inScope.some((s) => s.trim() !== "") &&
          formData.outScope.some((s) => s.trim() !== "") &&
          formData.successCriteria.some((s) => s.trim() !== "")
        );
      default:
        return false;
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      const fileType = steps[currentStep - 1].file.replace(".md", "");

      const response = await fetch("/api/generate-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fileType,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate");
      }

      // نحفظ الملف المتولد
      setGeneratedFile(data.file);

      // Save project
      let projectId = savedProjectId;

      if (!projectId) {
        const saveResponse = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            description: formData.overview,
            tech_stack: "Custom",
          }),
        });

        const saveData = await saveResponse.json();

        if (saveResponse.ok && saveData.project) {
          projectId = saveData.project.id;
          setSavedProjectId(projectId);
        }
      }

      // Save progress
      if (projectId) {
        const newCompletedFiles = [...completedFiles, data.file.name];
        setCompletedFiles(newCompletedFiles);

        await fetch("/api/wizard-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            current_step: currentStep + 1,
            completed_files: newCompletedFiles,
          }),
        });
      }

      // Download
      const blob = new Blob([data.file.content], { type: "text/markdown" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.file.name;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`${data.file.name} generated!`, {
        description: "File downloaded successfully.",
      });
    } catch (error) {
      toast.error("Failed to generate", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextWizard = () => {
    setGeneratedFile(null);
    
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      // كل الملفات خلصت
      toast.success("All files generated!", {
        description: "Your complete context is ready.",
      });
      
      if (savedProjectId) {
        router.push(`/dashboard/projects/${savedProjectId}`);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-base">
      <Navbar />

      <div className="flex-1 pt-32">
        <div className="mx-auto max-w-3xl px-6 pb-32">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl border-2 transition-all ${
                      currentStep >= step.id
                        ? "border-brand bg-brand text-white"
                        : "border-default bg-surface text-copy-muted"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="size-4" /> : step.icon}
                  </div>
                  {step.id < steps.length && (
                    <div
                      className={`h-0.5 w-6 md:w-10 ${
                        currentStep > step.id ? "bg-brand" : "bg-default"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-brand">
                Wizard {currentStep} of {steps.length}: {steps[currentStep - 1].title}
              </p>
              <p className="mt-1 text-xs text-copy-muted">
                {steps[currentStep - 1].file}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Project Overview */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Project Overview</h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Project Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="[Project Name]"
                      className="w-full rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Overview</label>
                    <textarea
                      value={formData.overview}
                      onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                      placeholder="Write your project overview to describing what this application does, who it's for, and what problem it solves."
                      rows={5}
                      className="w-full resize-none rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Goals & Flow */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Goals</h2>
                  {formData.goals.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => {
                          const newGoals = [...formData.goals];
                          newGoals[index] = e.target.value;
                          setFormData({ ...formData, goals: newGoals });
                        }}
                        placeholder={`Goal ${index + 1}`}
                        className="flex-1 rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                      />
                      {formData.goals.length > 1 && (
                        <button
                          onClick={() => {
                            const newGoals = formData.goals.filter((_, i) => i !== index);
                            setFormData({ ...formData, goals: newGoals });
                          }}
                          className="rounded-xl border border-default px-4 text-red-400"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newGoals = [...formData.goals, ""];
                      setFormData({ ...formData, goals: newGoals });
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                  >
                    <Plus className="size-4" />
                    Add Goal
                  </button>

                  <h2 className="text-2xl font-semibold mt-8">Core User Flow</h2>
                  {formData.coreFlow.map((step, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const newFlow = [...formData.coreFlow];
                          newFlow[index] = e.target.value;
                          setFormData({ ...formData, coreFlow: newFlow });
                        }}
                        placeholder={`Step ${index + 1}`}
                        className="flex-1 rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                      />
                      {formData.coreFlow.length > 1 && (
                        <button
                          onClick={() => {
                            const newFlow = formData.coreFlow.filter((_, i) => i !== index);
                            setFormData({ ...formData, coreFlow: newFlow });
                          }}
                          className="rounded-xl border border-default px-4 text-red-400"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newFlow = [...formData.coreFlow, ""];
                      setFormData({ ...formData, coreFlow: newFlow });
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                  >
                    <Plus className="size-4" />
                    Add Step
                  </button>
                </div>
              )}

              {/* Step 3: Features */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Features</h2>
                  {formData.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="rounded-2xl border border-default bg-surface p-5">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={feature.category}
                          onChange={(e) => {
                            const newFeatures = [...formData.features];
                            newFeatures[featureIndex].category = e.target.value;
                            setFormData({ ...formData, features: newFeatures });
                          }}
                          placeholder="Feature Category"
                          className="flex-1 rounded-xl border border-default px-4 py-2.5 text-sm outline-none focus:border-brand"
                        />
                        <button
                          onClick={() => {
                            const newFeatures = formData.features.filter((_, i) => i !== featureIndex);
                            setFormData({ ...formData, features: newFeatures });
                          }}
                          className="rounded-xl border border-default px-3 text-red-400"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      {feature.items.map((item, itemIndex) => (
                        <input
                          key={itemIndex}
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newFeatures = [...formData.features];
                            newFeatures[featureIndex].items[itemIndex] = e.target.value;
                            setFormData({ ...formData, features: newFeatures });
                          }}
                          placeholder={`Feature description ${itemIndex + 1}`}
                          className="w-full rounded-xl border border-default px-4 py-2.5 text-sm outline-none focus:border-brand mb-2"
                        />
                      ))}
                      <button
                        onClick={() => {
                          const newFeatures = [...formData.features];
                          newFeatures[featureIndex].items.push("");
                          setFormData({ ...formData, features: newFeatures });
                        }}
                        className="inline-flex items-center gap-2 text-xs font-medium text-brand"
                      >
                        <Plus className="size-3.5" />
                        Add Feature
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newFeatures = [...formData.features, { category: "", items: [""] }];
                      setFormData({ ...formData, features: newFeatures });
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                  >
                    <Plus className="size-4" />
                    Add Category
                  </button>
                </div>
              )}

              {/* Step 4: Scope */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">In Scope</h2>
                  {formData.inScope.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...formData.inScope];
                          newItems[index] = e.target.value;
                          setFormData({ ...formData, inScope: newItems });
                        }}
                        placeholder="What you are building"
                        className="flex-1 rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                      />
                      {formData.inScope.length > 1 && (
                        <button
                          onClick={() => {
                            const newItems = formData.inScope.filter((_, i) => i !== index);
                            setFormData({ ...formData, inScope: newItems });
                          }}
                          className="rounded-xl border border-default px-4 text-red-400"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newItems = [...formData.inScope, ""];
                      setFormData({ ...formData, inScope: newItems });
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                  >
                    <Plus className="size-4" />
                    Add In Scope
                  </button>

                  <h2 className="text-2xl font-semibold mt-8">Out of Scope</h2>
                  {formData.outScope.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...formData.outScope];
                          newItems[index] = e.target.value;
                          setFormData({ ...formData, outScope: newItems });
                        }}
                        placeholder="What you are not building"
                        className="flex-1 rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                      />
                      {formData.outScope.length > 1 && (
                        <button
                          onClick={() => {
                            const newItems = formData.outScope.filter((_, i) => i !== index);
                            setFormData({ ...formData, outScope: newItems });
                          }}
                          className="rounded-xl border border-default px-4 text-red-400"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newItems = [...formData.outScope, ""];
                      setFormData({ ...formData, outScope: newItems });
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                  >
                    <Plus className="size-4" />
                    Add Out of Scope
                  </button>

                  <h2 className="text-2xl font-semibold mt-8">Success Criteria</h2>
                  {formData.successCriteria.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...formData.successCriteria];
                          newItems[index] = e.target.value;
                          setFormData({ ...formData, successCriteria: newItems });
                        }}
                        placeholder={`Condition ${index + 1}`}
                        className="flex-1 rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                      />
                      {formData.successCriteria.length > 1 && (
                        <button
                          onClick={() => {
                            const newItems = formData.successCriteria.filter((_, i) => i !== index);
                            setFormData({ ...formData, successCriteria: newItems });
                          }}
                          className="rounded-xl border border-default px-4 text-red-400"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newItems = [...formData.successCriteria, ""];
                      setFormData({ ...formData, successCriteria: newItems });
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                  >
                    <Plus className="size-4" />
                    Add Criterion
                  </button>
                </div>
              )}

              {/* Steps 5-7: Placeholders */}
              {currentStep >= 5 && currentStep <= 7 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-center">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-center text-copy-secondary">
                    This wizard will be available soon.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-default px-5 py-2.5 text-sm font-medium text-copy-primary disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            {currentStep < 5 ? (
              currentStep === 4 ? (
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                >
                  {isLoading ? "Generating..." : "Generate"}
                  <Sparkles className="size-4" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!isStepValid()}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="size-4" />
                </button>
              )
            ) : generatedFile ? (
              <button
                onClick={handleNextWizard}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Next Wizard
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