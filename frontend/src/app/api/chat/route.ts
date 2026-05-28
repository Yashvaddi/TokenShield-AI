import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Call the language model
    const result = await streamText({
      // @ts-ignore - Bypass AI SDK version mismatch type error
      model: openai('gpt-4-turbo'),
      messages,
      system: "You are a secure AI assistant protected by TokenShield. Provide concise, secure, and accurate responses."
    });

    // Respond with the stream
    return result.toDataStreamResponse();
  } catch (error: any) {
    // Basic error handling for missing API keys or other issues
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during AI generation' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
