const { cleanText } = require('../../utils/text');

function getChatConfig() {
    const groqKey = process.env.GROQ_API_KEY
        || (cleanText(process.env.XAI_API_KEY).startsWith('gsk_') ? process.env.XAI_API_KEY : '');

    if (groqKey) {
        return {
            apiKey: groqKey,
            apiUrl: process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            provider: 'groq',
        };
    }

    const xaiKey = cleanText(process.env.XAI_API_KEY);
    if (xaiKey) {
        return {
            apiKey: xaiKey,
            apiUrl: process.env.XAI_API_URL || 'https://api.x.ai/v1/chat/completions',
            model: process.env.GROK_MODEL || 'grok-3-mini',
            provider: 'grok',
        };
    }

    return null;
}

function isConfigured() {
    return Boolean(getChatConfig());
}

async function chat(messages, options = {}) {
    const config = getChatConfig();
    if (!config) {
        throw new Error('No chat provider configured. Set GROQ_API_KEY or XAI_API_KEY.');
    }

    const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: options.model || config.model,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1800,
            messages,
        }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = payload?.error?.message || payload?.message || `${config.provider} request failed.`;
        throw new Error(message);
    }

    const content = cleanText(payload?.choices?.[0]?.message?.content);
    if (!content) {
        throw new Error(`${config.provider} returned an empty response.`);
    }

    return {
        content,
        model: payload?.model || config.model,
        provider: config.provider,
    };
}

module.exports = {
    isConfigured,
    chat,
    getChatConfig,
};
