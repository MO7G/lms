# Fixing TypeScript Error with Express Request

When you encounter a TypeScript error like the following:

```typescript
req.user = JSON.parse(user);

and receive the error message "Property 'user' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.ts(2339)," you can resolve it by extending the Request type using TypeScript declaration merging. Here's a step-by-step breakdown of how this is achieved:

import { Request } from "express";
import { IUser } from "../models/user.model";
declare global {
    namespace Express {
        // Inside the namespace, you extend the Request type
        interface Request {
            user?: IUser; // You add a new property called 'user' of type 'IUser'
        }
    }
}
By adding this code, you are essentially telling TypeScript to include a custom property called user of type IUser in the Request object from Express.

As a result, the TypeScript compiler now recognizes the user property on the Request object, and the error is resolved. This enables you to use req.user without TypeScript generating an error, as it now knows about the custom property.

In summary, the error occurred because TypeScript didn't recognize the user property on the Request object, and you fixed it by extending the Request type with the new property using TypeScript declaration merging.

css
