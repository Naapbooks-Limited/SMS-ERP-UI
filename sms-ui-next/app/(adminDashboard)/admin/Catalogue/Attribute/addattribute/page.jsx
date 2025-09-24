"use client"
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import CallFor from "@/utilities/CallFor";
import { toast as reToast } from "react-hot-toast";
function page() {
  const [attributeName, setAttributeName] = useState('');
  const [attributeValues, setAttributeValues] = useState(['']);
  const router = useRouter();
  // Add new attribute value input
  const handleAddValue = () => {
    setAttributeValues([...attributeValues, '']);
  };

  // Update attribute value
  const handleValueChange = (idx, value) => {
    const newValues = [...attributeValues];
    newValues[idx] = value;
    setAttributeValues(newValues);
  };

  // Remove attribute value input
  const handleRemoveValue = (idx) => {
    setAttributeValues(attributeValues.filter((_, i) => i !== idx));
  };

  // Save handler
  const handleSave = async () => {
    const body = {
      pvamid: 0,
      proid: 0,
      pvid: 0,
      attributeid: 0,
      attributeName: attributeName,
      attrtextprompt: 0,
      isrequired: false,
      controltype: 0,
      displayorder: 0,
      pvamvaluemodels: attributeValues
        .filter((v) => v.trim() != '')
        .map((val) => ({
          pvamvid: 0,
          pvamid: 0,
          avid: 0,
          pvamvcolor: 0,
          umid: 0,
          attributeValueName: val,
          displayorder: 0,
        })),
    };

    try {
      const response = await CallFor(
        `v2/Product/SaveAttribute`,
        "post",
        body,
        "Auth"
      );

      if (response) {
        reToast.success("Categories saved successfully!");
        router.push("/admin/Catalogue/Attribute");
      } else {
        reToast.error("Error saving Categories.");
      }
    } catch (error) {
      reToast.error("An error occurred while saving the attribute.");
    }
    // Optionally, handle response or redirect
  };

  return (
    <div>
      <div className="flex justify-end">
        <Link href={"/admin/Catalogue/product/productadd"}>
          <button
            type="button"
            className="mt-6 me-3  px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none "
          >
            Cancel
          </button>
        </Link>
        <button
          type="button"
          onClick={handleSave}
          className="mt-6  px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none "
        >
          Save
        </button>
      </div>
      <div className="p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">
          Add a new attribute
        </h2>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium ">Attribute Name</label>
          <input
            type="text"
            value={attributeName}
            onChange={(e) => setAttributeName(e.target.value)}
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter attribute name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Attribute Values</label>
          {attributeValues.map((val, idx) => (
            <div key={idx} className="flex items-center space-x-2 mt-1">
              <input
                type="text"
                value={val}
                onChange={(e) => handleValueChange(idx, e.target.value)}
                className="w-3/4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter attribute value"
              />
              {attributeValues.length > 1 && (
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

export default page