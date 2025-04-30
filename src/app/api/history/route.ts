import { NextResponse } from 'next/server';
import { getConversations, getConversationMessages } from '@/lib/db/chatHistory';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    if (conversationId) {
      const messages = await getConversationMessages(conversationId, skip, limit);
      const total = await getConversationMessageCount(conversationId);
      
      return NextResponse.json({ 
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }
  const db = await getDb();
  await db.collection('chat_conversations').deleteOne({ conversationId });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }
  const { preview } = await request.json();
  const db = await getDb();
  // Update the preview (first user message)
  await db.collection('chat_conversations').updateOne(
    { conversationId, 'messages.0.role': 'user' },
    { $set: { 'messages.0.content': preview } }
  );
  return NextResponse.json({ success: true });
}

// Helper function to get the total count of messages in a conversation
async function getConversationMessageCount(conversationId: string): Promise<number> {
  const db = await getDb();
  const conversation = await db.collection('chat_conversations').findOne({ conversationId });
  return conversation?.messages?.length || 0;
} 