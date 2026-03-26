import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Upsert public.users profile — handles users created before trigger was set up
      await supabase.from('users').upsert(
        {
          id: data.user.id,
          email: data.user.email!,
          full_name:
            data.user.user_metadata?.full_name ??
            data.user.email!.split('@')[0],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/buyer?error=auth_callback_failed`);
}
