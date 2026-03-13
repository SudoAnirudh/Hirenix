# AI Mock Interview Workflow

This document reframes the Hirenix interview feature as a self-evaluation and coaching system, not a strict hiring exam. The platform should help users practice for role-specific interviews, receive structured feedback, and track improvement over time. Optional proctoring can remain available as a practice integrity aid, but it should not define the core experience.

## Product Direction

The target product is:

- AI-guided interview practice
- Role-specific question generation
- Structured answer evaluation
- Coaching-oriented feedback
- Skill-gap analysis and improvement tracking
- Optional proctoring, not mandatory enforcement

The current implementation already supports:

- Interview setup
- Question generation
- Answer submission and scoring
- Pre-interview device checks
- Webcam and mic monitoring
- Final trust-score reporting

The main gap is that the existing flow is proctoring-first and uses rule-based interview logic. The target flow should be coaching-first and AI-driven.

## Relevant Files

- [Mock interview page](/home/anirudhs/Documents/Boredom/Hirenix/frontend/app/dashboard/mock-interview/page.tsx)
- [Interview panel](/home/anirudhs/Documents/Boredom/Hirenix/frontend/components/InterviewPanel.tsx)
- [Proctor provider](/home/anirudhs/Documents/Boredom/Hirenix/frontend/components/interview/ProctorProvider.tsx)
- [Pre-interview checks](/home/anirudhs/Documents/Boredom/Hirenix/frontend/components/interview/PreInterviewChecks.tsx)
- [Proctor toolbar](/home/anirudhs/Documents/Boredom/Hirenix/frontend/components/interview/ProctorToolbar.tsx)
- [Webcam monitor](/home/anirudhs/Documents/Boredom/Hirenix/frontend/components/interview/WebcamMonitor.tsx)
- [Trust score report](/home/anirudhs/Documents/Boredom/Hirenix/frontend/components/interview/TrustScoreReport.tsx)
- [Interview routes](/home/anirudhs/Documents/Boredom/Hirenix/backend/routers/interview.py)
- [Interview models](/home/anirudhs/Documents/Boredom/Hirenix/backend/models/interview.py)
- [Interview engine](/home/anirudhs/Documents/Boredom/Hirenix/backend/services/interview_engine.py)

## Current State Summary

Today the system behaves like this:

1. User enters `resume_id`, role, difficulty, and question count.
2. Backend generates a fixed question mix from static pools.
3. User answers questions one by one.
4. Backend applies heuristic scoring for each answer.
5. Optional proctoring tracks browser/device violations and face presence.
6. Final report combines answer feedback with a trust-style report.

This is functional, but the product messaging and UX currently lean too heavily toward proctoring. For a mock interview product, the system should emphasize interview simulation, answer coaching, and improvement guidance.

## Target Workflow

## 1. Interview Setup

The setup screen should let the user choose the kind of practice session they want.

### Target inputs

- Preferred role
- Experience level
- Interview type
- Difficulty level
- Number of questions
- Answer mode
- Optional AI proctoring toggle
- Optional resume selection

### Suggested frontend state

```tsx
const [role, setRole] = useState("Frontend Developer");
const [experienceLevel, setExperienceLevel] = useState("junior");
const [interviewType, setInterviewType] = useState("mixed");
const [difficulty, setDifficulty] = useState("medium");
const [numQuestions, setNumQuestions] = useState(5);
const [answerMode, setAnswerMode] = useState("text");
const [proctoring, setProctoring] = useState(false);
```

### Current status

- Implemented: role, difficulty, number of questions, resume ID, proctoring toggle
- Missing: experience level, interview type, answer mode, clearer coaching-first copy

### Main file

- [page.tsx](/home/anirudhs/Documents/Boredom/Hirenix/frontend/app/dashboard/mock-interview/page.tsx)

## 2. Interview Plan Generation

When the user starts, the backend should first generate a structured interview plan instead of directly returning a flat question list.

### Example plan

```json
{
  "role": "Backend Developer",
  "difficulty": "medium",
  "experience_level": "junior",
  "interview_type": "mixed",
  "num_questions": 5,
  "distribution": {
    "technical": 3,
    "system_design": 1,
    "behavioral": 1
  }
}
```

