const db = require('./src/config/db');
const reportService = require('./src/services/reportService');

async function testFilter() {
    try {
        // Find admin user
        const [users] = await db.query('SELECT id FROM users WHERE username = "admin"');
        if (users.length === 0) {
            console.log('Admin user not found');
            return;
        }
        const userId = users[0].id;

        console.log('Testing Trial Balance without dates:');
        const tbAll = await reportService.generateTrialBalance(userId, null, null);
        console.log('Total Rows:', tbAll.rows.length);

        // Try a date range that should be empty (far future)
        console.log('\nTesting Trial Balance with future date range:');
        const tbFuture = await reportService.generateTrialBalance(userId, '2099-01-01', '2099-12-31');
        const activeRows = tbFuture.rows.filter(r => r.debit > 0 || r.credit > 0);
        console.log('Active Rows (should be 0):', activeRows.length);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

testFilter();
