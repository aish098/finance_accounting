const accountRepository = require('../repositories/accountRepository');

class AccountService {
    async getAllAccounts() {
        return await accountRepository.getAll();
    }

    async getAccountById(id) {
        return await accountRepository.getById(id);
    }

    async createAccount(accountData) {
        const existing = await accountRepository.getByCode(accountData.code);
        if (existing) throw new Error('Account code already exists');
        return await accountRepository.create(accountData);
    }

    async updateAccount(id, accountData) {
        const existing = await accountRepository.getByCode(accountData.code, id);
        if (existing) throw new Error('Account code already exists');
        return await accountRepository.update(id, accountData);
    }

    async deleteAccount(id) {
        const hasTransactions = await accountRepository.hasTransactions(id);
        if (hasTransactions) {
            throw new Error('Cannot delete account that has journal transactions. Archive or reassign transactions first.');
        }
        return await accountRepository.delete(id);
    }
}

module.exports = new AccountService();
