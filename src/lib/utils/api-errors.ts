import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json(
    { error: { message, code: "UNAUTHORIZED" } },
    { status: 401 }
  );
}

export function badRequest(message: string) {
  return NextResponse.json(
    { error: { message, code: "BAD_REQUEST" } },
    { status: 400 }
  );
}

export function notFound(message = "Not found") {
  return NextResponse.json(
    { error: { message, code: "NOT_FOUND" } },
    { status: 404 }
  );
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: error.statusCode }
    );
  }

  console.error("Unhandled error:", error);
  return NextResponse.json(
    { error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
    { status: 500 }
  );
}
