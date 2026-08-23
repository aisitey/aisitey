import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();

    // Find the current application user.
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    // Verify that the project belongs to the current user.
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, description, tech_stack, status, created_at, updated_at")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    // Load the context documents belonging to this project.
    const { data: documents, error: documentsError } = await supabase
      .from("project_documents")
      .select(
        "id, project_id, file_name, content, created_at, updated_at",
      )
      .eq("project_id", projectId)
      .order("file_name", { ascending: true });

    if (documentsError) {
      console.error(
        "[project-documents] Load error:",
        documentsError,
      );

      return NextResponse.json(
        {
          error: "Failed to load project documents",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      project,
      documents: documents ?? [],
    });
  } catch (error) {
    console.error(
      "[project-documents] GET error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load project documents",
      },
      { status: 500 },
    );
  }
}