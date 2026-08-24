import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

type AIWorkflowAnswers = {
  approach: string[];
  scopingRules: string[];
  implementationOrder: string[];
  splitWorkRules: string[];
  missingRequirements: string[];
  productScope: string;
  outOfScopeItems: string[];
  dataRules: string[];
  authRules: string[];
  uiRules: string[];
  apiRules: string[];
  errorRules: string[];
  testingRules: string[];
  contextSyncRules: string[];
  protectedDecisions: string[];
  dependencyRules: string[];
  refactoringRules: string[];
  completionChecks: string[];
};

const FILE_NAME = "ai-workflow-rules.md";

function buildMarkdown(answers: AIWorkflowAnswers) {
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

  return `# AI Workflow Rules

## Approach

${list(answers.approach)}

---

## Scoping Rules

${list(answers.scopingRules)}

---

## Feature Implementation Order

${numbered(answers.implementationOrder)}

---

## When to Split Work

${list(answers.splitWorkRules)}

---

## Handling Missing Requirements

${list(answers.missingRequirements)}

---

## Product Scope Rules

${clean(answers.productScope) || "Not specified"}

Do not add:

${list(answers.outOfScopeItems)}

---

## Data Rules

${list(answers.dataRules)}

---

## Authentication and Access Rules

${list(answers.authRules)}

---

## UI and UX Rules

${list(answers.uiRules)}

---

## API and Server Rules

${list(answers.apiRules)}

---

## Error Handling Rules

${list(answers.errorRules)}

---

## Testing and Verification

${numbered(answers.testingRules)}

---

## Context Synchronization

${list(answers.contextSyncRules)}

---

## Protected Decisions

${list(answers.protectedDecisions)}

---

## Dependency Rules

${list(answers.dependencyRules)}

---

## Refactoring Rules

${list(answers.refactoringRules)}

---

## Before Moving to the Next Feature

${numbered(answers.completionChecks)}
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
      console.error("[ai-workflow-rules] GET document error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load ai-workflow-rules",
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
    console.error("[ai-workflow-rules] GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load ai-workflow-rules",
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

    const answers = body.answers as AIWorkflowAnswers | undefined;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "answers must be an object" },
        { status: 400 },
      );
    }

    if (!Array.isArray(answers.approach)) {
      return NextResponse.json(
        { success: false, error: "approach must be an array" },
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
      console.error("[ai-workflow-rules] POST save error:", error);

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
    console.error("[ai-workflow-rules] POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate ai-workflow-rules",
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
      console.error("[ai-workflow-rules] PUT save error:", error);

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
    console.error("[ai-workflow-rules] PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save ai-workflow-rules",
      },
      { status: 500 },
    );
  }
}