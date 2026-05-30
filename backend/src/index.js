const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use(express.json({ limit: '2mb' }));

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

function extractTopic(message, course) {
    const cleaned = cleanText(message);
    const match = cleaned.match(/(?:topic|on|about)\s+["']?([^"'.?!]+)["']?/i);
    if (match) return cleanText(match[1]);
    if (cleaned.length > 0 && cleaned.length < 80) return cleaned;
    return course || 'the lesson';
}

function buildQuizQuestions(topic, course, count) {
    const templates = [
        { question: `What is the core idea behind ${topic}?`, answer: `The central concept that defines ${topic} within ${course}.`, options: ['A foundational principle', 'An unrelated detail', 'A formatting rule', 'A optional topic'] },
        { question: `Which step should you take first when studying ${topic}?`, answer: 'Review the foundational definition and one worked example.', options: ['Skip to advanced problems', 'Review the foundation', 'Memorize without understanding', 'Ignore source notes'] },
        { question: `How can you test your understanding of ${topic}?`, answer: 'Explain the concept aloud without looking at notes, then verify.', options: ['Only re-read silently', 'Explain aloud and verify', 'Avoid practice questions', 'Wait until exam day'] },
        { question: `What common mistake should you avoid in ${topic}?`, answer: 'Confusing related terms without checking definitions.', options: ['Checking definitions', 'Using examples', 'Confusing related terms', 'Practising recall'] },
        { question: `Which resource helps most when revising ${topic}?`, answer: 'Your course notes combined with one practice question.', options: ['Random internet summaries', 'Course notes + practice', 'Ignoring weak areas', 'Only watching videos'] },
        { question: `What is one real-world application of ${topic}?`, answer: `Applying ${topic} to solve practical problems in ${course}.`, options: ['No applications exist', 'Practical problem solving', 'Only exam memorization', 'Unrelated trivia'] },
        { question: `How do you know you have mastered ${topic}?`, answer: 'You can teach it simply and answer varied questions correctly.', options: ['You read it once', 'You can teach it simply', 'You copied notes', 'You skipped exercises'] },
        { question: `What should you do if ${topic} feels difficult?`, answer: 'Break it into smaller parts and revise each with an example.', options: ['Give up immediately', 'Break into smaller parts', 'Skip entirely', 'Memorize blindly'] },
    ];
    return templates.slice(0, Math.max(1, Math.min(count, templates.length)));
}

function buildFlashcards(topic, course) {
    return [
        { front: `Define ${topic}`, back: `The key concept in ${course} that connects theory to practice.` },
        { front: `Why does ${topic} matter?`, back: 'It forms the foundation for advanced topics and exam questions.' },
        { front: `One example of ${topic}`, back: 'A simple worked example from your lecture notes or textbook.' },
        { front: `Common error in ${topic}`, back: 'Mixing up definitions or skipping the reasoning step.' },
        { front: `Quick revision tip`, back: 'Read, recall, check — repeat in three short rounds.' },
    ];
}

function buildMindMap(topic, course) {
    return {
        central: topic,
        branches: [
            {
                label: 'Core idea',
                children: ['Definition', 'Key formula or rule', 'When to use it'],
            },
            {
                label: `${course} context`,
                children: ['Syllabus link', 'Past exam focus', 'Prerequisite topics'],
            },
            {
                label: 'Practice',
                children: ['Easy example', 'Medium problem', 'Self-check question'],
            },
            {
                label: 'Revision',
                children: ['Flashcards', 'Quick quiz', 'Teach-back method'],
            },
        ],
    };
}

function buildSlides(topic, course) {
    return [
        { title: `Introduction to ${topic}`, bullets: [`Overview within ${course}`, 'Learning objectives', 'Why this topic matters'] },
        { title: 'Key Concepts', bullets: ['Main definition', 'Important properties', 'Common notation or terms'] },
        { title: 'Worked Example', bullets: ['Problem statement', 'Step-by-step solution', 'Final answer check'] },
        { title: 'Common Mistakes', bullets: ['Typical errors students make', 'How to avoid them', 'Quick self-check'] },
        { title: 'Revision Summary', bullets: ['Three key takeaways', 'Practice recommendation', 'Next topic to study'] },
    ];
}

