"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Save, Download, Trash2 } from "lucide-react";

type Entity = {
  name: string;
  fields: string[];
  relations: string[];
};

type FolderBoundary = {
  name: string;
  responsibility: string;
};

type TechStack = {
  framework: string;
  ui: string;
  authentication: string;
  database: string;
  validation: string;
};

type ArchitectureDocument = {
  id: string;
  project_id: string;
  file_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function ArchitecturePage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  const [techStack, setTechStack] = useState<TechStack>({
    framework: "",
    ui: "",
    authentication: "",
    database: "",
    validation: "",
  });

  const [optionalTech, setOptionalTech] = useState<string[]>([""]);

  const [folders, setFolders] = useState<FolderBoundary[]>([
    { name: "", responsibility: "" },
  ]);

  const [presentationLayer, setPresentationLayer] = useState<string[]>([""]);
  const [applicationLayer, setApplicationLayer] = useState<string[]>([""]);
  const [dataLayer, setDataLayer] = useState<string[]>([""]);

  const [primaryDatabase, setPrimaryDatabase] = useState("");
  const [databaseEntities, setDatabaseEntities] = useState<string[]>([""]);
  const [fileStorage, setFileStorage] = useState("");

  const [entities, setEntities] = useState<Entity[]>([
    { name: "", fields: [""], relations: [""] },
  ]);

  const [authProvider, setAuthProvider] = useState("");
  const [protectedResources, setProtectedResources] = useState<string[]>([""]);

  const [statusModels, setStatusModels] = useState<
    { entity: string; states: string[] }[]
  >([{ entity: "", states: [""] }]);

  const [openQuestions, setOpenQuestions] = useState<string[]>([""]);

  const [validationBoundaries, setValidationBoundaries] = useState<string[]>([
    "",
  ]);

  const [dataIntegrityRules, setDataIntegrityRules] = useState<string[]>([""]);

  const [invariants, setInvariants] = useState<string[]>([
    "Client components never access the database directly",
    "Authentication is enforced on every protected server operation",
    "Authorization is checked before every mutation",
  ]);

  const [initialDecisions, setInitialDecisions] = useState<string[]>([""]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);

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

    const cleanLines = (sectionLines: string[]) =>
      sectionLines
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => !line.startsWith("|"))
        .filter((line) => line !== "---");

    // Parse Stack table
    const stackSection = getSection("## Stack");
    const stackTable = stackSection.filter((line) => line.startsWith("|"));

    const parseStackValue = (index: number) => {
      const row = stackTable[index];
      if (!row) return "";
      const cells = row.split("|").map((cell) => cell.trim());
      return cells[2] || "";
    };

    setTechStack({
      framework: parseStackValue(2),
      ui: parseStackValue(3),
      authentication: parseStackValue(4),
      database: parseStackValue(5),
      validation: parseStackValue(6),
    });

    // Parse System Boundaries
    const boundariesSection = getSection("## System Boundaries");
    const parsedFolders: FolderBoundary[] = [];

    for (const line of boundariesSection) {
      const trimmed = line.trim();
      if (trimmed.startsWith("- `")) {
        const match = trimmed.match(/- `([^`]+)` — (.+)/);
        if (match) {
          parsedFolders.push({
            name: match[1],
            responsibility: match[2],
          });
        }
      }
    }

    if (parsedFolders.length > 0) {
      setFolders(parsedFolders);
    }

    // Parse Presentation Layer
    const presentationSection = getSection("### Presentation Layer");
    setPresentationLayer(
      cleanLines(presentationSection).map((line) =>
        line.replace(/^-\s*/, ""),
      ) || [""],
    );

    // Parse Application Layer
    const applicationSection = getSection("### Application Layer");
    setApplicationLayer(
      cleanLines(applicationSection).map((line) =>
        line.replace(/^-\s*/, ""),
      ) || [""],
    );

    // Parse Data Layer
    const dataSection = getSection("### Data Layer");
    setDataLayer(
      cleanLines(dataSection).map((line) => line.replace(/^-\s*/, "")) || [""],
    );

    // Parse Auth
    const authSection = getSection("## Auth and Access Model");
    const authLine = cleanLines(authSection).find((line) =>
      line.includes("authenticate through"),
    );
    if (authLine) {
      const match = authLine.match(/authenticate through (.+?)\./);
      if (match) setAuthProvider(match[1]);
    }

    // Parse Entities
    const entitiesSection = getSection("## Core Domain Model");
    const parsedEntities: Entity[] = [];
    let currentEntity: Entity | null = null;
    let currentSection = "";

    for (const rawLine of entitiesSection) {
      const line = rawLine.trim();

      if (line.startsWith("### ")) {
        if (currentEntity) {
          parsedEntities.push(currentEntity);
        }
        currentEntity = {
          name: line.replace(/^###\s*/, ""),
          fields: [],
          relations: [],
        };
        continue;
      }

      if (!currentEntity) continue;

      if (line === "Contains:") {
        currentSection = "fields";
        continue;
      }

      if (line === "Related to:") {
        currentSection = "relations";
        continue;
      }

      if (line.startsWith("- ") && currentSection === "fields") {
        currentEntity.fields.push(line.replace(/^-\s*/, ""));
      }

      if (line.startsWith("- ") && currentSection === "relations") {
        currentEntity.relations.push(line.replace(/^-\s*/, ""));
      }
    }

    if (currentEntity) {
      parsedEntities.push(currentEntity);
    }

    if (parsedEntities.length > 0) {
      setEntities(parsedEntities);
    }

    // Parse Data Integrity Rules
    const integritySection = getSection("## Data Integrity Rules");
    setDataIntegrityRules(
      cleanLines(integritySection).map((line) =>
        line.replace(/^\d+\.\s*/, ""),
      ) || [""],
    );

    // Parse Invariants
    const invariantsSection = getSection("## Invariants");
    setInvariants(
      cleanLines(invariantsSection).map((line) =>
        line.replace(/^\d+\.\s*/, ""),
      ) || [""],
    );

    // Parse Initial Decisions
    const decisionsSection = getSection("## Initial Architecture Decisions");
    setInitialDecisions(
      cleanLines(decisionsSection).map((line) =>
        line.replace(/^###\s*/, ""),
      ) || [""],
    );
  };

  useEffect(() => {
    if (!projectId) return;

    const loadDocument = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/projects/${projectId}/context/architecture`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load architecture");
        }

        const document = data.document as ArchitectureDocument | null;

        if (document?.content) {
          setHasDocument(true);
          parseMarkdown(document.content);
        }
      } catch (error) {
        console.error("Load architecture error:", error);
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

  const canSave =
    techStack.framework.trim() !== "" &&
    techStack.database.trim() !== "" &&
    entities.some((entity) => entity.name.trim() !== "");

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);

    try {
      const answers = {
        techStack,
        optionalTech: optionalTech.map((item) => item.trim()).filter(Boolean),
        folders: folders.filter(
          (folder) => folder.name.trim() !== "",
        ),
        presentationLayer: presentationLayer
          .map((item) => item.trim())
          .filter(Boolean),
        applicationLayer: applicationLayer
          .map((item) => item.trim())
          .filter(Boolean),
        dataLayer: dataLayer.map((item) => item.trim()).filter(Boolean),
        primaryDatabase: primaryDatabase.trim(),
        databaseEntities: databaseEntities
          .map((item) => item.trim())
          .filter(Boolean),
        fileStorage: fileStorage.trim(),
        entities: entities.filter((entity) => entity.name.trim() !== ""),
        authProvider: authProvider.trim(),
        protectedResources: protectedResources
          .map((item) => item.trim())
          .filter(Boolean),
        statusModels: statusModels.filter(
          (model) => model.entity.trim() !== "",
        ),
        openQuestions: openQuestions.map((item) => item.trim()).filter(Boolean),
        validationBoundaries: validationBoundaries
          .map((item) => item.trim())
          .filter(Boolean),
        dataIntegrityRules: dataIntegrityRules
          .map((item) => item.trim())
          .filter(Boolean),
        invariants: invariants.map((item) => item.trim()).filter(Boolean),
        initialDecisions: initialDecisions
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = await fetch(
        `/api/projects/${projectId}/context/architecture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save architecture.md");
      }

      setHasDocument(true);
    } catch (error) {
      console.error("Save architecture error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const content = `# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | ${techStack.framework || "[Framework]"} | Application framework |
| UI | ${techStack.ui || "[UI]"} | User interface |
| Authentication | ${techStack.authentication || "[Auth]"} | Authentication |
| Database | ${techStack.database || "[Database]"} | Data storage |
| Validation | ${techStack.validation || "[Validation]"} | Input validation |

### Optional Technologies

${optionalTech.filter((item) => item.trim()).map((item) => `- ${item}`).join("\n") || "- None"}

---

## System Boundaries

${folders.filter((folder) => folder.name.trim()).map((folder) => `- \`${folder.name}\` — ${folder.responsibility || "Responsibility"}`).join("\n") || "- `app/` — Application routes"}

---

## Application Architecture

### Presentation Layer

Responsible for:

${presentationLayer.filter((item) => item.trim()).map((item) => `- ${item}`).join("\n") || "- Rendering pages and UI"}

### Application Layer

Responsible for:

${applicationLayer.filter((item) => item.trim()).map((item) => `- ${item}`).join("\n") || "- Applying business rules"}

### Data Layer

Responsible for:

${dataLayer.filter((item) => item.trim()).map((item) => `- ${item}`).join("\n") || "- Database access"}

---

## Storage Model

### ${primaryDatabase || "[Primary Database]"}

The database stores:

${databaseEntities.filter((item) => item.trim()).map((item) => `- ${item}`).join("\n") || "- [entity]"}

### File Storage

${fileStorage || "Not required yet. Define before implementation."}

---

## Core Domain Model

${entities.filter((entity) => entity.name.trim()).map((entity) => `### ${entity.name}

Represents [what it is].

Contains:

${entity.fields.filter((field) => field.trim()).map((field) => `- ${field}`).join("\n") || "- [field]"}

Related to:

${entity.relations.filter((relation) => relation.trim()).map((relation) => `- ${relation}`).join("\n") || "- [relationship]"}`).join("\n\n") || "### Entity\n\nRepresents [what it is].\n\nContains:\n- [field]"}

---

## Auth and Access Model

- Users authenticate through ${authProvider || "[provider]"}.
- Protected routes require authentication.
- A user can access only their own ${protectedResources.filter((item) => item.trim()).join(", ") || "resources"}.
- Authorization is enforced on the server.

---

## Data Integrity Rules

${dataIntegrityRules.filter((item) => item.trim()).map((item, index) => `${index + 1}. ${item}`).join("\n") || "1. Every entity belongs to an authenticated user."}

---

## Invariants

${invariants.filter((item) => item.trim()).map((item, index) => `${index + 1}. ${item}`).join("\n") || "1. Client components never access the database directly."}

---

## Initial Architecture Decisions

${initialDecisions.filter((item) => item.trim()).map((item) => `### ${item}\n\nChosen because [reason].`).join("\n\n") || "### [Decision]\n\nChosen because [reason]."}
`;

    const blob = new Blob([content], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "architecture.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm text-copy-muted">Loading architecture...</p>
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
          <p className="font-mono text-xs text-brand">architecture.md</p>
          <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
            Architecture
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-copy-muted">
            Define the technical structure, system boundaries, data model, and
            architectural rules.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {/* Tech Stack */}
          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Tech Stack</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { label: "Framework", key: "framework" as keyof TechStack, placeholder: "Next.js + TypeScript" },
                { label: "UI Library", key: "ui" as keyof TechStack, placeholder: "Tailwind + shadcn/ui" },
                { label: "Authentication", key: "authentication" as keyof TechStack, placeholder: "Clerk" },
                { label: "Database", key: "database" as keyof TechStack, placeholder: "Prisma + PostgreSQL" },
                { label: "Validation", key: "validation" as keyof TechStack, placeholder: "Zod" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-2 block text-sm font-medium">
                    {field.label}
                  </label>
                  <input
                    value={techStack[field.key]}
                    onChange={(e) =>
                      setTechStack({ ...techStack, [field.key]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* System Boundaries */}
          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">System Boundaries</h2>
            <div className="mt-6 space-y-3">
              {folders.map((folder, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={folder.name}
                    onChange={(e) => {
                      const updated = [...folders];
                      updated[index].name = e.target.value;
                      setFolders(updated);
                    }}
                    placeholder="app/"
                    className="w-1/3 rounded-xl border border-default bg-base px-4 py-3 font-mono text-sm outline-none focus:border-brand"
                  />
                  <input
                    value={folder.responsibility}
                    onChange={(e) => {
                      const updated = [...folders];
                      updated[index].responsibility = e.target.value;
                      setFolders(updated);
                    }}
                    placeholder="Responsibility"
                    className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (folders.length === 1) {
                        setFolders([{ name: "", responsibility: "" }]);
                      } else {
                        setFolders(folders.filter((_, i) => i !== index));
                      }
                    }}
                    className="rounded-xl border border-default px-3 text-red-400"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFolders([...folders, { name: "", responsibility: "" }])
                }
                className="inline-flex items-center gap-2 text-sm font-medium text-brand"
              >
                <Plus className="size-4" />
                Add Folder
              </button>
            </div>
          </section>

          {/* Entities */}
          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Core Entities</h2>
            <div className="mt-6 space-y-5">
              {entities.map((entity, entityIndex) => (
                <div key={entityIndex} className="rounded-xl border border-default p-4">
                  <div className="flex gap-2">
                    <input
                      value={entity.name}
                      onChange={(e) => {
                        const updated = [...entities];
                        updated[entityIndex].name = e.target.value;
                        setEntities(updated);
                      }}
                      placeholder="Entity name (e.g. User)"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm font-medium outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (entities.length === 1) {
                          setEntities([{ name: "", fields: [""], relations: [""] }]);
                        } else {
                          setEntities(entities.filter((_, i) => i !== entityIndex));
                        }
                      }}
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <p className="mt-3 text-xs font-medium text-copy-muted">Fields:</p>
                  {entity.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="mt-2 flex gap-2">
                      <input
                        value={field}
                        onChange={(e) => {
                          const updated = [...entities];
                          updated[entityIndex].fields[fieldIndex] = e.target.value;
                          setEntities(updated);
                        }}
                        placeholder="field name"
                        className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...entities];
                          if (updated[entityIndex].fields.length === 1) {
                            updated[entityIndex].fields = [""];
                          } else {
                            updated[entityIndex].fields = updated[
                              entityIndex
                            ].fields.filter((_, i) => i !== fieldIndex);
                          }
                          setEntities(updated);
                        }}
                        className="rounded-xl border border-default px-3 text-red-400"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...entities];
                      updated[entityIndex].fields.push("");
                      setEntities(updated);
                    }}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-brand"
                  >
                    <Plus className="size-3.5" />
                    Add Field
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setEntities([
                    ...entities,
                    { name: "", fields: [""], relations: [""] },
                  ])
                }
                className="inline-flex items-center gap-2 text-sm font-medium text-brand"
              >
                <Plus className="size-4" />
                Add Entity
              </button>
            </div>
          </section>

          {/* Auth */}
          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Auth Provider</h2>
            <div className="mt-6">
              <input
                value={authProvider}
                onChange={(e) => setAuthProvider(e.target.value)}
                placeholder="Clerk"
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </div>
          </section>

          {/* Sticky Save Bar */}
          <section className="sticky bottom-6 rounded-2xl border border-default bg-surface/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">architecture.md</p>
                <p className="mt-1 text-xs text-copy-muted">
                  {hasDocument ? "Edit and save your changes." : "Generate the architecture file."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!canSave}
                  className="inline-flex items-center gap-2 rounded-xl border border-default px-4 py-2.5 text-sm font-medium transition hover:border-brand hover:text-brand disabled:opacity-40"
                >
                  <Download className="size-4" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:opacity-40"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}