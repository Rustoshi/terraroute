"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FileText,
  MessageSquare,
  DollarSign,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteStatusBadge, ServiceTypeBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyQuotes } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { quotesApi, type Quote, type QuoteFilters } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { respondToQuoteSchema, type RespondToQuoteFormData } from "@/lib/validations";
import { QuoteStatus } from "@/types";
import { formatDate, formatCurrency, truncate } from "@/lib/utils";

const statusOptions = [
  { value: "", label: "All Statuses" },
  ...Object.values(QuoteStatus).map((s) => ({ value: s, label: s })),
];

export default function QuotesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState<QuoteFilters>({
    page: 1,
    limit: 10,
  });
  const [selectedQuote, setSelectedQuote] = React.useState<Quote | null>(null);

  // Fetch quotes
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.quotes.list(filters),
    queryFn: () => quotesApi.list(filters),
  });

  // Respond form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RespondToQuoteFormData>({
    resolver: zodResolver(respondToQuoteSchema),
    defaultValues: {
      adminResponse: "",
      estimatedPrice: undefined,
      sendEmail: true,
    },
  });

  // Respond mutation
  const respondMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RespondToQuoteFormData }) =>
      quotesApi.respond(id, data),
    onSuccess: () => {
      toast.success("Response sent successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
      setSelectedQuote(null);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send response");
    },
  });

  const onSubmit = (data: RespondToQuoteFormData) => {
    if (!selectedQuote) return;
    respondMutation.mutate({ id: selectedQuote._id, data });
  };

  const openQuoteModal = (quote: Quote) => {
    setSelectedQuote(quote);
    reset({
      adminResponse: quote.adminResponse || "",
      estimatedPrice: quote.estimatedPrice || undefined,
      sendEmail: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
        <p className="text-gray-500 mt-1">
          Manage and respond to customer quote requests
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Select
              label="Status"
              options={statusOptions}
              value={filters.status || ""}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value as QuoteStatus || undefined,
                  page: 1,
                }))
              }
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : !data?.data.length ? (
        <Card>
          <EmptyQuotes />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Est. Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((quote) => (
                <TableRow key={quote._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{quote.name}</p>
                      <p className="text-sm text-gray-700">{quote.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{truncate(quote.origin, 20)}</p>
                      <p className="text-gray-700">
                        → {truncate(quote.destination, 20)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ServiceTypeBadge type={quote.serviceType} />
                  </TableCell>
                  <TableCell>
                    {quote.estimatedPrice
                      ? formatCurrency(quote.estimatedPrice)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {formatDate(quote.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openQuoteModal(quote)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {quote.status === "PENDING" ? "Respond" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Page {data.pagination.page} of {data.pagination.totalPages}
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

      {/* Quote Detail/Respond Modal */}
      <Modal
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        title={`Quote Request - ${selectedQuote?.name}`}
        size="lg"
      >
        {selectedQuote && (
          <div className="space-y-6">
            {/* Quote Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600">Customer</h4>
                <p className="font-medium text-gray-900">{selectedQuote.name}</p>
                <p className="text-sm text-gray-700">{selectedQuote.email}</p>
                <p className="text-sm text-gray-700">{selectedQuote.phone}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600">Route</h4>
                <p className="text-sm text-gray-900">{selectedQuote.origin}</p>
                <p className="text-sm text-gray-600">↓</p>
                <p className="text-sm text-gray-900">{selectedQuote.destination}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600">Package</h4>
                <p className="text-sm text-gray-900">
                  {selectedQuote.package.weight} kg •{" "}
                  {selectedQuote.package.dimensions.length}×
                  {selectedQuote.package.dimensions.width}×
                  {selectedQuote.package.dimensions.height} cm
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600">Service</h4>
                <ServiceTypeBadge type={selectedQuote.serviceType} />
              </div>
            </div>

            {/* Response Form */}
            {selectedQuote.status === "PENDING" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Send Response</h4>
                <Input
                  label="Estimated Price (USD)"
                  type="number"
                  step="0.01"
                  {...register("estimatedPrice", { valueAsNumber: true })}
                  error={errors.estimatedPrice?.message}
                  placeholder="0.00"
                />
                <Textarea
                  label="Response Message"
                  {...register("adminResponse")}
                  error={errors.adminResponse?.message}
                  placeholder="Dear customer, thank you for your quote request..."
                  rows={4}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    {...register("sendEmail")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="sendEmail" className="text-sm text-gray-700">
                    Send response via email
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedQuote(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={respondMutation.isPending}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                </div>
              </form>
            ) : (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Admin Response
                </h4>
                <p className="text-sm bg-gray-50 p-4 rounded-lg">
                  {selectedQuote.adminResponse || "No response recorded"}
                </p>
                {selectedQuote.estimatedPrice && (
                  <p className="mt-2 font-medium">
                    Price: {formatCurrency(selectedQuote.estimatedPrice)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
