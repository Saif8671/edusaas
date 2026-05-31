function cleanText(value) {
    return String(value ?? '').trim();
}

function titleCase(value) {
    return cleanText(value)
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function extractTopic(message, course) {
    const cleaned = cleanText(message);
    const explicitMatch = cleaned.match(/(?:topic|about|on|for|regarding)\s+["']?([^"'.?!]+)["']?/i);
    if (explicitMatch) return cleanText(explicitMatch[1]);

    const requestMatch = cleaned.match(/^(?:please\s+)?(?:can you|could you|would you|help me|help|fix|solve|explain|describe|define|summarize|summarise|teach|learn|compare|give me|tell me|what is|what are|how to|how do i|how can i)\s+(.+)$/i);
    if (requestMatch) {
        const topic = cleanText(requestMatch[1]).replace(/[?.!]+$/g, "");
        if (topic) return topic;
    }

    const concise = cleaned.replace(/\s+/g, " ");
    const looksLikeTopic = concise.length > 0
        && concise.length < 80
        && !/\b(please|help|explain|teach|learn|fix|solve|what|how|why|compare)\b/i.test(concise);
    if (looksLikeTopic) return concise;

    return course || 'the lesson';
}

function parseJsonFromText(text) {
    const raw = cleanText(text);
    if (!raw) return null;

    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1].trim() : raw;

    try {
        return JSON.parse(candidate);
    } catch {
        const start = candidate.indexOf('{');
        const end = candidate.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(candidate.slice(start, end + 1));
            } catch {
                return null;
            }
        }
        return null;
    }
}

function truncate(value, max = 4000) {
    const text = cleanText(value);
    if (text.length <= max) return text;
    return `${text.slice(0, max)}…`;
}

module.exports = {
    cleanText,
    titleCase,
    extractTopic,
    parseJsonFromText,
    truncate,
};
