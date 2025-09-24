"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast as reToast } from "react-hot-toast";
import CallFor from "@/utilities/CallFor";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  firstname: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  emailid: Yup.string().email("Invalid email").required("Email is required"),
  empId: Yup.string().required("Employee ID is required"),
  mobno: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  password: Yup.string().required("Password is required"),
});

const EditEmployee = () => {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [bodyData, setBodyData] = useState(null);
  const [Activebtn, setActivebtn] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;
  const orgid = userData.orgid;
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    emailid: "",
    empId: "",
    userId: "",
    mobno: "",
    role: "9", // Set default role to Employee
    password: "",
    canLogin: true,
    isApproved: true,
    accountStatus: "Active",
    roleId: 9, // Set default roleId to 9 (Employee)
    roleName: "Employee", // Set default roleName to Employee
    roleModels: [
      {
        Urmid: 0,
        Uid: Uid,
        Uoid: sessionStorage.getItem("userData")
          ? JSON.parse(sessionStorage.getItem("userData")).orgid
          : null,
        Roleid: 9, // Set default Roleid to 9 (Employee)
        roletypeid: 9, // Set default roletypeid to 9 (Employee)
        Self: null,
      },
    ],
    rightsOfUserModel: {
      modules: []
    },
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // First get the initial data structure
        const response = await CallFor(`v2/users/SaveUser`, "GET", null, "Auth");
        setBodyData(response?.data);
        
        // Then get the employee details
        // Note: You'll need to implement the actual endpoint and data fetching here
        // const employeeResponse = await CallFor(`v2/users/${employeeId}`, "GET", null, "Auth");
        // const employeeData = employeeResponse?.data;
        
        setFormData(prevFormData => ({
          ...prevFormData,
          rightsOfUserModel: response?.data?.model?.rightsofUserModel,
          // Add other employee data here when API is available
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
        reToast.error("Error fetching data");
      }
    };
    fetchEmployeeData();
  }, []);

  const renderRightsCheckboxes = (module) => {
    const allPossibleRights = ['Create', 'Read', 'Update', 'Delete', 'List'];
    return allPossibleRights.map((right) => {
      const rightObj = module.rightslist.find(r => r.rightname === right);
      if (rightObj) {
        return (
          <td key={right} className="justify-center flex items-center">
            <input
              type="checkbox"
              name={`${module.moduleName}-${right}`}
              checked={rightObj.selected}
              onChange={handleChange}
              className="w-[25px] h-[25px]"
            />
          </td>
        );
      } else {
        return <td key={right} className="justify-center flex items-center">-</td>; // Show dash for unavailable rights
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const [moduleName, rightName] = name.split("-");

      if (rightName === "All") {
        // Handle "All" checkbox
        setFormData((prevFormData) => {
          const updatedModules = prevFormData.rightsOfUserModel.modules.map(
            (module) => {
              if (module.moduleName === moduleName) {
                const updatedRightsList = module.rightslist.map((right) => ({
                  ...right,
                  selected: checked,
                }));
                return { ...module, rightslist: updatedRightsList };
              }
              return module;
            }
          );
          return {
            ...prevFormData,
            rightsOfUserModel: {
              ...prevFormData.rightsOfUserModel,
              modules: updatedModules,
            },
          };
        });
      } else {
        // Handle individual right checkbox
        setFormData((prevFormData) => {
          const updatedModules = prevFormData.rightsOfUserModel.modules.map(
            (module) => {
              if (module.moduleName === moduleName) {
                const updatedRightsList = module.rightslist.map((right) => {
                  if (right.rightname === rightName) {
                    return { ...right, selected: checked };
                  }
                  return right;
                });
                return { ...module, rightslist: updatedRightsList };
              }
              return module;
            }
          );
          return {
            ...prevFormData,
            rightsOfUserModel: {
              ...prevFormData.rightsOfUserModel,
              modules: updatedModules,
            },
          };
        });
      }
    } else if (name === "canLogin" || name === "isApproved") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: checked,
      }));
    } else if (name === "accountStatus") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        accountStatus: value,
      }));
    } else if (name === "mobno") {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: numericValue,
        }));
      }
      if (value.length > 10) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "Phone number must be exactly 10 digits",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "",
        }));
      }
    } else if (name == "firstname" || name == "lastName") {
      const cleanValue = value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: cleanValue,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    // Reset field-level error if not handling phone separately
    if (name !== "mobno") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setFormData((prevFormData) => {
      const updatedModules = prevFormData.rightsOfUserModel.modules.map((module) => ({
        ...module,
        rightslist: module.rightslist.map((right) => ({
          ...right,
          selected: !selectAll
        }))
      }));
      return {
        ...prevFormData,
        rightsOfUserModel: {
          ...prevFormData.rightsOfUserModel,
          modules: updatedModules
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await validationSchema.validate(formData, { abortEarly: false });

      const bodydata = JSON.stringify({
        uid: 0, // Replace with actual employee ID when editing
        fullname: formData.firstname + " " + formData.lastName,
        firstname: formData.firstname,
        lastname: formData.lastName,
        emailid: formData.emailid,
        mobno: formData.mobno,
        employeeid: formData.empId,
        canlogin: true,
        password: formData.password,
        usercode: formData.userId,
        image: "",
        profilestatus: 1,
        isapproved: formData.isApproved,
        accountstatus: Activebtn ? 48 : 49, // 48 for Active, 49 for Inactive
        roleid: formData.roleId,
        roleName: formData.roleName,
        roleModels: formData.roleModels,
        rightsofUserModel: formData.rightsOfUserModel,
      });

      const response = await CallFor(
        `v2/users/SaveUser`,
        "POST",
        bodydata,
        "Auth"
      );

      if (response.data.status == true) {
        reToast.success("Employee updated successfully!");
        router.push("/admin/Employee");
      } else {
        reToast.error(`Failed to update employee. Please try again. ${response.data.message}`);
      }
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const newErrors = {};
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="container mx-auto">
      <div className="text-2xl text-orange-400 mb-4">Edit Employee</div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          {/* First column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstname">First Name</Label>
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="Enter your first name"
                className={`${errors?.firstname ? 'border-red-500' : 'dark:text-white'}`}
              />
              {errors.firstname && <p className="text-red-500">{errors.firstname}</p>}
            </div>

            <div>
              <Label htmlFor="emailid">Email</Label>
              <Input
                id="emailid"
                name="emailid"
                value={formData.emailid}
                onChange={handleChange}
                className={`${errors?.emailid ? 'border-red-500' : 'dark:text-white'}`}
                placeholder="Enter your email"
              />
              {errors.emailid && <p className="text-red-500">{errors.emailid}</p>}
            </div>

            <div>
              <Label htmlFor="empId">Emp ID</Label>
              <Input
                id="empId"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                className={`${errors?.empId ? 'border-red-500' : 'dark:text-white'}`}
                placeholder="Enter Employee ID"
              />
              {errors.empId && <p className="text-red-500">{errors.empId}</p>}
            </div>
          </div>

          {/* Second column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                className={`${errors?.lastName ? 'border-red-500' : 'dark:text-white'}`}
              />
              {errors.lastName && <p className="text-red-500">{errors.lastName}</p>}
            </div>

            <div>
              <Label htmlFor="mobno">Phone No</Label>
              <Input
                id="mobno"
                name="mobno"
                value={formData.mobno}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className={`${errors?.mobno ? 'border-red-500' : 'dark:text-white'}`}
              />
              {errors.mobno && <p className="text-red-500">{errors.mobno}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="text"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={`${errors?.password ? 'border-red-500' : 'dark:text-white'}`}
              />
              {errors.password && <p className="text-red-500">{errors.password}</p>}
            </div>
          </div>
        </div>

        <div className='pt-3'>
          <Label className="mr-2">Account Status</Label>
          <Switch
            checked={Activebtn}
            onCheckedChange={(checked) => setActivebtn(checked)}
          />
        </div>

        <div className="text-2xl text-orange-400 mt-3">Roles & Rights</div>
        <div className="mb-4">
          <Button
            type="button"
            onClick={handleSelectAll}
            className={`${
              selectAll ? 'bg-red-500' : 'bg-green-500'
            } text-white px-4 py-2 rounded`}
          >
            {selectAll ? 'Deselect All Rights' : 'Select All Rights'}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="grid grid-cols-7 gap-4 mb-2">
                <th className="text-left">Module</th>
                <th className="text-center">All</th>
                <th className="text-center">Create</th>
                <th className="text-center">Read</th>
                <th className="text-center">Update</th>
                <th className="text-center">Delete</th>
                <th className="text-center">List</th>
              </tr>
            </thead>
            <tbody>
              {formData?.rightsOfUserModel && formData?.rightsOfUserModel?.modules?.map(
                (module, moduleIndex) => (
                  <tr
                    className="grid grid-cols-7 mb-2 gap-4"
                    key={moduleIndex}
                  >
                    <td className="font-medium">{module.moduleName}</td>
                    <td className="justify-center flex items-center">
                      <input
                        type="checkbox"
                        name={`${module.moduleName}-All`}
                        checked={module.rightslist.every(
                          (right) => right.selected
                        )}
                        onChange={handleChange}
                        className="w-[25px] h-[25px]"
                      />
                    </td>
                    {renderRightsCheckboxes(module)}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <Link href="/admin/Employee">
            <Button className="bg-blue-950 text-white mr-2">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-orange-400 text-white">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;