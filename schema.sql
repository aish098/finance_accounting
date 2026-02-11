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
    entry_type ENUM('regular', 'adjusting') DEFAULT 'regular',
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
-- ASSETS (1000-1999)
('1000', 'Cash', 'Asset', 'Debit'),
('1100', 'Accounts Receivable', 'Asset', 'Debit'),
('1120', 'Allowance for Doubtful Accounts', 'Asset', 'Credit'),
('1130', 'Interest Receivable', 'Asset', 'Debit'),
('1200', 'Inventory', 'Asset', 'Debit'),
('1220', 'Supplies', 'Asset', 'Debit'),
('1310', 'Prepaid Insurance', 'Asset', 'Debit'),
('1320', 'Prepaid Rent', 'Asset', 'Debit'),
('1510', 'Land', 'Asset', 'Debit'),
('1520', 'Equipment', 'Asset', 'Debit'),
('1521', 'Accumulated Depreciation — Equipment', 'Asset', 'Credit'),
('1530', 'Buildings', 'Asset', 'Debit'),
('1531', 'Accumulated Depreciation — Buildings', 'Asset', 'Credit'),
('1710', 'Copyrights', 'Asset', 'Debit'),
('1810', 'Goodwill', 'Asset', 'Debit'),
('1910', 'Patents', 'Asset', 'Debit'),

-- LIABILITIES (2000-2999)
('2010', 'Notes Payable', 'Liability', 'Credit'),
('2000', 'Accounts Payable', 'Liability', 'Credit'),
('2210', 'Unearned Service Revenue', 'Liability', 'Credit'),
('2310', 'Salaries and Wages Payable', 'Liability', 'Credit'),
('2410', 'Unearned Rent Revenue', 'Liability', 'Credit'),
('2510', 'Interest Payable', 'Liability', 'Credit'),
('2610', 'Dividends Payable', 'Liability', 'Credit'),
('2710', 'Income Taxes Payable', 'Liability', 'Credit'),
('2810', 'Bonds Payable', 'Liability', 'Credit'),
('2811', 'Discount on Bonds Payable', 'Liability', 'Debit'),
('2812', 'Premium on Bonds Payable', 'Liability', 'Credit'),
('2910', 'Mortgage Payable', 'Liability', 'Credit'),

-- OWNER’S AND STOCKHOLDERS’ EQUITY (3000-3999)
('3010', 'Owner’s Capital', 'Equity', 'Credit'),
('3000', 'Owner Equity', 'Equity', 'Credit'),
('3020', 'Owner’s Drawings', 'Equity', 'Debit'),
('3110', 'Common Stock', 'Equity', 'Credit'),
('3120', 'Paid-in Capital in Excess of Par — Common Stock', 'Equity', 'Credit'),
('3210', 'Preferred Stock', 'Equity', 'Credit'),
('3220', 'Paid-in Capital in Excess of Par — Preferred Stock', 'Equity', 'Credit'),
('3310', 'Treasury Stock', 'Equity', 'Debit'),
('3100', 'Retained Earnings', 'Equity', 'Credit'),
('3510', 'Dividends', 'Equity', 'Debit'),
('3999', 'Income Summary', 'Equity', 'Credit'),

-- REVENUES (4000-4999)
('4100', 'Service Revenue', 'Revenue', 'Credit'),
('4000', 'Sales Revenue', 'Revenue', 'Credit'),
('4120', 'Sales Discounts', 'Revenue', 'Debit'),
('4130', 'Sales Returns and Allowances', 'Revenue', 'Debit'),
('4210', 'Interest Revenue', 'Revenue', 'Credit'),
('4310', 'Gain on Disposal of Plant Assets', 'Revenue', 'Credit'),

-- EXPENSES (5000-6999)
('5010', 'Advertising Expense', 'Expense', 'Debit'),
('5020', 'Amortization Expense', 'Expense', 'Debit'),
('5030', 'Bad Debt Expense', 'Expense', 'Debit'),
('5000', 'Cost of Goods Sold', 'Expense', 'Debit'),
('5210', 'Depreciation Expense', 'Expense', 'Debit'),
('5310', 'Freight-Out', 'Expense', 'Debit'),
('5410', 'Income Tax Expense', 'Expense', 'Debit'),
('5510', 'Insurance Expense', 'Expense', 'Debit'),
('5610', 'Interest Expense', 'Expense', 'Debit'),
('5710', 'Loss on Disposal of Plant Assets', 'Expense', 'Debit'),
('5810', 'Maintenance and Repairs Expense', 'Expense', 'Debit'),
('5100', 'Rent Expense', 'Expense', 'Debit'),
('5200', 'Salary Expense', 'Expense', 'Debit'),
('5300', 'Utility Expense', 'Expense', 'Debit'),
('6010', 'Salaries and Wages Expense', 'Expense', 'Debit'),
('6110', 'Supplies Expense', 'Expense', 'Debit'),
('6210', 'Utilities Expense', 'Expense', 'Debit');
