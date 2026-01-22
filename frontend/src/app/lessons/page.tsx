'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { Lesson } from '@/types'

const SKILL_OPTIONS = [
  { value: '', label: 'All Skills' },
  { value: 'listening', label: 'Listening' },
  { value: 'reading', label: 'Reading' },
  { value: 'writing', label: 'Writing' },
  { value: 'speaking', label: 'Speaking' },
]

const LEVEL_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Proficient' },
]

interface LessonWithDetails extends Lesson {
  description?: string
  topic_name?: string
}

export default function LessonsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [lessons, setLessons] = useState<LessonWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [skillFilter, setSkillFilter] = useState(searchParams.get('skill') || '')
  const [levelFilter, setLevelFilter] = useState(searchParams.get('level') || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchLessons()
  }, [skillFilter, levelFilter, currentPage])

  const fetchLessons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (skillFilter) params.append('skill_type', skillFilter)
      if (levelFilter) params.append('cefr_level', levelFilter)
      params.append('page', currentPage.toString())
      params.append('limit', '12')

      const response = await apiClient.get(`/api/lessons?${params}`)
      setLessons(response.data.items || response.data)
      setTotalPages(response.data.total_pages || 1)
    } catch (err: any) {
      setError('Failed to load lessons')
    } finally {
      setLoading(false)
    }
  }

  const getSkillIcon = (skill: string) => {
    const icons: Record<string, string> = {
      listening: '🎧',
      reading: '📖',
      writing: '✍️',
      speaking: '🗣️',
    }
    return icons[skill] || '📚'
  }

  const getSkillColor = (skill: string) => {
    const colors: Record<string, string> = {
      listening: 'bg-purple-100 text-purple-800',
      reading: 'bg-green-100 text-green-800',
      writing: 'bg-blue-100 text-blue-800',
      speaking: 'bg-orange-100 text-orange-800',
    }
    return colors[skill] || 'bg-gray-100 text-gray-800'
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      A1: 'bg-emerald-100 text-emerald-700',
      A2: 'bg-teal-100 text-teal-700',
      B1: 'bg-cyan-100 text-cyan-700',
      B2: 'bg-sky-100 text-sky-700',
      C1: 'bg-indigo-100 text-indigo-700',
      C2: 'bg-violet-100 text-violet-700',
    }
    return colors[level] || 'bg-gray-100 text-gray-700'
  }

  const filteredLessons = lessons.filter((lesson) => {
    if (searchQuery) {
      return lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
          <p className="mt-2 text-gray-600">Browse and practice IELTS skills</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Skill Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
              <select
                value={skillFilter}
                onChange={(e) => {
                  setSkillFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {SKILL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={levelFilter}
                onChange={(e) => {
                  setLevelFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Lessons Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No lessons found matching your criteria</p>
            <button
              onClick={() => {
                setSkillFilter('')
                setLevelFilter('')
                setSearchQuery('')
              }}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{getSkillIcon(lesson.skill_type)}</span>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillColor(lesson.skill_type)}`}>
                          {lesson.skill_type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(lesson.cefr_level)}`}>
                          {lesson.cefr_level}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lesson.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>⏱ {lesson.estimated_duration_minutes} min</span>
                      <span className="text-blue-600 font-medium">Start →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
