# 🚀 Hirenix Frontend

> **Next-Gen AI Career Acceleration Platform - Client Application**
> _Built with Next.js 14, Tailwind CSS, and Supabase._

The frontend of Hirenix is a modern, responsive single-page application built on top of the Next.js App Router. It provides an intuitive interface for users to upload resumes, analyze GitHub portfolios, and practice mock interviews.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI + Tailwind)
- **Icons**: Lucide Icons
- **Charts**: Recharts
- **Authentication**: Supabase Auth

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase project for authentication

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.local.example` to `.env.local` and add your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```
   *Note: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are properly configured.*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components.
- `lib/`: Utility functions and validation schemas.
- `public/`: Static assets like images and fonts.
- `styles/`: Global CSS and Tailwind configuration.

## 🤝 Contributing

Contributions to the frontend are welcome! Please follow the main repository's contribution guidelines.
