import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  BranchStatus,
  AreaStatus,
  TableStatus,
  TableShape,
  MaintenanceStatus,
  MaintenanceType,
  DeactivationReasonType,
} from "@/types/enums";
import {
  CheckCircle2,
  Clock,
  Wrench,
  Ban,
  PauseCircle,
  PlayCircle,
  HelpCircle,
  Square,
  RectangleHorizontal,
  Circle,
  Boxes,
  AlertTriangle,
  Sparkles,
  Calendar,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

// ============================================================================
// Branch Status Badge
// ============================================================================
export function BranchStatusBadge({ status }: { status?: BranchStatus | null }) {
  switch (status) {
    case BranchStatus.Active:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Đang hoạt động
        </span>
      );
    case BranchStatus.TemporarilyClosed:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-700/10 dark:bg-amber-950/40 dark:text-amber-300">
          <PauseCircle className="h-3 w-3 text-amber-500" />
          Tạm đóng cửa
        </span>
      );
    case BranchStatus.Maintenance:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Wrench className="h-3 w-3 text-indigo-500" />
          Đang bảo trì
        </span>
      );
    case BranchStatus.Inactive:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-700/10 dark:bg-rose-950/40 dark:text-rose-300">
          <Ban className="h-3 w-3 text-rose-500" />
          Ngừng khai thác
        </span>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1 font-normal">
          <HelpCircle className="h-3 w-3" />
          {status || "Chưa rõ"}
        </Badge>
      );
  }
}

// ============================================================================
// Area Status Badge
// ============================================================================
export function AreaStatusBadge({ status }: { status?: AreaStatus | null }) {
  switch (status) {
    case AreaStatus.Active:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Hoạt động
        </span>
      );
    case AreaStatus.Maintenance:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Wrench className="h-3 w-3 text-indigo-500" />
          Bảo trì
        </span>
      );
    case AreaStatus.Inactive:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-700/10 dark:bg-rose-950/40 dark:text-rose-300">
          <Ban className="h-3 w-3 text-rose-500" />
          Ngừng khai thác
        </span>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1 font-normal">
          <HelpCircle className="h-3 w-3" />
          {status || "Chưa rõ"}
        </Badge>
      );
  }
}

// ============================================================================
// Table Status Badge
// ============================================================================
export function TableStatusBadge({ status }: { status?: TableStatus | null }) {
  switch (status) {
    case TableStatus.Available:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Bàn trống (Available)
        </span>
      );
    case TableStatus.Occupied:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-700/10 dark:bg-amber-950/40 dark:text-amber-300">
          <PlayCircle className="h-3 w-3 text-amber-500" />
          Đang có khách (Occupied)
        </span>
      );
    case TableStatus.Maintenance:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Wrench className="h-3 w-3 text-indigo-500" />
          Đang bảo trì
        </span>
      );
    case TableStatus.Inactive:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-700/10 dark:bg-rose-950/40 dark:text-rose-300">
          <Ban className="h-3 w-3 text-rose-500" />
          Ngừng khai thác
        </span>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1 font-normal">
          <HelpCircle className="h-3 w-3" />
          {status || "Chưa rõ"}
        </Badge>
      );
  }
}

// ============================================================================
// Table Shape Badge
// ============================================================================
export function TableShapeBadge({ shape }: { shape?: TableShape | null }) {
  switch (shape) {
    case TableShape.Square:
      return (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Square className="h-3 w-3 text-slate-500" />
          Vuông
        </span>
      );
    case TableShape.Rectangle:
      return (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <RectangleHorizontal className="h-3 w-3 text-slate-500" />
          Chữ nhật
        </span>
      );
    case TableShape.Round:
      return (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Circle className="h-3 w-3 text-slate-500" />
          Tròn
        </span>
      );
    case TableShape.Long:
      return (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Boxes className="h-3 w-3 text-slate-500" />
          Dài (Dãy)
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {shape || "Khác"}
        </span>
      );
  }
}

// ============================================================================
// Maintenance Status Badge
// ============================================================================
export function MaintenanceStatusBadge({
  status,
}: {
  status?: MaintenanceStatus | null;
}) {
  switch (status) {
    case MaintenanceStatus.Scheduled:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/40 dark:text-blue-300">
          <Calendar className="h-3 w-3 text-blue-500" />
          Đã lên lịch
        </span>
      );
    case MaintenanceStatus.InProgress:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-700/10 dark:bg-amber-950/40 dark:text-amber-300">
          <Wrench className="h-3 w-3 text-amber-500 animate-spin" />
          Đang thực hiện
        </span>
      );
    case MaintenanceStatus.Completed:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Đã hoàn thành
        </span>
      );
    case MaintenanceStatus.Cancelled:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-600/10 dark:bg-slate-800 dark:text-slate-400">
          <Ban className="h-3 w-3 text-slate-400" />
          Đã hủy
        </span>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1 font-normal">
          {status || "Chưa rõ"}
        </Badge>
      );
  }
}

// ============================================================================
// Maintenance Type Badge
// ============================================================================
export function MaintenanceTypeBadge({
  type,
}: {
  type?: MaintenanceType | null;
}) {
  const getLabel = (t?: MaintenanceType | null) => {
    switch (t) {
      case MaintenanceType.Preventive:
        return "Bảo trì định kỳ";
      case MaintenanceType.Corrective:
        return "Sửa chữa khắc phục";
      case MaintenanceType.Emergency:
        return "Sự cố khẩn cấp";
      case MaintenanceType.Inspection:
        return "Kiểm tra kỹ thuật";
      case MaintenanceType.Renovation:
        return "Nâng cấp cải tạo";
      case MaintenanceType.Cleaning:
        return "Vệ sinh tổng thể";
      default:
        return type || "Chưa rõ";
    }
  };

  const isEmergency = type === MaintenanceType.Emergency;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
        isEmergency
          ? "bg-rose-100 text-rose-700 font-semibold dark:bg-rose-950 dark:text-rose-300"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {isEmergency && <ShieldAlert className="h-3 w-3 text-rose-600" />}
      {getLabel(type)}
    </span>
  );
}

// ============================================================================
// Deactivation Reason Type Badge
// ============================================================================
export function DeactivationReasonBadge({
  reasonType,
}: {
  reasonType?: DeactivationReasonType | null;
}) {
  const getLabel = (r?: DeactivationReasonType | null) => {
    switch (r) {
      case DeactivationReasonType.Seasonal:
        return "Theo mùa vụ";
      case DeactivationReasonType.AreaRenovation:
        return "Cải tạo khu vực";
      case DeactivationReasonType.Understaffed:
        return "Thiếu nhân sự";
      case DeactivationReasonType.DamagedAwaitingDisposal:
        return "Hư hỏng chờ xử lý";
      case DeactivationReasonType.EventSpace:
        return "Dành cho sự kiện";
      case DeactivationReasonType.Other:
        return "Lý do khác";
      default:
        return reasonType || "Khác";
    }
  };

  return (
    <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
      <AlertCircle className="h-3 w-3 text-rose-500" />
      {getLabel(reasonType)}
    </span>
  );
}
