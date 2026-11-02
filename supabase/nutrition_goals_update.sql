-- Eden Strong — editable calorie goal with an automatic macro balance
-- Adds the macro percentages so protein, carbs, and fat follow the calorie
-- goal whenever a member changes it. Safe to run again.
alter table nutrition_goals add column if not exists protein_pct int;
alter table nutrition_goals add column if not exists carbs_pct int;
alter table nutrition_goals add column if not exists fat_pct int;
