/*
 * File: ErrorHandler.ts
 * Description: This class will handle all type of errors 
 * Author: hajji
 * Date: 2023-10-19
 * Company: Mo7aMind
 * License: Mo7aMind
 */

class ErrorHandler extends Error {
    statusCode: number; 
    constructor(message: any, statusCode: number) {
        // for more info docs/ErrorHandlerDoc
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor)
    }
}


export default ErrorHandler
