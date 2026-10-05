-- ==============================================================================
-- NAILED IT PROPERTY SOLUTIONS - SUPABASE MIGRATION
-- Migration Name: 20261005_add_work_agreement_payment_fields.sql
-- Description: Adds payment amount due now, schedule note, remaining balance,
--              and lossless JSONB raw column to public.work_agreements.
-- ==============================================================================

-- 1. Add payment amount due now upon contract execution (default $0.00)
ALTER TABLE public.work_agreements 
ADD COLUMN IF NOT EXISTS amount_due_now NUMERIC(12, 2) DEFAULT 0;

-- 2. Add optional schedule note / milestone reason (e.g. Upfront materials procurement)
ALTER TABLE public.work_agreements 
ADD COLUMN IF NOT EXISTS due_now_description TEXT;

-- 3. Add remaining balance due upon substantial completion
ALTER TABLE public.work_agreements 
ADD COLUMN IF NOT EXISTS balance_due_upon_completion NUMERIC(12, 2) DEFAULT 0;

-- 4. Add raw JSONB payload column for future-proof lossless syncing
ALTER TABLE public.work_agreements 
ADD COLUMN IF NOT EXISTS raw JSONB;

-- 5. Backfill existing agreements so balance_due_upon_completion equals balance_due
UPDATE public.work_agreements 
SET balance_due_upon_completion = balance_due 
WHERE balance_due_upon_completion IS NULL OR balance_due_upon_completion = 0;

-- Verification query (confirm columns are present)
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'work_agreements' 
  AND column_name IN ('amount_due_now', 'due_now_description', 'balance_due_upon_completion', 'raw');
