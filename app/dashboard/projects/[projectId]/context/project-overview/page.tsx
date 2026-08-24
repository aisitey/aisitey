"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Sparkles, Save, Download, Loader2 } from "lucide-react";

type FeatureGroup = {
  category: string;
  items: string[];
};

type ProjectOverviewDocument = {
  id: string;
  project_id: string;
  file_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function ProjectOverviewPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  const [name, setName] = useState("");
  const [overview, setOverview] = useState("");
  const [goals, setGoals] = useState<string[]>([""]);
  const [coreFlow, setCoreFlow] = useState<string[]>([""]);

  const [features, setFeatures] = useState<FeatureGroup[]>([
    {
      category: "",
      items: [""],
    },
  ]);

  const [inScope, setInScope] = useState<string[]>([""]);
  const [outScope, setOutScope] = useState<string[]>([""]);
  const [successCriteria, setSuccessCriteria] = useState<string[]>([""]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);

  /*
   * Parse project-overview.md back into the form.
   */
  const parseMarkdown = (content: string) => {
    const lines = content.split("\n");

    const getSection = (heading: string) => {
      const startIndex = lines.findIndex((line) => line.trim() === heading);

      if (startIndex === -1) return [];

      const result: string[] = [];

      for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("## ")) {
          break;
        }

        result.push(line);
      }

      return result;
    };

    const cleanSectionLines = (sectionLines: string[]) =>
      sectionLines
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => line !== "Not specified");

    const projectName = getSection("## Project Name").join(" ").trim();

    const projectOverview = getSection("## Overview").join("\n").trim();

    const goalLines = cleanSectionLines(getSection("## Goals")).map((line) =>
      line.replace(/^-\s*/, "").trim(),
    );

    const flowLines = cleanSectionLines(getSection("## Core User Flow")).map(
      (line) => line.replace(/^\d+\.\s*/, "").trim(),
    );

    const inScopeLines = cleanSectionLines(getSection("## In Scope")).map(
      (line) => line.replace(/^-\s*/, "").trim(),
    );

    const outScopeLines = cleanSectionLines(getSection("## Out of Scope")).map(
      (line) => line.replace(/^-\s*/, "").trim(),
    );

    const successLines = cleanSectionLines(
      getSection("## Success Criteria"),
    ).map((line) => line.replace(/^-\s*/, "").trim());

    /*
     * Features need special handling because they contain
     * ### category headings.
     */
    const featuresSection = getSection("## Features");

    const parsedFeatures: FeatureGroup[] = [];
    let currentFeature: FeatureGroup | null = null;

    for (const rawLine of featuresSection) {
      const line = rawLine.trim();

      if (!line || line === "Not specified") {
        continue;
      }

      if (line.startsWith("### ")) {
        if (currentFeature) {
          parsedFeatures.push(currentFeature);
        }

        currentFeature = {
          category: line.replace(/^###\s*/, "").trim(),
          items: [],
        };

        continue;
      }

      if (line.startsWith("- ") && currentFeature) {
        currentFeature.items.push(line.replace(/^-\s*/, "").trim());
      }
    }

    if (currentFeature) {
      parsedFeatures.push(currentFeature);
    }

    setName(projectName);
    setOverview(projectOverview);

    setGoals(goalLines.length > 0 ? goalLines : [""]);

    setCoreFlow(flowLines.length > 0 ? flowLines : [""]);

    setFeatures(
      parsedFeatures.length > 0
        ? parsedFeatures
        : [
            {
              category: "",
              items: [""],
            },
          ],
    );

    setInScope(inScopeLines.length > 0 ? inScopeLines : [""]);

    setOutScope(outScopeLines.length > 0 ? outScopeLines : [""]);

    setSuccessCriteria(successLines.length > 0 ? successLines : [""]);
  };

  /*
   * Load existing project-overview.md.
   */
  useEffect(() => {
    if (!projectId) return;

    const loadDocument = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/projects/${projectId}/context/project-overview`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load project overview");
        }

        const document = data.document as ProjectOverviewDocument | null;

        if (document?.content) {
          setHasDocument(true);
          parseMarkdown(document.content);
        }
      } catch (error) {
        console.error("Load project overview error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [projectId]);

  const updateListItem = (
    list: string[],
    setList: (value: string[]) => void,
    index: number,
    value: string,
  ) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addListItem = (list: string[], setList: (value: string[]) => void) => {
    setList([...list, ""]);
  };

  const removeListItem = (
    list: string[],
    setList: (value: string[]) => void,
    index: number,
  ) => {
    if (list.length === 1) {
      setList([""]);
      return;
    }

    setList(list.filter((_, itemIndex) => itemIndex !== index));
  };

  const addFeatureGroup = () => {
    setFeatures([
      ...features,
      {
        category: "",
        items: [""],
      },
    ]);
  };

  const removeFeatureGroup = (featureIndex: number) => {
    if (features.length === 1) {
      setFeatures([
        {
          category: "",
          items: [""],
        },
      ]);
      return;
    }

    setFeatures(features.filter((_, index) => index !== featureIndex));
  };

  const updateFeatureCategory = (featureIndex: number, value: string) => {
    const updated = [...features];

    updated[featureIndex] = {
      ...updated[featureIndex],
      category: value,
    };

    setFeatures(updated);
  };

  const updateFeatureItem = (
    featureIndex: number,
    itemIndex: number,
    value: string,
  ) => {
    const updated = [...features];
    const items = [...updated[featureIndex].items];

    items[itemIndex] = value;

    updated[featureIndex] = {
      ...updated[featureIndex],
      items,
    };

    setFeatures(updated);
  };

  const addFeatureItem = (featureIndex: number) => {
    const updated = [...features];

    updated[featureIndex] = {
      ...updated[featureIndex],
      items: [...updated[featureIndex].items, ""],
    };

    setFeatures(updated);
  };

  const removeFeatureItem = (featureIndex: number, itemIndex: number) => {
    const updated = [...features];
    const items = updated[featureIndex].items;

    if (items.length === 1) {
      updated[featureIndex] = {
        ...updated[featureIndex],
        items: [""],
      };
    } else {
      updated[featureIndex] = {
        ...updated[featureIndex],
        items: items.filter((_, index) => index !== itemIndex),
      };
    }

    setFeatures(updated);
  };

  const canSave =
    name.trim() !== "" &&
    overview.trim() !== "" &&
    goals.some((item) => item.trim() !== "") &&
    coreFlow.some((item) => item.trim() !== "");

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);

    try {
      const answers = {
        name: name.trim(),

        overview: overview.trim(),

        goals: goals.map((item) => item.trim()).filter(Boolean),

        coreFlow: coreFlow.map((item) => item.trim()).filter(Boolean),

        features: features
          .map((feature) => ({
            category: feature.category.trim(),

            items: feature.items.map((item) => item.trim()).filter(Boolean),
          }))
          .filter(
            (feature) => feature.category !== "" || feature.items.length > 0,
          ),

        inScope: inScope.map((item) => item.trim()).filter(Boolean),

        outScope: outScope.map((item) => item.trim()).filter(Boolean),

        successCriteria: successCriteria
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = await fetch(
        `/api/projects/${projectId}/context/project-overview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save project-overview.md");
      }

      setHasDocument(true);
    } catch (error) {
      console.error("Save project overview error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const content = `# Project Overview

## Project Name

${name.trim()}

## Overview

${overview.trim()}

## Goals

${
  goals
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n") || "Not specified"
}

## Core User Flow

${
  coreFlow
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n") || "Not specified"
}

## Features

${
  features
    .map((feature) => {
      const category = feature.category.trim();

      const items = feature.items.map((item) => item.trim()).filter(Boolean);

      if (!category && items.length === 0) {
        return "";
      }

      return `### ${category || "General"}

${items.map((item) => `- ${item}`).join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n") || "Not specified"
}

## In Scope

${
  inScope
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n") || "Not specified"
}

## Out of Scope

${
  outScope
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n") || "Not specified"
}

## Success Criteria

${
  successCriteria
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n") || "Not specified"
}
`;

    const blob = new Blob([content], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "project-overview.md";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm text-copy-muted">Loading project overview...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/projects/${projectId}`)}
          className="inline-flex items-center gap-2 text-sm text-copy-muted transition hover:text-copy-primary"
        >
          <ArrowLeft className="size-4" />
          Back to Project
        </button>

        <div className="mt-8">
          <p className="font-mono text-xs text-brand">project-overview.md</p>

          <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
            Project Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-copy-muted">
            Define what the project is, what it should accomplish, and what is
            inside or outside its scope.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold text-copy-primary">
              Basic Information
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Project Name
                </label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="My SaaS Application"
                  className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Overview
                </label>

                <textarea
                  value={overview}
                  onChange={(event) => setOverview(event.target.value)}
                  rows={6}
                  placeholder="Describe what the application does, who it is for, and the problem it solves."
                  className="w-full resize-none rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>
          </section>

          <ListSection
            title="Goals"
            description="What should this project accomplish?"
            items={goals}
            placeholder="Define a project goal"
            onAdd={() => addListItem(goals, setGoals)}
            onRemove={(index) => removeListItem(goals, setGoals, index)}
            update={(index, value) =>
              updateListItem(goals, setGoals, index, value)
            }
            addLabel="Add Goal"
          />

          <ListSection
            title="Core User Flow"
            description="Describe the main user journey step by step."
            items={coreFlow}
            placeholder="User opens the application..."
            onAdd={() => addListItem(coreFlow, setCoreFlow)}
            onRemove={(index) => removeListItem(coreFlow, setCoreFlow, index)}
            update={(index, value) =>
              updateListItem(coreFlow, setCoreFlow, index, value)
            }
            addLabel="Add Step"
          />

          <section className="rounded-2xl border border-default bg-surface p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-copy-primary">
                  Features
                </h2>

                <p className="mt-1 text-sm text-copy-muted">
                  Organize features by category.
                </p>
              </div>

              <button
                type="button"
                onClick={addFeatureGroup}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand"
              >
                <Plus className="size-4" />
                Add Category
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {features.map((feature, featureIndex) => (
                <div
                  key={featureIndex}
                  className="rounded-xl border border-default p-4"
                >
                  <div className="flex gap-2">
                    <input
                      value={feature.category}
                      onChange={(event) =>
                        updateFeatureCategory(featureIndex, event.target.value)
                      }
                      placeholder="Feature Category"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                    />

                    <button
                      type="button"
                      onClick={() => removeFeatureGroup(featureIndex)}
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-2">
                        <input
                          value={item}
                          onChange={(event) =>
                            updateFeatureItem(
                              featureIndex,
                              itemIndex,
                              event.target.value,
                            )
                          }
                          placeholder="Feature description"
                          className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeFeatureItem(featureIndex, itemIndex)
                          }
                          className="rounded-xl border border-default px-3 text-red-400"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addFeatureItem(featureIndex)}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-brand"
                  >
                    <Plus className="size-3.5" />
                    Add Feature
                  </button>
                </div>
              ))}
            </div>
          </section>

          <ListSection
            title="In Scope"
            description="What are you building in this project?"
            items={inScope}
            placeholder="Authentication and user management"
            onAdd={() => addListItem(inScope, setInScope)}
            onRemove={(index) => removeListItem(inScope, setInScope, index)}
            update={(index, value) =>
              updateListItem(inScope, setInScope, index, value)
            }
            addLabel="Add Item"
          />

          <ListSection
            title="Out of Scope"
            description="What are you explicitly not building?"
            items={outScope}
            placeholder="Native mobile applications"
            onAdd={() => addListItem(outScope, setOutScope)}
            onRemove={(index) => removeListItem(outScope, setOutScope, index)}
            update={(index, value) =>
              updateListItem(outScope, setOutScope, index, value)
            }
            addLabel="Add Item"
          />

          <ListSection
            title="Success Criteria"
            description="How will you know the project is successful?"
            items={successCriteria}
            placeholder="Users can complete the main workflow successfully"
            onAdd={() => addListItem(successCriteria, setSuccessCriteria)}
            onRemove={(index) =>
              removeListItem(successCriteria, setSuccessCriteria, index)
            }
            update={(index, value) =>
              updateListItem(successCriteria, setSuccessCriteria, index, value)
            }
            addLabel="Add Criterion"
          />

          <section className="sticky bottom-6 rounded-2xl border border-default bg-surface/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-copy-primary">
                  project-overview.md
                </p>

                <p className="mt-1 text-xs text-copy-muted">
                  {hasDocument
                    ? "Edit the context file and save your changes."
                    : "Generate the project context file."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-xl border border-default px-4 py-2.5 text-sm font-medium text-copy-primary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download className="size-4" />
                  Download
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
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
          </section>
        </div>
      </div>
    </main>
  );
}

type ListSectionProps = {
  title: string;
  description: string;
  items: string[];
  placeholder: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  update: (index: number, value: string) => void;
  addLabel: string;
};

function ListSection({
  title,
  description,
  items,
  placeholder,
  onAdd,
  onRemove,
  update,
  addLabel,
}: ListSectionProps) {
  return (
    <section className="rounded-2xl border border-default bg-surface p-6">
      <div>
        <h2 className="text-lg font-semibold text-copy-primary">{title}</h2>

        <p className="mt-1 text-sm text-copy-muted">{description}</p>
      </div>

      <div className="mt-6 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={item}
              onChange={(event) => update(index, event.target.value)}
              placeholder={`${placeholder}${
                items.length > 1 ? ` ${index + 1}` : ""
              }`}
              className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded-xl border border-default px-3 text-red-400 transition hover:border-red-400"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
      >
        <Plus className="size-4" />
        {addLabel}
      </button>
    </section>
  );
}
