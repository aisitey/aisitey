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
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "projectId is required" },
        { status: 400 },
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, description, tech_stack, status, created_at, updated_at")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const { data: documents, error: documentsError } = await supabase
      .from("project_documents")
      .select("id, project_id, file_name, content, created_at, updated_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    if (documentsError) {
      console.error("[documents] GET error:", documentsError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load documents",
          code: documentsError.code,
          details: documentsError.details,
          hint: documentsError.hint,
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
    console.error("[documents] GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load project",
      },
      { status: 500 },
    );
  }
}