### Current status

- Partially implemented: simple technical/behavioral split exists in [interview_engine.py](/home/anirudhs/Documents/Boredom/Hirenix/backend/services/interview_engine.py)
- Missing: explicit plan object, system design support, experience-aware distribution, mixed-mode logic

## 3. AI Question Generation

Questions should be dynamically generated for the selected role, experience level, and interview type. Resume context should influence the question wording when a resume is available.

### Target question shape

```python
{
    "id": "q1",
    "type": "technical",
    "difficulty": "medium",
    "question": "Explain the difference between REST and GraphQL.",
    "expected_topics": ["API design", "REST", "GraphQL"],
    "follow_up_enabled": True,
}
```

### Current status

- Partially implemented: question generation exists
- Missing: LLM-backed generation, expected topics, follow-up metadata, role specialization beyond static pools

## 4. Interview Screen

The interview UI should feel like a guided practice session.

### Target layout

- Question panel
- Progress indicator
- Timer
- Answer area
- Optional webcam monitor
- Optional live coaching tips

### Current status

- Implemented: question panel, timer flow, webcam monitor, toolbar, final report
- Missing: explicit interview type context, coaching prompts, answer-mode aware controls

### Main files

- [page.tsx](/home/anirudhs/Documents/Boredom/Hirenix/frontend/app/dashboard/mock-interview/page.tsx)
- [InterviewPanel.tsx](/home/anirudhs/Documents/Boredom/Hirenix/frontend/components/InterviewPanel.tsx)

## 5. Candidate Answer Capture

The platform should support multiple answer modes.

### Required modes

- Text answer
- Voice answer with transcription
- Video response

### Current status

- Implemented: text-answer flow
- Missing: voice transcription pipeline, video-response flow, answer-mode switching

## 6. AI Answer Evaluation

Answer evaluation should use a structured rubric and return actionable coaching feedback.

### Target rubric

- Technical accuracy
- Depth
- Clarity
- Communication
- Problem solving

### Target response shape

```json
{
  "technical_score": 8.5,
  "depth_score": 7.8,
  "clarity_score": 8.2,
  "communication_score": 7.9,
  "problem_solving_score": 7.6,
  "overall_score": 8.1,
  "strengths": [
    "Clear explanation of REST principles",
    "Good comparison with GraphQL"
  ],
  "improvements": ["Explain caching differences", "Mention schema flexibility"],
  "model_answer": "..."
}
```

### Current status

- Partially implemented: heuristic scoring and structured feedback exist in [interview_engine.py](/home/anirudhs/Documents/Boredom/Hirenix/backend/services/interview_engine.py)
- Missing: LLM-based evaluation, problem-solving metric, richer model answers, evidence-based scoring

## 7. Real-Time Coaching

The product should optionally give live interview guidance during the session.

### Examples

- Answer structure hints
- Reminders to give examples
- Prompts to clarify tradeoffs
- Voice coaching on filler words and pacing

### Current status

- Not implemented

## 8. Progress Tracking During the Session

The user should always know where they are in the interview.

### UI elements

- Question number
- Progress bar
- Time spent
- Completed answers

### Current status

- Partially implemented through the interview flow
- Missing: more explicit session progress UX and coaching milestones

## 9. Final AI Interview Report

The final report should focus on learning outcomes first.

### Required sections

- Overall score
- Question-wise breakdown
- Strengths
- Improvement areas
- Model answers
- Recommended study topics
- Optional conduct report when proctoring is enabled

### Current status

- Implemented: score breakdown and trust-score report
- Missing: consolidated coaching report, learning-topic recommendations, question-wise model answers in the final dashboard

### Main file

- [TrustScoreReport.tsx](/home/anirudhs/Documents/Boredom/Hirenix/frontend/components/interview/TrustScoreReport.tsx)

## 10. AI Model Answers

Each question should include or generate a reference answer after the user submits their response.

### Current status

- Partially implemented as `model_answer_hint`
- Missing: full reference answers, role-specific exemplar responses, question-by-question comparison view

