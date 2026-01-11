import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testThinking() {
  // Using the key provided in the chat
  const apiKey = "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";
  const baseURL = "https://api.minimax.io/anthropic";

  console.log("--- MiniMax Thinking Integration Test ---");
  
  const client = new Anthropic({
    apiKey,
    baseURL
  });

  try {
    console.log("Sending request to MiniMax-M2.1...");
    const message = await client.messages.create({
      model: "MiniMax-M2.1",
      max_tokens: 1000,
      system: "You are a helpful assistant.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Hi, how are you? Tell me a short joke."
            }
          ]
        }
      ]
    });

    console.log("\n--- Response Content ---");
    for (const block of message.content) {
      if (block.type === "text") {
        console.log(`Text:\n${block.text}\n`);
      } else if ((block as any).type === "thinking") {
        console.log(`Thinking:\n${(block as any).thinking}\n`);
      } else {
        console.log(`Block Type: ${block.type}`);
      }
    }
  } catch (error: any) {
    console.error("\nError:");
    if (error.status === 401) {
      console.error("401 Unauthorized: The API key provided is not being accepted by the MiniMax endpoint.");
      console.error("Details:", error.message);
    } else {
      console.error(error.message);
    }
  }
}

testThinking();
