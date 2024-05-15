import  express from 'express';
import taskRouter from './task';
import userRouter from './user';
import path from 'path';

/**
 * Express Application Setup
 * Initialize an instance of the Express application and configure middleware to parse JSON requests.
 * This ensures that incoming request bodies are automatically parsed as JSON.
 */
const app = express();
app.use(express.json());

/**
 * API Routing
 * Define routing for different API endpoints by mounting routers.
 * The taskRouter handles endpoints related to tasks, while the userRouter handles endpoints related to users.
 */
app.use("/tasks", taskRouter); // Mount the taskRouter middleware for handling task-related API endpoints
app.use("/user", userRouter); // Mount the userRouter middleware for handling user-related API endpoints


app.get("/docs", (req, res) => {
   return  res.sendFile(path.join(__dirname, "..", 'docs.html'))
})

app.get("/", (req, res) => {
    return res.send("🎉 Welcome to the Task Manager API! Let's discover together! 🚀 For a better understanding, explore with Postman, and refer to /docs for details. Integrate this with your frontend and explore like a pro! Happy exploring! 📚✨")
})



/**
 * Server Listening
 * Start the server and instruct it to listen on a specified port.
 * Once the server is running, log a message indicating the port number.
 */
const port = 3000; // Define the port number on which the server will listen
app.listen(port, () => {
    console.log(`Server is running on port ${port}`); // Log a message indicating that the server is running and listening on the specified port
});
