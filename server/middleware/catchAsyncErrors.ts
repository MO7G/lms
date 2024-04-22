import { Response, Request, NextFunction } from "express";


export const CatchAsyncError = (theFunc: any) => (req: Request, res: Response, next: NextFunction) => {
    console.log(next)
    Promise.resolve(theFunc(req, res, next)).catch(next);
}



export interface AsyncHandlerOptions {
    action?: string;
    flag?: boolean;
}
export const CatchAsyncErrorWithOptions = (theFunc: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await Promise.resolve(theFunc(req, res, next));
    } catch (error) {
        console.log(error);
    }
};

