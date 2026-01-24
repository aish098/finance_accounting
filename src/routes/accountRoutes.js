const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', (req, res) => accountController.getAll(req, res));
router.get('/:id', (req, res) => accountController.getById(req, res));
router.post('/', (req, res) => accountController.create(req, res));
router.put('/:id', (req, res) => accountController.update(req, res));

module.exports = router;
