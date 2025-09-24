"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CallFor from "@/utilities/CallFor";
import DeleteDialog from "@/components/DeleteDialog";

const Viewstation = ({ params }) => {
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
        <div className="text-2xl text-orange-400">Warehouse</div>
        <Button
          color="warning"
          onClick={() => router.push("/warehouse/warehouses/station")}
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
          <p className="text-blue-900 dark:text-gray-200 ml-4"> </p>
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
            Manger Name :
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {" "}
            {stationData?.ownerFirstName}{" "}
          </p>
        </div>

        {/* <div className="flex items-center mb-4">
            <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">Password :</label>
            <p className='text-blue-900 dark:text-gray-200 ml-4'> {stationData?.} ********</p>
        </div>

        <div className="flex items-center mb-4">
            <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">Confirm Password :</label>
            <p className='text-blue-900 dark:text-gray-200 ml-4'> {stationData?.} ********</p>
        </div> */}

        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-950 dark:text-white">
            Active:
          </label>
          <p className="text-blue-900 dark:text-gray-200 ml-4">
            {" "}
            {stationData?.status ? "Yes" : "No"} ********
          </p>
        </div>
      </div>

      <div className="text-center mt-4">
        {/* <Button color="warning">View Warehouse Stations </Button> */}
        <Link href={`/warehouse/warehouses/station/editStation/${stationData?.id}`}>
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

export default Viewstation;