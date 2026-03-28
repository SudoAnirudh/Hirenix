# Supabase Setup

This directory contains the database schema for Hirenix. Run these steps once when setting up a new environment.

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon/service_role keys** from **Settings → API**.

---

## 2. Set Environment Variables

**`frontend/.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**`backend/.env`**

```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## 3. Run the Schema

In your Supabase dashboard, go to **SQL Editor** and run the entire contents of [`schema.sql`](./schema.sql).

This will create:
| Resource | Description |
|---|---|
| `profiles` | User profile data (extends Supabase Auth) |
| `resumes` | Uploaded resumes with ATS scores, breakdown, and feedback |
| `resume_sections` | Parsed resume sections (education, skills, etc.) |
| `job_matches` | JD matching results |
| `github_analyses` | GitHub profile analysis |
| `interview_sessions` | Mock interview sessions |
| `interview_answers` | Per-question answers and scores |
| `storage.resumes` | Private storage bucket for uploaded PDF files |

> **Note:** The schema enables **Row Level Security (RLS)** on all tables — users can only access their own data.

---

## 4. Enable pgvector

The schema runs `CREATE EXTENSION IF NOT EXISTS vector` automatically. If it fails, enable it manually under **Database → Extensions → pgvector**.

---

## 5. Verify

After running the schema, confirm in **Table Editor** that all tables exist and the `resumes` storage bucket appears under **Storage**.
