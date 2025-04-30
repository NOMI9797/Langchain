import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// Create embeddings with optimized settings
export const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
  maxRetries: 3 // Limit retries on failure
}); 