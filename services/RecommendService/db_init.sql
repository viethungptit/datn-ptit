CREATE EXTENSION IF NOT EXISTS vector;

-- Embedding for CV
CREATE TABLE IF NOT EXISTS embedding_cv (
    cv_id UUID NOT NULL PRIMARY KEY,
    origin_text TEXT,
    raw_text TEXT,
    embedding_vector VECTOR (1536),
    created_at TIMESTAMP DEFAULT now()
);

-- Embedding for JD
CREATE TABLE IF NOT EXISTS embedding_jd (
    job_id UUID NOT NULL PRIMARY KEY,
    origin_text TEXT,
    raw_text TEXT,
    embedding_vector VECTOR (1536),
    created_at TIMESTAMP DEFAULT now()
);

-- AI suggestions

CREATE TABLE IF NOT EXISTS ai_suggestions (
    suggestion_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    section_name VARCHAR(255),
    original_content TEXT,
    suggested_content TEXT,
    style_used TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    job_id UUID NOT NULL,
    cv_id UUID NOT NULL,
    apply_status VARCHAR(50) NOT NULL CHECK (apply_status IN ('pending', 'approved', 'rejected')),
    applied_at TIMESTAMP DEFAULT now()
);

-- Recommendation batches
CREATE TABLE IF NOT EXISTS recommend_batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    job_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Recommendation results
CREATE TABLE IF NOT EXISTS recommend_results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    batch_id UUID NOT NULL REFERENCES recommend_batches (batch_id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications (application_id) ON DELETE CASCADE,
    score FLOAT,
    created_at TIMESTAMP DEFAULT now()
);

-- Indexes for vector search
CREATE INDEX IF NOT EXISTS idx_cv_embedding_vector ON embedding_cv USING ivfflat (
    embedding_vector vector_cosine_ops
);

CREATE INDEX IF NOT EXISTS idx_jd_embedding_vector ON embedding_jd USING ivfflat (
    embedding_vector vector_cosine_ops
);