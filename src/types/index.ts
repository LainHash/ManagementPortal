// ============================================================================
// Restaurant Management Portal - Type System Barrel
// Single Source of Truth cho toàn bộ DTOs và Enums từ RestaurantService
// ============================================================================

// Enums (cung cấp cả type và runtime const object)
export * from "./enums";

// API Envelope & Pagination Models
export type * from "./common.types";

// Domain DTOs
export type * from "./storage.types";
export type * from "./authentication.types";
export type * from "./identity.types";
export type * from "./catalog.types";
export type * from "./production.types";
export type * from "./inventory.types";
export type * from "./personnel.types";
export type * from "./territory.types";
export type * from "./sale.types";
export type * from "./schedule.types";
export type * from "./commerce.types";
export type * from "./communication.types";
export type * from "./business.types";
export type * from "./general.types";
