
# EduHub - Learning Management System (MERN Stack)

Welcome to EduHub. This project has two parts:

- `backend/` — the server and API
- `frontend/` — the React app visitors use in the browser

You can run both parts locally and test the app on your computer.

##What You Will Do
- Install the backend and frontend packages
- Configure the environment files
- Start the backend server on `http://localhost:5000`
- Start the frontend app on `http://localhost:3000`
- Use the app as a student, instructor, or admin

## Requirements

Before you begin, install these tools:

- Node.js (version 16 or later)
- npm (comes with Node.js)
- MongoDB (either local or Atlas)
- A terminal or command prompt

##  Step-by-Step Run Instructions

### 1. Open the project folder

Open a terminal and go to the project folder:

```bash
cd "c:/Users/bhava/Downloads/LMS-portal-main/LMS-portal-main/LMS-main"
```

### 2. Backend setup

1. Go to the backend folder:

```bash
cd backend
```

2. Install backend dependencies:

```bash
npm install
```

3. Copy the example environment file:

```bash
copy .env.example .env
```

4. Open `backend/.env` and add these values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@eduhub.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

5. Start the backend server:

```bash
npm run dev
```

The backend should now be running at:

- `http://localhost:5000`

### 3. Frontend setup

Open a second terminal window and go to the frontend folder:

```bash
cd "c:/Users/bhava/Downloads/LMS-portal-main/LMS-portal-main/LMS-main/frontend"
```

Install frontend dependencies:

```bash
npm install
```

Copy the example environment file:

```bash
copy .env.example .env
```

Open `frontend/.env` and add these values:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Start the frontend app:

```bash
npm start
```

The frontend should open at:

- `http://localhost:3000`

##  Using the app

After both servers are running:

- Open `http://localhost:3000`
- Register a new account
- Log in to the app
- Browse and enroll in courses
- Try creating a course if you are an instructor
- Check the admin features if you have admin access

##  Checklist for completion

Make sure you can do all of the following:

- Start the backend without errors
- Start the frontend without errors
- Open the app in the browser
- Register and log in successfully
- View course listings
- Enroll in a course
- See the frontend connect to the backend API

##  Troubleshooting

If the backend install fails:

- Open `backend/package.json`
- Find `jsonwebtoken`
- Make sure it is set to `"^9.0.3"`

If the frontend does not start:

- Open `frontend/.env`
- Make sure `REACT_APP_API_URL` is `http://localhost:5000/api`

If MongoDB is not running:

- Start your local MongoDB service
- Or use MongoDB Atlas and update `MONGODB_URI`

##  Folder overview

- `backend/` — server code, API routes, models, middleware
- `frontend/` — React app, pages, components, store
- `docs/` — documentation files

##  Helpful notes

- Use two terminals: one for backend, one for frontend.
- Stop servers with `Ctrl + C`.
- The backend runs on port 5000 and the frontend runs on port 3000.
