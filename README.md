# 💳 Finance Management Platform

A complete microfinance, loan management, and collection tracking ecosystem featuring a Web Dashboard, Mobile Application, and Backend Server.

## 📂 Repository Components

- **[FinanceWeb](file:///d:/DEVELOPMENT%20PROJECT/personal%20project/Finance/FinanceWeb)**: Modern React 18 + Vite web dashboard for SuperAdmins and Branch Admins to govern organizations, manage loans, onboard shopkeepers/merchants, assign agents, and generate reports.
- **[FinanceApp](file:///d:/DEVELOPMENT%20PROJECT/personal%20project/Finance/FinanceApp)**: Mobile application interface designed for field agents and collection officers on the go.
- **[server](file:///d:/DEVELOPMENT%20PROJECT/personal%20project/Finance/server)**: Backend API handling authentication, database storage, multi-tenant organization logic, and loan calculation engines.

---

## 🗄️ Database Configuration & Migration (TiDB Cloud & Local MySQL)

The backend engine is engineered for both **TiDB Cloud Serverless / AWS** and **Local MySQL (5.7 / 8.x)**.

### Switching Databases in `server/.env`:

1. **For TiDB Cloud (Cloud Serverless / AWS)**:
   ```env
   DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
   DB_PORT=4000
   DB_USER=GQJ38LHiqzuffe7.root
   DB_PASSWORD=dkLYeg6FQUGRhHf3
   DB_NAME=fund_lending_app
   DB_SSL=true
   DATABASE_URL="mysql://GQJ38LHiqzuffe7.root:dkLYeg6FQUGRhHf3@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/fund_lending_app?sslaccept=strict"
   ```

2. **For Local MySQL**:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=fund_lending_app
   DB_SSL=false
   DATABASE_URL="mysql://root:@127.0.0.1:3306/fund_lending_app"
   ```

### Running Migrations and Seeds:
```bash
# In the server directory:
npm run db:migrate   # Executes multi-tenant schema DDL, constraints, indexes & initial seeds
npm run db:seed      # Seeds or verifies initial multi-tenant test data and admin users
```

---

For detailed documentation on the web platform's features, pages, components, and design system, refer to **[FinanceWeb README](file:///d:/DEVELOPMENT%20PROJECT/personal%20project/Finance/FinanceWeb/README.md)**.

