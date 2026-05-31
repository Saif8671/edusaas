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
    const match = cleaned.match(/(?:topic|on|about)\s+["']?([^"'.?!]+)["']?/i);
    if (match) return cleanText(match[1]);
    if (cleaned.length > 0 && cleaned.length < 80) return cleaned;
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
