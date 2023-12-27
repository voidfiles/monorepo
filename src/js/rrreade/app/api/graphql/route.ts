import { createYoga } from "graphql-yoga";
import type { NextApiRequest, NextApiResponse } from "next";
import { schema } from "../../../graphql/schema";
import { auth } from "@clerk/nextjs";

const { handleRequest } = createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
  // context: async () => ({
  //   // This part is up to you!
  //   currentUser: auth(),
  // }),
});

// const wrapper = (
//   request: Request,
//   ctx: {
//     req: NextApiRequest;
//     res: NextApiResponse;
//   }
// ) => {
//   const { userId } = auth();

//   if (!userId) {
//     return new Response("Unauthorized", { status: 401 });
//   }
//   return handleRequest(request, ctx);
// };

export { handleRequest as GET, handleRequest as POST };
