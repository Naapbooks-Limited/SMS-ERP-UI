"use client";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import CallFor from "@/utilities/CallFor";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast as reToast } from "react-hot-toast";
import * as yup from "yup";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// ✅ Enhanced Validation Schema
const schema = yup.object().shape({
  firstName: yup.string().trim().required("First name is required"),
  lastName: yup.string().trim().required("Last name is required"),
  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .required("Email is required")
    .test(
      "has-domain-extension",
      "Email must contain a domain like .com, .org, etc.",
      (value) => (value ? /\.[a-zA-Z]{2,}$/.test(value) : false)
    ),
  employeeId: yup
    .string()
    .trim()
    .required("Employee ID is required")
    .matches(/^[a-zA-Z0-9]+$/, "Employee ID must not contain special characters"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  roleName: yup
    .object()
    .shape({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .required("Role is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

const StaffDetail = ({ params }) => {
  const router = useRouter();
  const [data, setData] = useState({});
  const [role, setRole] = useState({});
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [Activebtn, setActivebtn] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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

        const user = response?.data;
        setData(user);

        setValue("firstName", user.firstname);
        setValue("lastName", user.lastname);
        setValue("email", user.emailid);
        setValue("phone", user.mobno);
        setValue("employeeId", user.employeeId);
        setValue("password", user.password);
        setValue("canLogin", user.canlogin);
        setValue("roleid", user.roleid);

        setActivebtn(user.accountstatus == 48);

        const userRoleId = user.roletypeid;

        const rolesResponse = await CallFor(`v2/users/SaveUser`, "GET", null, "Auth");
        setRoles(rolesResponse.data.dropdowns.roles);

        const matchedRole = rolesResponse.data.dropdowns.roles.find(
          (role) => role.id == userRoleId
        );
        if (matchedRole) {
          setValue("roleName", {
            value: matchedRole.id.toString(),
            label: matchedRole.name,
          });
        }

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

  useEffect(() => {
    const fetchRights = async () => {
      try {
        setLoading(true);
        const res = await CallFor(
          `v2/users/GetRightsByUserId?uid=${params.uid}`,
          "GET",
          null,
          "Auth"
        );
        setRole(res.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (params.uid) {
      fetchRights();
    }
  }, [params.uid]);

  const handleBack = () => {
    router.back();
  };

  const renderRightsCheckboxes = (module) => {
    const allRights = ["Create", "Read", "Update", "Delete", "List"];
    return allRights.map((rightName) => {
      const right = module.rightslist.find((r) => r.rightname === rightName);
      if (right) {
        return (
          <td key={right.rightid} className="justify-center flex items-center">
            <input
              type="checkbox"
              checked={right.selected}
              onChange={() => handleCheckboxChange(module.moduleName, rightName)}
              className="w-[25px] h-[25px]"
            />
          </td>
        );
      }
      return <td key={rightName}></td>;
    });
  };

  const handleCheckboxChange = (moduleName, rightName) => {
    setRole((prev) => {
      const updatedModules = prev.data.modules.map((mod) => {
        if (mod.moduleName === moduleName) {
          const updatedRightslist = mod.rightslist.map((r) =>
            r.rightname === rightName ? { ...r, selected: !r.selected } : r
          );
          return { ...mod, rightslist: updatedRightslist };
        }
        return mod;
      });
      return { ...prev, data: { ...prev.data, modules: updatedModules } };
    });
  };

  const handleAllCheckboxChange = (moduleName) => {
    setRole((prev) => {
      const updatedModules = prev.data.modules.map((mod) => {
        if (mod.moduleName === moduleName) {
          const allSelected = mod.rightslist.every((r) => r.selected);
          const updatedRightslist = mod.rightslist.map((r) => ({
            ...r,
            selected: !allSelected,
          }));
          return { ...mod, rightslist: updatedRightslist };
        }
        return mod;
      });
      return { ...prev, data: { ...prev.data, modules: updatedModules } };
    });
  };

  // Handle select all for entire table
  const handleSelectAllForTable = () => {
    if (!role.data?.modules) return;

    const allSelected = role.data.modules.every(module => 
      module.rightslist.every(right => right.selected)
    );

    setRole((prev) => {
      const updatedModules = prev.data.modules.map((mod) => {
        const updatedRightslist = mod.rightslist.map((r) => ({
          ...r,
          selected: !allSelected,
        }));
        return { ...mod, rightslist: updatedRightslist };
      });
      return { ...prev, data: { ...prev.data, modules: updatedModules } };
    });
  };

  // Check if all rights are selected
  const areAllRightsSelected = () => {
    if (!role.data?.modules) return false;
    return role.data.modules.every(module => 
      module.rightslist.every(right => right.selected)
    );
  };

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const updateData = {
        uid: params.uid,
        fullname: `${formData.firstName} ${formData.lastName}`,
        firstname: formData.firstName,
        lastname: formData.lastName,
        accountstatus: Activebtn ? 48 : 49,
        emailid: formData.email,
        employeeId: formData.employeeId,
        mobno: formData.phone,
        canlogin: true,
        usercode: formData.userCode,
        roleName: "",
        roleid: formData.roleid,
        roletypeid: parseFloat(formData.roleName.value),
        roleModels: data.roleModels,
        password: formData.password,
        rightsofUserModel: role.data,
      };

      const updatedata = await CallFor("v2/users/UpdateUser", "POST", updateData, "Auth");

      setLoading(false);
      if (updatedata) {
        reToast.success("User updated successfully!");
        router.push("/station/station/staff");
      } else {
        reToast.error(`Failed to save employee. Please try again.`);
      }
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="justify-between flex gap-1 pb-3">
        <div className="text-2xl text-orange-400">STAFF</div>
        <Button color="warning" onClick={handleBack}>
          <Undo2 className="mr-2" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 ml-16">
          {[
            ["First Name", "firstName"],
            ["Last Name", "lastName"],
            ["Email ID", "email"],
            ["Phone No", "phone"],
            ["Emp ID", "employeeId"],
          ].map(([label, name]) => (
            <div className="mb-4" key={name}>
              <div className="flex items-center">
                <label className="w-1/6 font-medium mr-2">{label}</label>
                <input
                  className="border border-gray-300 px-4 py-2 rounded w-3/4"
                  {...register(name)}
                />
              </div>
              {errors[name] && (
                <div className="flex items-center">
                  <label className="w-1/6 font-medium mr-2"></label>
                  <p className="text-red-500">{errors[name]?.message}</p>
                </div>
              )}
            </div>
          ))}

          {/* Role */}
          <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Role</label>
              <Controller
                name="roleName"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={roles.map((r) => ({
                      value: r.id.toString(),
                      label: r.name,
                    }))}
                    className="w-3/4 z-5 dark:text-black"
                    placeholder="Select a role"
                    isClearable={true}
                  />
                )}
              />
            </div>
            {errors.roleName && (
              <div className="flex items-center">
                <label className="w-1/6 font-medium mr-2"></label>
                <p className="text-red-500">{errors.roleName.message}</p>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Password</label>
              <input
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                type="password"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <div className="flex items-center">
                <label className="w-1/6 font-medium mr-2"></label>
                <p className="text-red-500">{errors.password.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="flex items-center mb-4 ml-16">
          <Label className="mr-2">Account Status</Label>
          <Switch
            checked={Activebtn}
            onCheckedChange={(checked) => setActivebtn(checked)}
          />
        </div>

        {/* Roles & Rights */}
        <div>
          <div className="flex items-center justify-between my-4">
            <div className="text-2xl text-orange-400">Roles & Rights</div>
            <div className="flex items-center mr-4">
              <Label className="mr-2 font-semibold">Select All:</Label>
              <input
                type="checkbox"
                checked={areAllRightsSelected()}
                onChange={handleSelectAllForTable}
                className="w-[25px] h-[25px]"
              />
            </div>
          </div>
          
          <table className="w-full ml-16">
            <thead>
              <tr className="grid grid-cols-8 mb-2 ">
                <th className="text-left">Module</th>
                <th>All</th>
                <th>Create</th>
                <th>Read</th>
                <th>Update</th>
                <th>Delete</th>
                <th>List</th>
              </tr>
            </thead>
            <tbody>
              {role.data?.modules?.map((module) => (
                <tr className="grid grid-cols-8 mb-2" key={module.moduleName}>
                  <td>{module.moduleName}</td>
                  <td className="justify-center flex items-center">
                    <input
                      type="checkbox"
                      checked={module.rightslist.every((r) => r.selected)}
                      onChange={() => handleAllCheckboxChange(module.moduleName)}
                      className="w-[25px] h-[25px]"
                    />
                  </td>
                  {renderRightsCheckboxes(module)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end m-4">
          <Button color="success" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default StaffDetail;