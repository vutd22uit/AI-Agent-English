'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Master IELTS with
            <span className="text-blue-600"> AI-Powered</span> Learning
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Achieve your target band score with personalized lessons, instant AI feedback,
            and adaptive practice across all four skills
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/lessons"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Browse Lessons
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Practice All Four IELTS Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <SkillCard
              title="Listening"
              icon="🎧"
              description="Practice with AI-generated audio content tailored to your level"
              href="/lessons?skill=listening"
            />
            <SkillCard
              title="Reading"
              icon="📖"
              description="Improve comprehension with adaptive passages and instant feedback"
              href="/lessons?skill=reading"
            />
            <SkillCard
              title="Writing"
              icon="✍️"
              description="Get detailed AI feedback on Task 1 & 2 essays with band scores"
              href="/lessons?skill=writing"
            />
            <SkillCard
              title="Speaking"
              icon="🗣️"
              description="Practice with AI examiner simulation for all three parts"
              href="/lessons?skill=speaking"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              title="AI-Powered Assessment"
              description="Get instant, detailed feedback on your performance with accurate IELTS band scores"
            />
            <FeatureCard
              icon="📊"
              title="Adaptive Learning"
              description="Personalized lesson recommendations based on your proficiency and progress"
            />
            <FeatureCard
              icon="🎯"
              title="Track Your Progress"
              description="Visualize your improvement across all skills with comprehensive analytics"
            />
            <FeatureCard
              icon="⚡"
              title="Instant Feedback"
              description="Receive immediate assessment results powered by advanced AI models"
            />
            <FeatureCard
              icon="📚"
              title="Unlimited Practice"
              description="Access unlimited AI-generated lessons across all CEFR levels"
            />
            <FeatureCard
              icon="🌐"
              title="Learn Anywhere"
              description="Practice anytime, anywhere with our responsive web platform"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Achieve Your Target Band Score?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have improved their IELTS scores with AI-powered learning
          </p>
          {!isAuthenticated && (
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl"
            >
              Start Learning Today
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}

function SkillCard({ title, icon, description, href }: {
  title: string,
  icon: string,
  description: string,
  href: string
}) {
  return (
    <Link href={href}>
      <div className="bg-white p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer h-full group">
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: string,
  title: string,
  description: string
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
