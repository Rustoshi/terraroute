"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Package,
  MapPin,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Image as ImageIcon,
  DollarSign,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressAutocomplete } from "@/components/mapbox";
import { shipmentsApi, uploadsApi, carriersApi, type CreateShipmentPayload, type Coordinates, type Carrier } from "@/lib/api";
import { createShipmentSchema, type CreateShipmentFormData } from "@/lib/validations";
import { ServiceType, ShipmentType, ShipmentMode, ConsignmentType, Currency, PaymentMethod, PaymentStatus } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, name: "Sender", icon: User },
  { id: 2, name: "Receiver", icon: MapPin },
  { id: 3, name: "Package", icon: Package },
  { id: 4, name: "Review", icon: CheckCircle },
];

// Consignment Type options (Shipment vs Consignment)
const consignmentTypeOptions = Object.values(ConsignmentType).map((s) => ({
  value: s,
  label: s.charAt(0) + s.slice(1).toLowerCase(),
}));

// Shipment Type options (Domestic, International, etc.)
const shipmentTypeOptions = Object.values(ShipmentType).map((s) => ({
  value: s,
  label: s.charAt(0) + s.slice(1).toLowerCase(),
}));

// Shipment Mode options (Air, Sea, Road, etc.)
const shipmentModeOptions = Object.values(ShipmentMode).map((s) => ({
  value: s,
  label: s.charAt(0) + s.slice(1).toLowerCase(),
}));

// Service Type options (Economy, Standard, Express, etc.)
const serviceTypeOptions = Object.values(ServiceType).map((s) => ({
  value: s,
  label: s.replace(/_/g, " "),
}));

const MAX_PACKAGE_IMAGES = 5;

interface UploadedImage {
  url: string;
  publicId: string;
  preview?: string;
}

