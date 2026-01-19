# Quotation Generation Web Application

A full-stack quotation generation system built with Node.js, React, and PostgreSQL.

## Features

### User Features
- Browse product catalog
- Add items to cart
- Submit quotation requests (with or without registration)
- Track quotation status (for registered users)
- Multi-language support (English, Hindi, Kannada)

### Admin Features
- Dashboard with statistics and analytics
- Manage quotations (view, update status)
- Manage items (add, edit, delete)
- Configure discounts and tax rates (IGST/CGST/SGST)
- Receive notifications via WhatsApp and Email

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, react-i18next
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Notifications**: Twilio WhatsApp API, Nodemailer

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE quotation_db;
```

### 3. Environment Configuration

Copy the example environment file and update with your settings:

```bash
cd backend
cp .env.example .env
```

Update `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quotation_db
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
JWT_SECRET=your-secure-secret-key
```

### 4. Start the Application

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. Default Admin Login

On first run, a default admin account is created:
- **Email**: admin@quotationgen.com
- **Password**: admin123

> **Important**: Change the admin password after first login!

## Project Structure

```
Quotation_Gen/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and email config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Email & WhatsApp services
│   │   └── app.js          # Express app entry
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── i18n/           # Translations
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Items (Public)
- `GET /api/items` - List all active items
- `GET /api/items/:id` - Get item details
- `GET /api/items/categories` - Get categories

### Quotations
- `POST /api/quotations` - Create quotation
- `GET /api/quotations/my` - Get user's quotations
- `GET /api/quotations/:id` - Get quotation details

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/quotations` - List all quotations
- `PATCH /api/admin/quotations/:id/status` - Update status
- `GET /api/admin/items` - List all items
- `POST /api/admin/items` - Create item
- `PUT /api/admin/items/:id` - Update item
- `DELETE /api/admin/items/:id` - Delete item

## Configuring Notifications

### WhatsApp (Twilio)

1. Create a Twilio account and enable WhatsApp
2. Add these to your `.env`:
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP_NUMBER=whatsapp:+91xxxxxxxxxx
```

### Email (Gmail SMTP)

1. Enable 2FA on your Google account
2. Generate an App Password
3. Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@yourcompany.com
```

## Quotation Status Flow

```
Pending → Under Review → Approved → Converted to Order
                      ↘ Rejected
```

## Multi-language Support

The application supports:
- **English** (en) - Default
- **Hindi** (hi) - हिंदी
- **Kannada** (kn) - ಕನ್ನಡ

Users can switch languages from the navbar dropdown.

## License

MIT
