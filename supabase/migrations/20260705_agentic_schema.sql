-- ============================================================
-- Hirenix v2 — Agentic AI Foundation Schema
-- ============================================================

-- Table for LangGraph state checkpointers
CREATE TABLE IF NOT EXISTS public.agent_checkpoints (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    parent_checkpoint_id TEXT,
    checkpoint JSONB NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_checkpoints_parent ON public.agent_checkpoints(thread_id, checkpoint_ns, parent_checkpoint_id);

-- Table for pending task writes (for LangGraph operations)
CREATE TABLE IF NOT EXISTS public.agent_checkpoint_writes (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    idx INT NOT NULL,
    channel TEXT NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);

-- Table for persistent chat history
CREATE TABLE IF NOT EXISTS public.agent_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    thread_id TEXT NOT NULL,
    sender TEXT NOT NULL,          -- 'user' | 'assistant' | 'ResumeAgent' etc.
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_thread ON public.agent_conversations(thread_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user ON public.agent_conversations(user_id);

-- Table for human-in-the-loop approvals
CREATE TABLE IF NOT EXISTS public.agent_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    thread_id TEXT NOT NULL,
    approval_type TEXT NOT NULL,   -- 'resume_modification' | 'resume_tailoring' | 'outreach_draft'
    draft_content JSONB NOT NULL,  -- Content that needs review (e.g. text or structured JSON)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'modified')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_approvals_user ON public.agent_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_approvals_status ON public.agent_approvals(status);

-- Enable RLS
ALTER TABLE public.agent_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_checkpoint_writes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_approvals ENABLE ROW LEVEL SECURITY;

-- Create direct RLS policies (since user_id is easily map-able)
-- For checkpoints, we use user_id prefix if thread_id is formatted as "user_id:thread_name"
CREATE POLICY "own checkpoints" ON public.agent_checkpoints 
    FOR ALL USING (auth.uid()::text = split_part(thread_id, ':', 1));

CREATE POLICY "own checkpoint writes" ON public.agent_checkpoint_writes 
    FOR ALL USING (auth.uid()::text = split_part(thread_id, ':', 1));

CREATE POLICY "own conversations" ON public.agent_conversations 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own approvals" ON public.agent_approvals 
    FOR ALL USING (auth.uid() = user_id);
