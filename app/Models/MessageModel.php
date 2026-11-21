<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class MessageModel
{
    public function contacts(int $userId, string $role): array
    {
        if ($role === 'instructor') {
            $stmt = Database::connection()->prepare('SELECT DISTINCT u.id,u.full_name,u.avatar_url FROM enrollments e JOIN courses c ON c.id=e.course_id JOIN users u ON u.id=e.student_id WHERE c.instructor_id=:id ORDER BY u.full_name');
        } else {
            $stmt = Database::connection()->prepare('SELECT DISTINCT u.id,u.full_name,u.avatar_url FROM enrollments e JOIN courses c ON c.id=e.course_id JOIN users u ON u.id=c.instructor_id WHERE e.student_id=:id ORDER BY u.full_name');
        }
        $stmt->execute(['id' => $userId]);
        return $stmt->fetchAll();
    }

    public function conversation(int $userId, int $otherId): array
    {
        $stmt = Database::connection()->prepare('SELECT m.id,m.sender_id,m.recipient_id,m.course_id,m.body,m.created_at,u.full_name,u.avatar_url FROM messages m JOIN users u ON u.id=m.sender_id WHERE (m.sender_id=:me AND m.recipient_id=:other) OR (m.sender_id=:other2 AND m.recipient_id=:me2) ORDER BY m.created_at,m.id');
        $stmt->execute(['me' => $userId, 'other' => $otherId, 'other2' => $otherId, 'me2' => $userId]);
        return $stmt->fetchAll();
    }

    public function send(int $senderId, int $recipientId, string $body, ?int $courseId): int
    {
        if ($senderId === $recipientId) throw new \DomainException('No puedes enviarte un mensaje a ti mismo.');
        $pdo = Database::connection();
        $users = $pdo->prepare('SELECT COUNT(*) FROM users WHERE id IN (:sender,:recipient)');
        $users->execute(['sender' => $senderId, 'recipient' => $recipientId]);
        if ((int)$users->fetchColumn() !== 2) throw new \DomainException('El destinatario no existe.');
        $stmt = $pdo->prepare('INSERT INTO messages (sender_id,recipient_id,course_id,body) VALUES (:sender,:recipient,:course,:body)');
        $stmt->execute(['sender' => $senderId, 'recipient' => $recipientId, 'course' => $courseId, 'body' => $body]);
        return (int)$pdo->lastInsertId();
    }
}

