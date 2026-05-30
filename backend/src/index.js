const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json());

// Basic Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'EduSaaS API is running smoothly.' });
});

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

function buildStudyResponse(body) {
    const message = cleanText(body.message);
    const studentName = cleanText(body.studentName) || 'student';
    const course = cleanText(body.course) || 'your course';
    const batch = cleanText(body.batch);
    const studio = cleanText(body.studio) || 'chat';
    const selectedSources = Array.isArray(body.sources)
        ? body.sources
            .map((source) => ({
                id: cleanText(source?.id),
                title: cleanText(source?.title),
                summary: cleanText(source?.summary),
                type: cleanText(source?.type),
            }))
            .filter((source) => source.title)
            .slice(0, 6)
        : [];

    const sourceTitles = selectedSources.map((source) => source.title);
    const sourceLine = sourceTitles.length > 0 ? `I used ${sourceTitles.join(', ')} to shape this answer.` : 'I focused on your course context and the question you asked.';

    const lowerMessage = message.toLowerCase();
    const wantsQuiz = lowerMessage.includes('quiz') || studio === 'quiz';
    const wantsFlashcards = lowerMessage.includes('flashcard') || studio === 'flashcards';
    const wantsSummary = lowerMessage.includes('summary') || lowerMessage.includes('summarize') || studio === 'reports';
    const wantsMindMap = studio === 'mind-map';
    const wantsAudio = studio === 'audio-overview';
    const wantsDataTable = studio === 'data-table';

    let reply = `Here is a study-focused answer for ${studentName}'s ${course} work. ${sourceLine}`;
    if (wantsQuiz) {
        reply = `Let's turn this into a quick quiz for ${studentName}. I kept it aligned to ${course} so the revision feels practical and exam-ready.`;
    } else if (wantsFlashcards) {
        reply = `Here are compact flashcards for ${studentName} to revise ${course}. I kept the language short so it is easy to review on mobile.`;
    } else if (wantsSummary) {
        reply = `Here is a clean summary for ${studentName} in ${course}. I pulled the response into the key ideas you can revise quickly before class or exams.`;
    } else if (wantsMindMap) {
        reply = `I mapped the topic into connected ideas for ${studentName}'s ${course} study flow, so the bigger picture is easier to remember.`;
    } else if (wantsAudio) {
        reply = `This topic can be narrated as a short audio recap for ${studentName}. I kept the pacing simple and revision-friendly.`;
    } else if (wantsDataTable) {
        reply = `I organized the material for ${studentName} into a clear data table so the topic can be compared, scanned, and revised faster.`;
    }

    const studySteps = [
        `Start with the core idea in ${course}.`,
        batch ? `Tie the answer back to the ${batch} class flow.` : `Connect the answer to your current module.`,
        sourceTitles.length > 0 ? `Review the source notes: ${sourceTitles[0]}.` : `Use one small practice question to test recall.`,
    ];

    const followUps = wantsQuiz
        ? ['Give me harder quiz questions', 'Explain the answers one by one', 'Turn this into flashcards']
        : wantsFlashcards
            ? ['Quiz me on these cards', 'Make the cards shorter', 'Add examples to each card']
            : wantsMindMap
                ? ['Expand the central branch', 'Add a revision example', 'Turn this into a one-page summary']
                : ['Make this simpler', 'Give me examples', 'Turn this into a quiz'];

    const quiz = [
        {
            question: `What is the main concept behind ${course}?`,
            answer: 'It is the central idea that ties the topic together.',
        },
        {
            question: `Which part of the lesson should ${studentName} review first?`,
            answer: 'The source or note that explains the foundation of the topic.',
        },
        {
            question: `How can this topic be practiced quickly?`,
            answer: 'By answering one short recall question and checking the result against the source notes.',
        },
    ];

    const studioPreview = wantsAudio
        ? {
            title: `Audio overview for ${course}`,
            details: ['Short narration', 'Plain-language recap', 'Best for commuting or offline revision'],
        }
        : wantsFlashcards
            ? {
                title: `Flashcards for ${course}`,
                details: ['Front: key term', 'Back: short answer', 'Repeat in 3 rounds'],
            }
            : wantsMindMap
                ? {
                    title: `Mind map for ${course}`,
                    details: ['Central topic', 'Supporting branches', 'Revision checkpoints'],
                }
                : wantsDataTable
                    ? {
                        title: `Data table for ${course}`,
                        details: ['Concept', 'Why it matters', 'Quick example'],
                    }
                    : {
                        title: `Study notes for ${course}`,
                        details: ['Main idea', 'Supporting points', 'Exam hint'],
                    };

    return {
        studentName,
        course,
        batch,
        studio,
        reply,
        keyPoints: [
            `Focus on ${course}.`,
            sourceTitles.length > 0 ? `Use ${sourceTitles[0]} as your anchor source.` : 'Revise the concept in small chunks.',
            wantsQuiz ? 'Answer without looking first, then verify.' : 'Re-read the answer once and summarise it aloud.',
        ],
        studySteps,
        followUps,
        quiz,
        studioPreview,
        sourcesUsed: selectedSources,
        modeLabel: titleCase(studio),
    };
}

app.post('/api/study-assistant', (req, res) => {
    try {
        const body = req.body ?? {};
        const message = cleanText(body.message);

        if (!message) {
            return res.status(400).json({ error: 'A message is required to start the study assistant.' });
        }

        return res.status(200).json({
            demo: true,
            ...buildStudyResponse(body),
        });
    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Unable to process the study assistant request.',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
