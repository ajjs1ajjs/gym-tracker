/**
 * Users Routes
 * GET /api/users/profile - Get user profile
 * PUT /api/users/profile - Update user profile
 * GET /api/users/progress - Get user progress
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Get user profile
router.get('/profile', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const user = db.prepare(`
            SELECT id, username, email, created_at FROM users WHERE id = ?
        `).get(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile
router.put('/profile', authMiddleware, (req, res) => {
    try {
        const { username, email } = req.body;

        const db = getDb();

        // Check if username/email already taken by another user
        const existing = db.prepare(`
            SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?
        `).get(username, email, req.userId);

        if (existing) {
            return res.status(409).json({ error: 'Username or email already taken' });
        }

        db.prepare(`
            UPDATE users SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(username, email, req.userId);

        res.json({ message: 'Profile updated' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get user progress
router.get('/progress', authMiddleware, (req, res) => {
    try {
        const db = getDb();

        // Completed exercises count
        const completed = db.prepare(`
            SELECT COUNT(DISTINCT exercise_id) as count
            FROM user_exercises WHERE user_id = ?
        `).get(req.userId);

        // Total workouts
        const workouts = db.prepare(`
            SELECT COUNT(*) as count FROM workout_logs WHERE user_id = ?
        `).get(req.userId);

        // Personal records
        const records = db.prepare(`
            SELECT COUNT(*) as count FROM personal_records WHERE user_id = ?
        `).get(req.userId);

        // Recent activity (last 7 days)
        const recentActivity = db.prepare(`
            SELECT DATE(workout_date) as date, COUNT(*) as exercises
            FROM workout_logs
            WHERE user_id = ? AND workout_date >= datetime('now', '-7 days')
            GROUP BY DATE(workout_date)
            ORDER BY date
        `).all(req.userId);

        res.json({
            progress: {
                completedExercises: completed.count,
                totalWorkouts: workouts.count,
                personalRecords: records.count,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
});

module.exports = router;
