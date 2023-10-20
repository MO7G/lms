**NOTE** _In the ErrorHandler class, we are calling `super(message)`._

**NOTE** _What is this?_

1. _In this way, we are calling the constructor of the parent class since the ErrorHandler class is extending the Error class from Express._

**NOTE** _Why are we doing this?_

1. _Initialization of Parent Class: When you extend a class in OOP, the parent class constructor must be executed before any code specific to the subclass._

2. _Inheritance of Behavior: Since the subclass can have access to the parent class methods/members, we should initialize the parent class first._

3. _After initializing the parent class, now you can extend the parent members/methods so you can create your own custom error handler that serves your application!_

_------------------------------------------------------------------------------------------------_

**NOTE** In the ErrorHandler class we are using the `Error.captureStackTrace(this, this.constructor)`

**NOTE** _What is this?_

- `Error.captureStackTrace(this, this.constructor)` is a method in Node.js that allows you to customize how error stack traces are generated.

- `this` refers to the current instance of the `ErrorHandler` class. This method is capturing the stack trace for the current error object.

- `this.constructor` refers to the constructor function of the current instance, which is essentially the class itself (in this case, the `ErrorHandler` class).

**Stack Trace:**

- A stack trace is a detailed report of the active function calls at a particular point in the code. It shows the order of function calls, including file names and line numbers, leading up to the point where the error occurred.

**Customizing the Stack Trace:**

- By calling `Error.captureStackTrace(this, this.constructor)`, you are customizing how the stack trace for an error is recorded. This allows you to omit certain functions or control where the stack trace starts and ends.

**Purpose:**

- In this context, it appears that the purpose of this line is to capture the stack trace but customize it so that it starts from the constructor of the `ErrorHandler` class and not from the `Error` class itself. This can make debugging and error reporting more informative because it indicates the origin of the error within your custom `ErrorHandler` class.
