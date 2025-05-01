import { NextResponse } from 'next/server';
import { createChain } from '@/lib/langchain/chain';
import { createMemory } from '@/lib/langchain/memory';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate a new conversationId if one isn't provided
    const chatId = conversationId || `chat_${uuidv4()}`;

    // Create memory for the conversation
    const memory = createMemory({
      conversationId: chatId,
      returnMessages: true
    });

    // Create chain with memory
    const chain = await createChain({
      conversationId: chatId,
      returnSourceDocuments: true
    });

    // Process the message
    const response = await chain.call({
      question: message,
    });
    
    // Add the conversationId to the response so the client can use it for future messages
    return NextResponse.json({
      ...response,
      conversationId: chatId
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 