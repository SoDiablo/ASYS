# ASYS Smart Building Management System

A comprehensive full-stack web application for managing multi-story residential apartment complexes. Built with React.js, Node.js/Express.js, and PostgreSQL.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🌟 Features

- **Multi-Role System**: Manager, Resident, and Security Guard roles
- **Dues Management**: Automated monthly dues generation, payment tracking, late fees
- **Maintenance Requests**: Create, track, and manage maintenance requests
- **Announcements**: System-wide announcements with priority levels
- **Common Area Reservations**: Book gym, meeting rooms, and other facilities
- **Parking Management**: Assign parking spots and track visitor vehicles
- **Reporting Dashboard**: Real-time analytics and PDF report generation
- **User Management**: Complete CRUD operations for residents and staff

## 🚀 Quick Start

### Option 1: Deploy to Render (Recommended)

Click the "Deploy to Render" button above or follow the [Deployment Guide](DEPLOYMENT.md).

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

**Installation:**

1. Clone the repository:
```bash
git clone https://github.com/yourusername/asys-smart-building-system.git
cd asys-smart-building-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asys_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5000
NODE_ENV=development
SEED_DEMO_DATA=true
FRONTEND_URL=http://localhost:3000
```

4. Create and initialize database:
```bash
# Create database
psql -U postgres -c "CREATE DATABASE asys_db;"

# Run schema
psql -U postgres -d asys_db -f database/schema.sql
```

5. Start the application:
```bash
# Start both frontend and backend
npm run dev

# Or start separately:
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend
```

6. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### Option 3: Docker

```bash
docker-compose up -d
```

## 🔐 Default Login Credentials

**Manager Account:**
- Email: `admin@asys.com`
- Password: `Admin123456`

**Demo Resident Account:**
- Email: `resident@asys.com`
- Password: `Resident123`

**Demo Security Account:**
- Email: `security@asys.com`
- Password: `Security123`

> ⚠️ **Important**: Change these credentials in production!

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Deployment Guide](DEPLOYMENT.md) - Deploy to Render, Docker, or other platforms
- [Database Schema](database/schema.sql) - Complete database structure

## 🏗️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, Tailwind CSS, Chart.js |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 14+ |
| Authentication | JWT + BCrypt |
| Deployment | Docker, Render |

## 📁 Project Structure

```
asys-smart-building-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middlewares/     # Auth & validation
│   ├── routes/          # API routes
│   ├── jobs/            # Scheduled tasks
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── utils/       # API client
│   └── public/
├── database/
│   ├── schema.sql       # Database schema
│   └── migrations/      # Schema migrations
├── docker-compose.yml   # Docker configuration
└── package.json         # Dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Dues Management
- `GET /api/dues/apartment/:id` - Get apartment dues
- `POST /api/dues/:id/pay` - Pay dues
- `GET /api/dues/all` - Get all dues (Manager)

### Maintenance
- `POST /api/maintenance/requests` - Create request
- `GET /api/maintenance/requests` - List requests
- `PATCH /api/maintenance/requests/:id/status` - Update status

### Announcements
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement (Manager)
- `DELETE /api/announcements/:id` - Delete announcement (Manager)

### Reservations
- `GET /api/reservations/common-areas` - List common areas
- `POST /api/reservations` - Create reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Parking
- `GET /api/parking/spots` - List parking spots
- `POST /api/parking/visitors` - Register visitor vehicle
- `PATCH /api/parking/spots/:id/assign` - Assign spot (Manager)

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🔒 Security Features

- JWT token authentication
- BCrypt password hashing
- Role-based access control (RBAC)
- Account lockout after failed attempts
- Input sanitization
- SQL injection prevention
- CORS protection
- HTTPS support

## 📊 Key Business Rules

- **Late Fee**: 2% monthly penalty on overdue payments
- **Reservation Limits**: Max 2 hours per session, dues must be paid
- **Maintenance Limits**: Max 3 open requests per resident
- **Parking**: Max 2 spots per apartment
- **Account Security**: 5 failed logins = 15-minute lockout

## 🤝 Contributing

This is an educational project developed for Software Engineering Lab II course.

## 📄 License

MIT License - See LICENSE file for details

## 👥 Team

**CodeForge Team** - Kocaeli University of Health and Technology
- Kusai Aksoy - Team Leader
- Hashem Salem - Data Model
- Namik Hasan - UML Diagrams
- Rama Hasanatu - UI Design
- Melih Kamil USLU - Documentation & UI Design

## 🆘 Support

For issues and questions:
1. Check the [Deployment Guide](DEPLOYMENT.md)
2. Review [API Documentation](API_DOCUMENTATION.md)
3. Open an issue on GitHub

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Mobile-responsive improvements

---

**Built with ❤️ by CodeForge Team**

**Demo**: [Live Demo](https://asys-frontend.onrender.com) (Coming soon)

