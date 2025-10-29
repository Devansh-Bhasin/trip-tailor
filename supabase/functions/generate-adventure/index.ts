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
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating adventure for message:', message);

    const systemPrompt = `You are a local Vancouver adventure planner AI. Analyze user requests and create personalized 2-5 hour adventure plans for Metro Vancouver (Surrey, Richmond, Langley, Burnaby, Vancouver, New Westminster).

Extract and understand:
- Location/area preference
- Time window
- Number of people
- Budget (low: <$20/person, medium: $20-50, high: >$50)
- Transportation (walking, driving, transit, rideshare)
- Food preferences
- Interests (nature, food, art, shopping, photos, etc.)
- Weather preference (indoor/outdoor)

Create 2-3 complete adventure plans with:
- Creative title
- Duration
- Budget per person
- 3-5 activities with:
  * Time
  * Place name
  * Type (restaurant, park, cafe, market, etc.)
  * Brief description (1 sentence)
  * Practical tips
- Transit/driving directions between stops
- Total estimated cost

Be specific with real Metro Vancouver locations. Include actual restaurant names, parks, cafes, and attractions in the specified areas.

Format your response as a JSON object with this structure:
{
  "adventures": [
    {
      "title": "Adventure name",
      "duration": "3 hours",
      "budget": "$25",
      "description": "Brief overview",
      "activities": [
        {
          "time": "12:00 PM",
          "place": "Actual place name",
          "type": "restaurant/park/cafe/etc",
          "description": "What to do here",
          "tip": "Practical advice"
        }
      ],
      "transport": "Transit or driving directions between locations",
      "totalCost": "$25 per person"
    }
  ]
}

Respond ONLY with valid JSON, no other text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response:', content);

    // Parse JSON from response
    let adventures;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        adventures = JSON.parse(jsonMatch[0]);
      } else {
        adventures = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Failed to parse adventure data');
    }

    return new Response(
      JSON.stringify(adventures),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-adventure function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
