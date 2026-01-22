# IELTS Learning Platform - Frontend

Modern, responsive web application for IELTS exam preparation built with Next.js 14, React, TypeScript, and TailwindCSS.

## 🌟 Features

### Core Pages
- **Home Page** - Hero section with features, CTA, and skill overview
- **Dashboard** - Personalized learning dashboard with stats and quick actions
- **Lessons** - Browse and filter lessons by skill type and CEFR level
- **Practice** - Interactive practice pages for all four IELTS skills
- **Progress** - Comprehensive progress tracking with skill proficiency breakdown
- **Profile** - User profile management and learning preferences
- **Authentication** - Login and registration pages with JWT token management

### IELTS Skills Coverage
- 🎧 **Listening** - AI-generated audio content practice
- 📖 **Reading** - Adaptive reading passages with comprehension questions
- ✍️ **Writing** - Task 1 & 2 practice with AI feedback
- 🗣️ **Speaking** - Part 1, 2, 3 practice with AI assessment

### Key Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Real-time progress tracking
- ✅ AI-powered band score assessment
- ✅ Personalized lesson recommendations
- ✅ Skill proficiency visualization
- ✅ Assessment history tracking
- ✅ JWT authentication
- ✅ Modern UI with TailwindCSS

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run development server:
```bash
npm run dev
```

5. Open browser:
```
http://localhost:3000
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── page.tsx             # Home page
│   │   ├── layout.tsx           # Root layout
│   │   ├── dashboard/           # Dashboard page
│   │   ├── lessons/             # Lessons browsing
│   │   ├── practice/            # Practice pages (dynamic routes)
│   │   │   └── [skill]/[lessonId]/page.tsx
│   │   ├── progress/            # Progress tracking
│   │   ├── profile/             # User profile
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── components/              # Reusable components
│   │   └── Header.tsx           # Navigation header
│   ├── lib/                     # Utilities and libraries
│   │   └── api.ts              # Axios API client with auth
│   └── types/                   # TypeScript type definitions
│       └── index.ts             # Shared types
├── public/                      # Static assets
├── .eslintrc.json              # ESLint configuration
├── tailwind.config.js          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
├── next.config.js              # Next.js configuration
└── package.json                # Dependencies and scripts
```

## 🎨 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.1.0 | React framework with App Router |
| React | 18.2.0 | UI library |
| TypeScript | 5.3.3 | Type safety |
| TailwindCSS | 3.4.1 | Utility-first CSS |
| Axios | 1.6.5 | HTTP client for API calls |
| ESLint | 8.56.0 | Code linting |

## 📡 API Integration

### API Client Configuration
The `lib/api.ts` file provides a pre-configured Axios instance with:
- Base URL from environment variables
- Automatic JWT token injection
- 401 error handling (auto-redirect to login)
- Response/request interceptors

### Example Usage
```typescript
import api from '@/lib/api'

// GET request
const response = await api.get('/api/users/me')

// POST request
const result = await api.post('/api/users/login', {
  email: 'user@example.com',
  password: 'password'
})
```

## 🎯 Key Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home page | No |
| `/login` | User login | No |
| `/register` | User registration | No |
| `/dashboard` | User dashboard | Yes |
| `/lessons` | Browse lessons | Yes |
| `/practice/[skill]/[lessonId]` | Practice page | Yes |
| `/progress` | Progress tracking | Yes |
| `/profile` | User profile | Yes |

## 🔐 Authentication Flow

1. User logs in via `/login`
2. JWT token stored in localStorage
3. API client automatically includes token in requests
4. Protected routes check for token, redirect to login if missing
5. 401 responses trigger automatic logout and redirect

## 🎨 Styling

### TailwindCSS Configuration
- Primary color: Blue (#3B82F6)
- Secondary color: Green (#10B981)
- Responsive breakpoints: sm, md, lg, xl
- Custom utilities for gradients and shadows

### Color Palette
```js
colors: {
  primary: '#3B82F6',    // Blue
  secondary: '#10B981',  // Green
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444'
}
```

## 📱 Responsive Design

All pages are fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🧩 Component Library

### Reusable Components
- **StatCard** - Dashboard statistics display
- **SkillProgress** - Progress bar for skills
- **ActionButton** - Quick action buttons
- **LessonCard** - Lesson preview card
- **FeatureCard** - Feature highlights

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Format code
npm run format
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## 📈 Performance Optimizations

- Next.js 14 App Router for optimal performance
- Automatic code splitting
- Image optimization (Next.js Image component)
- Client-side caching
- Lazy loading of components

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Error**
- Verify backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is configured in backend

**2. Authentication Issues**
- Clear localStorage: `localStorage.clear()`
- Check token expiration (30 minutes default)
- Verify backend JWT configuration

**3. Build Errors**
- Delete `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## 🔮 Future Enhancements

- [ ] Audio player for listening practice
- [ ] Voice recording for speaking practice
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Advanced charts and analytics
- [ ] Social features (study groups)
- [ ] Gamification (badges, streaks)

## 📄 License

This project is part of the IELTS Learning Platform and follows the same license as the main project.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Check existing documentation
- Contact the development team

---

Built with ❤️ using Next.js and TailwindCSS
