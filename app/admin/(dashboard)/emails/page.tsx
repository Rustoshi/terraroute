"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyEmails } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  emailsApi,
  shipmentsApi,
  type EmailLogFilters,
  type Shipment,
} from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { sendEmailSchema, type SendEmailFormData } from "@/lib/validations";
import { formatDateTime, truncate } from "@/lib/utils";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "SENT", label: "Sent" },
  { value: "FAILED", label: "Failed" },
];

export default function EmailsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"compose" | "logs">("compose");
  const [filters, setFilters] = React.useState<EmailLogFilters>({
    page: 1,
    limit: 10,
  });
  const [shipmentSearch, setShipmentSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = React.useState<Shipment | null>(null);

  // Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SendEmailFormData>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      to: "",
      subject: "",
      html: "",
      relatedShipmentId: undefined,
    },
  });

  // Fetch email logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: queryKeys.emails.logs(filters),
    queryFn: () => emailsApi.getLogs(filters),
    enabled: activeTab === "logs",
  });

  // Send email mutation
  const sendMutation = useMutation({
    mutationFn: emailsApi.send,
    onSuccess: () => {
      toast.success("Email sent successfully");
      reset();
      setSelectedShipment(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send email");
    },
  });

  // Search shipments for linking
  const searchShipments = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const result = await shipmentsApi.list({ search: query, limit: 5 });
      setSearchResults(result.data);
    } catch {
      setSearchResults([]);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchShipments(shipmentSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [shipmentSearch]);

  const selectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setValue("relatedShipmentId", shipment._id);
    setValue("to", shipment.sender.email);
    setShipmentSearch("");
    setSearchResults([]);
  };

  const onSubmit = (data: SendEmailFormData) => {
    sendMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Emails</h1>
        <p className="text-gray-500 mt-1">Compose and track email communications</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("compose")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "compose"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mail className="h-4 w-4 inline mr-2" />
            Compose
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "logs"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Send className="h-4 w-4 inline mr-2" />
            Email Logs
          </button>
        </nav>
      </div>

      {/* Compose Tab */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Compose Email</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="To"
                    type="email"
                    {...register("to")}
                    error={errors.to?.message}
                    placeholder="recipient@example.com"
                  />
                  <Input
                    label="Subject"
                    {...register("subject")}
                    error={errors.subject?.message}
                    placeholder="Email subject..."
                  />
                  <Textarea
                    label="Content (HTML supported)"
                    {...register("html")}
                    error={errors.html?.message}
                    placeholder="<p>Hello,</p><p>Your shipment update...</p>"
                    rows={10}
                    className="font-mono text-sm"
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset();
                        setSelectedShipment(null);
                      }}
                    >
                      Clear
                    </Button>
                    <Button type="submit" isLoading={sendMutation.isPending}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Link to Shipment */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Link to Shipment</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedShipment ? (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">
                          {selectedShipment.trackingCode}
                        </p>
                        <p className="text-sm text-blue-700">
                          {selectedShipment.sender.name} →{" "}
                          {selectedShipment.receiver.name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedShipment(null);
                          setValue("relatedShipmentId", undefined);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      Optionally link this email to a shipment for tracking.
                    </p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={shipmentSearch}
                        onChange={(e) => setShipmentSearch(e.target.value)}
                        placeholder="Search by tracking code..."
                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                        {searchResults.map((shipment) => (
                          <button
                            key={shipment._id}
                            type="button"
                            onClick={() => selectShipment(shipment)}
                            className="w-full p-3 text-left hover:bg-gray-50"
                          >
                            <p className="font-medium text-sm">
                              {shipment.trackingCode}
                            </p>
                            <p className="text-xs text-gray-500">
                              {shipment.sender.name} → {shipment.receiver.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setValue("subject", "Shipment Update");
                    setValue(
                      "html",
                      "<p>Dear Customer,</p><p>Your shipment status has been updated.</p><p>Best regards,<br>Courier Team</p>"
                    );
                  }}
                >
                  Shipment Update
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setValue("subject", "Delivery Confirmation");
                    setValue(
                      "html",
                      "<p>Dear Customer,</p><p>Your package has been successfully delivered.</p><p>Thank you for choosing Courier!</p>"
                    );
                  }}
                >
                  Delivery Confirmation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setValue("subject", "Quote Response");
                    setValue(
                      "html",
                      "<p>Dear Customer,</p><p>Thank you for your quote request. Please find our pricing below:</p><p>[Details here]</p>"
                    );
                  }}
                >
                  Quote Response
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <Select
              label="Status"
              options={statusOptions}
              value={filters.status || ""}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value as "SENT" | "FAILED" | undefined,
                  page: 1,
                }))
              }
              className="max-w-xs"
            />
          </Card>

          {/* Logs Table */}
          {logsLoading ? (
            <SkeletonTable rows={5} />
          ) : !logsData?.data.length ? (
            <Card>
              <EmptyEmails />
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Related Shipment</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsData.data.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-medium">{log.to}</TableCell>
                      <TableCell>{truncate(log.subject, 40)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={log.status === "SENT" ? "success" : "danger"}
                        >
                          {log.status === "SENT" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.relatedShipmentId ? (
                          <span className="text-blue-600">Linked</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {logsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    Page {logsData.pagination.page} of{" "}
                    {logsData.pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={logsData.pagination.page === 1}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: (prev.page || 1) - 1,
                        }))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        logsData.pagination.page === logsData.pagination.totalPages
                      }
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: (prev.page || 1) + 1,
                        }))
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
