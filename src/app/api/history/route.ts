import { NextResponse } from 'next/server';
import { getConversations, getConversationMessages } from '@/lib/db/chatHistory';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      const messages = await getConversationMessages(conversationId);
      return NextResponse.json({ messages });
    }
    const conversations = await getConversations();
    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chat history.' },
      { status: 500 }
    );
  }
} 