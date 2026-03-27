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
      // If `next` was explicitly provided in the URL, honour it.
      // Otherwise route based on onboarding status.
      if (next !== '/') {
        return NextResponse.redirect(`${origin}${next}`);
      }
      const { data: userData } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single();
      const destination = userData?.onboarding_completed ? '/' : '/onboarding';
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/buyer?error=auth_callback_failed`);
}
