"use client"
import Link from 'next/link';
import React, { useState } from 'react';
import CallFor from '@/utilities/CallFor';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';


function Page() {
  const [attributeName, setAttributeName] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [attributeValues, setAttributeValues] = useState([{ avname: '', avdisplayorder: '', avcolor: '' }]);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;
  const orgid = userData.orgid;

  const Router = useRouter()

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
      isspecification: false,
      attributevalues: attributeValues.map((av) => ({
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
      const response = await CallFor('v2/Product/SaveAttribute', "post", payload, "Auth");
      if(response.data){
        toast.success("Attribute Saved")
        Router.back()
      }
      console.log('Attribute saved:', response.data);
    } catch (error) {
      console.error('Error saving attribute:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Add New Attribute</h2>
        <div className="space-x-3">
          <Link href="/warehouse/Catalogue/Products/productadd">
            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
          </Link>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Save
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Attribute Name</label>
            <input
              type="text"
              value={attributeName}
              onChange={(e) => setAttributeName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="required"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="required" className="text-sm font-medium text-gray-700">Is Required</label>
          </div>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-lg font-semibold text-orange-500">Attribute Values</h3>
        {attributeValues.map((value, index) => (
          <div key={index} className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
            <input
              type="text"
              placeholder="Value Name"
              value={value.avname}
              onChange={(e) => handleAttributeValueChange(index, 'avname', e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              type="button"
              onClick={() => removeAttributeValue(index)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addAttributeValue}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          + Add Value
        </button>
      </div>
    </div>
  );
}

export default Page;
