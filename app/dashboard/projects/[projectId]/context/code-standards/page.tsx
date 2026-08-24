"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Download, Save, Loader2 } from "lucide-react";

type CodeStandardsDocument = {
  id: string;
  project_id: string;
  file_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function CodeStandardsPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  const [generalRules, setGeneralRules] = useState<string[]>([""]);
  const [languageRules, setLanguageRules] = useState<string[]>([""]);
  const [frameworkRules, setFrameworkRules] = useState<string[]>([""]);
  const [componentRules, setComponentRules] = useState<string[]>([""]);
  const [stylingRules, setStylingRules] = useState<string[]>([""]);
  const [apiRules, setApiRules] = useState<string[]>([""]);
  const [authProvider, setAuthProvider] = useState("");
  const [authRules, setAuthRules] = useState<string[]>([""]);
  const [validationRules, setValidationRules] = useState<string[]>([""]);
  const [businessLogicRules, setBusinessLogicRules] = useState<string[]>([""]);
  const [databaseClient, setDatabaseClient] = useState("");
  const [databaseRules, setDatabaseRules] = useState<string[]>([""]);
  const [dataIntegrityRules, setDataIntegrityRules] = useState<string[]>([""]);
  const [errorHandlingRules, setErrorHandlingRules] = useState<string[]>([""]);
  const [loadingRules, setLoadingRules] = useState<string[]>([""]);
  const [fileOrganizationRules, setFileOrganizationRules] = useState<string[]>([""]);
  const [namingRules, setNamingRules] = useState<string[]>([""]);
  const [dependencyRules, setDependencyRules] = useState<string[]>([""]);
  const [securityRules, setSecurityRules] = useState<string[]>([""]);
  const [documentationRules, setDocumentationRules] = useState<string[]>([""]);
  const [completionChecks, setCompletionChecks] = useState<string[]>([""]);

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

    const general = getSection("## General");
    const generalClean = cleanBullets(general);
    if (generalClean.length > 0) setGeneralRules(generalClean);

    const languageSection = lines
      .slice(lines.findIndex((line) => line.startsWith("## ") && !line.startsWith("## General") && !line.startsWith("## Framework")))
      .filter((line) => !line.startsWith("## "));

    const languageClean = cleanBullets(languageSection);
    if (languageClean.length > 0) setLanguageRules(languageClean);

    const framework = getSection("## Framework");
    const frameworkClean = cleanBullets(framework);
    if (frameworkClean.length > 0) setFrameworkRules(frameworkClean);

    const components = getSection("## Components / UI Code");
    const componentsClean = cleanBullets(components);
    if (componentsClean.length > 0) setComponentRules(componentsClean);

    const styling = getSection("## Styling");
    const stylingClean = cleanBullets(styling);
    if (stylingClean.length > 0) setStylingRules(stylingClean);

    const api = getSection("## API / Server Routes");
    const apiClean = cleanBullets(api);
    if (apiClean.length > 0) setApiRules(apiClean);

    const authSection = getSection("## Authentication and Authorization");
    const authProviderLine = authSection
      .map((line) => line.trim())
      .find((line) => line.includes("is the authentication provider"));
    if (authProviderLine) {
      setAuthProvider(authProviderLine.split(" is the")[0].trim());
    }
    const authClean = cleanBullets(authSection).filter(
      (line) => !line.includes("is the authentication provider"),
    );
    if (authClean.length > 0) setAuthRules(authClean);

    const validation = getSection("## Validation");
    const validationClean = cleanBullets(validation);
    if (validationClean.length > 0) setValidationRules(validationClean);

    const business = getSection("## Business Logic");
    const businessClean = cleanBullets(business);
    if (businessClean.length > 0) setBusinessLogicRules(businessClean);

    const database = getSection("## Database");
    const dbClientLine = database
      .map((line) => line.trim())
      .find((line) => line.includes("All database access goes through"));
    if (dbClientLine) {
      setDatabaseClient(
        dbClientLine.replace("All database access goes through ", "").replace(".", "").trim(),
      );
    }
    const dbClean = cleanBullets(database).filter(
      (line) => !line.includes("All database access goes through"),
    );
    if (dbClean.length > 0) setDatabaseRules(dbClean);

    const integrity = getSection("## Data Integrity");
    const integrityClean = cleanBullets(integrity);
    if (integrityClean.length > 0) setDataIntegrityRules(integrityClean);

    const errorHandling = getSection("## Error Handling");
    const errorClean = cleanBullets(errorHandling);
    if (errorClean.length > 0) setErrorHandlingRules(errorClean);

    const loading = getSection("## Loading and Empty States");
    const loadingClean = cleanBullets(loading);
    if (loadingClean.length > 0) setLoadingRules(loadingClean);

    const fileOrg = getSection("## File Organization");
    const fileOrgClean = cleanBullets(fileOrg);
    if (fileOrgClean.length > 0) setFileOrganizationRules(fileOrgClean);

    const naming = getSection("## Naming");
    const namingClean = cleanBullets(naming);
    if (namingClean.length > 0) setNamingRules(namingClean);

    const dependencies = getSection("## Dependencies");
    const depClean = cleanBullets(dependencies);
    if (depClean.length > 0) setDependencyRules(depClean);

    const security = getSection("## Security");
    const securityClean = cleanBullets(security);
    if (securityClean.length > 0) setSecurityRules(securityClean);

    const docs = getSection("## Documentation and Context");
    const docsClean = cleanBullets(docs);
    if (docsClean.length > 0) setDocumentationRules(docsClean);

    const completion = getSection("## Before Marking a Feature Complete");
    const completionClean = cleanNumbered(completion);
    if (completionClean.length > 0) setCompletionChecks(completionClean);
  };

  useEffect(() => {
    if (!projectId) return;

    const loadDocument = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/projects/${projectId}/context/code-standards`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load code-standards");
        }

        const document = data.document as CodeStandardsDocument | null;

        if (document?.content) {
          setHasDocument(true);
          parseMarkdown(document.content);
        }
      } catch (error) {
        console.error("Load code-standards error:", error);
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

  const canSave = true;

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

    return `# Code Standards

## General

${list(generalRules)}

---

## TypeScript

${list(languageRules)}

---

## Next.js

${list(frameworkRules)}

---

## Components / UI Code

${list(componentRules)}

---

## Styling

${list(stylingRules)}

---

## API / Server Routes

${list(apiRules)}

---

## Authentication and Authorization

- ${clean(authProvider) || "[Auth provider]"} is the authentication provider.

${list(authRules)}

---

## Validation

${list(validationRules)}

---

## Business Logic

${list(businessLogicRules)}

---

## Database

- All database access goes through ${clean(databaseClient) || "[ORM/client]"}.

${list(databaseRules)}

---

## Data Integrity

${list(dataIntegrityRules)}

---

## Error Handling

${list(errorHandlingRules)}

---

## Loading and Empty States

${list(loadingRules)}

---

## File Organization

${list(fileOrganizationRules)}

---

## Naming

${list(namingRules)}

---

## Dependencies

${list(dependencyRules)}

---

## Security

${list(securityRules)}

---

## Documentation and Context

${list(documentationRules)}

---

## Before Marking a Feature Complete

${numbered(completionChecks)}
`;
  };

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);

    try {
      const answers = {
        generalRules,
        languageRules,
        frameworkRules,
        componentRules,
        stylingRules,
        apiRules,
        authProvider,
        authRules,
        validationRules,
        businessLogicRules,
        databaseClient,
        databaseRules,
        dataIntegrityRules,
        errorHandlingRules,
        loadingRules,
        fileOrganizationRules,
        namingRules,
        dependencyRules,
        securityRules,
        documentationRules,
        completionChecks,
      };

      const response = await fetch(
        `/api/projects/${projectId}/context/code-standards`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save code-standards.md");
      }

      setHasDocument(true);
    } catch (error) {
      console.error("Save code-standards error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!canSave) return;

    const blob = new Blob([buildMarkdown()], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "code-standards.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm text-copy-muted">Loading code-standards...</p>
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
          <p className="font-mono text-xs text-brand">code-standards.md</p>
          <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
            Code Standards
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-copy-muted">
            Define coding conventions, patterns, and quality rules.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <ListSection
            title="General Rules"
            items={generalRules}
            placeholder="Keep modules small and single-purpose"
            onAdd={() => addListItem(generalRules, setGeneralRules)}
            onRemove={(index) => removeListItem(generalRules, setGeneralRules, index)}
            update={(index, value) => updateListItem(generalRules, setGeneralRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Language Rules"
            items={languageRules}
            placeholder="Strict mode is required"
            onAdd={() => addListItem(languageRules, setLanguageRules)}
            onRemove={(index) => removeListItem(languageRules, setLanguageRules, index)}
            update={(index, value) => updateListItem(languageRules, setLanguageRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Framework Rules"
            items={frameworkRules}
            placeholder="Default to Server Components"
            onAdd={() => addListItem(frameworkRules, setFrameworkRules)}
            onRemove={(index) => removeListItem(frameworkRules, setFrameworkRules, index)}
            update={(index, value) => updateListItem(frameworkRules, setFrameworkRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Component Rules"
            items={componentRules}
            placeholder="Each component has one clear responsibility"
            onAdd={() => addListItem(componentRules, setComponentRules)}
            onRemove={(index) => removeListItem(componentRules, setComponentRules, index)}
            update={(index, value) => updateListItem(componentRules, setComponentRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Styling Rules"
            items={stylingRules}
            placeholder="Use tokens from ui-context.md"
            onAdd={() => addListItem(stylingRules, setStylingRules)}
            onRemove={(index) => removeListItem(stylingRules, setStylingRules, index)}
            update={(index, value) => updateListItem(stylingRules, setStylingRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="API Rules"
            items={apiRules}
            placeholder="Validate input before executing logic"
            onAdd={() => addListItem(apiRules, setApiRules)}
            onRemove={(index) => removeListItem(apiRules, setApiRules, index)}
            update={(index, value) => updateListItem(apiRules, setApiRules, index, value)}
            addLabel="Add Rule"
          />

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Authentication Provider</h2>
            <div className="mt-6">
              <input
                value={authProvider}
                onChange={(e) => setAuthProvider(e.target.value)}
                placeholder="Clerk"
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </div>
            <div className="mt-6 space-y-2">
              {authRules.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateListItem(authRules, setAuthRules, index, e.target.value)}
                    placeholder="Authentication rule"
                    className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(authRules, setAuthRules, index)}
                    className="rounded-xl border border-default px-3 text-red-400"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addListItem(authRules, setAuthRules)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Rule
            </button>
          </section>

          <ListSection
            title="Validation Rules"
            items={validationRules}
            placeholder="Treat all external input as untrusted"
            onAdd={() => addListItem(validationRules, setValidationRules)}
            onRemove={(index) => removeListItem(validationRules, setValidationRules, index)}
            update={(index, value) => updateListItem(validationRules, setValidationRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Business Logic Rules"
            items={businessLogicRules}
            placeholder="Business rules live in server-side modules"
            onAdd={() => addListItem(businessLogicRules, setBusinessLogicRules)}
            onRemove={(index) => removeListItem(businessLogicRules, setBusinessLogicRules, index)}
            update={(index, value) => updateListItem(businessLogicRules, setBusinessLogicRules, index, value)}
            addLabel="Add Rule"
          />

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Database Client</h2>
            <div className="mt-6">
              <input
                value={databaseClient}
                onChange={(e) => setDatabaseClient(e.target.value)}
                placeholder="Prisma"
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </div>
            <div className="mt-6 space-y-2">
              {databaseRules.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateListItem(databaseRules, setDatabaseRules, index, e.target.value)}
                    placeholder="Database rule"
                    className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(databaseRules, setDatabaseRules, index)}
                    className="rounded-xl border border-default px-3 text-red-400"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addListItem(databaseRules, setDatabaseRules)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Rule
            </button>
          </section>

          <ListSection
            title="Data Integrity Rules"
            items={dataIntegrityRules}
            placeholder="Every entity belongs to an authenticated user"
            onAdd={() => addListItem(dataIntegrityRules, setDataIntegrityRules)}
            onRemove={(index) => removeListItem(dataIntegrityRules, setDataIntegrityRules, index)}
            update={(index, value) => updateListItem(dataIntegrityRules, setDataIntegrityRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Error Handling Rules"
            items={errorHandlingRules}
            placeholder="Handle expected errors explicitly"
            onAdd={() => addListItem(errorHandlingRules, setErrorHandlingRules)}
            onRemove={(index) => removeListItem(errorHandlingRules, setErrorHandlingRules, index)}
            update={(index, value) => updateListItem(errorHandlingRules, setErrorHandlingRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Loading and Empty States"
            items={loadingRules}
            placeholder="Provide loading feedback"
            onAdd={() => addListItem(loadingRules, setLoadingRules)}
            onRemove={(index) => removeListItem(loadingRules, setLoadingRules, index)}
            update={(index, value) => updateListItem(loadingRules, setLoadingRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="File Organization"
            items={fileOrganizationRules}
            placeholder="Mirror structure from architecture.md"
            onAdd={() => addListItem(fileOrganizationRules, setFileOrganizationRules)}
            onRemove={(index) => removeListItem(fileOrganizationRules, setFileOrganizationRules, index)}
            update={(index, value) => updateListItem(fileOrganizationRules, setFileOrganizationRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Naming Conventions"
            items={namingRules}
            placeholder="Use descriptive names"
            onAdd={() => addListItem(namingRules, setNamingRules)}
            onRemove={(index) => removeListItem(namingRules, setNamingRules, index)}
            update={(index, value) => updateListItem(namingRules, setNamingRules, index, value)}
            addLabel="Add Rule"
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
            title="Security Rules"
            items={securityRules}
            placeholder="Never trust client-provided ownership"
            onAdd={() => addListItem(securityRules, setSecurityRules)}
            onRemove={(index) => removeListItem(securityRules, setSecurityRules, index)}
            update={(index, value) => updateListItem(securityRules, setSecurityRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Documentation Rules"
            items={documentationRules}
            placeholder="Architecture boundaries → update architecture.md"
            onAdd={() => addListItem(documentationRules, setDocumentationRules)}
            onRemove={(index) => removeListItem(documentationRules, setDocumentationRules, index)}
            update={(index, value) => updateListItem(documentationRules, setDocumentationRules, index, value)}
            addLabel="Add Rule"
          />

          <ListSection
            title="Completion Checks"
            items={completionChecks}
            placeholder="Verify the implementation matches the feature"
            onAdd={() => addListItem(completionChecks, setCompletionChecks)}
            onRemove={(index) => removeListItem(completionChecks, setCompletionChecks, index)}
            update={(index, value) => updateListItem(completionChecks, setCompletionChecks, index, value)}
            addLabel="Add Check"
          />

          <section className="sticky bottom-6 rounded-2xl border border-default bg-surface/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-copy-primary">code-standards.md</p>
                <p className="mt-1 text-xs text-copy-muted">
                  {hasDocument ? "Edit and save your changes." : "Generate the code standards file."}
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