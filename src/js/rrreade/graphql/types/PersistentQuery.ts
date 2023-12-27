import { builder } from "../builder";
import {
  MetaphorSearch,
  MetaphorSearchShape,
  SearchType,
} from "./MetaphorSearch";
import hash from "object-hash";

const PersistentQuery = builder.prismaObject("PersistentQuery", {
  fields: (t) => ({
    id: t.exposeID("id"),
    createdAt: t.expose("createdAt", { type: "Date" }),
    updatedAt: t.expose("updatedAt", { type: "Date" }),
    query: t.field({
      type: MetaphorSearch,
      resolve: (root) => root.query as MetaphorSearchShape,
    }),
  }),
});

const PersistentQueryInput = builder.inputType("PersistentQueryInput", {
  fields: (t) => ({
    useAutoprompt: t.boolean({ defaultValue: true }),
    query: t.string(),
    type: t.string({ defaultValue: SearchType.NEURAL }),
    includeDomains: t.stringList({ defaultValue: [] }),
    excludeDomains: t.stringList({ defaultValue: [] }),
    startCrawlDate: t.string({ required: false }),
    endCrawlDate: t.string({ required: false }),
    startPublishedDate: t.string({ required: false }),
    endPublishedDate: t.string({ required: false }),
  }),
});

builder.mutationField("createPersistentQuery", (t) =>
  t.field({
    type: PersistentQuery,
    args: {
      input: t.arg({ type: PersistentQueryInput, required: true }),
    },
    resolve: async (root, arg, ctx) => {
      const q = await prisma.persistentQuery.create({
        data: {
          userId: ctx.currentUser!.id,
          query: arg,
          queryHash: hash(arg),
        },
      });

      return q;
    },
  })
);

builder.queryField("persistentQueries", (t) =>
  t.prismaConnection({
    type: "PersistentQuery",
    cursor: "id",
    resolve: (query, _parent, _args, ctx, _info) =>
      prisma.persistentQuery.findMany({
        where: {
          userId: ctx.currentUser!.id,
        },
        ...query,
      }),
  })
);
