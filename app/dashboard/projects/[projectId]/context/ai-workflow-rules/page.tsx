"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Download, Save } from "lucide-react";

type AIWorkflowDocument = {
  id: string;
  project_id: string;
  file_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function AIWorkflowRulesPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  const [approach, setApproach] = useState<string[]>([""]);
  const [scopingRules, setScopingRules] = useState<string[]>([""]);
  const [implementationOrder, setImplementationOrder] = useState<string[]>([""]);
  const [splitWorkRules, setSplitWorkRules] = useState<string[]>([""]);
  const [missingRequirements, setMissingRequirements] = useState<string[]>([""]);
  const [productScope, setProductScope] = useState("");
  const [outOfScopeItems, setOutOfScopeItems] = useState<string[]>([""]);
  const [dataRules, setDataRules] = useState<string[]>([""]);
  const [authRules, setAuthRules] = useState<string[]>([""]);
  const [uiRules, setUiRules] = useState<string[]>([""]);
  const [apiRules, setApiRules] = useState<string[]>([""]);
  const [errorRules, setErrorRules] = useState<string[]>([""]);
  const [testingRules, setTestingRules] = useState<string[]>([""]);
  const [contextSyncRules, setContextSyncRules] = useState<string[]>([""]);
  const [protectedDecisions, setProtectedDecisions] = useState<string[]>([""]);
  const [dependencyRules, setDependencyRules] = useState<string[]>([""]);
  const [refactoringRules, setRefactoringRules] = useState<string[]>([""]);
  const [completionChecks, setCompletionChecks] = useState<string[]>([""]);

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

    const cleanNumbered = (sectionLines: string[]) =>
      sectionLines
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => /^\d+\./.test(line))
        .map((line) => line.replace(/^\d+\.\s*/, "").trim());

    const approachSection = getSection("## Approach");
    const approachClean = cleanBullets(approachSection);
    if (approachClean.length > 0) setApproach(approachClean);

    const scopingSection = getSection("## Scoping Rules");
    const scopingClean = cleanBullets(scopingSection);
    if (scopingClean.length > 0) setScopingRules(scopingClean);

    const orderSection = getSection("## Feature Implementation Order");
    const orderClean = cleanNumbered(orderSection);
    if (orderClean.length > 0) setImplementationOrder(orderClean);

    const splitSection = getSection("## When to Split Work");
    const splitClean = cleanBullets(splitSection);
    if (splitClean.length > 0) setSplitWorkRules(splitClean);

    const missingSection = getSection("## Handling Missing Requirements");
    const missingClean = cleanBullets(missingSection).filter(
      (line) => !line.startsWith("Examples of requirements"),
    );
    if (missingClean.length > 0) setMissingRequirements(missingClean);

    const scopeSection = getSection("## Product Scope Rules");
    const scopeClean = cleanBullets(scopeSection);
    if (scopeClean.length > 0) {
      setProductScope(scopeClean[0] || "");
      setOutOfScopeItems(scopeClean.slice(1));
    }

    const dataSection = getSection("## Data Rules");
    const dataClean = cleanBullets(dataSection);
    if (dataClean.length > 0) setDataRules(dataClean);

    const authSection = getSection("## Authentication and Access Rules");
    const authClean = cleanBullets(authSection).filter(
      (line) => !line.includes("authentication provider is an implementation"),
    );
    if (authClean.length > 0) setAuthRules(authClean);

    const uiSection = getSection("## UI and UX Rules");
    const uiClean = cleanBullets(uiSection);
    if (uiClean.length > 0) setUiRules(uiClean);

    const apiSection = getSection("## API and Server Rules");
    const apiClean = cleanBullets(apiSection);
    if (apiClean.length > 0) setApiRules(apiClean);

    const errorSection = getSection("## Error Handling Rules");
    const errorClean = cleanBullets(errorSection);
    if (errorClean.length > 0) setErrorRules(errorClean);

    const testingSection = getSection("## Testing and Verification");
    const testingClean = cleanNumbered(testingSection);
    if (testingClean.length > 0) setTestingRules(testingClean);

    const syncSection = getSection("## Context Synchronization");
    const syncClean = cleanBullets(syncSection);
    if (syncClean.length > 0) setContextSyncRules(syncClean);

    const protectedSection = getSection("## Protected Decisions");
    const protectedClean = cleanBullets(protectedSection);
    if (protectedClean.length > 0) setProtectedDecisions(protectedClean);

    const depSection = getSection("## Dependency Rules");
    const depClean = cleanBullets(depSection);
    if (depClean.length > 0) setDependencyRules(depClean);

    const refactoringSection = getSection("## Refactoring Rules");
    const refactoringClean = cleanBullets(refactoringSection);
    if (refactoringClean.length > 0) setRefactoringRules(refactoringClean);

    const completionSection = getSection("## Before Moving to the Next Feature");
    const completionClean = cleanNumbered(completionSection);
    if (completionClean.length > 0) setCompletionChecks(completionClean);
  };

  useEffect(() => {
    if (!projectId) return;

    const loadDocument = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/projects/${projectId}/context/ai-workflow-rules`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load ai-workflow-rules");
        }

        const document = data.document as AIWorkflowDocument | null;

        if (document?.content) {
          setHasDocument(true);
          parseMarkdown(document.content);
        }
      } catch (error) {
        console.error("Load ai-workflow-rules error:", error);
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

    const numbered = (items: string[]) =>
      items
        .map(clean)
        .filter(Boolean)
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n") || "Not specified";

    return `# AI Workflow Rules

## Approach

${list(approach)}

---

## Scoping Rules

${list(scopingRules)}

---

## Feature Implementation Order

${numbered(implementationOrder)}

---

## When to Split Work

${list(splitWorkRules)}

---

## Handling Missing Requirements

${list(missingRequirements)}

---

## Product Scope Rules

${clean(productScope) || "Not specified"}

Do not add (mirror the Out of Scope list):

${list(outOfScopeItems)}

---

## Data Rules

${list(dataRules)}

---

## Authentication and Access Rules

${list(authRules)}

---

## UI and UX Rules

${list(uiRules)}

---

## API and Server Rules

${list(apiRules)}

---

## Error Handling Rules

${list(errorRules)}

---

## Testing and Verification

${numbered(testingRules)}

---

## Context Synchronization

${list(contextSyncRules)}

---

## Protected Decisions

${list(protectedDecisions)}

---

## Dependency Rules

${list(dependencyRules)}

---

## Refactoring Rules

${list(refactoringRules)}

---

## Before Moving to the Next Feature

${numbered(completionChecks)}
`;
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const answers = {
        approach,
        scopingRules,
        implementationOrder,
        splitWorkRules,
        missingRequirements,
        productScope,
        outOfScopeItems,
        dataRules,
        authRules,
        uiRules,
        apiRules,
        errorRules,
        testingRules,
        contextSyncRules,
        protectedDecisions,
        dependencyRules,
        refactoringRules,
        completionChecks,
      };

      const response = await fetch(
        `/api/projects/${projectId}/context/ai-workflow-rules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save ai-workflow-rules.md");
      }

      setHasDocument(true);
    } catch (error) {
      console.error("Save ai-workflow-rules error:", error);
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
    link.download = "ai-workflow-rules.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm text-copy-muted">Loading ai-workflow-rules...</p>
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
          <p className="font-mono text-xs text-brand">ai-workflow-rules.md</p>
          <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
            AI Workflow Rules
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-copy-muted">
            Define how AI agents should work inside the project.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <ListSection
            title="Approach"
            items={approach}
            placeholder="Build incrementally using spec-driven development"
            onAdd={() => addListItem(approach, setApproach)}
            onRemove={(index) => removeListItem(approach, setApproach, index)}
            update={(index, value) => updateListItem(approach, setApproach, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Scoping Rules"
            items={scopingRules}
            placeholder="Work on one feature unit at a time"
            onAdd={() => addListItem(scopingRules, setScopingRules)}
            onRemove={(index) => removeListItem(scopingRules, setScopingRules, index)}
            update={(index, value) => updateListItem(scopingRules, setScopingRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Feature Implementation Order"
            items={implementationOrder}
            placeholder="Understand the requirement"
            onAdd={() => addListItem(implementationOrder, setImplementationOrder)}
            onRemove={(index) => removeListItem(implementationOrder, setImplementationOrder, index)}
            update={(index, value) => updateListItem(implementationOrder, setImplementationOrder, index, value)}
            addLabel="Add Step"
          />

          <ListSection
            title="When to Split Work"
            items={splitWorkRules}
            placeholder="Split when combining unrelated concerns"
            onAdd={() => addListItem(splitWorkRules, setSplitWorkRules)}
            onRemove={(index) => removeListItem(splitWorkRules, setSplitWorkRules, index)}
            update={(index, value) => updateListItem(splitWorkRules, setSplitWorkRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Handling Missing Requirements"
            items={missingRequirements}
            placeholder="Do not invent product behavior"
            onAdd={() => addListItem(missingRequirements, setMissingRequirements)}
            onRemove={(index) => removeListItem(missingRequirements, setMissingRequirements, index)}
            update={(index, value) => updateListItem(missingRequirements, setMissingRequirements, index, value)}
            addLabel="Add Rule"
          />

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Product Scope</h2>
            <div className="mt-6">
              <input
                value={productScope}
                onChange={(e) => setProductScope(e.target.value)}
                placeholder="Product purpose"
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </div>
            <div className="mt-4 space-y-2">
              {outOfScopeItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateListItem(outOfScopeItems, setOutOfScopeItems, index, e.target.value)}
                    placeholder="Out of scope item"
                    className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(outOfScopeItems, setOutOfScopeItems, index)}
                    className="rounded-xl border border-default px-3 text-red-400"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addListItem(outOfScopeItems, setOutOfScopeItems)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Item
            </button>
          </section>

          <ListSection
            title="Data Rules"
            items={dataRules}
            placeholder="Keep entities with different lifecycles separate"
            onAdd={() => addListItem(dataRules, setDataRules)}
            onRemove={(index) => removeListItem(dataRules, setDataRules, index)}
            update={(index, value) => updateListItem(dataRules, setDataRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Authentication and Access Rules"
            items={authRules}
            placeholder="Protected functionality requires an authenticated user"
            onAdd={() => addListItem(authRules, setAuthRules)}
            onRemove={(index) => removeListItem(authRules, setAuthRules, index)}
            update={(index, value) => updateListItem(authRules, setAuthRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="UI and UX Rules"
            items={uiRules}
            placeholder="Follow visual rules from ui-context.md"
            onAdd={() => addListItem(uiRules, setUiRules)}
            onRemove={(index) => removeListItem(uiRules, setUiRules, index)}
            update={(index, value) => updateListItem(uiRules, setUiRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="API and Server Rules"
            items={apiRules}
            placeholder="Validate request input before processing"
            onAdd={() => addListItem(apiRules, setApiRules)}
            onRemove={(index) => removeListItem(apiRules, setApiRules, index)}
            update={(index, value) => updateListItem(apiRules, setApiRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Error Handling Rules"
            items={errorRules}
            placeholder="Handle expected errors explicitly"
            onAdd={() => addListItem(errorRules, setErrorRules)}
            onRemove={(index) => removeListItem(errorRules, setErrorRules, index)}
            update={(index, value) => updateListItem(errorRules, setErrorRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Testing and Verification"
            items={testingRules}
            placeholder="Verify the primary happy path"
            onAdd={() => addListItem(testingRules, setTestingRules)}
            onRemove={(index) => removeListItem(testingRules, setTestingRules, index)}
            update={(index, value) => updateListItem(testingRules, setTestingRules, index, value)}
            addLabel="Add Check"
          />

          <ListSection
            title="Context Synchronization"
            items={contextSyncRules}
            placeholder="Update memory.md when decisions are made"
            onAdd={() => addListItem(contextSyncRules, setContextSyncRules)}
            onRemove={(index) => removeListItem(contextSyncRules, setContextSyncRules, index)}
            update={(index, value) => updateListItem(contextSyncRules, setContextSyncRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Protected Decisions"
            items={protectedDecisions}
            placeholder="Product scope"
            onAdd={() => addListItem(protectedDecisions, setProtectedDecisions)}
            onRemove={(index) => removeListItem(protectedDecisions, setProtectedDecisions, index)}
            update={(index, value) => updateListItem(protectedDecisions, setProtectedDecisions, index, value)}
            addLabel="Add Decision"
          />

          <ListSection
            title="Dependency Rules"
            items={dependencyRules}
            placeholder="Do not add a dependency unless required"
            onAdd={() => addListItem(dependencyRules, setDependencyRules)}
            onRemove={(index) => removeListItem(dependencyRules, setDependencyRules, index)}
            update={(index, value) => updateListItem(dependencyRules, setDependencyRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Refactoring Rules"
            items={refactoringRules}
            placeholder="Do not refactor unrelated code"
            onAdd={() => addListItem(refactoringRules, setRefactoringRules)}
            onRemove={(index) => removeListItem(refactoringRules, setRefactoringRules, index)}
            update={(index, value) => updateListItem(refactoringRules, setRefactoringRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Before Moving to Next Feature"
            items={completionChecks}
            placeholder="The feature works end to end"
            onAdd={() => addListItem(completionChecks, setCompletionChecks)}
            onRemove={(index) => removeListItem(completionChecks, setCompletionChecks, index)}
            update={(index, value) => updateListItem(completionChecks, setCompletionChecks, index, value)}
            addLabel="Add Check"
          />

          <section className="sticky bottom-6 rounded-2xl border border-default bg-surface/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-copy-primary">
                  ai-workflow-rules.md
                </p>
                <p className="mt-1 text-xs text-copy-muted">
                  {hasDocument ? "Edit and save your changes." : "Generate the AI workflow rules file."}
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