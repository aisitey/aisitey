"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Download, Save } from "lucide-react";

type ProgressTrackerDocument = {
  id: string;
  project_id: string;
  file_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function ProgressTrackerPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  const [currentPhase, setCurrentPhase] = useState("");
  const [currentGoal, setCurrentGoal] = useState("");
  const [completed, setCompleted] = useState<string[]>([""]);
  const [inProgress, setInProgress] = useState<string[]>([""]);
  const [nextUp, setNextUp] = useState<string[]>([""]);
  const [openQuestions, setOpenQuestions] = useState<string[]>([""]);
  const [architectureDecisions, setArchitectureDecisions] = useState<string[]>([""]);
  const [sessionNotes, setSessionNotes] = useState<string[]>([""]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);

  const canSave = true;

  const phaseOptions = [
    "Not started",
    "In progress",
    "Complete",
  ];

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

    const phaseSection = getSection("## Current Phase");
    const phaseClean = cleanBullets(phaseSection);
    if (phaseClean.length > 0) setCurrentPhase(phaseClean[0]);

    const goalSection = getSection("## Current Goal");
    const goalClean = cleanBullets(goalSection);
    if (goalClean.length > 0) setCurrentGoal(goalClean[0]);

    const completedSection = getSection("## Completed");
    const completedClean = cleanBullets(completedSection).filter(
      (line) => line !== "None yet.",
    );
    if (completedClean.length > 0) setCompleted(completedClean);

    const inProgressSection = getSection("## In Progress");
    const inProgressClean = cleanBullets(inProgressSection).filter(
      (line) => line !== "None yet.",
    );
    if (inProgressClean.length > 0) setInProgress(inProgressClean);

    const nextSection = getSection("## Next Up");
    const nextClean = cleanBullets(nextSection);
    if (nextClean.length > 0) setNextUp(nextClean);

    const questionsSection = getSection("## Open Questions");
    const questionsClean = cleanBullets(questionsSection);
    if (questionsClean.length > 0) setOpenQuestions(questionsClean);

    const decisionsSection = getSection("## Architecture Decisions");
    const decisionsClean = cleanBullets(decisionsSection);
    if (decisionsClean.length > 0) setArchitectureDecisions(decisionsClean);

    const notesSection = getSection("## Session Notes");
    const notesClean = cleanBullets(notesSection);
    if (notesClean.length > 0) setSessionNotes(notesClean);
  };

  useEffect(() => {
    if (!projectId) return;

    const loadDocument = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/projects/${projectId}/context/progress-tracker`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load progress-tracker");
        }

        const document = data.document as ProgressTrackerDocument | null;

        if (document?.content) {
          setHasDocument(true);
          parseMarkdown(document.content);
        }
      } catch (error) {
        console.error("Load progress-tracker error:", error);
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
        .join("\n") || "None yet.";

    return `# Progress Tracker

Update this file after every meaningful implementation change. This file
answers "where are we right now" — it's expected to change constantly,
unlike \`memory.md\` which should stay stable.

## Current Phase

- ${clean(currentPhase) || "Not started"}

## Current Goal

- ${clean(currentGoal) || "Not specified"}

## Completed

${list(completed)}

## In Progress

${list(inProgress)}

## Next Up

${list(nextUp)}

## Open Questions

${list(openQuestions)}

## Architecture Decisions

${list(architectureDecisions)}

## Session Notes

${list(sessionNotes)}
`;
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const answers = {
        currentPhase,
        currentGoal,
        completed,
        inProgress,
        nextUp,
        openQuestions,
        architectureDecisions,
        sessionNotes,
      };

      const response = await fetch(
        `/api/projects/${projectId}/context/progress-tracker`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save progress-tracker.md");
      }

      setHasDocument(true);
    } catch (error) {
      console.error("Save progress-tracker error:", error);
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
    link.download = "progress-tracker.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm text-copy-muted">Loading progress-tracker...</p>
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
          <p className="font-mono text-xs text-brand">progress-tracker.md</p>
          <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
            Progress Tracker
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-copy-muted">
            Track current implementation progress and next steps.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Current Phase</h2>
            <div className="mt-6">
              <select
                value={currentPhase}
                onChange={(e) => setCurrentPhase(e.target.value)}
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              >
                <option value="">Select phase</option>
                {phaseOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Current Goal</h2>
            <div className="mt-6">
              <input
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                placeholder="What you are building right now"
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </div>
          </section>

          <ListSection
            title="Completed"
            items={completed}
            placeholder="Completed item"
            onAdd={() => addListItem(completed, setCompleted)}
            onRemove={(index) => removeListItem(completed, setCompleted, index)}
            update={(index, value) => updateListItem(completed, setCompleted, index, value)}
            addLabel="Add Item"
          />

          <ListSection
            title="In Progress"
            items={inProgress}
            placeholder="In progress item"
            onAdd={() => addListItem(inProgress, setInProgress)}
            onRemove={(index) => removeListItem(inProgress, setInProgress, index)}
            update={(index, value) => updateListItem(inProgress, setInProgress, index, value)}
            addLabel="Add Item"
          />

          <ListSection
            title="Next Up"
            items={nextUp}
            placeholder="Next unit to build"
            onAdd={() => addListItem(nextUp, setNextUp)}
            onRemove={(index) => removeListItem(nextUp, setNextUp, index)}
            update={(index, value) => updateListItem(nextUp, setNextUp, index, value)}
            addLabel="Add Item"
          />

          <ListSection
            title="Open Questions"
            items={openQuestions}
            placeholder="Unresolved decision"
            onAdd={() => addListItem(openQuestions, setOpenQuestions)}
            onRemove={(index) => removeListItem(openQuestions, setOpenQuestions, index)}
            update={(index, value) => updateListItem(openQuestions, setOpenQuestions, index, value)}
            addLabel="Add Question"
          />

          <ListSection
            title="Architecture Decisions"
            items={architectureDecisions}
            placeholder="Decision title — see memory.md"
            onAdd={() => addListItem(architectureDecisions, setArchitectureDecisions)}
            onRemove={(index) => removeListItem(architectureDecisions, setArchitectureDecisions, index)}
            update={(index, value) => updateListItem(architectureDecisions, setArchitectureDecisions, index, value)}
            addLabel="Add Decision"
          />

          <ListSection
            title="Session Notes"
            items={sessionNotes}
            placeholder="Context for next session"
            onAdd={() => addListItem(sessionNotes, setSessionNotes)}
            onRemove={(index) => removeListItem(sessionNotes, setSessionNotes, index)}
            update={(index, value) => updateListItem(sessionNotes, setSessionNotes, index, value)}
            addLabel="Add Note"
          />

          <section className="sticky bottom-6 rounded-2xl border border-default bg-surface/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-copy-primary">progress-tracker.md</p>
                <p className="mt-1 text-xs text-copy-muted">
                  {hasDocument ? "Edit and save your changes." : "Generate the progress tracker file."}
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