const dotenv = require('dotenv');
const { Groq } = require('groq-sdk');

// Load environment variables
dotenv.config();

async function testGroqApi() {
    // Initialize the Groq client
    const client = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    // Example prompt
    const prompt = "What are three interesting facts about artificial intelligence?";

    try {
        // Create a chat completion
        const chatCompletion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        // Print the response
        console.log("\nPrompt:", prompt);
        console.log("\nResponse:", chatCompletion.choices[0].message.content);

    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}


async function queryGroq(userQuery) {
    // Initialize the Groq client
    const client = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    try {
        // Create a chat completion
        const chatCompletion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: userQuery,
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        // Return the response
        return chatCompletion.choices[0].message.content;

    } catch (error) {
        console.error("An error occurred:", error.message);
        throw error;
    }
}

async function queryGroqWithContext(systemPrompt, context, userQuery) {
    // Initialize the Groq client
    const client = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    try {
        // Create a chat completion with system prompt, context, and user query
        const chatCompletion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Context:\n${context}\n\nUser Query: ${userQuery}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        // Return the response
        return chatCompletion.choices[0].message.content;

    } catch (error) {
        console.error("An error occurred:", error.message);
        throw error;
    }
}

// Example usage of the new function
async function example() {
    try {
        // Example system prompt for Google Sheets
        const systemPrompt = "You are a copilot for Google Sheets. You should input formulas to sheet blocks based on user requests. Provide clear, concise formulas and explain your reasoning.";
        
        // Example context (Excel data)
        const context = `Sheet Data:
        A1: Sales
        A2: 100
        A3: 200
        A4: 300
        B1: Revenue
        B2: 1000
        B3: 2000
        B4: 3000`;

        // Example user query
        const userQuery = "Calculate the total sales and revenue in row 5";

        const response = await queryGroqWithContext(systemPrompt, context, userQuery);
        console.log("\nSystem Prompt:", systemPrompt);
        console.log("\nContext:", context);
        console.log("\nUser Query:", userQuery);
        console.log("\nResponse:", response);
    } catch (error) {
        console.error("Failed to get response:", error);
    }
}

// Run the example
example(); 