import api from "./client";
import type { AladinSearchResponse, AladinBookItem } from "../types";

export const aladinApi = {
  /** 도서 검색 */
  search: (query: string, maxResults = 10) =>
    api
      .get<AladinSearchResponse>("/aladin/search", {
        params: { query, max_results: maxResults },
      })
      .then((r) => r.data),
  
  /** ISBN 조회 */
  loopup: (isbn: string) =>
    api.get<AladinBookItem>(`/aladin/lookup/${isbn}`).then((r) => r.data),

  /** 베스트셀러 */
  bestsellers: (maxResults = 10) =>
    api
      .get<AladinSearchResponse>("/aladin/bestsellers", {
        params: { max_results: maxResults },
      })
      .then((r) => r.data),
};
