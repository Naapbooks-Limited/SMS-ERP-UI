"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CallFor from "@/utilities/CallFor";
import GlobalPropperties from "@/utilities/GlobalPropperties";
import DeleteDialog from "@/components/DeleteDialog";
import {
  Check,
  Download,
  Eye,
  FilePenLine,
  Plus,
  Search as SearchIcon,
  Trash,
  Upload,
} from "lucide-react";
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

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.proid]);



  // useEffect(() => {
  //   const fetchDataGet = async () => {
  //     try {
  //       setLoading(true);
  //       const url = `v2/Product/GetProductVariantByPvId?PvId=${params.proid}`;
  //       const response = await CallFor(url, "get", null, "Auth");
  //       setLoading(false);
  //     } catch (error) {
  //       setError(error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchDataGet()
  // }, []);

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
        <div className="text-orange-500 text-xl font-semibold p-2">
          SKU Request
        </div>
      </div>

      <form className="  p-6  ">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 ">
            <div className="flex  ">
              <label
                htmlFor="productName"
                className=" font-medium dark:text-white text-gray-700"
              >
                Name :
              </label>
              <div className="ps-3">{proname}</div>
            </div>

            <div className="flex items-center space-x-4">
              <label
                htmlFor="gtin"
                className=" font-medium dark:text-white text-gray-700"
              >
                Status :
              </label>
              <div className="ps-3">{skuStatusName || "N/A"}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label
              htmlFor="productName"
              className=" font-medium dark:text-white text-gray-700"
            >
              Images :
            </label>
            <div className="ps-3">
              {prowatermarkUmUrl ? <img
                src={`${GlobalPropperties.viewdocument}${prowatermarkUmUrl}`}
    alt="Product"
    width={100}
    height={100}
    onError={(e) => e.currentTarget.src } // Path to your placeholder image
    className="w-24 h-24 object-cover rounded-md shadow-md"
  /> : "N/A"}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="productName"  
              className=" font-medium dark:text-white text-gray-700"
            >
              Description :
            </label>
            <div className="ps-3">{prodescription}</div>
          </div>

          <div className="flex items-center space-x-4">
            <label
              htmlFor="productName"
              className=" font-medium dark:text-white text-gray-700"
            >
              Category:
            </label>
            <div className="ps-3">{catname}</div>
          </div>

          <div className="flex items-center space-x-4">
            <label
              htmlFor="productName"
              className=" font-medium dark:text-white text-gray-700"
            >
              Price :
            </label>
            <div className="ps-3">{price}</div>
          </div>

          <div className="flex items-center space-x-4">
            <label
              htmlFor="productName"
              className=" font-medium dark:text-white text-gray-700"
            >
              Active :
            </label>
            <div className="ps-3">{proisactive ? "Yes" : "No"}</div>
          </div>
        </div>
      </form>
      <div className="flex justify-end">
        <div>
          <Button className="text-white bg-blue-950 mr-3 " onClick={() => router.push(`/warehouse/Catalogue/Requests/editrequest/${params.proid}`)}>
              Edit Request
            </Button>

          <Button className="text-white bg-red-500" onClick={() => handleDeleteUser(proid)}>Delete Request</Button>
        </div>
      </div>





      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          setIsDeleteDialogOpen(false);
          router.push("/warehouse/Catalogue/Requests")
        }}
        delUrl={`v2/Product/DeleteProduct?ProId=${selectedUserId}`}
      />

    </div>
  );
}

export default ViewRequest;
