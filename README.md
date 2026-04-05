# Finance Manager

A high-performance financial management application built with a modern **Fintech Aesthetic**. This project features a dark-mode UI (Pitch Black & Limeade) and a Spring Boot backend to handle financial data, role-based access control, and real-time analytics.

---

## Features

### Authentication & Security
- **JWT-Based Authorization**: Secure session management using JSON Web Tokens.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full system control, user management, and global record visibility.
  - **Analyst**: Access to system-wide analytics and record history.
  - **Viewer**: Personal financial tracking and individual dashboard.
- **Rate Limiting**: Integrated **Bucket4j** to protect APIs from brute-force and spam.

### Dashboard & Analytics
- **Intelligence Hub**: Real-time overview of Net Balance, Total Income, and Total Expenses.
- **Visual Data**: Interactive charts built with **Recharts** showing weekly trends and spending distributions.
- **Recent Activity**: Live stream of the latest transactions across the account.

### Records Management
- **Transaction Ledger**: A high-density table for managing income and expenses with precision filtering (date range, category, type).
- **User Directory**: (Admin/Analyst only) Quick-switch interface to view financial metrics of specific users.

### User Management
- **Administrative Console**: Manage user roles and account statuses (Active/Inactive).
- **Online Tracking**: Real-time "Pulse" indicators showing user activity status.

---

## Design System
The application uses a custom-curated **Fintech Night** theme:
- **Primary Color**: `#A3E635` (Limeade Green)
- **Background**: `#000000` (Pitch Black)
- **Typography**: **Outfit** (via Google Fonts)
- **Aesthetic**: Glassmorphism, neon highlights, and smooth micro-animations via **Framer Motion**.

---

## Technology Stack

### Backend
- **Framework**: Spring Boot 4.x
- **Language**: Java 21
- **Database**: PostgreSQL
- **Security**: Spring Security + JWT
- **Documentation**: Swagger/OpenAPI 3 (SpringDoc)
- **Utilities**: Lombok, Validation, Bucket4j

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **API Client**: Axios

---

## Getting Started

### Backend Setup
1. Navigate to the root directory.
2. Configure your database credentials in `src/main/resources/application.properties`.
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Access the API documentation at: `http://localhost:8080/swagger-ui.html`

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The application will be available at: `http://localhost:5173`

---

## Project Structure
```text
finance-manager/
├── src/main/java/      # Spring Boot Backend source
├── src/main/resources/ # Configuration & Assets
├── frontend/           # React Frontend (Vite)
│   ├── src/components/ # UI Components
│   ├── src/utils/      # API configurations
│   └── src/index.css   # Global Fintech styles
└── pom.xml             # Maven dependencies
```
