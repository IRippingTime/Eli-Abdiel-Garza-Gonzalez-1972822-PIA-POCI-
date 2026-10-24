CREATE DATABASE IF NOT EXISTS educursos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE educursos;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  gender ENUM('Femenino','Masculino','Otro') NOT NULL,
  birth_date DATE NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('estudiante','instructor','administrador') NOT NULL,
  avatar_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role_active (role, is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS courses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  instructor_id BIGINT UNSIGNED NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courses_active_published (is_active, published_at),
  INDEX idx_courses_title (title),
  CONSTRAINT fk_courses_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_levels (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  position SMALLINT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  video_url VARCHAR(1000) NOT NULL,
  price DECIMAL(10,2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_course_level_position (course_id, position),
  CONSTRAINT fk_levels_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enrollments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at DATETIME NULL,
  completed_at DATETIME NULL,
  UNIQUE KEY uq_student_course (student_id, course_id),
  CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users(id),
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

INSERT IGNORE INTO categories (name, description, created_by) VALUES
('IT & Software', 'Programación, bases de datos, redes y nube.', NULL),
('Marketing', 'Marketing digital, SEO y redes sociales.', NULL),
('Design', 'Diseño gráfico, UI/UX y animación.', NULL),
('Negocios', 'Emprendimiento, finanzas y gestión.', NULL),
('Idiomas', 'Inglés y otros idiomas para profesionales.', NULL),
('Fotografía', 'Fotografía digital y edición.', NULL);
