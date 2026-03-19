import { STATUS_CODES } from "http";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message ?? STATUS_CODES[status]);
    this.status = status;
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}
