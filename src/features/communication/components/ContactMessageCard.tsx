import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactStatusBadge, ContactEmailStatusBadge } from "./Badges";
import type { ContactMessageResponse } from "@/types/communication.types";
import {
  Mail,
  Phone,
  Clock,
  Eye,
  MessageSquare,
  User,
  ArrowRight,
} from "lucide-react";

interface ContactMessageCardProps {
  message: ContactMessageResponse;
  onViewDetail: (message: ContactMessageResponse) => void;
}

export function ContactMessageCard({
  message,
  onViewDetail,
}: ContactMessageCardProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const initials = message.fullName
    ? message.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "KH";

  return (
    <Card
      onClick={() => onViewDetail(message)}
      className="group relative flex flex-col justify-between overflow-hidden p-5 transition-all duration-300 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-900/60 cursor-pointer"
    >
      <div>
        {/* Top bar: Customer & Status badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-xs group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
                {message.fullName}
              </h4>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" />
                {formatDate(message.createdAt)}
              </span>
            </div>
          </div>

          <ContactStatusBadge status={message.status} />
        </div>

        {/* Subject */}
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1.5 dark:text-slate-100">
          {message.subject}
        </h3>

        {/* Message body preview */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed dark:text-slate-400 mb-4">
          {message.message}
        </p>
      </div>

      {/* Footer bar */}
      <div className="border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0 text-slate-500 dark:text-slate-400">
          <span className="truncate flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{message.email}</span>
          </span>
          {message.phoneNumber && (
            <>
              <span>•</span>
              <span className="shrink-0 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {message.phoneNumber}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
          <span className="text-[11px]">Xem</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Card>
  );
}
