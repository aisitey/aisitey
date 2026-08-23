import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Find the Supabase user by Clerk ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      console.error("[projects] User lookup error:", userError);

      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Load projects belonging to this user
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error("[projects] Load error:", projectsError);

      return NextResponse.json(
        { error: projectsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      projects: projects ?? [],
    });
  } catch (error) {
    console.error("[projects] GET error:", error);

    return NextResponse.json(
      { error: "Failed to load projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    const techStack =
      typeof body.tech_stack === "string"
        ? body.tech_stack.trim() || null
        : null;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Find the Supabase user by Clerk ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      console.error("[projects] User lookup error:", userError);

      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create project using the Supabase UUID
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        description,
        tech_stack: techStack,
        status: "active",
      })
      .select("*")
      .single();

    if (projectError) {
      console.error("[projects] Create error:", projectError);

      return NextResponse.json(
        { error: projectError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { project },
      { status: 201 }
    );
  } catch (error) {
    console.error("[projects] POST error:", error);

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}