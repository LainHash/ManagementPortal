// ============================================================================
// RestaurantService Territory DTOs
// Đối chiếu: API.Contract.DTOs.Territory
// ============================================================================

import type {
  AreaStatus,
  BranchStatus,
  DeactivationReasonType,
  MaintenanceStatus,
  MaintenanceType,
  TableShape,
  TableStatus,
} from "./enums";

// ----------------------------------------------------------------------------
// Restaurant Tables
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Territory.RestaurantTables.RestaurantTableMinimalResponse
export interface RestaurantTableMinimalResponse {
  id: string;
  tableNumber: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
}

// Đối chiếu: API.Contract.DTOs.Territory.RestaurantTables.RestaurantTableResponse
export interface RestaurantTableResponse {
  id: string;
  areaId?: string | null;
  areaName?: string | null;
  tableNumber: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
}

// Đối chiếu: API.Contract.DTOs.Territory.RestaurantTables.TableDeactivationHistoryResponse
export interface TableDeactivationHistoryResponse {
  id: string;
  restaurantTableId: string;
  tableNumber: string;
  reasonType: DeactivationReasonType;
  reason: string;
  deactivatedAt: string;
  deactivatedBy: string;
  reactivatedAt?: string | null;
  reactivatedBy?: string | null;
  reactivationNote?: string | null;
  isActiveDeactivation: boolean;
  createdAt: string;
}

// Đối chiếu: API.Contract.DTOs.Territory.RestaurantTables.CreateRestaurantTableRequest
export interface CreateRestaurantTableRequest {
  areaId: string;
  tableNumber: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
}

// Đối chiếu: API.Contract.DTOs.Territory.RestaurantTables.UpdateRestaurantTableRequest
export interface UpdateRestaurantTableRequest {
  areaId: string;
  tableNumber: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
}

// Đối chiếu: API.Contract.DTOs.Territory.RestaurantTables.DeactivateTableRequest
export interface DeactivateTableRequest {
  reasonType: DeactivationReasonType;
  reason: string;
}

// Đối chiếu: API.Contract.DTOs.Territory.RestaurantTables.ReactivateTableRequest
export interface ReactivateTableRequest {
  reactivationNote?: string | null;
}

// ----------------------------------------------------------------------------
// Table Maintenances
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Territory.TableMaintenances.TableMaintenanceResponse
export interface TableMaintenanceResponse {
  id: string;
  restaurantTableId: string;
  tableNumber: string;
  areaName?: string | null;
  startAt?: string | null;
  expectedCompletionAt?: string | null;
  reason: string;
  status: MaintenanceStatus;
  type: MaintenanceType;
  createdAt: string;
  updatedAt: string;
}

// Đối chiếu: API.Contract.DTOs.Territory.TableMaintenances.CreateTableMaintenanceRequest
export interface CreateTableMaintenanceRequest {
  restaurantTableId?: string | null;
  startAt?: string | null;
  expectedCompletionAt?: string | null;
  reason: string;
  status?: MaintenanceStatus | null;
  type?: MaintenanceType | null;
}

// ----------------------------------------------------------------------------
// Areas
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Territory.Areas.AreaResponse
export interface AreaResponse {
  id: string;
  branchId?: string | null;
  name: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  status: AreaStatus;
}

// Đối chiếu: API.Contract.DTOs.Territory.Areas.AreaDetailResponse
export interface AreaDetailResponse extends AreaResponse {
  restaurantTables: RestaurantTableResponse[];
}

// Đối chiếu: API.Contract.DTOs.Territory.Areas.AreaMaintenanceResponse
export interface AreaMaintenanceResponse {
  id: string;
  areaId: string;
  areaName: string;
  branchName?: string | null;
  startAt?: string | null;
  expectedCompletionAt?: string | null;
  reason: string;
  status: MaintenanceStatus;
  type: MaintenanceType;
}

