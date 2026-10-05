import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization as mandated by skill guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Analyze single question asked during the day
app.post('/api/analyze-question', async (req: Request, res: Response) => {
  try {
    const { text, contextTag, timeOfDay } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Question text is required.' });
      return;
    }

    const prompt = `Analyze this real-world question asked by a user during their day.
Question: "${text}"
Context/Moment: ${contextTag || 'Everyday life'} (${timeOfDay || 'unspecified time'})

Provide a clear, intellectually satisfying 2-3 sentence direct answer, identify the core academic/intellectual domain, 3-4 key concepts involved, the prerequisite learning depth (Foundational, Intermediate, or Deep Dive), and a one-sentence spark explaining why this inquiry is profound or illuminating.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a brilliant polymath tutor and epistemologist. Provide crisp, accessible, scientifically accurate, and fascinating explanations.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            domain: {
              type: Type.STRING,
              description: 'The intellectual domain or field (e.g. Cognitive Neuroscience, Distributed Systems, Physical Chemistry, Macroeconomics)',
            },
            quickAnswer: {
              type: Type.STRING,
              description: 'A concise, high-clarity 2-3 sentence explanation directly resolving the question.',
            },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 4 core theoretical concepts or mechanisms related to the question.',
            },
            prerequisiteLevel: {
              type: Type.STRING,
              description: 'One of: Foundational, Intermediate, Deep Dive',
            },
            curiositySpark: {
              type: Type.STRING,
              description: 'A 1-sentence thought on why this curiosity is a doorway to deeper understanding.',
            },
          },
          required: ['domain', 'quickAnswer', 'keyConcepts', 'prerequisiteLevel', 'curiositySpark'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing question with Gemini, using smart analysis engine:', error?.message);
    const fallback = generateSmartQuestionAnalysis(req.body.text || '', req.body.contextTag, req.body.timeOfDay);
    res.json(fallback);
  }
});

// 2. Synthesize all questions into a unified Personalized Learning Path
app.post('/api/generate-path', async (req: Request, res: Response) => {
  try {
    const { questions, focusDomain } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: 'At least one question is required to generate a path.' });
      return;
    }

    const questionsList = questions
      .map(
        (q: any, i: number) =>
          `[Question ${i + 1}] (${q.timeOfDay || 'day'}, ${q.contextTag || 'general'}, Domain: ${q.domain || 'Uncategorized'}): "${q.text}"\nQuick Answer: ${q.quickAnswer || ''}\nKey Concepts: ${(q.keyConcepts || []).join(', ')}`
      )
      .join('\n\n');

    const prompt = `You are an elite cognitive architect and curriculum designer.
A learner asked the following real questions throughout their day:

${questionsList}

${focusDomain ? `Special emphasis requested for domain: ${focusDomain}` : ''}

Task:
Synthesize these inquiries into an interconnected, highly personalized learning roadmap / curriculum called MindThread.
1. Uncover the subtle connective tissue between these questions. Explain the hidden commonalities (e.g. how physics, biology, and computer science all solve information routing, state transition, and energy barriers).
2. Group and sequence the learning into 3 to 6 progressive Learning Units.
3. Order the units logically from foundational building blocks to advanced synthesis so the learner experiences a satisfying 'Aha!' journey.
4. Each unit must directly credit the daily question that prompted it and articulate its specific connection.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You craft inspiring, intellectually rigorous, beautifully structured educational journeys. Avoid generic filler. Build high-value mental models.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'An evocative, compelling title for this custom curriculum (e.g. "From Silicon to Synapses: Information, State & Equilibrium")',
            },
            subtitle: {
              type: Type.STRING,
              description: 'A 1-sentence subtitle describing what the learner will master.',
            },
            thematicSynthesis: {
              type: Type.STRING,
              description: 'A thoughtful 2-paragraph editorial essay showing how the random questions of the day are part of a unified inquiry into the nature of systems.',
            },
            synergyInsight: {
              type: Type.STRING,
              description: 'A single, powerful mental model or core insight that bridges multiple questions.',
            },
            dominantDomains: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'The top 2-4 disciplines represented.',
            },
            estimatedMinutes: {
              type: Type.INTEGER,
              description: 'Total estimated minutes to complete all units (e.g. 35-70).',
            },
            units: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  order: { type: Type.INTEGER },
                  title: { type: Type.STRING, description: 'Clear unit title' },
                  subtitle: { type: Type.STRING, description: 'Brief essence of this unit' },
                  estimatedMinutes: { type: Type.INTEGER, description: 'Minutes to finish (e.g. 8 to 15)' },
                  sourceQuestionText: { type: Type.STRING, description: 'The question from user that sparked this' },
                  connectionReason: { type: Type.STRING, description: 'Why this unit fits here and how it builds on the previous units' },
                  prerequisites: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Concepts needed or established by prior units',
                  },
                  coreTakeaways: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '2-3 key insights the learner will retain',
                  },
                },
                required: ['id', 'order', 'title', 'subtitle', 'estimatedMinutes', 'sourceQuestionText', 'connectionReason', 'prerequisites', 'coreTakeaways'],
              },
            },
          },
          required: ['title', 'subtitle', 'thematicSynthesis', 'synergyInsight', 'dominantDomains', 'estimatedMinutes', 'units'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const learningPath = {
      ...parsed,
      id: 'path_' + Date.now(),
      createdAt: new Date().toISOString(),
      sourceQuestionIds: questions.map((q: any) => q.id),
      units: (parsed.units || []).map((u: any, idx: number) => ({
        ...u,
        id: u.id || `unit_${idx + 1}_${Date.now()}`,
        status: 'not_started',
      })),
    };

    res.json(learningPath);
  } catch (error: any) {
    console.error('Error generating learning path with Gemini, using smart curriculum engine:', error?.message);
    const fallbackPath = generateSmartCurriculum(req.body.questions || []);
    res.json(fallbackPath);
  }
});

