import { NextResponse } from 'next/server';
import { createChain } from '@/lib/langchain/chain';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use provided conversationId or generate a new one
    const convoId = conversationId || uuidv4();

    // Create a new chain with memory for this conversation
    const chain = createChain({
      conversationId: convoId,
      returnMessages: true,
    });

    try {
      // Call chain with user's input - memory is handled automatically
      const response = await chain.call({
        input: message,
      });

      return NextResponse.json({
        message: response.response,
        conversationId: convoId,
      });
    } catch (chainError: any) {
      console.error('Chain error:', chainError);
      return NextResponse.json(
        { error: `Chain error: ${chainError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: `API error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 