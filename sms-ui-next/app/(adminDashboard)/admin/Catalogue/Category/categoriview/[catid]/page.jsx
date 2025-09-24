"use client"
import { Button } from '@/components/ui/button'
import { Plus, Undo } from 'lucide-react'

import { Switch } from "@/components/ui/switch";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CallFor from '@/utilities/CallFor';


function categoriview({params}) {

   const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    catid : params.uid,
    catname: '',
    catdesc: '',
    catfullpath :null,
    parentcatid : '',
    // parentCategory: '',
    ispublished: false,
  });


    useEffect(() => {
    const GetcategoryList = async () => {
      setLoading(true);

      try {
        const response = await CallFor(
          `v2/Common/GetCategoryById/${params.catid}`,
          "post",
          null,
          "Auth"
        );
        // setDocTypeList(response.data.data.catid);
        console.log(response.data)
        console.log(response.data.catid);

        setFormData(
          response.data.data)
    // catid : response.catid,
    // catname: response.data.catname,
    // catdesc:  response.data.catdesc,
    // catfullpath :response.data.catfullpath,
    // parentcatid :  response.data.parentcatid,
    // // parentCategory: '',
    // ispublished:  response.data.data.ispublished,
    //     })
        setLoading(false);
      } catch (error) {
        // setError(error.message);
        setLoading(false);
      }
    };

    GetcategoryList();
  }, []);

  return (
    <div>
      <form className="max-w-7xl mx-auto p-6 bg-white dark:bg-black   rounded-md shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="text-orange-500 text-2xl bold">Categories</div>

          <Link href={"/admin/Catalogue/Category"}>
            {" "}
            <Button color="warning" className="shadow-md">
              <Undo size={25} className="pr-1 text-2xl" />
              Back
            </Button>{" "}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4  ">
          <div className="flex items-center space-x-4">
            <label
              htmlFor="productName"
              className="w-1/4 font-medium dark:text-white text-gray-700"
            >
              Name : {formData.catname}{" "}
            </label>
            {/* <input
            type="text"
            id="productName"
            name="productName"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          /> */}
          </div>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="fullDescription"
              className=" font-medium dark:text-white text-gray-700"
            >
              Description : {formData.catdesc}
            </label>
            {/* <textarea
            id="fullDescription"
            name="fullDescription"
            rows="4"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea> */}
          </div>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="sku"
              className="w-1/4 font-medium dark:text-white text-gray-700"
            >
              Parent Category : {formData.parentCategoryName}{" "}
            </label>
            {/* <select  className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" >
            <option>hi</option>
          </select> */}
          </div>
          {/* <div className="flex items-center space-x-4">
          <label htmlFor="categories" className="w-1/4 font-medium dark:text-white  text-gray-700">Categories : </label>
                <div>
                <Switch defaultChecked />
              </div>
        </div> */}
        </div>
        <div className="flex justify-center">
          {/* <Link href={"/station/Catalogue/Categories"}>  <button type="submit" className="mt-6 me-3  px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none ">Cancel</button> </Link>
      <button type="submit" className="mt-6  px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none ">Save</button> */}
        </div>
      </form>
    </div>
  );
}

export default categoriview