'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface SpeakingPrompt {
  id: string
  part_number: number
  prompt_text: string
  follow_up_questions: string[]
  preparation_time_seconds: number
  speaking_time_seconds: number
}

interface AssessmentResult {
  overall_band_score: number
  criteria_scores: {
    fluency?: number
    lexical_resource?: number
    grammatical_range?: number
    pronunciation?: number
  }
  strengths: string[]
  weaknesses: string[]
  improvement_suggestions: string[]
}

export default function SpeakingPracticePage() {
  const router = useRouter()
  const [partNumber, setPartNumber] = useState<1 | 2 | 3>(2)
  const [prompt, setPrompt] = useState<SpeakingPrompt | null>(null)
  const [transcription, setTranscription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [error, setError] = useState('')

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Preparation timer
  const [prepTime, setPrepTime] = useState(0)
  const [isPreparing, setIsPreparing] = useState(false)
  const prepTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (prepTimerRef.current) clearInterval(prepTimerRef.current)
    }
  }, [router])

  const generatePrompt = async () => {
    setGenerating(true)
    setError('')
    setResult(null)
    setTranscription('')
    setAudioURL(null)
    setRecordingTime(0)

    try {
      const response = await apiClient.post('/api/lessons/generate/speaking', {
        part_number: partNumber,
        cefr_level: 'B2',
        topic: 'general',
      })
      setPrompt(response.data)

      // Start preparation time for Part 2
      if (partNumber === 2) {
        setPrepTime(60)
        setIsPreparing(true)
        prepTimerRef.current = setInterval(() => {
          setPrepTime((prev) => {
            if (prev <= 1) {
              if (prepTimerRef.current) clearInterval(prepTimerRef.current)
              setIsPreparing(false)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate prompt')
    } finally {
      setGenerating(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      setError('Could not access microphone. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const submitSpeaking = async () => {
    if (!prompt) return
    if (!transcription.trim() && !audioURL) {
      setError('Please record your response or enter a transcription')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await apiClient.post('/api/assessments/submit/speaking', {
        lesson_id: prompt.id,
        transcription: transcription || '[Audio recorded - transcription pending]',
        audio_url: audioURL,
        prompt_text: prompt.prompt_text,
        part_number: partNumber,
      })
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600'
    if (score >= 5.5) return 'text-yellow-600'
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
          <h1 className="text-3xl font-bold text-gray-900">Speaking Practice</h1>
          <p className="mt-2 text-gray-600">Practice IELTS speaking with AI feedback</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Prompt & Recording */}
          <div className="space-y-6">
            {/* Part Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Speaking Part</h2>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((part) => (
                  <button
                    key={part}
                    onClick={() => {
                      setPartNumber(part as 1 | 2 | 3)
                      setPrompt(null)
                      setResult(null)
                      setTranscription('')
                      setAudioURL(null)
                      setPrepTime(0)
                      setIsPreparing(false)
                    }}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      partNumber === part
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold">Part {part}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {part === 1 && 'Interview'}
                      {part === 2 && 'Long turn'}
                      {part === 3 && 'Discussion'}
                    </p>
                  </button>
                ))}
              </div>
              <button
                onClick={generatePrompt}
                disabled={generating}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Generating...' : 'Generate New Prompt'}
              </button>
            </div>

            {/* Speaking Prompt */}
            {prompt && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Speaking Prompt</h2>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                    Part {partNumber}
                  </span>
                </div>

                {/* Preparation Timer */}
                {isPreparing && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-800 font-medium">Preparation Time</span>
                      <span className="text-2xl font-bold text-yellow-600">{formatTime(prepTime)}</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      Take notes and organize your thoughts
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{prompt.prompt_text}</p>
                </div>

                {prompt.follow_up_questions && prompt.follow_up_questions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Follow-up Questions:</h4>
                    <ul className="space-y-2">
                      {prompt.follow_up_questions.map((q, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="text-gray-400 mr-2">{i + 1}.</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Recording Interface */}
            {prompt && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Your Response</h2>

                <div className="flex flex-col items-center py-8">
                  {/* Recording Button */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={submitting}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isRecording ? (
                      <span className="w-8 h-8 bg-white rounded"></span>
                    ) : (
                      <span className="text-4xl text-white">🎤</span>
                    )}
                  </button>

                  <p className="mt-4 text-gray-600">
                    {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                  </p>

                  {/* Recording Time */}
                  {(isRecording || recordingTime > 0) && (
                    <p className={`text-2xl font-mono mt-2 ${isRecording ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatTime(recordingTime)}
                    </p>
                  )}

                  {/* Audio Playback */}
                  {audioURL && (
                    <div className="mt-6 w-full">
                      <audio src={audioURL} controls className="w-full" />
                    </div>
                  )}
                </div>

                {/* Manual Transcription */}
                <div className="mt-6 border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or enter your transcription manually
                  </label>
                  <textarea
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    placeholder="Type what you would say..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                    disabled={submitting}
                  />
                </div>

                <button
                  onClick={submitSpeaking}
                  disabled={submitting || (!transcription.trim() && !audioURL)}
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
                  {result.criteria_scores.fluency !== undefined && (
                    <ScoreItem label="Fluency & Coherence" score={result.criteria_scores.fluency} />
                  )}
                  {result.criteria_scores.lexical_resource !== undefined && (
                    <ScoreItem label="Lexical Resource" score={result.criteria_scores.lexical_resource} />
                  )}
                  {result.criteria_scores.grammatical_range !== undefined && (
                    <ScoreItem label="Grammar Range" score={result.criteria_scores.grammatical_range} />
                  )}
                  {result.criteria_scores.pronunciation !== undefined && (
                    <ScoreItem label="Pronunciation" score={result.criteria_scores.pronunciation} />
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
                    setTranscription('')
                    setAudioURL(null)
                    setRecordingTime(0)
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
                  <span className="text-6xl mb-4 block">🗣️</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to Practice?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Select a speaking part and generate a prompt to begin.
                    Record your response or type a transcription for AI feedback.
                  </p>
                </div>

                <div className="mt-8 border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Speaking Tips</h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">1.</span>
                      Speak clearly and at a natural pace
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">2.</span>
                      Use varied vocabulary and sentence structures
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">3.</span>
                      Organize your ideas logically with clear transitions
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">4.</span>
                      Avoid long pauses - use fillers naturally if needed
                    </li>
                  </ul>
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Part Guide</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Part 1:</strong> General questions about familiar topics (4-5 min)</p>
                    <p><strong>Part 2:</strong> Long turn - speak on a topic for 1-2 minutes</p>
                    <p><strong>Part 3:</strong> Discussion of abstract ideas (4-5 min)</p>
                  </div>
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
