// ============================================================================
// RestaurantService Domain Enums
// Đối chiếu chính xác với các enum từ API.Domain.Enums
// ============================================================================

// Đối chiếu: API.Domain.Enums.AreaStatus
export const AreaStatus = {
  Active: "Active",
  Maintenance: "Maintenance",
  Inactive: "Inactive",
} as const;
export type AreaStatus = (typeof AreaStatus)[keyof typeof AreaStatus];

// Đối chiếu: API.Domain.Enums.BranchStatus
export const BranchStatus = {
  Active: "Active",
  TemporarilyClosed: "TemporarilyClosed",
  Maintenance: "Maintenance",
  Inactive: "Inactive",
} as const;
export type BranchStatus = (typeof BranchStatus)[keyof typeof BranchStatus];

// Đối chiếu: API.Domain.Enums.ContactStatus
export const ContactStatus = {
  New: "New",
  InProgress: "InProgress",
  Resolved: "Resolved",
  Closed: "Closed",
} as const;
export type ContactStatus = (typeof ContactStatus)[keyof typeof ContactStatus];

// Đối chiếu: API.Domain.Enums.ContactEmailStatus
export const ContactEmailStatus = {
  Pending: "Pending",
  Sent: "Sent",
  Failed: "Failed",
} as const;
export type ContactEmailStatus = (typeof ContactEmailStatus)[keyof typeof ContactEmailStatus];

// Đối chiếu: API.Domain.Enums.Currency
export const Currency = {
  VND: "VND",
} as const;
export type Currency = (typeof Currency)[keyof typeof Currency];

// Đối chiếu: API.Domain.Enums.DeactivationReasonType
export const DeactivationReasonType = {
  Seasonal: "Seasonal",
  AreaRenovation: "AreaRenovation",
  Understaffed: "Understaffed",
  DamagedAwaitingDisposal: "DamagedAwaitingDisposal",
  EventSpace: "EventSpace",
  Other: "Other",
} as const;
export type DeactivationReasonType = (typeof DeactivationReasonType)[keyof typeof DeactivationReasonType];

// Đối chiếu: API.Domain.Enums.EmployeeStatus
export const EmployeeStatus = {
  Active: "Active",
  OnLeave: "OnLeave",
  Suspended: "Suspended",
  Terminated: "Terminated",
} as const;
export type EmployeeStatus = (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

// Đối chiếu: API.Domain.Enums.InventoryType
export const InventoryType = {
  MadeToOrder: "MadeToOrder",
  StockTracked: "StockTracked",
} as const;
export type InventoryType = (typeof InventoryType)[keyof typeof InventoryType];

// Đối chiếu: API.Domain.Enums.MaintenanceStatus
export const MaintenanceStatus = {
  Scheduled: "Scheduled",
  InProgress: "InProgress",
  Completed: "Completed",
  Cancelled: "Cancelled",
} as const;
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

// Đối chiếu: API.Domain.Enums.MaintenanceType
export const MaintenanceType = {
  Preventive: "Preventive",
  Corrective: "Corrective",
  Emergency: "Emergency",
  Inspection: "Inspection",
  Renovation: "Renovation",
  Cleaning: "Cleaning",
} as const;
export type MaintenanceType = (typeof MaintenanceType)[keyof typeof MaintenanceType];

// Đối chiếu: API.Domain.Enums.OrderStatus
export const OrderStatus = {
  Draft: "Draft",
  Pending: "Pending",
  Confirmed: "Confirmed",
  Preparing: "Preparing",
  Ready: "Ready",
  Served: "Served",
  Delivering: "Delivering",
  Completed: "Completed",
  Cancelled: "Cancelled",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// Đối chiếu: API.Domain.Enums.OrderType
export const OrderType = {
  DineIn: "DineIn",
  TakeAway: "TakeAway",
  Delivery: "Delivery",
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

// Đối chiếu: API.Domain.Enums.OtpPurpose
export const OtpPurpose = {
  EmailVerification: "EmailVerification",
  PasswordReset: "PasswordReset",
  ChangeEmail: "ChangeEmail",
  Login: "Login",
} as const;
export type OtpPurpose = (typeof OtpPurpose)[keyof typeof OtpPurpose];

// Đối chiếu: API.Domain.Enums.PaymentMethod
export const PaymentMethod = {
  Cash: "Cash",
  BankTransfer: "BankTransfer",
  Card: "Card",
  EWallet: "EWallet",
  VNPay: "VNPay",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// Đối chiếu: API.Domain.Enums.PaymentStatus
export const PaymentStatus = {
  Pending: "Pending",
  Processing: "Processing",
  Paid: "Paid",
  Failed: "Failed",
  Cancelled: "Cancelled",
  Refunded: "Refunded",
  PartiallyRefunded: "PartiallyRefunded",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Đối chiếu: API.Domain.Enums.PaymentTransactionStatus
export const PaymentTransactionStatus = {
  Pending: "Pending",
  Processing: "Processing",
  Success: "Success",
  Failed: "Failed",
  Cancelled: "Cancelled",
} as const;
export type PaymentTransactionStatus = (typeof PaymentTransactionStatus)[keyof typeof PaymentTransactionStatus];

// Đối chiếu: API.Domain.Enums.PreparationStatus
export const PreparationStatus = {
  Pending: "Pending",
  Preparing: "Preparing",
  Ready: "Ready",
  Served: "Served",
  Cancelled: "Cancelled",
} as const;
export type PreparationStatus = (typeof PreparationStatus)[keyof typeof PreparationStatus];

// Đối chiếu: API.Domain.Enums.ReservationStatus
export const ReservationStatus = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  Seated: "Seated",
  Completed: "Completed",
  Cancelled: "Cancelled",
  NoShow: "NoShow",
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

// Đối chiếu: API.Domain.Enums.ReservationTableStatus
export const ReservationTableStatus = {
  Assigned: "Assigned",
  Released: "Released",
  Cancelled: "Cancelled",
} as const;
export type ReservationTableStatus = (typeof ReservationTableStatus)[keyof typeof ReservationTableStatus];

// Đối chiếu: API.Domain.Enums.StockStatus
export const StockStatus = {
  OutOfStock: "OutOfStock",
  LowStock: "LowStock",
  Available: "Available",
} as const;
export type StockStatus = (typeof StockStatus)[keyof typeof StockStatus];

// Đối chiếu: API.Domain.Enums.TableShape
export const TableShape = {
  Square: "Square",
  Rectangle: "Rectangle",
  Round: "Round",
  Long: "Long",
  Other: "Other",
} as const;
export type TableShape = (typeof TableShape)[keyof typeof TableShape];

// Đối chiếu: API.Domain.Enums.TableStatus
export const TableStatus = {
  Available: "Available",
  Occupied: "Occupied",
  Maintenance: "Maintenance",
  Inactive: "Inactive",
} as const;
export type TableStatus = (typeof TableStatus)[keyof typeof TableStatus];

// Đối chiếu: API.Domain.Enums.UnitType
export const UnitType = {
  Weight: "Weight",
  Volume: "Volume",
  Quantity: "Quantity",
} as const;
export type UnitType = (typeof UnitType)[keyof typeof UnitType];
