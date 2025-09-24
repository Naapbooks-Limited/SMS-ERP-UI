"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Undo } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import CallFor from "@/utilities/CallFor";
import DeleteDialog from "@/components/DeleteDialog";
import { useRouter } from "next/navigation";
import { toast as reToast } from "react-hot-toast";
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

  const handleInputChange = (mriid, field, value) => {
    setData(prevData => ({
      ...prevData,
      materialrequestitems: prevData.materialrequestitems.map(item => 
        item.mriid === mriid ? { ...item, [field]: value } : item
      )
    }));
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

  const deletequote = async () => {
    const response = await CallFor(`v2/Orders/RejectMaterialRequest?id=${params.mrid}`, "post", null, "Auth");
    if (response) {
      reToast.error("Reject Quote")
      router.push('/warehouse/sales/quotation');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (Object.keys(errors).length > 0) {
    return <div>Error: {errors.message || "An error occurred while fetching data."}</div>;
  }

  return (
    <div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          Requisition Details
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
          <label className="font-bold inline-block w-32">Req. Date</label>
          <label className="text-black-500">{data?.mrdate.split("T")[0]}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32">Due Date</label>
          <label>{data?.mrrequireddate.split("T")[0]}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32">Station</label>
          <label className="text-black-500">{data?.sourceOrgName}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-36">Status</label>
          <label>
       
              {data?.status == 78 ? (
                <p className="border-2 border-yellow-500 inline-block text-yellow-500 px-2  rounded-full">Pending</p>
              ) : data?.status == 79 ? (
                <p className="border-2 border-gray-500 inline-block text-gray-500 px-2 rounded-full">QuoteSend</p>
              ) : data?.status == 106 ? (
                <p className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">Quote Rejected</p>
              ) : data?.status == 80 ? (
                <p className="border-2 border-green-500 inline-block text-green-500 px-2 rounded-full">SO Recived</p>
              ) : data?.status == 107 ? (
                <p className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">Cannot Fulfill</p>
              ) : (
                <p className="border-2 border-gray-500 inline-block text-gray-500 px-2 rounded-full">Unknown</p>
              )}
      
          </label>
        </div>
      </div>

      <div>
        <div className="text-2xl  text-black-400 mt-7 pb-3">Requested Items</div>
        <div className="overflow-x-auto pb-3 ">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">Sr.no</th>
                <th className="p-2 text-left">Select Items</th>
                <th className="p-2 text-left min-w-[200px]">Attributes</th>
                <th className="p-2 text-left">Quantity</th>
                {/* <th className="p-2 text-left">Available Qty</th>
                <th className="p-2 text-left">Price</th> */}
              </tr>
            </thead>
            <tbody>
              {data?.materialrequestitems.map((item, index) => (
                <tr key={item.mriid} className="border-b">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{item.proName || 'N/A'}</td>
                  <td className="p-2 min-w-[200px]">{getAttributes(item.mridetails)}</td>
                  <td className="p-2">{item.itemqty || 'N/A'}</td>
                  {/* <td className="p-2">
                    <Input
                      type="number"
                      value={item.avialableitemqty || ''}
                      onChange={(e) => handleInputChange(item.mriid, 'avialableitemqty', e.target.value)}
                      min="0"
                      max={item.itemqty}
                      className="w-full"
                    />
                  </td> */}
                  {/* <td className="p-2">
                    <Input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) => handleInputChange(item.mriid, 'price', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      

      {/* <div className="flex justify-end mt-6">
        {data?.status == 0 ? (
          <Link href={`/station/Purchase/Requistion/Editrequistion/${params.mrid}`}>
            <Button className="text-white bg-blue-950 mr-3">Edit Requisition</Button>
          </Link>
        ) : null}
        <Button className="text-white bg-blatext-black-400" onClick={() => handleDeleteUser(params.mrid)}>Delete Requisition</Button>
      </div> */}

      <div className="flex justify-end">
        <div>
       { data?.status == 78  && <Link href={`/warehouse/sales/quotation/createquotation/${params.mrid}`}>
            <Button className="text-white bg-blue-950 mr-3 ">
              Create Quote
            </Button>
          </Link>
        }
          <Button className="text-white bg-red-500 hover:bg-red-400" onClick={deletequote}>Reject</Button> 

       
        </div>
        </div>

        {/* <div className="flex justify-end">
        <div>
          <Link href="/station/Purchase/po/PurchasedItemUpdates">
            <Button className="text-white bg-[#11375C]">
             View So
            </Button>
          </Link>
        </div>
      </div> */}

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

export default ViewQuotation;
