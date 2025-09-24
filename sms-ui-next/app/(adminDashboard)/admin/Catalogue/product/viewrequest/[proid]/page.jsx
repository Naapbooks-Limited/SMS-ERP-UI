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
      {/* <div className="flex justify-end">
        <div>
            <Button className="text-white bg-blue-950 mr-3 " onClick = {()=>router.push(`/station/Catalogue/Requests/editrequest/${params.proid}`)}>
              Edit Request
            </Button>

        </div>
      </div> */}



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
            <tr key={item.id}>
              <td className="px-2 py-2">{item.pvid}</td>
              <td className="px-2 py-2">
                <img
                  src={`${GlobalPropperties.viewdocument}${item.pvdefaultimgUmUrl}`}
                  alt="Product"
                  width={100}
                  height={100}
                  onError={(e) => e.currentTarget.src}
                  className="w-24 h-24 object-cover rounded-md shadow-md"
                />
              </td>
              <td className="px-2 py-2">{item.pvname}</td>
              <td className="px-2 py-2">{item.pvsalesprice}</td>
              <td className="px-2 py-2 text-center">{item.catName}</td>
              <td className="px-2 py-2 text-center">{item.skuStatusName}</td>
              <td className="px-2 py-2">
                <div>
                  
                  <Link href={`/admin/Catalogue/product/viewproductvariant/${item.pvid}`}>
                    <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black  dark:text-white">
                      <Eye size={20}></Eye>
                    </Button>
                  </Link>
                  {/* <Link href={`/admin/Catalogue/products/editproduct/${item.pvid}`}>
                    <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black  dark:text-white">
                      <FilePenLine size={20}></FilePenLine>
                    </Button>
                  </Link> */}
                  <Button
                    className="p-0 bg-transparent hover:bg-transparent text-black  dark:text-white"
                    onClick={() => handleDeleteUser(item.pvid)}
                  >
                    <Trash size={20}></Trash>
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



    </div>
  );
}

export default ViewRequest;
