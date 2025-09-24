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

const StaffDetail = ({ params }) => {
  const router = useRouter();
  const [data, setData] = useState({});
  const [role, setRole] = useState({});
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [Activebtn, setActivebtn] = useState(false);
  const [selectAllRights, setSelectAllRights] = useState(false);


  const schema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup
        .string()
        .matches(/^\d+$/, "Phone number must contain only digits")
        .length(10, "Phone number must be 10 digits")
        .required("Phone number is required"),
    password: yup.string().required("password is required"),
  });

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const roleId = userData.roleid;
  const orgid = userData.orgid;

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
        // Fetch user data
        const response = await CallFor(
          `v2/users/GetUserById?uid=${params.uid}`,
          "GET",
          null,
          "Auth"
        );

        setData(response.data);
        setValue("firstName", response.data.firstname);
        setValue("lastName", response.data.lastname);
        setValue("email", response.data.emailid);
        setValue("phone", response.data.mobno);
        setValue("employeeId", response.data.employeeId);
        setValue("password", response.data.password);
        setValue("canLogin", response.data.canlogin);

        const accountstatuss = response.data.accountstatus == 48 ? true : false
        setActivebtn(accountstatuss)

        // Store the roleid from the response
        const userRoleId = response.data.roletypeid;
        console.log(response.data.roletypeid);
        

        // Fetch roles based on org ID
        const rolesResponse = await CallFor(
          `v2/users/SaveUser`,
          "GET",
          null,
          "Auth"
        );

        // Set roles state
        setRoles(rolesResponse.data.dropdowns.roles);
        // setRole(response.data.roletypeid)

        // Find the user's role in the fetched roles list
        const userRole = rolesResponse.data.dropdowns.roles.find(role => role.id == userRoleId);
        console.log(userRole,"role")
        if (userRole) {
          setValue("roleName", { value: userRole.id.toString(), label: userRole.name });
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
  }, [params.uid, setValue, orgid]);



  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     try {
  //       const response = await CallFor(`v2/Common/GetRolesByOrgId?uoid=${orgid}`, "GET", null, "Auth");
  //       setRoles(response.data);
  //     } catch (error) {
  //       console.error("Error fetching roles:", error);
  //       reToast.error("Error fetching roles");
  //     }
  //   };

   
  //     fetchRoles();
  
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await CallFor(
          `v2/users/GetRightsByUserId?uid=${params.uid}`,
          "GET",
          null,
          "Auth"
        );

        setRole(response.data);
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

  const handleBack = () => {
    router.back();
  };

  const handleSelectAllRights = () => {
    setSelectAllRights(!selectAllRights);
    setRole(prevRole => {
      const updatedModules = prevRole.data.modules.map(module => ({
        ...module,
        rightslist: module.rightslist.map(right => ({
          ...right,
          selected: !selectAllRights
        }))
      }));
      return { ...prevRole, data: { ...prevRole.data, modules: updatedModules } };
    });
  };

  const renderRightsCheckboxes = (module) => {
    // Get unique rights from all modules to create columns
    const allRights = Array.from(new Set(
      role.data.modules.flatMap(m => m.rightslist.map(r => r.rightname))
    )).sort();

    return allRights.map((rightName) => {
      const right = module.rightslist.find(r => r.rightname === rightName);
      return (
        <td key={rightName} className="justify-center flex items-center">
          <input
            type="checkbox"
            checked={right ? right.selected : false}
            onChange={() => handleCheckboxChange(module.moduleName, rightName)}
            className="w-[25px] h-[25px]"
            disabled={!right}
          />
        </td>
      );
    });
  };

  const handleCheckboxChange = (moduleName, rightName) => {
    setRole(prevRole => {
      const updatedModules = prevRole.data.modules.map(module => {
        if (module.moduleName === moduleName) {
          const updatedRightslist = module.rightslist.map(right => {
            if (right.rightname === rightName) {
              return { ...right, selected: !right.selected };
            }
            return right;
          });
          return { ...module, rightslist: updatedRightslist };
        }
        return module;
      });
      return { ...prevRole, data: { ...prevRole.data, modules: updatedModules } };
    });
  };

  const handleAllCheckboxChange = (moduleName) => {
    setRole(prevRole => {
      const updatedModules = prevRole.data.modules.map(module => {
        if (module.moduleName === moduleName) {
          const allSelected = module.rightslist.every(right => right.selected);
          const updatedRightslist = module.rightslist.map(right => ({
            ...right,
            selected: !allSelected
          }));
          return { ...module, rightslist: updatedRightslist };
        }
        return module;
      });
      return { ...prevRole, data: { ...prevRole.data, modules: updatedModules } };
    });
  };
   const onSubmit = async (formData) => {
     setLoading(true);
     try {
      //  let roleId;
      let roleName = formData.roleName.value;

      //  if (roleName === "Warehouse") {
      //    roleId = 4;
      //  } else if (roleName === "Station") {
      //    roleId = 5;
      //  } else if (roleName === "Admin") {
      //    roleId = 1;
      //  }

       const updateData = {
         uid: params.uid,
         fullname: `${formData.firstName} ${formData.lastName}`,
         firstname: formData.firstName,
         lastname: formData.lastName,
         accountstatus:Activebtn ? 48 : 49,
         emailid: formData.email,
         employeeId: formData.employeeId,
         mobno: formData.phone,
         canlogin: true,
         usercode: formData.userCode,
         roleName:"",
         roleId : parseFloat(roleName),
         roletypeid
:  parseFloat(roleName),

         roleModels: data.roleModels,
         password: formData.password,
         rightsofUserModel: role.data,
       };

      const updatedata =  await CallFor("v2/users/UpdateUser", "POST", updateData, "Auth");

       setLoading(false);
       router.back();
        if (updatedata) {
          reToast.success("User Update successfully!");
          router.push("/warehouse/warehouses/staff");
        } else {
          reToast.error("Error Update user.");
        }
     } catch (error) {
       setError(error);
       setLoading(false);
     }
   };


   console.log(Activebtn,"active")

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
          <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">First Name</label>
              <input
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                {...register("firstName")}
              />
            </div>
            {errors.firstName && (
              <div className="flex items-center">
                <label className="w-1/6 font-medium mr-2"></label>
                <p className="text-red-500">{errors.firstName.message}</p>
              </div>
            )}
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Last Name</label>
              <input
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                {...register("lastName")}
              />
            </div>
            {errors.lastName && (
              <div className="flex items-center">
                <label className="w-1/6 font-medium mr-2"></label>
                <p className="text-red-500">{errors.lastName.message}</p>
              </div>
            )}
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Email ID</label>
              <input
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <div className="flex items-center">
                <label className="w-1/6 font-medium mr-2"></label>
                <p className="text-red-500">{errors.email.message}</p>
              </div>
            )}
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Phone No</label>
              <input
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                {...register("phone")}
              />
            </div>
            {errors.phone && (
              <div className="flex items-center">
                <label className="w-1/6 font-medium mr-2"></label>
                <p className="text-red-500">{errors.phone.message}</p>
              </div>
            )}
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Emp ID</label>
              <input
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                {...register("employeeId")}
              />
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Role</label>
              <Controller
                name="roleName"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={roles.map(role => ({ value: role.id.toString(), label: role.name }))}
                    className="w-3/4 dark:text-black"
                    placeholder="Select a role"
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
          <div className="mb-4">
            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Password</label>
              <input
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
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
          {/* <div className="flex items-center mb-4">
            <label className="w-1/6 font-medium mr-2">User ID</label>
            <input
              className="border border-gray-300 px-4 py-2 rounded w-3/4"
              value={data.uid}
              disabled
            />
          </div> */}

            {/* <label className="w-1/6 font-medium mr-2">Is Active</label> */}
            
        </div>
        <div className="flex items-center ml-16 ">

        <Label className="mr-2">Account Status</Label>
              <Switch
                                checked={Activebtn}
                                onCheckedChange={(checked) => setActivebtn(checked)}
                            />
          </div>
        
        <div>
          <div className="text-2xl text-orange-400 my-4">Roles & Rights</div>
          <div className="flex justify-end mb-4 mr-16">
            <Button
              type="button"
              onClick={handleSelectAllRights}
              className={selectAllRights ? "bg-orange-400" : ""}
            >
              {selectAllRights ? "Deselect All Rights" : "Select All Rights"}
            </Button>
          </div>

          <div className="ml-16">
            <table className="w-full">
              <thead>
                <tr className="grid grid-cols-8 mb-2">
                  <th className="text-left">Module</th>
                  <th>All</th>
                  {role.data && role.data.modules && Array.from(new Set(
                    role.data.modules.flatMap(m => m.rightslist.map(r => r.rightname))
                  )).sort().map(rightName => (
                    <th key={rightName}>{rightName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {role.data &&
                  role.data.modules &&
                  role.data.modules.map((module) => (
                    <tr
                      className="grid grid-cols-8 mb-2"
                      key={module.moduleName}
                    >
                      <td>{module.moduleName}</td>
                      <td className="justify-center flex items-center">
                        <input
                          type="checkbox"
                          name={`${module.moduleName}-All`}
                          checked={module.rightslist.every(
                            (right) => right.selected
                          )}
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
        </div>
        <div className="flex justify-end m-4">
          <Button color="success" type="submit">
            Update
          </Button>
        </div>
      </form>
    </>
  );
};

export default StaffDetail;
