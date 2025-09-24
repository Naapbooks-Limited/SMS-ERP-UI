"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CallFor from "@/utilities/CallFor";
import GlobalPropperties from "@/utilities/GlobalPropperties";
import DeleteDialog from "@/components/DeleteDialog";
import { Undo } from "lucide-react";

function ViewRequest({ params }) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await CallFor(
          `v2/Product/GetProductByID?Proid=${params.proid}`,
          "GET",
          null,
          "Auth"
        );
        setData(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.proid]);

  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const {
    proname,
    prodescription,
    prowatermarkUmUrl,
    price,
    catname,
    proisactive,
    skuStatusName,
    proid
  } = data.data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">SKU Request</div>
        <Link href="/station/Catalogue/Requests">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="flex">
            <label className="font-medium dark:text-white text-gray-700">Name:</label>
            <span className="ps-3">{proname}</span>
          </div>
          <div className="flex">
            <label className="font-medium dark:text-white text-gray-700">Status:</label>
            <span className="ps-3">{skuStatusName || "N/A"}</span>
          </div>
          <div className="flex">
            <label className="font-medium dark:text-white text-gray-700">Images:</label>
            <span className="ps-3">
              {prowatermarkUmUrl ? (
                <img
                  src={`${GlobalPropperties.viewdocument}${prowatermarkUmUrl}`}
                  alt="Product"
                  width={100}
                  height={100}
                  onError={(e) => (e.currentTarget.src = "/path/to/placeholder.jpg")} // Path to your placeholder image
                  className="w-24 h-24 object-cover rounded-md shadow-md"
                />
              ) : "N/A"}
            </span>
          </div>
          <div className="flex">
            <label className="font-medium dark:text-white text-gray-700">Description:</label>
            <span className="ps-3">{prodescription}</span>
          </div>
          <div className="flex">
            <label className="font-medium dark:text-white text-gray-700">Category:</label>
            <span className="ps-3">{catname}</span>
          </div>
          <div className="flex">
            <label className="font-medium dark:text-white text-gray-700">Price:</label>
            <span className="ps-3">{price}</span>
          </div>
          <div className="flex">
            <label className="font-medium dark:text-white text-gray-700">Active:</label>
            <span className="ps-3">{proisactive ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          className="text-white bg-blue-950"
          onClick={() => router.push(`/station/Catalogue/Requests/editrequest/${params.proid}`)}
        >
          Edit Request
        </Button>
        <Button
          className="text-white bg-red-500"
          onClick={() => handleDeleteUser(proid)}
        >
          Delete Request
        </Button>
      </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          setIsDeleteDialogOpen(false);
          router.push("/station/Catalogue/Requests");
        }}
        delUrl={`v2/Product/DeleteProduct?ProId=${selectedUserId}`}
      />
    </div>
  );
}

export default ViewRequest;
