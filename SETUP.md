# Financial Accounting Software - Setup Guide

This is a professional-grade cloud-based financial accounting system built with Node.js, Express, and MySQL.

## 1. Prerequisites
- Node.js (v14+)
- MySQL Server

## 2. Database Setup
1. Create a MySQL database named `accounting_db`.
2. Run the `schema.sql` script to create tables and seed the Chart of Accounts:
   ```bash
   mysql -u root -p accounting_db < schema.sql
   ```

## 3. Configuration
1. Open the `.env` file in the root directory.
2. Update the database credentials (`DB_USER`, `DB_PASS`, `DB_HOST`) as per your environment.

## 4. Installation
Install the required dependencies:
```bash
npm install
```

## 5. Seed Initial Data
Run the seeding script to create an admin user and initial transactions:
```bash
node src/utils/seed.js
```
- **Admin Username**: `admin`
- **Admin Password**: `admin123`

## 6. Running the Application
Start the server:
```bash
npm start
```
By default, the application will be available at `http://localhost:3000`.

## 7. Key Features
- **General Journal**: Enter multi-line balanced entries.
- **Automatic Ledger**: Balances are calculated dynamically from journal entries.
- **Trial Balance**: Always shows Total Debits = Total Credits.
- **Financial Statements**:
  - **Profit & Loss**: Tracks Revenues vs Expenses.
  - **Balance Sheet**: Assets = Liabilities + Equity.
- **Authentication**: JWT-protected API endpoints.
