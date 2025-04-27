import { NextResponse } from 'next/server';
import { chain } from '@/lib/langchain/chain';
import { HumanMessage, AIMessage } from 'langchain/schema';

export async function POST(request: Request) {
  try {
    const { message, chat_history = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Convert the chat history to the format expected by LangChain
    const formattedHistory = chat_history.map((msg: any) => {
      if (msg.role === 'human') {
        return new HumanMessage(msg.content);
      } else if (msg.role === 'ai') {
        return new AIMessage(msg.content);
      }
      return null;
    }).filter(Boolean);

    try {
      const response = await chain.call({
        input: message,
        chat_history: formattedHistory,
      });

      return NextResponse.json({
        message: response.response,
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