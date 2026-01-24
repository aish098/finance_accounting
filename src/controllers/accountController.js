const accountService = require('../services/accountService');

class AccountController {
    async getAll(req, res) {
        try {
            const accounts = await accountService.getAllAccounts();
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const account = await accountService.getAccountById(req.params.id);
            if (!account) return res.status(404).json({ error: 'Account not found' });
            res.json(account);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const id = await accountService.createAccount(req.body);
            res.status(201).json({ id, ...req.body });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            await accountService.updateAccount(req.params.id, req.body);
            res.json({ message: 'Account updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AccountController();
