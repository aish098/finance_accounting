const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');

router.post('/', (req, res) => journalController.create(req, res));
router.get('/', (req, res) => journalController.getAll(req, res));
router.get('/:id', (req, res) => journalController.getById(req, res));

module.exports = router;
