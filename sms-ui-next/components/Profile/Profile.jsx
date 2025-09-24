"use client";
import React, { useEffect, useState } from "react";
import {
  User,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Hash,
  Building2,
  KeyRound,
  CheckCircle,
  CircleX,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CallFor from "@/utilities/CallFor";

const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataFromStorage = JSON.parse(sessionStorage.getItem("userData"));
        const uid = userDataFromStorage?.uid;

        if (!uid) {
          console.error("User ID not found in session storage");
          return;
        }

        const response = await CallFor(`v2/users/GetUserById?uid=${uid}`, "GET", null, "Auth");
        if (!response) throw new Error("Failed to fetch user data");

        const data = await response.data;
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const ProfileItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 p-3 rounded-md hover:bg-muted transition">
      <div className="text-orange-500">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-medium text-foreground">{value || "N/A"}</p>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className=" mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
              <User size={42} className="text-orange-500" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{userData?.fullname || "Loading..."}</h2>
              <p className="text-muted-foreground">{userData?.roleTypename || "Role not assigned"}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileItem icon={<KeyRound />} label="User ID" value={userData.uid} />
              <ProfileItem icon={<Hash />} label="Employee ID" value={userData.employeeId} />
              <ProfileItem icon={<Mail />} label="Email" value={userData.emailid} />
              <ProfileItem icon={<Phone />} label="Mobile" value={userData.mobno} />
              <ProfileItem icon={<Briefcase />} label="Role" value={userData.rolename} />
              <ProfileItem icon={<Info />} label="Role Type" value={userData.roleTypename} />
              <ProfileItem icon={<Building2 />} label="Organization" value={userData.orgname} />
              <ProfileItem icon={<MapPin />} label="City" value={userData.city} />
              <ProfileItem icon={<Hash />} label="User Code" value={userData.usercode} />
              <ProfileItem
                icon={
                  userData.accountstatus === 48 ? (
                    <CheckCircle className="text-orange-500" />
                  ) : (
                    <CircleX className="text-orange-500" />
                  )
                }
                label="Account Status"
                value={userData.accountstatus === 48 ? "Active" : "Inactive"}
              />
            </div>
          ) : (
            <LoadingSkeleton />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
