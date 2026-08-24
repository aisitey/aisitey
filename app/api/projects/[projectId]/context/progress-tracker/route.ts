import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

type ProgressTrackerAnswers = {
  currentPhase: string;
  currentGoal: string;
  completed: string[];
  inProgress: string[];
  nextUp: string[];
  openQuestions: string[];
  architectureDecisions: string[];
  sessionNotes: string[];
};

const FILE_NAME = "progress-tracker.md";

function buildMarkdown(answers: ProgressTrackerAnswers) {
  const clean = (value: string | undefined) => value?.trim() || "";

  const list = (items: string[] | undefined) =>
    items
      ?.map(clean)
      .filter(Boolean)
      .map((item) => `- ${item}`)
      .join("\n") || "None yet.";

  return `# Progress Tracker

Update this file after every meaningful implementation change. This file
answers "where are we right now" — it's expected to change constantly,
unlike \`memory.md\` which should stay stable.

## Current Phase

- ${clean(answers.currentPhase) || "Not started"}

## Current Goal

- ${clean(answers.currentGoal) || "Not specified"}

## Completed

${list(answers.completed)}

## In Progress

${list(answers.inProgress)}

## Next Up

${list(answers.nextUp)}

## Open Questions

${list(answers.openQuestions)}

## Architecture Decisions

${list(answers.architectureDecisions)}

## Session Notes

${list(answers.sessionNotes)}
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
      console.error("[progress-tracker] GET document error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load progress-tracker",
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
    console.error("[progress-tracker] GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load progress-tracker",
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

    const answers = body.answers as ProgressTrackerAnswers | undefined;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "answers must be an object" },
        { status: 400 },
      );
    }

    if (typeof answers.currentPhase !== "string") {
      return NextResponse.json(
        { success: false, error: "currentPhase must be a string" },
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
      console.error("[progress-tracker] POST save error:", error);

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
    console.error("[progress-tracker] POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate progress-tracker",
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
      console.error("[progress-tracker] PUT save error:", error);

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
    console.error("[progress-tracker] PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save progress-tracker",
      },
      { status: 500 },
    );
  }
}