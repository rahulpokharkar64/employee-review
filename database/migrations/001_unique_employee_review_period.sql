BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM performance_reviews
        GROUP BY employee_id, period_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Cannot add review uniqueness: duplicate employee_id/period_id pairs exist.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_performance_reviews_employee_period'
          AND conrelid = 'performance_reviews'::regclass
    ) THEN
        ALTER TABLE performance_reviews
            ADD CONSTRAINT uq_performance_reviews_employee_period
            UNIQUE (employee_id, period_id);
    END IF;
END
$$;

COMMIT;
