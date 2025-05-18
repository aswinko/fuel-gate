"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Camera,
  CheckCircle,
  Clock,
  History,
  Settings,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getVerificationLogsById } from "@/app/actions/verification-actions";
import { getCurrentUser } from "@/app/actions/auth-actions";

export default function PumpDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    today: 0,
    approved: 0,
    rejected: 0,
    // quota: 0,
    // progress: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = await getCurrentUser();
        if (!user || !user.id) {
          setRecentVerifications([]);
          setStats({
            today: 0,
            approved: 0,
            rejected: 0,
            //   quota: 50,
            //   progress: 0,
          });
          setIsLoading(false);
          return;
        }
        const { data, error } = await getVerificationLogsById(
          user.id as string
        );

        if (error) throw error;

        setRecentVerifications(data || []);

        const today = new Date().toISOString().split("T")[0];
        const todayLogs =
          data?.filter((log) => log?.created_at?.startsWith(today)) || [];

        const approvedCount = todayLogs.filter(
          (log) => log.status === "approved"
        ).length;
        const rejectedCount = todayLogs.filter(
          (log) => log.status === "rejected"
        ).length;
        const todayCount = todayLogs.length;
        //   const quota = 50;
        //   const progress = (todayCount / quota) * 100;

        setStats({
          today: todayCount,
          approved: approvedCount,
          rejected: rejectedCount,
          // quota: quota,
          // progress: progress,
        });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Operator</h1>
            <p className="text-gray-500">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>

          <Link href="/pump/verify">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Camera className="mr-2 h-5 w-5" />
              New Verification
            </Button>
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
              {/* <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  Daily quota: {stats.quota}
                </p>
                <Progress value={stats.progress} className="h-1" />
                <p className="text-xs text-gray-500">
                  {stats.progress.toFixed(0)}% of daily target
                </p>
              </div> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <div className="text-2xl font-bold">{stats.approved}</div>
              <CheckCircle className="ml-auto h-8 w-8 text-green-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Rejected Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <XCircle className="ml-auto h-8 w-8 text-red-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Time
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <div className="text-2xl font-bold">8.4s</div>
              <Clock className="ml-auto h-8 w-8 text-gray-400" />
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/pump/verify">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <Camera className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-center">New Verification</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pump/history">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <History className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-center">
                  Verification History
                </h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pump/profile">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-center">My Profile</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pump/settings">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-medium text-center">Settings</h3>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent verifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Verifications</CardTitle>
            <CardDescription>
              Your latest vehicle verification activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
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
            ) : (
              <div className="space-y-4">
                {recentVerifications.map((verification) => (
                  <div
                    key={verification.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          verification.status === "approved"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {verification.status === "approved" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {verification.registration_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {verification.vehicleMake}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          verification.status === "approved"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {verification.status === "approved"
                          ? "Approved"
                          : "Rejected"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(verification.created_at), "h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <Link href="/pump/history">
              <Button variant="outline">View All Verifications</Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
