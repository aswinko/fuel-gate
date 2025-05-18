"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, CheckCircle, Download, Search, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getVerificationLogsById } from "@/app/actions/verification-actions"
import { getCurrentUser } from "@/app/actions/auth-actions"

interface Verification {
  id: string
  registration_number: string
  created_at: string
  status: "approved" | "rejected"
  vehicleMake: string
  model: string
  manufacturing_year: number
}

export default function HistoryClient() {
 const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = await getCurrentUser();

        if (!user || !user.id) {
          setVerifications([]);
          setFilteredVerifications([]);
          setIsLoading(false);
          return;
        }

        const { data, error } = await getVerificationLogsById(user.id as string);

        if (error) throw error;

        // Optional: convert any fields if needed
        const formattedData = data
          ? data.map((v) => ({
              ...v,
              created_at: new Date(v.created_at).toISOString(),
            }))
          : [];

        setVerifications(formattedData);
        setFilteredVerifications(formattedData);
      } catch (error) {
        console.error("Error loading verification history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...verifications];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.registration_number?.toLowerCase().includes(query) ||
          v.vehicleMake?.toLowerCase().includes(query) ||
          v.model?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((v) => v.status === statusFilter);
    }

    setFilteredVerifications(filtered);
  }, [verifications, searchQuery, statusFilter]);

  const exportToCSV = () => {
    const header = [
      "ID",
      "Registration Number",
      "Vehicle Make",
      "Vehicle Model",
      "Manufacturing Year",
      "Status",
      "Timestamp",
    ].join(",");

    const rows = filteredVerifications.map((v) =>
      [
        v.id,
        v.registration_number,
        v.vehicleMake,
        v.model,
        v.manufacturing_year,
        v.status,
        format(new Date(v.created_at), "yyyy-MM-dd HH:mm:ss"),
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `verification-history-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/pump/dashboard"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-2xl font-bold">Verification History</h1>
          <p className="text-gray-500">View and search your past vehicle verifications</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Verification Records</CardTitle>
            <CardDescription>Complete history of vehicle verifications performed by you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search by registration, make or model..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Verification list */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <svg
                    className="animate-spin h-8 w-8 text-purple-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : filteredVerifications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No verification records found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredVerifications.map((verification) => (
                    <div
                      key={verification.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${verification.status === "approved" ? "bg-green-100" : "bg-red-100"}`}
                        >
                          {verification.status === "approved" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{verification.registration_number}</p>
                            <Badge className={verification.status === "approved" ? "bg-green-600" : "bg-red-600"}>
                              {verification.status === "approved" ? "Approved" : "Rejected"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {verification.vehicleMake} {verification.model}, {verification.manufacturing_year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                        <p className="text-sm text-gray-500">
                          {format(new Date(verification.created_at), "MMM d, yyyy • h:mm a")}
                        </p>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
