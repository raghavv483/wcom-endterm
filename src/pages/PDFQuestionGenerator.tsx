import { useState } from "react";
import { useUser } from "@clerk/react";
import { useGroqApiKey } from "@/hooks/use-groq-api-key";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, Loader, Download, Copy, CheckCircle } from "lucide-react";import * as pdfjsLib from "pdfjs-dist";
interface QuestionConfig {
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  assessmentType: 'quiz' | 'midterm' | 'endterm';
  marks: number;
}

interface GeneratedQuestion {
  id: number;
  question: string;
  type: string;
  options?: string[];
  correctAnswer?: number;
  expectedAnswer?: string;
  keyPoints?: string[];
  explanation: string;
  marks: number;
  difficulty: string;
  topic: string;
  bloomLevel?: string;
}

interface GeneratedQuestions {
  metadata: {
    totalQuestions: number;
    difficultyLevel: string;
    assessmentType: string;
    marksPerQuestion: number;
    totalMarks: number;
  };
  questions: GeneratedQuestion[];
}

export default function PDFQuestionGenerator() {
  const { user } = useUser();
  const apiKey = useGroqApiKey();
  const [files, setFiles] = useState<File[]>([]);
  const [pdfContent, setPdfContent] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestions | null>(null);
  const [copied, setCopied] = useState(false);

  const [config, setConfig] = useState<QuestionConfig>({
    numQuestions: 10,
    difficulty: 'medium',
    assessmentType: 'midterm',
    marks: 2,
  });

  // Configure PDF.js worker using local copy
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  // Handle file extraction - PDF and TXT (multiple files)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);
    
    // Validate all files
    for (const file of fileArray) {
      const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isTXT = file.type.includes('text') || file.name.endsWith('.txt');
      
      if (!isPDF && !isTXT) {
        toast.error(`Invalid file: ${file.name}. Please upload PDF or TXT files only.`);
        return;
      }
    }

    setFiles(fileArray);

    try {
      let combinedText = '';

      // Extract text from all files
      for (const file of fileArray) {
        const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
        
        let extractedText = '';

        if (isPDF) {
          console.log(`Extracting text from PDF: ${file.name}`);
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const maxPages = Math.min(pdf.numPages, 50);

          for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            try {
              const page = await pdf.getPage(pageNum);
              const textContent = await page.getTextContent();
              extractedText += textContent.items
                .map((item: any) => item.str || '')
                .join(' ') + '\n';
            } catch (pageError) {
              console.warn(`Error on page ${pageNum}:`, pageError);
            }
          }
        } else {
          extractedText = await file.text();
        }

        // Add file separator with filename
        if (combinedText) {
          combinedText += '\n\n=== END OF ' + file.name.toUpperCase() + ' ===\n\n';
        }
        combinedText += `[File: ${file.name}]\n${extractedText}`;
      }

      if (!combinedText.trim()) {
        toast.error('All files are empty. Please add content to the files.');
        return;
      }

      setPdfContent(combinedText);
      const sizeKB = Math.ceil(combinedText.length / 1024);
      toast.success(`✅ Loaded ${fileArray.length} file(s): ${sizeKB}KB total`);
    } catch (error) {
      console.error('Error processing files:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`File error: ${errorMsg}`);
    }
  };

  const generateQuestions = async () => {
    if (!pdfContent.trim()) {
      toast.error('Please upload a PDF or text file first');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setLoading(true);

    try {
      const GROQ_URL = import.meta.env.VITE_GROQ_API_URL;

      if (!GROQ_URL) {
        throw new Error('GROQ API URL not configured. Please check environment variables.');
      }

      if (!apiKey) {
        throw new Error('API key not set. Please add your GROQ API key in settings.');
      }

      const totalMarks = config.numQuestions * config.marks;

      const jsonExample = {
        metadata: {
          totalQuestions: config.numQuestions,
          difficultyLevel: config.difficulty,
          assessmentType: config.assessmentType,
          marksPerQuestion: config.marks,
          totalMarks: totalMarks
        },
        questions: [
          {
            id: 1,
            question: "Sample question text",
            type: "multiple-choice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "Explanation for why this is correct",
            marks: config.marks,
            difficulty: config.difficulty,
            topic: "Topic name",
            bloomLevel: "Understand"
          }
        ]
      };

      // Create a better prompt with content from different sections
      const docLength = pdfContent.length;
      const thirdLength = Math.floor(docLength / 3);
      const contentSamples = [
        pdfContent.substring(0, 500),  // Beginning
        pdfContent.substring(thirdLength, thirdLength + 500),  // Middle
        pdfContent.substring(docLength - 500, docLength)  // End
      ].join('\n\n---\n\n');

      // Determine question format based on assessment type
      const isQuiz = config.assessmentType === 'quiz';
      const isMidterm = config.assessmentType === 'midterm';
      const isEndterm = config.assessmentType === 'endterm';

      let questionFormatInstructions = '';
      let jsonFormatExample = '';

      if (isQuiz) {
        questionFormatInstructions = `QUESTION FORMAT: Multiple Choice Questions (MCQ)
- Each question should have 4 options (A, B, C, D)
- Only ONE correct answer
- Include plausible but incorrect options (distractors)
- Focus on testing understanding of concepts`;

        jsonFormatExample = `{
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct with reference to the text",
      "topic": "Specific topic from document",
      "difficulty": "${config.difficulty}"
    }
  ]
}`;
      } else if (isMidterm) {
        questionFormatInstructions = `QUESTION FORMAT: Short Answer / Theoretical Questions
- Questions should require short written answers (2-4 sentences)
- Test understanding and application of concepts
- Include expected answer key
- Questions should encourage explanations, not yes/no answers
- Focus on "Explain", "Describe", "How", "Why" type questions`;

        jsonFormatExample = `{
  "questions": [
    {
      "id": 1,
      "question": "Explain [concept] and its importance in the context of [topic]?",
      "type": "short-answer",
      "expectedAnswer": "Expected answer covering key points from the text",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "explanation": "Detailed explanation of what a complete answer should include",
      "topic": "Specific topic from document",
      "difficulty": "${config.difficulty}"
    }
  ]
}`;
      } else if (isEndterm) {
        questionFormatInstructions = `QUESTION FORMAT: Long Answer / Essay Questions
- Questions should require detailed written answers (5-10 sentences)
- Test analysis, synthesis, and deep understanding
- Include expected answer outline with key points
- Questions should encourage critical thinking and comprehensive responses
- Focus on "Evaluate", "Analyze", "Discuss", "Compare" type questions`;

        jsonFormatExample = `{
  "questions": [
    {
      "id": 1,
      "question": "Analyze [concept] and discuss its implications with examples from the document?",
      "type": "essay",
      "expectedAnswer": "Comprehensive answer outline covering major points",
      "keyPoints": ["Main point 1 with explanation", "Main point 2 with explanation", "Conclusion with synthesis"],
      "explanation": "Detailed rubric of what a complete answer should include and how it will be evaluated",
      "topic": "Specific topic from document",
      "difficulty": "${config.difficulty}"
    }
  ]
}`;
      }

      // Parse notes to detect scope constraints vs format constraints
      const hasScopeConstraints = notes.toLowerCase().includes('chapter') || 
                                   notes.toLowerCase().includes('section') ||
                                   notes.toLowerCase().includes('topic') ||
                                   notes.toLowerCase().includes('from');
      
      let scopeAgnosticContent = '';
      let formatConstraints = '';
      
      if (notes.trim()) {
        const notesLines = notes.split('\n').filter(line => line.trim());
        scopeAgnosticContent = notesLines
          .filter(line => /chapter|section|from|only/i.test(line))
          .join('\n');
        formatConstraints = notesLines
          .filter(line => /numeric|numerical|true\/false|filling|short answer|essay|paragraph|case study|mcq/i.test(line))
          .join('\n');
      }

      const scopeInstruction = scopeAgnosticContent.trim() ? `
⚠️ STRICT SCOPE CONSTRAINT - MUST FOLLOW:
${scopeAgnosticContent}
🔴 CRITICAL: Generate ALL questions ONLY from the topics/chapters specified above.
❌ DO NOT include questions from other chapters or topics.
❌ If sufficient questions cannot be created from only these topics, state this clearly.
✅ Questions MUST explicitly relate to and be sourced from the specified scope ONLY.` : '';

      const formatInstruction = formatConstraints.trim() ? `
📋 SPECIAL FORMAT REQUIREMENTS:
${formatConstraints}
Follow these requirements precisely for question structure and types.` : '';

      const prompt = `You are an expert educational assessment designer. Generate ${config.numQuestions} high-quality exam questions from this document content.

DOCUMENT SECTIONS:
${contentSamples}

ASSESSMENT REQUIREMENTS:
- Assessment Type: ${config.assessmentType.toUpperCase()}
- Difficulty Level: ${config.difficulty}
- Total Questions: ${config.numQuestions}
- Mark per question: ${config.marks}
${scopeInstruction}
${formatInstruction}

${questionFormatInstructions}

QUESTION GENERATION RULES - STRICTLY FOLLOW:
FORBIDDEN - DO NOT ASK THESE TYPES:
❌ Who is the author?
❌ What is the title of the book?
❌ What is the primary focus/objective?
❌ Meta-questions about the document itself
❌ General knowledge questions not in the text

REQUIRED - MUST INCLUDE:
✅ Concept-based questions testing understanding
✅ Definitions and explanations from the text
✅ Application of concepts to scenarios
✅ Problem-solving and analysis questions
✅ All questions must be from the specified scope (if provided)
${scopeAgnosticContent.trim() ? '✅ Questions ONLY from specified chapters/topics' : '✅ Questions from DIFFERENT CHAPTERS/SECTIONS - beginning, middle, and advanced topics'}

DIFFICULTY GUIDELINES:
- easy: Basic recall and understanding of concepts
- medium: Application and explanation of concepts
- difficult: Analysis, synthesis, and complex problem-solving

Create questions that test REAL knowledge from the document.

RESPOND WITH ONLY VALID JSON (no markdown, no extra text):
${jsonFormatExample}`;

      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an expert exam question designer with 20+ years of experience.
CRITICAL RULES:
1. Generate questions ONLY from the provided document content - DON'T use external knowledge
2. NEVER ask author/title/focus meta-questions ever
3. Focus on testing ACTUAL understanding of concepts from the text
${scopeAgnosticContent.trim() ? `4. 🔴 STRICT CONSTRAINT: Generate ALL questions ONLY from: ${scopeAgnosticContent.trim()}
   If the user specified "Chapter 4", EVERY question must be from Chapter 4 ONLY.
   Do NOT mix in questions from other chapters.` : '4. Draw questions from DIFFERENT SECTIONS of the document'}
5. ALWAYS respond with ONLY valid JSON object - no markdown, no text, no code blocks
6. Start immediately with { and end with }
7. Ensure all options are plausible but only one is correct based on the text
${scopeAgnosticContent.trim() ? '8. Verify each question is from the specified scope before including it' : ''}`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('GROQ API error response:', errorData);
        throw new Error(`GROQ API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '';

      if (!content) {
        throw new Error('Empty response from API');
      }

      console.log('Raw API response length:', content.length);
      console.log('Raw response (first 300 chars):', content.substring(0, 300));
      console.log('Raw response (last 100 chars):', content.substring(Math.max(0, content.length - 100)));

      // Clean JSON
      let cleanJson = content
        .replace(/^```[\w]*\n?/, '')
        .replace(/\n?```$/, '')
        .replace(/\\n/g, '\n')
        .replace(/\\\//g, '/')
        .trim();

      // Extract JSON object
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error(`No JSON object found in response. Response: ${content.substring(0, 200)}`);
      }

      if (lastBrace <= firstBrace) {
        throw new Error('Invalid JSON structure: closing brace before opening brace');
      }

      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);

      // Check if JSON looks incomplete
      if (cleanJson.length < 50) {
        throw new Error(`JSON response too short (${cleanJson.length} chars). Response might be truncated. Got: ${cleanJson.substring(0, 100)}`);
      }

      console.log('Cleaned JSON length:', cleanJson.length);
      console.log('Cleaned JSON (first 300 chars):', cleanJson.substring(0, 300));

      let parsed;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        // Show context around error
        const responseLines = cleanJson.split('\n');
        console.error('Failed JSON (first 1500 chars):', cleanJson.substring(0, 1500));
        throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Parse error'}. Check console for details.`);
      }

      // Transform response to match our expected format
      let questions = parsed.questions || parsed.exam_questions || [];
      
      // Ensure questions have all required fields based on their type
      questions = questions.map((q: any, idx: number) => {
        const baseQuestion = {
          id: q.id || idx + 1,
          question: q.question || 'Question text',
          explanation: q.explanation || 'No explanation provided',
          topic: q.topic || 'General Topic',
          difficulty: q.difficulty || config.difficulty,
          marks: config.marks,
          type: q.type || 'multiple-choice',
        };

        // Add type-specific fields
        if (q.type === 'multiple-choice') {
          return {
            ...baseQuestion,
            options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          };
        } else if (q.type === 'short-answer') {
          return {
            ...baseQuestion,
            expectedAnswer: q.expectedAnswer || 'See explanation for expected answer',
            keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints : [],
          };
        } else if (q.type === 'essay') {
          return {
            ...baseQuestion,
            expectedAnswer: q.expectedAnswer || 'See explanation for comprehensive answer outline',
            keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints : [],
          };
        }

        return baseQuestion;
      });

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error(`No questions found in response. Got: ${JSON.stringify(parsed).substring(0, 200)}`);
      }

      const finalResponse: GeneratedQuestions = {
        metadata: {
          totalQuestions: questions.length,
          difficultyLevel: config.difficulty,
          assessmentType: config.assessmentType,
          marksPerQuestion: config.marks,
          totalMarks: questions.length * config.marks
        },
        questions: questions
      };

      setGeneratedQuestions(finalResponse);
      toast.success(`Generated ${finalResponse.questions.length} concept-based questions!`);
    } catch (error) {
      console.error('Error generating questions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to generate questions: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedQuestions) {
      navigator.clipboard.writeText(JSON.stringify(generatedQuestions, null, 2));
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadJSON = () => {
    if (generatedQuestions) {
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(generatedQuestions, null, 2)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `questions_${config.assessmentType}_${new Date().getTime()}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">📚 AI Question Generator</h1>
            <p className="text-slate-400">Upload PDF or text file to generate customized exam questions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Config Panel */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 sticky top-6">
                <h2 className="text-xl font-bold text-white mb-6">Configuration</h2>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">Upload Files (PDF or TXT)</label>
                  <p className="text-xs text-slate-400 mb-3">Supported: .pdf, .txt files (multiple files allowed)</p>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition"
                    >
                      <Upload className="h-5 w-5 text-blue-400 mr-2" />
                      <span className="text-sm text-slate-300">
                        {files.length > 0 ? `${files.length} file(s) selected` : 'Choose PDF or TXT files'}
                      </span>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-3 bg-slate-900 p-3 rounded-lg border border-slate-700 max-h-32 overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-2">Uploaded files:</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {files.map((file, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            {file.name} ({Math.round(file.size / 1024)}KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Topics/Outcomes Notes */}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">Topics/Outcomes to Focus On (Optional)</label>
                  <p className="text-xs text-slate-400 mb-2">
                    <span className="font-semibold">Scope constraints</span> (Chapter, Section, From): AI will generate ONLY from these topics<br/>
                    <span className="font-semibold">Format constraints</span> (Numerical, True/False, case study): Specifies question types
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Examples:
- From Chapter 4 Link Analysis only
- Chapter 2 and Chapter 3 only
- 5 numerical questions
- 3 true/false, 2 case studies, 5 numerical

Write scope and format constraints together. Scope constraints (chapter/section/from) = questions ONLY from those topics."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 text-xs placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                    rows={4}
                  />
                </div>

                {/* Number of Questions */}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-3">
                    Number of Questions: {config.numQuestions}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={config.numQuestions}
                    onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-400 mt-1">5 - 100 questions</p>
                </div>

                {/* Difficulty */}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-3">Difficulty Level</label>
                  <div className="space-y-2">
                    {(['easy', 'medium', 'difficult'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setConfig({ ...config, difficulty: level })}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
                          config.difficulty === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assessment Type */}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-3">Assessment Type</label>
                  <div className="space-y-2">
                    {(['quiz', 'midterm', 'endterm'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setConfig({ ...config, assessmentType: type })}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
                          config.assessmentType === type
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Marks Per Question */}
                <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
                  <label className="block text-white font-semibold mb-3 text-sm">
                    Marks Per Question ({config.assessmentType})
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={config.marks}
                    onChange={(e) => setConfig({ ...config, marks: parseInt(e.target.value) || 1 })}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="Enter marks"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Total marks: {config.numQuestions * config.marks}
                  </p>
                </div>

                {/* API Key Warning */}
                {!apiKey && (
                  <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700 rounded-lg">
                    <p className="text-amber-200 text-sm font-semibold">⚠️ API Key Not Set</p>
                    <p className="text-amber-100 text-xs mt-1">
                      Please add your GROQ API key in the settings (top right corner) to generate questions.
                    </p>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={generateQuestions}
                  disabled={!pdfContent.trim() || loading || !apiKey}
                  className="w-full wave-gradient text-white font-semibold py-3"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : !apiKey ? (
                    '🔑 Set API Key First'
                  ) : (
                    '✨ Generate Questions'
                  )}
                </Button>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              {!generatedQuestions ? (
                <Card className="p-12 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-slate-700 flex items-center justify-center mb-6">
                    <Upload className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to Generate Questions</h3>
                  <p className="text-slate-400 mb-6">
                    Upload your PDF or text files and configure the options to get started
                  </p>
                  <div className="bg-slate-900 p-6 rounded-lg text-left">
                    <h4 className="text-white font-semibold mb-3">How to Use:</h4>
                    <ul className="text-slate-300 text-sm space-y-2">
                      <li>📄 Upload one or multiple PDF/TXT files</li>
                      <li>🎯 (Optional) Specify topics or outcomes to focus on</li>
                      <li>⚙️ Configure question settings (type, difficulty, marks)</li>
                      <li>✨ Generate concept-based questions</li>
                      <li>👓 Review questions by type (MCQ/Short/Essay)</li>
                      <li>📥 Export results as JSON</li>
                      <li>💾 Save or share with students</li>
                    </ul>
                  </div>
                </Card>
              ) : (
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="bg-slate-800 border border-slate-700">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="questions">Questions ({generatedQuestions.metadata.totalQuestions})</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview">
                    <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                            <p className="text-slate-400 text-sm">Total Questions</p>
                            <p className="text-3xl font-bold text-blue-400 mt-2">
                              {generatedQuestions.metadata.totalQuestions}
                            </p>
                          </div>
                          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                            <p className="text-slate-400 text-sm">Total Marks</p>
                            <p className="text-3xl font-bold text-green-400 mt-2">
                              {generatedQuestions.metadata.totalMarks}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-white font-semibold mb-2">Difficulty</p>
                            <Badge className="bg-purple-900 text-purple-200 text-base px-3 py-1">
                              {generatedQuestions.metadata.difficultyLevel}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-white font-semibold mb-2">Assessment Type</p>
                            <Badge className="bg-orange-900 text-orange-200 text-base px-3 py-1">
                              {generatedQuestions.metadata.assessmentType}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={copyToClipboard}
                            variant="outline"
                            className="w-full"
                          >
                            {copied ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy JSON
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={downloadJSON}
                            className="w-full wave-gradient"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Questions Tab */}
                  <TabsContent value="questions" className="space-y-4">
                    {generatedQuestions.questions.map((q, idx) => (
                      <Card key={q.id} className="p-6 bg-slate-800 border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white font-semibold text-lg">Question {idx + 1}</h3>
                            <p className="text-slate-400 text-sm mt-1">{q.topic}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-blue-900">{q.difficulty}</Badge>
                            <Badge className="bg-purple-900 capitalize">{q.type.replace('-', ' ')}</Badge>
                            <Badge className="bg-green-900">{q.marks} marks</Badge>
                          </div>
                        </div>

                        <p className="text-white mb-4 leading-relaxed text-base">{q.question}</p>

                        {q.type === 'multiple-choice' && q.options && (
                          <div className="mb-4 space-y-2">
                            {q.options.map((option, optIdx) => (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-lg border ${
                                  optIdx === q.correctAnswer
                                    ? 'bg-green-900 border-green-700'
                                    : 'bg-slate-900 border-slate-700'
                                }`}
                              >
                                <p className="text-sm">
                                  <span className="font-semibold text-slate-300">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>{' '}
                                  <span className="text-slate-200">{option}</span>
                                  {optIdx === q.correctAnswer && (
                                    <span className="ml-2 text-green-400">✓ Correct</span>
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'short-answer' && (
                          <div className="mb-4 space-y-3">
                            <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
                              <p className="text-slate-200 text-sm font-semibold mb-2">Expected Answer:</p>
                              <p className="text-slate-300 text-sm">{q.expectedAnswer}</p>
                            </div>
                            {q.keyPoints && q.keyPoints.length > 0 && (
                              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                <p className="text-slate-200 text-sm font-semibold mb-2">Key Points to Cover:</p>
                                <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
                                  {q.keyPoints.map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {q.type === 'essay' && (
                          <div className="mb-4 space-y-3">
                            <div className="bg-purple-900 p-4 rounded-lg border border-purple-700">
                              <p className="text-slate-200 text-sm font-semibold mb-2">Expected Answer Outline:</p>
                              <p className="text-slate-300 text-sm">{q.expectedAnswer}</p>
                            </div>
                            {q.keyPoints && q.keyPoints.length > 0 && (
                              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                <p className="text-slate-200 text-sm font-semibold mb-2">Evaluation Criteria:</p>
                                <ul className="text-slate-300 text-sm space-y-2">
                                  {q.keyPoints.map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-blue-400 mt-1">•</span>
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                          <p className="text-slate-400 text-sm font-semibold mb-1">
                            {q.type === 'multiple-choice' ? 'Explanation' : 'Reference & Notes'}
                          </p>
                          <p className="text-slate-300 text-sm">{q.explanation}</p>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
