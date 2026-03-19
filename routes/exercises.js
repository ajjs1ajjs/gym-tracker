/**
 * Exercises Routes
 * GET /api/exercises - Get all exercises
 * GET /api/exercises/:id - Get exercise by ID
 * POST /api/exercises - Create new exercise (admin)
 * PUT /api/exercises/:id - Update exercise (admin)
 * DELETE /api/exercises/:id - Delete exercise (admin)
 */

const express = require('express');
const { getDb } = require('../database');

const router = express.Router();

// Get all exercises
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const exercises = db.prepare(`
            SELECT e.*, eg.name as group_name, eg.icon as group_icon
            FROM exercises e
            LEFT JOIN exercise_groups eg ON e.group_id = eg.id
            ORDER BY eg.display_order, e.name
        `).all();

        res.json({ exercises });
    } catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({ error: 'Failed to get exercises' });
    }
});

// Get exercise by ID
router.get('/:id', (req, res) => {
    try {
        const db = getDb();
        const exercise = db.prepare(`
            SELECT e.*, eg.name as group_name, eg.icon as group_icon
            FROM exercises e
            LEFT JOIN exercise_groups eg ON e.group_id = eg.id
            WHERE e.id = ?
        `).get(req.params.id);

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        res.json({ exercise });
    } catch (error) {
        console.error('Get exercise error:', error);
        res.status(500).json({ error: 'Failed to get exercise' });
    }
});

// Get exercises by group
router.get('/group/:groupId', (req, res) => {
    try {
        const db = getDb();
        const exercises = db.prepare(`
            SELECT e.*, eg.name as group_name, eg.icon as group_icon
            FROM exercises e
            LEFT JOIN exercise_groups eg ON e.group_id = eg.id
            WHERE e.group_id = ?
            ORDER BY e.name
        `).all(req.params.groupId);

        res.json({ exercises });
    } catch (error) {
        console.error('Get group exercises error:', error);
        res.status(500).json({ error: 'Failed to get exercises' });
    }
});

// Create new exercise
router.post('/', (req, res) => {
    try {
        const { group_id, name, image, description, difficulty, muscle, sets, instructions } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const db = getDb();
        const result = db.prepare(`
            INSERT INTO exercises (group_id, name, image, description, difficulty, muscle, sets, instructions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(group_id, name, image, description, difficulty, muscle, sets, JSON.stringify(instructions || []));

        res.status(201).json({
            message: 'Exercise created',
            id: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Create exercise error:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
});

// Update exercise
router.put('/:id', (req, res) => {
    try {
        const { group_id, name, image, description, difficulty, muscle, sets, instructions } = req.body;

        const db = getDb();
        const existing = db.prepare('SELECT id FROM exercises WHERE id = ?').get(req.params.id);

        if (!existing) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        db.prepare(`
            UPDATE exercises
            SET group_id = ?, name = ?, image = ?, description = ?, difficulty = ?, muscle = ?, sets = ?, instructions = ?
            WHERE id = ?
        `).run(group_id, name, image, description, difficulty, muscle, sets, JSON.stringify(instructions || []), req.params.id);

        res.json({ message: 'Exercise updated' });
    } catch (error) {
        console.error('Update exercise error:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
});

// Delete exercise
router.delete('/:id', (req, res) => {
    try {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM exercises WHERE id = ?').get(req.params.id);

        if (!existing) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);

        res.json({ message: 'Exercise deleted' });
    } catch (error) {
        console.error('Delete exercise error:', error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
});

// Get exercise groups
router.get('/groups/all', (req, res) => {
    try {
        const db = getDb();
        const groups = db.prepare(`
            SELECT eg.*, COUNT(e.id) as exercise_count
            FROM exercise_groups eg
            LEFT JOIN exercises e ON eg.id = e.group_id
            GROUP BY eg.id
            ORDER BY eg.display_order
        `).all();

        res.json({ groups });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ error: 'Failed to get groups' });
    }
});

module.exports = router;
