import { NextResponse } from 'next/server';
import { chain } from '@/lib/langchain/chain';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { saveMessage } from '@/lib/db/chatHistory';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { message, chat_history = [], conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use provided conversationId or generate a new one
    const convoId = conversationId || uuidv4();

    // Save user message to DB
    await saveMessage(convoId, {
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

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

      // Save assistant message to DB
      await saveMessage(convoId, {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
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