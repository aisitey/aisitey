import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
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

type MemoryAnswers = {
  projectName: string;
  productType: string;
  primaryUsers: string;
  primaryGoal: string;
  principles: Principle[];
  technologyDecisions: TechnologyDecision[];
  domainDecisions: DomainDecision[];
  ownershipRules: string[];
  architectureBoundaries: string[];
  uiDecisions: string[];
  implementationDecisions: ImplementationDecision[];
  knownConstraints: string[];
  futureConsiderations: string[];
};

const FILE_NAME = "memory.md";

function buildMarkdown(answers: MemoryAnswers) {
  const clean = (value: string | undefined) => value?.trim() || "";

  const list = (items: string[] | undefined) =>
    items
      ?.map(clean)
      .filter(Boolean)
      .map((item) => `- ${item}`)
      .join("\n") || "Not specified";

  return `# Project Memory

This file contains important project decisions, conventions, and
implementation knowledge that should remain consistent across development
sessions.

---

## Project Identity

- Project name: ${clean(answers.projectName) || "Not specified"}
- Product type: ${clean(answers.productType) || "Not specified"}
- Primary users: ${clean(answers.primaryUsers) || "Not specified"}
- Primary goal: ${clean(answers.primaryGoal) || "Not specified"}

---

## Product Principles

${answers.principles
  ?.filter((p) => p.name.trim() || p.description.trim())
  .map(
    (p) => `### ${clean(p.name) || "Principle"}

${clean(p.description) || "Not specified"}`,
  )
  .join("\n\n") || "Not specified"}

---

## Technology Decisions

${answers.technologyDecisions
  ?.filter((t) => t.technology.trim() || t.reason.trim())
  .map(
    (t) => `### ${clean(t.technology) || "Technology"}

${clean(t.reason) || "Not specified"}`,
  )
  .join("\n\n") || "Not specified"}

---

## Domain Decisions

${answers.domainDecisions
  ?.filter((d) => d.entity.trim() || d.description.trim())
  .map(
    (d) => `### ${clean(d.entity) || "Entity"}

${clean(d.description) || "Not specified"}`,
  )
  .join("\n\n") || "Not specified"}

---

## Ownership and Access

${list(answers.ownershipRules)}

---

## Architecture Boundaries

${list(answers.architectureBoundaries)}

---

## UI Decisions

${list(answers.uiDecisions)}

---

## Important Implementation Decisions

${answers.implementationDecisions
  ?.filter((d) => d.title.trim() || d.decision.trim())
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

${list(answers.knownConstraints)}

---

## Future Considerations

${list(answers.futureConsiderations)}
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
      console.error("[memory] GET document error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load memory",
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
    console.error("[memory] GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load memory",
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

    const answers = body.answers as MemoryAnswers | undefined;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "answers must be an object" },
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
      console.error("[memory] POST save error:", error);

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
    console.error("[memory] POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate memory",
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
      console.error("[memory] PUT save error:", error);

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
    console.error("[memory] PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save memory",
      },
      { status: 500 },
    );
  }
}