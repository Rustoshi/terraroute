"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Truck,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { carriersApi, type Carrier } from "@/lib/api";
import { queryKeys } from "@/lib/query";

const carrierSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required").max(20),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  trackingUrlTemplate: z.string().optional(),
  isActive: z.boolean().optional(),
});

type CarrierFormData = z.infer<typeof carrierSchema>;

export default function CarriersPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = React.useState(false);
  const [editingCarrier, setEditingCarrier] = React.useState<Carrier | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const { data: carriers = [], isLoading } = useQuery({
    queryKey: queryKeys.carriers.list(),
    queryFn: () => carriersApi.list(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CarrierFormData>({
    resolver: zodResolver(carrierSchema),
    defaultValues: { isActive: true },
  });

  const createMutation = useMutation({
    mutationFn: carriersApi.create,
    onSuccess: () => {
      toast.success("Carrier created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.carriers.all });
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create carrier");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CarrierFormData> }) =>
      carriersApi.update(id, data),
    onSuccess: () => {
      toast.success("Carrier updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.carriers.all });
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update carrier");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: carriersApi.delete,
    onSuccess: () => {
      toast.success("Carrier deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.carriers.all });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete carrier");
    },
  });

  const openCreateModal = () => {
    setEditingCarrier(null);
    reset({ name: "", code: "", contactEmail: "", contactPhone: "", website: "", trackingUrlTemplate: "", isActive: true });
    setShowModal(true);
  };

  const openEditModal = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    reset({
      name: carrier.name,
      code: carrier.code,
      contactEmail: carrier.contactEmail || "",
      contactPhone: carrier.contactPhone || "",
      website: carrier.website || "",
      trackingUrlTemplate: carrier.trackingUrlTemplate || "",
      isActive: carrier.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCarrier(null);
    reset();
  };

  const onSubmit = (data: CarrierFormData) => {
    if (editingCarrier) {
      updateMutation.mutate({ id: editingCarrier._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleActive = (carrier: Carrier) => {
    updateMutation.mutate({
      id: carrier._id,
      data: { isActive: !carrier.isActive },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carriers</h1>
          <p className="text-gray-600 mt-1">
            Manage shipping carriers and partners
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Carrier
        </Button>
      </div>

      {/* Carriers Table */}
      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : carriers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No carriers yet</h3>
            <p className="text-gray-600 mb-4">Add your first carrier to get started</p>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Carrier
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Carrier</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carriers.map((carrier) => (
                <TableRow key={carrier._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{carrier.name}</p>
                        {carrier.website && (
                          <a
                            href={carrier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {carrier.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {carrier.contactEmail && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="h-3 w-3" />
                          {carrier.contactEmail}
                        </div>
                      )}
                      {carrier.contactPhone && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="h-3 w-3" />
                          {carrier.contactPhone}
                        </div>
                      )}
                      {!carrier.contactEmail && !carrier.contactPhone && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActive(carrier)}
                      className="cursor-pointer"
                    >
                      <Badge variant={carrier.isActive ? "success" : "default"}>
                        {carrier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(carrier)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(carrier._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingCarrier ? "Edit Carrier" : "Add Carrier"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Carrier Name"
              {...register("name")}
              error={errors.name?.message}
              placeholder="e.g., DHL Express"
            />
            <Input
              label="Code"
              {...register("code")}
              error={errors.code?.message}
              placeholder="e.g., DHL"
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Email"
              type="email"
              {...register("contactEmail")}
              error={errors.contactEmail?.message}
              placeholder="contact@carrier.com"
            />
            <Input
              label="Contact Phone"
              {...register("contactPhone")}
              placeholder="+1 234 567 8900"
            />
          </div>
          <Input
            label="Website"
            {...register("website")}
            error={errors.website?.message}
            placeholder="https://www.carrier.com"
          />
          <Input
            label="Tracking URL Template"
            {...register("trackingUrlTemplate")}
            placeholder="https://track.carrier.com/{trackingCode}"
          />
          <p className="text-xs text-gray-500 -mt-2">
            Use {"{trackingCode}"} as placeholder for the tracking number
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCarrier ? "Update" : "Create"} Carrier
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Carrier"
        description="Are you sure you want to delete this carrier? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
