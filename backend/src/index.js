const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { cleanText } = require('./utils/text');
const { processStudyRequest, normalizeSources } = require('./services/studyAssistant');

const app = express();
const START_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_ATTEMPTS = 10;

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '4mb' }));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'EduSaaS API is running smoothly.',
        ai: {
            groq: Boolean(process.env.GROQ_API_KEY || String(process.env.XAI_API_KEY ?? '').startsWith('gsk_')),
            grok: Boolean(process.env.XAI_API_KEY) && !String(process.env.XAI_API_KEY ?? '').startsWith('gsk_'),
            gemini: Boolean(process.env.GEMINI_API_KEY),
        },
    });
});

app.post('/api/study-assistant/sources/summarize', async (req, res) => {
    try {
        const body = req.body ?? {};
        const sources = normalizeSources({ sources: body.sources ?? [] });

        if (!sources.length) {
            return res.status(400).json({ error: 'At least one source with a title is required.' });
        }

        const gemini = require('./services/ai/gemini');
        if (!gemini.isConfigured()) {
            const summaries = sources.map((source) => ({
                ...source,
                summary: source.summary || truncateSource(source.content) || `Notes for ${source.title}.`,
            }));
            return res.status(200).json({ demo: true, sources: summaries });
        }

        const prompt = `Summarize each study source in 2-3 concise sentences for a student notebook.
Return JSON: { "sources": [{ "id": "string", "title": "string", "summary": "string" }] }

Sources:
${sources.map((source, index) => `ID: ${source.id}\nTitle: ${source.title}\nType: ${source.type}\nContent:\n${source.content || source.summary}`).join('\n\n')}`;

        const result = await gemini.generateContent(prompt, { json: true });
        const summarized = Array.isArray(result.json?.sources) ? result.json.sources : [];

        return res.status(200).json({
            demo: false,
            sources: sources.map((source) => {
                const match = summarized.find((item) => cleanText(item.id) === source.id);
                return {
                    ...source,
                    summary: cleanText(match?.summary) || source.summary || truncateSource(source.content),
                };
            }),
        });
    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Unable to summarize sources.',
        });
    }
});

function truncateSource(value, max = 240) {
    const text = cleanText(value);
    if (!text) return '';
    return text.length <= max ? text : `${text.slice(0, max)}…`;
}

app.post('/api/study-assistant', async (req, res) => {
    try {
        const body = req.body ?? {};
        const message = cleanText(body.message);

        if (!message) {
            return res.status(400).json({ error: 'A message is required to start the study assistant.' });
        }

        const result = await processStudyRequest(body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Unable to process the study assistant request.',
        });
    }
});

function startServer(port, attempt = 0) {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
            const nextPort = port + 1;
            console.warn(`Port ${port} is already in use, trying ${nextPort}...`);
            startServer(nextPort, attempt + 1);
            return;
        }

        console.error(error);
        process.exit(1);
    });
}

startServer(START_PORT);
