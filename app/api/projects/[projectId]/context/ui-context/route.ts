import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

type ColorItem = {
  role: string;
  cssVariable: string;
  hexValue: string;
};

type TypographyItem = {
  role: string;
  font: string;
  cssVariable: string;
};

type RadiusItem = {
  context: string;
  value: string;
};

type LayoutPattern = {
  name: string;
  rules: string[];
};

type IconSize = {
  context: string;
  size: string;
};

type UIContextAnswers = {
  theme: string;
  themeAvoid?: string;
  colors: ColorItem[];
  typography: TypographyItem[];
  typographyNote?: string;
  radii: RadiusItem[];
  componentLibrary?: string;
  componentPath?: string;
  componentRule?: string;
  layoutPatterns: LayoutPattern[];
  buttonRules?: string[];
  iconLibrary?: string;
  iconStyle?: string;
  iconSizes: IconSize[];
  motionUse?: string[];
  motionAvoid?: string[];
  accessibilityRules?: string[];
};

const FILE_NAME = "ui-context.md";

function buildMarkdown(answers: UIContextAnswers) {
  const clean = (value: string | undefined) => value?.trim() || "";

  const list = (items: string[] | undefined) =>
    items
      ?.map(clean)
      .filter(Boolean)
      .map((item) => `- ${item}`)
      .join("\n") || "Not specified";

  const colorRows = answers.colors
    ?.filter(
      (color) =>
        color.role.trim() ||
        color.cssVariable.trim() ||
        color.hexValue.trim(),
    )
    .map(
      (color) =>
        `| ${clean(color.role)} | \`${clean(color.cssVariable)}\` | \`${clean(color.hexValue)}\` |`,
    )
    .join("\n") || "| | | |";

  const typographyRows = answers.typography
    ?.filter(
      (item) =>
        item.role.trim() ||
        item.font.trim() ||
        item.cssVariable.trim(),
    )
    .map(
      (item) =>
        `| ${clean(item.role)} | ${clean(item.font)} | \`${clean(item.cssVariable)}\` |`,
    )
    .join("\n") || "| | | |";

  const radiusRows = answers.radii
    ?.filter((item) => item.context.trim() || item.value.trim())
    .map(
      (item) =>
        `| ${clean(item.context)} | \`${clean(item.value)}\` |`,
    )
    .join("\n") || "| | |";

  const layoutSections = answers.layoutPatterns
    ?.filter(
      (layout) =>
        layout.name.trim() ||
        layout.rules.some((rule) => rule.trim()),
    )
    .map((layout) => {
      return `### ${clean(layout.name) || "Pattern"}

${list(layout.rules)}`;
    })
    .join("\n\n") || "Not specified";

  const iconSizeRows = answers.iconSizes
    ?.filter((item) => item.context.trim() || item.size.trim())
    .map(
      (item) =>
        `| ${clean(item.context)} | \`${clean(item.size)}\` |`,
    )
    .join("\n") || "| | |";

  return `# UI Context

## Theme

${clean(answers.theme) || "Not specified"}

${clean(answers.themeAvoid) || "Avoid excessive gradients, glowing effects, neon colors."}

All colors are defined as CSS custom properties in \`globals.css\`.
Components must use these tokens — no arbitrary colors or hardcoded hex values.

## Colors

| Role | CSS Variable | Hex / Value |
| --- | --- | --- |
${colorRows}

## Typography

| Role | Font | CSS Variable |
| --- | --- | --- |
${typographyRows}

${clean(answers.typographyNote) || "Use size/weight/spacing, not color, for hierarchy."}

## Border Radius

| Context | Class |
| --- | --- |
${radiusRows}

Use the defined scale consistently — do not mix arbitrary radius values.

## Component Library

${clean(answers.componentLibrary) || "shadcn/ui on top of Tailwind."}

Components live in: \`${clean(answers.componentPath) || "components/ui"}\`

${clean(answers.componentRule) || "Use existing components when available. Do not recreate primitives from scratch."}

## Layout Patterns

${layoutSections}

## Buttons and Actions

${list(answers.buttonRules)}

Do not use multiple competing accent colors in the same action group.

## Icons

${clean(answers.iconLibrary) || "Lucide React"}. ${clean(answers.iconStyle) || "Stroke-based only."}

| Context | Size |
| --- | --- |
${iconSizeRows}

## Motion

Use animation for:

${list(answers.motionUse)}

Avoid:

${list(answers.motionAvoid)}

## Accessibility

${list(answers.accessibilityRules)}
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
      console.error("[ui-context] GET document error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load ui-context",
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
    console.error("[ui-context] GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load ui-context",
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

    const answers = body.answers as UIContextAnswers | undefined;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "answers must be an object" },
        { status: 400 },
      );
    }

    if (typeof answers.theme !== "string") {
      return NextResponse.json(
        { success: false, error: "theme must be a string" },
        { status: 400 },
      );
    }

    if (!Array.isArray(answers.colors)) {
      return NextResponse.json(
        { success: false, error: "colors must be an array" },
        { status: 400 },
      );
    }

    if (!Array.isArray(answers.typography)) {
      return NextResponse.json(
        { success: false, error: "typography must be an array" },
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
      console.error("[ui-context] POST save error:", error);

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
    console.error("[ui-context] POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate ui-context",
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
      console.error("[ui-context] PUT save error:", error);

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
    console.error("[ui-context] PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save ui-context",
      },
      { status: 500 },
    );
  }
}