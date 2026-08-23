import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

type FeatureGroup = {
  category: string;
  items: string[];
};

type ProjectOverviewAnswers = {
  name: string;
  overview: string;
  goals: string[];
  coreFlow: string[];
  features?: FeatureGroup[];
  inScope?: string[];
  outScope?: string[];
  successCriteria?: string[];
};

const FILE_NAME = "project-overview.md";

function buildMarkdown(
  project: {
    name: string;
    description: string | null;
    tech_stack: string | null;
  },
  answers: ProjectOverviewAnswers,
) {
  const cleanGoals = answers.goals
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  const cleanCoreFlow = answers.coreFlow
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  const cleanFeatures = (answers.features ?? [])
    .map((feature) => ({
      category:
        typeof feature.category === "string"
          ? feature.category.trim()
          : "",
      items: Array.isArray(feature.items)
        ? feature.items
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    }))
    .filter(
      (feature) =>
        feature.category !== "" || feature.items.length > 0,
    );

  const cleanInScope = (answers.inScope ?? [])
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  const cleanOutScope = (answers.outScope ?? [])
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  const cleanSuccessCriteria = (answers.successCriteria ?? [])
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return `# Project Overview

## Project Name

${answers.name.trim() || project.name}

## Overview

${answers.overview.trim()}

## Goals

${
  cleanGoals.length
    ? cleanGoals.map((item) => `- ${item}`).join("\n")
    : "Not specified"
}

## Core User Flow

${
  cleanCoreFlow.length
    ? cleanCoreFlow
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n")
    : "Not specified"
}

## Features

${
  cleanFeatures.length
    ? cleanFeatures
        .map(
          (feature) => `### ${feature.category || "General"}

${
  feature.items.length
    ? feature.items.map((item) => `- ${item}`).join("\n")
    : "Not specified"
}`,
        )
        .join("\n\n")
    : "Not specified"
}

## In Scope

${
  cleanInScope.length
    ? cleanInScope.map((item) => `- ${item}`).join("\n")
    : "Not specified"
}

## Out of Scope

${
  cleanOutScope.length
    ? cleanOutScope.map((item) => `- ${item}`).join("\n")
    : "Not specified"
}

## Success Criteria

${
  cleanSuccessCriteria.length
    ? cleanSuccessCriteria.map((item) => `- ${item}`).join("\n")
    : "Not specified"
}

## Tech Stack

${project.tech_stack || "Not specified"}

## Description

${project.description || "Not specified"}
`;
}

async function getAuthenticatedProject(projectId: string) {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
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
        {
          success: false,
          error: "User not found",
        },
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
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 },
      ),
    };
  }

  return {
    supabase,
    project,
  };
}

/**
 * GET
 *
 * Load the existing project-overview.md
 */
export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: "projectId is required",
        },
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
      .select(
        "id, project_id, file_name, content, created_at, updated_at",
      )
      .eq("project_id", project.id)
      .eq("file_name", FILE_NAME)
      .maybeSingle();

    if (error) {
      console.error(
        "[project-overview] GET document error:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load project overview",
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
    console.error("[project-overview] GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load project overview",
      },
      { status: 500 },
    );
  }
}

/**
 * POST
 *
 * Generate project-overview.md and save it.
 */
export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: "projectId is required",
        },
        { status: 400 },
      );
    }

    const result = await getAuthenticatedProject(projectId);

    if ("error" in result) {
      return result.error;
    }

    const { supabase, project } = result;

    const body = await request.json();

    const answers =
      body.answers as ProjectOverviewAnswers | undefined;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "answers must be an object",
        },
        { status: 400 },
      );
    }

    if (typeof answers.name !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "name must be a string",
        },
        { status: 400 },
      );
    }

    if (typeof answers.overview !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "overview must be a string",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(answers.goals)) {
      return NextResponse.json(
        {
          success: false,
          error: "goals must be an array",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(answers.coreFlow)) {
      return NextResponse.json(
        {
          success: false,
          error: "coreFlow must be an array",
        },
        { status: 400 },
      );
    }

    if (!answers.overview.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "overview is required",
        },
        { status: 400 },
      );
    }

    const content = buildMarkdown(project, answers);

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
      .select(
        "id, project_id, file_name, content, created_at, updated_at",
      )
      .single();

    if (error) {
      console.error(
        "[project-overview] POST save error:",
        error,
      );

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
    console.error("[project-overview] POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate project overview",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT
 *
 * Save manual edits made to project-overview.md
 */
export async function PUT(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: "projectId is required",
        },
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
        {
          success: false,
          error: "content must be a string",
        },
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
      .select(
        "id, project_id, file_name, content, created_at, updated_at",
      )
      .single();

    if (error) {
      console.error(
        "[project-overview] PUT save error:",
        error,
      );

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
    console.error("[project-overview] PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save project overview",
      },
      { status: 500 },
    );
  }
}