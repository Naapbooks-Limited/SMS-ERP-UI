"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Undo } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import CallFor from "@/utilities/CallFor";
import DeleteDialog from "@/components/DeleteDialog";
import { useRouter } from "next/navigation";

function ViewQuotation({ params }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [matchedAttributes, setMatchedAttributes] = useState({});
  const router = useRouter();

  const handleInputChange = (mriid, field, value) => {
    setData(prevData => ({
      ...prevData,
      materialrequestitems: prevData.materialrequestitems.map(item => {
        if (item.mriid === mriid) {
          return {
            ...item,
            [field]: value
          };
        }
        return item;
      })
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch material request details
        const response = await CallFor(`v2/Orders/GetMaterialRequestbyId?mrid=${params.mrid}`, "get", null, "Auth");
        setData(response.data);

    

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
          Quotation Details
        </div>
        <Link href="/warehouse/sales/quotation">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 p-3">
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Req.</label>
          <label className="text-orange-500">{params.mrid}</label>
        </div>
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Req. Date</label>
          <label className="text-orange-500">
            {data?.mrdate.split("T")[0]}
          </label>
        </div>

        <div>
          <label className="font-bold inline-block w-32">Due Date</label>
          <label className="text-orange-500">
            {data?.mrrequireddate.split("T")[0]}
          </label>
        </div>
        <div>
          <label className="font-bold inline-block w-32">Station</label>
          <label className="text-orange-500">00121</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32 pt-3">Status</label>
          <label>
            {data?.status == 78 ? (
              <p className="border-2 border-yellow-500 inline-block text-yellow-500 px-2  rounded-full">
                Pending
              </p>
            ) : data?.status == 79 ? (
              <p className="border-2 border-gray-500 inline-block text-gray-500 px-2 rounded-full">
                QuoteSent
              </p>
            ) : data?.status == 106 ? (
              <p className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">
                Quote Rejected
              </p>
            ) : data?.status == 80 ? (
              <p className="border-2 border-green-500 inline-block text-green-500 px-2 rounded-full">
                SO Received
              </p>
            ) : data?.status == 107 ? (
              <p className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">
                Cannot Fulfill
              </p>
            ) : (
              <p className="border-2 border-gray-500 inline-block text-gray-500 px-2 rounded-full">
                Unknown
              </p>
            )}
          </label>
        </div>
      </div>

      <div>
        <div className="text-2xl text-orange-400 mt-7">Requested Items</div>
        <div>
          <table className="border-b border-black dark:border-white w-full">
            <thead>
              <tr>
                <th className="py-3 px-6 text-center">Sr NO</th>
                <th className="py-3 px-6 text-center">Product</th>
                <th className="py-3 px-6 text-center">Attributes</th>
                <th className="py-3 px-6 text-center">Requested Quantity</th>
                <th className="py-3 px-6 text-center">Quantity to be Sent</th>
                <th className="py-3 px-6 text-center">Price</th>
                <th className="py-3 px-6 text-center">Cost</th>
              </tr>
            </thead>
            <tbody>
              {data?.materialrequestitems.map((item, index) => (
                <tr key={item.mriid} className="border-b">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{item.proName || 'N/A'}</td>
                  <td className="p-2 min-w-[200px]">{getAttributes(item.mridetails)}</td>
                  <td className="p-2">{item.itemqty || 'N/A'}</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={item.avialableitemqty || ''}
                      onChange={(e) => handleInputChange(item.mriid, 'avialableitemqty', e.target.value)}
                      min="0"
                      max={item.itemqty}
                      className="w-full disabled:text-black"
                    disabled={data?.status != 78 }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) => handleInputChange(item.mriid, 'price', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full disabled:text-black"
                    disabled={data?.status != 78 }

                    />
                  </td>
                  <td className="p-2">{item.price * item.avialableitemqty}</td>
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
        <div className="text-right">
          <p className="text-sm font-semibold">Total Price:</p>
          <p className="text-sm text-orange-500 font-bold">
            {calculateTotalPrice().toFixed(2)}
          </p>
        </div>
      </div>

      {/* <div className="flex justify-end mt-6">
        {data?.status == 0 ? (
          <Link href={`/station/Purchase/Requistion/Editrequistion/${params.mrid}`}>
            <Button className="text-white bg-blue-950 mr-3">Edit Requisition</Button>
          </Link>
        ) : null}
        <Button className="text-white bg-orange-400" onClick={() => handleDeleteUser(params.mrid)}>Delete Requisition</Button>
      </div> */}

      <div className="flex justify-end mt-3">
        <div>
          {data?.status == 78 && (
            <Link
              href={`/warehouse/sales/quotation/createquotation/${params.mrid}`}
            >
              <Button className="text-white bg-blue-950 mr-3 ">
                Create Quote
              </Button>
            </Link>
          )}
          {/* <Button className="text-white bg-orange-400">Reject</Button>  */}

          {data?.status == 80 && (
            <Link href={`/warehouse/sales/so/viewso/${data?.orderId}`}>
              <Button className="text-white bg-[#11375C]">View So</Button>
            </Link>
          )}
        </div>
      </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          router.push("/station/Purchase/Requistion");
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`v2/Orders/DeleteMaterialRequest?id=${selectedUserId}`}
      />
    </div>
  );
}

export default ViewQuotation;
