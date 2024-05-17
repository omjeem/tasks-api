import { Request, Response, response } from "express";
import { middleware } from "./middleware";
import { SubTaskUpdateSchema, SubTaskUpdateSchemaObject, TaskSchema, TaskUpdateSchema } from "./zod";
import { User } from "./db";
const { ObjectId } = require('mongoose').Types;


const express = require("express");
const taskRouter = express.Router();

/**
 * Task Router Middleware
 * Apply the authentication middleware to the taskRouter to ensure that all routes under taskRouter require authentication.
 * This middleware checks for a valid JWT token in the request headers and attaches the user ID to the request object.
 */
taskRouter.use(middleware);

/**
 * Custom Request Interface
 * Define an interface extending the standard Express Request interface to include a userId property.
 * This custom request interface allows accessing the userId property within request objects.
 */
interface CustomRequest extends Request {
    userId: string; // userId property represents the user ID associated with the request
}



/**
 * Create Task Endpoint
 * Define a route for creating a new task associated with the authenticated user.
 * This endpoint expects a POST request with the task details in the request body.
 * It validates the request body against the TaskSchema schema using Zod.
 * If the request body is valid, it adds the new task to the user's task list in the database.
 * Upon successful creation, it returns the details of the newly created task in the response.
 */
taskRouter.post("/", async (req: CustomRequest, res: Response) => {
    const body = req.body; // Extract the request body
    try {
        const isValid = TaskSchema.safeParse(body); // Validate the request body against the TaskSchema schema using Zod
        if (!isValid.success) {
            return res.status(200).json({
                message: "Invalid Body" // Send an error response if the request body is invalid
            });
        }
        // Add the new task to the user's task list in the database
        const response = await User.findByIdAndUpdate(
            req.userId, // Find user by ID
            { $push: { task: body } }, // Add the new task to the task array
            { new: true, projection: { task: { $slice: -1 } } } // Return only the last added task in the response
        );
        // Return the details of the newly created task in the response
        return res.status(200).json(response.task[0]);
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error", // Send an error response for any internal server error
            error: err // Include the error details in the response for debugging
        });
    }
});





/**
 * Get All Tasks Endpoint
 * Define a route for retrieving all non-deleted tasks associated with the authenticated user.
 * This endpoint expects a GET request.
 * It performs an aggregation query to retrieve all non-deleted tasks associated with the user.
 * The retrieved tasks are formatted and filtered to exclude deleted subtasks.
 * The response contains an array of task objects with their associated subtasks.
 */
taskRouter.get("/", async (req: CustomRequest, res: Response) => {
    try {
        const id = new ObjectId(req.userId); // Convert userId to ObjectId
        // Perform an aggregation query to retrieve non-deleted tasks associated with the user
        const response = await User.aggregate([
            { $match: { _id: id } }, // Match the user by ID
            { $unwind: '$task' }, // Unwind the task array
            { $match: { 'task.isDeleted': false } }, // Match non-deleted tasks
            {
                $project: { // Project fields to include in the response
                    _id: '$task._id', // Include task ID
                    subject: '$task.subject', // Include task subject
                    deadline: '$task.deadline', // Include task deadline
                    status: '$task.status', // Include task status
                    subTask: { // Include subtasks, filtered to exclude deleted subtasks
                        $filter: {
                            input: '$task.subTask', // Specify input array
                            as: 'subTask', // Specify variable for each array element
                            cond: { $eq: ['$$subTask.isDeleted', false] } // Condition to filter non-deleted subtasks
                        }
                    }
                }
            }
        ]);
        return res.status(200).json(response); // Send the formatted response containing non-deleted tasks with associated subtasks
    } catch (err) {
        console.log(err); // Log any errors for debugging
        return res.status(500).json({
            message: "Internal Server Error", // Send an error response for any internal server error
            error: err // Include the error details in the response for debugging
        });
    }
});





/**
 * Update Task Endpoint
 * Define a route for updating an existing task associated with the authenticated user.
 * This endpoint expects a PUT request with the task ID in the URL parameters and the updated task details in the request body.
 * It validates the request body against the TaskUpdateSchema schema using Zod.
 * If the request body is valid, it updates the specified task with the new details in the database.
 * Upon successful update, it returns the details of the updated task in the response.
 */
