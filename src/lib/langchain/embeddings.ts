import { Embeddings } from "@langchain/core/embeddings";
import { pipeline } from "@xenova/transformers";

// Local embeddings using Xenova transformers - no API keys required!
class LocalEmbeddings extends Embeddings {
  private model: any = null;

  constructor() {
    super({});
  }

  async initModel() {
    if (!this.model) {
      this.model = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { 
          quantized: false,
          progress_callback: undefined // Disable progress logs
        }
      );
    }
    return this.model;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const model = await this.initModel();
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const output = await model(text, { pooling: 'mean', normalize: true });
      embeddings.push(Array.from(output.data) as number[]);
    }
    
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const model = await this.initModel();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data) as number[];
  }
}

// Create embeddings with local model - no API keys needed!
export const embeddings = new LocalEmbeddings(); 