## 11. Skill Gap Analysis

The system should infer recurring weak areas across a session.

### Example output

- API design
- Database optimization
- System architecture
- Behavioral storytelling

### Current status

- Not implemented

## 12. Improvement Roadmap

The final report should convert weak areas into a concrete next-step plan.

### Example output

- Practice REST API design questions
- Review caching and idempotency
- Improve structured storytelling with STAR format

### Current status

- Not implemented

## 13. Interview History Dashboard

Users should be able to revisit previous practice sessions.

### Dashboard fields

- Role
- Interview type
- Date
- Score
- Weak areas
- Trend versus previous attempt

### Current status

- Partially implemented at the data layer through `interview_sessions`
- Missing: dedicated frontend history page and analytics-oriented backend responses

## 14. Personal Skill Analytics

The system should show score improvement over time by skill area.

### Target metrics

- Technical score trend
- Communication score trend
- Confidence or speaking trend
- Topic-level weakness frequency

### Current status

- Not implemented

## Optional Integrity Features

For a mock interview product, proctoring should be framed as optional practice realism, not exam enforcement.

### Features that can remain

- Camera and microphone checks
- Webcam preview
- Fullscreen mode
- Face presence monitoring
- Attention signals
- Final session integrity summary

### Recommended product positioning

- "Practice with focus mode"
- "Optional attention tracking"
- "Session integrity insights"

Avoid positioning this as:

- anti-cheat enforcement
- pass/fail monitoring
- strict candidate screening

## Current Backend Contract

The backend currently exposes:

- `POST /interview/start-interview`
- `POST /interview/submit-answer`
- `POST /interview/save-proctor-report`

### Current request model

```python
class StartInterviewRequest(BaseModel):
    resume_id: str
    target_role: str
    difficulty: str = "medium"
    num_questions: int = 5
```

### Recommended next version

```python
class StartInterviewRequest(BaseModel):
    resume_id: str | None = None
    target_role: str
    experience_level: str = "junior"
    interview_type: str = "mixed"
    difficulty: str = "medium"
    num_questions: int = 5
    answer_mode: str = "text"
    proctoring_enabled: bool = False
```

## Recommended Implementation Roadmap

## Phase 1: Reposition the Product

- Update setup-screen copy from "AI-Proctored Interview" to "AI Mock Interview"
- Make proctoring optional and secondary
- Add interview type and experience level to the UI
- Keep the current text-answer flow working

## Phase 2: Improve Interview Intelligence

- Add an interview-plan layer before question generation
- Expand categories to technical, behavioral, and system design
- Add expected topics to each question
- Replace heuristic generation with LLM-backed generation when available

## Phase 3: Improve Feedback Quality

- Expand the evaluation rubric
- Return stronger model answers
- Add skill-gap clustering
- Add session-level improvement recommendations

## Phase 4: Add Practice Analytics

- Build interview history
- Build trend dashboards
- Track repeated weakness patterns
- Show improvement over time

## Recommended Immediate Changes for Hirenix

If the goal is to adapt the current system with minimal disruption, these are the highest-value next steps:

1. Update the setup flow to include `experienceLevel`, `interviewType`, and `answerMode`.
2. Rename the interview page and report copy to emphasize practice and coaching.
3. Introduce an interview-plan object in the backend before generating questions.
4. Extend question categories to include `system_design`.
5. Upgrade answer feedback to include stronger model answers and session-level recommendations.
6. Treat proctoring data as optional supporting context in the final report.

## Target End-to-End Flow

```text
Setup Interview
  -> Generate Interview Plan
  -> Generate Questions
  -> Capture Answer
  -> Evaluate Answer
  -> Optional Coaching Hint
  -> Next Question
  -> Final Report
  -> Skill Gap Analysis
  -> Improvement Roadmap
```

## Conclusion

Hirenix already has a useful base for mock interviews, but the current system is shaped like a protected interview tool. The next iteration should shift the experience toward AI-guided practice, better question generation, richer evaluation, and longitudinal skill improvement, while keeping proctoring as an optional realism feature instead of the product core.
