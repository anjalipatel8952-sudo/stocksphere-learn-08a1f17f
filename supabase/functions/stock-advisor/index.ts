import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are StockSphere AI, a friendly and helpful stock market advisor designed for beginners learning about investing. Your role is to:

1. **Explain stock concepts simply**: Use plain language, avoid jargon, and give relatable examples
2. **Analyze stock trends**: When asked about specific stocks, explain what the price movements mean in simple terms
3. **Provide insights**: Give Buy/Hold/Sell recommendations with clear, educational reasoning
4. **Teach profit/loss**: Help users understand how gains and losses work in simple percentage terms
5. **Be encouraging**: Make learning about stocks fun and approachable

Guidelines:
- Keep responses concise (2-4 paragraphs max)
- Use emojis sparingly to make responses friendly 📈
- Always remind users this is for learning with virtual money only
- When giving Buy/Hold/Sell advice, explain WHY in beginner-friendly terms
- If you don't know current real prices, work with the information given
- Focus on teaching concepts, not just giving answers

Remember: Your audience is complete beginners who may feel intimidated by finance. Be warm, patient, and make complex things simple!`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, stockContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system message
    let enhancedSystemPrompt = systemPrompt;
    if (stockContext) {
      enhancedSystemPrompt += `\n\nCurrent context about the stock being discussed:
- Symbol: ${stockContext.symbol}
- Name: ${stockContext.name}
- Current Price: ${stockContext.currency}${stockContext.price}
- Today's Change: ${stockContext.change > 0 ? '+' : ''}${stockContext.change} (${stockContext.changePercent > 0 ? '+' : ''}${stockContext.changePercent}%)
- P/E Ratio: ${stockContext.pe}
- Sector: ${stockContext.sector}
- 52-Week High: ${stockContext.currency}${stockContext.high52w}
- 52-Week Low: ${stockContext.currency}${stockContext.low52w}

Use this real data to provide specific, helpful insights about this stock.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Stock advisor error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
