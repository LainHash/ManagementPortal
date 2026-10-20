// ============================================================================
// RestaurantService Business DTOs
// Đối chiếu: API.Contract.DTOs.Business
// ============================================================================

// Đối chiếu: API.Contract.DTOs.Business.AuditLogs.AuditLogResponse
export interface AuditLogResponse {
  id: number;
  userPublicId?: string | null;
  action: string;
  entityName: string;
  entityId: string;
  oldValues?: string | null;
  newValues?: string | null;
  ipAddress?: string | null;
  timestamp: string;
}

// Đối chiếu: API.Contract.DTOs.Business.Bootstrap.BootstrapResponse
export interface BootstrapResponse {
  message: string;
  rolesCreatedCount: number;
  roles: string[];
  adminUserName: string;
  adminEmail: string;
  adminRole: string;
}

// Đối chiếu: API.Contract.DTOs.Business.Import.ImportRowError
export interface ImportRowError {
  row: number;
  message: string;
}

// Đối chiếu: API.Contract.DTOs.Business.Import.ImportResultResponse
export interface ImportResultResponse {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: ImportRowError[];
}
