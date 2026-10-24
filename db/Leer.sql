use educursos;

SELECT VERSION() AS version_mysql, DATABASE() AS base_seleccionada;
SHOW TABLES;

SELECT c.title, COUNT(l.id) AS niveles
FROM courses c
LEFT JOIN course_levels l ON l.course_id = c.id
WHERE c.is_active = 1
GROUP BY c.id, c.title
ORDER BY c.title;

SELECT c.title AS curso, l.position AS nivel, l.title AS leccion, l.video_url
FROM courses c
JOIN course_levels l ON l.course_id = c.id
WHERE c.is_active = 1
ORDER BY c.title, l.position;

SELECT * FROM users;
SELECT * FROM categories;
SELECT * FROM courses;
SELECT * FROM course_levels;
SELECT * FROM enrollments;