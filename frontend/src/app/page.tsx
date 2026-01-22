import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Master IELTS with
            <span className="text-blue-600"> AI-Powered</span> Learning
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get personalized feedback on your Writing and Speaking from an AI examiner.
            Track your progress across all four skills and achieve your target band score.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Practice All Four IELTS Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkillCard
              title="Listening"
              icon="🎧"
              description="Practice with AI-generated audio content and comprehension questions"
              href="/practice/listening"
              color="purple"
            />
            <SkillCard
              title="Reading"
              icon="📖"
              description="Improve comprehension with adaptive passages at your level"
              href="/practice/reading"
              color="green"
            />
            <SkillCard
              title="Writing"
              icon="✍️"
              description="Get detailed AI feedback on Task 1 and Task 2 essays"
              href="/practice/writing"
              color="blue"
            />
            <SkillCard
              title="Speaking"
              icon="🗣️"
              description="Practice with AI examiner and receive instant feedback"
              href="/practice/speaking"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎯"
              title="Adaptive Learning"
              description="Our AI analyzes your performance and recommends lessons tailored to your skill gaps and learning pace."
            />
            <FeatureCard
              icon="📊"
              title="Detailed Feedback"
              description="Receive comprehensive band score assessments with specific strengths, weaknesses, and improvement tips."
            />
            <FeatureCard
              icon="📈"
              title="Track Progress"
              description="Monitor your improvement across all skills with detailed analytics and performance history."
            />
            <FeatureCard
              icon="🤖"
              title="AI-Powered Assessment"
              description="Get instant feedback from our AI examiner trained on official IELTS criteria and scoring standards."
            />
            <FeatureCard
              icon="📚"
              title="Unlimited Practice"
              description="Access thousands of practice questions and AI-generated content for endless practice opportunities."
            />
            <FeatureCard
              icon="⚡"
              title="Real IELTS Format"
              description="Practice with authentic IELTS-style questions and tasks that mirror the actual exam experience."
            />
          </div>
        </div>
      </section>

      {/* Band Score Guide */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            IELTS Band Score Guide
          </h2>
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <BandScoreItem score="5.0" label="Modest" color="red" />
              <BandScoreItem score="6.0" label="Competent" color="yellow" />
              <BandScoreItem score="7.0" label="Good" color="green" />
              <BandScoreItem score="8.0" label="Very Good" color="blue" />
              <BandScoreItem score="9.0" label="Expert" color="purple" />
            </div>
            <p className="text-center text-gray-600 mt-6">
              Most universities require a band score of 6.0 to 7.0 for admission
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your IELTS Journey Today
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of students who have improved their IELTS scores with our platform
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
            IELTS Learning Platform - AI-Powered IELTS Preparation
          </p>
        </div>
      </footer>
    </div>
  )
}

function SkillCard({
  title,
  icon,
  description,
  href,
  color,
}: {
  title: string
  icon: string
  description: string
  href: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    purple: 'hover:border-purple-300 hover:bg-purple-50',
    green: 'hover:border-green-300 hover:bg-green-50',
    blue: 'hover:border-blue-300 hover:bg-blue-50',
    orange: 'hover:border-orange-300 hover:bg-orange-50',
  }

  return (
    <Link
      href={href}
      className={`p-6 border-2 border-gray-200 rounded-xl transition-all ${colorClasses[color]}`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

function BandScoreItem({
  score,
  label,
  color,
}: {
  score: string
  label: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{score}</div>
      <div className="text-sm">{label}</div>
    </div>
  )
}
