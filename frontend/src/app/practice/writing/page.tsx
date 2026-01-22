'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface WritingPrompt {
  id: string
  task_type: string
  prompt_text: string
  topic: string
  word_limit_min: number
  word_limit_max: number
}

interface AssessmentResult {
  overall_band_score: number
  criteria_scores: {
    task_achievement?: number
    coherence_cohesion?: number
    lexical_resource?: number
    grammatical_range?: number
  }
  strengths: string[]
  weaknesses: string[]
  improvement_suggestions: string[]
}

export default function WritingPracticePage() {
  const router = useRouter()
  const [taskType, setTaskType] = useState<'task1' | 'task2'>('task2')
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null)
  const [essay, setEssay] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [router])

  useEffect(() => {
    const words = essay.trim().split(/\s+/).filter((w) => w.length > 0)
    setWordCount(words.length)
  }, [essay])

  const generatePrompt = async () => {
    setGenerating(true)
    setError('')
    setResult(null)
    setEssay('')

    try {
      const response = await apiClient.post('/api/lessons/generate/writing', {
        task_type: taskType,
        cefr_level: 'B2',
        topic: 'general',
      })
      setPrompt(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate prompt')
    } finally {
      setGenerating(false)
    }
  }

  const submitEssay = async () => {
    if (!prompt) return
    if (wordCount < 50) {
      setError('Please write at least 50 words')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await apiClient.post('/api/assessments/submit/writing', {
        lesson_id: prompt.id,
        submission_text: essay,
        prompt_text: prompt.prompt_text,
        task_type: taskType,
      })
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit essay')
    } finally {
      setSubmitting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600'
    if (score >= 5.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWordCountColor = () => {
    const min = taskType === 'task1' ? 150 : 250
    if (wordCount >= min) return 'text-green-600'
    if (wordCount >= min * 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Writing Practice</h1>
          <p className="mt-2 text-gray-600">Get AI-powered feedback on your IELTS writing</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Prompt & Editor */}
          <div className="space-y-6">
            {/* Task Type Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Task Type</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setTaskType('task1')
                    setPrompt(null)
                    setResult(null)
                    setEssay('')
                  }}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    taskType === 'task1'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold">Task 1</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Describe visual information (150+ words)
                  </p>
                </button>
                <button
                  onClick={() => {
                    setTaskType('task2')
                    setPrompt(null)
                    setResult(null)
                    setEssay('')
                  }}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    taskType === 'task2'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold">Task 2</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Essay writing (250+ words)
                  </p>
                </button>
              </div>
              <button
                onClick={generatePrompt}
                disabled={generating}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Generating...' : 'Generate New Prompt'}
              </button>
            </div>

            {/* Writing Prompt */}
            {prompt && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Writing Prompt</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {taskType === 'task1' ? 'Task 1' : 'Task 2'}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{prompt.prompt_text}</p>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    Word requirement: {taskType === 'task1' ? '150+' : '250+'} words
                  </p>
                </div>
              </div>
            )}

            {/* Essay Editor */}
            {prompt && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Your Essay</h2>
                  <span className={`font-medium ${getWordCountColor()}`}>
                    {wordCount} words
                  </span>
                </div>
                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  placeholder="Start writing your essay here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={submitting}
                />
                <button
                  onClick={submitEssay}
                  disabled={submitting || wordCount < 50}
                  className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Analyzing with AI...' : 'Submit for Assessment'}
                </button>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div>
            {result ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Assessment Results</h2>

                {/* Overall Score */}
                <div className="text-center mb-8">
                  <div className={`text-5xl font-bold ${getScoreColor(result.overall_band_score)}`}>
                    {result.overall_band_score.toFixed(1)}
                  </div>
                  <p className="text-gray-500 mt-2">Overall Band Score</p>
                </div>

                {/* Criteria Scores */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {result.criteria_scores.task_achievement !== undefined && (
                    <ScoreItem
                      label="Task Achievement"
                      score={result.criteria_scores.task_achievement}
                    />
                  )}
                  {result.criteria_scores.coherence_cohesion !== undefined && (
                    <ScoreItem
                      label="Coherence & Cohesion"
                      score={result.criteria_scores.coherence_cohesion}
                    />
                  )}
                  {result.criteria_scores.lexical_resource !== undefined && (
                    <ScoreItem
                      label="Lexical Resource"
                      score={result.criteria_scores.lexical_resource}
                    />
                  )}
                  {result.criteria_scores.grammatical_range !== undefined && (
                    <ScoreItem
                      label="Grammar Range"
                      score={result.criteria_scores.grammatical_range}
                    />
                  )}
                </div>

                {/* Strengths */}
                {result.strengths.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <span className="text-green-500 mr-2">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {result.weaknesses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-red-700 mb-2">Areas for Improvement</h3>
                    <ul className="space-y-2">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <span className="text-red-500 mr-2">•</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {result.improvement_suggestions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2">Suggestions</h3>
                    <ul className="space-y-2">
                      {result.improvement_suggestions.map((s, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <span className="text-blue-500 mr-2">→</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => {
                    setResult(null)
                    setEssay('')
                    generatePrompt()
                  }}
                  className="w-full mt-8 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50"
                >
                  Try Another Prompt
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">✍️</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to Practice?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Select a task type and generate a prompt to begin your writing practice.
                    Our AI will analyze your essay and provide detailed feedback.
                  </p>
                </div>

                <div className="mt-8 border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Tips for Success</h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">1.</span>
                      Read the prompt carefully and plan your response
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">2.</span>
                      Write a clear introduction, body paragraphs, and conclusion
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">3.</span>
                      Use varied vocabulary and complex sentence structures
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">4.</span>
                      Check your word count and proofread before submitting
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreItem({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 7) return 'text-green-600'
    if (s >= 5.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${getColor(score)}`}>{score.toFixed(1)}</p>
    </div>
  )
}
