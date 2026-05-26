import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// ⚠️ ONE-TIME SETUP — DELETE AFTER USE ⚠️
const SETUP_TOKEN = 'souq-mr-admin-seed-2026';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (token !== SETUP_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // First find the user
    const { data: profiles, error: findError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .ilike('email', email);

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ 
        error: `No profile found with email like "${email}". Try exact email.`,
        hint: 'Check the email you used to sign up'
      }, { status: 404 });
    }

    // Update to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', profiles[0].id)
      .select('id, email, role');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `✅ ${profiles[0].email} is now admin`,
      data
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
