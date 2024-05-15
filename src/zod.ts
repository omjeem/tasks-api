const z = require('zod');

/**
 * Zod Validation Schemas
 * Define validation schemas using Zod for different request bodies and data structures.
 * These schemas ensure that incoming data adheres to specific constraints and formats.
 */

// SignUpBody Schema
const SignUpBody = z.object({
    name: z.string().min(3).max(255), // Name must be a string with a minimum length of 3 and a maximum length of 255 characters
    email: z.string().email(), // Email must be a valid email address format
    password: z.string().min(1).max(255) // Password must be a string with a minimum length of 1 and a maximum length of 255 characters
});

// SignInBody Schema
const SignInBody = z.object({
    email: z.string().email(), // Email must be a valid email address format
    password: z.string().min(1).max(255) // Password must be a string with a minimum length of 1 and a maximum length of 255 characters
});

// TaskSchema Schema
const TaskSchema = z.object({
    subject: z.string().min(3).max(255), // Subject must be a string with a minimum length of 3 and a maximum length of 255 characters
    deadline: z.string(), // Deadline must be a string
    status: z.enum(["Pending", "Completed", "Overdue"]), // Status must be one of the specified enum values
    isDeleted: z.boolean(), // isDeleted must be a boolean value
    subTask: z.array(z.object({ // SubTask must be an array of objects, each adhering to a specific schema
        subject: z.string().min(3).max(255), // Subtask subject must be a string with a minimum length of 3 and a maximum length of 255 characters
        deadline: z.string(), // Subtask deadline must be a string
        status: z.enum(["Pending", "Completed", "Overdue"]), // Subtask status must be one of the specified enum values
        isDeleted: z.boolean() // Subtask isDeleted must be a boolean value
    })).optional() // Subtask array is optional
});

// TaskUpdateSchema Schema
const TaskUpdateSchema = z.object({
    subject: z.string().min(3).max(255).optional(), // Subject update is optional
    deadline: z.string().optional(), // Deadline update is optional
    status: z.enum(["Pending", "Completed", "Overdue"]).optional() // Status update is optional
});

// SubTaskUpdateSchema Schema
const SubTaskUpdateSchema = z.array(z.object({
    subject: z.string().min().max().optional(), // Subtask subject update is optional
    deadline: z.string().optional(), // Subtask deadline update is optional
    status: z.enum(["Pending", "Completed", "Overdue"]).optional(), // Subtask status update is optional
    _id: z.string() // Subtask ID is required
}));

/**
 * Export Validation Schemas
 * Make the defined Zod validation schemas available for use in other parts of the application.
 */
export { SignUpBody, SignInBody, TaskSchema, TaskUpdateSchema, SubTaskUpdateSchema };
