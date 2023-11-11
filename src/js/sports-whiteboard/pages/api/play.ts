import type { NextApiRequest, NextApiResponse } from "next";
import app from "../../lib/firebase/server";
import authCheck, { AuthError } from "../../lib/server/authCheck";
import docStore, { Play } from "../../lib/firebase/docStore";
import { withSentry } from "@sentry/nextjs";

type ErrorData = {
  error: string;
};

export default withSentry(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Play | ErrorData>
) {
  const parsedToken = await authCheck(app, req);
  if (parsedToken instanceof AuthError) {
    return res.status(parsedToken.code).json({ error: parsedToken.error });
  }
  let id = req.query.id;
  if (id instanceof Array) {
    id = id[0];
  }
  const doc = await docStore.get(id);

  return res.status(200).json(doc);
});
