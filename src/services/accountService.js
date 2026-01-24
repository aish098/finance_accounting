const accountRepository = require('../repositories/accountRepository');

class AccountService {
    async getAllAccounts() {
        return await accountRepository.getAll();
    }

    async getAccountById(id) {
        return await accountRepository.getById(id);
    }

    async createAccount(accountData) {
        // Business logic: check if code already exists, etc.
        return await accountRepository.create(accountData);
    }

    async updateAccount(id, accountData) {
        return await accountRepository.update(id, accountData);
    }
}

module.exports = new AccountService();
