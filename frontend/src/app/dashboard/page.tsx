'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

interface UserWithProfile {
  id: string
  email: string
  full_name: string
  profile: {
    current_cefr_level: string
    target_band_score: number
    target_exam_date?: string
  }
}

interface ProgressStats {
  total_lessons_completed: number
  total_assessments: number
  average_band_score: number | null
  listening_avg_score: number | null
  reading_avg_score: number | null
  writing_avg_score: number | null
  speaking_avg_score: number | null
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile
      const userResponse = await api.get('/api/users/me')
      setUser(userResponse.data)

      // Fetch progress stats
      if (userResponse.data?.id) {
        try {
          const statsResponse = await api.get(`/api/assessments/user/${userResponse.data.id}/progress`)
          setStats(statsResponse.data)
        } catch (error) {
          console.error('Error fetching stats:', error)
          // Set default stats if endpoint fails
          setStats({
            total_lessons_completed: 0,
            total_assessments: 0,
            average_band_score: null,
            listening_avg_score: null,
            reading_avg_score: null,
            writing_avg_score: null,
            speaking_avg_score: null
          })
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-gray-600">
            Current Level: <span className="font-semibold text-blue-600">{user.profile?.current_cefr_level || 'Not set'}</span>
            {user.profile?.target_band_score && (
              <> • Target Score: <span className="font-semibold text-green-600">{user.profile.target_band_score}</span></>
            )}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Lessons Completed"
            value={stats?.total_lessons_completed || 0}
            icon="📚"
            color="blue"
          />
          <StatCard
            title="Assessments"
            value={stats?.total_assessments || 0}
            icon="📝"
            color="green"
          />
          <StatCard
            title="Average Score"
            value={stats?.average_band_score ? stats.average_band_score.toFixed(1) : 'N/A'}
            icon="⭐"
            color="yellow"
          />
          <StatCard
            title="Days Active"
            value={Math.floor((new Date().getTime() - new Date(user.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24))}
            icon="📅"
            color="purple"
          />
        </div>

        {/* Skills Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkillProgress skill="Listening" score={stats?.listening_avg_score} icon="🎧" />
            <SkillProgress skill="Reading" score={stats?.reading_avg_score} icon="📖" />
            <SkillProgress skill="Writing" score={stats?.writing_avg_score} icon="✍️" />
            <SkillProgress skill="Speaking" score={stats?.speaking_avg_score} icon="🗣️" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton href="/lessons?skill=listening" title="Practice Listening" icon="🎧" />
            <ActionButton href="/lessons?skill=reading" title="Practice Reading" icon="📖" />
            <ActionButton href="/lessons?skill=writing" title="Practice Writing" icon="✍️" />
            <ActionButton href="/lessons?skill=speaking" title="Practice Speaking" icon="🗣️" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} mb-4`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function SkillProgress({ skill, score, icon }: { skill: string, score: number | null | undefined, icon: string }) {
  const percentage = score ? (score / 9) * 100 : 0
  const scoreText = score ? score.toFixed(1) : 'No data'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-gray-900">{skill}</span>
        </div>
        <span className="text-sm font-medium text-gray-600">{scoreText}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function ActionButton({ href, title, icon }: { href: string, title: string, icon: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
    >
      <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{title}</span>
    </Link>
  )
}
