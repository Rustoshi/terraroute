"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { StatusBadge, ServiceTypeBadge, ShipmentTypeBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/modal";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyShipments } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { shipmentsApi, type ShipmentFilters } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { ShipmentStatus, ServiceType } from "@/types";
import { formatDate, truncate } from "@/lib/utils";

const statusOptions = [
  { value: "", label: "All Statuses" },
  ...Object.values(ShipmentStatus).map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
];

const serviceTypeOptions = [
  { value: "", label: "All Types" },
  ...Object.values(ServiceType).map((s) => ({ value: s, label: s })),
];

function ShipmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Filters state from URL
  const [filters, setFilters] = React.useState<ShipmentFilters>({
    page: parseInt(searchParams.get("page") || "1"),
    limit: 10,
    search: searchParams.get("search") || "",
    status: (searchParams.get("status") as ShipmentStatus) || undefined,
    serviceType: (searchParams.get("serviceType") as ServiceType) || undefined,
  });

  const [showFilters, setShowFilters] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  // Fetch shipments
  const { data, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.shipments.list(filters),
    queryFn: () => shipmentsApi.list(filters),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: shipmentsApi.delete,
    onSuccess: () => {
      toast.success("Shipment deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete shipment");
    },
  });

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.serviceType) params.set("serviceType", filters.serviceType);

    const queryString = params.toString();
    router.replace(`/admin/shipments${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [filters, router]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFilters((prev) => ({
      ...prev,
      search: formData.get("search") as string,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const hasActiveFilters = filters.search || filters.status || filters.serviceType;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all shipments
          </p>
        </div>
        <Link href="/admin/shipments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="search"
                type="text"
                defaultValue={filters.search}
                placeholder="Search by tracking code..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Filter toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Status"
                options={statusOptions}
                value={filters.status || ""}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value as ShipmentStatus || undefined,
                    page: 1,
                  }))
                }
              />
              <Select
                label="Service Type"
                options={serviceTypeOptions}
                value={filters.serviceType || ""}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    serviceType: value as ServiceType || undefined,
                    page: 1,
                  }))
                }
              />
              <div className="flex items-end">
                <Button variant="ghost" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : !data?.data.length ? (
        <Card>
          <EmptyShipments onCreate={() => router.push("/admin/shipments/new")} />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking Code</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type / Service</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((shipment) => (
                <TableRow key={shipment._id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/shipments/${shipment._id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {shipment.trackingCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-gray-900">{truncate(shipment.sender.name, 15)}</p>
                      <p className="text-gray-700">
                        → {truncate(shipment.receiver.name, 15)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={shipment.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <ShipmentTypeBadge type={shipment.shipmentType} />
                      <ServiceTypeBadge type={shipment.serviceType} />
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {shipment.currentLocation
                      ? truncate(shipment.currentLocation, 20)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {shipment.estimatedDeliveryDate
                      ? formatDate(shipment.estimatedDeliveryDate, { timeZone: "UTC" })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {formatDate(shipment.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/shipments/${shipment._id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/shipments/${shipment._id}?edit=true`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(shipment._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{" "}
                {Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total
                )}{" "}
                of {data.pagination.total} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.pagination.page === 1}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-700">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.pagination.page === data.pagination.totalPages}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Shipment"
        description="Are you sure you want to delete this shipment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// Main export wrapped in Suspense for useSearchParams
export default function ShipmentsPage() {
  return (
    <Suspense fallback={<SkeletonTable rows={5} />}>
      <ShipmentsContent />
    </Suspense>
  );
}
