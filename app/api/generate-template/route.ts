import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    const { businessType, businessData } = await req.json();

    const prompt = `
      You are an expert business consultant. Generate a professional invoice configuration for a ${businessType} business.
      Business Name: ${businessData.name || 'Professional Services'}
      
      Return a JSON object with:
      1. defaultLineItems: An array of 3 objects with { description: string, quantity: number, rate: number } relevant to ${businessType}.
      2. notesTemplate: A professional footer/terms string targeted at ${businessType}.
      3. styleRecommendations: An object with { primaryColor: string, font: string, layout: 'modern' | 'classic' | 'minimal' }.
      
      Make the line items specific and professional. For example, if it's SaaS, include "Monthly Subscription", "Extra Seats", "API Overages".
      
      Respond only with valid JSON.
    `;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile') as any,
      prompt,
    });

    // Clean up response in case of markdown blocks
    const cleanJson = text.replace(/```json\n|\n```/g, '').trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Groq AI error:', error);
    return NextResponse.json({ error: 'Failed to generate template suggestions' }, { status: 500 });
  }
}
