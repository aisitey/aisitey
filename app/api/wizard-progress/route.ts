import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id, current_step, completed_files } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // نجيب user
    const { data: supabaseUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (userError || !supabaseUser) {
      console.error('User not found in Supabase for clerk_id:', userId, userError);
      return NextResponse.json(
        { error: 'User not synced to database yet. Please try again in a moment.' },
        { status: 404 },
      );
    }

    // Check if progress exists
    const { data: existingProgress } = await supabase
      .from('wizard_progress')
      .select('*')
      .eq('project_id', project_id)
      .eq('user_id', supabaseUser.id)
      .single();

    if (existingProgress) {
      // Update
      const { data, error } = await supabase
        .from('wizard_progress')
        .update({
          current_step,
          completed_files,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) {
        console.error('Wizard progress update error:', error);
        throw error;
      }

      return NextResponse.json({ progress: data });
    } else {
      // Insert
      const { data, error } = await supabase
        .from('wizard_progress')
        .insert({
          project_id,
          user_id: supabaseUser.id,
          current_step,
          completed_files,
        })
        .select()
        .single();

      if (error) {
        console.error('Wizard progress insert error:', error);
        throw error;
      }

      return NextResponse.json({ progress: data });
    }
  } catch (error) {
    console.error('Wizard progress error:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project_id');

    if (!userId || !projectId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: supabaseUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (userError || !supabaseUser) {
      console.error('User not found in Supabase for clerk_id:', userId, userError);
      return NextResponse.json({ progress: null });
    }

    const { data: progress, error } = await supabase
      .from('wizard_progress')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', supabaseUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Get progress error:', error);
      throw error;
    }

    return NextResponse.json({ progress: progress || null });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
  }
}