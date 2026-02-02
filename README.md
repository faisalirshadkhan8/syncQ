# 🚀 SyncQ - Job Application Tracker

<div align="center">

![SyncQ Logo](public/vite.svg)

**A modern, feature-rich job application tracking platform built with React 19 and cutting-edge web technologies.**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

SyncQ (formerly Rogue Cosmic) is a comprehensive job application management system designed to streamline your job search process. Track applications, manage interviews, analyze opportunities with AI, and stay organized throughout your career journey.

### Why SyncQ?

- 🎯 **Centralized Tracking** - Manage all job applications in one place
- 🤖 **AI-Powered Tools** - Generate cover letters, analyze job matches, prepare interview questions
- 📊 **Analytics Dashboard** - Visualize your job search progress with interactive charts
- 🔔 **Smart Notifications** - Stay updated on application deadlines and interview schedules
- 🔒 **Enterprise Security** - Two-factor authentication, email verification, secure password reset
- 📱 **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices

---

## ✨ Features

### 📝 Application Management
- **Application Tracking** - Log applications with status, company details, and job descriptions
- **Status Pipeline** - Visualize application funnel from Applied → Interview → Offer
- **Document Storage** - Attach resumes, cover letters, and supporting documents
- **Custom Fields** - Add salary expectations, application URLs, and notes

### 🏢 Company Profiles
- **Company Database** - Maintain detailed company information and hiring history
- **Application History** - Track all applications per company over time
- **Notes & Contacts** - Store recruiter information and company-specific insights
- **Industry Filtering** - Organize by company size, industry, and location

### 📅 Interview Scheduler
- **Calendar Integration** - Visual calendar view of all scheduled interviews
- **Interview Types** - Support for phone, video, technical, behavioral, and onsite interviews
- **Preparation Tools** - Add interview notes, questions, and follow-up tasks
- **Reminders** - Never miss an interview with built-in notifications

### 🤖 AI-Powered Tools
- **Cover Letter Generator** - Create customized cover letters based on job descriptions
- **Job Match Analyzer** - AI-powered compatibility scoring for job opportunities
- **Interview Question Generator** - Get relevant interview questions based on role and company
- **AI History** - Track and favorite AI-generated content for reuse

### 📊 Analytics & Insights
- **Application Funnel** - Track conversion rates through each stage
- **Weekly Activity** - Monitor application trends over time
- **Response Rate Analysis** - Measure employer engagement
- **Top Companies** - Identify where you're most active

### 🔐 Security & Authentication
- **JWT Authentication** - Secure token-based authentication
- **Two-Factor Authentication** - TOTP-based 2FA with QR code setup and backup codes
- **Email Verification** - Confirm user accounts via email
- **Password Reset** - Secure password recovery with token validation
- **Protected Routes** - Role-based access control

### 🔗 Integrations & Exports
- **Webhook Support** - Integrate with external services via webhooks
- **Data Export** - Export applications, interviews, and analytics to CSV/PDF
- **Resume Management** - Store and manage multiple resume versions
- **API Integration** - RESTful API for custom integrations

---

## 🛠️ Tech Stack

### Frontend Core
- **React 19.2.0** - Latest React with enhanced performance and features
- **Vite 7.2.4** - Lightning-fast build tool and dev server
- **React Router DOM 7.12.0** - Client-side routing with data loading

### State Management & Data Fetching
- **TanStack Query 5.90.18** - Powerful asynchronous state management
- **Zustand 5.0.10** - Lightweight state management for auth
- **Axios 1.13.2** - Promise-based HTTP client

### Form Management
- **React Hook Form 7.71.1** - Performant form validation
- **Zod 4.3.5** - TypeScript-first schema validation
- **@hookform/resolvers 5.2.2** - Validation schema integration

### UI & Styling
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Lucide React 0.562.0** - Beautiful icon library (1000+ icons)
- **Recharts 3.6.0** - Composable charting library
- **GSAP 3.14.2** - Professional-grade animation
- **clsx 2.1.1** & **tailwind-merge 3.4.0** - Conditional class management

### Development Tools
- **ESLint 9.39.1** - Code linting with React-specific rules
- **date-fns 4.1.0** - Modern date utility library
- **Vite React Plugin** - Fast refresh and JSX support

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/faisalirshadkhan8/syncQ.git
   cd syncQ/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_APP_NAME=SyncQ
   VITE_APP_ENV=development
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

---

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

