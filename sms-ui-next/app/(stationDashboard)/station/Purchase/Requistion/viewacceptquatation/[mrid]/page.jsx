"use client";
import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import CallFor from "@/utilities/CallFor";
import DeleteDialog from "@/components/DeleteDialog";
import { useRouter } from "next/navigation";

function viewacceptquatation({ params }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [matchedAttributes, setMatchedAttributes] = useState({});
  const [Status, setStatus] = useState({});

  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch material request details
        const response = await CallFor(`v2/Orders/GetMaterialRequestbyId?mrid=${params.mrid}`, "get", null, "Auth");
        setData(response.data);
        setStatus(response.data.status)

    

        setLoading(false);
      } catch (error) {
        setErrors(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.mrid]);

  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  if (Object.keys(errors).length > 0) {
    return <div>Error: {errors.message || "An error occurred while fetching data."}</div>;
  }

  const calculateTotalPrice = () => {
    if (!data || !data.materialrequestitems) return 0;
    return data.materialrequestitems.reduce((total, item) => {
      return total + (item.avialableitemqty * item.price);
    }, 0);
  };


  // const getAttributes = (proid) => {
  //   const item = data?.materialrequestitems.find(item => item.proid === proid);
  //   if (!item || !item.mridetails) return 'N/A';
  //   return item.mridetails.map(detail => ` ${detail.attributename} : ${detail.attrvalue}`).join(' ');
  // };


  const getAttributes = (mridetails) => {
    if (!mridetails || mridetails.length === 0) return 'N/A';
    return (
      <div className="space-y-1">
        {mridetails.map((detail, index) => (
          <div key={index} className="flex items-center">
            <span className="text-gray-600 font-medium">{detail.attributename || 'Attribute'}</span>
            <span className="mx-1">:</span>
            <span className="text-orange-500">{detail.attrvalue}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          Requisition Details
        </div>
        <Link href="/station/Purchase/Requistion">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 p-3">
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Req. Date</label>
          <label className="">{data?.mrdate}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32">Due Date</label>
          <label>{data?.mrrequireddate}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32">Warehouse</label>
          <label className="">{data?.targetOrgName}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-36">Status</label>
          <label>
         
          {data?.status == 78 ? (
                  <p className="border-2 border-yellow-500 inline-block text-yellow-500 px-2  rounded-full">Pending</p>
                ) : data?.status == 79 ? (
                  <p className="border-2 border-gray-500 inline-block text-gray-500 px-2 rounded-full">Quote Received</p>
                ) : data?.status ==  107? (
                      <p className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">Cannot Fulfill</p>
                ) :data?.status == 80 ? (
                  <p className="border-2 border-green-500 inline-block text-green-500 px-2 rounded-full">PO Created</p>
                ): 
                data?.status == 106 ? (
                          <p className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">Quote Rejected</p>
                ) : (
                  <p className="border-2 border-green-500 inline-block text-green-500 px-2 rounded-full">Unknown</p>
                )}
          
       </label>
        </div>
      </div>

      <div className="mt-8">
  <div className="text-2xl text-orange-400 font-semibold mb-4">Requested Items</div>

  <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-md">
    <table className="w-full text-sm text-center border-collapse">
      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 uppercase">
        <tr>
          <th className="py-3 px-4">Sr No</th>
          <th className="py-3 px-4">Product</th>
          <th className="py-3 px-4">Attributes</th>
          <th className="py-3 px-4">Requested Qty</th>
          {Status !== 78 && <th className="py-3 px-4">Qty to be Sent</th>}
          {Status !== 78 && <th className="py-3 px-4">Price</th>}
          {Status !== 78 && <th className="py-3 px-4">Cost</th>}
        </tr>
      </thead>
      <tbody>
        {data?.materialrequestitems?.map((item, index) => (
          <tr
            key={item.mriid}
            className={`border-t dark:border-gray-700 ${
              index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
            }`}
          >
            <td className="py-2 px-4">{index + 1}</td>
            <td className="py-2 px-4">{item.proName || "N/A"}</td>
            <td className="py-2 px-4 min-w-[200px]">{getAttributes(item.mridetails)}</td>
            <td className="py-2 px-4">{item.itemqty || "N/A"}</td>
            {data?.status !== 78 && <td className="py-2 px-4">{item.avialableitemqty}</td>}
            {data?.status !== 78 && <td className="py-2 px-4">{item.price}</td>}
            {data?.status !== 78 && (
              <td className="py-2 px-4">
                {(item.price * item.avialableitemqty).toFixed(2)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


      <div className="flex justify-end items-center mt-6">
        {/* <div className="space-x-4">
          <Button onClick={() => router.push('/warehouse/sales/quotation')} variant="outline">Cancel</Button>
          <Button onClick={updateQuote} className="bg-orange-400 text-white hover:bg-orange-500">Update Quote</Button>
        </div> */}
          {Status !== 78 &&   <div className="text-right">
          <p className="text-sm font-semibold">Total Price:</p>
          <p className="text-sm text-orange-500 font-bold">{calculateTotalPrice().toFixed(2)}</p>
        </div> }
      </div>

      

      {/* <div className="flex justify-end mt-6">
        {data?.status == 0 ? (
          <Link href={`/station/Purchase/Requistion/Editrequistion/${params.mrid}`}>
            <Button className="text-white bg-blue-950 mr-3">Edit Requisition</Button>
          </Link>
        ) : null}
        <Button className="text-white bg-orange-400" onClick={() => handleDeleteUser(params.mrid)}>Delete Requisition</Button>
      </div> */}

      <div className="flex justify-end ">
        <div className='mt-6'>
       {/* { data?.status == 79  && <Link href={`/warehouse/sales/quotation/createquotation/${params.mrid}`}>
            <Button className="text-white bg-blue-950 mr-3  ">
              Create Quote
            </Button>
          </Link>
        } */}
        </div>

        <div className="flex justify-end mt-6">
        {data?.status == 78 ? (
          <Link href={`/station/Purchase/Requistion/Editrequistion/${params.mrid}`}>
            <Button className="text-white bg-blue-950 mr-3">Edit Requisition</Button>
          </Link>
        ) : null}
      </div>



<div className="flex justify-end mt-6">
        {data?.status == 80 ? (
            <Link href={`/station/Purchase/po/viewpocancle/${data?.orderId}`}>
            <Button className="text-white bg-blue-950 mr-3">View Po</Button>
          </Link>
        ) : null}
        <Button className="text-white bg-orange-400" onClick={() => handleDeleteUser(params.mrid)}>Delete Requisition</Button>
      </div>
          {/* <Button className="text-white bg-orange-400">Reject</Button>  */}
        </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          router.push("/station/Purchase/Requistion")
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`v2/Orders/DeleteMaterialRequest?id=${selectedUserId}`}
      />

    </div>
  );
}

export default viewacceptquatation;
