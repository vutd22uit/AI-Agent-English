'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

interface Lesson {
  id: string
  skill_type: 'listening' | 'reading' | 'writing' | 'speaking'
  title: string
  cefr_level: string
  estimated_duration_minutes: number
  difficulty_score: number
  topic_name?: string
}

export default function Lessons() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<string>(searchParams.get('skill') || 'all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchLessons()
  }, [selectedSkill, selectedLevel])

  const fetchLessons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedSkill !== 'all') params.append('skill_type', selectedSkill)
      if (selectedLevel !== 'all') params.append('cefr_level', selectedLevel)

      const response = await api.get(`/api/lessons?${params.toString()}`)
      setLessons(response.data.lessons || response.data || [])
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const skillIcons: { [key: string]: string } = {
    listening: '🎧',
    reading: '📖',
    writing: '✍️',
    speaking: '🗣️'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">IELTS Lessons</h1>
          <p className="text-gray-600">Choose a lesson to start practicing</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skill Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Type
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Skills</option>
                <option value="listening">🎧 Listening</option>
                <option value="reading">📖 Reading</option>
                <option value="writing">✍️ Writing</option>
                <option value="speaking">🗣️ Speaking</option>
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CEFR Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Proficient</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-xl text-gray-600">Loading lessons...</div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">No lessons found</p>
            <p className="text-gray-500">Try adjusting your filters or generate new lessons</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} icon={skillIcons[lesson.skill_type]} />
            ))}
          </div>
        )}

        {/* Generate New Lesson Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Need a Custom Lesson?</h2>
          <p className="mb-4">Generate AI-powered lessons tailored to your level and interests</p>
          <Link
            href="/generate"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Generate Lesson
          </Link>
        </div>
      </div>
    </div>
  )
}

function LessonCard({ lesson, icon }: { lesson: Lesson, icon: string }) {
  const difficultyColor = (score: number) => {
    if (score < 3) return 'text-green-600 bg-green-50'
    if (score < 7) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const difficultyText = (score: number) => {
    if (score < 3) return 'Easy'
    if (score < 7) return 'Medium'
    return 'Hard'
  }

  return (
    <Link href={`/practice/${lesson.skill_type}/${lesson.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-4">
          <span className="text-4xl">{icon}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor(lesson.difficulty_score)}`}>
            {difficultyText(lesson.difficulty_score)}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {lesson.title}
        </h3>

        {lesson.topic_name && (
          <p className="text-sm text-gray-500 mb-3">📌 {lesson.topic_name}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="flex items-center">
            <span className="mr-1">📊</span>
            {lesson.cefr_level}
          </span>
          <span className="flex items-center">
            <span className="mr-1">⏱️</span>
            {lesson.estimated_duration_minutes} min
          </span>
        </div>
      </div>
    </Link>
  )
}
