-- 수동으로 실행해야 하는 마이그레이션 SQL
-- 실행일: 2025-07-26
-- 목적: 평가를 수행한 사용자 정보 추가

-- Add evaluatedByUser column to Evaluation table
ALTER TABLE "Evaluation" ADD COLUMN "evaluatedByUser" TEXT;

-- Create index on evaluatedByUser column
CREATE INDEX "Evaluation_evaluatedByUser_idx" ON "Evaluation"("evaluatedByUser");

-- 참고: 이 마이그레이션 후 새로운 평가부터 사용자 정보가 저장됩니다.
-- 기존 평가 데이터는 evaluatedByUser가 NULL로 남아있게 됩니다.