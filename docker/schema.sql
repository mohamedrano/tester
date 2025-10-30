CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY,
  agent_id TEXT NOT NULL,
  test_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY,
  agent_run_id UUID REFERENCES agent_runs(id),
  passed INTEGER NOT NULL,
  failed INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
