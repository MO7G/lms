import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import ejs from "ejs";
import path from "path";


// Handler function for rendering the template page
export const showTemplates = (req: Request, res: Response) => {
    // Assuming your HTML file is located in the views directory
    const htmlFilePath = path.join(__dirname, "../views/template.html");

    // Render the HTML file
    res.sendFile(htmlFilePath);
};

export const activationMailTemplate = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = {
                user: {
                    name: "John Doe"
                },
                activationCode: "ABC123"
            };
            // Your rendering logic here
            var html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);
            console.log("Rendered HTML:", html); // Log the rendered HTML
            console.log("this is called later 2");
    
            // Set the Content-Type header to indicate HTML content
            res.writeHead(200, { 'Content-Type': 'text/html' });
    
            // Send the rendered HTML content in the response body
            res.end(html);
        } catch (error) {
            console.log("this is an error from direct file  ", error);
            // Handle the error appropriately
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }
);
export const orderConfirmationTemplate = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = {
                order: {
                    _id: "ABC123",
                    name: "Sample Course",
                    price: 99.99,
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                }
            };
            // Your rendering logic here
            var html = await ejs.renderFile(path.join(__dirname, "../mails/order-confirmation.ejs"), data);
            console.log("Rendered HTML:", html); // Log the rendered HTML
            console.log("this is called later 2");
    
            // Set the Content-Type header to indicate HTML content
            res.writeHead(200, { 'Content-Type': 'text/html' });
    
            // Send the rendered HTML content in the response body
            res.end(html);
        } catch (error) {
            console.log("this is an error from direct file  ", error);
            // Handle the error appropriately
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }
);
export const questionReplyTemplate = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            var includeQuestionsForTesting = false; // Set this flag to true or false as needed
            var data = {
                name: "John Doe", // Sample user name
                title: "Programming One Course", // Sample course title
                questions: includeQuestionsForTesting ? [
                    {
                        id: 1,
                        text: "What is the course content?",
                        replies: [
                            { id: 1, text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
                            { id: 2, text: "Nullam eget ante at nisi fringilla tincidunt." }
                        ]
                    },
                    {
                        id: 2,
                        text: "How long is the course?",
                        replies: [
                            { id: 3, text: "The course duration is 4 weeks." },
                            { id: 4, text: "Each week consists of 5 sessions." }
                        ]
                    }
                ] : []
            };
    
            // Your rendering logic here
            var html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data);
            console.log("Rendered HTML:", html); // Log the rendered HTML
            console.log("this is called later 2");
    
            // Set the Content-Type header to indicate HTML content
            res.writeHead(200, { 'Content-Type': 'text/html' });
    
            // Send the rendered HTML content in the response body
            res.end(html);
        } catch (error) {
            console.log("this is an error from direct file  ", error);
            // Handle the error appropriately
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }
);