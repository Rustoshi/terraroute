"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Clock,
  Truck,
  Upload,
  Trash2,
  Send,
  FileText,
  Image as ImageIcon,
  DollarSign,
  CreditCard,
  Pencil,
  X,
  Calendar,
  Scale,
  Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ServiceTypeBadge, ShipmentTypeBadge, ShipmentModeBadge, ConsignmentTypeBadge } from "@/components/ui/badge";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { SkeletonDetail } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ShipmentMap, AddressAutocomplete } from "@/components/mapbox";
import {
  shipmentsApi,
  uploadsApi,
  carriersApi,
  type Shipment,
  type PackageImage,
  type Carrier,
  type TrackingEvent,
  type ContactInfo,
} from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { updateStatusSchema, type UpdateStatusFormData } from "@/lib/validations";
import { ShipmentStatus, Currency, PaymentMethod, PaymentStatus, ShipmentMode, ShipmentType, ConsignmentType, ServiceType } from "@/types";
import { formatDateTime, formatDate, cn } from "@/lib/utils";

const statusOptions = Object.values(ShipmentStatus).map((s) => ({
  value: s,
  label: s.replace(/_/g, " "),
}));

const consignmentTypeOptions = Object.values(ConsignmentType).map((s) => ({
  value: s,
  label: s.charAt(0) + s.slice(1).toLowerCase(),
}));

const shipmentTypeOptions = Object.values(ShipmentType).map((s) => ({
  value: s,
  label: s.charAt(0) + s.slice(1).toLowerCase(),
}));

const shipmentModeOptions = Object.values(ShipmentMode).map((s) => ({
  value: s,
  label: s.charAt(0) + s.slice(1).toLowerCase(),
}));

const serviceTypeOptions = Object.values(ServiceType).map((s) => ({
  value: s,
  label: s.replace(/_/g, " "),
}));

