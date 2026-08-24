"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Download, Save } from "lucide-react";

type MemoryDocument = {
  id: string;
  project_id: string;
  file_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type Principle = {
  name: string;
  description: string;
};

type TechnologyDecision = {
  technology: string;
  reason: string;
};

type DomainDecision = {
  entity: string;
  description: string;
};

type ImplementationDecision = {
  title: string;
  decision: string;
  reason: string;
  impact: string;
};

export default function MemoryPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  const [projectName, setProjectName] = useState("");
  const [productType, setProductType] = useState("");
  const [primaryUsers, setPrimaryUsers] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");

  const [principles, setPrinciples] = useState<Principle[]>([
    { name: "", description: "" },
  ]);

  const [technologyDecisions, setTechnologyDecisions] = useState<
    TechnologyDecision[]
  >([{ technology: "", reason: "" }]);

  const [domainDecisions, setDomainDecisions] = useState<DomainDecision[]>([
    { entity: "", description: "" },
  ]);

  const [ownershipRules, setOwnershipRules] = useState<string[]>([""]);
  const [architectureBoundaries, setArchitectureBoundaries] = useState<string[]>([""]);
  const [uiDecisions, setUiDecisions] = useState<string[]>([""]);

  const [implementationDecisions, setImplementationDecisions] = useState<
    ImplementationDecision[]
  >([{ title: "", decision: "", reason: "", impact: "" }]);

  const [knownConstraints, setKnownConstraints] = useState<string[]>([""]);
  const [futureConsiderations, setFutureConsiderations] = useState<string[]>([""]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);

  const canSave = true;

  const parseMarkdown = (content: string) => {
    const lines = content.split("\n");

    const getSection = (heading: string) => {
      const startIndex = lines.findIndex((line) => line.trim() === heading);
      if (startIndex === -1) return [];
      const result: string[] = [];
      for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("## ")) break;
        result.push(line);
      }
      return result;
    };

    const cleanBullets = (sectionLines: string[]) =>
      sectionLines
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => line.startsWith("- "))
        .map((line) => line.replace(/^-\s*/, "").trim());

    const identitySection = getSection("## Project Identity");
    const identityLines = cleanBullets(identitySection);

    for (const line of identityLines) {
      if (line.includes("Project name:")) {
        setProjectName(line.replace("Project name:", "").trim());
      } else if (line.includes("Product type:")) {
        setProductType(line.replace("Product type:", "").trim());
      } else if (line.includes("Primary users:")) {
        setPrimaryUsers(line.replace("Primary users:", "").trim());
      } else if (line.includes("Primary goal:")) {
        setPrimaryGoal(line.replace("Primary goal:", "").trim());
      }
    }

    const principlesSection = getSection("## Product Principles");
    const parsedPrinciples: Principle[] = [];
    let currentPrinciple: Principle | null = null;

    for (const rawLine of principlesSection) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("### ")) {
        if (currentPrinciple) {
          parsedPrinciples.push(currentPrinciple);
        }
        currentPrinciple = {
          name: line.replace(/^###\s*/, "").trim(),
          description: "",
        };
        continue;
      }

      if (currentPrinciple && !line.startsWith("## ")) {
        currentPrinciple.description = line;
      }
    }

    if (currentPrinciple) {
      parsedPrinciples.push(currentPrinciple);
    }

    if (parsedPrinciples.length > 0) setPrinciples(parsedPrinciples);

    const techSection = getSection("## Technology Decisions");
    const parsedTech: TechnologyDecision[] = [];
    let currentTech: TechnologyDecision | null = null;

    for (const rawLine of techSection) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("### ")) {
        if (currentTech) {
          parsedTech.push(currentTech);
        }
        currentTech = {
          technology: line.replace(/^###\s*/, "").trim(),
          reason: "",
        };
        continue;
      }

      if (currentTech && !line.startsWith("## ")) {
        currentTech.reason = line;
      }
    }

    if (currentTech) {
      parsedTech.push(currentTech);
    }

    if (parsedTech.length > 0) setTechnologyDecisions(parsedTech);

    const domainSection = getSection("## Domain Decisions");
    const parsedDomain: DomainDecision[] = [];
    let currentDomain: DomainDecision | null = null;

    for (const rawLine of domainSection) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("### ")) {
        if (currentDomain) {
          parsedDomain.push(currentDomain);
        }
        currentDomain = {
          entity: line.replace(/^###\s*/, "").trim(),
          description: "",
        };
        continue;
      }

      if (currentDomain && !line.startsWith("## ") && !line.includes("Full definition:") && !line.includes("Status values:")) {
        currentDomain.description = line;
      }
    }

    if (currentDomain) {
      parsedDomain.push(currentDomain);
    }

    if (parsedDomain.length > 0) setDomainDecisions(parsedDomain);

    const ownershipSection = getSection("## Ownership and Access");
    const ownershipClean = cleanBullets(ownershipSection);
    if (ownershipClean.length > 0) setOwnershipRules(ownershipClean);

    const boundariesSection = getSection("## Architecture Boundaries");
    const boundariesClean = cleanBullets(boundariesSection);
    if (boundariesClean.length > 0) setArchitectureBoundaries(boundariesClean);

    const uiSection = getSection("## UI Decisions");
    const uiClean = cleanBullets(uiSection);
    if (uiClean.length > 0) setUiDecisions(uiClean);

    const implSection = getSection("## Important Implementation Decisions");
    const parsedImpl: ImplementationDecision[] = [];
    let currentImpl: ImplementationDecision | null = null;
    let implMode: "none" | "decision" | "reason" | "impact" = "none";

    for (const rawLine of implSection) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("### ")) {
        if (currentImpl) {
          parsedImpl.push(currentImpl);
        }
        currentImpl = {
          title: line.replace(/^###\s*/, "").trim(),
          decision: "",
          reason: "",
          impact: "",
        };
        implMode = "none";
        continue;
      }

      if (line === "**Decision**") {
        implMode = "decision";
        continue;
      }

      if (line === "**Reason**") {
        implMode = "reason";
        continue;
      }

      if (line === "**Impact**") {
        implMode = "impact";
        continue;
      }

      if (currentImpl) {
        if (implMode === "decision") currentImpl.decision = line;
        if (implMode === "reason") currentImpl.reason = line;
        if (implMode === "impact") currentImpl.impact = line;
      }
    }

    if (currentImpl) {
      parsedImpl.push(currentImpl);
    }

    if (parsedImpl.length > 0) setImplementationDecisions(parsedImpl);

    const constraintsSection = getSection("## Known Constraints");
    const constraintsClean = cleanBullets(constraintsSection);
    if (constraintsClean.length > 0) setKnownConstraints(constraintsClean);

    const futureSection = getSection("## Future Considerations");
    const futureClean = cleanBullets(futureSection);
    if (futureClean.length > 0) setFutureConsiderations(futureClean);
  };

  useEffect(() => {
    if (!projectId) return;

    const loadDocument = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/projects/${projectId}/context/memory`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load memory");
        }

        const document = data.document as MemoryDocument | null;

        if (document?.content) {
          setHasDocument(true);
          parseMarkdown(document.content);
        }
      } catch (error) {
        console.error("Load memory error:", error);
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

  const buildMarkdown = () => {
    const clean = (value: string) => value.trim();

    const list = (items: string[]) =>
      items
        .map(clean)
        .filter(Boolean)
        .map((item) => `- ${item}`)
        .join("\n") || "Not specified";

    return `# Project Memory

This file contains important project decisions, conventions, and
implementation knowledge that should remain consistent across development
sessions.

---

## Project Identity

- Project name: ${clean(projectName) || "Not specified"}
- Product type: ${clean(productType) || "Not specified"}
- Primary users: ${clean(primaryUsers) || "Not specified"}
- Primary goal: ${clean(primaryGoal) || "Not specified"}

---

## Product Principles

${principles
  .filter((p) => p.name.trim() || p.description.trim())
  .map(
    (p) => `### ${clean(p.name) || "Principle"}

${clean(p.description) || "Not specified"}`,
  )
  .join("\n\n") || "Not specified"}

---

## Technology Decisions

${technologyDecisions
  .filter((t) => t.technology.trim() || t.reason.trim())
  .map(
    (t) => `### ${clean(t.technology) || "Technology"}

${clean(t.reason) || "Not specified"}`,
  )
  .join("\n\n") || "Not specified"}

---

## Domain Decisions

${domainDecisions
  .filter((d) => d.entity.trim() || d.description.trim())
  .map(
    (d) => `### ${clean(d.entity) || "Entity"}

${clean(d.description) || "Not specified"}`,
  )
  .join("\n\n") || "Not specified"}

---

## Ownership and Access

${list(ownershipRules)}

---

## Architecture Boundaries

${list(architectureBoundaries)}

---

## UI Decisions

${list(uiDecisions)}

---

## Important Implementation Decisions

${implementationDecisions
  .filter((d) => d.title.trim() || d.decision.trim())
  .map(
    (d) => `### ${clean(d.title) || "Decision"}

**Decision**

${clean(d.decision) || "Not specified"}

**Reason**

${clean(d.reason) || "Not specified"}

**Impact**

${clean(d.impact) || "Not specified"}`,
  )
  .join("\n\n") || "Not specified"}

---

## Known Constraints

${list(knownConstraints)}

---

## Future Considerations

${list(futureConsiderations)}
`;
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const answers = {
        projectName,
        productType,
        primaryUsers,
        primaryGoal,
        principles,
        technologyDecisions,
        domainDecisions,
        ownershipRules,
        architectureBoundaries,
        uiDecisions,
        implementationDecisions,
        knownConstraints,
        futureConsiderations,
      };

      const response = await fetch(
        `/api/projects/${projectId}/context/memory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save memory.md");
      }

      setHasDocument(true);
    } catch (error) {
      console.error("Save memory error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([buildMarkdown()], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "memory.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm text-copy-muted">Loading memory...</p>
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
          <p className="font-mono text-xs text-brand">memory.md</p>
          <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
            Project Memory
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-copy-muted">
            Record important decisions, conventions, and implementation knowledge.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Project Identity</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
              <input
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="Product type"
                className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
              <input
                value={primaryUsers}
                onChange={(e) => setPrimaryUsers(e.target.value)}
                placeholder="Primary users"
                className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
              <input
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="Primary goal"
                className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Product Principles</h2>
            <div className="mt-6 space-y-4">
              {principles.map((principle, index) => (
                <div key={index} className="rounded-xl border border-default p-4">
                  <div className="flex gap-2">
                    <input
                      value={principle.name}
                      onChange={(e) => {
                        const updated = [...principles];
                        updated[index].name = e.target.value;
                        setPrinciples(updated);
                      }}
                      placeholder="Principle name"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (principles.length === 1) {
                          setPrinciples([{ name: "", description: "" }]);
                        } else {
                          setPrinciples(principles.filter((_, i) => i !== index));
                        }
                      }}
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <textarea
                    value={principle.description}
                    onChange={(e) => {
                      const updated = [...principles];
                      updated[index].description = e.target.value;
                      setPrinciples(updated);
                    }}
                    rows={2}
                    placeholder="What it means in practice"
                    className="mt-2 w-full resize-none rounded-xl border border-default bg-base px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPrinciples([...principles, { name: "", description: "" }])}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Principle
            </button>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Technology Decisions</h2>
            <div className="mt-6 space-y-4">
              {technologyDecisions.map((tech, index) => (
                <div key={index} className="rounded-xl border border-default p-4">
                  <div className="flex gap-2">
                    <input
                      value={tech.technology}
                      onChange={(e) => {
                        const updated = [...technologyDecisions];
                        updated[index].technology = e.target.value;
                        setTechnologyDecisions(updated);
                      }}
                      placeholder="Technology"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (technologyDecisions.length === 1) {
                          setTechnologyDecisions([{ technology: "", reason: "" }]);
                        } else {
                          setTechnologyDecisions(technologyDecisions.filter((_, i) => i !== index));
                        }
                      }}
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <textarea
                    value={tech.reason}
                    onChange={(e) => {
                      const updated = [...technologyDecisions];
                      updated[index].reason = e.target.value;
                      setTechnologyDecisions(updated);
                    }}
                    rows={2}
                    placeholder="Why it was chosen"
                    className="mt-2 w-full resize-none rounded-xl border border-default bg-base px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTechnologyDecisions([...technologyDecisions, { technology: "", reason: "" }])}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Technology
            </button>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Domain Decisions</h2>
            <div className="mt-6 space-y-4">
              {domainDecisions.map((domain, index) => (
                <div key={index} className="rounded-xl border border-default p-4">
                  <div className="flex gap-2">
                    <input
                      value={domain.entity}
                      onChange={(e) => {
                        const updated = [...domainDecisions];
                        updated[index].entity = e.target.value;
                        setDomainDecisions(updated);
                      }}
                      placeholder="Entity name"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (domainDecisions.length === 1) {
                          setDomainDecisions([{ entity: "", description: "" }]);
                        } else {
                          setDomainDecisions(domainDecisions.filter((_, i) => i !== index));
                        }
                      }}
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <textarea
                    value={domain.description}
                    onChange={(e) => {
                      const updated = [...domainDecisions];
                      updated[index].description = e.target.value;
                      setDomainDecisions(updated);
                    }}
                    rows={2}
                    placeholder="What it represents"
                    className="mt-2 w-full resize-none rounded-xl border border-default bg-base px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDomainDecisions([...domainDecisions, { entity: "", description: "" }])}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Entity
            </button>
          </section>

          <ListSection
            title="Ownership and Access"
            items={ownershipRules}
            placeholder="Every entity belongs to an authenticated user"
            onAdd={() => addListItem(ownershipRules, setOwnershipRules)}
            onRemove={(index) => removeListItem(ownershipRules, setOwnershipRules, index)}
            update={(index, value) => updateListItem(ownershipRules, setOwnershipRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Architecture Boundaries"
            items={architectureBoundaries}
            placeholder="Rule worth restating"
            onAdd={() => addListItem(architectureBoundaries, setArchitectureBoundaries)}
            onRemove={(index) => removeListItem(architectureBoundaries, setArchitectureBoundaries, index)}
            update={(index, value) => updateListItem(architectureBoundaries, setArchitectureBoundaries, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="UI Decisions"
            items={uiDecisions}
            placeholder="Significant project-wide UI decision"
            onAdd={() => addListItem(uiDecisions, setUiDecisions)}
            onRemove={(index) => removeListItem(uiDecisions, setUiDecisions, index)}
            update={(index, value) => updateListItem(uiDecisions, setUiDecisions, index, value)}
            addLabel="Add Decision"
          />

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Implementation Decisions</h2>
            <div className="mt-6 space-y-4">
              {implementationDecisions.map((decision, index) => (
                <div key={index} className="rounded-xl border border-default p-4">
                  <div className="flex gap-2">
                    <input
                      value={decision.title}
                      onChange={(e) => {
                        const updated = [...implementationDecisions];
                        updated[index].title = e.target.value;
                        setImplementationDecisions(updated);
                      }}
                      placeholder="Decision title"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (implementationDecisions.length === 1) {
                          setImplementationDecisions([{ title: "", decision: "", reason: "", impact: "" }]);
                        } else {
                          setImplementationDecisions(implementationDecisions.filter((_, i) => i !== index));
                        }
                      }}
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <textarea
                    value={decision.decision}
                    onChange={(e) => {
                      const updated = [...implementationDecisions];
                      updated[index].decision = e.target.value;
                      setImplementationDecisions(updated);
                    }}
                    rows={2}
                    placeholder="What was decided"
                    className="mt-2 w-full resize-none rounded-xl border border-default bg-base px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                  <textarea
                    value={decision.reason}
                    onChange={(e) => {
                      const updated = [...implementationDecisions];
                      updated[index].reason = e.target.value;
                      setImplementationDecisions(updated);
                    }}
                    rows={2}
                    placeholder="Why this approach"
                    className="mt-2 w-full resize-none rounded-xl border border-default bg-base px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                  <textarea
                    value={decision.impact}
                    onChange={(e) => {
                      const updated = [...implementationDecisions];
                      updated[index].impact = e.target.value;
                      setImplementationDecisions(updated);
                    }}
                    rows={2}
                    placeholder="Impact on future implementation"
                    className="mt-2 w-full resize-none rounded-xl border border-default bg-base px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setImplementationDecisions([...implementationDecisions, { title: "", decision: "", reason: "", impact: "" }])}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Decision
            </button>
          </section>

          <ListSection
            title="Known Constraints"
            items={knownConstraints}
            placeholder="Constraint"
            onAdd={() => addListItem(knownConstraints, setKnownConstraints)}
            onRemove={(index) => removeListItem(knownConstraints, setKnownConstraints, index)}
            update={(index, value) => updateListItem(knownConstraints, setKnownConstraints, index, value)}
            addLabel="Add Constraint"
          />

          <ListSection
            title="Future Considerations"
            items={futureConsiderations}
            placeholder="Idea"
            onAdd={() => addListItem(futureConsiderations, setFutureConsiderations)}
            onRemove={(index) => removeListItem(futureConsiderations, setFutureConsiderations, index)}
            update={(index, value) => updateListItem(futureConsiderations, setFutureConsiderations, index, value)}
            addLabel="Add Idea"
          />

          <section className="sticky bottom-6 rounded-2xl border border-default bg-surface/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-copy-primary">memory.md</p>
                <p className="mt-1 text-xs text-copy-muted">
                  {hasDocument ? "Edit and save your changes." : "Generate the memory file."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!canSave}
                  className="inline-flex items-center gap-2 rounded-xl border border-default px-4 py-2.5 text-sm font-medium text-copy-primary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download className="size-4" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !canSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save Changes
                    </>
                  )}
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
  items: string[];
  placeholder: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  update: (index: number, value: string) => void;
  addLabel: string;
};

function ListSection({
  title,
  items,
  placeholder,
  onAdd,
  onRemove,
  update,
  addLabel,
}: ListSectionProps) {
  return (
    <section className="rounded-2xl border border-default bg-surface p-6">
      <h2 className="text-lg font-semibold text-copy-primary">{title}</h2>

      <div className="mt-6 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={item}
              onChange={(event) => update(index, event.target.value)}
              placeholder={`${placeholder}${items.length > 1 ? ` ${index + 1}` : ""}`}
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