"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Download } from "lucide-react";

type StackItem = {
  layer: string;
  technology: string;
  role: string;
};

type Folder = {
  name: string;
  responsibility: string;
};

type DomainEntity = {
  name: string;
  description: string;
  fields: string[];
  relations: string[];
};

type StatusModel = {
  entity: string;
  states: string[];
  transitionRules: string[];
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

  const [stack, setStack] = useState<StackItem[]>([
    {
      layer: "",
      technology: "",
      role: "",
    },
  ]);

  const [optionalTechnologies, setOptionalTechnologies] = useState<string[]>([
    "",
  ]);

  const [folders, setFolders] = useState<Folder[]>([
    {
      name: "",
      responsibility: "",
    },
  ]);

  const [presentationResponsibilities, setPresentationResponsibilities] =
    useState<string[]>([""]);

  const [presentationRule, setPresentationRule] = useState("");

  const [applicationResponsibilities, setApplicationResponsibilities] =
    useState<string[]>([""]);

  const [applicationRule, setApplicationRule] = useState("");

  const [dataResponsibilities, setDataResponsibilities] = useState<string[]>([
    "",
  ]);

  const [primaryDatabase, setPrimaryDatabase] = useState("");

  const [databaseEntities, setDatabaseEntities] = useState<string[]>([""]);

  const [fileStorage, setFileStorage] = useState("");

  const [entities, setEntities] = useState<DomainEntity[]>([
    {
      name: "",
      description: "",
      fields: [""],
      relations: [""],
    },
  ]);

  const [lifecycleEntity, setLifecycleEntity] = useState("");
  const [lifecycleSteps, setLifecycleSteps] = useState<string[]>([""]);

  const [authRules, setAuthRules] = useState<string[]>([""]);

  const [statusModels, setStatusModels] = useState<StatusModel[]>([
    {
      entity: "",
      states: [""],
      transitionRules: [""],
    },
  ]);

  const [statusOpenQuestions, setStatusOpenQuestions] = useState<string[]>([
    "",
  ]);

  const [apiBoundaries, setApiBoundaries] = useState<string[]>([""]);

  const [validationBoundaries, setValidationBoundaries] = useState<string[]>([
    "",
  ]);

  const [dataIntegrityRules, setDataIntegrityRules] = useState<string[]>([
    "",
  ]);

  const [invariants, setInvariants] = useState<string[]>([""]);

  const [architectureChangeRules, setArchitectureChangeRules] = useState<
    string[]
  >([""]);

  const [initialDecisions, setInitialDecisions] = useState<
    { decision: string; reason: string }[]
  >([
    {
      decision: "",
      reason: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);

  const parseMarkdown = (content: string) => {
    const lines = content.split("\n");

    const getSection = (heading: string) => {
      const startIndex = lines.findIndex(
        (line) => line.trim() === heading,
      );

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
        .filter((line) => line !== "Not specified");

    const stripBullet = (line: string) =>
      line.replace(/^-\s*/, "").trim();

    const stripNumber = (line: string) =>
      line.replace(/^\d+\.\s*/, "").trim();

    const stackSection = getSection("## Stack");

    const parsedStack: StackItem[] = [];

    for (const line of stackSection) {
      const match = line.match(
        /^\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|$/,
      );

      if (
        match &&
        !match[1].includes("---") &&
        match[1].trim() !== "Layer"
      ) {
        parsedStack.push({
          layer: match[1].trim(),
          technology: match[2].trim(),
          role: match[3].trim(),
        });
      }
    }

    const optionalSection = getSection("## Optional Technologies");

    const parsedOptional = cleanLines(optionalSection)
      .map(stripBullet)
      .map((line) =>
        line
          .replace(
            /\s+is preferred because\s+.*$/i,
            "",
          )
          .trim(),
      )
      .filter(Boolean);

    const boundariesSection = getSection("## System Boundaries");
    const parsedFolders = cleanLines(boundariesSection)
      .map(stripBullet)
      .map((line) => {
        const separator = line.indexOf("—");

        if (separator === -1) {
          return {
            name: line,
            responsibility: "",
          };
        }

        return {
          name: line.slice(0, separator).replace(/`/g, "").trim(),
          responsibility: line.slice(separator + 1).trim(),
        };
      });

    const presentation = getSection("### Presentation Layer");
    const application = getSection("### Application Layer");
    const data = getSection("### Data Layer");

    const extractRule = (section: string[]) =>
      section
        .map((line) => line.trim())
        .find(
          (line) =>
            line &&
            !line.startsWith("Responsible for:") &&
            !line.startsWith("-"),
        ) || "";

    const extractResponsibilities = (section: string[]) =>
      section
        .map((line) => line.trim())
        .filter(
          (line) =>
            line.startsWith("- ") &&
            !line.includes("e.g."),
        )
        .map(stripBullet);

    const storageSection = getSection("## Storage Model");
    const primaryDbIndex = storageSection.findIndex((line) =>
      line.trim().startsWith("### "),
    );

    let parsedPrimaryDatabase = "";

    if (primaryDbIndex !== -1) {
      parsedPrimaryDatabase = storageSection[primaryDbIndex]
        .replace(/^###\s*/, "")
        .trim();
    }

    const databaseLines = storageSection
      .filter((line) => line.trim().startsWith("- "))
      .map(stripBullet);

    const fileStorageIndex = storageSection.findIndex(
      (line) => line.trim() === "### File Storage",
    );

    let parsedFileStorage = "";

    if (fileStorageIndex !== -1) {
      parsedFileStorage = storageSection
        .slice(fileStorageIndex + 1)
        .filter((line) => line.trim())
        .join("\n")
        .trim();
    }

    const domainSection = getSection("## Core Domain Model");
    const parsedEntities: DomainEntity[] = [];

    let currentEntity: DomainEntity | null = null;
    let entityMode: "none" | "fields" | "relations" = "none";

    for (const rawLine of domainSection) {
      const line = rawLine.trim();

      if (!line) continue;

      if (line.startsWith("### ")) {
        if (currentEntity) {
          parsedEntities.push(currentEntity);
        }

        currentEntity = {
          name: line.replace(/^###\s*/, "").trim(),
          description: "",
          fields: [],
          relations: [],
        };

        entityMode = "none";
        continue;
      }

      if (!currentEntity) continue;

      if (line.startsWith("Represents ")) {
        currentEntity.description = line;
        entityMode = "none";
        continue;
      }

      if (line === "Contains:") {
        entityMode = "fields";
        continue;
      }

      if (line === "Related to:") {
        entityMode = "relations";
        continue;
      }

      if (line.startsWith("- ")) {
        if (entityMode === "fields") {
          currentEntity.fields.push(stripBullet(line));
        } else if (entityMode === "relations") {
          currentEntity.relations.push(stripBullet(line));
        }
      }
    }

    if (currentEntity) {
      parsedEntities.push(currentEntity);
    }

    const lifecycleSection = getSection(
      "## [Primary Entity] Lifecycle / Core Flow",
    );

    const parsedLifecycleSteps = cleanLines(lifecycleSection)
      .filter((line) => /^\d+\./.test(line))
      .map(stripNumber);

    const authSection = getSection("## Auth and Access Model");

    const parsedAuthRules = cleanLines(authSection)
      .map(stripBullet)
      .filter(Boolean);

    const statusSection = getSection("## Status Model");

    const parsedStatusModels: StatusModel[] = [];
    let currentStatus: StatusModel | null = null;
    let statusMode: "none" | "states" | "rules" = "none";

    for (const rawLine of statusSection) {
      const line = rawLine.trim();

      if (!line) continue;

      if (line.startsWith("### ") && !line.includes("Open Questions")) {
        if (currentStatus) {
          parsedStatusModels.push(currentStatus);
        }

        currentStatus = {
          entity: line.replace(/^###\s*/, "").replace(/\s+Status$/, "").trim(),
          states: [],
          transitionRules: [],
        };

        statusMode = "none";
        continue;
      }

      if (line === "Possible states:") {
        statusMode = "states";
        continue;
      }

      if (
        line.startsWith("Only valid transitions") ||
        line.startsWith("Valid transitions")
      ) {
        statusMode = "rules";
        continue;
      }

      if (line.startsWith("- ") && currentStatus) {
        if (statusMode === "states") {
          currentStatus.states.push(stripBullet(line));
        } else if (statusMode === "rules") {
          currentStatus.transitionRules.push(stripBullet(line));
        }
      }
    }

    if (currentStatus) {
      parsedStatusModels.push(currentStatus);
    }

    const openQuestionsIndex = statusSection.findIndex(
      (line) => line.trim() === "### Open Questions",
    );

    const parsedOpenQuestions =
      openQuestionsIndex === -1
        ? []
        : statusSection
            .slice(openQuestionsIndex + 1)
            .map((line) => line.trim())
            .filter((line) => line.startsWith("- "))
            .map(stripBullet);

    const parsedApi = cleanLines(
      getSection("## API and Server Boundaries"),
    ).map(stripBullet);

    const parsedValidation = cleanLines(
      getSection("## Validation Boundary"),
    ).map(stripBullet);

    const parsedIntegrity = cleanLines(
      getSection("## Data Integrity Rules"),
    )
      .filter((line) => /^\d+\./.test(line))
      .map(stripNumber);

    const parsedInvariants = cleanLines(
      getSection("## Invariants"),
    )
      .filter((line) => /^\d+\./.test(line))
      .map(stripNumber);

    const parsedChangeRules = cleanLines(
      getSection("## Architecture Change Rules"),
    ).map(stripBullet);

    const decisionsSection = getSection(
      "## Initial Architecture Decisions",
    );

    const parsedDecisions: { decision: string; reason: string }[] = [];

    let currentDecision: {
      decision: string;
      reason: string;
    } | null = null;

    for (const rawLine of decisionsSection) {
      const line = rawLine.trim();

      if (!line) continue;

      if (line.startsWith("### ")) {
        if (currentDecision) {
          parsedDecisions.push(currentDecision);
        }

        currentDecision = {
          decision: line.replace(/^###\s*/, "").trim(),
          reason: "",
        };

        continue;
      }

      if (currentDecision && line.startsWith("Chosen because")) {
        currentDecision.reason = line;
      }
    }

    if (currentDecision) {
      parsedDecisions.push(currentDecision);
    }

    if (parsedStack.length > 0) setStack(parsedStack);

    if (parsedOptional.length > 0) {
      setOptionalTechnologies(parsedOptional);
    }

    if (parsedFolders.length > 0) {
      setFolders(parsedFolders);
    }

    if (presentation.length > 0) {
      setPresentationResponsibilities(
        extractResponsibilities(presentation).length > 0
          ? extractResponsibilities(presentation)
          : [""],
      );
      setPresentationRule(extractRule(presentation));
    }

    if (application.length > 0) {
      setApplicationResponsibilities(
        extractResponsibilities(application).length > 0
          ? extractResponsibilities(application)
          : [""],
      );
      setApplicationRule(extractRule(application));
    }

    if (data.length > 0) {
      setDataResponsibilities(
        extractResponsibilities(data).length > 0
          ? extractResponsibilities(data)
          : [""],
      );
    }

    if (parsedPrimaryDatabase) {
      setPrimaryDatabase(parsedPrimaryDatabase);
    }

    if (databaseLines.length > 0) {
      setDatabaseEntities(databaseLines);
    }

    if (parsedFileStorage) {
      setFileStorage(parsedFileStorage);
    }

    if (parsedEntities.length > 0) {
      setEntities(
        parsedEntities.map((entity) => ({
          ...entity,
          fields: entity.fields.length > 0 ? entity.fields : [""],
          relations:
            entity.relations.length > 0
              ? entity.relations
              : [""],
        })),
      );
    }

    if (parsedLifecycleSteps.length > 0) {
      setLifecycleSteps(parsedLifecycleSteps);
    }

    if (parsedAuthRules.length > 0) {
      setAuthRules(parsedAuthRules);
    }

    if (parsedStatusModels.length > 0) {
      setStatusModels(
        parsedStatusModels.map((status) => ({
          ...status,
          states:
            status.states.length > 0
              ? status.states
              : [""],
          transitionRules:
            status.transitionRules.length > 0
              ? status.transitionRules
              : [""],
        })),
      );
    }

    if (parsedOpenQuestions.length > 0) {
      setStatusOpenQuestions(parsedOpenQuestions);
    }

    if (parsedApi.length > 0) setApiBoundaries(parsedApi);
    if (parsedValidation.length > 0) {
      setValidationBoundaries(parsedValidation);
    }
    if (parsedIntegrity.length > 0) {
      setDataIntegrityRules(parsedIntegrity);
    }
    if (parsedInvariants.length > 0) {
      setInvariants(parsedInvariants);
    }
    if (parsedChangeRules.length > 0) {
      setArchitectureChangeRules(parsedChangeRules);
    }

    if (parsedDecisions.length > 0) {
      setInitialDecisions(parsedDecisions);
    }
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
          throw new Error(
            data.error || "Failed to load architecture",
          );
        }

        const document =
          data.document as ArchitectureDocument | null;

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

  const addListItem = (
    list: string[],
    setList: (value: string[]) => void,
  ) => {
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

    setList(
      list.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    );
  };

  const updateStackItem = (
    index: number,
    field: keyof StackItem,
    value: string,
  ) => {
    const updated = [...stack];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setStack(updated);
  };

  const addStackItem = () => {
    setStack([
      ...stack,
      {
        layer: "",
        technology: "",
        role: "",
      },
    ]);
  };

  const removeStackItem = (index: number) => {
    if (stack.length === 1) {
      setStack([
        {
          layer: "",
          technology: "",
          role: "",
        },
      ]);
      return;
    }

    setStack(
      stack.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    );
  };

  const updateFolder = (
    index: number,
    field: keyof Folder,
    value: string,
  ) => {
    const updated = [...folders];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setFolders(updated);
  };

  const addFolder = () => {
    setFolders([
      ...folders,
      {
        name: "",
        responsibility: "",
      },
    ]);
  };

  const removeFolder = (index: number) => {
    if (folders.length === 1) {
      setFolders([
        {
          name: "",
          responsibility: "",
        },
      ]);
      return;
    }

    setFolders(
      folders.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    );
  };

  const updateEntity = (
    index: number,
    field: "name" | "description",
    value: string,
  ) => {
    const updated = [...entities];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setEntities(updated);
  };

  const updateEntityList = (
    entityIndex: number,
    field: "fields" | "relations",
    itemIndex: number,
    value: string,
  ) => {
    const updated = [...entities];
    const list = [...updated[entityIndex][field]];

    list[itemIndex] = value;

    updated[entityIndex] = {
      ...updated[entityIndex],
      [field]: list,
    };

    setEntities(updated);
  };

  const addEntityListItem = (
    entityIndex: number,
    field: "fields" | "relations",
  ) => {
    const updated = [...entities];

    updated[entityIndex] = {
      ...updated[entityIndex],
      [field]: [
        ...updated[entityIndex][field],
        "",
      ],
    };

    setEntities(updated);
  };

  const removeEntityListItem = (
    entityIndex: number,
    field: "fields" | "relations",
    itemIndex: number,
  ) => {
    const updated = [...entities];
    const list = updated[entityIndex][field];

    updated[entityIndex] = {
      ...updated[entityIndex],
      [field]:
        list.length === 1
          ? [""]
          : list.filter(
              (_, index) => index !== itemIndex,
            ),
    };

    setEntities(updated);
  };

  const addEntity = () => {
    setEntities([
      ...entities,
      {
        name: "",
        description: "",
        fields: [""],
        relations: [""],
      },
    ]);
  };

  const removeEntity = (index: number) => {
    if (entities.length === 1) {
      setEntities([
        {
          name: "",
          description: "",
          fields: [""],
          relations: [""],
        },
      ]);
      return;
    }

    setEntities(
      entities.filter(
        (_, entityIndex) => entityIndex !== index,
      ),
    );
  };

  const updateStatusModel = (
    index: number,
    field: "entity",
    value: string,
  ) => {
    const updated = [...statusModels];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setStatusModels(updated);
  };

  const updateStatusList = (
    statusIndex: number,
    field: "states" | "transitionRules",
    itemIndex: number,
    value: string,
  ) => {
    const updated = [...statusModels];
    const list = [...updated[statusIndex][field]];

    list[itemIndex] = value;

    updated[statusIndex] = {
      ...updated[statusIndex],
      [field]: list,
    };

    setStatusModels(updated);
  };

  const addStatusListItem = (
    statusIndex: number,
    field: "states" | "transitionRules",
  ) => {
    const updated = [...statusModels];

    updated[statusIndex] = {
      ...updated[statusIndex],
      [field]: [
        ...updated[statusIndex][field],
        "",
      ],
    };

    setStatusModels(updated);
  };

  const removeStatusListItem = (
    statusIndex: number,
    field: "states" | "transitionRules",
    itemIndex: number,
  ) => {
    const updated = [...statusModels];
    const list = updated[statusIndex][field];

    updated[statusIndex] = {
      ...updated[statusIndex],
      [field]:
        list.length === 1
          ? [""]
          : list.filter(
              (_, index) => index !== itemIndex,
            ),
    };

    setStatusModels(updated);
  };

  const addStatusModel = () => {
    setStatusModels([
      ...statusModels,
      {
        entity: "",
        states: [""],
        transitionRules: [""],
      },
    ]);
  };

  const removeStatusModel = (index: number) => {
    if (statusModels.length === 1) {
      setStatusModels([
        {
          entity: "",
          states: [""],
          transitionRules: [""],
        },
      ]);
      return;
    }

    setStatusModels(
      statusModels.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    );
  };

  const updateDecision = (
    index: number,
    field: "decision" | "reason",
    value: string,
  ) => {
    const updated = [...initialDecisions];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setInitialDecisions(updated);
  };

  const addDecision = () => {
    setInitialDecisions([
      ...initialDecisions,
      {
        decision: "",
        reason: "",
      },
    ]);
  };

  const removeDecision = (index: number) => {
    if (initialDecisions.length === 1) {
      setInitialDecisions([
        {
          decision: "",
          reason: "",
        },
      ]);
      return;
    }

    setInitialDecisions(
      initialDecisions.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    );
  };

  const canSave =
  stack.some(
    (item) =>
      item.layer.trim() &&
      item.technology.trim(),
  ) ||
  folders.some(
    (folder) => folder.name.trim(),
  ) ||
  entities.some(
    (entity) => entity.name.trim(),
  );

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

    const stackRows = stack
      .filter(
        (item) =>
          item.layer.trim() ||
          item.technology.trim() ||
          item.role.trim(),
      )
      .map(
        (item) =>
          `| ${clean(item.layer)} | ${clean(item.technology)} | ${clean(item.role)} |`,
      )
      .join("\n");

    const folderLines = folders
      .filter(
        (folder) =>
          folder.name.trim() ||
          folder.responsibility.trim(),
      )
      .map(
        (folder) =>
          `- \`${clean(folder.name)}\` — ${clean(
            folder.responsibility,
          )}`,
      )
      .join("\n");

    const entitySections = entities
      .filter(
        (entity) =>
          entity.name.trim() ||
          entity.description.trim() ||
          entity.fields.some((field) => field.trim()) ||
          entity.relations.some((relation) => relation.trim()),
      )
      .map((entity) => {
        const fields = list(entity.fields);
        const relations = list(entity.relations);

        return `### ${clean(entity.name) || "Unnamed Entity"}

${clean(entity.description) || "Not specified"}.

Contains:

${fields}

Related to:

${relations}`;
      })
      .join("\n\n");

    const statusSections = statusModels
      .filter(
        (status) =>
          status.entity.trim() ||
          status.states.some((state) => state.trim()) ||
          status.transitionRules.some((rule) => rule.trim()),
      )
      .map((status) => {
        const transitions = status.transitionRules
          .map(clean)
          .filter(Boolean)
          .map((rule) => `- ${rule}`)
          .join("\n");

        return `### ${clean(status.entity) || "Entity"} Status

Possible states:

${list(status.states)}

${
  transitions
    ? `Only valid transitions defined by the application are allowed.

${transitions}`
    : "Only valid transitions defined by the application are allowed."
}`;
      })
      .join("\n\n");

    const decisionSections = initialDecisions
      .filter(
        (item) =>
          item.decision.trim() ||
          item.reason.trim(),
      )
      .map(
        (item) =>
          `### ${clean(item.decision) || "Architecture Decision"}

Chosen because ${clean(item.reason) || "Not specified"}.`,
      )
      .join("\n\n");

    return `# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
${stackRows || "| | | |"}

### Optional Technologies

${optionalTechnologies
  .map(clean)
  .filter(Boolean)
  .map(
    (item) =>
      `- ${item} is preferred because there is a clear project requirement for it.`,
  )
  .join("\n") ||
  "- No optional technologies are currently required."}

---

## System Boundaries

${folderLines || "- Not specified"}

---

## Application Architecture

### Presentation Layer

Responsible for:

${list(presentationResponsibilities)}

${clean(presentationRule) || "UI components must not directly access the database."}

### Application Layer

Responsible for:

${list(applicationResponsibilities)}

${clean(applicationRule) || "Business logic should not be duplicated across multiple routes or components."}

### Data Layer

Responsible for:

${list(dataResponsibilities)}

---

## Storage Model

### ${clean(primaryDatabase) || "Primary Database"}

The database stores:

${list(databaseEntities)}

### File Storage

${clean(fileStorage) || "File/blob storage is not required yet. The storage strategy must be defined here before implementation."}

---

## Core Domain Model

${entitySections || "Not specified"}

---

## ${clean(lifecycleEntity) || "[Primary Entity]"} Lifecycle / Core Flow

${numbered(lifecycleSteps)}

The system must prevent invalid state transitions.

---

## Auth and Access Model

${list(authRules)}

---

## Status Model

${statusSections || "Not specified"}

### Open Questions

${list(statusOpenQuestions)}

---

## API and Server Boundaries

${list(apiBoundaries)}

---

## Validation Boundary

All external input is treated as untrusted. Validation happens before application logic executes.

${list(validationBoundaries)}

---

## Data Integrity Rules

${numbered(dataIntegrityRules)}

---

## Invariants

${numbered(invariants)}

---

## Architecture Change Rules

${list(architectureChangeRules)}

---

## Initial Architecture Decisions

${decisionSections || "Not specified"}
`;
  };

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);

    try {
      const answers = {
        stack,
        optionalTechnologies: optionalTechnologies
          .map((item) => item.trim())
          .filter(Boolean),
        folders,
        presentationResponsibilities,
        presentationRule,
        applicationResponsibilities,
        applicationRule,
        dataResponsibilities,
        primaryDatabase,
        databaseEntities,
        fileStorage,
        entities,
        lifecycleEntity,
        lifecycleSteps,
        authRules,
        statusModels,
        statusOpenQuestions,
        apiBoundaries,
        validationBoundaries,
        dataIntegrityRules,
        invariants,
        architectureChangeRules,
        initialDecisions,
      };

      const response = await fetch(
        `/api/projects/${projectId}/context/architecture`,
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
        throw new Error(
          data.error ||
            "Failed to save architecture.md",
        );
      }

      setHasDocument(true);
    } catch (error) {
      console.error("Save architecture error:", error);
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
          <p className="text-sm text-copy-muted">
            Loading architecture...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/dashboard/projects/${projectId}`,
            )
          }
          className="inline-flex items-center gap-2 text-sm text-copy-muted transition hover:text-copy-primary"
        >
          <ArrowLeft className="size-4" />
          Back to Project
        </button>

        <div className="mt-8">
          <p className="font-mono text-xs text-brand">
            architecture.md
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
            Architecture
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-copy-muted">
            Define the technical structure, system boundaries,
            domain model, data rules, and architectural constraints
            that guide implementation.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <section className="rounded-2xl border border-default bg-surface p-6">
            <SectionHeader
              title="Technology Stack"
              description="Define the technologies used by each architectural layer."
            />

            <div className="mt-6 space-y-3">
              {stack.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-2 md:grid-cols-[0.8fr_1fr_1.4fr_auto]"
                >
                  <input
                    value={item.layer}
                    onChange={(event) =>
                      updateStackItem(
                        index,
                        "layer",
                        event.target.value,
                      )
                    }
                    placeholder="Layer"
                    className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />

                  <input
                    value={item.technology}
                    onChange={(event) =>
                      updateStackItem(
                        index,
                        "technology",
                        event.target.value,
                      )
                    }
                    placeholder="Technology"
                    className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />

                  <input
                    value={item.role}
                    onChange={(event) =>
                      updateStackItem(
                        index,
                        "role",
                        event.target.value,
                      )
                    }
                    placeholder="What is it responsible for?"
                    className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeStackItem(index)
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
              onClick={addStackItem}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Technology
            </button>
          </section>

          <ListSection
            title="Optional Technologies"
            description="Only include technologies that have a real project requirement."
            items={optionalTechnologies}
            placeholder="Technology and reason"
            onAdd={() =>
              addListItem(
                optionalTechnologies,
                setOptionalTechnologies,
              )
            }
            onRemove={(index) =>
              removeListItem(
                optionalTechnologies,
                setOptionalTechnologies,
                index,
              )
            }
            update={(index, value) =>
              updateListItem(
                optionalTechnologies,
                setOptionalTechnologies,
                index,
                value,
              )
            }
            addLabel="Add Technology"
          />

          <section className="rounded-2xl border border-default bg-surface p-6">
            <SectionHeader
              title="System Boundaries"
              description="Define the top-level folders or modules and keep responsibilities from leaking across boundaries."
            />

            <div className="mt-6 space-y-3">
              {folders.map((folder, index) => (
                <div
                  key={index}
                  className="grid gap-2 md:grid-cols-[1fr_1.5fr_auto]"
                >
                  <input
                    value={folder.name}
                    onChange={(event) =>
                      updateFolder(
                        index,
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="folder/"
                    className="rounded-xl border border-default bg-base px-4 py-3 text-sm font-mono outline-none focus:border-brand"
                  />

                  <input
                    value={folder.responsibility}
                    onChange={(event) =>
                      updateFolder(
                        index,
                        "responsibility",
                        event.target.value,
                      )
                    }
                    placeholder="Responsibility"
                    className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeFolder(index)
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
              onClick={addFolder}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Boundary
            </button>
          </section>

          <ArchitectureLayerSection
            title="Presentation Layer"
            description="Define what belongs to the presentation layer."
            items={presentationResponsibilities}
            setItems={setPresentationResponsibilities}
            rule={presentationRule}
            setRule={setPresentationRule}
            rulePlaceholder="UI components must not directly access the database."
            addLabel="Add Responsibility"
          />

          <ArchitectureLayerSection
            title="Application Layer"
            description="Define business logic, validation, authorization, and application rules."
            items={applicationResponsibilities}
            setItems={setApplicationResponsibilities}
            rule={applicationRule}
            setRule={setApplicationRule}
            rulePlaceholder="Business logic should not be duplicated across routes or components."
            addLabel="Add Responsibility"
          />

          <ListSection
            title="Data Layer"
            description="Define what belongs to persistence and database access."
            items={dataResponsibilities}
            placeholder="Database access through the selected data technology"
            onAdd={() =>
              addListItem(
                dataResponsibilities,
                setDataResponsibilities,
              )
            }
            onRemove={(index) =>
              removeListItem(
                dataResponsibilities,
                setDataResponsibilities,
                index,
              )
            }
            update={(index, value) =>
              updateListItem(
                dataResponsibilities,
                setDataResponsibilities,
                index,
                value,
              )
            }
            addLabel="Add Responsibility"
          />

          <section className="rounded-2xl border border-default bg-surface p-6">
            <SectionHeader
              title="Storage Model"
              description="Define the primary database, stored entities, and file/blob storage strategy."
            />

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Primary Database
                </label>

                <input
                  value={primaryDatabase}
                  onChange={(event) =>
                    setPrimaryDatabase(
                      event.target.value,
                    )
                  }
                  placeholder="PostgreSQL"
                  className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                />
              </div>

              <ListSection
                title="Database Entities"
                description="What core entities are stored?"
                items={databaseEntities}
                placeholder="Entity"
                onAdd={() =>
                  addListItem(
                    databaseEntities,
                    setDatabaseEntities,
                  )
                }
                onRemove={(index) =>
                  removeListItem(
                    databaseEntities,
                    setDatabaseEntities,
                    index,
                  )
                }
                update={(index, value) =>
                  updateListItem(
                    databaseEntities,
                    setDatabaseEntities,
                    index,
                    value,
                  )
                }
                addLabel="Add Entity"
              />

              <div>
                <label className="mb-2 block text-sm font-medium">
                  File Storage
                </label>

                <textarea
                  value={fileStorage}
                  onChange={(event) =>
                    setFileStorage(event.target.value)
                  }
                  rows={4}
                  placeholder="Not required yet. Define the storage strategy here before implementing file/blob storage."
                  className="w-full resize-none rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <SectionHeader
              title="Core Domain Model"
              description="Define every core entity so implementation does not require inventing a data model."
            />

            <div className="mt-6 space-y-6">
              {entities.map((entity, entityIndex) => (
                <div
                  key={entityIndex}
                  className="rounded-xl border border-default p-4"
                >
                  <div className="flex gap-2">
                    <input
                      value={entity.name}
                      onChange={(event) =>
                        updateEntity(
                          entityIndex,
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Entity name"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeEntity(entityIndex)
                      }
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <textarea
                    value={entity.description}
                    onChange={(event) =>
                      updateEntity(
                        entityIndex,
                        "description",
                        event.target.value,
                      )
                    }
                    rows={3}
                    placeholder="What does this entity represent?"
                    className="mt-3 w-full resize-none rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />

                  <EntityList
                    title="Fields"
                    items={entity.fields}
                    placeholder="Field"
                    onAdd={() =>
                      addEntityListItem(
                        entityIndex,
                        "fields",
                      )
                    }
                    onRemove={(itemIndex) =>
                      removeEntityListItem(
                        entityIndex,
                        "fields",
                        itemIndex,
                      )
                    }
                    onUpdate={(itemIndex, value) =>
                      updateEntityList(
                        entityIndex,
                        "fields",
                        itemIndex,
                        value,
                      )
                    }
                  />

                  <EntityList
                    title="Relations"
                    items={entity.relations}
                    placeholder="Relation"
                    onAdd={() =>
                      addEntityListItem(
                        entityIndex,
                        "relations",
                      )
                    }
                    onRemove={(itemIndex) =>
                      removeEntityListItem(
                        entityIndex,
                        "relations",
                        itemIndex,
                      )
                    }
                    onUpdate={(itemIndex, value) =>
                      updateEntityList(
                        entityIndex,
                        "relations",
                        itemIndex,
                        value,
                      )
                    }
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEntity}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Entity
            </button>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <SectionHeader
              title="Core Lifecycle"
              description="Describe the controlled lifecycle of the primary entity."
            />

            <div className="mt-6 space-y-5">
              <input
                value={lifecycleEntity}
                onChange={(event) =>
                  setLifecycleEntity(
                    event.target.value,
                  )
                }
                placeholder="Primary entity"
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />

              <ListSection
                title="Lifecycle Steps"
                description="Describe the flow step by step."
                items={lifecycleSteps}
                placeholder="Step"
                onAdd={() =>
                  addListItem(
                    lifecycleSteps,
                    setLifecycleSteps,
                  )
                }
                onRemove={(index) =>
                  removeListItem(
                    lifecycleSteps,
                    setLifecycleSteps,
                    index,
                  )
                }
                update={(index, value) =>
                  updateListItem(
                    lifecycleSteps,
                    setLifecycleSteps,
                    index,
                    value,
                  )
                }
                addLabel="Add Step"
              />
            </div>
          </section>

          <ListSection
            title="Auth and Access Model"
            description="Define authentication, ownership, and authorization rules."
            items={authRules}
            placeholder="Authentication or access rule"
            onAdd={() =>
              addListItem(
                authRules,
                setAuthRules,
              )
            }
            onRemove={(index) =>
              removeListItem(
                authRules,
                setAuthRules,
                index,
              )
            }
            update={(index, value) =>
              updateListItem(
                authRules,
                setAuthRules,
                index,
                value,
              )
            }
            addLabel="Add Rule"
          />

          <section className="rounded-2xl border border-default bg-surface p-6">
            <SectionHeader
              title="Status Model"
              description="The single source of truth for entity statuses and valid transitions."
            />

            <div className="mt-6 space-y-6">
              {statusModels.map(
                (status, statusIndex) => (
                  <div
                    key={statusIndex}
                    className="rounded-xl border border-default p-4"
                  >
                    <div className="flex gap-2">
                      <input
                        value={status.entity}
                        onChange={(event) =>
                          updateStatusModel(
                            statusIndex,
                            "entity",
                            event.target.value,
                          )
                        }
                        placeholder="Entity"
                        className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeStatusModel(
                            statusIndex,
                          )
                        }
                        className="rounded-xl border border-default px-3 text-red-400"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <EntityList
                      title="Possible States"
                      items={status.states}
                      placeholder="State"
                      onAdd={() =>
                        addStatusListItem(
                          statusIndex,
                          "states",
                        )
                      }
                      onRemove={(itemIndex) =>
                        removeStatusListItem(
                          statusIndex,
                          "states",
                          itemIndex,
                        )
                      }
                      onUpdate={(itemIndex, value) =>
                        updateStatusList(
                          statusIndex,
                          "states",
                          itemIndex,
                          value,
                        )
                      }
                    />

                    <EntityList
                      title="Transition Rules"
                      items={
                        status.transitionRules
                      }
                      placeholder="Transition"
                      onAdd={() =>
                        addStatusListItem(
                          statusIndex,
                          "transitionRules",
                        )
                      }
                      onRemove={(itemIndex) =>
                        removeStatusListItem(
                          statusIndex,
                          "transitionRules",
                          itemIndex,
                        )
                      }
                      onUpdate={(itemIndex, value) =>
                        updateStatusList(
                          statusIndex,
                          "transitionRules",
                          itemIndex,
                          value,
                        )
                      }
                    />
                  </div>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={addStatusModel}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Status Model
            </button>

            <div className="mt-8 border-t border-default pt-6">
              <ListSection
                title="Open Questions"
                description="Rules that are not decided yet. Do not let the agent guess."
                items={statusOpenQuestions}
                placeholder="Question"
                onAdd={() =>
                  addListItem(
                    statusOpenQuestions,
                    setStatusOpenQuestions,
                  )
                }
                onRemove={(index) =>
                  removeListItem(
                    statusOpenQuestions,
                    setStatusOpenQuestions,
                    index,
                  )
                }
                update={(index, value) =>
                  updateListItem(
                    statusOpenQuestions,
                    setStatusOpenQuestions,
                    index,
                    value,
                  )
                }
                addLabel="Add Question"
              />
            </div>
          </section>

          <ListSection
            title="API and Server Boundaries"
            description="Rules that keep authentication, validation, business logic, and database access in the correct server boundaries."
            items={apiBoundaries}
            placeholder="Server boundary rule"
            onAdd={() =>
              addListItem(
                apiBoundaries,
                setApiBoundaries,
              )
            }
            onRemove={(index) =>
              removeListItem(
                apiBoundaries,
                setApiBoundaries,
                index,
              )
            }
            update={(index, value) =>
              updateListItem(
                apiBoundaries,
                setApiBoundaries,
                index,
                value,
              )
            }
            addLabel="Add Rule"
          />

          <ListSection
            title="Validation Boundary"
            description="List every area where external input must be validated before application logic runs."
            items={validationBoundaries}
            placeholder="Validation boundary"
            onAdd={() =>
              addListItem(
                validationBoundaries,
                setValidationBoundaries,
              )
            }
            onRemove={(index) =>
              removeListItem(
                validationBoundaries,
                setValidationBoundaries,
                index,
              )
            }
            update={(index, value) =>
              updateListItem(
                validationBoundaries,
                setValidationBoundaries,
                index,
                value,
              )
            }
            addLabel="Add Boundary"
          />

          <ListSection
            title="Data Integrity Rules"
            description="Relationships that must always remain true."
            items={dataIntegrityRules}
            placeholder="Integrity rule"
            onAdd={() =>
              addListItem(
                dataIntegrityRules,
                setDataIntegrityRules,
              )
            }
            onRemove={(index) =>
              removeListItem(
                dataIntegrityRules,
                setDataIntegrityRules,
                index,
              )
            }
            update={(index, value) =>
              updateListItem(
                dataIntegrityRules,
                setDataIntegrityRules,
                index,
                value,
              )
            }
            addLabel="Add Rule"
          />

          <ListSection
            title="Invariants"
            description="Absolute rules that hold everywhere in the system."
            items={invariants}
            placeholder="Invariant"
            onAdd={() =>
              addListItem(
                invariants,
                setInvariants,
              )
            }
            onRemove={(index) =>
              removeListItem(
                invariants,
                setInvariants,
                index,
              )
            }
            update={(index, value) =>
              updateListItem(
                invariants,
                setInvariants,
                index,
                value,
              )
            }
            addLabel="Add Invariant"
          />

          <ListSection
            title="Architecture Change Rules"
            description="Changes that require this architecture document to be updated before implementation."
            items={architectureChangeRules}
            placeholder="Change rule"
            onAdd={() =>
              addListItem(
                architectureChangeRules,
                setArchitectureChangeRules,
              )
            }
            onRemove={(index) =>
              removeListItem(
                architectureChangeRules,
                setArchitectureChangeRules,
                index,
              )
            }
            update={(index, value) =>
              updateListItem(
                architectureChangeRules,
                setArchitectureChangeRules,
                index,
                value,
              )
            }
            addLabel="Add Rule"
          />

          <section className="rounded-2xl border border-default bg-surface p-6">
            <SectionHeader
              title="Initial Architecture Decisions"
              description="Record why major technology and structural decisions were made."
            />

            <div className="mt-6 space-y-5">
              {initialDecisions.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-default p-4"
                  >
                    <div className="flex gap-2">
                      <input
                        value={item.decision}
                        onChange={(event) =>
                          updateDecision(
                            index,
                            "decision",
                            event.target.value,
                          )
                        }
                        placeholder="Technology / Decision"
                        className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeDecision(index)
                        }
                        className="rounded-xl border border-default px-3 text-red-400"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <textarea
                      value={item.reason}
                      onChange={(event) =>
                        updateDecision(
                          index,
                          "reason",
                          event.target.value,
                        )
                      }
                      rows={3}
                      placeholder="Why was this chosen?"
                      className="mt-3 w-full resize-none rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                    />
                  </div>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={addDecision}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Decision
            </button>
          </section>

          <section className="sticky bottom-6 rounded-2xl border border-default bg-surface/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-copy-primary">
                  architecture.md
                </p>

                <p className="mt-1 text-xs text-copy-muted">
                  {hasDocument
                    ? "Edit the architecture context and save your changes."
                    : "Generate the architecture context file."}
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

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-copy-primary">
        {title}
      </h2>

      <p className="mt-1 text-sm text-copy-muted">
        {description}
      </p>
    </div>
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
      <SectionHeader
        title={title}
        description={description}
      />

      <div className="mt-6 space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-2"
          >
            <input
              value={item}
              onChange={(event) =>
                update(
                  index,
                  event.target.value,
                )
              }
              placeholder={`${placeholder}${
                items.length > 1
                  ? ` ${index + 1}`
                  : ""
              }`}
              className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />

            <button
              type="button"
              onClick={() =>
                onRemove(index)
              }
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

function ArchitectureLayerSection({
  title,
  description,
  items,
  setItems,
  rule,
  setRule,
  rulePlaceholder,
  addLabel,
}: {
  title: string;
  description: string;
  items: string[];
  setItems: (value: string[]) => void;
  rule: string;
  setRule: (value: string) => void;
  rulePlaceholder: string;
  addLabel: string;
}) {
  const update = (
    index: number,
    value: string,
  ) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };

  const remove = (index: number) => {
    if (items.length === 1) {
      setItems([""]);
      return;
    }

    setItems(
      items.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  };

  return (
    <section className="rounded-2xl border border-default bg-surface p-6">
      <SectionHeader
        title={title}
        description={description}
      />

      <div className="mt-6 space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-2"
          >
            <input
              value={item}
              onChange={(event) =>
                update(
                  index,
                  event.target.value,
                )
              }
              placeholder="Responsibility"
              className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
            />

            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-xl border border-default px-3 text-red-400"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setItems([...items, ""])
        }
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
      >
        <Plus className="size-4" />
        {addLabel}
      </button>

      <div className="mt-6 border-t border-default pt-5">
        <label className="mb-2 block text-sm font-medium">
          Hard Rule
        </label>

        <textarea
          value={rule}
          onChange={(event) =>
            setRule(event.target.value)
          }
          rows={3}
          placeholder={rulePlaceholder}
          className="w-full resize-none rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
        />
      </div>
    </section>
  );
}

function EntityList({
  title,
  items,
  placeholder,
  onAdd,
  onRemove,
  onUpdate,
}: {
  title: string;
  items: string[];
  placeholder: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (
    index: number,
    value: string,
  ) => void;
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium">
        {title}
      </p>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-2"
          >
            <input
              value={item}
              onChange={(event) =>
                onUpdate(
                  index,
                  event.target.value,
                )
              }
              placeholder={placeholder}
              className="flex-1 rounded-xl border border-default bg-base px-4 py-2.5 text-sm outline-none focus:border-brand"
            />

            <button
              type="button"
              onClick={() =>
                onRemove(index)
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
        onClick={onAdd}
        className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-brand"
      >
        <Plus className="size-3.5" />
        Add {title.slice(0, -1)}
      </button>
    </div>
  );
}