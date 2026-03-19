/**
 * Workouts Routes
 * GET /api/workouts - Get user's workout history
 * POST /api/workouts - Log a workout
 * GET /api/workouts/stats - Get workout statistics
 * POST /api/workouts/plan - Create workout plan
 * GET /api/workouts/plan - Get user's workout plans
 */

const express = require('express');
const { getDb } = require('../database');

const router = express.Router();

// Middleware to verify JWT token
function authMiddleware(req, res, next) {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

// Get user's workout history
router.get('/', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const { period = 'all' } = req.query;

        let dateFilter = '';
        if (period === 'week') {
            dateFilter = "AND wl.workout_date >= datetime('now', '-7 days')";
        } else if (period === 'month') {
            dateFilter = "AND wl.workout_date >= datetime('now', '-30 days')";
        }

        const workouts = db.prepare(`
            SELECT
                wl.*,
                e.name as exercise_name,
                e.image,
                eg.name as group_name,
                eg.icon as group_icon
            FROM workout_logs wl
            LEFT JOIN exercises e ON wl.exercise_id = e.id
            LEFT JOIN exercise_groups eg ON e.group_id = eg.id
            WHERE wl.user_id = ? ${dateFilter}
            ORDER BY wl.workout_date DESC
            LIMIT 100
        `).all(req.userId);

        res.json({ workouts });
    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json({ error: 'Failed to get workouts' });
    }
});

// Log a workout
router.post('/', authMiddleware, (req, res) => {
    try {
        const { exercise_id, sets, reps, weight_kg, duration_seconds, notes } = req.body;

        if (!exercise_id) {
            return res.status(400).json({ error: 'Exercise ID is required' });
        }

        const db = getDb();
        const result = db.prepare(`
            INSERT INTO workout_logs (user_id, exercise_id, sets, reps, weight_kg, duration_seconds, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(req.userId, exercise_id, sets, reps, weight_kg, duration_seconds, notes);

        // Check for personal record
        if (weight_kg || reps || duration_seconds) {
            const recordType = weight_kg ? 'weight' : reps ? 'reps' : 'duration';
            const value = weight_kg || reps || duration_seconds;

            const existingPR = db.prepare(`
                SELECT * FROM personal_records
                WHERE user_id = ? AND exercise_id = ? AND record_type = ?
            `).get(req.userId, exercise_id, recordType);

            if (!existingPR || value > existingPR.value) {
                if (existingPR) {
                    db.prepare('UPDATE personal_records SET value = ?, achieved_at = CURRENT_TIMESTAMP WHERE id = ?')
                        .run(value, existingPR.id);
                } else {
                    db.prepare(`
                        INSERT INTO personal_records (user_id, exercise_id, record_type, value)
                        VALUES (?, ?, ?, ?)
                    `).run(req.userId, exercise_id, recordType, value);
                }
            }
        }

        res.status(201).json({
            message: 'Workout logged',
            id: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Log workout error:', error);
        res.status(500).json({ error: 'Failed to log workout' });
    }
});

// Get workout statistics
router.get('/stats', authMiddleware, (req, res) => {
    try {
        const db = getDb();

        // Total workouts
        const totalWorkouts = db.prepare(`
            SELECT COUNT(DISTINCT DATE(workout_date)) as count
            FROM workout_logs WHERE user_id = ?
        `).get(req.userId);

        // Total exercises completed
        const totalExercises = db.prepare(`
            SELECT COUNT(*) as count FROM workout_logs WHERE user_id = ?
        `).get(req.userId);

        // Personal records
        const personalRecords = db.prepare(`
            SELECT pr.*, e.name as exercise_name
            FROM personal_records pr
            LEFT JOIN exercises e ON pr.exercise_id = e.id
            WHERE pr.user_id = ?
        `).all(req.userId);

        // Workout frequency (last 30 days)
        const frequency = db.prepare(`
            SELECT DATE(workout_date) as date, COUNT(*) as exercises
            FROM workout_logs
            WHERE user_id = ? AND workout_date >= datetime('now', '-30 days')
            GROUP BY DATE(workout_date)
            ORDER BY date DESC
        `).all(req.userId);

        // Top exercises
        const topExercises = db.prepare(`
            SELECT e.name, COUNT(*) as times_done
            FROM workout_logs wl
            LEFT JOIN exercises e ON wl.exercise_id = e.id
            WHERE wl.user_id = ?
            GROUP BY wl.exercise_id
            ORDER BY times_done DESC
            LIMIT 5
        `).all(req.userId);

        res.json({
            stats: {
                totalWorkouts: totalWorkouts.count,
                totalExercises: totalExercises.count,
                personalRecords: personalRecords.length,
                frequency,
                topExercises
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Create workout plan
router.post('/plan', authMiddleware, (req, res) => {
    try {
        const { name, description, exercises } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Plan name is required' });
        }

        const db = getDb();
        const result = db.prepare(`
            INSERT INTO workout_plans (user_id, name, description, exercises_json)
            VALUES (?, ?, ?, ?)
        `).run(req.userId, name, description, JSON.stringify(exercises || []));

        res.status(201).json({
            message: 'Plan created',
            id: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Create plan error:', error);
        res.status(500).json({ error: 'Failed to create plan' });
    }
});

// Get user's workout plans
router.get('/plan', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const plans = db.prepare(`
            SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC
        `).all(req.userId);

        res.json({ plans });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to get plans' });
    }
});

// Delete workout plan
router.delete('/plan/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const plan = db.prepare('SELECT * FROM workout_plans WHERE id = ? AND user_id = ?')
            .get(req.params.id, req.userId);

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        db.prepare('DELETE FROM workout_plans WHERE id = ?').run(req.params.id);

        res.json({ message: 'Plan deleted' });
    } catch (error) {
        console.error('Delete plan error:', error);
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});

module.exports = router;