const MAX_PACKAGE_IMAGES = 5;

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showFreightModal, setShowFreightModal] = React.useState(false);
  const [showSenderModal, setShowSenderModal] = React.useState(false);
  const [showReceiverModal, setShowReceiverModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [showEditEventModal, setShowEditEventModal] = React.useState(false);
  const [showDeleteEventDialog, setShowDeleteEventDialog] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<TrackingEvent | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Freight form state
  const [freightForm, setFreightForm] = React.useState({
    baseCharge: 0,
    fuelSurcharge: 0,
    handlingFee: 0,
    insuranceFee: 0,
    customsDuty: 0,
    tax: 0,
    discount: 0,
    currency: Currency.USD,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    paymentStatus: PaymentStatus.PENDING,
    paymentReference: "",
    carrierId: "",
    carrierTrackingCode: "",
  });

  // Sender form state
  const [senderForm, setSenderForm] = React.useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  }>({
    name: "",
    email: "",
    phone: "",
    address: "",
    coordinates: undefined,
  });

  // Receiver form state
  const [receiverForm, setReceiverForm] = React.useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  }>({
    name: "",
    email: "",
    phone: "",
    address: "",
    coordinates: undefined,
  });

  // Shipment details form state
  const [detailsForm, setDetailsForm] = React.useState({
    origin: "",
    destination: "",
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    value: 0,
    currency: Currency.USD,
    description: "",
    estimatedDeliveryDate: "",
    // Classification
    consignmentType: ConsignmentType.SHIPMENT,
    shipmentType: ShipmentType.DOMESTIC,
    shipmentMode: ShipmentMode.ROAD,
    serviceType: ServiceType.STANDARD,
  });

  // Event edit form state
  const [eventForm, setEventForm] = React.useState({
    location: "",
    description: "",
  });

  // Fetch carriers for dropdown
  const { data: carriers = [] } = useQuery({
    queryKey: queryKeys.carriers.list(true),
    queryFn: () => carriersApi.list(true),
  });

  // Fetch shipment
  const { data: shipment, isLoading } = useQuery({
    queryKey: queryKeys.shipments.detail(id),
    queryFn: () => shipmentsApi.get(id),
    enabled: !!id,
  });

  // Status update form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateStatusFormData>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: shipment?.status || ShipmentStatus.CREATED,
      location: "",
      description: "",
      sendNotification: true,
    },
  });

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: (data: UpdateStatusFormData) =>
      shipmentsApi.updateStatus(id, data),
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      setShowStatusModal(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => shipmentsApi.delete(id),
    onSuccess: () => {
      toast.success("Shipment deleted");
      router.push("/admin/shipments");
    },
    onError: () => {
      toast.error("Failed to delete shipment");
    },
  });

  // Update shipment mutation (for package images)
  const updateMutation = useMutation({
    mutationFn: (packageImages: { url: string; publicId: string }[]) =>
      shipmentsApi.update(id, { packageImages }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
    },
  });

  // Freight charges mutation
  const freightMutation = useMutation({
    mutationFn: (data: typeof freightForm) => {
      const total = data.baseCharge + (data.fuelSurcharge || 0) + (data.handlingFee || 0) +
        (data.insuranceFee || 0) + (data.customsDuty || 0) + (data.tax || 0) - (data.discount || 0);

      return shipmentsApi.update(id, {
        freightCharges: {
          baseCharge: data.baseCharge,
          fuelSurcharge: data.fuelSurcharge || undefined,
          handlingFee: data.handlingFee || undefined,
          insuranceFee: data.insuranceFee || undefined,
          customsDuty: data.customsDuty || undefined,
          tax: data.tax || undefined,
          discount: data.discount || undefined,
          total,
          currency: data.currency,
          isPaid: data.paymentStatus === PaymentStatus.PAID,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          paymentReference: data.paymentReference || undefined,
        },
        carrier: data.carrierId || undefined,
        carrierTrackingCode: data.carrierTrackingCode || undefined,
      } as any);
    },
    onSuccess: () => {
      toast.success("Freight charges updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      setShowFreightModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update freight charges");
    },
  });

  // Sender mutation - also updates origin address
  const senderMutation = useMutation({
    mutationFn: (data: typeof senderForm) => shipmentsApi.update(id, {
      sender: data,
      origin: data.address, // Keep origin in sync with sender address
    } as any),
    onSuccess: () => {
      toast.success("Sender updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      setShowSenderModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update sender");
    },
  });

  // Receiver mutation - also updates destination address
  const receiverMutation = useMutation({
    mutationFn: (data: typeof receiverForm) => shipmentsApi.update(id, {
      receiver: data,
      destination: data.address, // Keep destination in sync with receiver address
    } as any),
    onSuccess: () => {
      toast.success("Receiver updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      setShowReceiverModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update receiver");
    },
  });

  // Shipment details mutation
  const detailsMutation = useMutation({
    mutationFn: (data: typeof detailsForm) => shipmentsApi.update(id, {
      origin: data.origin,
      destination: data.destination,
      // Classification
      consignmentType: data.consignmentType,
      shipmentType: data.shipmentType,
      shipmentMode: data.shipmentMode,
      serviceType: data.serviceType,
      package: {
        weight: data.weight,
        dimensions: { length: data.length, width: data.width, height: data.height },
        value: data.value || undefined,
        currency: data.currency,
        description: data.description || undefined,
      },
      estimatedDeliveryDate: data.estimatedDeliveryDate || undefined,
    } as any),
    onSuccess: () => {
      toast.success("Shipment details updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      setShowDetailsModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update details");
    },
  });

  // Update tracking event mutation
  const updateEventMutation = useMutation({
    mutationFn: (data: { eventId: string; location: string; description: string }) =>
      shipmentsApi.updateTrackingEvent(id, data.eventId, { location: data.location, description: data.description }),
    onSuccess: () => {
      toast.success("Tracking event updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      setShowEditEventModal(false);
      setSelectedEvent(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update event");
    },
  });

  // Delete tracking event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => shipmentsApi.deleteTrackingEvent(id, eventId),
    onSuccess: () => {
      toast.success("Tracking event deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      setShowDeleteEventDialog(false);
      setSelectedEvent(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });

  // Open freight modal with existing data
  const openFreightModal = () => {
    if (shipment?.freightCharges) {
      setFreightForm({
        baseCharge: shipment.freightCharges.baseCharge,
        fuelSurcharge: shipment.freightCharges.fuelSurcharge || 0,
        handlingFee: shipment.freightCharges.handlingFee || 0,
        insuranceFee: shipment.freightCharges.insuranceFee || 0,
        customsDuty: shipment.freightCharges.customsDuty || 0,
        tax: shipment.freightCharges.tax || 0,
        discount: shipment.freightCharges.discount || 0,
        currency: shipment.freightCharges.currency,
        paymentMethod: shipment.freightCharges.paymentMethod || PaymentMethod.BANK_TRANSFER,
        paymentStatus: shipment.freightCharges.paymentStatus,
        paymentReference: shipment.freightCharges.paymentReference || "",
        carrierId: (shipment.carrier as any)?._id || "",
        carrierTrackingCode: shipment.carrierTrackingCode || "",
      });
    }
    setShowFreightModal(true);
  };

  // Open sender modal with existing data
  const openSenderModal = () => {
    if (shipment) {
      setSenderForm({
        name: shipment.sender.name,
        email: shipment.sender.email,
        phone: shipment.sender.phone,
        address: shipment.sender.address,
        coordinates: shipment.sender.coordinates,
      });
    }
    setShowSenderModal(true);
  };

  // Open receiver modal with existing data
  const openReceiverModal = () => {
    if (shipment) {
      setReceiverForm({
        name: shipment.receiver.name,
        email: shipment.receiver.email,
        phone: shipment.receiver.phone,
        address: shipment.receiver.address,
        coordinates: shipment.receiver.coordinates,
      });
    }
    setShowReceiverModal(true);
  };

  // Open details modal with existing data
  const openDetailsModal = () => {
    if (shipment) {
      setDetailsForm({
        origin: shipment.origin,
        destination: shipment.destination,
        weight: shipment.package.weight,
        length: shipment.package.dimensions.length,
        width: shipment.package.dimensions.width,
        height: shipment.package.dimensions.height,
        value: shipment.package.value || 0,
        currency: (shipment.package as any).currency || Currency.USD,
        description: shipment.package.description || "",
        estimatedDeliveryDate: shipment.estimatedDeliveryDate
          ? new Date(shipment.estimatedDeliveryDate).toISOString().split("T")[0]
          : "",
        // Classification
        consignmentType: shipment.consignmentType || ConsignmentType.SHIPMENT,
        shipmentType: shipment.shipmentType || ShipmentType.DOMESTIC,
        shipmentMode: shipment.shipmentMode || ShipmentMode.ROAD,
        serviceType: shipment.serviceType || ServiceType.STANDARD,
      });
    }
    setShowDetailsModal(true);
  };

  // Open event edit modal
  const openEditEventModal = (event: TrackingEvent) => {
    setSelectedEvent(event);
    setEventForm({
      location: event.location,
      description: event.description || "",
    });
    setShowEditEventModal(true);
  };

  // Open event delete dialog
  const openDeleteEventDialog = (event: TrackingEvent) => {
    setSelectedEvent(event);
    setShowDeleteEventDialog(true);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shipment) return;

    // Check max images limit
    if ((shipment.packageImages?.length || 0) >= MAX_PACKAGE_IMAGES) {
      toast.error(`Maximum ${MAX_PACKAGE_IMAGES} images allowed`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    setIsUploading(true);
    try {
      // Get signed upload params
      const params = await uploadsApi.getSignedParams();
      // Upload to Cloudinary
      const { url, publicId } = await uploadsApi.uploadToCloudinary(file, params);

      // Update shipment with new image
      const newImage = { url, publicId };
      const updatedImages = [
        ...(shipment.packageImages || []).map((img) => ({
          url: img.url,
          publicId: img.publicId,
        })),
        newImage,
      ];

      await updateMutation.mutateAsync(updatedImages);

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove image
  const removeImage = async (publicId: string) => {
    if (!shipment) return;
    const newImages = (shipment.packageImages || [])
      .filter((img) => img.publicId !== publicId)
      .map((img) => ({ url: img.url, publicId: img.publicId }));
    await updateMutation.mutateAsync(newImages);
    toast.success("Image removed");
  };

  const onStatusSubmit = (data: UpdateStatusFormData) => {
    statusMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <button className="flex items-center text-gray-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
        <SkeletonDetail />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Shipment not found</h2>
        <p className="text-gray-500 mt-2">The shipment you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/admin/shipments")} className="mt-4">
          Back to Shipments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {shipment.trackingCode}
            </h1>
            <ConsignmentTypeBadge type={shipment.consignmentType} />
            <ShipmentTypeBadge type={shipment.shipmentType} />
            <ShipmentModeBadge mode={shipment.shipmentMode} />
            <ServiceTypeBadge type={shipment.serviceType} />
            <StatusBadge status={shipment.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              reset({
                status: shipment.status,
                location: shipment.currentLocation || "",
                description: "",
                sendNotification: true,
              });
              setShowStatusModal(true);
            }}
          >
            <Truck className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Update</span> Status
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipment Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShipmentMap shipment={shipment} className="h-80" />
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tracking History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shipment.trackingEvents.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-6">
                    {[...shipment.trackingEvents]
                      .reverse()
                      .map((event, index) => (
                        <div key={event._id} className="relative pl-10 group">
                          <div
                            className={cn(
                              "absolute left-2 w-5 h-5 rounded-full border-2 bg-white",
                              index === 0
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300"
                            )}
                          >
                            {index === 0 && (
                              <div className="absolute inset-1 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <StatusBadge status={event.status} />
                                <span className="text-sm text-gray-600">
                                  {formatDateTime(event.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                {event.location}
                              </p>
                              {event.description && (
                                <p className="text-sm text-gray-700 mt-0.5">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditEventModal(event)}
                                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                title="Edit event"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => openDeleteEventDialog(event)}
                                className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
                                title="Delete event"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No tracking events yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Package Images */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Package Images
                <span className="text-sm font-normal text-gray-500">
                  ({shipment.packageImages?.length || 0}/{MAX_PACKAGE_IMAGES})
                </span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
                disabled={(shipment.packageImages?.length || 0) >= MAX_PACKAGE_IMAGES}
              >
                <Upload className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </CardHeader>
            <CardContent>
              {(shipment.packageImages?.length || 0) > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {shipment.packageImages.map((image) => (
                    <div
                      key={image.publicId}
                      className="relative group rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <img
                        src={image.url}
                        alt="Package"
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2 bg-white">
                        <p className="text-xs text-gray-600">
                          {formatDate(image.uploadedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeImage(image.publicId)}
                        className="absolute top-2 right-2 p-1 rounded bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No package images yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Shipment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Shipment Details
                </div>
                <Button variant="ghost" size="sm" onClick={openDetailsModal}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 wrap-break-word">
              {/* Route Overview */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-center">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Origin</p>
                    <p className="font-semibold text-gray-900">{shipment.origin}</p>
                    {shipment.originLocation && (
                      <p className="text-xs text-gray-500">
                        {shipment.originLocation.city}, {shipment.originLocation.state}
                      </p>
                    )}
                  </div>
                  <div className="px-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Destination</p>
                    <p className="font-semibold text-gray-900">{shipment.destination}</p>
                    {shipment.destinationLocation && (
                      <p className="text-xs text-gray-500">
                        {shipment.destinationLocation.city}, {shipment.destinationLocation.state}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {shipment.currentLocation && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Location</p>
                  <p className="text-gray-900">{shipment.currentLocation}</p>
                </div>
              )}
              {shipment.estimatedDeliveryDate && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Estimated Delivery</p>
                  <p className="text-gray-900">
                    {formatDate(shipment.estimatedDeliveryDate, { timeZone: "UTC" })}
                  </p>
                </div>
              )}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-600">Package</p>
                <p className="text-sm text-gray-900">
                  {shipment.package.weight} kg •{" "}
                  {shipment.package.dimensions.length}×
                  {shipment.package.dimensions.width}×
                  {shipment.package.dimensions.height} cm
                </p>
                {shipment.package.value && (
                  <p className="text-sm text-gray-900">
                    Value: ${shipment.package.value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Freight Charges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Freight Charges
                </div>
                <Button variant="ghost" size="sm" onClick={openFreightModal}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shipment.freightCharges ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Charge</span>
                    <span className="text-gray-900">{shipment.freightCharges.currency} {shipment.freightCharges.baseCharge.toFixed(2)}</span>
                  </div>
                  {shipment.freightCharges.fuelSurcharge && shipment.freightCharges.fuelSurcharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fuel Surcharge</span>
                      <span className="text-gray-900">{shipment.freightCharges.currency} {shipment.freightCharges.fuelSurcharge.toFixed(2)}</span>
                    </div>
                  )}
                  {shipment.freightCharges.handlingFee && shipment.freightCharges.handlingFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Handling Fee</span>
                      <span className="text-gray-900">{shipment.freightCharges.currency} {shipment.freightCharges.handlingFee.toFixed(2)}</span>
                    </div>
                  )}
                  {shipment.freightCharges.insuranceFee && shipment.freightCharges.insuranceFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Insurance</span>
                      <span className="text-gray-900">{shipment.freightCharges.currency} {shipment.freightCharges.insuranceFee.toFixed(2)}</span>
                    </div>
                  )}
                  {shipment.freightCharges.customsDuty && shipment.freightCharges.customsDuty > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customs Duty</span>
                      <span className="text-gray-900">{shipment.freightCharges.currency} {shipment.freightCharges.customsDuty.toFixed(2)}</span>
                    </div>
                  )}
                  {shipment.freightCharges.tax && shipment.freightCharges.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">{shipment.freightCharges.currency} {shipment.freightCharges.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {shipment.freightCharges.discount && shipment.freightCharges.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{shipment.freightCharges.currency} {shipment.freightCharges.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{shipment.freightCharges.currency} {shipment.freightCharges.total.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Status</span>
                      <span className={cn(
                        "font-medium",
                        shipment.freightCharges.paymentStatus === "PAID" ? "text-green-600" :
                          shipment.freightCharges.paymentStatus === "PENDING" ? "text-yellow-600" : "text-red-600"
                      )}>
                        {shipment.freightCharges.paymentStatus}
                      </span>
                    </div>
                    {shipment.freightCharges.paymentMethod && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="text-gray-900">{shipment.freightCharges.paymentMethod.replace(/_/g, " ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">No freight charges set</p>
                  <Button variant="outline" size="sm" onClick={openFreightModal}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Charges
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carrier */}
          {shipment.carrier && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Carrier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-gray-900">{shipment.carrier.name}</p>
                <p className="text-sm text-gray-600">Code: {shipment.carrier.code}</p>
                {shipment.carrierTrackingCode && (
                  <p className="text-sm text-gray-600 mt-2">
                    Carrier Tracking: <code className="bg-gray-100 px-1 rounded">{shipment.carrierTrackingCode}</code>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sender */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Sender
                </div>
                <Button variant="ghost" size="sm" onClick={openSenderModal}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-gray-900">{shipment.sender.name}</p>
              <p className="text-sm text-gray-700">{shipment.sender.email}</p>
              <p className="text-sm text-gray-700">{shipment.sender.phone}</p>
              <p className="text-sm text-gray-700 mt-2">
                {shipment.sender.address}
              </p>
            </CardContent>
          </Card>

          {/* Receiver */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Receiver
                </div>
                <Button variant="ghost" size="sm" onClick={openReceiverModal}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-gray-900">{shipment.receiver.name}</p>
              <p className="text-sm text-gray-700">{shipment.receiver.email}</p>
              <p className="text-sm text-gray-700">{shipment.receiver.phone}</p>
              <p className="text-sm text-gray-700 mt-2">
                {shipment.receiver.address}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Shipment Status"
        size="md"
      >
        <form onSubmit={handleSubmit(onStatusSubmit)} className="space-y-4">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="New Status"
                options={statusOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <AddressAutocomplete
                label="Location"
                value={field.value || ""}
                onChange={field.onChange}
                onSelect={(address, _coords, _locationInfo) => field.onChange(address)}
                placeholder="Current location..."
              />
            )}
          />
          <Textarea
            label="Description"
            {...register("description")}
            placeholder="Status update details..."
            rows={3}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendNotification"
              {...register("sendNotification")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="sendNotification" className="text-sm text-gray-700">
              Send email notification to customer
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={statusMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Shipment"
        description="Are you sure you want to delete this shipment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Freight Charges Modal */}
      <Modal
        isOpen={showFreightModal}
        onClose={() => setShowFreightModal(false)}
        title="Freight Charges & Carrier"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            freightMutation.mutate(freightForm);
          }}
          className="space-y-6"
        >
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
            <select
              value={freightForm.currency}
              onChange={(e) => setFreightForm({ ...freightForm, currency: e.target.value as Currency })}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(Currency).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Charges Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Charge"
              type="number"
              step="0.01"
              value={freightForm.baseCharge}
              onChange={(e) => setFreightForm({ ...freightForm, baseCharge: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Fuel Surcharge"
              type="number"
              step="0.01"
              value={freightForm.fuelSurcharge}
              onChange={(e) => setFreightForm({ ...freightForm, fuelSurcharge: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Handling Fee"
              type="number"
              step="0.01"
              value={freightForm.handlingFee}
              onChange={(e) => setFreightForm({ ...freightForm, handlingFee: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Insurance Fee"
              type="number"
              step="0.01"
              value={freightForm.insuranceFee}
              onChange={(e) => setFreightForm({ ...freightForm, insuranceFee: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Customs Duty"
              type="number"
              step="0.01"
              value={freightForm.customsDuty}
              onChange={(e) => setFreightForm({ ...freightForm, customsDuty: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Tax"
              type="number"
              step="0.01"
              value={freightForm.tax}
              onChange={(e) => setFreightForm({ ...freightForm, tax: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Discount"
              type="number"
              step="0.01"
              value={freightForm.discount}
              onChange={(e) => setFreightForm({ ...freightForm, discount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Calculated Total */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-lg font-medium text-gray-900">
              <span>Total</span>
              <span>
                {freightForm.currency}{" "}
                {(
                  freightForm.baseCharge +
                  (freightForm.fuelSurcharge || 0) +
                  (freightForm.handlingFee || 0) +
                  (freightForm.insuranceFee || 0) +
                  (freightForm.customsDuty || 0) +
                  (freightForm.tax || 0) -
                  (freightForm.discount || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Section */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">Payment Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                <select
                  value={freightForm.paymentMethod}
                  onChange={(e) => setFreightForm({ ...freightForm, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(PaymentMethod).map((m) => (
                    <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Status</label>
                <select
                  value={freightForm.paymentStatus}
                  onChange={(e) => setFreightForm({ ...freightForm, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(PaymentStatus).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <Input
              label="Payment Reference"
              value={freightForm.paymentReference}
              onChange={(e) => setFreightForm({ ...freightForm, paymentReference: e.target.value })}
              placeholder="Transaction ID, Invoice number, etc."
            />
          </div>

          {/* Carrier Section */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">Carrier</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Carrier</label>
                <select
                  value={freightForm.carrierId}
                  onChange={(e) => setFreightForm({ ...freightForm, carrierId: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select carrier...</option>
                  {carriers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <Input
                label="Carrier Tracking Code"
                value={freightForm.carrierTrackingCode}
                onChange={(e) => setFreightForm({ ...freightForm, carrierTrackingCode: e.target.value })}
                placeholder="External tracking number"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowFreightModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={freightMutation.isPending}>
              <CreditCard className="h-4 w-4 mr-2" />
              Save Charges
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sender Edit Modal */}
      <Modal
        isOpen={showSenderModal}
        onClose={() => setShowSenderModal(false)}
        title="Edit Sender"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            senderMutation.mutate(senderForm);
          }}
          className="space-y-4"
        >
          <Input
            label="Full Name"
            value={senderForm.name}
            onChange={(e) => setSenderForm({ ...senderForm, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={senderForm.email}
            onChange={(e) => setSenderForm({ ...senderForm, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={senderForm.phone}
            onChange={(e) => setSenderForm({ ...senderForm, phone: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <AddressAutocomplete
              value={senderForm.address}
              onChange={(val) => setSenderForm({ ...senderForm, address: val, coordinates: undefined })}
              onSelect={(address, coordinates, _locationInfo) => setSenderForm({ ...senderForm, address, coordinates })}
              placeholder="Enter address..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowSenderModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={senderMutation.isPending}>
              Save Sender
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receiver Edit Modal */}
      <Modal
        isOpen={showReceiverModal}
        onClose={() => setShowReceiverModal(false)}
        title="Edit Receiver"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            receiverMutation.mutate(receiverForm);
          }}
          className="space-y-4"
        >
          <Input
            label="Full Name"
            value={receiverForm.name}
            onChange={(e) => setReceiverForm({ ...receiverForm, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={receiverForm.email}
            onChange={(e) => setReceiverForm({ ...receiverForm, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={receiverForm.phone}
            onChange={(e) => setReceiverForm({ ...receiverForm, phone: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <AddressAutocomplete
              value={receiverForm.address}
              onChange={(val) => setReceiverForm({ ...receiverForm, address: val, coordinates: undefined })}
              onSelect={(address, coordinates, _locationInfo) => setReceiverForm({ ...receiverForm, address, coordinates })}
              placeholder="Enter address..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowReceiverModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={receiverMutation.isPending}>
              Save Receiver
            </Button>
          </div>
        </form>
      </Modal>

      {/* Shipment Details Edit Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Edit Shipment Details"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            detailsMutation.mutate(detailsForm);
          }}
          className="space-y-4"
        >
          {/* Origin & Destination */}
          <div className="space-y-4 pb-4 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Origin</label>
              <AddressAutocomplete
                value={detailsForm.origin}
                onChange={(val) => setDetailsForm({ ...detailsForm, origin: val })}
                onSelect={(address, _coords, _locationInfo) => setDetailsForm({ ...detailsForm, origin: address })}
                placeholder="Origin address..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination</label>
              <AddressAutocomplete
                value={detailsForm.destination}
                onChange={(val) => setDetailsForm({ ...detailsForm, destination: val })}
                onSelect={(address, _coords, _locationInfo) => setDetailsForm({ ...detailsForm, destination: address })}
                placeholder="Destination address..."
              />
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-3 pb-4 border-b">
            <h4 className="text-sm font-medium text-gray-700">Shipment Classification</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select
                  value={detailsForm.consignmentType}
                  onChange={(e) => setDetailsForm({ ...detailsForm, consignmentType: e.target.value as ConsignmentType })}
                  className="w-full h-9 px-2 text-sm rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {consignmentTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select
                  value={detailsForm.shipmentType}
                  onChange={(e) => setDetailsForm({ ...detailsForm, shipmentType: e.target.value as ShipmentType })}
                  className="w-full h-9 px-2 text-sm rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {shipmentTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mode</label>
                <select
                  value={detailsForm.shipmentMode}
                  onChange={(e) => setDetailsForm({ ...detailsForm, shipmentMode: e.target.value as ShipmentMode })}
                  className="w-full h-9 px-2 text-sm rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {shipmentModeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Service</label>
                <select
                  value={detailsForm.serviceType}
                  onChange={(e) => setDetailsForm({ ...detailsForm, serviceType: e.target.value as ServiceType })}
                  className="w-full h-9 px-2 text-sm rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {serviceTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              value={detailsForm.weight}
              onChange={(e) => setDetailsForm({ ...detailsForm, weight: parseFloat(e.target.value) || 0 })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select
                value={detailsForm.currency}
                onChange={(e) => setDetailsForm({ ...detailsForm, currency: e.target.value as Currency })}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(Currency).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Length (cm)"
              type="number"
              value={detailsForm.length}
              onChange={(e) => setDetailsForm({ ...detailsForm, length: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Width (cm)"
              type="number"
              value={detailsForm.width}
              onChange={(e) => setDetailsForm({ ...detailsForm, width: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Height (cm)"
              type="number"
              value={detailsForm.height}
              onChange={(e) => setDetailsForm({ ...detailsForm, height: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <Input
            label={`Declared Value (${detailsForm.currency})`}
            type="number"
            step="0.01"
            value={detailsForm.value}
            onChange={(e) => setDetailsForm({ ...detailsForm, value: parseFloat(e.target.value) || 0 })}
          />
          <Textarea
            label="Description"
            value={detailsForm.description}
            onChange={(e) => setDetailsForm({ ...detailsForm, description: e.target.value })}
            rows={2}
          />
          <Input
            label="Estimated Delivery Date"
            type="date"
            value={detailsForm.estimatedDeliveryDate}
            onChange={(e) => setDetailsForm({ ...detailsForm, estimatedDeliveryDate: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowDetailsModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={detailsMutation.isPending}>
              Save Details
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Tracking Event Modal */}
      <Modal
        isOpen={showEditEventModal}
        onClose={() => {
          setShowEditEventModal(false);
          setSelectedEvent(null);
        }}
        title="Edit Tracking Event"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedEvent) {
              updateEventMutation.mutate({
                eventId: selectedEvent._id,
                location: eventForm.location,
                description: eventForm.description,
              });
            }
          }}
          className="space-y-4"
        >
          {selectedEvent && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Status: <StatusBadge status={selectedEvent.status} />
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Created: {formatDateTime(selectedEvent.createdAt)}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <AddressAutocomplete
              value={eventForm.location}
              onChange={(val) => setEventForm({ ...eventForm, location: val })}
              onSelect={(address, _coords, _locationInfo) => setEventForm({ ...eventForm, location: address })}
              placeholder="Event location..."
            />
          </div>
          <Textarea
            label="Description"
            value={eventForm.description}
            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditEventModal(false);
                setSelectedEvent(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={updateEventMutation.isPending}>
              Save Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Tracking Event Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteEventDialog}
        onClose={() => {
          setShowDeleteEventDialog(false);
          setSelectedEvent(null);
        }}
        onConfirm={() => {
          if (selectedEvent) {
            deleteEventMutation.mutate(selectedEvent._id);
          }
        }}
        title="Delete Tracking Event"
        description={`Are you sure you want to delete this tracking event? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteEventMutation.isPending}
      />
    </div>
  );
}
