"use client";

import { useState, useEffect } from "react";
import { format, subDays, addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@/lib/supabase/server";
import { getVerificationLogs } from "../actions/verification-actions";
import { getAllVehicles } from "../actions/vehicle-actions";

// Define types for our chart data
interface DailyVerificationData {
  date: string;
  approved: number;
  rejected: number;
  total: number;
}

interface VehicleMakeData {
  name: string;
  count: number;
  color: string;
}

interface StatusDistributionData {
  name: string;
  value: number;
  color: string;
}

interface HourlyVerificationData {
  hour: string;
  count: number;
}

export default function DashboardPage() {
  const [dailyData, setDailyData] = useState<DailyVerificationData[]>([]);
  const [vehicleMakeData, setVehicleMakeData] = useState<VehicleMakeData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<
    StatusDistributionData[]
  >([]);
  const [hourlyData, setHourlyData] = useState<HourlyVerificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalVerifications, setTotalVerifications] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [avgVerificationTime, setAvgVerificationTime] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        const { data: logs } = await getVerificationLogs();

        // Group by date (last 30 days)
        const startDate = subDays(new Date(), 29);
        const dailyMap = new Map();

        logs?.forEach((log) => {
          const dateKey = format(new Date(log.created_at), "MMM dd");
          if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, { approved: 0, rejected: 0 });
          }

          const dayData = dailyMap.get(dateKey);
          if (log.status === "approved") dayData.approved++;
          else dayData.rejected++;

          dailyMap.set(dateKey, dayData);
        });

        const dailyData: DailyVerificationData[] = Array.from(
          { length: 30 },
          (_, i) => {
            const date = format(addDays(startDate, i), "MMM dd");
            const { approved = 0, rejected = 0 } = dailyMap.get(date) || {};
            return {
              date,
              approved,
              rejected,
              total: approved + rejected,
            };
          }
        );

        setDailyData(dailyData);

        const totalApproved =
          logs?.filter((log) => log.status === "approved").length ?? 0;
        const totalRejected =
          logs?.filter((log) => log.status !== "approved").length ?? 0;
        const total = totalApproved + totalRejected;

        setTotalVerifications(total);
        setApprovedCount(totalApproved);
        setRejectedCount(totalRejected);

        setAvgVerificationTime(Math.floor(Math.random() * 5) + 5); // optional

        // Vehicle make data (join with vehicles table)
        const { data: vehicles, error: vehicleError } = await getAllVehicles();

        if (vehicleError) throw vehicleError;

        const makeCountMap = new Map();

        logs?.forEach((log) => {
          const vehicle = vehicles?.find((v) => v.id === log.vehicle_id);
          if (!vehicle) return;
          const make = vehicle.make || "Unknown";

          makeCountMap.set(make, (makeCountMap.get(make) || 0) + 1);
        });

        const colors = [
          "#8884d8",
          "#82ca9d",
          "#ffc658",
          "#ff8042",
          "#0088fe",
          "#00C49F",
        ];
        let i = 0;

        const vehicleMakeData = Array.from(makeCountMap.entries()).map(
          ([name, count]) => ({
            name,
            count,
            color: colors[i++ % colors.length],
          })
        );

        setVehicleMakeData(vehicleMakeData);

        // Status Distribution Pie
        const statusDistribution = [
          { name: "Approved", value: totalApproved, color: "#4ade80" },
          { name: "Rejected", value: totalRejected, color: "#f87171" },
        ];
        setStatusDistribution(statusDistribution);

        // Hourly data
        const hourlyMap = new Map();

        logs?.forEach((log) => {
          const hour = format(new Date(log.created_at), "HH:00");
          hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
        });

        const hourlyData: HourlyVerificationData[] = Array.from(
          { length: 24 },
          (_, i) => {
            const hour = i.toString().padStart(2, "0") + ":00";
            return {
              hour,
              count: hourlyMap.get(hour) || 0,
            };
          }
        );

        setHourlyData(hourlyData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Custom tooltip for the line chart
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-green-600">
            Approved: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm text-red-600">
            Rejected: <span className="font-medium">{payload[1].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Total: <span className="font-medium">{payload[2].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">
            Count: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm">
            Percentage:{" "}
            <span className="font-medium">
              {((payload[0].value / totalVerifications) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="container">
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">
              Monitor vehicle verifications and system performance
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Verifications
                </CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalVerifications.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Approved Vehicles
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {approvedCount.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  {((approvedCount / totalVerifications) * 100).toFixed(1)}%
                  approval rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Rejected Vehicles
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rejectedCount.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  {((rejectedCount / totalVerifications) * 100).toFixed(1)}%
                  rejection rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Verification Time
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {avgVerificationTime.toFixed(1)}s
                </div>
                <p className="text-xs text-gray-500">-2.3s from last week</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Verification Trends</CardTitle>
                <CardDescription>
                  Daily verification results over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-purple-600 mr-2"
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
                      <span>Loading chart data...</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dailyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: "#e5e7eb" }}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: "#e5e7eb" }}
                        />
                        <Tooltip content={<CustomLineTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="approved"
                          stroke="#4ade80"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          name="Approved"
                        />
                        <Line
                          type="monotone"
                          dataKey="rejected"
                          stroke="#f87171"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          name="Rejected"
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#a855f7"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          name="Total"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>
                  Distribution of approved vs rejected verifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-purple-600 mr-2"
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
                      <span>Loading chart data...</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
