import { NextResponse } from 'next/server';
import { createChain } from '@/lib/langchain/chain';
import { createMemory } from '@/lib/langchain/memory';

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create memory for the conversation
    const memory = createMemory({
      conversationId: conversationId || 'default',
      returnMessages: true
    });

    // Create chain with memory
    const chain = await createChain({
      conversationId: conversationId || 'default',
      returnSourceDocuments: true
    });

    // Process the message
    const response = await chain.call({
      question: message,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 