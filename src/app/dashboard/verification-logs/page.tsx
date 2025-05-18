"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, Download, Filter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

// Define the verification log entry type
interface VerificationLog {
  id: string
  pumpName: string
  email: string
  registrationNo: string
  registeredOwner: string
  model: string
  manufacturingYear: number
  createdAt: string
  status: "approved" | "rejected"
  imageUrl: string
}

export default function VerificationLogPage() {
  const [logs, setLogs] = useState<VerificationLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<VerificationLog[]>([])
  const [displayedLogs, setDisplayedLogs] = useState<VerificationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Debug state to help troubleshoot
  const [debugInfo, setDebugInfo] = useState({
    dateFromStr: "",
    dateToStr: "",
    statusFilterStr: "",
    totalRecords: 0,
    filteredRecords: 0,
  })

  // Fetch verification logs
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/verification-logs")
        if (!response.ok) {
          throw new Error("Failed to fetch verification logs")
        }
        const data = await response.json()
        setLogs(data)
        setFilteredLogs(data)
        setTotalPages(Math.ceil(data.length / itemsPerPage))

        // Update debug info
        setDebugInfo((prev) => ({
          ...prev,
          totalRecords: data.length,
        }))
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [itemsPerPage])

  // Apply filters
  useEffect(() => {
    let filtered = [...logs]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.pumpName.toLowerCase().includes(query) ||
          log.email.toLowerCase().includes(query) ||
          log.registrationNo.toLowerCase().includes(query) ||
          log.registeredOwner.toLowerCase().includes(query) ||
          log.model.toLowerCase().includes(query),
      )
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      fromDate.setHours(0, 0, 0, 0)

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.createdAt)
        return logDate >= fromDate
      })

      // Update debug info
      setDebugInfo((prev) => ({
        ...prev,
        dateFromStr: fromDate.toString(),
      }))
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // Set to end of day

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.createdAt)
        return logDate <= toDate
      })

      // Update debug info
      setDebugInfo((prev) => ({
        ...prev,
        dateToStr: toDate.toString(),
      }))
    }

    // Filter by status
    if (statusFilter.length > 0) {
      filtered = filtered.filter((log) => statusFilter.includes(log.status))

      // Update debug info
      setDebugInfo((prev) => ({
        ...prev,
        statusFilterStr: statusFilter.join(", "),
      }))
    }

    // Update filtered logs
    setFilteredLogs(filtered)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change

    // Update debug info
    setDebugInfo((prev) => ({
      ...prev,
      filteredRecords: filtered.length,
    }))
  }, [logs, searchQuery, dateFrom, dateTo, statusFilter, itemsPerPage])

  // Update displayed logs based on pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setDisplayedLogs(filteredLogs.slice(startIndex, endIndex))
  }, [filteredLogs, currentPage, itemsPerPage])

  // Handle date range reset
  const handleResetDateRange = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status)
      } else {
        return [...prev, status]
      }
    })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
  }

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV header
    const header = [
      "No",
      "Pump Name",
      "Email",
      "Registration No",
      "Registered Owner",
      "Model",
      "Manufacturing Year",
      "Status",
      "Created At",
      "Image URL",
    ].join(",")

    // Create CSV rows
    const rows = filteredLogs.map((log, index) => {
      return [
        index + 1,
        log.pumpName,
        log.email,
        log.registrationNo,
        log.registeredOwner,
        log.model,
        log.manufacturingYear,
        log.status,
        format(new Date(log.createdAt), "dd/MM/yyyy HH:mm"),
        log.imageUrl,
      ].join(",")
    })

    // Combine header and rows
    const csv = [header, ...rows].join("\n")

    // Create a blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `verification-log-${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1 p-4 md:p-6">
        <div className="container">
          <div className="flex flex-col gap-4 md:gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Verification Log</h1>
              <p className="text-gray-500">View and filter vehicle verification history</p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Verification Records</CardTitle>
                <CardDescription>Complete history of vehicle verification attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search by registration, pump name..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              (dateFrom || dateTo) && "text-purple-600 border-purple-200",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom && dateTo
                              ? `${format(dateFrom, "dd/MM/yyyy")} - ${format(dateTo, "dd/MM/yyyy")}`
                              : dateFrom
                                ? `From ${format(dateFrom, "dd/MM/yyyy")}`
                                : dateTo
                                  ? `Until ${format(dateTo, "dd/MM/yyyy")}`
                                  : "Date Range"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3 border-b">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Select Date Range</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetDateRange}
                                className="h-auto p-1 text-xs"
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                          <div className="grid gap-4 p-4">
                            <div className="grid gap-2">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium mb-2">From:</span>
                                <Calendar
                                  mode="single"
                                  selected={dateFrom}
                                  onSelect={(date) => {
                                    console.log("Setting dateFrom to:", date)
                                    setDateFrom(date)
                                  }}
                                  initialFocus
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium mb-2">To:</span>
                                <Calendar
                                  mode="single"
                                  selected={dateTo}
                                  onSelect={(date) => {
                                    console.log("Setting dateTo to:", date)
                                    setDateTo(date)
                                  }}
                                  initialFocus
                                />
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("gap-1", statusFilter.length > 0 && "text-purple-600 border-purple-200")}
                          >
                            <Filter className="h-4 w-4" />
                            Status
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuCheckboxItem
                            checked={statusFilter.includes("approved")}
                            onCheckedChange={() => {
                              console.log("Toggling approved status")
                              handleStatusFilterChange("approved")
                            }}
                          >
                            Approved
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={statusFilter.includes("rejected")}
                            onCheckedChange={() => {
                              console.log("Toggling rejected status")
                              handleStatusFilterChange("rejected")
                            }}
                          >
                            Rejected
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button variant="outline" onClick={exportToCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">No</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Pump Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registration No</TableHead>
                          <TableHead>Registered Owner</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Manufacturing Year</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={10} className="h-24 text-center">
                              <div className="flex justify-center items-center h-full">
                                <svg
                                  className="animate-spin h-5 w-5 text-purple-600"
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
                                <span className="ml-2">Loading verification logs...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : displayedLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="h-24 text-center">
                              No verification logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          displayedLogs.map((log, index) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <div className="relative h-12 w-16 rounded-md overflow-hidden cursor-pointer border hover:border-purple-400 transition-colors">
                                      <Image
                                        src={log.imageUrl || "/placeholder.svg"}
                                        alt={`License plate for ${log.registrationNo}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>License Plate Image</DialogTitle>
                                      <DialogDescription>Registration Number: {log.registrationNo}</DialogDescription>
                                    </DialogHeader>
                                    <div className="relative h-[300px] w-full rounded-md overflow-hidden my-4">
                                      <Image
                                        src={log.imageUrl || "/placeholder.svg"}
                                        alt={`License plate for ${log.registrationNo}`}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="text-sm font-medium">Verification Status:</p>
                                        <span
                                          className={cn(
                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            log.status === "approved"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800",
                                          )}
                                        >
                                          {log.status === "approved" ? "Approved" : "Rejected"}
                                        </span>
                                      </div>
                                      <DialogClose asChild>
                                        <Button variant="outline" size="sm">
                                          <X className="h-4 w-4 mr-2" />
                                          Close
                                        </Button>
                                      </DialogClose>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                              <TableCell>{log.pumpName}</TableCell>
                              <TableCell>{log.email}</TableCell>
                              <TableCell className="font-mono">{log.registrationNo}</TableCell>
                              <TableCell>{log.registeredOwner}</TableCell>
                              <TableCell>{log.model}</TableCell>
                              <TableCell>{log.manufacturingYear}</TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                    log.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800",
                                  )}
                                >
                                  {log.status === "approved" ? "Approved" : "Rejected"}
                                </span>
                              </TableCell>
                              <TableCell>{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">
                        Showing {displayedLogs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                        {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                      </p>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Show pages around current page
                          let pageToShow = currentPage - 2 + i

                          // Adjust if we're at the beginning
                          if (currentPage < 3) {
                            pageToShow = i + 1
                          }

                          // Adjust if we're at the end
                          if (currentPage > totalPages - 2) {
                            pageToShow = totalPages - 4 + i
                          }

                          // Make sure page is in valid range
                          if (pageToShow > 0 && pageToShow <= totalPages) {
                            return (
                              <Button
                                key={pageToShow}
                                variant={currentPage === pageToShow ? "default" : "outline"}
                                size="sm"
                                className="w-9 h-9 p-0"
                                onClick={() => handlePageChange(pageToShow)}
                              >
                                {pageToShow}
                              </Button>
                            )
                          }
                          return null
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
