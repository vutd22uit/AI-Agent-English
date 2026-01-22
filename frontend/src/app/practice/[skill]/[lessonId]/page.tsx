'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'

interface Lesson {
  id: string
  skill_type: string
  title: string
  cefr_level: string
  estimated_duration_minutes: number
}

export default function PracticePage() {
  const router = useRouter()
  const params = useParams()
  const skill = params.skill as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchLesson()
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/api/lessons/${lessonId}`)
      setLesson(response.data)
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading lesson...</div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Lesson not found</p>
          <button
            onClick={() => router.push('/lessons')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    )
  }

  const skillIcons: { [key: string]: string } = {
    listening: '🎧',
    reading: '📖',
    writing: '✍️',
    speaking: '🗣️'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-4xl mr-3">{skillIcons[skill]}</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
                  <p className="text-gray-600">
                    {lesson.cefr_level} • {lesson.estimated_duration_minutes} minutes
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/lessons')}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Practice Area */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {skill === 'reading' && <ReadingPractice lesson={lesson} />}
          {skill === 'writing' && <WritingPractice lesson={lesson} />}
          {skill === 'listening' && <ListeningPractice lesson={lesson} />}
          {skill === 'speaking' && <SpeakingPractice lesson={lesson} />}
        </div>
      </div>
    </div>
  )
}

function ReadingPractice({ lesson }: { lesson: Lesson }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reading Practice</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <p className="text-blue-800">
          📖 This is a placeholder for reading practice content. The full implementation will include:
        </p>
        <ul className="list-disc ml-6 mt-2 text-blue-700">
          <li>Reading passage display</li>
          <li>Multiple choice questions</li>
          <li>True/False/Not Given questions</li>
          <li>Matching headings</li>
          <li>Automatic scoring and feedback</li>
        </ul>
      </div>
      <p className="text-gray-600 mb-4">
        In the full implementation, you would see the reading passage here with interactive questions.
      </p>
    </div>
  )
}

function WritingPractice({ lesson }: { lesson: Lesson }) {
  const [essay, setEssay] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!essay.trim()) {
      alert('Please write your essay first')
      return
    }

    setSubmitting(true)
    try {
      // This would call the API to submit and get AI assessment
      alert('Essay submission would be processed here')
    } catch (error) {
      console.error('Error submitting essay:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Writing Practice</h2>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-yellow-900 mb-2">Writing Prompt:</h3>
        <p className="text-yellow-800">
          Sample writing prompt would appear here. Write an essay of at least 250 words on this topic.
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Essay (min. 250 words)
        </label>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          rows={15}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Start writing your essay here..."
        />
        <p className="text-sm text-gray-500 mt-2">
          Word count: {essay.split(/\s+/).filter(w => w.length > 0).length}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit for AI Assessment'}
      </button>
    </div>
  )
}

function ListeningPractice({ lesson }: { lesson: Lesson }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Listening Practice</h2>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
        <p className="text-purple-800">
          🎧 This is a placeholder for listening practice. The full implementation will include:
        </p>
        <ul className="list-disc ml-6 mt-2 text-purple-700">
          <li>Audio player with controls</li>
          <li>Transcript (hidden by default)</li>
          <li>Multiple choice questions</li>
          <li>Fill in the blanks</li>
          <li>Automatic scoring</li>
        </ul>
      </div>
    </div>
  )
}

function SpeakingPractice({ lesson }: { lesson: Lesson }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Speaking Practice</h2>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <p className="text-green-800">
          🗣️ This is a placeholder for speaking practice. The full implementation will include:
        </p>
        <ul className="list-disc ml-6 mt-2 text-green-700">
          <li>Voice recording functionality</li>
          <li>Speech-to-text transcription</li>
          <li>AI assessment of fluency, pronunciation, grammar</li>
          <li>Part 1, 2, and 3 question formats</li>
          <li>Detailed band score feedback</li>
        </ul>
      </div>
    </div>
  )
}
