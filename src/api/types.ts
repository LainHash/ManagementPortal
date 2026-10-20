// Mô hình chuẩn từ RestaurantService: API.Domain.Models.Results.Result
export interface BaseResult {
  isSucceed: boolean;
  message: string;
  statusCode: number;
}

// Mô hình chuẩn từ RestaurantService: API.Domain.Models.Results.Result<T>
// Mặc định T = void khi không có Data trả về (tương đương Result không generic trong C#)
export interface Result<T = void> extends BaseResult {
  data: T | null;
}

// Mô hình chuẩn từ RestaurantService: API.Domain.Models.Results.PaginationResult<T>
// Lưu ý: data ở đây là mảng T[]
export interface PaginationResult<T> extends Result<T[]> {
  totalItems: number;
  totalPages: number;
  indexPage: number;
  pageSize: number;
}

// Mô hình chuẩn từ RestaurantService: API.Domain.Models.PaginationQuery
export interface PaginationQuery {
  keyword?: string;
  sortField?: string;
  isAscending?: boolean;
  page?: number;
  pageSize?: number;
}
