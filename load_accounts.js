require('dotenv').config();
const mysql = require('mysql2/promise');

const accounts = [
    // ASSETS (1000-1999)
    { code: '1010', name: 'Cash', type: 'Asset', normal_balance: 'Debit' },
    { code: '1110', name: 'Accounts Receivable', type: 'Asset', normal_balance: 'Debit' },
    { code: '1120', name: 'Allowance for Doubtful Accounts', type: 'Asset', normal_balance: 'Credit' }, // Contra-asset
    { code: '1130', name: 'Interest Receivable', type: 'Asset', normal_balance: 'Debit' },
    { code: '1210', name: 'Inventory', type: 'Asset', normal_balance: 'Debit' },
    { code: '1220', name: 'Supplies', type: 'Asset', normal_balance: 'Debit' },
    { code: '1310', name: 'Prepaid Insurance', type: 'Asset', normal_balance: 'Debit' },
    { code: '1320', name: 'Prepaid Rent', type: 'Asset', normal_balance: 'Debit' },
    { code: '1510', name: 'Land', type: 'Asset', normal_balance: 'Debit' },
    { code: '1520', name: 'Equipment', type: 'Asset', normal_balance: 'Debit' },
    { code: '1521', name: 'Accumulated Depreciation — Equipment', type: 'Asset', normal_balance: 'Credit' }, // Contra-asset
    { code: '1530', name: 'Buildings', type: 'Asset', normal_balance: 'Debit' },
    { code: '1531', name: 'Accumulated Depreciation — Buildings', type: 'Asset', normal_balance: 'Credit' }, // Contra-asset
    { code: '1710', name: 'Copyrights', type: 'Asset', normal_balance: 'Debit' },
    { code: '1810', name: 'Goodwill', type: 'Asset', normal_balance: 'Debit' },
    { code: '1910', name: 'Patents', type: 'Asset', normal_balance: 'Debit' },

    // LIABILITIES (2000-2999)
    { code: '2010', name: 'Notes Payable', type: 'Liability', normal_balance: 'Credit' },
    { code: '2110', name: 'Accounts Payable', type: 'Liability', normal_balance: 'Credit' },
    { code: '2210', name: 'Unearned Service Revenue', type: 'Liability', normal_balance: 'Credit' },
    { code: '2310', name: 'Salaries and Wages Payable', type: 'Liability', normal_balance: 'Credit' },
    { code: '2410', name: 'Unearned Rent Revenue', type: 'Liability', normal_balance: 'Credit' },
    { code: '2510', name: 'Interest Payable', type: 'Liability', normal_balance: 'Credit' },
    { code: '2610', name: 'Dividends Payable', type: 'Liability', normal_balance: 'Credit' },
    { code: '2710', name: 'Income Taxes Payable', type: 'Liability', normal_balance: 'Credit' },
    { code: '2810', name: 'Bonds Payable', type: 'Liability', normal_balance: 'Credit' },
    { code: '2811', name: 'Discount on Bonds Payable', type: 'Liability', normal_balance: 'Debit' }, // Contra-liability
    { code: '2812', name: 'Premium on Bonds Payable', type: 'Liability', normal_balance: 'Credit' },
    { code: '2910', name: 'Mortgage Payable', type: 'Liability', normal_balance: 'Credit' },

    // EQUITY (3000-3999)
    { code: '3010', name: "Owner’s Capital", type: 'Equity', normal_balance: 'Credit' },
    { code: '3020', name: "Owner’s Drawings", type: 'Equity', normal_balance: 'Debit' }, // Contra-equity
    { code: '3110', name: 'Common Stock', type: 'Equity', normal_balance: 'Credit' },
    { code: '3120', name: 'Paid-in Capital in Excess of Par — Common Stock', type: 'Equity', normal_balance: 'Credit' },
    { code: '3210', name: 'Preferred Stock', type: 'Equity', normal_balance: 'Credit' },
    { code: '3220', name: 'Paid-in Capital in Excess of Par — Preferred Stock', type: 'Equity', normal_balance: 'Credit' },
    { code: '3310', name: 'Treasury Stock', type: 'Equity', normal_balance: 'Debit' }, // Contra-equity
    { code: '3410', name: 'Retained Earnings', type: 'Equity', normal_balance: 'Credit' },
    { code: '3510', name: 'Dividends', type: 'Equity', normal_balance: 'Debit' },
    { code: '3999', name: 'Income Summary', type: 'Equity', normal_balance: 'Credit' },

    // REVENUES (4000-4999)
    { code: '4010', name: 'Service Revenue', type: 'Revenue', normal_balance: 'Credit' },
    { code: '4110', name: 'Sales Revenue', type: 'Revenue', normal_balance: 'Credit' },
    { code: '4120', name: 'Sales Discounts', type: 'Revenue', normal_balance: 'Debit' }, // Contra-revenue
    { code: '4130', name: 'Sales Returns and Allowances', type: 'Revenue', normal_balance: 'Debit' }, // Contra-revenue
    { code: '4210', name: 'Interest Revenue', type: 'Revenue', normal_balance: 'Credit' },
    { code: '4310', name: 'Gain on Disposal of Plant Assets', type: 'Revenue', normal_balance: 'Credit' },

    // EXPENSES (5000-6999)
    { code: '5010', name: 'Advertising Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '5020', name: 'Amortization Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '5030', name: 'Bad Debt Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '5110', name: 'Cost of Goods Sold', type: 'Expense', normal_balance: 'Debit' },
    { code: '5210', name: 'Depreciation Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '5310', name: 'Freight-Out', type: 'Expense', normal_balance: 'Debit' },
    { code: '5410', name: 'Income Tax Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '5510', name: 'Insurance Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '5610', name: 'Interest Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '5710', name: 'Loss on Disposal of Plant Assets', type: 'Expense', normal_balance: 'Debit' },
    { code: '5810', name: 'Maintenance and Repairs Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '5910', name: 'Rent Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '6010', name: 'Salaries and Wages Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '6110', name: 'Supplies Expense', type: 'Expense', normal_balance: 'Debit' },
    { code: '6210', name: 'Utilities Expense', type: 'Expense', normal_balance: 'Debit' }
];

async function load() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        // Deleting existing accounts to start fresh as per user's "add this CHART OF ACCOUNTS" request
        // First check if there are any journal entries referencing these accounts to avoid FK issues
        const [entries] = await connection.execute('SELECT COUNT(*) as count FROM journal_items');
        if (entries[0].count > 0) {
            console.warn('Warning: Journal items exist. Cannot clear accounts table due to foreign key constraints.');
            console.log('Switching to INSERT IGNORE mode...');
        } else {
            console.log('Clearing existing accounts...');
            await connection.execute('DELETE FROM accounts');
        }

        console.log(`Starting bulk load of ${accounts.length} accounts...`);

        const query = 'INSERT IGNORE INTO accounts (code, name, type, normal_balance) VALUES (?, ?, ?, ?)';
        
        let loaded = 0;
        for (const acc of accounts) {
            await connection.execute(query, [acc.code, acc.name, acc.type, acc.normal_balance]);
            loaded++;
        }

        console.log(`Successfully processed ${loaded} accounts.`);
    } catch (err) {
        console.error('Error loading accounts:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

load();
