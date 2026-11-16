-- Eden Strong: Fearfully Made (gym, 5 days) and Strength & Dignity (home, 7 days)
-- Fearfully Made is under Experienced. Strength & Dignity is its own At home choice (no level).
-- Both show only in Eden Strong (edition = 'women').
-- Safe to run again: it replaces any earlier copy of these two programs.

alter table workout_programs  add column if not exists guide text;
alter table workout_programs  add column if not exists track text;
alter table workout_programs  add column if not exists level_key text;
alter table workout_programs  add column if not exists location text default 'gym';
alter table workout_programs  add column if not exists edition text;
alter table program_days      add column if not exists day_label text;
alter table program_days      add column if not exists rest_note text;
alter table program_exercises add column if not exists note text;
alter table program_exercises add column if not exists section text default 'workout';

delete from workout_programs where title like 'Fearfully Made -%' or title like 'Strength & Dignity -%';

do $$
declare
  prog uuid;
  d uuid;
begin

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values ($q$Fearfully Made - 5 Days (Gym)$q$, $q$I will praise thee; for I am fearfully and wonderfully made (Psalm 139:14). A five-day gym split: glutes, shoulders and back, core and cardio, quads and core, and chest and arms. Mobility to start, strength and supersets in the middle, cardio and stretching to finish.$q$, 8, 5, 'Experienced', 60, $q$Fearfully Made$q$, 'experienced', 'gym', 'women', $q$Supersets: do one set of each exercise in the group back to back, rest 60-90 seconds, and repeat for the rounds listed.

Reps like 12-8: start lighter for 12, then add weight each set as the reps drop toward 8.

Cluster set: one set of the main lift where you rest 10-15 seconds every few reps so you can finish all of them with good form.

AMRAP: as many good reps as you can.

Effort: finish most sets with 1-3 good reps left in the tank.$q$) returning id into prog;

  insert into program_days (program_id, day_number, day_label, title) values (prog, 1, 'Monday', $q$Glutes$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Floor to Ceiling$q$, 1, $q$30 sec$q$, null, 'warmup', null, 1),
    (d, $q$Alt Side Lunge$q$, 1, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Alt Low Runners Lunge$q$, 1, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Standing Open the Gate$q$, 2, $q$30 sec$q$, null, 'mobility', null, 4),
    (d, $q$Cat Cow$q$, 1, $q$30 sec$q$, null, 'mobility', null, 5),
    (d, $q$Foam Roll Glutes$q$, 2, $q$30 sec$q$, null, 'mobility', null, 6),
    (d, $q$Foam Roll Hamstrings$q$, 2, $q$30 sec$q$, null, 'mobility', null, 7),
    (d, $q$Barbell Sumo Squat$q$, 3, $q$12-8$q$, null, 'workout', null, 8),
    (d, $q$Barbell Sumo Squat (Cluster Set)$q$, 1, $q$8$q$, null, 'workout', null, 9),
    (d, $q$Smith Machine Alt Reverse Lunge$q$, 3, $q$12-8$q$, null, 'workout', null, 10),
    (d, $q$Smith Machine Reverse Lunge Pulse$q$, 1, $q$12$q$, null, 'workout', null, 11),
    (d, $q$Barbell RDL$q$, 3, $q$12$q$, null, 'workout', 'A', 12),
    (d, $q$DB Single Leg Deadlift$q$, 3, $q$12 each leg$q$, null, 'workout', 'A', 13),
    (d, $q$DB Single Leg Step Up$q$, 3, $q$12 each leg$q$, null, 'workout', 'B', 14),
    (d, $q$Seated Calf Raise Machine$q$, 3, $q$15$q$, null, 'workout', 'B', 15),
    (d, $q$DB Hip Thrust$q$, 3, $q$12$q$, null, 'workout', 'C', 16),
    (d, $q$DB Single Leg Hip Thrust$q$, 3, $q$10 each leg$q$, null, 'workout', 'C', 17),
    (d, $q$DB Toe Taps$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 18),
    (d, $q$Squat Knee Drive$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 19),
    (d, $q$Burpees$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 20),
    (d, $q$Pop Squat$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 21),
    (d, $q$Stairmaster$q$, 1, $q$30 min$q$, null, 'cardio', null, 22),
    (d, $q$Standing Hamstring Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 23),
    (d, $q$Kneeling Hip Flexor Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 24),
    (d, $q$Glute Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 25),
    (d, $q$Lying Spinal Twist$q$, 2, $q$30 sec$q$, null, 'stretch', null, 26);

  insert into program_days (program_id, day_number, day_label, title) values (prog, 2, 'Tuesday', $q$Shoulders & Back$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Arm Circles$q$, 1, $q$30 sec$q$, null, 'mobility', null, 1),
    (d, $q$Neck Circles$q$, 1, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Shoulder Dislocation$q$, 1, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Child's Pose Alt Shoulder Stretch$q$, 1, $q$30 sec$q$, null, 'mobility', null, 4),
    (d, $q$Machine Assisted Wide Grip Pull Up$q$, 3, $q$AMRAP$q$, null, 'workout', null, 5),
    (d, $q$High Row Machine$q$, 3, $q$12-8$q$, null, 'workout', null, 6),
    (d, $q$Seated Cable Row$q$, 3, $q$12-8$q$, null, 'workout', null, 7),
    (d, $q$Seated Cable Row (Cluster Set)$q$, 1, $q$8$q$, null, 'workout', null, 8),
    (d, $q$Kneeling Smith Machine Shoulder Press$q$, 3, $q$12$q$, null, 'workout', 'A', 9),
    (d, $q$DB Single Arm Shoulder Press$q$, 3, $q$10 each arm$q$, null, 'workout', 'A', 10),
    (d, $q$DB Lateral Raise$q$, 3, $q$12$q$, null, 'workout', 'B', 11),
    (d, $q$DB Single Arm Lateral Raise$q$, 3, $q$10 each arm$q$, null, 'workout', 'B', 12),
    (d, $q$Single Arm Cable Lat Pulldown$q$, 3, $q$12 each arm$q$, null, 'workout', 'C', 13),
    (d, $q$Standing Cable Front Raise$q$, 3, $q$12$q$, null, 'workout', 'C', 14),
    (d, $q$DB Single Arm Bent Over Row$q$, 1, $q$AMRAP$q$, null, 'workout', null, 15),
    (d, $q$DB Lateral to Front Raise$q$, 1, $q$AMRAP$q$, null, 'workout', null, 16),
    (d, $q$Weighted Ball Throws$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 17),
    (d, $q$Burpees$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 18),
    (d, $q$Mountain Climber$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 19),
    (d, $q$Squat Jumps$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 20),
    (d, $q$Rowing Machine$q$, 1, $q$30 min$q$, null, 'cardio', null, 21),
    (d, $q$Back Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 22),
    (d, $q$Standing Shoulder Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 23),
    (d, $q$Child's Pose$q$, 1, $q$30 sec$q$, null, 'stretch', null, 24),
    (d, $q$Child's Pose with Side Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 25);

  insert into program_days (program_id, day_number, day_label, title) values (prog, 3, 'Wednesday', $q$Core & Cardio$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Neck Circles$q$, 1, $q$30 sec$q$, null, 'mobility', null, 1),
    (d, $q$Floor to Ceiling$q$, 1, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Alt Side Lunge$q$, 1, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Alt Low Runners Lunge$q$, 1, $q$30 sec$q$, null, 'mobility', null, 4),
    (d, $q$Cat Cow$q$, 1, $q$30 sec$q$, null, 'mobility', null, 5),
    (d, $q$Stairmaster$q$, 1, $q$5 min$q$, null, 'warmup', null, 6),
    (d, $q$Cable Crunch$q$, 4, $q$15$q$, null, 'workout', 'A', 7),
    (d, $q$Leg Raises$q$, 4, $q$15$q$, null, 'workout', 'A', 8),
    (d, $q$Cross Climber$q$, 4, $q$30 sec$q$, null, 'workout', 'A', 9),
    (d, $q$Knee Tucks$q$, 4, $q$15$q$, null, 'workout', 'A', 10),
    (d, $q$Battle Ropes$q$, 4, $q$30 sec$q$, null, 'workout', 'A', 11),
    (d, $q$Treadmill Sprint Intervals$q$, 1, $q$10 min$q$, $q$Alternate 30 seconds fast with 60 seconds easy.$q$, 'cardio', null, 12),
    (d, $q$Stairmaster$q$, 1, $q$10 min$q$, null, 'cardio', null, 13),
    (d, $q$Standing Side Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 14),
    (d, $q$Kneeling Hip Flexor Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 15),
    (d, $q$Knee to Chest Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 16),
    (d, $q$Child's Pose$q$, 1, $q$30 sec$q$, null, 'stretch', null, 17),
    (d, $q$Child's Pose with Side Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 18);

  insert into program_days (program_id, day_number, day_label, title) values (prog, 4, 'Thursday', $q$Quads & Core$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Alt Side Lunge$q$, 1, $q$30 sec$q$, null, 'mobility', null, 1),
    (d, $q$Forward Leg Swings$q$, 2, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Lateral Leg Swings$q$, 2, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Alt Low Runners Lunge$q$, 1, $q$30 sec$q$, null, 'mobility', null, 4),
    (d, $q$Cat Cow$q$, 1, $q$30 sec$q$, null, 'mobility', null, 5),
    (d, $q$Foam Roll Quads$q$, 2, $q$30 sec$q$, null, 'mobility', null, 6),
    (d, $q$Hack Squat$q$, 3, $q$12-8$q$, null, 'workout', null, 7),
    (d, $q$Hack Squat (Cluster Set)$q$, 1, $q$8$q$, null, 'workout', null, 8),
    (d, $q$Narrow Stance Leg Press$q$, 3, $q$12-8$q$, null, 'workout', null, 9),
    (d, $q$DB Bulgarian Split Squat$q$, 3, $q$12 each leg$q$, null, 'workout', null, 10),
    (d, $q$Leg Extension$q$, 3, $q$12$q$, null, 'workout', 'A', 11),
    (d, $q$Single Leg Extension$q$, 3, $q$10 each leg$q$, null, 'workout', 'A', 12),
    (d, $q$High Plank Kickback$q$, 3, $q$12 each leg$q$, null, 'workout', 'B', 13),
    (d, $q$Leg Raises$q$, 3, $q$15$q$, null, 'workout', 'B', 14),
    (d, $q$Wall Sit$q$, 1, $q$1 min$q$, null, 'workout', null, 15),
    (d, $q$Side Shuffle$q$, 2, $q$30 sec$q$, null, 'workout', 'C', 16),
    (d, $q$Star Jump$q$, 2, $q$30 sec$q$, null, 'workout', 'C', 17),
    (d, $q$Squat Jump with 2 Pulses$q$, 2, $q$30 sec$q$, null, 'workout', 'C', 18),
    (d, $q$Plank Shoulder Taps$q$, 2, $q$30 sec$q$, null, 'workout', 'C', 19),
    (d, $q$Stairmaster$q$, 1, $q$30 min$q$, null, 'cardio', null, 20),
    (d, $q$Downward Dog Pedal$q$, 1, $q$30 sec$q$, null, 'stretch', null, 21),
    (d, $q$Kneeling Quad Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 22),
    (d, $q$Standing Side Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 23),
    (d, $q$Butterfly Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 24);

  insert into program_days (program_id, day_number, day_label, title) values (prog, 5, 'Friday', $q$Chest & Arms$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Arm Circles$q$, 1, $q$30 sec$q$, null, 'mobility', null, 1),
    (d, $q$Chest Opener$q$, 1, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Shoulder Dislocation$q$, 1, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Child's Pose Alt Shoulder Stretch$q$, 1, $q$30 sec$q$, null, 'mobility', null, 4),
    (d, $q$Warm Up Push Up$q$, 3, $q$20$q$, null, 'workout', null, 5),
    (d, $q$DB Bench Press Close Grip$q$, 3, $q$12-8$q$, null, 'workout', null, 6),
    (d, $q$Seated Chest Fly Machine$q$, 3, $q$12-8$q$, null, 'workout', null, 7),
    (d, $q$Barbell Skull Crusher$q$, 3, $q$12-8$q$, null, 'workout', null, 8),
    (d, $q$Preacher Curl Machine$q$, 3, $q$12$q$, null, 'workout', 'A', 9),
    (d, $q$Tricep Pushdown Machine$q$, 3, $q$12$q$, null, 'workout', 'A', 10),
    (d, $q$Single Arm Cable Hercules Curl$q$, 3, $q$12$q$, null, 'workout', 'B', 11),
    (d, $q$DB Single Arm Tricep Kickback$q$, 3, $q$12 each arm$q$, null, 'workout', 'B', 12),
    (d, $q$Standing Cable Tricep Pushdown with Rope$q$, 3, $q$12$q$, null, 'workout', 'C', 13),
    (d, $q$Cable Bicep Curl with Rope$q$, 3, $q$12$q$, null, 'workout', 'C', 14),
    (d, $q$Seal Jack$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 15),
    (d, $q$Jump Rope$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 16),
    (d, $q$Cross Climber$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 17),
    (d, $q$High Knees$q$, 2, $q$30 sec$q$, null, 'workout', 'D', 18),
    (d, $q$Elliptical$q$, 1, $q$30 min$q$, null, 'cardio', null, 19),
    (d, $q$Between the Door Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 20),
    (d, $q$Standing Tricep Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 21),
    (d, $q$Bicep Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 22),
    (d, $q$Child's Pose$q$, 1, $q$30 sec$q$, null, 'stretch', null, 23),
    (d, $q$Child's Pose with Side Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 24);

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values ($q$Strength & Dignity - 7 Days (Home)$q$, $q$Strength and honour are her clothing (Proverbs 31:25). A full week you can do at home with dumbbells and a band: glutes and hamstrings, shoulders and arms, active rest, quads and calves, back and chest, legs, and a day of rest and recovery.$q$, 8, 7, 'At home', 61, $q$Strength & Dignity$q$, 'home', 'home', 'women', $q$You need: a few pairs of dumbbells, a mini band, a stability ball, and a bench or sturdy chair.

Supersets: do one set of each exercise in the group back to back, rest 60-90 seconds, and repeat for the rounds listed.

Drop set: right after your last set, pick up a lighter weight and do the reps again with no rest.

Cardio: no treadmill or elliptical? A brisk outdoor walk, walking uphill, or marching in place works.

Effort: finish most sets with 1-3 good reps left in the tank.$q$) returning id into prog;

  insert into program_days (program_id, day_number, day_label, title) values (prog, 1, 'Monday', $q$Glutes & Hamstrings$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Outdoor Walk$q$, 1, $q$5 min$q$, null, 'warmup', null, 1),
    (d, $q$Foam Roll Hamstrings$q$, 2, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Foam Roll Glutes$q$, 2, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Lateral Leg Swings$q$, 2, $q$30 sec$q$, null, 'mobility', null, 4),
    (d, $q$Windshield Wipers$q$, 1, $q$30 sec$q$, null, 'mobility', null, 5),
    (d, $q$Yogi Squat$q$, 1, $q$30 sec$q$, null, 'mobility', null, 6),
    (d, $q$DB Wide Squat$q$, 3, $q$10$q$, null, 'workout', null, 7),
    (d, $q$DB Sumo Deadlift$q$, 4, $q$10$q$, null, 'workout', null, 8),
    (d, $q$DB Hip Thrust$q$, 3, $q$10$q$, null, 'workout', null, 9),
    (d, $q$DB Hip Thrust (Drop Set)$q$, 1, $q$10$q$, null, 'workout', null, 10),
    (d, $q$DB Single Leg Deadlift$q$, 3, $q$12 each leg$q$, null, 'workout', null, 11),
    (d, $q$Stability Ball Hamstring Curl$q$, 3, $q$15$q$, null, 'workout', null, 12),
    (d, $q$Banded Standing Kickback$q$, 3, $q$15 each leg$q$, null, 'workout', 'A', 13),
    (d, $q$Seated Banded Abduction$q$, 3, $q$20$q$, null, 'workout', 'A', 14),
    (d, $q$Outdoor Walk$q$, 1, $q$20 min$q$, null, 'cardio', null, 15),
    (d, $q$Standing Hamstring Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 16),
    (d, $q$Downward Dog Pedal$q$, 1, $q$30 sec$q$, null, 'stretch', null, 17),
    (d, $q$Pigeon Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 18),
    (d, $q$Glute Stretch$q$, 2, $q$20-30 sec$q$, null, 'stretch', null, 19),
    (d, $q$Butterfly Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 20);

  insert into program_days (program_id, day_number, day_label, title) values (prog, 2, 'Tuesday', $q$Shoulders & Arms$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Outdoor Walk$q$, 1, $q$5 min$q$, null, 'warmup', null, 1),
    (d, $q$Neck Circles$q$, 1, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Arm Circles$q$, 1, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Banded Shoulder Dislocation$q$, 1, $q$30 sec$q$, null, 'mobility', null, 4),
    (d, $q$Child's Pose Alt Shoulder Stretch$q$, 1, $q$30 sec$q$, null, 'mobility', null, 5),
    (d, $q$Thread the Needle$q$, 2, $q$30 sec$q$, null, 'mobility', null, 6),
    (d, $q$Cat Cow$q$, 1, $q$30 sec$q$, null, 'mobility', null, 7),
    (d, $q$DB Seated Shoulder Press$q$, 4, $q$10$q$, null, 'workout', null, 8),
    (d, $q$DB Bent Arm Lateral Raise$q$, 4, $q$15$q$, null, 'workout', null, 9),
    (d, $q$DB Front Raise$q$, 3, $q$12$q$, null, 'workout', null, 10),
    (d, $q$DB Bicep Curl$q$, 3, $q$12$q$, null, 'workout', 'A', 11),
    (d, $q$DB Overhead Tricep Extension$q$, 3, $q$12$q$, null, 'workout', 'A', 12),
    (d, $q$DB Preacher Curl$q$, 3, $q$12$q$, null, 'workout', 'B', 13),
    (d, $q$DB Tricep Kickback$q$, 3, $q$12$q$, null, 'workout', 'B', 14),
    (d, $q$Elliptical$q$, 1, $q$20 min$q$, $q$No machine? Walk briskly outside or march in place.$q$, 'cardio', null, 15),
    (d, $q$Standing Shoulder Stretch$q$, 2, $q$1 min$q$, null, 'stretch', null, 16),
    (d, $q$Standing Tricep Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 17),
    (d, $q$Bicep Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 18),
    (d, $q$Child's Pose with Side Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 19);

  insert into program_days (program_id, day_number, day_label, title) values (prog, 3, 'Wednesday', $q$Active Rest & Cardio$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Alt Side Lunge$q$, 1, $q$30 sec$q$, null, 'mobility', null, 1),
    (d, $q$Forward Leg Swings$q$, 2, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Alt Low Runners Lunge$q$, 1, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Steady State Cardio$q$, 1, $q$30 min$q$, $q$A brisk walk, bike ride, or any cardio where you can still talk.$q$, 'cardio', null, 4),
    (d, $q$Standing Hamstring Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 5),
    (d, $q$Kneeling Hip Flexor Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 6),
    (d, $q$Cat Cow$q$, 1, $q$30 sec$q$, null, 'stretch', null, 7),
    (d, $q$Child's Pose$q$, 1, $q$30 sec$q$, null, 'stretch', null, 8),
    (d, $q$Butterfly Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 9);

  insert into program_days (program_id, day_number, day_label, title) values (prog, 4, 'Thursday', $q$Quads & Calves$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Treadmill Walk$q$, 1, $q$5 min$q$, $q$No machine? Walk briskly outside or march in place.$q$, 'warmup', null, 1),
    (d, $q$Foam Roll Quads$q$, 2, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Forward Leg Swings$q$, 2, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Downward Dog Pedal$q$, 1, $q$30 sec$q$, null, 'mobility', null, 4),
    (d, $q$Alt Low Runners Lunge$q$, 1, $q$30 sec$q$, null, 'mobility', null, 5),
    (d, $q$Cat Cow$q$, 1, $q$30 sec$q$, null, 'mobility', null, 6),
    (d, $q$DB Narrow Squat$q$, 4, $q$10$q$, null, 'workout', null, 7),
    (d, $q$DB Alt Reverse Lunge$q$, 3, $q$10 each leg$q$, null, 'workout', null, 8),
    (d, $q$Walking Lunge$q$, 3, $q$12 each leg$q$, null, 'workout', null, 9),
    (d, $q$DB Bulgarian Split Squat$q$, 3, $q$12 each leg$q$, null, 'workout', null, 10),
    (d, $q$DB Leg Extension$q$, 3, $q$12$q$, null, 'workout', null, 11),
    (d, $q$DB Leg Extension (Drop Set)$q$, 1, $q$12$q$, null, 'workout', null, 12),
    (d, $q$DB Calf Raises$q$, 4, $q$15$q$, null, 'workout', null, 13),
    (d, $q$Squatted Calf Raises$q$, 3, $q$20$q$, null, 'workout', null, 14),
    (d, $q$Incline Treadmill$q$, 1, $q$20 min$q$, $q$No treadmill? Walk uphill outside or do step-ups on a sturdy step.$q$, 'cardio', null, 15),
    (d, $q$Kneeling Hip Flexor Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 16),
    (d, $q$Kneeling Quad Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 17),
    (d, $q$Knee to Chest Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 18),
    (d, $q$Butterfly Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 19);

  insert into program_days (program_id, day_number, day_label, title) values (prog, 5, 'Friday', $q$Back & Chest (Back Focus)$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Elliptical$q$, 1, $q$5 min$q$, $q$No machine? Walk briskly outside or march in place.$q$, 'warmup', null, 1),
    (d, $q$Foam Roll Back$q$, 1, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Arm Circles$q$, 1, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Chest Opener$q$, 1, $q$30 sec$q$, null, 'mobility', null, 4),
    (d, $q$Floor to Ceiling$q$, 1, $q$30 sec$q$, null, 'mobility', null, 5),
    (d, $q$Cat Cow$q$, 1, $q$30 sec$q$, null, 'mobility', null, 6),
    (d, $q$DB Wide Row$q$, 3, $q$10$q$, null, 'workout', null, 7),
    (d, $q$DB Wide Row (Drop Set)$q$, 1, $q$10$q$, null, 'workout', null, 8),
    (d, $q$DB Pullover$q$, 4, $q$12$q$, null, 'workout', null, 9),
    (d, $q$DB Single Arm Bent Over Row (Bench)$q$, 3, $q$12 each arm$q$, null, 'workout', null, 10),
    (d, $q$DB Incline Chest Press$q$, 3, $q$12$q$, null, 'workout', null, 11),
    (d, $q$DB Reverse Fly$q$, 3, $q$15$q$, null, 'workout', null, 12),
    (d, $q$Lying Back Extension$q$, 3, $q$15$q$, null, 'workout', null, 13),
    (d, $q$Incline Treadmill$q$, 1, $q$20 min$q$, $q$No treadmill? Walk uphill outside or do step-ups on a sturdy step.$q$, 'cardio', null, 14),
    (d, $q$Between the Door Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 15),
    (d, $q$Back Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 16),
    (d, $q$Arms Behind Back Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 17),
    (d, $q$Child's Pose$q$, 1, $q$30 sec$q$, null, 'stretch', null, 18),
    (d, $q$Child's Pose with Side Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 19);

  insert into program_days (program_id, day_number, day_label, title) values (prog, 6, 'Saturday', $q$Legs$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Foam Roll Hamstrings$q$, 1, $q$30 sec$q$, null, 'mobility', null, 1),
    (d, $q$Foam Roll Glutes$q$, 1, $q$30 sec$q$, null, 'mobility', null, 2),
    (d, $q$Floor to Ceiling$q$, 1, $q$30 sec$q$, null, 'mobility', null, 3),
    (d, $q$Alt Side Lunge$q$, 1, $q$30 sec$q$, null, 'mobility', null, 4),
    (d, $q$Banded Lateral Squat Walks$q$, 1, $q$40 sec$q$, null, 'activation', null, 5),
    (d, $q$Glute Bridge$q$, 1, $q$40 sec$q$, null, 'activation', null, 6),
    (d, $q$Banded Donkey Kick$q$, 2, $q$40 sec$q$, null, 'activation', null, 7),
    (d, $q$Banded Fire Hydrant$q$, 2, $q$40 sec$q$, null, 'activation', null, 8),
    (d, $q$Rainbow Kickback$q$, 2, $q$40 sec$q$, null, 'activation', null, 9),
    (d, $q$DB Goblet Squat$q$, 4, $q$10$q$, null, 'workout', null, 10),
    (d, $q$DB Sumo Deadlift$q$, 4, $q$10$q$, null, 'workout', null, 11),
    (d, $q$Walking Lunge$q$, 3, $q$12 each leg$q$, null, 'workout', null, 12),
    (d, $q$DB RDL$q$, 3, $q$10$q$, null, 'workout', null, 13),
    (d, $q$DB Lying Leg Curl$q$, 3, $q$12$q$, null, 'workout', null, 14),
    (d, $q$DB Lying Leg Curl (Drop Set)$q$, 1, $q$12$q$, null, 'workout', null, 15),
    (d, $q$DB Glute Kickback$q$, 3, $q$15 each leg$q$, null, 'workout', null, 16),
    (d, $q$Incline Treadmill$q$, 1, $q$20 min$q$, $q$No treadmill? Walk uphill outside or do step-ups on a sturdy step.$q$, 'cardio', null, 17),
    (d, $q$Standing Quad Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 18),
    (d, $q$Standing Hamstring Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 19),
    (d, $q$Pigeon Stretch$q$, 2, $q$30 sec$q$, null, 'stretch', null, 20),
    (d, $q$Butterfly Stretch$q$, 1, $q$30 sec$q$, null, 'stretch', null, 21),
    (d, $q$Straight Leg Kickback$q$, 2, $q$40 sec$q$, null, 'stretch', null, 22);

  insert into program_days (program_id, day_number, day_label, title) values (prog, 7, 'Sunday', $q$Rest & Recovery$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Foam Rolling, Yoga, or Light Activity$q$, 1, $q$30 min$q$, $q$Keep it easy. Let your body recover, and rest in Him.$q$, 'mobility', null, 1);

end $$;

select title, days_per_week, location from workout_programs where title like 'Fearfully Made -%' or title like 'Strength & Dignity -%';
