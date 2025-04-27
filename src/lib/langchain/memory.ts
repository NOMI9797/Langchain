import { BufferMemory } from 'langchain/memory';

export const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
  inputKey: "input",
  outputKey: "response",
}); 