"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var ejs = require("ejs"); // Import the ejs module
var fs = require("fs");
var path = require("path");
var questionReplyServer = http.createServer(async function (req, res) {
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
});

var mailTemplateServer = http.createServer(async function (req, res) {
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
});

const runEjsFile = (flag) =>{
    if (flag == 0){
        var PORT = 3000;
        mailTemplateServer.listen(PORT, function () {
            console.log("Server running at http://localhost:".concat(PORT, "/"));
        });
    }else if (flag == 1){
        var PORT = 3000;
        questionReplyServer.listen(PORT, function () {
            console.log("Server running at http://localhost:".concat(PORT, "/"));
        });
    }
}
runEjsFile(1)

