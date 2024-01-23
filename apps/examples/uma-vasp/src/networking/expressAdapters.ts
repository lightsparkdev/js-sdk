import { Request, Response } from "express";
import { HttpResponse } from "./HttpResponse.js";

export const fullUrlForRequest = (req: Request): URL => {
  const protocol = isDomainLocalhost(req.hostname) ? "http" : "https";
  return new URL(req.url, `${protocol}://${req.headers.host}`);
};

export const isDomainLocalhost = (domain: string) => {
  const domainWithoutPort = domain.split(":")[0];
  const tld = domainWithoutPort.split(".").pop();
  return (
    domainWithoutPort === "localhost" ||
    domainWithoutPort === "127.0.0.1" ||
    tld === "local" ||
    tld === "internal"
  );
};

export const sendResponse = (
  expressResponse: Response,
  httpResponse: HttpResponse,
): void => {
  expressResponse.status(httpResponse.httpStatus).send(httpResponse.data);
};
