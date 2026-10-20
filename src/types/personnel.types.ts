// ============================================================================
// RestaurantService Personnel DTOs
// Đối chiếu: API.Contract.DTOs.Personnel
// ============================================================================

// ----------------------------------------------------------------------------
// Positions
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Personnel.Positions.PositionResponse
export interface PositionResponse {
  id: string;
  positionCode: string;
  name: string;
  description?: string | null;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
}

// Đối chiếu: API.Contract.DTOs.Personnel.Positions.PositionDetailResponse
export interface PositionDetailResponse extends PositionResponse {}

// Đối chiếu: API.Contract.DTOs.Personnel.Positions.CreatePositionRequest
export interface CreatePositionRequest {
  departmentId: string;
  name: string;
  description?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Personnel.Positions.UpdatePositionRequest
export interface UpdatePositionRequest {
  departmentId: string;
  name: string;
  description?: string | null;
}

// ----------------------------------------------------------------------------
// Departments
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Personnel.Departments.DepartmentResponse
export interface DepartmentResponse {
  id: string;
  departmentCode: string;
  name: string;
  description?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Personnel.Departments.DepartmentDetailResponse
export interface DepartmentDetailResponse extends DepartmentResponse {
  positions: PositionResponse[];
}

// Đối chiếu: API.Contract.DTOs.Personnel.Departments.CreateDepartmentRequest
export interface CreateDepartmentRequest {
  name: string;
  description?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Personnel.Departments.UpdateDepartmentRequest
export interface UpdateDepartmentRequest {
  name: string;
  description?: string | null;
}