Build output will be in `dist/` directory:
- **Size**: ~355 KB (gzipped)
- **Optimized**: Minified and tree-shaken
- **Ready**: For deployment to any static hosting

### Preview Production Build

```bash
npm run preview
```

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
```

---

## 🧪 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

### Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # React components
│   │   ├── domain/      # Feature-specific components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route pages
│   │   ├── ai/          # AI tool pages
│   │   ├── applications/# Application pages
│   │   ├── auth/        # Authentication pages
│   │   ├── companies/   # Company pages
│   │   ├── interviews/  # Interview pages
│   │   ├── resumes/     # Resume pages
│   │   ├── webhooks/    # Webhook pages
│   │   └── exports/     # Export pages
│   ├── services/        # API service layer
│   ├── stores/          # Zustand stores
│   ├── styles/          # Global styles
│   └── utils/           # Utility functions
├── docs/                # Documentation
├── index.html           # Entry HTML
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── eslint.config.js     # ESLint configuration
└── package.json         # Dependencies
```

### Code Quality

- ✅ **Zero Lint Errors** - Production-ready codebase
- ✅ **ESLint 9** - Latest ESLint with React rules
- ✅ **Clean Architecture** - Separation of concerns
- ✅ **Type Safety** - Zod schema validation

---

## 🔌 API Integration

SyncQ connects to a Django REST Framework backend. See [FRONTEND_API_DOCUMENTATION.md](docs/FRONTEND_API_DOCUMENTATION.md) for complete API reference.

### Base Configuration

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Key Endpoints

- **Auth**: `/auth/login/`, `/auth/register/`, `/auth/2fa/setup/`
- **Applications**: `/applications/`, `/applications/{id}/`
- **Companies**: `/companies/`, `/companies/{id}/`
- **Interviews**: `/interviews/`, `/interviews/calendar/`
- **AI**: `/ai/cover-letter/`, `/ai/job-match/`, `/ai/interview-questions/`
- **Analytics**: `/analytics/dashboard/`, `/analytics/funnel/`

---

## 🎨 UI Components

### Design System

SyncQ uses a custom-built design system with:

- **Consistent Spacing** - 8px grid system
- **Typography** - Inter font family with responsive scaling
- **Color Palette** - Teal brand colors with semantic variants
- **Components** - 15+ reusable UI components
- **Animations** - GSAP-powered smooth transitions

### Component Library

```jsx
// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// Card component
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>

// Modal
<Modal isOpen={isOpen} onClose={onClose} title="Title">
  Content
</Modal>
```

---

## 🔐 Authentication Flow

### Registration
1. User submits registration form
2. Backend creates account and sends verification email
3. User clicks verification link
4. Account activated → Login

### Login with 2FA
1. User enters email/password
2. Backend validates credentials
3. If 2FA enabled → Show 6-digit code input
4. User enters TOTP code
5. Backend verifies → JWT token issued
6. User redirected to dashboard

### Password Reset
1. User requests password reset
2. Backend sends reset email with token
3. User clicks link, enters new password
4. Backend validates token and updates password

---

## 📊 Features Roadmap

### Current Version (v1.0)
- ✅ Application tracking
- ✅ Interview management
- ✅ Company profiles
- ✅ AI-powered tools
- ✅ Analytics dashboard
- ✅ 2FA security
- ✅ Email verification
- ✅ Webhook integrations
- ✅ Data exports

### Upcoming Features (v1.1)
- [ ] Mobile app (React Native)
- [ ] Browser extension for quick saves
- [ ] LinkedIn integration
- [ ] Email tracking (application status updates)
- [ ] Team collaboration features
- [ ] Custom fields and tags
- [ ] Advanced search and filters
- [ ] Dark mode

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and patterns
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure `npm run lint` passes

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**Faisal Irshad Khan**
- GitHub: [@faisalirshadkhan8](https://github.com/faisalirshadkhan8)
- Repository: [syncQ](https://github.com/faisalirshadkhan8/syncQ)

---

## 🙏 Acknowledgments

- React team for React 19
- Vite team for incredible build tooling
- TanStack team for React Query
- Tailwind Labs for Tailwind CSS
- Lucide team for beautiful icons
- Open source community

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/faisalirshadkhan8/syncQ/issues)
- **Discussions**: [GitHub Discussions](https://github.com/faisalirshadkhan8/syncQ/discussions)

---

<div align="center">

**Built with ❤️ using React 19 and modern web technologies**

[⬆ Back to Top](#-syncq---job-application-tracker)

</div>
