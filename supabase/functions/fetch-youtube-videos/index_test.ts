import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('[fetch-youtube-videos] Request received:', body);
    
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    console.log('[fetch-youtube-videos] API Key available:', !!apiKey);
    console.log('[fetch-youtube-videos] API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.log('[fetch-youtube-videos] NO API KEY FOUND');
      return new Response(JSON.stringify({ error: 'No YouTube API key configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Just return a test response
    return new Response(JSON.stringify({ 
      test: 'success',
      apiKeyLength: apiKey.length,
      message: 'Function is working'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[fetch-youtube-videos] Error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
