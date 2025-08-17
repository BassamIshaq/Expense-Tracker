# Expense Tracker

A full-featured expense tracking application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Add and categorize daily expenses
- Visualize spending with charts (Chart.js)
- Generate monthly reports
- Export data to CSV or PDF
- User authentication and authorization
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React, Material-UI, Chart.js, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Visualization**: Chart.js (react-chartjs-2)
- **Export**: jsPDF, file-saver

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
   - Create a `backend/config/config.env` file with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

4. Seed the database (optional):
```bash
npm run seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default User

When you run the seed command, a default user is created:
- Username: BassamIshaq
- Email: bassam@example.com
- Password: password123

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Expense Routes
- `GET /api/expenses` - Get all expenses for current user
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/monthly/:year/:month` - Get expenses for specific month
- `GET /api/expenses/category-totals/:year/:month` - Get category totals for month

### Category Routes
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `GET /api/categories/:id` - Get single category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Deployment

### Frontend
Build the React app:
```bash
npm run build
```

### Backend
Set `NODE_ENV=production` in your environment variables.

### Full Stack
For Heroku deployment:
```bash
git push heroku main
```

## License

MIT

## Author

BassamIshaq

## Last Updated

2025-08-15 14:16:21