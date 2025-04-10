export type Page<T> = {
  contents: T[];
  offset: number;
  pageSize: number;
  page: number;
  last: boolean;
  totalElement: number;
  totalPages: number;
  first: boolean;
  numberOfElement: number;
  isEmpty: boolean;
};
