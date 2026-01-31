const journalService = require('../services/journalService');

class JournalController {
    async create(req, res) {
        try {
            const { entry_date, reference, description, items } = req.body;
            const entryId = await journalService.createJournalEntry(
                { entry_date, reference, description, created_by: req.user.id },
                items
            );
            res.status(201).json({ id: entryId, message: 'Journal entry created and posted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const entries = await journalService.getAllEntries(req.user.id);
            res.json(entries);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const entry = await journalService.getEntryDetails(req.params.id, req.user.id);
            if (!entry) return res.status(404).json({ error: 'Entry not found' });
            res.json(entry);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { entry_date, reference, description, items } = req.body;
            await journalService.updateJournalEntry(
                req.params.id,
                req.user.id,
                { entry_date, reference, description },
                items
            );
            res.json({ message: 'Journal entry updated successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await journalService.deleteJournalEntry(req.params.id, req.user.id);
            res.json({ message: 'Journal entry deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new JournalController();