taskRouter.put("/:taskId", async (req: CustomRequest, res: Response) => {
    const body = req.body; // Extract the request body
    const taskId = req.params.taskId; // Extract the task ID from the URL parameters
    try {
        const isValid = TaskUpdateSchema.safeParse(body); // Validate the request body against the TaskUpdateSchema schema using Zod
        if (!isValid.success) {
            return res.status(200).json({
                message: "Invalid Body" // Send an error response if the request body is invalid
            });
        }
        // Update the specified task with the new details in the database
        const response = await User.findOneAndUpdate(
            { _id: req.userId, "task._id": taskId }, // Find the user and the task by their IDs
            { $set: { "task.$.subject": body.subject, "task.$.deadline": body.deadline, "task.$.status": body.status } }, // Set the new task details
            { new: true, projection: { task: { $elemMatch: { _id: taskId } } } } // Return only the updated task in the response
        );
        // Return the details of the updated task in the response
        return res.status(200).json(response.task[0]);
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error", // Send an error response for any internal server error
            error: err // Include the error details in the response for debugging
        });
    }
});





/**
 * Delete Task Endpoint
 * Define a route for deleting an existing task associated with the authenticated user.
 * This endpoint expects a DELETE request with the task ID in the URL parameters.
 * It marks the specified task as deleted in the database without physically removing it.
 * Upon successful deletion, it sends a success message in the response.
 */
taskRouter.delete("/:taskId", async (req: CustomRequest, res: Response) => {
    const taskId = req.params.taskId; // Extract the task ID from the URL parameters
    try {
        // Mark the specified task as deleted in the database without physically removing it
        const response = await User.findOneAndUpdate(
            { _id: req.userId, "task._id": taskId }, // Find the user and the task by their IDs
            { $set: { "task.$.isDeleted": true } } // Set the isDeleted flag to true for the specified task
        );
        // Send a success message in the response upon successful deletion
        return res.status(200).json({
            message: "Task Deleted Successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error", // Send an error response for any internal server error
            error: err // Include the error details in the response for debugging
        });
    }
});




/**
 * Get Subtasks for Task Endpoint
 * Define a route for retrieving all non-deleted subtasks associated with a specific task of the authenticated user.
 * This endpoint expects a GET request with the task ID in the URL parameters.
 * It performs an aggregation query to find the specified task and retrieve its non-deleted subtasks.
 * The retrieved subtasks are filtered to exclude deleted subtasks.
 * The response contains an array of non-deleted subtask objects associated with the specified task.
 */
taskRouter.get("/:taskId/subtasks", async (req: CustomRequest, res: Response) => {
    const taskId = req.params.taskId; // Extract the task ID from the URL parameters
    try {
        const id = new ObjectId(req.userId); // Convert userId to ObjectId
        // Perform an aggregation query to find the specified task and retrieve its non-deleted subtasks
        const response = await User.aggregate([
            { $match: { _id: id } }, // Match the user by ID
            { $unwind: '$task' }, // Unwind the task array
            { $match: { 'task._id': new ObjectId(taskId) } }, // Match the specified task by its ID
            {
                $project: { // Project fields to include in the response
                    subTask: { // Include subtasks, filtered to exclude deleted subtasks
                        $filter: {
                            input: '$task.subTask', // Specify input array
                            as: 'subTask', // Specify variable for each array element
                            cond: { $eq: ['$$subTask.isDeleted', false] } // Condition to filter non-deleted subtasks
                        }
                    }
                }
            }
        ]);
        if (response.length === 0) {
            return res.status(404).json({
                message: "Task not found" // Send an error response if the specified task is not found
            });
        }
        // Return the non-deleted subtasks associated with the specified task in the response
        return res.status(200).json(response[0].subTask);
    } catch (err) {
        console.log(err); // Log any errors for debugging
        return res.status(500).json({
            message: "Internal Server Error", // Send an error response for any internal server error
            error: err // Include the error details in the response for debugging
        });
    }
});



/**
 * Update Subtasks for Task Endpoint
 * Define a route for updating the subtasks of a specific task associated with the authenticated user.
 * This endpoint expects a PUT request with the task ID in the URL parameters and the updated subtasks in the request body.
 * It validates the request body against the SubTaskUpdateSchema schema using Zod.
 * If the request body is valid, it adds the updated subtasks to the specified task in the database.
 * Upon successful update, it returns the details of the updated subtasks associated with the specified task in the response.
 */
