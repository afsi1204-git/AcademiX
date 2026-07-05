# Academix LMS

Academix is a full-stack Learning Management System built with the MERN stack. It supports student, instructor, and admin workflows for courses, enrollments, quizzes, payments, and notifications.

## Features

- User authentication and role-based access
- Course creation, editing, and listing
- Student enrollment and course progress tracking
- Quiz and assessment management
- Payment integration with Razorpay
- Notification system
- Admin dashboard and teacher approval flow

## Tech Stack

- Frontend: React, Redux Toolkit, React Router, Tailwind CSS, Framer Motion
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT
- Other services: Cloudinary, Nodemailer, Razorpay

## Project Structure

- backend/ — API server, routes, controllers, models, middleware
- frontend/ — React app and UI components
- docs/ — project documentation

## Prerequisites

Make sure you have the following installed:

- Node.js 16+
- npm
- MongoDB (local or Atlas)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/afsi1204-git/Academix.git
cd Academix
```

### 2. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 3. Configure environment variables

Create environment files from the examples:

Backend:

```bash
cd ../backend
copy .env.example .env
```

Frontend:

```bash
cd ../frontend
copy .env.example .env
```

Update the values in the .env files. At minimum, set your MongoDB URI and JWT secret for the backend.

### 4. Run the application

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm start
```

Open http://localhost:3000 in your browser.

## Default Backend Port

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Testing

Run backend tests with:

```bash
cd backend
npm test
```

## Notes

- If you use MongoDB Atlas, update MONGODB_URI in backend/.env.
- If the frontend cannot connect to the API, confirm REACT_APP_API_URL in frontend/.env.
- For payment and upload features, configure Razorpay and Cloudinary credentials in backend/.env.
