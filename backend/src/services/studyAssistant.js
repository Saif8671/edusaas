const grok = require('./ai/grok');
const gemini = require('./ai/gemini');
const { cleanText, titleCase, extractTopic, truncate } = require('../utils/text');

function buildQuizQuestions(topic, course, count) {
    const templates = [
        { question: `What is the core idea behind ${topic}?`, answer: `The central concept that defines ${topic} within ${course}.`, options: ['A foundational principle', 'An unrelated detail', 'A formatting rule', 'An optional topic'] },
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
            { label: 'Core idea', children: ['Definition', 'Key formula or rule', 'When to use it'] },
            { label: `${course} context`, children: ['Syllabus link', 'Past exam focus', 'Prerequisite topics'] },
            { label: 'Practice', children: ['Easy example', 'Medium problem', 'Self-check question'] },
            { label: 'Revision', children: ['Flashcards', 'Quick quiz', 'Teach-back method'] },
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

function normalizeSources(body) {
    return Array.isArray(body.sources)
        ? body.sources
            .map((source) => ({
                id: cleanText(source?.id) || `src-${Date.now()}`,
                title: cleanText(source?.title),
                summary: cleanText(source?.summary),
                type: cleanText(source?.type) || 'text',
                content: truncate(source?.content, 6000),
            }))
            .filter((source) => source.title)
            .slice(0, 8)
        : [];
}

function buildSourceContext(sources) {
    if (!sources.length) return 'No uploaded sources yet.';
    return sources
        .map((source, index) => {
            const summary = source.summary || source.content || 'No content provided.';
            return `Source ${index + 1}: ${source.title} (${source.type})\n${truncate(summary, 1200)}`;
        })
        .join('\n\n');
}

function detectIntent(body, message, studio) {
    const lowerMessage = message.toLowerCase();
    const testTopic = cleanText(body.testTopic);
    const isTakeTest = lowerMessage.includes('take test') || Boolean(testTopic);

    return {
        wantsQuiz: lowerMessage.includes('quiz') || lowerMessage.includes('test') || studio === 'quiz' || Boolean(testTopic),
        wantsFlashcards: lowerMessage.includes('flashcard') || studio === 'flashcards',
        wantsSummary: lowerMessage.includes('summary') || lowerMessage.includes('summarize') || studio === 'reports',
        wantsMindMap: lowerMessage.includes('mind map') || studio === 'mind-map',
        wantsAudio: studio === 'audio-overview',
        wantsSlides: lowerMessage.includes('slide') || lowerMessage.includes('ppt') || studio === 'slide-deck',
        wantsInfographic: studio === 'infographic',
        wantsVideo: studio === 'video-overview',
        wantsDataTable: studio === 'data-table',
        isTakeTest,
        teachingMode: lowerMessage.includes('teach') || lowerMessage.includes('learn') || lowerMessage.includes('explain'),
    };
}

function buildStudioPreview(intent, topic, assets) {
    if (intent.wantsAudio) {
        return { title: `Audio overview: ${topic}`, details: ['Short narration script', 'Plain-language recap', 'Best for commuting'] };
    }
    if (intent.wantsSlides) {
        return { title: `Slide deck: ${topic}`, details: [`${assets.slides.length} slides`, 'Speaker-ready outline', 'Export-friendly format'] };
    }
    if (intent.wantsFlashcards) {
        return { title: `Flashcards: ${topic}`, details: [`${assets.flashcards.length} cards`, 'Front/back format', '3-round revision'] };
    }
    if (intent.wantsMindMap) {
        return { title: `Mind map: ${topic}`, details: ['Central topic', `${assets.mindMap.branches.length} branches`, 'Revision checkpoints'] };
    }
    if (intent.wantsInfographic) {
        return { title: `Infographic: ${topic}`, details: ['Key stats', '4-step flow', 'Visual cheat sheet'] };
    }
    if (intent.wantsSummary) {
        return { title: `Report: ${topic}`, details: [`${assets.report.sections.length} sections`, 'Structured summary', 'Exam-ready'] };
    }
    if (intent.isTakeTest || intent.wantsQuiz) {
        return { title: `Test: ${topic}`, details: [`${assets.quiz.length} questions`, 'Multiple choice', 'Instant feedback'] };
    }
    if (intent.wantsDataTable) {
        return { title: `Data table: ${topic}`, details: [`${assets.dataTable.rows.length} rows`, 'Comparison view', 'Quick scan'] };
    }
    if (intent.wantsVideo) {
        return { title: `Video overview: ${topic}`, details: ['Scene outline', 'Key visuals', '5-minute recap'] };
    }
    return { title: `Study notes: ${topic}`, details: ['Main idea', 'Supporting points', 'Exam hint'] };
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
    const selectedSources = normalizeSources(body);
    const sourceTitles = selectedSources.map((source) => source.title);
    const sourceLine = sourceTitles.length > 0
        ? `I used ${sourceTitles.join(', ')} to shape this answer.`
        : 'I focused on your course context and the question you asked.';
    const intent = detectIntent(body, message, studio);
    const lowerMessage = message.toLowerCase();

    let reply = `Here is a study-focused answer for ${studentName}'s ${course} work on **${topic}**. ${sourceLine}`;

    if (intent.isTakeTest || intent.wantsQuiz) {
        reply = `I've prepared a ${questionCount}-question test on **${topic}** for ${studentName}. Answer each question first, then check the solutions. Good luck!`;
    } else if (intent.wantsFlashcards) {
        reply = `Here are flashcards for **${topic}** in ${course}. Flip through them in three rounds for best retention.`;
    } else if (intent.wantsSummary) {
        reply = `Here is a structured study report for **${topic}** in ${course}. Use it as a one-page revision guide.`;
    } else if (intent.wantsMindMap) {
        reply = `I've mapped **${topic}** into connected branches so you can see the bigger picture in ${course}.`;
    } else if (intent.wantsSlides) {
        reply = `Here's a slide deck outline for **${topic}** — ${buildSlides(topic, course).length} slides ready for revision or presentation.`;
    } else if (intent.wantsInfographic) {
        reply = `Here's a visual cheat sheet for **${topic}** — key stats, steps, and a quick revision tip.`;
    } else if (intent.wantsAudio) {
        reply = `This topic can be narrated as a short audio recap on **${topic}** for ${studentName}. Read each section aloud for practice.`;
    } else if (intent.wantsVideo) {
        reply = `Here's a video lesson outline for **${topic}** — use it to structure a 5-minute revision clip.`;
    } else if (intent.wantsDataTable) {
        reply = `I've organized **${topic}** into a comparison table so you can scan and revise faster.`;
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('teach') || lowerMessage.includes('learn')) {
        reply = `Let me teach **${topic}** step by step. I'll break it into simple parts you can understand and remember. ${sourceLine}`;
    }

    const studySteps = [
        `Start with the core idea: ${topic}.`,
        batch ? `Connect it to your ${batch} class flow.` : 'Link it to your current module.',
        sourceTitles.length > 0 ? `Review: ${sourceTitles[0]}.` : 'Use one practice question to test recall.',
        intent.wantsQuiz || intent.isTakeTest ? 'Answer test questions without looking, then verify.' : 'Summarise the answer in one sentence.',
    ];

    const followUps = intent.isTakeTest
        ? ['Show me the answers', 'Give me harder questions', 'Explain question 1']
        : intent.wantsQuiz
            ? ['Give me harder quiz questions', 'Explain the answers one by one', 'Turn this into flashcards']
            : intent.wantsFlashcards
                ? ['Quiz me on these cards', 'Make the cards shorter', 'Add examples to each card']
                : intent.wantsMindMap
                    ? ['Expand the central branch', 'Add a revision example', 'Turn this into a one-page summary']
                    : intent.wantsSlides
                        ? ['Add speaker notes', 'Make it shorter', 'Turn into flashcards']
                        : ['Make this simpler', 'Give me examples', 'Take a test on this topic'];

    const quiz = buildQuizQuestions(topic, course, intent.isTakeTest ? questionCount : 3);
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

    return {
        studentName,
        course,
        batch,
        studio,
        topic,
        questionCount: intent.isTakeTest ? questionCount : quiz.length,
        reply,
        keyPoints: [
            `Focus on ${topic}.`,
            sourceTitles.length > 0 ? `Anchor source: ${sourceTitles[0]}.` : 'Revise in small chunks.',
            intent.isTakeTest ? 'Answer without looking first.' : 'Explain the concept aloud after reading.',
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
        audioScript: intent.wantsAudio ? [`Welcome to your audio recap on ${topic}.`, `In ${course}, this topic connects theory to practice.`, 'Revise with one example and one self-check question.'] : null,
        videoOutline: intent.wantsVideo ? [{ scene: 'Intro', notes: `Hook the viewer with why ${topic} matters.` }, { scene: 'Core idea', notes: 'Explain the main concept simply.' }, { scene: 'Example', notes: 'Walk through one worked example.' }] : null,
        studioPreview: buildStudioPreview(intent, topic, { quiz, flashcards, mindMap, slides, report, dataTable }),
        sourcesUsed: selectedSources,
        modeLabel: intent.isTakeTest ? 'Practice Test' : titleCase(studio),
        teachingMode: intent.teachingMode,
    };
}

function mergeStructuredAssets(base, generated) {
    if (!generated || typeof generated !== 'object') return base;

    return {
        ...base,
        topic: cleanText(generated.topic) || base.topic,
        keyPoints: Array.isArray(generated.keyPoints) && generated.keyPoints.length ? generated.keyPoints.slice(0, 5) : base.keyPoints,
        studySteps: Array.isArray(generated.studySteps) && generated.studySteps.length ? generated.studySteps.slice(0, 6) : base.studySteps,
        followUps: Array.isArray(generated.followUps) && generated.followUps.length ? generated.followUps.slice(0, 5) : base.followUps,
        quiz: Array.isArray(generated.quiz) && generated.quiz.length ? generated.quiz.slice(0, 10) : base.quiz,
        flashcards: Array.isArray(generated.flashcards) && generated.flashcards.length ? generated.flashcards.slice(0, 12) : base.flashcards,
        mindMap: generated.mindMap?.central ? generated.mindMap : base.mindMap,
        slides: Array.isArray(generated.slides) && generated.slides.length ? generated.slides.slice(0, 10) : base.slides,
        report: generated.report?.sections?.length ? generated.report : base.report,
        infographic: generated.infographic?.title ? generated.infographic : base.infographic,
        dataTable: generated.dataTable?.headers?.length ? generated.dataTable : base.dataTable,
        audioScript: Array.isArray(generated.audioScript) && generated.audioScript.length ? generated.audioScript : base.audioScript,
        videoOutline: Array.isArray(generated.videoOutline) && generated.videoOutline.length ? generated.videoOutline : base.videoOutline,
    };
}

function buildGeminiPrompt(body, base, intent) {
    const sourceContext = buildSourceContext(base.sourcesUsed);
    const count = base.questionCount;

    return `You are an expert study assistant for ${base.studentName} studying ${base.course}.
Create structured study assets as JSON only.

Student request: ${body.message}
Topic: ${base.topic}
Studio mode: ${base.studio}
Batch: ${base.batch || 'not specified'}
Question count: ${count}

Sources:
${sourceContext}

Return JSON with this exact shape:
{
  "topic": "string",
  "keyPoints": ["string"],
  "studySteps": ["string"],
  "followUps": ["string"],
  "quiz": [{ "question": "string", "answer": "string", "options": ["string","string","string","string"] }],
  "flashcards": [{ "front": "string", "back": "string" }],
  "mindMap": { "central": "string", "branches": [{ "label": "string", "children": ["string"] }] },
  "slides": [{ "title": "string", "bullets": ["string"] }],
  "report": { "title": "string", "sections": [{ "heading": "string", "content": "string" }] },
  "infographic": { "title": "string", "highlights": [{ "label": "string", "value": "string" }], "steps": ["string"], "tip": "string" },
  "dataTable": { "headers": ["string"], "rows": [["string"]] },
  "audioScript": ["string"],
  "videoOutline": [{ "scene": "string", "notes": "string" }]
}

Rules:
- Ground answers in the provided sources when available.
- Keep content exam-focused and student-friendly.
- Include ${count} quiz items when quiz/test mode is active.
- Include at least 5 flashcards when flashcard mode is active.
- Include at least 4 slides when slide mode is active.
- Include at least 3 report sections when report mode is active.
- Include audioScript lines when audio mode is active.
- Include videoOutline scenes when video mode is active.
- Do not include markdown fences or commentary outside JSON.`;
}

function buildGrokSystemPrompt(base) {
    return `You are a patient AI study tutor helping ${base.studentName} with ${base.course}.
Explain clearly, stay accurate, and keep answers concise but useful for revision.
Use markdown lightly when helpful. Never invent citations beyond provided sources.`;
}

function buildGrokUserPrompt(body, base, structured) {
    const sourceContext = buildSourceContext(base.sourcesUsed);
    const structuredHint = structured
        ? `\nStructured assets already prepared:\n- Key points: ${structured.keyPoints?.join('; ') || 'n/a'}\n- Study steps: ${structured.studySteps?.join('; ') || 'n/a'}`
        : '';

    return `Student message: ${body.message}
Topic: ${base.topic}
Mode: ${base.modeLabel}
Teaching mode: ${base.teachingMode ? 'yes' : 'no'}

Sources:
${sourceContext}
${structuredHint}

Write the main assistant reply for the chat panel. If studio assets were generated, briefly introduce them and tell the student how to use them.`;
}

async function generateStructuredAssets(body, base, intent) {
    if (!gemini.isConfigured()) return base;

    const needsStructured = intent.wantsQuiz
        || intent.wantsFlashcards
        || intent.wantsSummary
        || intent.wantsMindMap
        || intent.wantsSlides
        || intent.wantsInfographic
        || intent.wantsDataTable
        || intent.wantsAudio
        || intent.wantsVideo
        || base.sourcesUsed.length > 0;

    if (!needsStructured) return base;

    try {
        const result = await gemini.generateContent(buildGeminiPrompt(body, base, intent), { json: true });
        return mergeStructuredAssets(base, result.json);
    } catch (error) {
        console.warn('[study-assistant] Gemini structured generation failed:', error.message);
        return base;
    }
}

async function generateChatReply(body, base, structured) {
    if (!grok.isConfigured()) return base.reply;

    try {
        const result = await grok.chat([
            { role: 'system', content: buildGrokSystemPrompt(base) },
            { role: 'user', content: buildGrokUserPrompt(body, structured || base, structured) },
        ]);
        return result.content;
    } catch (error) {
        console.warn('[study-assistant] Grok chat failed:', error.message);

        if (gemini.isConfigured()) {
            try {
                const fallback = await gemini.generateContent(buildGrokUserPrompt(body, structured || base, structured));
                return fallback.content;
            } catch (geminiError) {
                console.warn('[study-assistant] Gemini chat fallback failed:', geminiError.message);
            }
        }

        return base.reply;
    }
}

async function processStudyRequest(body) {
    const fallback = buildStudyResponse(body);
    const intent = detectIntent(body, cleanText(body.message), cleanText(body.studio) || 'chat');
    const hasAi = grok.isConfigured() || gemini.isConfigured();

    if (!hasAi) {
        return {
            demo: true,
            providers: { grok: false, gemini: false },
            ...fallback,
        };
    }

    const structuredBase = await generateStructuredAssets(body, fallback, intent);
    const reply = await generateChatReply(body, structuredBase, structuredBase);
    const studioPreview = buildStudioPreview(intent, structuredBase.topic, structuredBase);

    return {
        demo: false,
        providers: {
            groq: grok.getChatConfig()?.provider === 'groq',
            grok: grok.getChatConfig()?.provider === 'grok',
            gemini: gemini.isConfigured(),
            chatModel: grok.getChatConfig()?.model || gemini.GEMINI_MODEL,
            structuredModel: gemini.isConfigured() ? gemini.GEMINI_MODEL : grok.getChatConfig()?.model,
            chatProvider: grok.getChatConfig()?.provider || (gemini.isConfigured() ? 'gemini' : null),
        },
        ...structuredBase,
        reply,
        studioPreview,
    };
}

module.exports = {
    buildStudyResponse,
    processStudyRequest,
    normalizeSources,
};
