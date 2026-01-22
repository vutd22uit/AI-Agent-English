'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface ProgressSummary {
  total_lessons_completed: number
  total_assessments: number
  average_band_score: number | null
  listening_completed: number
  reading_completed: number
  writing_completed: number
  speaking_completed: number
  listening_avg_score: number | null
  reading_avg_score: number | null
  writing_avg_score: number | null
  speaking_avg_score: number | null
}

interface SkillProficiency {
  skill_type: string
  proficiency_score: number
  band_score_equivalent: number
  sample_size: number
}

interface RecommendedLesson {
  id: string
  title: string
  skill_type: string
  cefr_level: string
  estimated_duration_minutes: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [progress, setProgress] = useState<ProgressSummary | null>(null)
  const [proficiencies, setProficiencies] = useState<SkillProficiency[]>([])
  const [recommendations, setRecommendations] = useState<RecommendedLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) return

      const userData = JSON.parse(storedUser)
      const userId = userData.id

      const [progressRes, proficiencyRes, recommendationsRes] = await Promise.all([
        apiClient.get(`/api/assessments/user/${userId}/progress`).catch(() => null),
        apiClient.get(`/api/assessments/user/${userId}/proficiency`).catch(() => null),
        apiClient.get(`/api/lessons/recommended/${userId}`).catch(() => null),
      ])

      if (progressRes?.data) setProgress(progressRes.data)
      if (proficiencyRes?.data) setProficiencies(proficiencyRes.data)
      if (recommendationsRes?.data) setRecommendations(recommendationsRes.data.slice(0, 5))
    } catch (err: any) {
      setError('Failed to load dashboard data')
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

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400'
    if (score >= 7) return 'text-green-600'
    if (score >= 5.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name || 'Learner'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Continue your IELTS journey and track your progress
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Lessons"
            value={progress?.total_lessons_completed || 0}
            subtitle="lessons completed"
            icon="📚"
          />
          <StatCard
            title="Assessments"
            value={progress?.total_assessments || 0}
            subtitle="tests taken"
            icon="📝"
          />
          <StatCard
            title="Average Score"
            value={progress?.average_band_score?.toFixed(1) || '-'}
            subtitle="band score"
            icon="⭐"
            highlight={true}
          />
          <StatCard
            title="Target"
            value="7.0"
            subtitle="goal band score"
            icon="🎯"
          />
        </div>

        {/* Skills Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Skills Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['listening', 'reading', 'writing', 'speaking'].map((skill) => {
              const proficiency = proficiencies.find((p) => p.skill_type === skill)
              const completed = progress?.[`${skill}_completed` as keyof ProgressSummary] as number || 0
              const avgScore = progress?.[`${skill}_avg_score` as keyof ProgressSummary] as number | null

              return (
                <div key={skill} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{getSkillIcon(skill)}</span>
                    <span className={`text-xl font-bold ${getScoreColor(avgScore)}`}>
                      {avgScore?.toFixed(1) || '-'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 capitalize">{skill}</h3>
                  <p className="text-sm text-gray-500">{completed} lessons completed</p>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((proficiency?.proficiency_score || 0) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link
                    href={`/practice/${skill}`}
                    className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Practice Now →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/practice/writing"
                className="flex items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <span className="text-2xl mr-3">✍️</span>
                <div>
                  <p className="font-medium text-gray-900">Writing Task</p>
                  <p className="text-xs text-gray-500">AI-powered feedback</p>
                </div>
              </Link>
              <Link
                href="/practice/speaking"
                className="flex items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <span className="text-2xl mr-3">🗣️</span>
                <div>
                  <p className="font-medium text-gray-900">Speaking Practice</p>
                  <p className="text-xs text-gray-500">Record & analyze</p>
                </div>
              </Link>
              <Link
                href="/lessons"
                className="flex items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <span className="text-2xl mr-3">📚</span>
                <div>
                  <p className="font-medium text-gray-900">Browse Lessons</p>
                  <p className="text-xs text-gray-500">All skill levels</p>
                </div>
              </Link>
              <Link
                href="/progress"
                className="flex items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <p className="font-medium text-gray-900">View Progress</p>
                  <p className="text-xs text-gray-500">Detailed analytics</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recommended Lessons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h2>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/lessons/${lesson.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{getSkillIcon(lesson.skill_type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{lesson.title}</p>
                        <p className="text-xs text-gray-500">
                          {lesson.cefr_level} • {lesson.estimated_duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Complete more lessons to get personalized recommendations</p>
                <Link href="/lessons" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                  Browse all lessons →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  highlight = false,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg p-6 ${highlight ? 'bg-blue-600 text-white' : 'bg-white shadow-sm'}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold mt-4 ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
      <p className={`text-sm mt-1 ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>
        {subtitle}
      </p>
    </div>
  )
}
