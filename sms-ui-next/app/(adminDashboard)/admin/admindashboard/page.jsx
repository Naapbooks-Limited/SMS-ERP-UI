"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ReportsSnapshot from "./components/reports-snapshot";

import UserDeviceReport from "./components/user-device-report";
import UserStats from "./components/user-stats-chart";
import { Button } from "@/components/ui/button";
import UsersStat from "./components/users-stat";
import ReportsArea from "./components/reports-area";
import DashboardSelect from "@/components/dasboard-select";
import TopTen from "./components/top-ten";
import TopPage from "./components/top-page";

import DatePickerWithRange from "@/components/date-picker-with-range";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800 ">
          Admin Dashboard
        </div>

        <DatePickerWithRange />
      </div>
      {/* reports area */}
      <div className="grid grid-cols-12  gap-6 ">
        <div className="col-span-12 lg:col-span-8">
          <ReportsSnapshot />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <UsersStat />
        </div>
      </div>
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReportsArea />
        </div>
        <Card>
          <CardHeader className="border-none p-6 pt-5 mb-0">
            <CardTitle className="text-lg font-semibold text-default-900 p-0">
              New vs Returning Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserStats />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-none p-6 pt-5 mb-0">
            <CardTitle className="text-lg font-semibold text-default-900 p-0">
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserDeviceReport />
          </CardContent>
        </Card>
      </div> */}
      <div className="col-span-2">
        
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <TopTen />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="border-none pb-0">
              <CardTitle className="pt-2.5">Employee Data</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <TopPage />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
