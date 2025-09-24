"use client"
import { Button } from '@/components/ui/button'
import { Undo2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import CallFor from "@/utilities/CallFor";
import Link from 'next/link';

const containerClasses = "container mx-auto p-4";
const borderClasses = "border border-zinc-300 rounded-lg p-4 mt-2";
const tableClasses = "min-w-full my-3 border border-1 border-dark";
const headerClasses = "text-xl font-semibold text-orange-500";
const buttonClasses = "bg-blue-500 text-white px-4 py-2 rounded";
const selectClasses = "border border-zinc-300 rounded mx-1";
const textClasses = "text-zinc-700";
const centerTextClasses = "text-center text-zinc-500 py-5";
const flexClasses = "flex justify-between items-center mt-4";
const imageClasses = "px-4 py-5";
const editButtonClasses = "bg-zinc-300 text-zinc-700 px-2 py-1 rounded mr-2";
const deleteButtonClasses = "bg-red-500 text-white px-2 py-1 rounded";
const giftWrapClasses = "mt-2 text-zinc-700";

const editOrderDetail = ({ params }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await CallFor(
          `v2/Orders/GetOrderById?orderid=${params.orderid}`,
          "GET",
          null,
          "Auth"
        );
        setData(response.data);
        console.log(data);// Adjust to match the actual data structure
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }

    };

    fetchData();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-2xl font-bold">
          Edit order details - 1154
        </div>
        <div className="flex justify-between items-center">
          <Button
            className="bg-blue-950"
            onClick={() => router.push("/station/sales/order")}
          >
            <Undo2 size={20}/>
            Back
          </Button>
          <Button
            className="bg-orange-400 mx-1"
          // onClick={() => router.push("/station/sales/order")}
          >
            save
          </Button>
          <Button
            className="bg-green-600"
          // onClick={() => router.push("/station/sales/order")}
          >
            Invoice(PDF)
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 p-3">
        <div className="border border-gray-200 ">
          <div className="ml-16 mt-3">
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Order #
              </label>
              <p className="text-blue-900 dark:text-gray-300 text-end">{data?.orderid}</p>
            </div>
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Created on
              </label>
              <p className="text-blue-900 dark:text-gray-300 text-end">{data?.orderdate}</p>
            </div>
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Customer
              </label>
              <p className="text-blue-900 dark:text-gray-300 text-end">{data?.buyerName}</p>
            </div>{" "}
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Order status
              </label>
              <p className="text-blue-900 dark:text-gray-300 text-end">{data?.orderstatusname}</p>
            </div>
          </div>
        </div>
        <div className="border border-gray-200 mt-3">
          <div className="ml-16  mt-3">
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Order subtotal
              </label>
              <p className="text-blue-900 dark:text-gray-300 text-end">{data?.ordertotal}</p>
            </div>
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Order shipping
              </label>
              {/* <p className="text-blue-900 dark:text-gray-300 text-end">{data?.odtshipper}</p> */}
            </div>
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Order tax
              </label>
              {/* <p className="text-blue-900 dark:text-gray-300 text-end">{data?.ordertaxtotal}</p> */}
            </div>
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Order total
              </label>
              <p className="text-blue-900 dark:text-gray-300 text-end">{data?.ordertaxtotal}</p>
            </div>
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Profit
              </label>
              {/* <p className="text-blue-900 dark:text-gray-300 text-end">{data?.orderid}</p> */}
            </div>
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Payment method
              </label>
              {/* <p className="text-blue-900 dark:text-gray-300 text-end">{data?.orderid}</p> */}
            </div>
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Payment status
              </label>
              {/* <p className="text-blue-900 dark:text-gray-300 text-end">{data?.  }</p> */}
            </div>
          </div>
        </div>
        <div className="border border-gray-200 mt-3 ">
          <div className="ml-16 mt-3">
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Store
              </label>
              <p className="text-blue-900 dark:text-gray-300 text-end">
                Osia Hyper Retail Limited
              </p>
            </div>
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Order GUID
              </label>
              <p className="text-blue-900 dark:text-gray-300 text-end">
                f8fe2376-c3bd-40af-9475-a431bdd92aed
              </p>
            </div>{" "}
            <div className="flex items-center mb-4">
              <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                Customer IP address
              </label>
              <p className="text-blue-900 dark:text-gray-300 text-end">103.109.78.227</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border border-gray-200 p-3 ">
        <div className="text-orange-500 text-xl font-medium">
          Billing & shipping
        </div>
        <div className="flex justify-between">
          <div className="border border-gray-200 p-4 mr-2 text-start w-1/2">
            <div className="text-orange-500 text-lg font-normal">
              Billing address
            </div>
            <div className="ml-16 mt-3">
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Full name
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">{data?.ordertaxtotal}</p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Email
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">{data?.ordertaxtotal}</p>
              </div>{" "}
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Phone
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">{data?.ordertaxtotal}</p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Fax
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end"> </p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Company
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end"> </p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Address
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">depart mall</p>
              </div>{" "}
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Address
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">depart mall</p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  City
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">Ahmedabad</p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  County / region
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end"> </p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  State / province
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">Gujarat</p>
              </div>{" "}
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Zip / postal code
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">380008</p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Country
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">India</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 p-4 w-1/2">
            <div className="text-orange-500 text-lg font-normal">
              Shipping address
            </div>
            <div className="ml-16 mt-3">
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Full name
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">Erika Dave</p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Email
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">vrutika@osiamart.com</p>
              </div>{" "}
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Phone
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">7069011498</p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Fax
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end"> </p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Company
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end"> </p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Address
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">depart mall</p>
              </div>{" "}
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Address
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">depart mall</p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  City
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">Ahmedabad</p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  County / region
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end"> </p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  State / province
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">Gujarat</p>
              </div>{" "}
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Zip / postal code
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">380008</p>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
                  Country
                </label>
                <p className="text-blue-900 dark:text-gray-300 text-end">India</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
            Shipping method
          </label>
          <p className="text-blue-900 dark:text-gray-300 text-end">Ground</p>
        </div>
        <div className="flex items-center mb-4">
          <label className="w-1/6 font-semibold mr-2 text-blue-950 dark:text-white">
            Shipping status
          </label>
          <p className="text-blue-900 dark:text-gray-300 text-end">Not yet shipped</p>
        </div>
      </div>
      <div className="border border-gray-200 p-3 ">
        <div className="text-orange-500 text-xl font-medium">Shipments</div>
      </div>

      <table className={tableClasses} >
        <thead>
          <tr className="bg-zinc-100">
            <th className={imageClasses}>Shipment</th>
            <th className={imageClasses}>Order</th>
            <th className={imageClasses}>Tracking number</th>
            <th className={imageClasses}>Total weight</th>
            <th className={imageClasses}>Date shipped</th>
            <th className={imageClasses}>Date delivered</th>
            <th className={imageClasses}>View</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="7" className={centerTextClasses}>No data available in table</td>
          </tr>
        </tbody>
      </table>


      <Link href={"/station/sales/order/ShipmentForm"}><button className='bg-blue-600 text-white p-3 rounded' > Add Shipment  </button></Link>


      <table className={tableClasses}>
        <thead>
          <tr className="bg-zinc-100">
            <th className={imageClasses}>Picture</th>
            <th className={imageClasses}>Product name</th>
            <th className={imageClasses}>Price</th>
            <th className={imageClasses}>Quantity</th>
            <th className={imageClasses}>Discount</th>
            <th className={imageClasses}>Total</th>
            <th className={imageClasses}>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={imageClasses}><img style={{height:"100px" , width:"100px"}} src={"data:image/jpeg;base64,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"} alt="Product Image" /></td>
            <td className={imageClasses}>
              Aashirvaad Atta 10kg<br />
              <span className="text-zinc-500">SKU: 9250</span>
            </td>
            <td className={imageClasses}>415.00 excl tax</td>
            <td className={imageClasses}>1</td>
            <td className={imageClasses}>0.00 excl tax</td>
            <td className={imageClasses}>830.00 excl tax</td>
            <td className={imageClasses}>
              <button className={editButtonClasses}>Edit</button>
              <button className={deleteButtonClasses}>Delete</button>
            </td>
          </tr>
        </tbody>
      </table>



      
    </>
  );
}

export default editOrderDetail