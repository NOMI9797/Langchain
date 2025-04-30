import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { Document } from "@langchain/core/documents";
import { pinecone } from "./pinecone";
import { embeddings } from "./embeddings";

interface VectorStoreConfig {
  indexName: string; 
  namespace?: string;
  textKey?: string;
}

export class VectorStoreService {
  private config: VectorStoreConfig;

  constructor(config: VectorStoreConfig) {
    this.config = {
      ...config,
      textKey: config.textKey || "text"
    };
  }

  async getVectorStore() {
    const indexName = this.config.indexName || process.env.PINECONE_INDEX_NAME!;

    // Get the Pinecone index
    const index = pinecone.index(indexName);
    
    // Initialize or get the LangChain vector store
    return await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: this.config.namespace,
      textKey: this.config.textKey
    });
  }

  async addDocuments(documents: Document[]) {
    const vectorStore = await this.getVectorStore();
    await vectorStore.addDocuments(documents);
    return true;
  }

  async similaritySearch(query: string, k = 4) {
    const vectorStore = await this.getVectorStore();
    return await vectorStore.similaritySearch(query, k);
  }

  async clearNamespace() {
    if (!this.config.namespace) {
      throw new Error("Namespace must be specified to clear it");
    }
    
    const indexName = this.config.indexName || process.env.PINECONE_INDEX_NAME!;
    const index = pinecone.index(indexName);
    
    await index.namespace(this.config.namespace).deleteAll();
    return true;
  }
}

export const createVectorStore = (config: VectorStoreConfig) => {
  return new VectorStoreService(config);
}; 