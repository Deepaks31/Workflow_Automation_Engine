🚀 Enterprise Workflow Automation Engine

An enterprise-level workflow system to manage multi-level approvals with role-based access, escalations, and real-time tracking.

✨ Features

Role-based authentication (Admin, Initiator, Manager, Finance)

Configurable multi-level workflows

Request approval & rejection flow

Automatic escalation on SLA breach

Dedicated dashboards for each role

Real-time request tracking

🛠 Tech Stack

Frontend

React (Vite)

Axios

Tailwind CSS

Backend

Spring Boot

JPA / Hibernate

Maven

Database

MySQL

📁 Project Structure
Workflow_Automation/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   └── auto/
│       ├── src/main/java/
│       ├── src/main/resources/
│       ├── pom.xml
│       └── mvnw
│
└── README.md

⚙️ Setup
Backend

Open backend in IntelliJ IDEA

Create application.properties (ignored by Git)

spring.datasource.url=jdbc:mysql://localhost:3306/workflow_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update


Run:

./mvnw spring-boot:run


Backend → http://localhost:8080

Frontend

Open frontend in VS Code

Install dependencies:

npm install


Start app:

npm run dev


Frontend → http://localhost:5173

🔁 Sample APIs

GET /api/requests/pending/manager/{id}

GET /api/requests/pending/finance/{id}/view

PUT /api/requests/{id}/approve

PUT /api/requests/{id}/reject

🔒 Security

application.properties is ignored

Never commit credentials

Use environment variables for production

👨‍💻 Author

Deepak S
B.Tech – Information Technology
