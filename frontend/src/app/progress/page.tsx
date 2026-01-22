'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface AssessmentHistoryItem {
  id: string
  submission_id: string
  skill_type: string
  overall_band_score: number
  created_at: string
  lesson_id: string
}

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
  last_assessed_at: string | null
}

export default function ProgressPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [progress, setProgress] = useState<ProgressSummary | null>(null)
  const [proficiencies, setProficiencies] = useState<SkillProficiency[]>([])
  const [assessments, setAssessments] = useState<AssessmentHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [skillFilter, setSkillFilter] = useState('')

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

    fetchProgressData()
  }, [router])

  const fetchProgressData = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) return

      const userData = JSON.parse(storedUser)
      const userId = userData.id

      const [progressRes, proficiencyRes, historyRes] = await Promise.all([
        apiClient.get(`/api/assessments/user/${userId}/progress`).catch(() => null),
        apiClient.get(`/api/assessments/user/${userId}/proficiency`).catch(() => null),
        apiClient.get(`/api/assessments/user/${userId}/history`).catch(() => null),
      ])

      if (progressRes?.data) setProgress(progressRes.data)
      if (proficiencyRes?.data) setProficiencies(proficiencyRes.data)
      if (historyRes?.data) setAssessments(historyRes.data.assessments || [])
    } catch (err: any) {
      setError('Failed to load progress data')
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

  const getScoreBg = (score: number) => {
    if (score >= 7) return 'bg-green-100'
    if (score >= 5.5) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredAssessments = skillFilter
    ? assessments.filter((a) => a.skill_type === skillFilter)
    : assessments

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
          <p className="mt-2 text-gray-600">Track your IELTS learning journey</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-gray-900">
              {progress?.total_lessons_completed || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Lessons Completed</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-gray-900">
              {progress?.total_assessments || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Assessments Taken</p>
          </div>
          <div className="bg-blue-600 rounded-lg shadow-sm p-6 text-white">
            <div className="text-3xl font-bold">
              {progress?.average_band_score?.toFixed(1) || '-'}
            </div>
            <p className="text-sm text-blue-100 mt-1">Average Band Score</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-gray-900">7.0</div>
            <p className="text-sm text-gray-500 mt-1">Target Score</p>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Skills Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['listening', 'reading', 'writing', 'speaking'].map((skill) => {
              const proficiency = proficiencies.find((p) => p.skill_type === skill)
              const completed = progress?.[`${skill}_completed` as keyof ProgressSummary] as number || 0
              const avgScore = progress?.[`${skill}_avg_score` as keyof ProgressSummary] as number | null

              return (
                <div key={skill} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getSkillIcon(skill)}</span>
                      <span className="font-semibold capitalize">{skill}</span>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                      {avgScore?.toFixed(1) || '-'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Lessons</span>
                      <span className="font-medium">{completed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Proficiency</span>
                      <span className="font-medium">
                        {proficiency?.band_score_equivalent?.toFixed(1) || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Samples</span>
                      <span className="font-medium">{proficiency?.sample_size || 0}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress to 7.0</span>
                      <span>{Math.min(100, Math.round(((avgScore || 0) / 7) * 100))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, ((avgScore || 0) / 7) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Assessment History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Assessment History</h2>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Skills</option>
              <option value="listening">Listening</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
            </select>
          </div>

          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block">📝</span>
              <p className="text-gray-500 mb-4">No assessments yet</p>
              <Link
                href="/practice/writing"
                className="text-blue-600 hover:text-blue-800"
              >
                Take your first assessment →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Skill
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Band Score
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAssessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(assessment.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">{getSkillIcon(assessment.skill_type)}</span>
                          <span className="text-sm font-medium capitalize">
                            {assessment.skill_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(
                            assessment.overall_band_score
                          )} ${getScoreColor(assessment.overall_band_score)}`}
                        >
                          {assessment.overall_band_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/assessments/${assessment.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
