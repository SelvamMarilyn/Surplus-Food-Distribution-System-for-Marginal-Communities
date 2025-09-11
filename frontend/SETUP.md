# Surplus Food Distribution System - Frontend Setup

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

## Installation & Running

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start the development server:**
```bash
npm start
```

The application will start on `http://localhost:3000`

## Project Structure

```
frontend/src/
├── components/
│   ├── AdminDashboard.js      # Temporary UI showcase
│   ├── AdminLogin.js          # Admin login page
│   ├── AdminPanel.js          # Main admin functionality
│   ├── DonorDashboard.js      # Donor dashboard
│   ├── DonorRegistrationForm.js # Donor registration
│   ├── DeliveryProofModal.js  # Delivery proof modal
│   ├── FoodTracking.js        # Food tracking component
│   ├── HomePage.js            # Landing page
│   ├── LoginPage.js           # Login page
│   ├── NGODashboard.js        # NGO dashboard
│   └── NGORegistrationForm.js # NGO registration
├── utils/
│   └── api.js                 # API configuration
└── App.js                     # Main app component
```

## Key Features

### 1. Donor Dashboard
- **Upload Food Items:** Upload surplus food with photos and details
- **Donation History:** View all past and current donations
- **Analytics:** Track donation impact and statistics
- **Profile Management:** Update restaurant information

### 2. NGO Dashboard
- **Available Food:** Browse and request available food items
- **Heat Map:** Visual map showing food availability and service areas
- **Request Management:** Track food requests and delivery status
- **Delivery History:** View completed deliveries
- **Service Areas:** Manage slum area coverage

### 3. Admin Panel
- **Donor Approvals:** Review and approve/reject donor applications
- **NGO Approvals:** Review and approve/reject NGO applications
- **User Management:** Manage all users (donors and NGOs)
- **Reports & Analytics:** System-wide statistics and reports

## User Flows

### Donor Registration Flow
1. Register with basic info (name, email, password)
2. Verify email with OTP
3. Complete profile (restaurant details)
4. Upload verification documents
5. Wait for admin approval
6. Start uploading food items

### NGO Registration Flow
1. Register with basic info (name, email, password)
2. Verify email with OTP
3. Complete profile (organization details)
4. Upload verification documents
5. Wait for admin approval
6. Add service areas (slum areas)
7. Start requesting food items

### Food Distribution Flow
1. Donor uploads surplus food item
2. NGO sees available food and requests it
3. Donor gets notification of request
4. NGO picks up food
5. NGO marks delivery with proof
6. System tracks completion

## API Integration

The frontend uses the `api.js` utility for all backend communication:

```javascript
import { api } from '../utils/api';

// Example API calls
const response = await api.get('/food/available');
const response = await api.post('/food/upload', formData);
```

## Authentication

- **Donors:** Email stored in `localStorage` as `donorEmail`
- **NGOs:** Email stored in `localStorage` as `ngoEmail`
- **Admins:** Authentication status in `localStorage` as `isAuthenticated`

## Styling

The application uses CSS modules and custom styling:
- `DonorDashboard.css` - Donor dashboard styles
- `NGODashboard.css` - NGO dashboard styles
- `AdminDashboard.css` - Admin dashboard styles
- `LoginPage.css` - Login page styles

## Map Integration

The NGO dashboard includes a Leaflet map for:
- Visualizing food availability
- Showing service areas
- Heat map of food distribution

## File Uploads

The system handles file uploads for:
- Food item photos
- Verification documents
- Delivery proof photos

## Responsive Design

The application is designed to work on:
- Desktop computers
- Tablets
- Mobile devices

## Testing

To test the application:

1. **Start both backend and frontend servers**
2. **Register as a donor:**
   - Go to donor registration
   - Complete the flow
   - Upload a food item

3. **Register as an NGO:**
   - Go to NGO registration
   - Complete the flow
   - Request food items

4. **Admin approval:**
   - Login as admin (admin/password)
   - Approve users and manage system

## Troubleshooting

1. **API Connection Issues:**
   - Ensure backend is running on port 5000
   - Check CORS settings
   - Verify API endpoints

2. **File Upload Issues:**
   - Check file size limits
   - Verify file types are supported
   - Ensure backend upload directories exist

3. **Map Not Loading:**
   - Check internet connection
   - Verify Leaflet CSS is imported
   - Check browser console for errors

4. **Authentication Issues:**
   - Clear localStorage
   - Check email verification status
   - Verify user approval status

