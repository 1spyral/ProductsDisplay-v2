# How to seed database
1. Obtain Postgres information
2. Set environment variables in .env
3. `npm install`
4. `npm run seed`

Google Cloud SQL Connection instructions: https://cloud.google.com/sql/docs/postgres/connect-instance-local-computer#node.js

```bash
$env:GOOGLE_APPLICATION_CREDENTIALS="CREDENTIALS_JSON_FILE"
$env:INSTANCE_HOST="127.0.0.1"
$env:DB_PORT="5432"
$env:DB_NAME="quickstart_db"
$env:DB_USER="quickstart-user"
$env:DB_PASS="YOUR_DB_PASSWORD"
```

```bash
wget https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.0.0/cloud-sql-proxy.x64.exe 
-O cloud-sql-proxy.exe
```

```bash
Start-Process -filepath  ".\cloud-sql-proxy.exe" -ArgumentList `
"--credentials-file $env:GOOGLE_APPLICATION_CREDENTIALS" INSTANCE_CONNECTION_NAME
```