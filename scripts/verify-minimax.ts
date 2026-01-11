import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function verify() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const url = "https://api.minimax.io/anthropic/v1/messages";

  console.log("--- MiniMax Verification (Dual Header) ---");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "MiniMax-M2.1",
        max_tokens: 100,
        messages: [{ role: "user", content: "Tell me a very short joke." }]
      })
    });

    const data = await response.json();
    if (response.ok) {
        console.log("Success!");
        console.log("Response:", data.content[0].text);
    } else {
        console.log("Failed with status:", response.status);
        console.log("Error Details:", JSON.stringify(data, null, 2));
    }
  } catch (error: any) {
    console.error("Connection Error:", error.message);
  }
}

verify();
