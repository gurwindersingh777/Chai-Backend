import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from 'dotenv';
dotenv.config({
  path: "./env"
})

const PORT = process.env.PORT || 3000;

connectDB()
  .then(
    app.listen(PORT, () => {
      console.log(`Server is listing on Port : ${PORT}`);
    })
  )
  .catch(()=>{
    console.log(`MongoDB connection error`,Error)
  })

