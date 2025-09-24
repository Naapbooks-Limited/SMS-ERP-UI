"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Undo2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DeleteDialog from "@/components/DeleteDialog";
import CallFor from "@/utilities/CallFor";
const StationDetail = ({params}) => {
    const router = useRouter();
    const [stationData, setStationData] = useState(null);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [selectedUserId, setSelectedUserId] = useState(null);

    const fetchData = async () => {
      try {
          const response = await CallFor(`v2/account/GetExternalDealerById?Id=${params.uoid}`, 'GET', null,"Auth");
          setStationData(response.data.data);
      } catch (error) {
          console.error('Error fetching station data:', error);
      }
  };

    useEffect(() => {
        fetchData();
    }, [params.uoid]);

    const handleDeleteUser = (userId) => {
      setSelectedUserId(userId);
      setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
      setIsDeleteDialogOpen(false);
    };

    return (
      <>
        <div className="justify-between flex gap-1 pb-3 ">
          <div className="text-2xl text-orange-400">Station Details</div>
          <Button
            color="warning"
            onClick={() => router.push("/admin/station/list")}
          >
            <Undo2 className="mr-2" />
            Back
          </Button>
        </div>

        <div className="ml-24">
          <div className="flex items-center mb-4">
            <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
              Station Name :
            </label>
            <p className="text-blue-900 dark:text-gray-300 ml-4">
              {stationData?.companyName}
            </p>
          </div>
          <div className="flex items-center mb-4">
            <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
              Station Location :{" "}
            </label>
            <p className="text-blue-900 dark:text-gray-300 ml-4">
              {stationData?.companyAddress.city}
            </p>
          </div>

          <div className="flex items-center mb-4">
            <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
              Station User ID :
            </label>
            <p className="text-blue-900 dark:text-gray-300 ml-4">
              {stationData?.id}
            </p>
          </div>

          <div className="flex items-center mb-4">
            <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
              Warehouse Name :
            </label>
            <p className="text-blue-900 dark:text-gray-300 ml-4">
              {stationData?.companyName}
            </p>
          </div>

          <div className="flex items-center mb-4">
            <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
              {" "}
              Manger Name :
            </label>
            <p className="text-blue-900 dark:text-gray-300 ml-4">
              {stationData?.ownerFirstName} {stationData?.ownerLastName}
            </p>
          </div>
          <div className="flex items-center mb-4">
            <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
              Password :
            </label>
            <p className="text-blue-900 dark:text-gray-300 ml-4">********</p>
          </div>

          <div className="flex items-center mb-4">
            <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
              Confirm Password :
            </label>
            <p className="text-blue-900 dark:text-gray-300 ml-4">********</p>
          </div>

          <div className="flex items-center mb-2">
            <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
              isActive :
            </label>
            <div>{stationData?.status ? "Yes" : "No"}</div>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href={`/admin/station/list/editStation/${stationData?.id}`}>
            <Button className="bg-blue-950 mx-1">Edit Details</Button>
          </Link>

          <Button
            color="destructive"
            className="px-3 ml-2 text-black dark:text-gray-300"
            onClick={() => handleDeleteUser(stationData?.id)}
          >
            Delete
          </Button>
          <DeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            callfor={CallFor}
            onDelete={() => {
              // fetchData(currentPage, searchFields);
              router.back();
              setIsDeleteDialogOpen(false);
            }}
            delUrl={`v2/Organization/DeleteOrganization?id=${selectedUserId}`}
          />
        </div>
      </>
    );
}

export default StationDetail