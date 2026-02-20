# 🚀 Hirenix Backend

> **Next-Gen AI Career Acceleration Platform - API & Services**
> _Powered by FastAPI, Supabase (pgvector), and OpenAI GPT-4o._

The backend of Hirenix manages core business logic, AI operations, and data persistence. It exposes a fast, modern RESTful API for the frontend client, handling tasks from resume NLP to GitHub portfolio analysis and mock interview generation.

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.11)
- **Data Validation**: Pydantic
- **AI/NLP**: OpenAI GPT-4o, spaCy (`en_core_web_sm`), Sentence-Transformers
- **Database**: Supabase (PostgreSQL 15) with `pgvector` extension
- **Integration**: GitHub REST API
- **Server**: Uvicorn

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Supabase Account (with configured pgvector schema)
- OpenAI API Key
- GitHub Personal Access Token

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Download the required spaCy model:
   ```bash
   python -m spacy download en_core_web_sm
   ```

5. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required keys:
   ```bash
   cp .env.example .env
   ```
   *Required keys include `SUPABASE_URL`, `SUPABASE_KEY`, `OPENAI_API_KEY`, and `GITHUB_TOKEN`.*

6. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000). You can view the interactive API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

## 📁 Project Structure

- `main.py`: Application entry point and FastAPI app initialization.
- `routers/`: API route definitions (controllers).
- `services/`: Core business logic, integrating with OpenAI, GitHub, etc.
- `models/`: Pydantic models for request/response validation.
- `utils/`: Helper functions and shared utilities.
- `config.py`: Environment variable loading and configuration management.
- `dependencies.py`: FastAPI dependencies (e.g., authentication, database connections).

## 🤝 Contributing

Contributions to the backend are welcome! Please follow the main repository's contribution guidelines.
