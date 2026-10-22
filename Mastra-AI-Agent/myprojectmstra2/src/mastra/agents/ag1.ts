import {Agent} from "@mastra/core/agent";
import { createOllama } from "ollama-ai-provider-v2";

const ollama = createOllama({
  baseURL: "http://localhost:11434/api",
});

export const qwenAgent = new Agent({
  id: "qwen-agent",
  name: "Qwen Assistant",
  instructions: `
    You are a helpful AI assistant.
    You need to support the Customer to provide best hotel deals. Customer will provide you with the hotel name, location, and check-in/check-out dates. You need to provide the best hotel deals based on the provided information.
    You should respond in a concise and clear manner, providing the necessary information without unnecessary details.
  `,
  model: ollama("qwen3.5:2b"),
});



