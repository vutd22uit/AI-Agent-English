'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface UserProfile {
  id?: string
  user_id: string
  current_cefr_level: string
  target_band_score: number
  target_exam_date?: string
  native_language?: string
  study_hours_per_week?: number
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const BAND_SCORES = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    current_cefr_level: 'B1',
    target_band_score: 6.5,
    target_exam_date: '',
    native_language: '',
    study_hours_per_week: 10,
  })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchUserData()
  }, [router])

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get('/api/users/me')
      setUser(response.data.user)

      if (response.data.profile) {
        setProfile(response.data.profile)
        setFormData({
          current_cefr_level: response.data.profile.current_cefr_level || 'B1',
          target_band_score: response.data.profile.target_band_score || 6.5,
          target_exam_date: response.data.profile.target_exam_date?.split('T')[0] || '',
          native_language: response.data.profile.native_language || '',
          study_hours_per_week: response.data.profile.study_hours_per_week || 10,
        })
      }
    } catch (err: any) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      if (profile?.id) {
        await apiClient.put('/api/users/profile', formData)
      } else {
        await apiClient.post('/api/users/profile', formData)
      }
      setSuccess('Profile updated successfully')
      fetchUserData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'target_band_score' || name === 'study_hours_per_week'
        ? parseFloat(value)
        : value,
    }))
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account and learning preferences</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-gray-900">{user?.full_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-gray-900">{user?.email || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Member Since</label>
              <p className="mt-1 text-gray-900">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Learning Profile */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Learning Profile</h2>

          <div className="space-y-6">
            {/* CEFR Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current CEFR Level
              </label>
              <select
                name="current_cefr_level"
                value={formData.current_cefr_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {CEFR_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level} - {getLevelDescription(level)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Your estimated current English level
              </p>
            </div>

            {/* Target Band Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target IELTS Band Score
              </label>
              <select
                name="target_band_score"
                value={formData.target_band_score}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {BAND_SCORES.map((score) => (
                  <option key={score} value={score}>
                    {score.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Exam Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Exam Date (Optional)
              </label>
              <input
                type="date"
                name="target_exam_date"
                value={formData.target_exam_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Native Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Native Language
              </label>
              <input
                type="text"
                name="native_language"
                value={formData.native_language}
                onChange={handleChange}
                placeholder="e.g., Vietnamese, Chinese, Spanish"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Study Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Study Hours Per Week
              </label>
              <input
                type="number"
                name="study_hours_per_week"
                value={formData.study_hours_per_week}
                onChange={handleChange}
                min="1"
                max="40"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                How many hours can you dedicate to studying each week?
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getLevelDescription(level: string): string {
  const descriptions: Record<string, string> = {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Proficient',
  }
  return descriptions[level] || ''
}
