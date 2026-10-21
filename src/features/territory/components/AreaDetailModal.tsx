import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { territoryApi } from "../api/territory.api";
import { AreaStatusBadge, TableStatusBadge, TableShapeBadge } from "./Badges";
import type {
  AreaResponse,
  AreaDetailResponse,
  BranchResponse,
} from "@/types/territory.types";
import {
  Layers,
  Building2,
  TableProperties,
  Users,
  CheckCircle2,
  Calendar,
  Loader2,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";

interface AreaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  area: AreaResponse | null;
  branch?: BranchResponse | null;
}

export function AreaDetailModal({
  isOpen,
  onClose,
  area,
  branch,
}: AreaDetailModalProps) {
  const [detail, setDetail] = useState<AreaDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && area?.id) {
      setIsLoading(true);
      territoryApi.areas
        .getById(area.id)
        .then((res) => {
          if (res?.data) {
            setDetail(res.data);
          } else {
            setDetail(null);
          }
        })
        .catch(() => setDetail(null))
        .finally(() => setIsLoading(false));
    } else {
      setDetail(null);
    }
  }, [isOpen, area?.id]);

  if (!area) return null;

  const currentArea = detail || area;
  const tables = detail?.restaurantTables || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chi tiết Khu vực: {currentArea.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {branch?.branchCode ? `${branch.branchCode} - ${branch.address}` : "Thông tin chi tiết khu vực mặt bằng"}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-1 max-h-[70vh] overflow-y-auto pr-1">
        {/* Top Info Banner */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Trạng thái
              </span>
              <AreaStatusBadge status={currentArea.status} />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Thứ tự hiển thị
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                #{currentArea.displayOrder}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Kích hoạt
              </span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  currentArea.isActive ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {currentArea.isActive ? "Đang bật" : "Đang tắt"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Số bàn trực thuộc
              </span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                {isLoading ? "..." : `${tables.length} bàn`}
              </span>
            </div>
          </div>

          {currentArea.description && (
            <div className="mt-3 border-t border-slate-200/60 pt-2.5 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span>{currentArea.description}</span>
            </div>
          )}
        </div>

        {/* Assigned Tables Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <TableProperties className="h-4 w-4 text-indigo-600" />
              Danh sách bàn ăn trong khu vực ({tables.length})
            </h4>
            <Link
              to={`/tables`}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 dark:text-indigo-400"
            >
              <span>Đi đến quản lý bàn</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              <p className="text-xs text-slate-500">Đang tải danh sách bàn...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="flex h-28 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
              <TableProperties className="h-5 w-5 text-slate-400" />
              <p className="text-xs text-slate-500">
                Khu vực này hiện chưa có bàn ăn nào
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      #{t.tableNumber}
                    </span>
                    <TableShapeBadge shape={t.shape} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-indigo-500" />
                      {t.capacity} chỗ
                    </span>
                  </div>
                  <TableStatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