export default function NewShipmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [senderCoords, setSenderCoords] = React.useState<Coordinates | null>(null);
  const [receiverCoords, setReceiverCoords] = React.useState<Coordinates | null>(null);
  const [originCoords, setOriginCoords] = React.useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] = React.useState<Coordinates | null>(null);
  const [originAddress, setOriginAddress] = React.useState("");
  const [destinationAddress, setDestinationAddress] = React.useState("");
  const [originLocationInfo, setOriginLocationInfo] = React.useState<{ city: string; state: string; country: string } | null>(null);
  const [destinationLocationInfo, setDestinationLocationInfo] = React.useState<{ city: string; state: string; country: string } | null>(null);
  const [packageImages, setPackageImages] = React.useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [sendNotification, setSendNotification] = React.useState(true);
  const [showFreightSection, setShowFreightSection] = React.useState(false);
  const [freightData, setFreightData] = React.useState({
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
  });
  const [selectedCarrier, setSelectedCarrier] = React.useState("");
  const [carrierTrackingCode, setCarrierTrackingCode] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch carriers
  const { data: carriers = [] } = useQuery({
    queryKey: queryKeys.carriers.list(true),
    queryFn: () => carriersApi.list(true),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateShipmentFormData>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      sender: { name: "", phone: "", email: "", address: "" },
      receiver: { name: "", phone: "", email: "", address: "" },
      package: {
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        value: 0,
        description: "",
      },
      serviceType: ServiceType.STANDARD,
    },
  });

  const formData = watch();

  const createMutation = useMutation({
    mutationFn: (data: CreateShipmentPayload) => shipmentsApi.create(data),
    onSuccess: (shipment) => {
      toast.success("Shipment created successfully!");
      router.push(`/admin/shipments/${shipment._id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create shipment");
    },
  });

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        return trigger(["sender.name", "sender.phone", "sender.email", "sender.address"]);
      case 2:
        return trigger(["receiver.name", "receiver.phone", "receiver.email", "receiver.address"]);
      case 3:
        return trigger(["package.weight", "package.dimensions", "serviceType"]);
      default:
        return true;
    }
  };

  const nextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_PACKAGE_IMAGES - packageImages.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_PACKAGE_IMAGES} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        const params = await uploadsApi.getSignedParams();
        const { url, publicId } = await uploadsApi.uploadToCloudinary(file, params);
        
        setPackageImages((prev) => [...prev, { url, publicId }]);
      }
      toast.success("Images uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove image
  const removeImage = (publicId: string) => {
    setPackageImages((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  const onSubmit = (data: CreateShipmentFormData) => {
    // Only submit if we're on the final step (preview)
    if (currentStep !== 4) {
      return;
    }

    const payload: CreateShipmentPayload = {
      ...data,
      consignmentType: data.consignmentType || ConsignmentType.SHIPMENT,
      shipmentType: data.shipmentType || ShipmentType.DOMESTIC,
      shipmentMode: data.shipmentMode || ShipmentMode.ROAD,
      serviceType: data.serviceType || ServiceType.STANDARD,
      sender: {
        ...data.sender,
        coordinates: senderCoords || undefined,
      },
      receiver: {
        ...data.receiver,
        coordinates: receiverCoords || undefined,
      },
      package: {
        ...data.package,
        currency: freightData.currency, // Unified currency for declared value
      },
      // Origin/destination from autocomplete (for tracking/map)
      origin: originAddress || data.sender.address,
      destination: destinationAddress || data.receiver.address,
      // Store location info from autocomplete
      originLocation: originLocationInfo ? {
        city: originLocationInfo.city,
        state: originLocationInfo.state,
        country: originLocationInfo.country,
        coordinates: originCoords || undefined,
      } : undefined,
      destinationLocation: destinationLocationInfo ? {
        city: destinationLocationInfo.city,
        state: destinationLocationInfo.state,
        country: destinationLocationInfo.country,
        coordinates: destinationCoords || undefined,
      } : undefined,
      packageImages: packageImages.map((img) => ({
        url: img.url,
        publicId: img.publicId,
      })),
      sendNotification,
      // Include freight charges if section is enabled and has data
      freightCharges: showFreightSection && freightData.baseCharge > 0 ? {
        baseCharge: freightData.baseCharge,
        fuelSurcharge: freightData.fuelSurcharge || undefined,
        handlingFee: freightData.handlingFee || undefined,
        insuranceFee: freightData.insuranceFee || undefined,
        customsDuty: freightData.customsDuty || undefined,
        tax: freightData.tax || undefined,
        discount: freightData.discount || undefined,
        total: freightData.baseCharge + (freightData.fuelSurcharge || 0) + 
               (freightData.handlingFee || 0) + (freightData.insuranceFee || 0) + 
               (freightData.customsDuty || 0) + (freightData.tax || 0) - 
               (freightData.discount || 0),
        currency: freightData.currency,
        isPaid: freightData.paymentStatus === PaymentStatus.PAID,
        paymentMethod: freightData.paymentMethod,
        paymentStatus: freightData.paymentStatus,
        paymentReference: freightData.paymentReference || undefined,
      } : undefined,
      carrier: selectedCarrier || undefined,
      carrierTrackingCode: carrierTrackingCode || undefined,
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Shipment</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details to create a new shipment
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                    currentStep >= step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 font-medium",
                    currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded",
                    currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
        // Prevent form submission on Enter key except on the final step
        if (e.key === "Enter" && currentStep < 4) {
          e.preventDefault();
        }
      }}>
        {/* Step 1: Sender */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Sender Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Origin Address - For Tracking/Map */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Origin Location
                </h4>
                <p className="text-xs text-blue-600 mb-3">
                  Used for tracking and map display
                </p>
                <AddressAutocomplete
                  label="Origin Address"
                  value={originAddress}
                  onChange={setOriginAddress}
                  onSelect={(address, coords, locationInfo) => {
                    setOriginAddress(address);
                    setOriginCoords(coords);
                    setOriginLocationInfo(locationInfo);
                  }}
                  placeholder="Search for origin city or address..."
                />
              </div>

              {/* Sender Contact Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Sender Contact Details</h4>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    {...register("sender.name")}
                    error={errors.sender?.name?.message}
                    placeholder="John Doe"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Phone"
                      {...register("sender.phone")}
                      error={errors.sender?.phone?.message}
                      placeholder="+1 234 567 890"
                    />
                    <Input
                      label="Email"
                      type="email"
                      {...register("sender.email")}
                      error={errors.sender?.email?.message}
                      placeholder="john@example.com"
                    />
                  </div>
                  <Textarea
                    label="Sender Full Address"
                    {...register("sender.address")}
                    error={errors.sender?.address?.message}
                    placeholder="Enter sender's complete street address, apartment, building, etc."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Receiver */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Receiver Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Destination Address - For Tracking/Map */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Destination Location
                </h4>
                <p className="text-xs text-green-600 mb-3">
                  Used for tracking and map display
                </p>
                <AddressAutocomplete
                  label="Destination Address"
                  value={destinationAddress}
                  onChange={setDestinationAddress}
                  onSelect={(address, coords, locationInfo) => {
                    setDestinationAddress(address);
                    setDestinationCoords(coords);
                    setDestinationLocationInfo(locationInfo);
                  }}
                  placeholder="Search for destination city or address..."
                />
              </div>

              {/* Receiver Contact Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Receiver Contact Details</h4>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    {...register("receiver.name")}
                    error={errors.receiver?.name?.message}
                    placeholder="Jane Smith"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Phone"
                      {...register("receiver.phone")}
                      error={errors.receiver?.phone?.message}
                      placeholder="+1 234 567 890"
                    />
                    <Input
                      label="Email"
                      type="email"
                      {...register("receiver.email")}
                      error={errors.receiver?.email?.message}
                      placeholder="jane@example.com"
                    />
                  </div>
                  <Textarea
                    label="Receiver Full Address"
                    {...register("receiver.address")}
                    error={errors.receiver?.address?.message}
                    placeholder="Enter receiver's complete street address, apartment, building, etc."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Package */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Classification Section */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Shipment Classification</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Controller
                    name="consignmentType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Category"
                        options={consignmentTypeOptions}
                        value={field.value || ConsignmentType.SHIPMENT}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="shipmentType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Type"
                        options={shipmentTypeOptions}
                        value={field.value || ShipmentType.DOMESTIC}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="shipmentMode"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Mode"
                        options={shipmentModeOptions}
                        value={field.value || ShipmentMode.ROAD}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="serviceType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Service"
                        options={serviceTypeOptions}
                        value={field.value || ServiceType.STANDARD}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  {...register("package.weight", { valueAsNumber: true })}
                  error={errors.package?.weight?.message}
                  placeholder="0.0"
                />
                <Input
                  label={`Declared Value (${freightData.currency})`}
                  type="number"
                  {...register("package.value", { valueAsNumber: true })}
                  error={errors.package?.value?.message}
                  placeholder="0.00"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                  <select
                    value={freightData.currency}
                    onChange={(e) => setFreightData({ ...freightData, currency: e.target.value as Currency })}
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
                  {...register("package.dimensions.length", { valueAsNumber: true })}
                  error={errors.package?.dimensions?.length?.message}
                  placeholder="0"
                />
                <Input
                  label="Width (cm)"
                  type="number"
                  {...register("package.dimensions.width", { valueAsNumber: true })}
                  error={errors.package?.dimensions?.width?.message}
                  placeholder="0"
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  {...register("package.dimensions.height", { valueAsNumber: true })}
                  error={errors.package?.dimensions?.height?.message}
                  placeholder="0"
                />
              </div>
              <Textarea
                label="Description"
                {...register("package.description")}
                placeholder="Package contents description..."
                rows={3}
              />
              <Input
                label="Estimated Delivery Date"
                type="date"
                {...register("estimatedDeliveryDate")}
              />

              {/* Package Images */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Package Images ({packageImages.length}/{MAX_PACKAGE_IMAGES})
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={packageImages.length >= MAX_PACKAGE_IMAGES || isUploading}
                    isLoading={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                {packageImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {packageImages.map((image) => (
                      <div
                        key={image.publicId}
                        className="relative group aspect-square rounded-lg border border-gray-200 overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt="Package"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.publicId)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Upload up to {MAX_PACKAGE_IMAGES} package images (optional)
                    </p>
                  </div>
                )}
              </div>

              {/* Freight & Carrier Section (Collapsible) */}
              <div className="pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowFreightSection(!showFreightSection)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Freight Charges & Carrier (Optional)
                    </span>
                  </div>
                  {showFreightSection ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                {showFreightSection && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">
                      Currency: <span className="font-medium">{freightData.currency}</span> (set above)
                    </p>
                    
                    {/* Charges */}
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Base Charge"
                        type="number"
                        step="0.01"
                        value={freightData.baseCharge}
                        onChange={(e) => setFreightData({ ...freightData, baseCharge: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        label="Fuel Surcharge"
                        type="number"
                        step="0.01"
                        value={freightData.fuelSurcharge}
                        onChange={(e) => setFreightData({ ...freightData, fuelSurcharge: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        label="Handling Fee"
                        type="number"
                        step="0.01"
                        value={freightData.handlingFee}
                        onChange={(e) => setFreightData({ ...freightData, handlingFee: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        label="Insurance"
                        type="number"
                        step="0.01"
                        value={freightData.insuranceFee}
                        onChange={(e) => setFreightData({ ...freightData, insuranceFee: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        label="Customs Duty"
                        type="number"
                        step="0.01"
                        value={freightData.customsDuty}
                        onChange={(e) => setFreightData({ ...freightData, customsDuty: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        label="Tax"
                        type="number"
                        step="0.01"
                        value={freightData.tax}
                        onChange={(e) => setFreightData({ ...freightData, tax: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        label="Discount"
                        type="number"
                        step="0.01"
                        value={freightData.discount}
                        onChange={(e) => setFreightData({ ...freightData, discount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    {/* Total */}
                    {freightData.baseCharge > 0 && (
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="flex justify-between font-medium text-gray-900">
                          <span>Total</span>
                          <span>
                            {freightData.currency}{" "}
                            {(
                              freightData.baseCharge +
                              (freightData.fuelSurcharge || 0) +
                              (freightData.handlingFee || 0) +
                              (freightData.insuranceFee || 0) +
                              (freightData.customsDuty || 0) +
                              (freightData.tax || 0) -
                              (freightData.discount || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Payment */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                          value={freightData.paymentMethod}
                          onChange={(e) => setFreightData({ ...freightData, paymentMethod: e.target.value as PaymentMethod })}
                          className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.values(PaymentMethod).map((m) => (
                            <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                        <select
                          value={freightData.paymentStatus}
                          onChange={(e) => setFreightData({ ...freightData, paymentStatus: e.target.value as PaymentStatus })}
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
                      value={freightData.paymentReference}
                      onChange={(e) => setFreightData({ ...freightData, paymentReference: e.target.value })}
                      placeholder="Transaction ID, Invoice #, etc."
                    />

                    {/* Carrier */}
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Carrier</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Carrier</label>
                          <select
                            value={selectedCarrier}
                            onChange={(e) => setSelectedCarrier(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">None</option>
                            {carriers.map((c) => (
                              <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="Carrier Tracking #"
                          value={carrierTrackingCode}
                          onChange={(e) => setCarrierTrackingCode(e.target.value)}
                          placeholder="External tracking code"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Shipment Details</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Route Overview */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Origin</p>
                      <p className="font-semibold text-gray-900">
                        {originAddress || "Not specified"}
                      </p>
                    </div>
                    <div className="shrink-0 px-4">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Destination</p>
                      <p className="font-semibold text-gray-900">
                        {destinationAddress || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sender */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Sender Details</h4>
                    <p className="font-medium text-gray-900 truncate">{formData.sender.name}</p>
                    <p className="text-sm text-gray-600 truncate">{formData.sender.email}</p>
                    <p className="text-sm text-gray-600">{formData.sender.phone}</p>
                    <p className="text-sm text-gray-600 mt-1 wrap-break-word">{formData.sender.address}</p>
                  </div>
                  {/* Receiver */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Receiver Details</h4>
                    <p className="font-medium text-gray-900 truncate">{formData.receiver.name}</p>
                    <p className="text-sm text-gray-600 truncate">{formData.receiver.email}</p>
                    <p className="text-sm text-gray-600">{formData.receiver.phone}</p>
                    <p className="text-sm text-gray-600 mt-1 wrap-break-word">{formData.receiver.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Package</h4>
                    <p className="text-sm text-gray-900">
                      <span className="text-gray-600">Weight:</span>{" "}
                      {formData.package.weight} kg
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="text-gray-600">Dimensions:</span>{" "}
                      {formData.package.dimensions.length} ×{" "}
                      {formData.package.dimensions.width} ×{" "}
                      {formData.package.dimensions.height} cm
                    </p>
                    {formData.package.value && formData.package.value > 0 && (
                      <p className="text-sm text-gray-900">
                        <span className="text-gray-600">Declared Value:</span>{" "}
                        {freightData.currency} {formData.package.value.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Service</h4>
                    <p className="font-medium text-gray-900">{formData.serviceType?.replace(/_/g, " ")}</p>
                    {formData.estimatedDeliveryDate && (
                      <p className="text-sm text-gray-600">
                        ETA: {formData.estimatedDeliveryDate}
                      </p>
                    )}
                  </div>
                </div>
                {formData.package.description && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{formData.package.description}</p>
                  </div>
                )}
                {packageImages.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Package Images ({packageImages.length})
                    </h4>
                    <div className="grid grid-cols-5 gap-2">
                      {packageImages.map((image) => (
                        <div
                          key={image.publicId}
                          className="aspect-square rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <img
                            src={image.url}
                            alt="Package"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Freight & Carrier Review */}
                {(showFreightSection && freightData.baseCharge > 0) || selectedCarrier ? (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {showFreightSection && freightData.baseCharge > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Freight Charges
                          </h4>
                          <p className="font-medium text-gray-900">
                            {freightData.currency}{" "}
                            {(
                              freightData.baseCharge +
                              (freightData.fuelSurcharge || 0) +
                              (freightData.handlingFee || 0) +
                              (freightData.insuranceFee || 0) +
                              (freightData.customsDuty || 0) +
                              (freightData.tax || 0) -
                              (freightData.discount || 0)
                            ).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {freightData.paymentMethod.replace(/_/g, " ")} • {freightData.paymentStatus}
                          </p>
                        </div>
                      )}
                      {selectedCarrier && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                            <Truck className="h-3 w-3" /> Carrier
                          </h4>
                          <p className="font-medium">
                            {carriers.find(c => c._id === selectedCarrier)?.name || "Selected"}
                          </p>
                          {carrierTrackingCode && (
                            <p className="text-sm text-gray-600">
                              Tracking: {carrierTrackingCode}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Notification Option */}
            <Card>
              <CardContent className="pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Send notification email</p>
                    <p className="text-sm text-gray-600">
                      Notify the receiver about this shipment via email
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button type="button" onClick={(e) => nextStep(e)}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" isLoading={createMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
