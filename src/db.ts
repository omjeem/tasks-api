import dotenv from 'dotenv';
const mongoose = require('mongoose');

/**
 * Dotenv Configuration
 * Load environment variables from a .env file into process.env.
 * This allows sensitive configuration settings to be kept separate from the codebase.
 */
dotenv.config();


/**
 * MongoDB Connection
 * Establish a connection to the MongoDB database using the provided DATABASE_URL environment variable.
 * This connects the application to the MongoDB database server.
 */
mongoose.connect(process.env.DATABASE_URL);

/**
 * Task Status Enum
 * Define an enumeration of task statuses with three possible values: Pending, Completed, and Overdue.
 * This enumeration is used to specify the status of tasks and subtasks.
 */
enum Status {
    Pending = "Pending",
    Completed = "Completed",
    Overdue = "Overdue"
}

/**
 * Subtask Schema
 * Define the schema for subtasks, including attributes such as subject, deadline, status, and deletion flag.
 * Subtasks are associated with tasks and can have their own status and deletion status.
 */
const subTaskSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    deadline: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: Status.Pending // Default status for subtasks is set to 'Pending'
    },
    isDeleted: {
        type: Boolean,
        default: false // Default deletion status for subtasks is set to 'false'
    }
});

/**
 * Task Schema
 * Define the schema for tasks, including attributes such as subject, deadline, status, deletion flag, and subtasks.
 * Tasks can have their own status and deletion status and can contain multiple subtasks.
 */
const TaskSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    deadline: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: Status.Pending // Default status for tasks is set to 'Pending'
    },
    isDeleted: {
        type: Boolean,
        default: false // Default deletion status for tasks is set to 'false'
    },
    subTask: [subTaskSchema] // Associate subtask schema with tasks
});

/**
 * User Schema
 * Define the schema for users, including attributes such as name, email, password, and tasks.
 * Users have associated tasks, which can contain subtasks.
 */
const userSchema = new mongoose.Schema({
    name: { type: String, required: true }, // User's name is required
    email: { type: String, required: true }, // User's email is required
    password: { type: String, required: true }, // User's password is required
    task: [TaskSchema] // Associate task schema with users
});

/**
 * User Model
 * Create a Mongoose model named 'User' based on the userSchema.
 * This model represents users in the MongoDB database.
 */
const User = mongoose.model('User', userSchema);

/**
 * Export User Model
 * Make the User model available for use in other parts of the application.
 */
export { User };



