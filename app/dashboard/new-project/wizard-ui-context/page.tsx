"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Palette,
  Type,
  Radius,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const themeOptions = [
  { name: "Clean", description: "Simple, minimal, lots of whitespace" },
  { name: "Bold", description: "Strong, high-contrast, impactful" },
  { name: "Playful", description: "Fun, colorful, friendly" },
  { name: "Premium", description: "Elegant, sophisticated, refined" },
];

const fontOptions = [
  "Inter",
  "Geist",
  "Poppins",
  "Roboto",
  "System",
  "Custom",
];

export default function WizardUIContextPage() {
  return (
    <Suspense fallback={null}>
      <WizardUIContextContent />
    </Suspense>
  );
}

function WizardUIContextContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get("project_id");

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(
    projectIdFromUrl || null
  );

  const [formData, setFormData] = useState({
    theme: "",
    avoid: "",
    bgColor: "#F7F6F3",
    surfaceColor: "#FFFFFF",
    brandColor: "#3D3B6E",
    errorColor: "#C94C4C",
    successColor: "#3F8F68",
    warningColor: "#C78A2C",
    uiFont: "",
    codeFont: "",
    buttonRadius: "12px",
    cardRadius: "24px",
  });

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.theme !== "";
      case 2:
        return (
          formData.bgColor !== "" &&
          formData.brandColor !== ""
        );
      case 3:
        return formData.uiFont !== "";
      case 4:
        return formData.buttonRadius !== "" && formData.cardRadius !== "";
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
          fileType: "ui-context",
          ...formData,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate");
      }

      toast.success("ui-context.md generated!", {
        description: "File downloaded successfully.",
      });

      // Download
      const blob = new Blob([data.file.content], { type: "text/markdown" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ui-context.md";
      a.click();
      window.URL.revokeObjectURL(url);

      // Redirect
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
              {[1, 2, 3, 4, 5].map((step) => (
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
                  {step < 5 && (
                    <div
                      className={`h-0.5 w-12 md:w-20 ${
                        currentStep > step ? "bg-brand" : "bg-default"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-brand">
                Step {currentStep} of 5: UI Context
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
              {/* Step 1: Theme */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Palette className="size-6 text-brand" />
                    Theme
                  </h2>
                  <div className="grid gap-3">
                    {themeOptions.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => setFormData({ ...formData, theme: theme.name })}
                        className={`rounded-xl border px-5 py-4 text-left transition-all ${
                          formData.theme === theme.name
                            ? "border-brand bg-brand-soft"
                            : "border-default bg-surface hover:border-brand/30"
                        }`}
                      >
                        <p className="text-sm font-medium text-copy-primary">
                          {theme.name}
                        </p>
                        <p className="mt-1 text-xs text-copy-secondary">
                          {theme.description}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      What to avoid
                    </label>
                    <input
                      type="text"
                      value={formData.avoid}
                      onChange={(e) => setFormData({ ...formData, avoid: e.target.value })}
                      placeholder="e.g. Avoid excessive gradients, neon colors"
                      className="w-full rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Colors */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Colors</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { label: "Background", key: "bgColor" },
                      { label: "Surface", key: "surfaceColor" },
                      { label: "Brand", key: "brandColor" },
                      { label: "Error", key: "errorColor" },
                      { label: "Success", key: "successColor" },
                      { label: "Warning", key: "warningColor" },
                    ].map((color) => (
                      <div key={color.key}>
                        <label className="mb-2 block text-sm font-medium">
                          {color.label}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={formData[color.key as keyof typeof formData]}
                            onChange={(e) =>
                              setFormData({ ...formData, [color.key]: e.target.value })
                            }
                            className="h-11 w-14 cursor-pointer rounded-lg border border-default"
                          />
                          <input
                            type="text"
                            value={formData[color.key as keyof typeof formData]}
                            onChange={(e) =>
                              setFormData({ ...formData, [color.key]: e.target.value })
                            }
                            className="flex-1 rounded-xl border border-default bg-surface px-4 py-2.5 text-sm font-mono outline-none focus:border-brand"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Typography */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Type className="size-6 text-brand" />
                    Typography
                  </h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      UI Font
                    </label>
                    <select
                      value={formData.uiFont}
                      onChange={(e) => setFormData({ ...formData, uiFont: e.target.value })}
                      className="w-full rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                    >
                      <option value="">Select UI font</option>
                      {fontOptions.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Code Font
                    </label>
                    <select
                      value={formData.codeFont}
                      onChange={(e) => setFormData({ ...formData, codeFont: e.target.value })}
                      className="w-full rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                    >
                      <option value="">Select code font</option>
                      {fontOptions.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 4: Border Radius */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Radius className="size-6 text-brand" />
                    Border Radius
                  </h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Buttons
                    </label>
                    <select
                      value={formData.buttonRadius}
                      onChange={(e) => setFormData({ ...formData, buttonRadius: e.target.value })}
                      className="w-full rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                    >
                      <option value="8px">8px - Small</option>
                      <option value="12px">12px - Medium</option>
                      <option value="16px">16px - Large</option>
                      <option value="20px">20px - Extra Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Cards
                    </label>
                    <select
                      value={formData.cardRadius}
                      onChange={(e) => setFormData({ ...formData, cardRadius: e.target.value })}
                      className="w-full rounded-xl border border-default bg-surface px-5 py-3.5 text-sm outline-none focus:border-brand"
                    >
                      <option value="16px">16px - Small</option>
                      <option value="24px">24px - Medium</option>
                      <option value="32px">32px - Large</option>
                      <option value="40px">40px - Extra Large</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 5: Generate */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-center">
                    Ready to generate ui-context.md!
                  </h2>
                  <div className="rounded-2xl border border-default bg-surface p-6">
                    <h3 className="font-medium">Summary</h3>
                    <div className="mt-4 space-y-2 text-sm text-copy-secondary">
                      <p>Theme: {formData.theme}</p>
                      <p>Background: {formData.bgColor}</p>
                      <p>Brand: {formData.brandColor}</p>
                      <p>UI Font: {formData.uiFont}</p>
                      <p>Button Radius: {formData.buttonRadius}</p>
                      <p>Card Radius: {formData.cardRadius}</p>
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

            {currentStep < 5 ? (
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