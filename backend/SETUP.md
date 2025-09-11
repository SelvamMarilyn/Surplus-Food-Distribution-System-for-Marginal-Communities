# Surplus Food Distribution System - Backend Setup

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Database Setup

1. **Create PostgreSQL Database:**
```sql
CREATE DATABASE food_distribution;
```

2. **Run the database schema:**
```bash
# Connect to your PostgreSQL database and run:
psql -U your_username -d food_distribution -f database_schema.sql
```

3. **Set up environment variables:**
Create a `.env` file in the backend directory:
```env
# Database Configuration
DB_USER=your_postgres_username
DB_HOST=localhost
DB_DATABASE=food_distribution
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# Email Configuration (for OTP and notifications)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
```

## Installation & Running

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Start the server:**
```bash
npm start
# or
node server.js
```

The server will start on `http://localhost:5000`

## API Endpoints

### Donor Routes (`/api/donors`)
- `POST /register` - Register new donor
- `POST /verify-email` - Verify email with OTP
- `POST /update-profile` - Update donor profile
- `POST /upload-document` - Upload verification documents

### NGO Routes (`/api/ngo`)
- `POST /register` - Register new NGO
- `POST /verify-email` - Verify email with OTP
- `POST /update-profile` - Update NGO profile
- `POST /upload-document` - Upload verification documents
- `POST /login` - NGO login

### Admin Routes (`/api/admin`)
- `POST /login` - Admin login
- `GET /donors` - Get pending donors
- `GET /all-donors` - Get all donors
- `POST /approve-donor/:id` - Approve donor
- `POST /reject-donor/:id` - Reject donor
- `GET /ngos` - Get all NGOs
- `POST /approve-ngo/:id` - Approve NGO
- `POST /reject-ngo/:id` - Reject NGO

### Food Routes (`/api/food`)
- `POST /upload` - Upload food item (donors)
- `GET /available` - Get available food items
- `GET /donor/:email` - Get donor's food items
- `POST /request` - Request food item (NGOs)
- `GET /requests/ngo/:ngoEmail` - Get NGO's requests
- `PUT /requests/:requestId/status` - Update request status
- `GET /slum-areas` - Get all slum areas
- `POST /service-areas` - Add NGO service area
- `GET /service-areas/:ngoEmail` - Get NGO service areas

## File Upload Structure
```
backend/
├── uploads/
│   ├── food_photos/          # Food item photos
│   ├── ngo_docs/            # NGO documents
│   └── delivery_proofs/     # Delivery proof photos
```

## Default Admin Account
- Username: `admin`
- Password: `password`

**Important:** Change the default admin password in production!

## Testing the API

You can test the API using tools like Postman or curl:

```bash
# Test server health
curl http://localhost:5000/

# Register a donor
curl -X POST http://localhost:5000/api/donors/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Donor","email":"test@example.com","password":"password123"}'
```

## Troubleshooting

1. **Database Connection Issues:**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Email Issues:**
   - Use Gmail App Password (not regular password)
   - Enable 2-factor authentication on Gmail
   - Check EMAIL_USER and EMAIL_PASS in `.env`

3. **File Upload Issues:**
   - Ensure upload directories exist
   - Check file permissions
   - Verify file size limits

4. **Port Issues:**
   - Change PORT in `.env` if 5000 is occupied
   - Update frontend API URLs accordingly

