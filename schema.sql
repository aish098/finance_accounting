CREATE DATABASE IF NOT EXISTS accounting_db;
USE accounting_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'accountant') DEFAULT 'accountant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chart of Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense') NOT NULL,
    normal_balance ENUM('Debit', 'Credit') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entries (Header)
CREATE TABLE IF NOT EXISTS journal_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entry_date DATE NOT NULL,
    reference VARCHAR(50),
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Journal Items (Line items for entries)
CREATE TABLE IF NOT EXISTS journal_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    journal_entry_id INT NOT NULL,
    account_id INT NOT NULL,
    debit DECIMAL(15, 2) DEFAULT 0.00,
    credit DECIMAL(15, 2) DEFAULT 0.00,
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    CHECK (debit >= 0 AND credit >= 0),
    CHECK (debit = 0 OR credit = 0) -- Ensuring either debit or credit is zero for each line
);

-- Seed basic Chart of Accounts
INSERT IGNORE INTO accounts (code, name, type, normal_balance) VALUES
('1000', 'Cash', 'Asset', 'Debit'),
('1100', 'Accounts Receivable', 'Asset', 'Debit'),
('1200', 'Inventory', 'Asset', 'Debit'),
('2000', 'Accounts Payable', 'Liability', 'Credit'),
('2100', 'Short-term Loans', 'Liability', 'Credit'),
('3000', 'Owner Equity', 'Equity', 'Credit'),
('3100', 'Retained Earnings', 'Equity', 'Credit'),
('4000', 'Sales Revenue', 'Revenue', 'Credit'),
('4100', 'Service Revenue', 'Revenue', 'Credit'),
('5000', 'Cost of Goods Sold', 'Expense', 'Debit'),
('5100', 'Rent Expense', 'Expense', 'Debit'),
('5200', 'Salary Expense', 'Expense', 'Debit'),
('5300', 'Utility Expense', 'Expense', 'Debit'),
('5400', 'Purchases', 'Expense', 'Debit');
