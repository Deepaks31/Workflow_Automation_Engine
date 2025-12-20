🚀 Enterprise Workflow Automation Engine

An Enterprise Workflow Automation Engine designed to automate and manage multi-level approval workflows with role-based access, escalations, and real-time tracking.
This system enables organizations to configure workflows dynamically and streamline approval processes across departments like Initiator, Manager, Finance, and Admin.

📌 Features
🔐 Authentication & Authorization

Role-based login (Admin, Initiator, Manager, Finance)

Secure access using user roles

Protected routes on frontend

🧩 Workflow Management

Create configurable workflows

Define multiple approval levels

Conditional approvals based on request data

Escalation handling for delayed approvals

📨 Request Handling

Initiators can submit requests

Managers & Finance teams can review, approve, or reject

View detailed request information in modal view

Auto refresh of pending requests

⏱️ Escalation System

Automatic escalation if approval exceeds defined SLA

Escalation status visible to approvers

📊 Dashboards

Admin Dashboard – workflow configuration & monitoring

Manager Dashboard – pending approvals

Finance Dashboard – financial approvals

Initiator Dashboard – request tracking

🛠️ Tech Stack
Frontend

⚛️ React (Vite)

Axios

Tailwind CSS / Custom CSS

Role-based routing

Backend

☕ Spring Boot

RESTful APIs

JPA / Hibernate

Maven

Database

🐬 MySQL

Tools

Git & GitHub

VS Code (Frontend)

IntelliJ IDEA (Backend)

📂 Project Structure
Workflow_Automation/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   └── auto/
│       ├── src/main/java
│       ├── src/main/resources
│       ├── pom.xml
│       └── mvnw
│
└── README.md

⚙️ Setup Instructions
🔧 Backend (Spring Boot)

Open backend project in IntelliJ IDEA

Configure MySQL database

Create application.properties (ignored by Git)

spring.datasource.url=jdbc:mysql://localhost:3306/workflow_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update


Run the application:

./mvnw spring-boot:run


Backend runs on:

http://localhost:8080

🎨 Frontend (React)

Open frontend folder in VS Code

Install dependencies:

npm install


Start development server:

npm run dev


Frontend runs on:

http://localhost:5173

🔁 API Overview (Sample)
Method	Endpoint	Description
GET	/api/requests/pending/manager/{id}	Manager pending requests
GET	/api/requests/pending/finance/{id}/view	Finance pending requests
PUT	/api/requests/{id}/approve	Approve request
PUT	/api/requests/{id}/reject	Reject request
🔒 Security Notes

Sensitive files like application.properties are ignored using .gitignore

Credentials should never be committed

Use environment variables or Spring profiles for production

🚧 Future Enhancements

Email notifications for approvals & escalations

Audit logs & reports

Workflow visualization UI

SLA analytics dashboard

Docker support

OAuth / JWT authentication

👨‍💻 Author

Deepak S
B.Tech Information Technology
Passionate about Full-Stack Development & Enterprise Applications

📜 License

This project is developed for academic and learning purposes.
You are free to modify and extend it.