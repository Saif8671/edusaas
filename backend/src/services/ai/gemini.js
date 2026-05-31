const { cleanText, parseJsonFromText } = require('../../utils/text');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';

function isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
}

function buildGeminiUrl(model = GEMINI_MODEL) {
    const apiKey = process.env.GEMINI_API_KEY;
    return `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`;
}

async function generateContent(prompt, options = {}) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
    }

    const response = await fetch(buildGeminiUrl(options.model), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: options.temperature ?? 0.4,
                maxOutputTokens: options.maxTokens ?? 4096,
                responseMimeType: options.json ? 'application/json' : 'text/plain',
            },
        }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = payload?.error?.message || 'Gemini request failed.';
        throw new Error(message);
    }

    const parts = payload?.candidates?.[0]?.content?.parts ?? [];
    const content = cleanText(parts.map((part) => part.text ?? '').join('\n'));

    if (!content) {
        throw new Error('Gemini returned an empty response.');
    }

    return {
        content,
        json: options.json ? parseJsonFromText(content) : null,
        model: GEMINI_MODEL,
        provider: 'gemini',
    };
}

module.exports = {
    isConfigured,
    generateContent,
    GEMINI_MODEL,
};
