"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import CallFor from "@/utilities/CallFor";
import { toast as reToast } from "react-hot-toast";
import * as yup from 'yup';

const EditCustomer = ({ params }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    emailID: "",
    password: "",
    // isSpecial: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await CallFor(
          `v2/users/GetUserById?uid=${params.uid}`,
          "GET",
          null,
          "Auth"
        );

        const userData = response.data;
        setFormData({
          firstName: userData.firstname,
          lastName: userData.lastname,
          phoneNo: userData.mobno,
          emailID: userData.emailid,
          password: userData.password, // Since passwords are usually not fetched back for security reasons
          // isSpecial: userData.isSpecial,
        });
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (params.uid) {
      fetchData();
    }
  }, [params.uid]);

  // Define yup schema for validation
  const schema = yup.object().shape({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    phoneNo: yup.string().required('Phone No is required'),
    emailID: yup.string().email('Invalid email format').required('Email ID is required'),
    password: yup.string().required('Password is required'),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    setError(prevErrors => ({
      ...prevErrors,
      [name]: null,
    }));
  };

  const handleSwitchChange = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      isSpecial: !prevFormData.isSpecial,
    }));

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form data against schema
      await schema.validate(formData, { abortEarly: false });

      setLoading(true);

      const response = await CallFor(
        `v2/users/UpdateUser`,
        "POST",
        JSON.stringify({
          uid: params.uid,
          fullname: `${formData.firstName} ${formData.lastName}`,
             Firstname: formData.firstName,
           Lastname: formData.lastName,
          emailid: formData.emailID,
          mobno: formData.phoneNo,
          password:formData.password,
          // canlogin: true,
          // usercode: "",
          // image: "",
          // status: 0,
          // isapproved: true,
          // islogin: 0,
          // roleName: "Customer",
          // roleModels: [],
        }),
        "Auth"
      );

      setLoading(false);

      if (response) {
        reToast.success("Update successful!");
        router.push("/station/station/customer/");
      } else {
        reToast.error("Error updating customer.");
      }

    } catch (error) {
      if (error.name === 'ValidationError') {
        // Yup validation error handling
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setError(validationErrors);
      } else {
        setError(error.message);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto">
        <div className="text-2xl text-orange-400">Edit Customer</div>

        <form className="space-y-4 mt-7" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 w-75">
        <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                placeholder="Enter first name"
              />
              </div>
              {error?.firstName && (
                 <div className="flex items-center">
                  <label className="w-1/6 font-medium mr-2"> </label>
                  <p className="text-red-500">{error.firstName}</p>
                </div>
              
              )}
            </div>
<div className="mb-4">
            <div className="flex items-center ">
              <label className="w-1/6 font-medium mr-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                placeholder="Enter last name"
              />
              </div>
              {error?.lastName && (
                 <div className="flex items-center">
                  <label className="w-1/6 font-medium mr-2"> </label>
                  <p className="text-red-500">{error.lastName}</p>
                </div>
              
              )}
            </div>

            <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Phone No</label>
              <input
                type="text"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                placeholder="Enter phone no"
              />
              </div>
              {error?.phoneNo && (
                 <div className="flex items-center">
                  <label className="w-1/6 font-medium mr-2"> </label>
                  <p className="text-red-500">{error.phoneNo}</p>
                </div>
              
              )}
            </div>
            <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Email ID</label>
              <input
                type="email"
                name="emailID"
                value={formData.emailID}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                placeholder="Enter email ID"
              />
              </div>
              {error?.emailID && (
                 <div className="flex items-center">
                  <label className="w-1/6 font-medium mr-2"> </label>
                  <p className="text-red-500">{error.emailID}</p>
                </div>
              
              )}
            </div>
            <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                placeholder="Enter password"
              />
              </div>
               {error?.password && (
                 <div className="flex items-center">
                  <label className="w-1/6 font-medium mr-2"> </label>
                  <p className="text-red-500">{error.password}</p>
                </div>
              
              )}
            </div>
            {/* <div className="flex items-center space-x-4">
              <label
                htmlFor="isSpecial"
                className="w-1/4 font-medium dark:text-white text-gray-700"
              >
                Is Special
              </label>
              <div>
                <Switch
                defaultChecked
                  // name="isSpecial"
                  // checked={formData.isSpecial}
                  // onChange={handleSwitchChange}
                />
              </div>
            </div> */}
          </div>
        </form>
        <div className="mt-5 text-center">
          <Button
            className="bg-blue-950"
            onClick={() => router.push("/station/station/customer/")}
          >
            Cancel
          </Button>
          <Button
            color="warning"
            className="m-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default EditCustomer;
