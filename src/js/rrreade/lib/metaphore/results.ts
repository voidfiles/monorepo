export type SearchResult = {
  title: string;
  url: string;
  publishedDate: string;
  author: string | null;
  id: string;
  score: number;
};

export type SearchResults = {
  autopromptString: string;
  results: Array<SearchResult> = [];
};

export type ResultContent = {
  url: string;
  id: string;
  title: string;
  extract: string;
};
