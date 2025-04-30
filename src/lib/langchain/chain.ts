import { ChatGroq } from "@langchain/groq";
import { createVectorStore } from "./vectorStore";
import { ChatMemory } from "./memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage } from "@langchain/core/messages";

interface ChainConfig {
  conversationId: string;
  indexName?: string;
  
  namespace?: string;
  returnSourceDocuments?: boolean;
}

interface ChainInput {
  question: string;
}

const TEMPLATE = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context: {context}

Chat History: {chat_history}

Question: {question}

Answer: `;

const prompt = PromptTemplate.fromTemplate(TEMPLATE);

export const createChain = async (config: ChainConfig) => {
  // Create vector store with config
  const vectorStore = await createVectorStore({
    indexName: config.indexName || process.env.PINECONE_INDEX_NAME!,
    namespace: config.namespace
  }).getVectorStore();

  // Initialize the LLM model
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY!,
    model: "llama3-70b-8192",
    temperature: 0.7,
  });

  // Initialize memory with both short-term and long-term storage
  const memory = new ChatMemory({
    conversationId: config.conversationId,
    returnMessages: true
  });

  // Create retriever
  const retriever = vectorStore.asRetriever({
    k: 5,
    searchType: "similarity",
  });

  return {
    call: async ({ question }: ChainInput) => {
      // Get relevant documents
      const relevantDocs = await retriever.getRelevantDocuments(question);
      const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");

      // Get chat history
      const history = await memory.loadMemoryVariables();
      const chatHistory = history.chat_history || "";

      // Format prompt
      const formattedPrompt = await prompt.format({
        context,
        chat_history: chatHistory,
        question
      });

      // Get response from model
      const messages = [new HumanMessage(formattedPrompt)];
      const response = await model.call(messages);
      const result = response.content;

      // Save to memory with correct output key
      await memory.saveContext(
        { input: question },
        { response: result }  // Changed from output to response to match memory config
      );

      return {
        text: result,
        sourceDocuments: config.returnSourceDocuments ? relevantDocs : undefined
      };
    }
  };
}; 