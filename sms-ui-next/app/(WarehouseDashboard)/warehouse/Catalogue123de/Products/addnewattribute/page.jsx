"use client"
import Link from 'next/link';
import React, { useState } from 'react';
import axios from 'axios';
import CallFor from '@/utilities/CallFor';

function Page() {
  const [attributeName, setAttributeName] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [controlType, setControlType] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [attributeValues, setAttributeValues] = useState([{ avname: '', avdisplayorder: '', avcolor: '' }]);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid ;
  const orgid = userData.orgid
  const handleAttributeValueChange = (index, field, value) => {
    const newAttributeValues = [...attributeValues];
    newAttributeValues[index][field] = value;
    setAttributeValues(newAttributeValues);
  };

  const addAttributeValue = () => {
    setAttributeValues([...attributeValues, { avname: '', avdisplayorder: '', avcolor: '' }]);
  };

  const removeAttributeValue = (index) => {
    const newAttributeValues = attributeValues.filter((_, i) => i !== index);
    setAttributeValues(newAttributeValues);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      attributeid: 0,
      attributename: attributeName,
      description: description,
      attributeicon: "skin-concerns",
      attributecolor: "pink",
      uoid: orgid,
      isspecification: true,
      attributevalues: attributeValues.map((av, index) => ({
        avid: 0,
        attributeid: 0,
        avname: av.avname,
        avdisplayorder: av.avdisplayorder,
        uoid: orgid,
        avicon: "skin-concerns",
        avcolor: av.avcolor,
        pvamvaluemodels: null
      }))
    };

    try {
      const response = await CallFor('v2/Product/SaveAttribute',"post",payload,"Auth");
      console.log('Attribute saved:', response.data);
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error('Error saving attribute:', error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <div>
      <div className="flex justify-end">
        <Link href={"/warehouse/Catalogue/Products/productadd"}>
          <button type="button" className="mt-6 me-3 px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none">
            Cancel
          </button>
        </Link>
        <button
          type="submit"
          onClick={handleSubmit}
          className="mt-6 px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none"
        >
          Save
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">
          Add a new attribute
        </h2>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Attribute Name</label>
          <input
            type="text"
            value={attributeName}
            onChange={(e) => setAttributeName(e.target.value)}
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Is Required</label>
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Control type</label>
          <select
            value={controlType}
            onChange={(e) => setControlType(e.target.value)}
            className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">Select a control type</option>
            <option value="1">Type 1</option>
            <option value="2">Type 2</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Display order</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-1/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </form>

      <div className="p-6 rounded-lg shadow-md space-y-4 mt-6">
        <h5 className="text-lg font-bold mb-4 text-orange-500">Attribute Values</h5>
        {attributeValues.map((value, index) => (
          <div key={index} className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Value Name"
              value={value.avname}
              onChange={(e) => handleAttributeValueChange(index, 'avname', e.target.value)}
              className="w-1/3 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
            <input
              type="number"
              placeholder="Display Order"
              value={value.avdisplayorder}
              onChange={(e) => handleAttributeValueChange(index, 'avdisplayorder', e.target.value)}
              className="w-1/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
            <input
              type="text"
              placeholder="Color"
              value={value.avcolor}
              onChange={(e) => handleAttributeValueChange(index, 'avcolor', e.target.value)}
              className="w-1/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              type="button"
              onClick={() => removeAttributeValue(index)}
              className="px-3 py-2 bg-red-500 text-white rounded-md focus:outline-none"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addAttributeValue}
          className="mt-4 px-3 py-2 bg-green-500 text-white rounded-md focus:outline-none"
        >
          Add Attribute Value
        </button>
      </div>
    </div>
  );
}

export default Page;