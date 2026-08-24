import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

type CodeStandardsAnswers = {
  generalRules: string[];
  languageRules: string[];
  frameworkRules: string[];
  componentRules: string[];
  stylingRules: string[];
  apiRules: string[];
  authProvider: string;
  authRules: string[];
  validationRules: string[];
  businessLogicRules: string[];
  databaseClient: string;
  databaseRules: string[];
  dataIntegrityRules: string[];
  errorHandlingRules: string[];
  loadingRules: string[];
  fileOrganizationRules: string[];
  namingRules: string[];
  dependencyRules: string[];
  securityRules: string[];
  documentationRules: string[];
  completionChecks: string[];
};

const FILE_NAME = "code-standards.md";

function buildMarkdown(answers: CodeStandardsAnswers) {
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

  return `# Code Standards

## General

${list(answers.generalRules)}

---

## TypeScript

${list(answers.languageRules)}

---

## Next.js

${list(answers.frameworkRules)}

---

## Components / UI Code

${list(answers.componentRules)}

---

## Styling

${list(answers.stylingRules)}

---

## API / Server Routes

${list(answers.apiRules)}

---

## Authentication and Authorization

- ${clean(answers.authProvider) || "[Auth provider]"} is the authentication provider.

${list(answers.authRules)}

---

## Validation

${list(answers.validationRules)}

---

## Business Logic

${list(answers.businessLogicRules)}

---

## Database

- All database access goes through ${clean(answers.databaseClient) || "[ORM/client]"}.

${list(answers.databaseRules)}

---

## Data Integrity

${list(answers.dataIntegrityRules)}

---

## Error Handling

${list(answers.errorHandlingRules)}

---

## Loading and Empty States

${list(answers.loadingRules)}

---

## File Organization

${list(answers.fileOrganizationRules)}

---

## Naming

${list(answers.namingRules)}

---

## Dependencies

${list(answers.dependencyRules)}

---

## Security

${list(answers.securityRules)}

---

## Documentation and Context

${list(answers.documentationRules)}

---

## Before Marking a Feature Complete

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
      console.error("[code-standards] GET document error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load code-standards",
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
    console.error("[code-standards] GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load code-standards",
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

    const answers = body.answers as CodeStandardsAnswers | undefined;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "answers must be an object" },
        { status: 400 },
      );
    }

    if (!Array.isArray(answers.generalRules)) {
      return NextResponse.json(
        { success: false, error: "generalRules must be an array" },
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
      console.error("[code-standards] POST save error:", error);

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
    console.error("[code-standards] POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate code-standards",
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
      console.error("[code-standards] PUT save error:", error);

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
    console.error("[code-standards] PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save code-standards",
      },
      { status: 500 },
    );
  }
}