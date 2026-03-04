import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json() as { message: string };

  const responses: Record<string, string> = {
    "summarize": "You have 10 active deals in your pipeline worth approximately $1.2M total. Your top-performing stage is 'Proposal' with 3 deals worth $350K.",
    "leads": "You currently have 4 leads in early pipeline stages. The highest-value lead is 'Enterprise Platform License' worth $120,000.",
    "forecast": "Based on current pipeline velocity and historical win rates, we project $450K in closed revenue this quarter, representing a 15% increase over last quarter.",
  };

  const lower = message.toLowerCase();
  let response = "I'm your Rock Mount AI assistant. I can help with pipeline analysis, lead scoring insights, and deal recommendations. What would you like to know?";

  for (const [key, value] of Object.entries(responses)) {
    if (lower.includes(key)) {
      response = value;
      break;
    }
  }

  return NextResponse.json({ response });
}
