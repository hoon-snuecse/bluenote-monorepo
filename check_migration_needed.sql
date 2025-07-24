-- email 형태로 저장된 데이터 확인
SELECT 'assignments' as table_name, COUNT(*) as count 
FROM assignments 
WHERE teacher_id LIKE '%@%'

UNION ALL

SELECT 'evaluation_templates', COUNT(*) 
FROM evaluation_templates 
WHERE created_by LIKE '%@%'

UNION ALL

SELECT 'student_groups', COUNT(*) 
FROM student_groups 
WHERE created_by LIKE '%@%'

UNION ALL

SELECT 'evaluations_batch_jobs', COUNT(*) 
FROM evaluations_batch_jobs 
WHERE created_by LIKE '%@%';

-- hoon@snuecse.org의 데이터 확인
SELECT 'Total for hoon@snuecse.org' as description, COUNT(*) as count
FROM (
    SELECT teacher_id as user_field FROM assignments WHERE teacher_id = 'hoon@snuecse.org'
    UNION ALL
    SELECT created_by FROM evaluation_templates WHERE created_by = 'hoon@snuecse.org'
    UNION ALL
    SELECT created_by FROM student_groups WHERE created_by = 'hoon@snuecse.org'
    UNION ALL
    SELECT created_by FROM evaluations_batch_jobs WHERE created_by = 'hoon@snuecse.org'
) as combined;
