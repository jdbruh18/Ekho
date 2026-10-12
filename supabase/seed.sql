-- ==============================================================================
-- SPEECH-LANGUAGE PATHOLOGY (SLP) THERAPY PLATFORM
-- Seed Data: Sample Mock Data for Local Development & Testing
-- ==============================================================================

-- 1. Insert Mock Users into auth.users (if using Supabase Auth or mock testing)
-- We will use static deterministic UUIDs for relational consistency.

DO $$
DECLARE
    -- SLP 1: Dr. Maya Lin
    v_slp1_id UUID := '11111111-1111-4111-a111-111111111111';
    -- SLP 2: Sarah Jenkins
    v_slp2_id UUID := '22222222-2222-4222-a222-222222222222';
    -- SLP 3 (Pending): David Chen
    v_slp3_id UUID := '33333333-3333-4333-a333-333333333333';
    -- Parent 1: Emily Watson
    v_parent1_id UUID := '44444444-4444-4444-a444-444444444444';
    -- Parent 2: Michael Harris
    v_parent2_id UUID := '55555555-5555-4555-a555-555555555555';
    -- Admin: Admin User
    v_admin_id UUID := '99999999-9999-4999-a999-999999999999';

    -- Children
    v_child1_id UUID := 'aaaaaaa1-aaaa-4aaa-aaaa-aaaaaaaaaaa1';
    v_child2_id UUID := 'aaaaaaa2-aaaa-4aaa-aaaa-aaaaaaaaaaa2';

    -- Appointments
    v_appt1_id UUID := 'bbbbbbb1-bbbb-4bbb-bbbb-bbbbbbbbbbb1';
    v_appt2_id UUID := 'bbbbbbb2-bbbb-4bbb-bbbb-bbbbbbbbbbb2';