// Đối chiếu: API.Contract.DTOs.Territory.Areas.AreaDeactivationHistoryResponse
export interface AreaDeactivationHistoryResponse {
  id: string;
  areaId: string;
  areaName: string;
  reasonType: DeactivationReasonType;
  reason: string;
  deactivatedAt: string;
  deactivatedBy: string;
  reactivatedAt?: string | null;
  reactivatedBy?: string | null;
  reactivationNote?: string | null;
  isActiveDeactivation: boolean;
}

// Đối chiếu: API.Contract.DTOs.Territory.Areas.CreateAreaRequest
export interface CreateAreaRequest {
  branchId: string;
  name: string;
  description?: string | null;
  displayOrder: number;
}

// Đối chiếu: API.Contract.DTOs.Territory.Areas.UpdateAreaRequest
export interface UpdateAreaRequest {
  branchId: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

// Đối chiếu: API.Contract.DTOs.Territory.Areas.DeactivateAreaRequest
export interface DeactivateAreaRequest {
  reasonType: DeactivationReasonType;
  reason: string;
}

// Đối chiếu: API.Contract.DTOs.Territory.Areas.ReactivateAreaRequest
export interface ReactivateAreaRequest {
  reactivationNote?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Territory.Areas.CreateAreaMaintenanceRequest
export interface CreateAreaMaintenanceRequest {
  areaId?: string | null;
  startAt?: string | null;
  expectedCompletionAt?: string | null;
  reason: string;
  status?: MaintenanceStatus | null;
  type?: MaintenanceType | null;
}

// ----------------------------------------------------------------------------
// Branches
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Territory.Branches.BranchResponse
export interface BranchResponse {
  id: string;
  city: string;
  branchCode: string;
  phoneNumber: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  status: BranchStatus;
  openTime: string; // TimeOnly -> "HH:mm:ss"
  closeTime: string; // TimeOnly -> "HH:mm:ss"
}

// Đối chiếu: API.Contract.DTOs.Territory.Branches.BranchDetailResponse
export interface BranchDetailResponse {
  id: string;
  city: string;
  code: string;
  phoneNumber: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  status: BranchStatus;
  openTime: string;
  closeTime: string;
  areas: AreaResponse[];
}

// Đối chiếu: API.Contract.DTOs.Territory.Branches.BranchMaintenanceResponse
export interface BranchMaintenanceResponse {
  id: string;
  branchId: string;
  branchCode: string;
  branchAddress?: string | null;
  startAt?: string | null;
  expectedCompletionAt?: string | null;
  reason: string;
  status: MaintenanceStatus;
  type: MaintenanceType;
}

// Đối chiếu: API.Contract.DTOs.Territory.Branches.BranchDeactivationHistoryResponse
export interface BranchDeactivationHistoryResponse {
  id: string;
  branchId: string;
  branchCode: string;
  branchAddress?: string | null;
  reasonType: DeactivationReasonType;
  reason: string;
  deactivatedAt: string;
  deactivatedBy: string;
  reactivatedAt?: string | null;
  reactivatedBy?: string | null;
  reactivationNote?: string | null;
  isActiveDeactivation: boolean;
}

// Đối chiếu: API.Contract.DTOs.Territory.Branches.CreateBranchRequest
export interface CreateBranchRequest {
  city: string;
  phoneNumber: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  status: BranchStatus;
  openTime: string;
  closeTime: string;
}

// Đối chiếu: API.Contract.DTOs.Territory.Branches.UpdateBranchRequest
export interface UpdateBranchRequest {
  city: string;
  phoneNumber: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  status: BranchStatus;
  openTime: string;
  closeTime: string;
}

// Đối chiếu: API.Contract.DTOs.Territory.Branches.DeactivateBranchRequest
export interface DeactivateBranchRequest {
  reasonType: DeactivationReasonType;
  reason: string;
}

// Đối chiếu: API.Contract.DTOs.Territory.Branches.ReactivateBranchRequest
export interface ReactivateBranchRequest {
  reactivationNote?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Territory.Branches.CreateBranchMaintenanceRequest
export interface CreateBranchMaintenanceRequest {
  branchId?: string | null;
  startAt?: string | null;
  expectedCompletionAt?: string | null;
  reason: string;
  status?: MaintenanceStatus | null;
  type?: MaintenanceType | null;
}
