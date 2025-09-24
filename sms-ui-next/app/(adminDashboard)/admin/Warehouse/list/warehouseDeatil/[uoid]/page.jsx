"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CallFor from "@/utilities/CallFor";
import DeleteDialog from "@/components/DeleteDialog";

const warehouseDeatil = ({ params }) => {
  const router = useRouter();
  const [stationData, setStationData] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CallFor(`v2/account/GetExternalDealerById?Id=${params.uoid}`, 'GET', null);

        if(response)
        {
          setStationData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching station data:', error);
      }
    };

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
      <div className=" justify-between flex gap-1 pb-3 ">
        <div className="text-2xl text-orange-400">Warehouse Details</div>
        <Button
          color="warning"
          onClick={() => router.push("/admin/Warehouse/list")}
        >
          <Undo2 className="mr-2" />
          Back
        </Button>
      </div>

      <div className="ml-16">
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Warehouse Name :
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {" "}
            {stationData?.companyName}{" "}
          </p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Warehouse Location :
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">{" "}
          {stationData?.companyAddress?.address1} </p>
        </div>

        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Warehouse User ID :
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {" "}
            {stationData?.id}
          </p>
        </div>

        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Manager Name :
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {" "}
            {stationData?.ownerFirstName}{" "}
          </p>
        </div>

        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Email:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {stationData?.companyEmail}
          </p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Mobile:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {stationData?.companyMobile}
          </p>
        </div>

        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Address 1:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {stationData?.companyAddress?.address1}
          </p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Address 2:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {stationData?.companyAddress?.address2}
          </p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            City:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {stationData?.companyAddress?.city}
          </p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            State:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {stationData?.companyAddress?.state}
          </p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Country:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {stationData?.companyAddress?.country}
          </p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Pincode:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {stationData?.companyAddress?.pincode}
          </p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Manager Last Name:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {stationData?.ownerLastName}
          </p>
        </div>
        {/* <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Parent Org ID:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {stationData?.parentorgid}
          </p>
        </div> */}

        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Active:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {" "}
            {stationData?.status ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <div className="text-center mt-4">
       <Link href={`/admin/Warehouse/list/warehousestationDeatil/${stationData?.id}`}>   <Button color="warning">View Warehouse Stations </Button>   </Link>
        <Link href={`/admin/Warehouse/list/editWarehouse/${stationData?.id}`}>
          {" "}
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
};

// const DetailItem = ({ label, value }) => (
//   <div className="flex items-center mb-4">
//     <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
//       {label}:
//     </label>
//     <p className="text-blue-900 dark:text-gray-300 ml-4">{value}</p>
//   </div>
// );

export default warehouseDeatil;