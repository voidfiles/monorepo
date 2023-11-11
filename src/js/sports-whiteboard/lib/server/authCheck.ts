import type { app } from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";
import type { NextApiRequest } from "next";

export class AuthError {
  code: number;
  error: string;

  constructor(error: string, code: number = 401) {
    this.code = code;
    this.error = error;
  }
}

export default async (
  app: app.App,
  req: NextApiRequest
): Promise<AuthError | DecodedIdToken> => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return new AuthError("missing authoriation header");
  }

  const [_, token] = authorization.split(" ", 2);
  if (!token) {
    return new AuthError("badly formated authorization header");
  }
  const auth = app.auth();
  try {
    return await auth.verifyIdToken(token);
  } catch (e) {
    console.log("Error", e);
    return new AuthError("invalid token");
  }
};
