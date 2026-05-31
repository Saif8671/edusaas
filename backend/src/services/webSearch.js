const { cleanText, truncate } = require('../utils/text');

async function fetchDuckDuckGoResults(query, limit) {
    const results = [];

    try {
        const response = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
        );
        const data = await response.json();

        if (cleanText(data.AbstractText)) {
            results.push({
                title: cleanText(data.Heading) || query,
                summary: truncate(data.AbstractText, 480),
                content: truncate(data.AbstractText, 6000),
                url: cleanText(data.AbstractURL),
                type: 'web',
            });
        }

        for (const topic of data.RelatedTopics ?? []) {
            if (results.length >= limit) break;
            if (!topic.Text) continue;

            const [title, ...rest] = topic.Text.split(' - ');
            results.push({
                title: cleanText(title) || query,
                summary: truncate(rest.join(' - ') || topic.Text, 480),
                content: truncate(topic.Text, 6000),
                url: cleanText(topic.FirstURL),
                type: 'web',
            });
        }
    } catch (error) {
        console.warn('[web-search] DuckDuckGo lookup failed:', error.message);
    }

    return results;
}

async function fetchWikipediaSummary(query) {
    try {
        const searchResponse = await fetch(
            `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`,
        );
        const searchData = await searchResponse.json();
        const title = searchData?.[1]?.[0];
        if (!title) return null;

        const summaryResponse = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        );
        if (!summaryResponse.ok) return null;

        const summaryData = await summaryResponse.json();
        return {
            title: cleanText(summaryData.title) || title,
            summary: truncate(summaryData.extract, 480),
            content: truncate(summaryData.extract, 6000),
            url: cleanText(summaryData.content_urls?.desktop?.page),
            type: 'web',
        };
    } catch (error) {
        console.warn('[web-search] Wikipedia lookup failed:', error.message);
        return null;
    }
}

async function searchWeb(query, options = {}) {
    const cleanedQuery = cleanText(query);
    const limit = Math.max(1, Math.min(Number(options.limit) || 4, 6));
    const mode = cleanText(options.mode) || 'web';

    if (!cleanedQuery) {
        return [];
    }

    const smartQuery = mode === 'smart' && options.course
        ? `${cleanedQuery} ${options.course} study guide`
        : cleanedQuery;

    const results = await fetchDuckDuckGoResults(smartQuery, limit);

    if (results.length < 2) {
        const wiki = await fetchWikipediaSummary(smartQuery);
        if (wiki && !results.some((item) => item.title.toLowerCase() === wiki.title.toLowerCase())) {
            results.unshift(wiki);
        }
    }

    return results.slice(0, limit).map((item, index) => ({
        id: `web-${Date.now()}-${index}`,
        title: item.title,
        summary: item.summary,
        content: item.content,
        url: item.url,
        type: 'web',
    }));
}

module.exports = {
    searchWeb,
};
