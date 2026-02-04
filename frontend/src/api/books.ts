import api from "./client";
import type { Book, BookCreateRequest } from "../types";

export const bookApi = {
  /** 도서 등록 */
  create: (data: BookCreateRequest) =>
    api.post<Book>("/books", data).then((r) => r.data),

  /** 도서 목록 */
  getAll: (size = 100) =>
    api.get<Book[]>("/books", { params: { size } }).then((r) => r.data),

  /** 도서 상세 */
  getById: (id: string) =>
    api.get<Book>(`/books/${id}`).then((r) => r.data),

  /** 도서 삭제 */
  delete: (id: string) =>
    api.delete(`/books/${id}`).then((r) => r.data),
};
