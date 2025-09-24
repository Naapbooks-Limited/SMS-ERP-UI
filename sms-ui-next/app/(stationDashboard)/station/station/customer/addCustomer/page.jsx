"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import CallFor from "@/utilities/CallFor";
import { toast as reToast } from "react-hot-toast";
import * as yup from 'yup';

const AddCustomer = () => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    password: "",
    // isSpecial: false,
  });

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const orgid = userData.orgid;
  const roleids = userData.roleid;


  // Define yup schema for validation
const schema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required("First Name is required")
    .min(2, "First Name must be at least 2 characters")
    .max(50, "First Name cannot exceed 50 characters"),
    
  lastName: yup
    .string()
    .trim()
    .required("Last Name is required")
    .min(2, "Last Name must be at least 2 characters")
    .max(50, "Last Name cannot exceed 50 characters"),
    
  phoneNo: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone No is required"),
    
  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),
    
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password cannot exceed 30 characters")
});

  const payload = {
    uid: 0,
    Firstname: formData.firstName,
    Lastname: formData.lastName,
    fullname: `${formData.firstName} ${formData.lastName}`,
    emailid: formData.email,
    mobno: formData.phoneNo,
    password: formData.password,
    canlogin: true,
    usercode: "",
    image: "",
    profilestatus: 1,
    isapproved: true,
    accountstatus: 1,
    roleName: null,
    roleModels: [
      {
        urmid: 0,
        uid: 0,
        uoid: orgid,
        roleid: 6,
        self: 0,
      },
    ],
  };

  const handleSave = async () => {
    try {
      // Validate form data against schema
      await schema.validate(formData, { abortEarly: false });

      setLoading(true);
      const response = await CallFor(
        `v2/account/SaveCustomer`,
        "post",
        payload,
        "Auth"
      );

      console.log("payload", response);

      setLoading(false);

      

      if (response.data.status == true) { 
        
        reToast.success("Customer saved successfully!");
        router.push("/station/station/customer/");
      } else {
        reToast.error(response.data.message);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing again
    setError(prevErrors => ({
      ...prevErrors,
      [name]: null,
    }));
  };

  return (
    <div className="container mx-auto">
      <div className="text-2xl text-orange-400">Add New Customer</div>

      <form className="space-y-4 mt-7">
        <div className="grid grid-cols-2 w-75">

        <div className="mb-4">
          <div className="flex items-center">
            <label className="w-1/6 font-medium mr-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className= {` border ${error?.firstName ? 'border-red-500':'border-gray-300'} px-4 py-2 rounded w-3/4`}

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
          <div className="flex items-center">
            <label className="w-1/6 font-medium mr-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className= {` border ${error?.lastName ? 'border-red-500':'border-gray-300'} px-4 py-2 rounded w-3/4`}
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
              className= {` border ${error?.phoneNo ? 'border-red-500':'border-gray-300'} px-4 py-2 rounded w-3/4`}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              className= {` border ${error?.email ? 'border-red-500':'border-gray-300'} px-4 py-2 rounded w-3/4`}
              placeholder="Enter email"
            />
            </div>
            {error?.email && (
              <div className="flex items-center">
                  <label className="w-1/6 font-medium mr-2"> </label>
                  <p className="text-red-500">{error.email}</p>
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
              className= {` border ${error?.password ? 'border-red-500':'border-gray-300'} px-4 py-2 rounded w-3/4`}
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
        <Button color="warning" className="m-2" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default AddCustomer;
