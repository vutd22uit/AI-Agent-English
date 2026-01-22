'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface UserWithProfile {
  id: string
  email: string
  full_name: string
  created_at: string
  profile: {
    id: string
    current_cefr_level: string
    target_band_score: number
    target_exam_date?: string
    native_language?: string
    study_hours_per_week?: number
  }
}

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    current_cefr_level: 'B1',
    target_band_score: 7.0,
    target_exam_date: '',
    native_language: '',
    study_hours_per_week: 10
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/users/me')
      setUser(response.data)

      // Populate form
      setFormData({
        full_name: response.data.full_name || '',
        current_cefr_level: response.data.profile?.current_cefr_level || 'B1',
        target_band_score: response.data.profile?.target_band_score || 7.0,
        target_exam_date: response.data.profile?.target_exam_date || '',
        native_language: response.data.profile?.native_language || '',
        study_hours_per_week: response.data.profile?.study_hours_per_week || 10
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // Update profile
      if (user?.id) {
        await api.put(`/api/users/${user.id}/profile`, {
          current_cefr_level: formData.current_cefr_level,
          target_band_score: parseFloat(formData.target_band_score.toString()),
          target_exam_date: formData.target_exam_date || null,
          native_language: formData.native_language || null,
          study_hours_per_week: parseInt(formData.study_hours_per_week.toString()) || null
        })

        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and learning preferences</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
              <input
                type="text"
                value={new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Learning Profile */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current CEFR Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current CEFR Level
                </label>
                <select
                  value={formData.current_cefr_level}
                  onChange={(e) => setFormData({ ...formData, current_cefr_level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficient</option>
                </select>
              </div>

              {/* Target Band Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target IELTS Band Score
                </label>
                <select
                  value={formData.target_band_score}
                  onChange={(e) => setFormData({ ...formData, target_band_score: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="5.0">5.0</option>
                  <option value="5.5">5.5</option>
                  <option value="6.0">6.0</option>
                  <option value="6.5">6.5</option>
                  <option value="7.0">7.0</option>
                  <option value="7.5">7.5</option>
                  <option value="8.0">8.0</option>
                  <option value="8.5">8.5</option>
                  <option value="9.0">9.0</option>
                </select>
              </div>

              {/* Target Exam Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Exam Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.target_exam_date}
                  onChange={(e) => setFormData({ ...formData, target_exam_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Study Hours Per Week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Hours Per Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={formData.study_hours_per_week}
                  onChange={(e) => setFormData({ ...formData, study_hours_per_week: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Native Language */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Native Language (Optional)
                </label>
                <input
                  type="text"
                  value={formData.native_language}
                  onChange={(e) => setFormData({ ...formData, native_language: e.target.value })}
                  placeholder="e.g., Vietnamese, Chinese, Spanish"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
