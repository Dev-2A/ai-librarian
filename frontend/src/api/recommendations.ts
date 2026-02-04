import api from "./client";
import type { Recommendation } from "../types";

export const recommendApi = {
  /** 감상평 기반 추천 */
  byReview: (review: string, topK = 5) =>
    api
      .post<Recommendation[]>("/recommendations/by-review", {
        review,
        top_k: topK,
      })
      .then((r) => r.data),
  
  /** 도서 기반 추천 */
  byBook: (bookId: string, topK = 5) =>
    api
      .post<Recommendation[]>("/recommendations/by-book", {
        book_id: bookId,
        top_k: topK,
      })
      .then((r) => r.data),
};
