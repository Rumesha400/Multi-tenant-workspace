# Multi-Tenant Management System

A scalable, enterprise-grade full-stack application for managing products, projects, and tasks across multiple organizations with role-based access control.

---

## 🏗️ Architecture Overview

**Backend**: FastAPI with async MongoDB integration, JWT authentication, and Pydantic validation  
**Frontend**: React 19 with TypeScript, Redux Toolkit for state management, and Radix UI for accessible components

---

## ✨ Core Features

- **Multi-Tenancy**: Complete organization and workspace isolation
- **Project Management**: Granular project-level permissions and access control
- **Task Management**: Kanban board with drag-and-drop functionality
- **Authentication**: JWT-based auth with secure password hashing (bcrypt)
- **Real-time Updates**: Optimistic UI updates with Redux Toolkit Query
- **Responsive Design**: Mobile-first approach with Tailwind CSS

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB 5.0+

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
**API Documentation**: `http://localhost:8000/docs`

### Frontend Development
```bash
cd frontend
npm ci or npm install
npm run dev
```
**Application**: `http://localhost:5173`

---

## 📁 Project Structure

```
multi-tenant-workspace/
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── core/               # Config & security
│   │   ├── db/                 # Database connection
│   │   ├── utils/              # Helper utilities
│   │   ├── routes/             # API endpoints
│   │   ├── schemas/            # Pydantic models
│   │   └── main.py             # Application entry point
│   └── requirements.txt        # Python dependencies
│
└── frontend/                   # React TypeScript Application
    ├── src/
    │   ├── components/         # UI components
    │   ├── hooks/              # Custom hooks
    │   ├── pages/              # Route-level components
    │   ├── routes/             # React Router configuration
    │   ├── store/              # Redux store
    │   ├── types/              # TypeScript type definitions
    │   └── App.tsx             # Root component
    ├── package.json            # Node.js dependencies
    └── vite.config.ts          # Vite build configuration
```
---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows established patterns
- TypeScript types are comprehensive
- API changes include proper validation
- UI components maintain accessibility standards

---

**Built with ❤️ for modern development teams.**
