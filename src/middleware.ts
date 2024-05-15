import { Request, Response } from "express";
const jwt = require("jsonwebtoken");

/**
 * Custom Request Interface
 * Define an interface extending the standard Express Request interface to include a userId property.
 * This custom request interface allows accessing the userId property within request objects.
 */
interface CustomRequest extends Request {
    userId: string; // userId property represents the user ID associated with the request
}

/**
 * Authentication Middleware Function
 * Middleware function for authenticating incoming requests by verifying JWT tokens.
 * This function extracts the token from the request headers, verifies it using the JWT secret,
 * and extracts the user ID from the decoded token. It then attaches the user ID to the request object.
 * If the token is missing or invalid, it sends an appropriate error response.
 */
export async function middleware(req: CustomRequest, res: Response, next: Function) {
    const token = req.headers.authorization; // Extract the token from the request headers
    try {
        if (!token) {
            return res.status(402).json({
                message: "Token not found / Invalid Token. Please sign up first, then include the JWT token in the Authorization header of each request." // Send an error response if token is missing
            });
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the JWT secret
        const userId = decode.userId; // Extract the user ID from the decoded token
        req.userId = userId; // Attach the user ID to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(403).json({
            message: "Invalid Token" // Send an error response if token is invalid
        });
    }
}
