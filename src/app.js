import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({ origin: process.env.CORS_PATH, credentials: true }));
app.use(cookieParser())

// Commer middlewares
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static("public"));

// Routes
import healthcheckRouter from './routes/healthcheck.routes.js';
app.use("/api/v1/healthcheck",healthcheckRouter)


export  { app };