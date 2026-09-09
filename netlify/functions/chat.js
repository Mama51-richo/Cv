const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body);
        const chatHistory = body.history;

        // Pull the hidden API key safely stored in Netlify's environment dashboard
        const API_KEY = process.env.GEMINI_API_KEY; 
        
        if (!API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ error: "Missing API Key configuration on Netlify." }) };
        }

        // Call Gemini 1.5 Flash (Highly accurate, extremely fast reasoning model)
        const response = await fetch(`https://googleapis.com{API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: chatHistory,
                systemInstruction: { parts: [{ text: "You are an elite, highly accurate Cloud AI assistant built inside a single file pipeline." }] }
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ text: aiText })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
