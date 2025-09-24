"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CallFor from "@/utilities/CallFor";
import GlobalPropperties from "@/utilities/GlobalPropperties";
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
import DeleteDialog from "@/components/DeleteDialog";
import Pagination from "@/components/pagination/Pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function ViewRequest({ params }) {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [data, setData] = useState(null);
  const [pvid, setpvid] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [hoveredImages, setHoveredImages] = useState(null);

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedPvid, setSelectedPvid] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

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


  const fetchvariantData = async () => {
    setLoading(true);
    try {
     

     const filtermodel =  {
        "proid": params.proid,
        "pvname": null,
        "paginationFilter": {
          pageNumber: page,
          pageSize: pageSize,
        }
      }

      const response2 = await CallFor(
        `v2/Product/GetProductVariants`,
        "post",
        filtermodel,
        "Auth"
      );
      setTotalPages(Math.ceil(response2.data.data.totalCount / pageSize));
      setpvid(response2.data.data.data)

      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.proid  ]);


  useEffect(() => {
    fetchvariantData();
  }, [page,pageSize]);


  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };


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

  const handleImageUpload = async (pvid) => {
    try {
      const formData = new FormData();
      
      // Prepare image data
      selectedFiles.forEach((file, index) => {
        formData.append(`productImgModelList[${index}].Umid`, "0");
        formData.append(`productImgModelList[${index}].Umname`, file.name);
        formData.append(`productImgModelList[${index}].Umalttext`, file.name);
        formData.append(`productImgModelList[${index}].Umtype`, "2");
        formData.append(`productImgModelList[${index}].Uid`, "14029");
        formData.append(`productImgModelList[${index}].Umurl`, file);
        formData.append(`productImgModelList[${index}].Umsizes`, "0");
        formData.append(`productImgModelList[${index}].Umbytes`, "0");
      });

      // Upload images first
      const response = await CallFor(
        'v2/Product/SaveMultipleProductImages',
        'POST',
        formData,
        'authWithContentTypeMultipart'
      );

      if (response) {
        // Prepare bulk mapping data
        const bulkMappingData = response.data.data.map(img => ({
          pvumid: 0,
          proid: params.proid,
          pvid: pvid,
          productimgid: img.productimgid
        }));

        // Send bulk mapping request
        await CallFor(
          'v2/Product/SaveBulkProductImageMapping',
          'POST',
          bulkMappingData,
          'Auth'
        );

        setIsImageDialogOpen(false);
        setSelectedFiles([]);
        fetchvariantData(); // Refresh the data
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;
  if (!data) return null;


  

  const {
    proname,
    prodescription,
    prowatermarkUmUrl,
    price,
    catName,
    proisactive,
    skuStatusName
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
            <div className="ps-3">{catName}</div>
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
            <Button className="text-white bg-blue-950 mr-3 " onClick = {()=>router.push(`/station/Catalogue/Requests/editrequest/${params.proid}`)}>
              Edit Request
            </Button>

          {/* <Button className="text-white bg-red-500">Delete Request</Button> */}
        </div>
      </div>



      <div className="text-orange-500 text-xl font-semibold p-2">
          Product Variant 
        </div>


      <table className="min-w-full text-left mt-5">
        <thead>
          <tr>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort("userId")}>
              SR.NO 
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort("id")}>
              PICTURE 
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort("title")}>
              PRODUCTS NAME 
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort("completed")}>
              PRICE 
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort("completed")}>
              STOCK QUANTITY 
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort("completed")}>
              PUBLISHED 
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handleSort("completed")}>
              ACTION 
            </th>
          </tr>
        </thead>
        <tbody>
          {pvid && pvid.map((item) => (
            <tr key={item.pvid}>
              <td className="px-2 py-2">{item.pvid}</td>
              <td className="px-2 py-2">
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <div className="relative group">
                        {item.pvummappings && item.pvummappings.length > 0 && (
                          <div className="relative">
                            <img
                              src={`${GlobalPropperties.viewdocument}${item.pvummappings[0].productimg?.umurl}`}
                              alt={item.pvname}
                              className="w-24 h-24 object-cover rounded-md shadow-md"
                            />
                            {item.pvummappings.length > 1 && (
                              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                <div className="text-white flex items-center">
                                  <Plus className="w-5 h-5" />
                                  <span className="ml-1">{item.pvummappings.length - 1}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    {item.pvummappings && item.pvummappings.length > 1 && (
                      <TooltipContent side="right" className="p-2 bg-white shadow-lg rounded-lg">
                        <div className="grid grid-cols-2 gap-2">
                          {item.pvummappings.slice(1, 6).map((img, index) => (
                            <img
                              key={index}
                              src={`${GlobalPropperties.viewdocument}${img.productimg?.umurl}`}
                              alt={`${item.pvname} ${index + 2}`}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          ))}
                          {item.pvummappings.length > 6 && (
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                              <span className="text-sm text-gray-600">+{item.pvummappings.length - 6}</span>
                            </div>
                          )}
                          <Button
                            className="mt-2 bg-transparent hover:bg-transparent text-black"
                            onClick={() => {
                              setSelectedPvid(item.pvid);
                              setIsImageDialogOpen(true);
                            }}
                          >
                            <Upload size={20} />
                          </Button>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </td>
              <td className="px-2 py-2">{item.pvname}</td>
              <td className="px-2 py-2">{item.pvsalesprice}</td>
              <td className="px-2 py-2 text-center">{item.catName}</td>
              <td className="px-2 py-2 text-center">{item.skuStatusName}</td>
              <td className="px-2 py-2">
                <div className="flex items-center">
                  <Link href={`/station/Catalogue/Products/viewproductvariant/${item.pvid}`}>
                    <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white">
                      <Eye size={20} />
                    </Button>
                  </Link>
                  <Link href={`/station/Catalogue/Products/editproduct/${item.pvid}`}>
                    <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white">
                      <FilePenLine size={20} />
                    </Button>
                  </Link>
                  {/* <Button
                    className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white"
                    onClick={() => {
                      setSelectedPvid(item.pvid);
                      setIsImageDialogOpen(true);
                    }}
                  >
                    <Upload size={20} />
                  </Button> */}
                  <Button
                    className="p-0 bg-transparent hover:bg-transparent text-black dark:text-white"
                    onClick={() => handleDeleteUser(item.pvid)}
                  >
                    <Trash size={20} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>



      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          fetchData();
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`v2/Product/DeleteProductVariant?pvid=${selectedUserId}`}
      />

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              accept="image/*"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsImageDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleImageUpload(selectedPvid)}
                disabled={!selectedFiles.length}
              >
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



    </div>
  );
}

export default ViewRequest;