BEGIN

    -- A. Seed Auth Users (Supabase auth.users table)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
    VALUES
        (v_slp1_id, '00000000-0000-0000-0000-000000000000', 'maya.lin@slptherapy.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Maya Lin, Ph.D., CCC-SLP","role":"slp"}', now(), now(), 'authenticated', 'authenticated'),
        (v_slp2_id, '00000000-0000-0000-0000-000000000000', 'sarah.jenkins@slptherapy.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Jenkins, M.S., CCC-SLP","role":"slp"}', now(), now(), 'authenticated', 'authenticated'),
        (v_slp3_id, '00000000-0000-0000-0000-000000000000', 'david.chen@slptherapy.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"David Chen, M.S., CF-SLP","role":"slp"}', now(), now(), 'authenticated', 'authenticated'),
        (v_parent1_id, '00000000-0000-0000-0000-000000000000', 'emily.watson@parent.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Emily Watson","role":"parent"}', now(), now(), 'authenticated', 'authenticated'),
        (v_parent2_id, '00000000-0000-0000-0000-000000000000', 'michael.harris@parent.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Michael Harris","role":"parent"}', now(), now(), 'authenticated', 'authenticated'),
        (v_admin_id, '00000000-0000-0000-0000-000000000000', 'admin@slptherapy.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Platform Administrator","role":"admin"}', now(), now(), 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;

    -- B. Seed Profiles
    INSERT INTO public.profiles (id, role, full_name, email, phone, avatar_url)
    VALUES
        (v_slp1_id, 'slp', 'Dr. Maya Lin, Ph.D., CCC-SLP', 'maya.lin@slptherapy.test', '+1-555-0101', 'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=400&fit=crop&q=80'),
        (v_slp2_id, 'slp', 'Sarah Jenkins, M.S., CCC-SLP', 'sarah.jenkins@slptherapy.test', '+1-555-0102', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&fit=crop&q=80'),
        (v_slp3_id, 'slp', 'David Chen, M.S., CF-SLP', 'david.chen@slptherapy.test', '+1-555-0103', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&fit=crop&q=80'),
        (v_parent1_id, 'parent', 'Emily Watson', 'emily.watson@parent.test', '+1-555-0201', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&fit=crop&q=80'),
        (v_parent2_id, 'parent', 'Michael Harris', 'michael.harris@parent.test', '+1-555-0202', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80'),
        (v_admin_id, 'admin', 'Platform Administrator', 'admin@slptherapy.test', '+1-555-0999', NULL)
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    -- C. Seed SLP Profiles
    INSERT INTO public.slp_profiles (
        id, title, degrees, certifications, license_number, years_of_experience,
        specializations, languages_spoken, bio, hourly_rate, is_verified,
        verification_status, available_online, rating, total_reviews, total_sessions
    )
    VALUES
        (
            v_slp1_id,
            'Senior Pediatric Speech-Language Pathologist',
            ARRAY['Ph.D. in Communication Sciences & Disorders - Northwestern University', 'M.S. in Speech Pathology - Boston University'],
            ARRAY['ASHA CCC-SLP', 'Certified Autism Specialist (CAS)', 'PROMPT Trained'],
            'SLP-CA-92841',
            12,
            ARRAY['Speech sound disorders', 'Autism-related communication difficulties', 'Early intervention', 'Childhood apraxia of speech'],
            ARRAY['English', 'Mandarin'],
            'Dedicated speech-language pathologist with 12+ years of experience helping children develop confident, clear communication through play-based and evidence-backed therapy.',
            95.00,
            true,
            'approved',
            true,
            4.95,
            48,
            310
        ),
        (
            v_slp2_id,
            'Pediatric Speech & Language Specialist',
            ARRAY['M.S. in Speech-Language Pathology - Vanderbilt University', 'B.S. in Cognitive Science'],
            ARRAY['ASHA CCC-SLP', 'PECS Level 2 Certified'],
            'SLP-NY-51829',
            8,
            ARRAY['Language disorders', 'Fluency/stuttering', 'Social communication difficulties', 'Developmental communication disorders'],
            ARRAY['English', 'Spanish'],
            'Passionate about collaborative therapy working closely with parents to achieve meaningful everyday milestones and fluency in speech.',
            85.00,
            true,
            'approved',
            true,
            4.90,
            32,
            195
        ),
        (
            v_slp3_id,
            'Clinical Fellow Speech Pathologist',
            ARRAY['M.S. in Speech-Language Pathology - University of Washington'],
            ARRAY['ASHA CF', 'State SLP License Candidate'],
            'SLP-WA-10928-CF',
            2,
            ARRAY['Fluency/stuttering', 'Speech sound disorders'],
            ARRAY['English'],
            'Eager clinician specializing in modern stuttering modification strategies and phonological therapy for school-age children.',
            65.00,
            false,
            'pending',
            true,
            5.00,
            0,
            12
        )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        license_number = EXCLUDED.license_number,
        hourly_rate = EXCLUDED.hourly_rate,
        is_verified = EXCLUDED.is_verified,
        verification_status = EXCLUDED.verification_status;

    -- D. Seed Child Profiles
    INSERT INTO public.child_profiles (
        id, parent_id, first_name, last_name, date_of_birth, gender,
        communication_concerns, developmental_history, notes
    )
    VALUES
        (
            v_child1_id,
            v_parent1_id,
            'Leo',
            'Watson',
            '2021-04-15',
            'Male',
            ARRAY['Speech sound disorders', 'Phonological articulation'],
            'Motor milestones met on schedule. Preschool teacher noted difficulty pronouncing /s/, /z/, and blend sounds. Friendly and eager to participate.',
            'Enjoys dinosaur games, picture naming, and active play.'
        ),
        (
            v_child2_id,
            v_parent2_id,
            'Maya',
            'Harris',
            '2019-08-20',
            'Female',
            ARRAY['Fluency/stuttering', 'Expressive language'],
            'Mild stuttering observed since age 4, typically whole-word and syllable repetitions during excited speech.',
            'Loves storytelling, drawing, and animal cards.'
        )
    ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name;

    -- E. Child Authorizations (Parent has authorized Dr. Maya Lin for Leo, and Sarah Jenkins for Maya)
    INSERT INTO public.child_authorizations (child_id, slp_id, parent_id, status, granted_at)
    VALUES
        (v_child1_id, v_slp1_id, v_parent1_id, 'active', now() - INTERVAL '14 days'),
        (v_child2_id, v_slp2_id, v_parent2_id, 'active', now() - INTERVAL '10 days')
    ON CONFLICT (child_id, slp_id) DO UPDATE SET status = 'active';

    -- F. Appointments
    INSERT INTO public.appointments (
        id, parent_id, slp_id, child_id, scheduled_at, duration_minutes,
        status, consultation_type, meeting_link, amount_paid, payment_status, notes
    )
    VALUES
        (
            v_appt1_id,
            v_parent1_id,
            v_slp1_id,
            v_child1_id,
            now() + INTERVAL '2 days' + INTERVAL '3 hours',
            45,
            'scheduled',
            'online',
            'https://meet.slptherapy.app/session/leo-watson-1',
            95.00,
            'paid',
            'Follow-up articulation session targeting /s/ sound production in word-initial positions.'
        ),
        (
            v_appt2_id,
            v_parent2_id,
            v_slp2_id,
            v_child2_id,
            now() + INTERVAL '4 days' + INTERVAL '1 hour',
            45,
            'scheduled',
            'online',
            'https://meet.slptherapy.app/session/maya-harris-1',
            85.00,
            'paid',
            'Fluency strategy practice and parent coaching session.'
        )
    ON CONFLICT (id) DO NOTHING;

    -- G. Child Goals
    INSERT INTO public.child_goals (
        child_id, slp_id, title, category, baseline_accuracy, current_accuracy, target_accuracy, status, notes
    )
    VALUES
        (
            v_child1_id,
            v_slp1_id,
            '/s/ sound production in initial word position',
            'Speech Sound disorders',
            30.00,
            65.00,
            80.00,
            'in_progress',
            'Targeting words like "sun", "soap", "see". Great improvement with visual cueing.'
        ),
        (
            v_child1_id,
            v_slp1_id,
            '/r/ sound stimulation in syllables',
            'Speech Sound disorders',
            15.00,
            35.00,
            75.00,
            'in_progress',
            'Introduced tactile cues for tongue placement.'
        ),
        (
            v_child2_id,
            v_slp2_id,
            'Slow, easy onset speech strategy in conversational phrases',
            'Fluency/stuttering',
            25.00,
            60.00,
            85.00,
            'in_progress',
            'Practicing with 3-5 word structured phrases and breathing regulation.'
        );

    -- H. Seed a Completed Historical Appointment and Session Report for Leo
    DECLARE
        v_hist_appt_id UUID := 'bbbbbbb3-bbbb-4bbb-bbbb-bbbbbbbbbbb3';
        v_report_id UUID := 'cccccccc-cccc-4ccc-cccc-cccccccccccc';
    BEGIN
        INSERT INTO public.appointments (
            id, parent_id, slp_id, child_id, scheduled_at, duration_minutes,
            status, consultation_type, meeting_link, amount_paid, payment_status, notes
        )
        VALUES (
            v_hist_appt_id,
            v_parent1_id,
            v_slp1_id,
            v_child1_id,
            now() - INTERVAL '3 days',
            45,
            'completed',
            'online',
            'https://meet.slptherapy.app/session/leo-watson-past',
            95.00,
            'paid',
            'Initial therapy block session.'
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO public.session_reports (
            id, appointment_id, child_id, slp_id, session_date, duration_minutes,
            activities_completed, child_performance_rating, accuracy_percentage,
            assistance_level, strengths, difficulties_observed, behavior_participation,
            clinical_notes, home_practice_instructions, home_practice_exercises
        )
        VALUES (
            v_report_id,
            v_hist_appt_id,
            v_child1_id,
            v_slp1_id,
            now() - INTERVAL '3 days',
            45,
            ARRAY['Auditory discrimination game', 'Picture card articulation drills (/s/ sounds)', 'Story reading practice'],
            'developing',
            65.00,
            'minimal_cueing',
            'High enthusiasm and fast responsiveness when using the mirror visual feedback.',
            'Tends to rush speech at the end of sentences causing dentalization of /s/.',
            'Excellent engagement and cooperated with parent present.',
            'Leo demonstrated consistent progress on /s/ production in single words, achieving 65% accuracy over 40 trials. Reminded parent to practice daily 5-minute naming drills.',
            'Practice the 10 target /s/ picture cards once in the morning and once in the evening. Keep it light, praise effort!',
            '[
                {"title": "Mirror Articulation Practice", "description": "Have Leo look into the mirror and say snake sound (ssss) before saying each card word.", "target_frequency": "5 minutes daily"},
                {"title": "Story Book Word Hunt", "description": "Find three words starting with S in Leo favourite bedtime book.", "target_frequency": "Bedtime routine"}
            ]'::jsonb
        ) ON CONFLICT (appointment_id) DO NOTHING;
    END;

END $$;
