export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          IELTS Learning Platform
        </h1>
        <p className="text-center text-lg mb-8">
          Adaptive IELTS Learning with AI-Powered Assessments
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <SkillCard
            title="Listening"
            icon="🎧"
            description="Practice with AI-generated audio content"
          />
          <SkillCard
            title="Reading"
            icon="📖"
            description="Improve comprehension with adaptive passages"
          />
          <SkillCard
            title="Writing"
            icon="✍️"
            description="Get detailed AI feedback on your essays"
          />
          <SkillCard
            title="Speaking"
            icon="🗣️"
            description="Practice with AI examiner simulation"
          />
        </div>
      </div>
    </main>
  )
}

function SkillCard({ title, icon, description }: { title: string, icon: string, description: string }) {
  return (
    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
