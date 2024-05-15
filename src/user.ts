import { Request, Response } from "express";
import { SignInBody, SignUpBody } from "./zod";
import { User } from "./db";
const express = require("express");
const  jwt = require("jsonwebtoken");
import dotenv from 'dotenv';

dotenv.config();

/**
 * User Router
 * Create an instance of an Express router for handling user-related routes.
 * This router will be used to define endpoints for user-related operations.
 */
const userRouter = express.Router();


/**
 * JWT Secret
 * Retrieve the JWT secret from the environment variables using the JWT_SECRET key.
 * This secret key is used for signing and verifying JSON Web Tokens (JWTs) in the application.
 */
const JWT_SECRET = process.env.JWT_SECRET;


/**
 * User Registration Endpoint
 * Define a route for user registration, allowing users to create new accounts.
 * This endpoint expects a POST request with the user's name, email, and password in the request body.
 * It validates the request body against the SignUpBody schema using Zod.
 * If the request body is valid, it creates a new user record in the database with the provided details.
 * Upon successful registration, it generates a JWT token containing the user ID and sends it back in the response.
 * If the email provided already exists in the database, it returns an error response indicating that the email is already registered.
 */
userRouter.post("/", async (req: Request, res: Response) => {
    try {
        const body = req.body; // Extract the request body
        const isValid = SignUpBody.safeParse(body); // Validate the request body against the SignUpBody schema using Zod
        
        if (!isValid.success) {
            return res.status(403).json({
                message: "Wrong Body" // Send an error response if the request body is invalid
            });
        }
        // Create a new user object with the provided name, email, and password
        const user = new User({ name: body.name, email: body.email, password: body.password });
        // Save the new user record to the database
        const response = await user.save();
        // Generate a JWT token containing the user ID
        const token = jwt.sign({ userId: response._id }, JWT_SECRET);
        // Send a JSON response containing the generated token
        return res.json({
            token // Include the generated token in the response
        });
    } catch (err) {
        return res.status(404).json({
            message: "Email already exists" // Send an error response if the email provided already exists in the database
        });
    }
});


/**
 * User Login Endpoint
 * Define a route for user login, allowing users to authenticate and obtain access tokens.
 * This endpoint expects a POST request with the user's email and password in the request body.
 * It validates the request body against the SignInBody schema using Zod.
 * If the request body is valid, it attempts to find a user record in the database with the provided email and password.
 * If a matching user record is found, it generates a JWT token containing the user ID and sends it back in the response.
 * If no matching user record is found, it returns an error response indicating that the user was not found.
 */
userRouter.get("/", async (req: Request, res: Response) => {
    try {
        const body = req.body; // Extract the request body
        const isValid = SignInBody.safeParse(body); // Validate the request body against the SignInBody schema using Zod
        if (!isValid.success) {
            return res.status(403).json({
                message: "Wrong Body" // Send an error response if the request body is invalid
            });
        }
        // Find a user record in the database with the provided email and password
        const response = await User.findOne({ email: body.email, password: body.password });
        if (!response) {
            return res.status(404).json({
                message: "User not found" // Send an error response if no matching user record is found
            });
        }
        // Generate a JWT token containing the user ID
        const token = jwt.sign({ userId: response._id }, JWT_SECRET);
        // Send a JSON response containing the generated token
        return res.status(200).json({
            token // Include the generated token in the response
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server error" // Send an error response for any internal server error
        });
    }
});


export default userRouter;
