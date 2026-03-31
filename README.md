# Roamify - Dynamic Web Application

This project is a dynamic travel/tourism web application upgraded from a static HTML site.
It includes a Node.js Express backend and a MongoDB atlas connection to handle contacts and bookings.

## Project Structure

```
├── api/             # Backend server routes and logic
│   └── index.js     # Single express entrypoint handling /api/contact and /api/booking
├── css/             # Stylesheets (if any)
├── index.html       # Entry point for the frontend
├── script.js        # Logic for UI features, Wishlist, and Backend fetch calls
├── package.json     # Node dependencies and scripts
└── vercel.json      # Configuration for Vercel deployment
```

## Setup Instructions

1. **Install Dependencies**
   Run the following command in your terminal:
   ```bash
   npm install
   ```

2. **Configure Database**
   - Create a MongoDB Atlas cluster.
   - Copy `.env.example` to `.env` and replace the placeholder with your MongoDB connection string.

3. **Run Locally**
   Use this command to start the Express server locally:
   ```bash
   npm start
   ```

## Deployment

This website is structured to be deployed on **Vercel**:
1. Push your repository to GitHub.
2. Sign in to Vercel and import your repository.
3. In Vercel's Environment Variables setting for the project, add `MONGODB_URI` with your connection string.
4. Deploy! Vercel will automatically host the standard HTML frontend, while `vercel.json` maps `/api/` traffic to the backend serverless functions in `api/index.js`.
