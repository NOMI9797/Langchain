import { NextResponse } from 'next/server';
import { getConversations, getConversationMessages } from '@/lib/db/chatHistory';
import { getDb } from '@/lib/db/mongodb';

// Helper function to get the total count of messages in a conversation
async function getConversationMessageCount(conversationId: string): Promise<number> {
  const db = await getDb();
  const conversation = await db.collection('chat_conversations').findOne({ conversationId });
  return conversation?.messages?.length || 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    if (conversationId) {
      const [messages, total] = await Promise.all([
        getConversationMessages(conversationId, skip, limit),
        getConversationMessageCount(conversationId)
      ]);
      
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
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection('chat_conversations').deleteOne({ conversationId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete conversation.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }
    
    const { preview } = await request.json();
    if (!preview) {
      return NextResponse.json({ error: 'Missing preview content' }, { status: 400 });
    }

    const db = await getDb();
    
    // First check if the conversation exists and has messages
    const conversation = await db.collection('chat_conversations').findOne({ 
      conversationId,
      'messages.0': { $exists: true }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or empty' }, { status: 404 });
    }

    // Update the preview (first user message)
    const result = await db.collection('chat_conversations').updateOne(
      { 
        conversationId, 
        'messages.0.role': 'user' 
      },
      { 
        $set: { 'messages.0.content': preview },
        $currentDate: { updatedAt: true }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'No matching message found to update' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update conversation.' },
      { status: 500 }
    );
  }
} 