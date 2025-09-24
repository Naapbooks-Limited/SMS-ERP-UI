"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import CallFor from "@/utilities/CallFor";
import { toast as reToast } from "react-hot-toast";
import DeleteDialog from "@/components/DeleteDialog";


function ViewQuotation({ params }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);


  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [matchedAttributes, setMatchedAttributes] = useState({});
  const [selectedItems, setSelectedItems] = useState({});

  const router = useRouter();

  const handleCheckboxChange = (mriid) => {
    setSelectedItems(prevState => ({
      ...prevState,
      [mriid]: !prevState[mriid]
    }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await CallFor(`v2/Orders/GetMaterialRequestbyId?mrid=${params.mrid}`, "get", null, "Auth");

      // if(response.data.status == 79)
      if(response)
      {
        setData(response.data);
      }
      else{
        router.push('/station/Purchase/Requistion');
      }

      // if (response.data && response.data.materialrequestitems) {
      //   const productIds = response.data.materialrequestitems.map(item => item.proid);
      //   const productResponse = await CallFor(`v2/Common/GetSkuDropDownList`, "get", null, "Auth");
      //   const filteredProducts = productResponse.data.filter(item => productIds.includes(item.id));
      //   setProducts(filteredProducts);

      //   const attributesResponses = await Promise.all(productIds.map(id =>
      //     CallFor(`v2/Common/GetAttrValueComboByProId/${id}`, "post", null, "Auth")
      //   ));

      //   const newAttributes = {};
      //   attributesResponses.forEach((attrResponse, index) => {
      //     newAttributes[productIds[index]] = attrresponse?.data?.map(attr => ({
      //       value: attr.id,
      //       label: attr.name,
      //     }));
      //   });
      //   setAttributes(newAttributes);

      //   const newMatchedAttributes = {};
      //   response.data.materialrequestitems.forEach(item => {
      //     newMatchedAttributes[item.mriid] = item.mridetails.map(detail => {
      //       const attributeDetail = newAttributes[item.proid]?.find(attr => attr.value === detail.attrvalue);
      //       return attributeDetail ? attributeDetail.label : detail.attrvalue;
      //     });
      //   });
      //   setMatchedAttributes(newMatchedAttributes);
      // }
      
      setLoading(false);
    } catch (error) {
      setErrors(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    

    fetchData();
  }, [params.mrid]);

  // const deletequote = async () => {
  //   const response = await CallFor(`v2/Orders/RejectMaterialRequest?id=${params.mrid}`, "post", null, "Auth");
  //   if (response) {
  //     reToast.error("Reject Quote")
  //     router.push('/station/Purchase/Requistion');
  //   }
  // };

  const createQuote = async () => {
    const selectedMriids = Object.entries(selectedItems)
      .filter(([_, isSelected]) => isSelected)
      .map(([mriid, _]) => parseInt(mriid));

    if (selectedMriids.length === 0) {
      alert("Please select at least one item to create a quote.");
      return;
    }

    try {
      setLoading(true);
      const requestBody = {
        Ids: selectedMriids
      };

      const response = await CallFor(
        "v2/Orders/ApproveMaterialRequestItem",
        "post",
        requestBody,
        "Auth"
      );

      if (response) {
        reToast.success("Quote created successfully!");
        router.push('/station/Purchase/Requistion');
      } else {
        reToast.error("Failed to create quote. Please try again.");
      }
    } catch (error) {
      console.error("Error creating quote:", error);
      reToast.error("An error occurred while creating the quote.");
    } finally {
      setLoading(false);
    }
  };

  const getAttributes = (proid) => {
    const item = data?.materialrequestitems.find(item => item.proid === proid);
    if (!item || !item.mridetails) return 'N/A';
    return item.mridetails.map((detail, index) => (
      <div key={index} className="flex">
        <li className="">{detail.attributename}:</li>
        <span className="">{detail.attrvalue}</span>
      </div>
    ));
  };


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
        <label className="text-orange-300">{data?.mrdate.split('T')[0]}</label>
      </div>
      <div>
        <label className="font-bold inline-block w-32">Due Date</label>
        <label>{data?.mrrequireddate.split('T')[0]}</label>
      </div>
      <div>
        <label className="font-bold inline-block w-32">Station</label>
        <label className="text-orange-300">00121</label>
      </div>
      <div>
        <label className="font-bold inline-block w-36">Status</label>
        <label>
        {data?.status == 78 ? (
                  <p className="border-2 border-yellow-500 inline-block text-yellow-500 px-2  rounded-full">Pending</p>
                ) : data?.status == 79 ? (
                  <p className="border-2 border-gray-500 inline-block text-gray-500 px-2 rounded-full">Quote Received</p>
                ) : data?.status ==  2? (
                  <p className="border-2 border-red-500 inline-block text-red-500 px-2 rounded-full">Not fulfilled</p>
                ) :data?.status == 80 ? (
                  <p className="border-2 border-green-500 inline-block text-green-500 px-2 rounded-full">PO Created</p>
                ): (
                  <p className="border-2 border-green-500 inline-block text-green-500 px-2 rounded-full">Unknown</p>
                )}
                
        </label>
      </div>
    </div>
    



      <div>
        <div className="text-2xl text-orange-400 mt-7">Requested Items</div>
        <div>
          <table>
            <thead>
              <tr className="grid grid-cols-8 gap-12">
                <th className="py-3 px-6 text-center">#</th>
                <th className="py-3 px-6 text-center">Select Items</th>
                <th className="py-3 px-6 text-center">Attributes</th>
                <th className="py-3 px-6 text-center">Requested Quantity</th>
                <th className="py-3 px-6 text-center">Quoted Quantity</th>
                <th className="py-3 px-6 text-center">Quoted Price</th>
                <th className="py-3 px-6 text-center">Total Price</th>
                <th className="py-3 px-6 text-center">Accept Quote</th>
              </tr>
            </thead>
            <tbody>
              {data?.materialrequestitems.map((item, index) => (
                <tr key={item.mriid} className="grid grid-cols-8 gap-5">
                  <td className="py-3  text-center">{index + 1}</td>
                  <td className="py-3 text-center">
                    {item?.proName || 'N/A'}
                  </td>
                  <td className="py-3  ">
                  {getAttributes(item.proid)}
                  </td>
                  <td className="py-3  text-center">{item.itemqty}</td>
                  <td className="py-3  text-center">{item.avialableitemqty}</td>

                  <td className="py-3 text-center">{item.price}</td>
                  <td className="py-3 text-center">{item.avialableitemqty * item.price}</td>

                  <td className="py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems[item.mriid] || false}
                      onChange={() => handleCheckboxChange(item.mriid)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={() => handleDeleteUser(params.mrid)} className="text-white bg-blue-950 mr-3">Reject</Button>
        <Button onClick={createQuote} className="text-white bg-orange-400">Create PO</Button>
      </div>


      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          fetchData();
          setIsDeleteDialogOpen(false);
          reToast.error("Reject Quote")
          router.push('/station/Purchase/Requistion');
        }}
        delUrl={`v2/Orders/RejectMaterialRequest?id=${selectedUserId}`}
      />

    </div>
  );
}

export default ViewQuotation;