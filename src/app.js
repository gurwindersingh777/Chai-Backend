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
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import tweetRouter from './routes/tweet.routes.js'

// Calling Routes
app.use("/api/v1/users", userRouter); // https://localhost:8000/api/v1/users
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweets", tweetRouter)


export { app };