import { Request, Response } from "express"
import { HttpResponse } from "./HttpResponse.js";

export const fullUrlForRequest = (req: Request): URL => {
    const protocol = req.hostname.startsWith("localhost") ? "http" : "https";
    return new URL(req.url, `${protocol}://${req.headers.host}`);
}

export const sendResponse = (expressResponse: Response, httpResponse: HttpResponse): void => {
    expressResponse.status(httpResponse.httpStatus).send(httpResponse.data);
}