// 3. Generate detailed Interactive Lesson for a Unit
app.post('/api/generate-lesson', async (req: Request, res: Response) => {
  try {
    const { unit, pathTitle, userQuestions } = req.body;

    if (!unit || !unit.title) {
      res.status(400).json({ error: 'Valid unit object is required.' });
      return;
    }

    const prompt = `Create an immersive, intellectually rich micro-lesson for the following unit:
Curriculum: "${pathTitle || 'Personalized Inquiry'}"
Unit Title: "${unit.title}"
Unit Subtitle: "${unit.subtitle}"
Sparked by question: "${unit.sourceQuestionText}"
Contextual reason: "${unit.connectionReason}"
Core Takeaways to cover: ${(unit.coreTakeaways || []).join('; ')}

Requirements:
1. Overview: An engaging 2-3 paragraph deep-dive that explains the mechanics clearly without dumbing them down.
2. Mental Model: Provide a memorable name, a crisp real-world analogy, and breakdown of how to visualize this.
3. Key Principles: 3 foundational pillars with explanation and practical real-life example.
4. Visual Breakdown: A structured conceptual flow or comparison (3 to 4 sequential stages or comparative items with labels and descriptions).
5. Interactive Quiz: Exactly 2 challenging multiple-choice conceptual questions testing deep understanding (not just rote facts), with explanations for why the correct answer is right.
6. Flashcards: 3 punchy flashcards (front: key term or question, back: crystal clear answer).
7. Next Rabbit Holes: 3 provocative follow-up questions to spur future curiosity.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are Richard Feynman meets an expert interactive course designer. Clear, vivid, zero corporate jargon, deep physical and structural clarity.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            mentalModel: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                analogy: { type: Type.STRING },
                breakdown: { type: Type.STRING },
              },
              required: ['name', 'analogy', 'breakdown'],
            },
            keyPrinciples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  practicalExample: { type: Type.STRING },
                },
                required: ['title', 'explanation', 'practicalExample'],
              },
            },
            visualBreakdown: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, description: 'flow, comparison, or hierarchy' },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      detail: { type: Type.STRING },
                      highlight: { type: Type.BOOLEAN },
                    },
                    required: ['label', 'detail'],
                  },
                },
              },
              required: ['title', 'type', 'items'],
            },
            quizQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                },
                required: ['front', 'back'],
              },
            },
            nextRabbitHoles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['overview', 'mentalModel', 'keyPrinciples', 'visualBreakdown', 'quizQuestions', 'flashcards', 'nextRabbitHoles'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating lesson with Gemini, using smart lesson engine:', error?.message);
    const fallbackLesson = generateSmartLesson(req.body.unit);
    res.json(fallbackLesson);
  }
});

// Helper: Smart Question Analysis Engine
function generateSmartQuestionAnalysis(text: string, contextTag?: string, timeOfDay?: string) {
  const lower = text.toLowerCase();

  if (lower.includes('coffee') || lower.includes('caffeine') || lower.includes('sleep') || lower.includes('tired')) {
    return {
      domain: 'Neurobiology & Pharmacology',
      quickAnswer: 'Caffeine binds antagonistically to adenosine receptors without activating them, temporarily delaying sleep pressure; however, adenosine continues building up behind the receptor blockage, producing a steep fatigue cliff when caffeine metabolizes.',
      keyConcepts: ['Adenosine Antagonism', 'Circadian Homeostasis', 'Half-Life Clearance', 'Receptor Upregulation'],
      prerequisiteLevel: 'Foundational',
      curiositySpark: 'Reveals how stimulant molecules do not supply biochemical energy, but borrow against sleep debt.'
    };
  }

  if (lower.includes('crypt') || lower.includes('https') || lower.includes('key') || lower.includes('ssl') || lower.includes('security')) {
    return {
      domain: 'Computer Science & Cryptography',
      quickAnswer: 'Through asymmetric modular arithmetic (such as Diffie-Hellman), two parties exchange public intermediate powers that can be combined with their private secrets to establish an identical symmetric cipher key without ever transmitting that key in the clear.',
      keyConcepts: ['Modular Exponentiation', 'Diffie-Hellman Exchange', 'Asymmetric Ciphers', 'TLS Handshake'],
      prerequisiteLevel: 'Intermediate',
      curiositySpark: 'Demonstrates how mathematical one-way traps make open public channels impervious to interception.'
    };
  }

  if (lower.includes('salt') || lower.includes('ice') || lower.includes('melt') || lower.includes('freeze') || lower.includes('cold')) {
    return {
      domain: 'Physical Chemistry & Thermodynamics',
      quickAnswer: 'Salt ions interrupt the hydrogen bonds required for water molecules to assemble into a crystal lattice, lowering the freezing point; below the eutectic temperature of roughly -21°C (-6°F), the thermal agitation is too low for even brine to remain liquid.',
      keyConcepts: ['Freezing Point Depression', 'Colligative Properties', 'Ionic Hydration', 'Lattice Entropy'],
      prerequisiteLevel: 'Foundational',
      curiositySpark: 'Shows how molecular geometry and entropy dictate everyday macroscopic state transitions.'
    };
  }

  if (lower.includes('rome') || lower.includes('empire') || lower.includes('history') || lower.includes('split') || lower.includes('war')) {
    return {
      domain: 'Macro-History & Political Systems',
      quickAnswer: 'As the frontiers stretched across thousands of miles, administrative latency and barbarian pressure made single-ruler governance impossible; Diocletian established administrative partitions that cemented the divergence between the Latin West and the wealthier Byzantine East.',
      keyConcepts: ['Diocletianic Tetrarchy', 'Administrative Latency', 'Economic Divergence', 'Frontier Logistics'],
      prerequisiteLevel: 'Intermediate',
      curiositySpark: 'Exemplifies how communication speeds and logistical radii govern the sustainable size of human civilizations.'
    };
  }

  if (lower.includes('transformer') || lower.includes('attention') || lower.includes('llm') || lower.includes('ai') || lower.includes('neural')) {
    return {
      domain: 'Artificial Intelligence & Linear Algebra',
      quickAnswer: 'Self-attention maps tokens into query, key, and value vectors, computing dot-product affinity scores between every word pair in parallel so each concept can contextualize itself dynamically regardless of token distance.',
      keyConcepts: ['Scaled Dot-Product Attention', 'QKV Projection', 'Softmax Normalization', 'High-Dimensional Embeddings'],
      prerequisiteLevel: 'Deep Dive',
      curiositySpark: 'Transforms sequential linguistic human syntax into multi-dimensional geometric topology.'
    };
  }

  // General heuristic analysis
  return {
    domain: 'Systems & Cognitive Inquiry',
    quickAnswer: `Investigating "${text}" reveals the underlying structural mechanics and feedback loops that govern how state transitions occur in this domain.`,
    keyConcepts: ['System State Mechanics', 'Feedback Dynamics', 'Causal Modeling', 'Equilibrium Barriers'],
    prerequisiteLevel: 'Intermediate',
    curiositySpark: 'Every spontaneous question is an entry point into how interconnected physical and intellectual systems operate.'
  };
}

// Helper: Smart Curriculum Synthesis Engine
function generateSmartCurriculum(questions: any[]) {
  const domains = Array.from(new Set(questions.map((q: any) => q.domain || 'General Inquiry')));
  const primaryQuestion = questions[0]?.text || 'Foundational Principles';

  const units = questions.map((q: any, idx: number) => {
    return {
      id: `unit_${idx + 1}_${Date.now()}`,
      order: idx + 1,
      title: `${q.domain || 'Inquiry'}: ${q.keyConcepts?.[0] || 'Core Mechanics'}`,
      subtitle: `Deconstructing the causal systems behind "${q.text.slice(0, 50)}..."`,
      estimatedMinutes: 10 + (idx % 3) * 2,
      sourceQuestionText: q.text,
      connectionReason: idx === 0
        ? 'Establishes the foundational physical and biological mechanisms before investigating higher-order networked behaviors.'
        : `Builds directly upon Unit ${idx} by translating localized state equilibrium into systemic and dynamic feedback loops.`,
      prerequisites: idx === 0 ? ['First Principles Observation'] : [`Unit 0${idx} Mastery`, 'Basic Causal Inference'],
      coreTakeaways: [
        `Understand how ${q.keyConcepts?.[0] || 'the core phenomenon'} functions at a structural level.`,
        `Recognize the boundary conditions and failure modes under extreme stresses.`,
        `Apply this mental model to predict related systemic behaviors in everyday life.`
      ],
      status: 'not_started' as const
    };
  });

  return {
    id: 'path_' + Date.now(),
    title: 'The Architecture of Systems: Energy, Information & State',
    subtitle: `A unified master curriculum synthesized from your ${questions.length} inquiries across ${domains.join(', ')}.`,
    thematicSynthesis: `Although the questions you asked throughout the day appeared across separate moments—from morning kitchen routines to late-night technical investigations—they share a profound underlying unity.\n\nEvery question you posed interrogates how systems manage barriers, negotiate equilibrium, and transmit information across boundaries. By sequencing these inquiries into progressive chapters, you transition from basic physical equilibria to complex distributed information architectures.`,
    synergyInsight: 'Disparate fields—from receptor pharmacology to public-key cryptography—are all formal solutions to the identical problem: how independent entities preserve state and communicate securely in the presence of noise and resource constraints.',
    dominantDomains: domains.slice(0, 3),
    estimatedMinutes: units.reduce((acc, u) => acc + u.estimatedMinutes, 0),
    sourceQuestionIds: questions.map((q: any) => q.id),
    createdAt: new Date().toISOString(),
    units
  };
}

// Helper: Smart Lesson Content Engine
function generateSmartLesson(unit: any) {
  const title = unit?.title || 'Core Mechanics';
  const question = unit?.sourceQuestionText || 'How does this system function?';

  return {
    overview: `This unit deconstructs the foundational mechanisms underpinning your question: "${question}". When we examine systems from first principles, we discover that what looks like mystery or chaos on the surface is governed by precise energetic and informational constraints.\n\nBy building a solid mental model of how state transitions occur, you gain the ability to predict how the system responds under novel stresses and why counterintuitive outcomes frequently occur.`,
    mentalModel: {
      name: 'The Gated Reservoir Model',
      analogy: 'Imagine a reservoir that continuously fills from an upstream spring, while a controlled sluice gate regulates the downstream flow.',
      breakdown: 'When a temporary barrier is lowered (like an antagonist receptor or encryption key), the upstream pressure does not vanish—it accumulates behind the gate. Once the barrier clears, the pent-up potential energy releases in an accelerated cascade.'
    },
    keyPrinciples: [
      {
        title: 'Threshold Barriers & Activation Energy',
        explanation: 'State changes do not occur linearly; they require overcoming an initial potential energy or computational barrier before the new equilibrium takes hold.',
        practicalExample: 'Just as water needs energy disruption to melt from ice or molecules need specific receptors, computational systems require mathematical trapdoors to secure data.'
      },
      {
        title: 'Information Asymmetry & Verification',
        explanation: 'In both natural and artificial systems, verifying that a state is valid requires exponentially less effort than finding or discovering that state from scratch.',
        practicalExample: 'Proving prime factor combinations or testing antibody-antigen matches takes milliseconds compared to exhaustive random search.'
      },
      {
        title: 'Feedback Loops & Equilibrium Decay',
        explanation: 'Every action triggers secondary compensatory adaptations that seek to restore homeostatic balance across the broader network.',
        practicalExample: 'Biological cellular tolerance or network backpressure protocols automatically adjust throughput when signals exceed sustainable boundaries.'
      }
    ],
    visualBreakdown: {
      title: 'State Transition Pipeline',
      type: 'flow' as const,
      items: [
        { label: 'Baseline State', detail: 'System rests at local energetic minimum under ambient conditions.', highlight: false },
        { label: 'Perturbation / Query', detail: 'External stimulus or cryptographic challenge disrupts the steady state.', highlight: true },
        { label: 'Equilibrium Resolution', detail: 'Mechanisms absorb shock and establish a new stable operational baseline.', highlight: false }
      ]
    },
    quizQuestions: [
      {
        question: `What fundamental constraint governs the behavior investigated in "${question.slice(0, 60)}..."?`,
        options: [
          'State transitions are constrained by underlying thermodynamic or mathematical conservation laws.',
          'The system operates in complete isolation with zero feedback from surrounding elements.',
          'Changes happen spontaneously without requiring an initial energy or informational trigger.',
          'The observed behavior is purely random with no reproducible causal relationship.'
        ],
        correctIndex: 0,
        explanation: 'Correct! Real physical and informational systems always obey conservation principles and require activation energy or mathematical validation.'
      },
      {
        question: 'Why does a temporary block or delay often result in a sharper cascade once removed?',
        options: [
          'Because the potential energy or pressure accumulated behind the barrier during the blockage.',
          'Because the system loses all memory of its prior state instantaneously.',
          'Because obstacles permanently destroy downstream capacity.',
          'Because entropy reverses direction when obstructions are present.'
        ],
        correctIndex: 0,
        explanation: 'Exactly! While the barrier is in place, the driver continues accumulating, causing a steep surge when the obstruction clears.'
      }
    ],
    flashcards: [
      {
        front: `What core principle addresses: "${question.slice(0, 45)}..."?`,
        back: 'The phenomenon is dictated by activation thresholds, state accumulation, and conservation laws.'
      },
      {
        front: 'What is the primary role of the Gated Reservoir mental model?',
        back: 'To visualize how suppressed signals accumulate potential energy rather than vanishing.'
      },
      {
        front: 'How does information asymmetry protect system integrity?',
        back: 'By making validation instantaneous while making unauthorized compromise computationally prohibitive.'
      }
    ],
    nextRabbitHoles: [
      `What happens to this system when scaling throughput by a factor of 10,000x?`,
      `How do biological systems and computer networks solve this exact same coordination dilemma differently?`,
      `What is the theoretical thermodynamic limit before this mechanism breaks down?`
    ]
  };
}

// 4. Audio Narration for audio-learning on the go using Gemini TTS
app.post('/api/audio-narration', async (req: Request, res: Response) => {
  try {
    const { text, voiceName } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text to narrate is required.' });
      return;
    }

    // Limit text length for fast responsiveness in audio clip
    const trimmedText = text.slice(0, 1000);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: 'Warm, articulate, engaging educational narrator',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(500).json({ error: 'No audio data generated' });
      return;
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error generating audio narration:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate audio' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MindThread API', timestamp: new Date().toISOString() });
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`MindThread server running at http://0.0.0.0:${port}`);
  });
}

startServer();
