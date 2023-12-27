import { builder } from "../builder";

export enum SearchType {
  NEURAL = "neural",
  KEYWORD = "keyword",
}

export type MetaphorSearchShape = {
  useAutoprompt: boolean;
  query: string;
  type: SearchType;
  includeDomains: Array<string>;
  excludeDomains: Array<string>;
  startCrawlDate: string | null;
  endCrawlDate: string | null;
  startPublishedDate: string | null;
  endPublishedDate: string | null;
};

export const MetaphorSearch = builder
  .objectRef<MetaphorSearchShape>("MetaphorSearch")
  .implement({
    description: "Long necks, cool patterns, taller than you.",
    fields: (t) => ({
      useAutoprompt: t.exposeBoolean("useAutoprompt"),
      query: t.exposeString("query"),
      type: t.expose("type", { type: SearchTypeEnum }),
      includeDomains: t.exposeStringList("includeDomains"),
      excludeDomains: t.exposeStringList("excludeDomains"),
      startCrawlDate: t.exposeString("startCrawlDate", { nullable: true }),
      endCrawlDate: t.exposeString("endCrawlDate", { nullable: true }),
      startPublishedDate: t.exposeString("startPublishedDate", {
        nullable: true,
      }),
      endPublishedDate: t.exposeString("endPublishedDate", { nullable: true }),
    }),
  });

const SearchTypeEnum = builder.enumType("SearchType", {
  values: [SearchType.KEYWORD, SearchType.NEURAL] as const,
});