function buildReport(topic, course, studentName) {
    return {
        title: `Study Report: ${topic}`,
        sections: [
            { heading: 'Executive Summary', content: `${studentName} is revising ${topic} as part of ${course}. This report highlights the main ideas, study steps, and practice recommendations.` },
            { heading: 'Key Concepts', content: `The topic covers foundational ideas in ${course}. Focus on definitions, one strong example, and how the concept connects to prior lessons.` },
            { heading: 'Study Plan', content: '1) Read source notes. 2) Summarise in your own words. 3) Answer two practice questions. 4) Review mistakes immediately.' },
            { heading: 'Assessment Readiness', content: 'You are exam-ready when you can explain the topic simply, solve a medium problem, and identify one common mistake.' },
        ],
    };
}

function buildInfographic(topic, course) {
    return {
        title: `${topic} at a glance`,
        highlights: [
            { label: 'Focus', value: topic },
            { label: 'Course', value: course },
            { label: 'Time to revise', value: '15–20 min' },
            { label: 'Difficulty', value: 'Moderate' },
        ],
        steps: ['Learn', 'Practice', 'Test', 'Review'],
        tip: 'Use one source, one example, and one quiz round for best retention.',
    };
}

function buildStudyResponse(body) {
    const message = cleanText(body.message);
    const studentName = cleanText(body.studentName) || 'student';
    const course = cleanText(body.course) || 'your course';
    const batch = cleanText(body.batch);
    const studio = cleanText(body.studio) || 'chat';
    const testTopic = cleanText(body.testTopic);
    const questionCount = Math.max(1, Math.min(Number(body.questionCount) || 5, 10));
    const topic = testTopic || extractTopic(message, course);

    const selectedSources = Array.isArray(body.sources)
        ? body.sources
            .map((source) => ({
                id: cleanText(source?.id),
                title: cleanText(source?.title),
                summary: cleanText(source?.summary),
                type: cleanText(source?.type),
                content: cleanText(source?.content),
            }))
            .filter((source) => source.title)
            .slice(0, 8)
        : [];

    const sourceTitles = selectedSources.map((source) => source.title);
    const sourceLine = sourceTitles.length > 0
        ? `I used ${sourceTitles.join(', ')} to shape this answer.`
        : 'I focused on your course context and the question you asked.';

    const lowerMessage = message.toLowerCase();
    const wantsQuiz = lowerMessage.includes('quiz') || lowerMessage.includes('test') || studio === 'quiz' || Boolean(testTopic);
    const wantsFlashcards = lowerMessage.includes('flashcard') || studio === 'flashcards';
    const wantsSummary = lowerMessage.includes('summary') || lowerMessage.includes('summarize') || lowerMessage.includes('report') || studio === 'reports';
    const wantsMindMap = lowerMessage.includes('mind map') || studio === 'mind-map';
    const wantsAudio = studio === 'audio-overview';
    const wantsSlides = lowerMessage.includes('slide') || lowerMessage.includes('ppt') || studio === 'slide-deck';
    const wantsInfographic = studio === 'infographic';
    const wantsVideo = studio === 'video-overview';
    const wantsDataTable = studio === 'data-table';
    const isTakeTest = lowerMessage.includes('take test') || Boolean(testTopic);

    let reply = `Here is a study-focused answer for ${studentName}'s ${course} work on **${topic}**. ${sourceLine}`;

    if (isTakeTest || wantsQuiz) {
        reply = `I've prepared a ${questionCount}-question test on **${topic}** for ${studentName}. Answer each question first, then check the solutions. Good luck!`;
    } else if (wantsFlashcards) {
        reply = `Here are flashcards for **${topic}** in ${course}. Flip through them in three rounds for best retention.`;
    } else if (wantsSummary) {
        reply = `Here is a structured study report for **${topic}** in ${course}. Use it as a one-page revision guide.`;
    } else if (wantsMindMap) {
        reply = `I've mapped **${topic}** into connected branches so you can see the bigger picture in ${course}.`;
    } else if (wantsSlides) {
        reply = `Here's a slide deck outline for **${topic}** — ${buildSlides(topic, course).length} slides ready for revision or presentation.`;
    } else if (wantsInfographic) {
        reply = `Here's a visual cheat sheet for **${topic}** — key stats, steps, and a quick revision tip.`;
    } else if (wantsAudio) {
        reply = `This topic can be narrated as a short audio recap on **${topic}** for ${studentName}. Read each section aloud for practice.`;
    } else if (wantsVideo) {
        reply = `Here's a video lesson outline for **${topic}** — use it to structure a 5-minute revision clip.`;
    } else if (wantsDataTable) {
        reply = `I've organized **${topic}** into a comparison table so you can scan and revise faster.`;
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('teach') || lowerMessage.includes('learn')) {
        reply = `Let me teach **${topic}** step by step. I'll break it into simple parts you can understand and remember. ${sourceLine}`;
    }

    const studySteps = [
        `Start with the core idea: ${topic}.`,
        batch ? `Connect it to your ${batch} class flow.` : 'Link it to your current module.',
        sourceTitles.length > 0 ? `Review: ${sourceTitles[0]}.` : 'Use one practice question to test recall.',
        wantsQuiz || isTakeTest ? 'Answer test questions without looking, then verify.' : 'Summarise the answer in one sentence.',
    ];

    const followUps = isTakeTest
        ? ['Show me the answers', 'Give me harder questions', 'Explain question 1']
        : wantsQuiz
            ? ['Give me harder quiz questions', 'Explain the answers one by one', 'Turn this into flashcards']
            : wantsFlashcards
                ? ['Quiz me on these cards', 'Make the cards shorter', 'Add examples to each card']
                : wantsMindMap
                    ? ['Expand the central branch', 'Add a revision example', 'Turn this into a one-page summary']
                    : wantsSlides
                        ? ['Add speaker notes', 'Make it shorter', 'Turn into flashcards']
                        : ['Make this simpler', 'Give me examples', 'Take a test on this topic'];

    const quiz = buildQuizQuestions(topic, course, isTakeTest ? questionCount : 3);
    const flashcards = buildFlashcards(topic, course);
    const mindMap = buildMindMap(topic, course);
    const slides = buildSlides(topic, course);
    const report = buildReport(topic, course, studentName);
    const infographic = buildInfographic(topic, course);

    const dataTable = {
        headers: ['Concept', 'Definition', 'Example', 'Exam tip'],
        rows: [
            [topic, 'Core idea in this module', 'From lecture notes', 'Revise with one practice Q'],
            ['Prerequisite', 'Prior knowledge needed', 'Earlier chapter', 'Review if stuck'],
            ['Application', 'Real-world use', 'Problem solving', 'Focus on reasoning'],
        ],
    };

    const studioPreview = wantsAudio
        ? { title: `Audio overview: ${topic}`, details: ['Short narration script', 'Plain-language recap', 'Best for commuting'] }
        : wantsSlides
            ? { title: `Slide deck: ${topic}`, details: [`${slides.length} slides`, 'Speaker-ready outline', 'Export-friendly format'] }
            : wantsFlashcards
                ? { title: `Flashcards: ${topic}`, details: [`${flashcards.length} cards`, 'Front/back format', '3-round revision'] }
                : wantsMindMap
                    ? { title: `Mind map: ${topic}`, details: ['Central topic', `${mindMap.branches.length} branches`, 'Revision checkpoints'] }
                    : wantsInfographic
                        ? { title: `Infographic: ${topic}`, details: ['Key stats', '4-step flow', 'Visual cheat sheet'] }
                        : wantsSummary || studio === 'reports'
                            ? { title: `Report: ${topic}`, details: [`${report.sections.length} sections`, 'Structured summary', 'Exam-ready'] }
                            : isTakeTest || wantsQuiz
                                ? { title: `Test: ${topic}`, details: [`${quiz.length} questions`, 'Multiple choice', 'Instant feedback'] }
                                : { title: `Study notes: ${topic}`, details: ['Main idea', 'Supporting points', 'Exam hint'] };

    return {
        studentName,
        course,
        batch,
        studio,
        topic,
        questionCount: isTakeTest ? questionCount : quiz.length,
        reply,
        keyPoints: [
            `Focus on ${topic}.`,
            sourceTitles.length > 0 ? `Anchor source: ${sourceTitles[0]}.` : 'Revise in small chunks.',
            isTakeTest ? 'Answer without looking first.' : 'Explain the concept aloud after reading.',
        ],
        studySteps,
        followUps,
        quiz,
        flashcards,
        mindMap,
        slides,
        report,
        infographic,
        dataTable,
        studioPreview,
        sourcesUsed: selectedSources,
        modeLabel: isTakeTest ? 'Practice Test' : titleCase(studio),
        teachingMode: lowerMessage.includes('teach') || lowerMessage.includes('learn') || lowerMessage.includes('explain'),
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
