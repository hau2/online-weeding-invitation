-- Agent Tier: adds tier and subscription columns to users table
-- tier is orthogonal to role: role controls admin access (user/admin),
-- tier controls subscription level (user/agent)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'user'
    CHECK (tier IN ('user', 'agent'));

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ DEFAULT NULL;

-- Partial index: only index non-default tier values for fast agent lookups
CREATE INDEX IF NOT EXISTS idx_users_tier ON public.users(tier) WHERE tier != 'user';
