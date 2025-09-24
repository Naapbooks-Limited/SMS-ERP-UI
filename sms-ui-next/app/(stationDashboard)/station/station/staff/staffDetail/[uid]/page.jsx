"use client";
import { Button } from '@/components/ui/button';
import { Undo2,Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import CallFor from "@/utilities/CallFor";
import { Checkbox } from "@/components/ui/checkbox";

const StaffDetail = ({params}) => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [role, setRole] = useState("");
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

        setData(response.data);
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



  return (
    <>
       <div className="justify-between flex gap-1 pb-3">
        <div className="text-2xl text-orange-400">STAFF</div>
        <Button color="warning" onClick={handleBack}>
          <Undo2 className="mr-2" />
          Back
        </Button>
      </div>

      <div className=" grid grid-cols-2 ml-16">
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
            First Name
          </label>
          <p className="text-blue-900 dark:text-white ml-4"> <span className='font-bold'> : </span> <span className='ml-5'>{data?.firstname}</span> </p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
            Last Name
          </label>
          <p className="text-blue-900 dark:text-white ml-4"> <span className='font-bold'> : </span> <span className='ml-5'>{data?.lastname}</span> </p>
        </div>

        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
            Email ID
          </label>
          <p className="text-blue-900 dark:text-white ml-4"> <span className='font-bold'> : </span> <span className='ml-5'>{data?.emailid}</span> </p>
        </div>

        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
            Phone No
          </label>
          <p className="text-blue-900 dark:text-white ml-4"> <span className='font-bold'> : </span> <span className='ml-5'>{data?.mobno}</span> </p>
        </div>

        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
            Emp ID
          </label>
          <p className="text-blue-900 dark:text-white ml-4"> <span className='font-bold'> : </span> <span className='ml-5'>{data?.employeeId}</span> </p>
        </div>

        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
            Role
          </label>
          <p className="text-blue-900 dark:text-white ml-4"> <span className='font-bold'> : </span> <span className='ml-5'>{data?.roleTypename}</span> </p>
        </div>

        {/* <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
            User ID
          </label>
          <p className="text-blue-900 dark:text-white ml-4"> <span className='font-bold'> : </span> <span className='ml-5'>{data?.uid}</span> </p>
        </div> */}
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
            Password
          </label>
          <p className="text-blue-900 dark:text-white ml-4"> <span className='font-bold'> : </span> <span className='ml-5'>{data?.password}</span> </p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">
            {" "}
            Is Active
          </label>
          <p className="text-blue-900 dark:text-white ml-4">
             <span className='font-bold'> : </span> <span className='ml-5'>{data?.accountstatus == 48 ? "Yes" : data?.accountstatus == 49 ? "No" : "Both"}</span> 
          </p>
        </div>
      </div>
      <div>
        <div className="text-2xl text-orange-400 my-4">Roles & Rights</div>
        <div className='ml-16'>
          {([1, 2, 5].includes(data?.roletypeid)) ? (
            <div className="text-green-600 font-bold text-lg">
              This is an admin and has all rights.
            </div>
          ) : (
            <table>
              <tbody>
                <tr className="grid grid-cols-6 gap-16 mb-2">
                  <th></th>
                  <th>Create</th>
                  <th>Read</th>
                  <th>Update</th>
                  <th>Delete</th>
                  <th>List</th>
                </tr>
                {role &&
                  role.data.modules.map((module) => (
                    <tr
                      className="grid grid-cols-6 mb-2 gap-16"
                      key={module.moduleName}
                    >
                      <td>{module.moduleName}</td>
                      {module.rightslist.map((right) => (
                        <td
                          key={right.rightid}
                          className="justify-center flex items-center"
                        >
                          <Checkbox
                            className={`w-8 h-8 rounded-full disabled:opacity-100 disabled:cursor-default`}
                            disabled
                            defaultChecked
                            color={right.selected ? "success" : "destructive"}
                            icon={right.selected ? <Check /> : <X />}
                            id={`circle_${right.rightid}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default StaffDetail;
