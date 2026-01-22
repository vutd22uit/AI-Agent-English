'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface AssessmentHistory {
  id: string
  submission_id: string
  skill_type: string
  overall_band_score: number
  created_at: string
  lesson_id: string
}

interface SkillProficiency {
  skill_type: string
  sub_skill: string
  band_score_equivalent: number
  proficiency_score: number
  sample_size: number
  last_assessed_at: string
}

export default function Progress() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [assessments, setAssessments] = useState<AssessmentHistory[]>([])
  const [proficiencies, setProficiencies] = useState<SkillProficiency[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    try {
      // Get user info first
      const userResponse = await api.get('/api/users/me')
      const user = userResponse.data
      setUserId(user.id)

      // Fetch assessment history
      try {
        const historyResponse = await api.get(`/api/assessments/user/${user.id}/history?limit=50`)
        setAssessments(historyResponse.data.assessments || [])
      } catch (error) {
        console.error('Error fetching assessment history:', error)
        setAssessments([])
      }

      // Fetch skill proficiency
      try {
        const proficiencyResponse = await api.get(`/api/assessments/user/${user.id}/proficiency`)
        setProficiencies(proficiencyResponse.data || [])
      } catch (error) {
        console.error('Error fetching proficiency:', error)
        setProficiencies([])
      }
    } catch (error) {
      console.error('Error fetching progress data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading progress...</div>
      </div>
    )
  }

  const getSkillProficiencies = (skillType: string) => {
    return proficiencies.filter(p => p.skill_type === skillType && p.sub_skill !== 'overall')
  }

  const getOverallProficiency = (skillType: string) => {
    return proficiencies.find(p => p.skill_type === skillType && p.sub_skill === 'overall')
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your IELTS learning journey</p>
        </div>

        {/* Skill Proficiency Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {['listening', 'reading', 'writing', 'speaking'].map(skill => {
            const overall = getOverallProficiency(skill)
            return (
              <div key={skill} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{skillIcons[skill]}</span>
                  {overall && (
                    <span className="text-2xl font-bold text-blue-600">
                      {overall.band_score_equivalent.toFixed(1)}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 capitalize mb-2">{skill}</h3>
                {overall ? (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${overall.proficiency_score}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Based on {overall.sample_size} assessment{overall.sample_size !== 1 ? 's' : ''}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No assessments yet</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Detailed Proficiency Breakdown */}
        {['writing', 'speaking'].map(skill => {
          const subSkills = getSkillProficiencies(skill)
          if (subSkills.length === 0) return null

          return (
            <div key={skill} className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">{skillIcons[skill]}</span>
                {skill.charAt(0).toUpperCase() + skill.slice(1)} Breakdown
              </h2>
              <div className="space-y-4">
                {subSkills.map(prof => (
                  <div key={prof.sub_skill}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {prof.sub_skill.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {prof.band_score_equivalent.toFixed(1)} / 9.0
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${prof.proficiency_score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Recent Assessments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Assessments</h2>
          {assessments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No assessments yet</p>
              <p className="text-sm text-gray-400">Start practicing to see your progress here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Skill</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Band Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="mr-2">{skillIcons[assessment.skill_type]}</span>
                          <span className="capitalize">{assessment.skill_type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-600">
                          {assessment.overall_band_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(assessment.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => router.push(`/assessment/${assessment.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
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