taskRouter.put("/:taskId/subtasks", async (req: CustomRequest, res: Response) => {
    const taskId = req.params.taskId; // Extract the task ID from the URL parameters
    const body = req.body; // Extract the request body
    try {
        const isValid = SubTaskUpdateSchema.safeParse(body); // Validate the request body against the SubTaskUpdateSchema schema using Zod
        if (!isValid.success) {
            return res.status(200).json({
                message: "Invalid Body" // Send an error response if the request body is invalid
            });
        }
        // Add the updated subtasks to the specified task in the database
        const updateTask = await User.findOneAndUpdate(
            {
                _id: req.userId,
                "task._id": taskId
            },
            {
                $push: {
                    "task.$.subTask": body // Add the updated subtasks to the subTask array of the specified task
                }
            }
        );
        // Retrieve the non-deleted subtasks associated with the specified task after the update
        const response = await User.aggregate([
            { $match: { _id: new ObjectId(req.userId) } }, // Match the user by ID
            { $unwind: '$task' }, // Unwind the task array
            { $match: { 'task._id': new ObjectId(taskId) } }, // Match the specified task by its ID
            {
                $project: { // Project fields to include in the response
                    subTask: { // Include subtasks, filtered to exclude deleted subtasks
                        $filter: {
                            input: '$task.subTask', // Specify input array
                            as: 'subTask', // Specify variable for each array element
                            cond: { $eq: ['$$subTask.isDeleted', false] } // Condition to filter non-deleted subtasks
                        }
                    }
                }
            }
        ]);
        // Return the details of the updated subtasks associated with the specified task in the response
        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error", // Send an error response for any internal server error
            error: err // Include the error details in the response for debugging
        });
    }
});


taskRouter.delete("/:taskId/subtasks/:subTaskId", async (req: CustomRequest, res: Response) => {
    const userId = new ObjectId(req.userId); // Extract the user ID from the request
    const taskId = new ObjectId(req.params.taskId); // Extract the task ID from the URL parameters
    const subTaskId = new ObjectId(req.params.subTaskId); // Extract the sub task ID from the URL parameters
    try {
        const updateSubTask = await User.findOneAndUpdate(
            {
                _id: userId,
                "task._id": taskId,
                "task.subTask._id": subTaskId,
            },
            {
                $set: {
                    "task.$.subTask.$[subTask].isDeleted": true,
                },
            },
            {
                arrayFilters: [{ "subTask._id": subTaskId }],
            }
        ); // Send a success message in the response upon successful deletion
        return res.status(200).json({
            message: "Task Deleted Successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error", // Send an error response for any internal server error
            error: err // Include the error details in the response for debugging
        });
    }
});

taskRouter.put("/:taskId/subtasks/:subTaskId", async (req: CustomRequest, res: Response) => {
    const body = req.body; // Extract the request body
    const isValid = SubTaskUpdateSchemaObject.safeParse(body); // Validate the request body against the SubTaskUpdateSchema schema using Zod
    if (!isValid.success) {
        return res.status(400).json({
            message: "Invalid Body" // Send an error response if the request body is invalid
        });
    }
    const userId = new ObjectId(req.userId); // Extract the user ID from the request
    const taskId = new ObjectId(req.params.taskId); // Extract the task ID from the URL parameters
    const subTaskId = new ObjectId(req.params.subTaskId); // Extract the sub task ID from the URL parameters
    try {
        const updateSubTask = await User.findOneAndUpdate(
            {
                _id: userId,
                "task._id": taskId,
                "task.subTask._id": subTaskId,
            },
            {
                $set: {
                    "task.$.subTask.$[subTask].subject": body.subject,
                    "task.$.subTask.$[subTask].deadline": body.deadline,
                    "task.$.subTask.$[subTask].status": body.status,
                },
            },
            {
                arrayFilters: [{ "subTask._id": subTaskId }],
            }
        ); // Send a success message in the response upon successful deletion
        return res.status(200).json({
            message: "Task Updated Successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error", // Send an error response for any internal server error
            error: err // Include the error details in the response for debugging
        });
    }
});


export default taskRouter;
