import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

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

type ArchitectureAnswers = {
  stack: StackItem[];
  optionalTechnologies?: string[];
  folders: Folder[];
  presentationResponsibilities?: string[];
  presentationRule?: string;
  applicationResponsibilities?: string[];
  applicationRule?: string;
  dataResponsibilities?: string[];
  primaryDatabase?: string;
  databaseEntities?: string[];
  fileStorage?: string;
  entities: DomainEntity[];
  lifecycleEntity?: string;
  lifecycleSteps?: string[];
  authRules?: string[];
  statusModels?: StatusModel[];
  statusOpenQuestions?: string[];
  apiBoundaries?: string[];
  validationBoundaries?: string[];
  dataIntegrityRules?: string[];
  invariants?: string[];
  architectureChangeRules?: string[];
  initialDecisions?: { decision: string; reason: string }[];
};

const FILE_NAME = "architecture.md";

function buildMarkdown(answers: ArchitectureAnswers) {
  const clean = (value: string | undefined) => value?.trim() || "";

  const list = (items: string[] | undefined) =>
    items
      ?.map(clean)
      .filter(Boolean)
      .map((item) => `- ${item}`)
      .join("\n") || "Not specified";

  const numbered = (items: string[] | undefined) =>
    items
      ?.map(clean)
      .filter(Boolean)
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n") || "Not specified";

  const stackRows = answers.stack
    ?.filter(
      (item) =>
        item.layer.trim() ||
        item.technology.trim() ||
        item.role.trim(),
    )
    .map(
      (item) =>
        `| ${clean(item.layer)} | ${clean(item.technology)} | ${clean(item.role)} |`,
    )
    .join("\n") || "| | | |";

  const folderLines = answers.folders
    ?.filter(
      (folder) =>
        folder.name.trim() ||
        folder.responsibility.trim(),
    )
    .map(
      (folder) =>
        `- \`${clean(folder.name)}\` — ${clean(folder.responsibility)}`,
    )
    .join("\n") || "- Not specified";

  const entitySections = answers.entities
    ?.filter(
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
    .join("\n\n") || "Not specified";

  const statusSections = answers.statusModels
    ?.filter(
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
    .join("\n\n") || "Not specified";

  const decisionSections = answers.initialDecisions
    ?.filter(
      (item) =>
        item.decision.trim() ||
        item.reason.trim(),
    )
    .map(
      (item) =>
        `### ${clean(item.decision) || "Architecture Decision"}

Chosen because ${clean(item.reason) || "Not specified"}.`,
    )
    .join("\n\n") || "Not specified";

  return `# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
${stackRows}

### Optional Technologies

${list(answers.optionalTechnologies)}

---

## System Boundaries

${folderLines}

---

## Application Architecture

### Presentation Layer

Responsible for:

${list(answers.presentationResponsibilities)}

${clean(answers.presentationRule) || "UI components must not directly access the database."}

### Application Layer

Responsible for:

${list(answers.applicationResponsibilities)}

${clean(answers.applicationRule) || "Business logic should not be duplicated across multiple routes or components."}

### Data Layer

Responsible for:

${list(answers.dataResponsibilities)}

---

## Storage Model

### ${clean(answers.primaryDatabase) || "Primary Database"}

The database stores:

${list(answers.databaseEntities)}

### File Storage

${clean(answers.fileStorage) || "File/blob storage is not required yet. The storage strategy must be defined here before implementation."}

---

## Core Domain Model

${entitySections}

---

## ${clean(answers.lifecycleEntity) || "[Primary Entity]"} Lifecycle / Core Flow

${numbered(answers.lifecycleSteps)}

The system must prevent invalid state transitions.

---

## Auth and Access Model

${list(answers.authRules)}

---

## Status Model

${statusSections}

### Open Questions

${list(answers.statusOpenQuestions)}

---

## API and Server Boundaries

${list(answers.apiBoundaries)}

---

## Validation Boundary

All external input is treated as untrusted. Validation happens before application logic executes.

${list(answers.validationBoundaries)}

---

## Data Integrity Rules

${numbered(answers.dataIntegrityRules)}

---

## Invariants

${numbered(answers.invariants)}

---

## Architecture Change Rules

${list(answers.architectureChangeRules)}

---

## Initial Architecture Decisions

${decisionSections}
`;
}

async function getAuthenticatedProject(projectId: string) {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  const supabase = createSupabaseServerClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      ),
    };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description, tech_stack")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return {
      error: NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      ),
    };
  }

  return { supabase, project };
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "projectId is required" },
        { status: 400 },
      );
    }

    const result = await getAuthenticatedProject(projectId);

    if ("error" in result) {
      return result.error;
    }

    const { supabase, project } = result;

    const { data: document, error } = await supabase
      .from("project_documents")
      .select("id, project_id, file_name, content, created_at, updated_at")
      .eq("project_id", project.id)
      .eq("file_name", FILE_NAME)
      .maybeSingle();

    if (error) {
      console.error("[architecture] GET document error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load architecture",
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      project,
      document: document ?? null,
    });
  } catch (error) {
    console.error("[architecture] GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load architecture",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "projectId is required" },
        { status: 400 },
      );
    }

    const result = await getAuthenticatedProject(projectId);

    if ("error" in result) {
      return result.error;
    }

    const { supabase, project } = result;

    const body = await request.json();

    const answers = body.answers as ArchitectureAnswers | undefined;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "answers must be an object" },
        { status: 400 },
      );
    }

    if (!Array.isArray(answers.stack)) {
      return NextResponse.json(
        { success: false, error: "stack must be an array" },
        { status: 400 },
      );
    }

    if (!Array.isArray(answers.folders)) {
      return NextResponse.json(
        { success: false, error: "folders must be an array" },
        { status: 400 },
      );
    }

    if (!Array.isArray(answers.entities)) {
      return NextResponse.json(
        { success: false, error: "entities must be an array" },
        { status: 400 },
      );
    }

    const content = buildMarkdown(answers);

    const { data: document, error } = await supabase
      .from("project_documents")
      .upsert(
        {
          project_id: project.id,
          file_name: FILE_NAME,
          content,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "project_id,file_name",
        },
      )
      .select("id, project_id, file_name, content, created_at, updated_at")
      .single();

    if (error) {
      console.error("[architecture] POST save error:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("[architecture] POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate architecture",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "projectId is required" },
        { status: 400 },
      );
    }

    const result = await getAuthenticatedProject(projectId);

    if ("error" in result) {
      return result.error;
    }

    const { supabase, project } = result;

    const body = await request.json();

    if (typeof body.content !== "string") {
      return NextResponse.json(
        { success: false, error: "content must be a string" },
        { status: 400 },
      );
    }

    const { data: document, error } = await supabase
      .from("project_documents")
      .upsert(
        {
          project_id: project.id,
          file_name: FILE_NAME,
          content: body.content,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "project_id,file_name",
        },
      )
      .select("id, project_id, file_name, content, created_at, updated_at")
      .single();

    if (error) {
      console.error("[architecture] PUT save error:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("[architecture] PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save architecture",
      },
      { status: 500 },
    );
  }
}