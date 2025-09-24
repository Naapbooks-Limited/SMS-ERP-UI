"use client";
import { Button } from "@/components/ui/button";
import CallFor from "@/utilities/CallFor";
import { Undo2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const customerDetail = () => {
  const router = useRouter();
  const param = useParams();
  const [data, setData] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (param.uid) {
      getCustomerDetail();
    }
  }, []);

  const getCustomerDetail = async () => {
    setLoading(true);
    try {
      const response = await CallFor(
        `v2/users/GetUserById?uid=${param.uid}`,
        "GET",
        null,
        "Auth"
      );

      setData(response.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };
  return (
    <>
      <div className=" justify-between flex gap-1 pb-3 ">
        <div className="text-2xl text-orange-400">Customers</div>
        <Button
          color="warning"
          onClick={() => router.push("/admin/station/customer")}
        >
          <Undo2 className="mr-2" />
          Back
        </Button>
      </div>

      <form className="space-y-4 mt-7">
        <div className="grid grid-cols-2 w-75">
          <div className="flex items-center mb-5">
            <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
              First Name
            </label>
            <p className="text-blue-900 dark:text-white ml-4">
              {" "}
              <span className="font-bold"> : </span> {data.firstname}
            </p>
          </div>
          <div className="flex items-center mb-5">
            <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
              Last Name
            </label>
            <p className="text-blue-900 dark:text-white ml-4">
              {" "}
              <span className="font-bold"> : </span> {data.lastname}
            </p>
          </div>
          <div className="flex items-center mb-5">
            <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
              Phone No
            </label>
            <p className="text-blue-900 dark:text-white ml-4">
              {" "}
              <span className="font-bold"> : </span> {data.mobno}
            </p>
          </div>
          <div className="flex items-center mb-5">
            <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
              Email ID
            </label>
            <p className="text-blue-900 dark:text-white ml-4">
              {" "}
              <span className="font-bold"> : </span> {data.emailid}
            </p>
          </div>
          <div className="flex items-center mb-5">
            <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
              Password
            </label>
            <p className="text-blue-900 dark:text-white ml-4">
              {" "}
              <span className="font-bold"> : </span> {data.password}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="gtin"
              className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white"
            >
              Is Active
            </label>
            <p className="text-blue-900 dark:text-white ml-4">
              {" "}
              <span className="font-bold"> : </span> Yes
            </p>
          </div>
        </div>
        {/* <div className='mt-7'> */}
        {/* </div> */}
      </form>
    </>
  );
};

export default customerDetail;
