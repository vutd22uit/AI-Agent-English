'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  // Check if user is logged in (simplified, should use proper auth context)
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">IELTS</span>
            <span className="text-xl text-gray-700">Learning</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={pathname === '/' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600' + ' px-3 py-2 text-sm font-medium transition-colors'}
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className={pathname === '/dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600' + ' px-3 py-2 text-sm font-medium transition-colors'}
                >
                  Dashboard
                </Link>
                <Link
                  href="/lessons"
                  className={pathname.startsWith('/lessons') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600' + ' px-3 py-2 text-sm font-medium transition-colors'}
                >
                  Lessons
                </Link>
                <Link
                  href="/progress"
                  className={pathname === '/progress' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600' + ' px-3 py-2 text-sm font-medium transition-colors'}
                >
                  Progress
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
