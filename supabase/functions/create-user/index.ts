import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, username } = await req.json()

    // Create Supabase client with SERVICE ROLE key (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Try to get existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: true,
          user: existingUser,
          message: 'User already exists'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create new user with service role (bypasses RLS)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        username: username || email.split('@')[0],
        password_hash: `clerk_${new Date().getTime()}`,
        role: 'user',
      })
      .select('id, email, role, username')
      .single()

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: newUser,
        message: 'User created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
