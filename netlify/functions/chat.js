export const handler = async (event) => {
    // Drop instantly if it's not a POST request
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body);
        const chatHistory = body.history;
        const API_KEY = process.env.GEMINI_API_KEY; 
        
        if (!API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ error: "Missing API Key configuration." }) };
        }

        // Using built-in modern native fetch (sub-second performance)
        const response = await fetch(`https://googleapis.com{API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: chatHistory,
                systemInstruction: { parts: [{ text: "You are an elite, highly accurate Cloud AI assistant. Give concise, lightning-fast responses." }] }
            })
        });

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0].content) {
            return { statusCode: 500, body: JSON.stringify({ error: "Invalid API response context." }) };
        }

        const aiText = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: aiText })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
