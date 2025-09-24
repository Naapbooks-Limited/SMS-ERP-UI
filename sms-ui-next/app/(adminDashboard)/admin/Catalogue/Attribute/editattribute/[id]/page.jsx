"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CallFor from "@/utilities/CallFor";
import toast from 'react-hot-toast';

export default function EditAttributePage() {
  const router = useRouter();
  const params = useParams(); // gets dynamic route param
  const [loading, setLoading] = useState(true);

  const [attributeData, setAttributeData] = useState({
    pvamid: null,
    proid: null,
    pvid: null,
    attributeid: null,
    attributeName: '',
    attrtextprompt: null,
    isrequired: false,
    controltype: null,
    displayorder: null,
    pvamvaluemodels: [],
  });

  const fetchAttributeData = async () => {
    try {
      const response = await CallFor(
        `v2/Product/GetAttributeByID?Id=${params.id}`,
        "get",
        null,
        "Auth"
      );
      if (response) {
        setAttributeData(response);
      } else {
        toast.error("Failed to load attribute data.");
      }
    } catch (err) {
      toast.error("Error fetching attribute.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchAttributeData();
  }, [params.id]);

  const handleValueChange = (idx, value) => {
    const updated = [...attributeData.pvamvaluemodels];
    updated[idx].attributeValueName = value;
    setAttributeData({ ...attributeData, pvamvaluemodels: updated });
  };

  const handleAddValue = () => {
    setAttributeData({
      ...attributeData,
      pvamvaluemodels: [
        ...attributeData.pvamvaluemodels,
        {
          pvamvid: null,
          pvamid: attributeData.pvamid,
          avid: null,
          pvamvcolor: null,
          umid: null,
          attributeValueName: "",
          displayorder: null,
        },
      ],
    });
  };

  const handleRemoveValue = (idx) => {
    const filtered = attributeData.pvamvaluemodels.filter((_, i) => i !== idx);
    setAttributeData({ ...attributeData, pvamvaluemodels: filtered });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...attributeData,
        attributeName: attributeData.attributeName,
        pvamvaluemodels: attributeData.pvamvaluemodels.filter(v => v.attributeValueName.trim() !== '')
      };

      const response = await CallFor(
        "/v2/Product/updateattribute",
        "post",
        payload,
        "Auth"
      );

      if (response) {
        toast.success("Attribute updated successfully!");
        router.push("/admin/Catalogue/Category");
      } else {
        toast.error("Update failed.");
      }
    } catch (error) {
      toast.error("Error updating attribute.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <div className="flex justify-end">
        <Link href={"/admin/Catalogue/product/productadd"}>
          <button className="mt-6 me-3 px-3 py-2 bg-[#11357C] text-white rounded-md">
            Cancel
          </button>
        </Link>
        <button
          type="button"
          onClick={handleSave}
          className="mt-6 px-3 py-2 bg-orange-500 text-white rounded-md"
        >
          Update
        </button>
      </div>

      <div className="p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">
          Edit Attribute
        </h2>

        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Attribute Name</label>
          <input
            type="text"
            value={attributeData.attributeName}
            onChange={(e) => setAttributeData({ ...attributeData, attributeName: e.target.value })}
            className="w-3/4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter attribute name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Attribute Values</label>
          {attributeData.pvamvaluemodels.map((val, idx) => (
            <div key={idx} className="flex items-center space-x-2 mt-1">
              <input
                type="text"
                value={val.attributeValueName}
                onChange={(e) => handleValueChange(idx, e.target.value)}
                className="w-3/4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter attribute value"
              />
              {attributeData.pvamvaluemodels.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveValue(idx)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddValue}
            className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
          >
            Add Attribute Value
          </button>
        </div>
      </div>
    </div>
  );
}
