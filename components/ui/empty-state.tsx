"use client";

import { cn } from "@/lib/utils";
import { Package, FileText, Mail, LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function EmptyState({
  icon: Icon = Package,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

// Pre-configured empty states
function EmptyShipments({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No shipments yet"
      description="Get started by creating your first shipment to track packages."
      actionLabel="Create Shipment"
      onAction={onCreate}
    />
  );
}

function EmptyQuotes() {
  return (
    <EmptyState
      icon={FileText}
      title="No quote requests"
      description="Quote requests from customers will appear here."
    />
  );
}

function EmptyEmails() {
  return (
    <EmptyState
      icon={Mail}
      title="No emails sent"
      description="Sent emails and their status will appear here."
    />
  );
}

export { EmptyState, EmptyShipments, EmptyQuotes, EmptyEmails };
