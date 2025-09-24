"use client"
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from 'react-hook-form';
import CallFor2 from '@/utilities/CallFor2';
import { toast as reToast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import DeleteDialog from "@/components/DeleteDialog";
import ProductList from '../../addproduct/page';
import Pagination from '@/components/pagination/Pagination';

function AddOfferDiscount({params}) {
  const { register, handleSubmit, control, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [data, setdata] = useState({});
  const [productlist, setproductlist] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null); 
  const [UsageHistoryList, setUsageHistoryList] = useState(null);
  const discountLimitationId = watch('DiscountLimitationId');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  //pagination 
  const [currentUsageHistoryPage, setCurrentUsageHistoryPage] = useState(1);
  const [usageHistoryItemsPerPage, setUsageHistoryItemsPerPage] = useState(10);

  const router = useRouter();
  const usePercentage = watch('UsePercentage');
  const requiresCouponCode = watch('RequiresCouponCode');

  const bodyproductlist = {
    DiscountId: params.Id,
    Page: currentPage,
    PageSize: itemsPerPage,
    AvailablePageSizes: null,
    Draw: null,
    Start: (currentPage - 1) * itemsPerPage,
    Length: itemsPerPage,
    CustomProperties: {}
  } 

  const productlists = async () => {
    try {
      const response = await CallFor2(`Discount/admin-api/ProductList`, "post", bodyproductlist, "Auth");
      const data = response.data.Data;
      setproductlist(data);
      setTotalPages(Math.ceil(response.data.recordsTotal / itemsPerPage));
    } catch (error) {
      console.error('Error fetching product list:', error);
    }
  };
  
  useEffect(() => {
    productlists();
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const UsageHistoryListBody = {
    "DiscountId": params.Id,
    "Page": currentUsageHistoryPage,
    "PageSize": usageHistoryItemsPerPage,
    "AvailablePageSizes": "7, 15, 20, 50, 100",
    "Draw": null,
    "Start": 0,
    "Length": usageHistoryItemsPerPage,
    "CustomProperties": {}
  }

  const fetchUsageHistoryList = async () => {
    try {
      const response = await CallFor2(`Discount/admin-api/UsageHistoryList`, "Post", UsageHistoryListBody, "Auth");
      const data = response.data.Data;
      setUsageHistoryList(data)
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchInitialData = async () => {
    try {
      const response = await CallFor2(`Discount/admin-api/Edit/${params.Id}`,"get",null,"Auth");
      const data = response.data;
      setdata(data)
      Object.keys(data).forEach(key => {
        setValue(key, data[key]);
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [params]);

  useEffect(() => {
    fetchUsageHistoryList();
  }, [currentUsageHistoryPage, usageHistoryItemsPerPage]);

  // This function will be called when products are added from the ProductList modal
  const handleProductsAdded = () => {
    productlists(); // Refresh the product list
    reToast.success("Products added successfully!");
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await CallFor2('Discount/admin-api/Edit',"post", {
        ...data,
        DiscountTypeId: 2,
        DiscountTypeName:"Assigned to Products"
      },"Auth");
      if (response) {
        reToast.success("Discount saved successfully!");
        router.push("/station/portals/offerDiscount");
      } else {
        reToast.error("Error saving discount.");
      }
    } catch (error) {
      console.error('Error creating discount:', error);
      reToast.error("Error saving discount.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  // Handle successful deletion and refresh product list
  const handleDeleteSuccess = () => {
    productlists(); // Refresh the product list
    setIsDeleteDialogOpen(false);
    reToast.success("Product removed successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto p-6 bg-white dark:bg-black rounded-md shadow-md">
        <div className='flex justify-between items-center mb-6'>
          <div className='text-orange-500 text-2xl font-bold'>Edit OFFERS & DISCOUNTS</div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="Name" className="w-1/4 font-medium dark:text-white text-gray-700">Name</label>
            <input
              {...register('Name')}
              type="text"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label htmlFor="AdminComment" className="w-1/4 font-medium dark:text-white text-gray-700">Admin Comment</label>
            <input
              {...register('AdminComment')}
              type="text"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 font-medium dark:text-white text-gray-700">Use percentage</label>
            <Controller
              name="UsePercentage"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}
            />
          </div>
          {!usePercentage && (
            <div className="flex items-center space-x-4">
              <label htmlFor="DiscountAmount" className="w-1/4 font-medium dark:text-white text-gray-700">Discount Amount</label>
              <input
                {...register('DiscountAmount')}
                type="number"
                step="0.01"
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
          {usePercentage && (
            <>
              <div className="flex items-center space-x-4">
                <label htmlFor="DiscountPercentage" className="w-1/4 font-medium dark:text-white text-gray-700">Discount Percentage</label>
                <input
                  {...register('DiscountPercentage')}
                  type="number"
                  step="0.01"
                  className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label htmlFor="MaximumDiscountAmount" className="w-1/4 font-medium dark:text-white text-gray-700">Maximum Discount Amount</label>
                <input
                  {...register('MaximumDiscountAmount')}
                  type="number"
                  step="0.01"
                  className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </>
          )}
          <div className="flex items-center space-x-4">
            <label htmlFor="StartDateUtc" className="w-1/4 font-medium dark:text-white text-gray-700">Start Date</label>
            <input
              {...register('StartDateUtc')}
              type="datetime-local"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label htmlFor="EndDateUtc" className="w-1/4 font-medium dark:text-white text-gray-700">End Date</label>
            <input
              {...register('EndDateUtc')}
              type="datetime-local"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label htmlFor="DiscountLimitationId" className="w-1/4 font-medium dark:text-white text-gray-700">Discount Limitation</label>
            <select
              {...register('DiscountLimitationId')}
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="0">No limitation</option>
              <option value="15">N times only</option>
              <option value="25">N times per customer</option>
            </select>
          </div>

          {(discountLimitationId == 15 || discountLimitationId == 25) && (
            <div className="flex items-center space-x-4">
              <label htmlFor="LimitationTimes" className="w-1/4 font-medium dark:text-white text-gray-700">N Times</label>
              <input
                {...register('LimitationTimes')}
                type="number"
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
          <div className="flex items-center space-x-4">
            <label htmlFor="IsActive" className="w-1/4 font-medium dark:text-white text-gray-700">Is Active</label>
            <Controller
              name="IsActive"
              control={control}
              render={({ field }) => (
                <Switch {...field} checked={field.value} />
              )}
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 font-medium dark:text-white text-gray-700">Requires Coupon Code</label>
            <Controller
              name="RequiresCouponCode"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}
            />
          </div>
          {requiresCouponCode && (
            <div className="flex items-center space-x-4">
              <label htmlFor="CouponCode" className="w-1/4 font-medium dark:text-white text-gray-700">Coupon Code</label>
              <input
                {...register('CouponCode')}
                type="text"
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <label htmlFor="CouponCode" className="w-1/4 font-medium dark:text-white text-gray-700">URL with coupon code</label>
            <label htmlFor="" className="flex-grow p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              {data?.DiscountUrl}
            </label>
          </div>
        </div>

        <div className='flex justify-end'>
          <Link href="/station/portals/offerDiscount">
            <button type="button" className="mt-6 me-3 px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none">Cancel</button>
          </Link>
          <button type="submit" disabled={loading} className="mt-6 px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      <div className="p-6 mt-6 bg-white dark:bg-black rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-orange-500">Applied Products</h3>
          <ProductList 
            Id={params.Id} 
            onProductsAdded={handleProductsAdded}
            onSelectProducts={(selectedIds) => {
              console.log('Selected products:', selectedIds);
            }}
          />
        </div>
        
        <div className="space-y-4">
          <section className="mx-auto w-full max-w-7xl">
            <div className="mt-6 flex flex-col">
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="divide-x divide-gray-200">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productlist && productlist.length > 0 ? (
                      productlist.map((item) => (
                        <tr key={item.Id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.ProductName}
                            </div>
                          </td>
                          <td className="px-4 py-4 flex space-x-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              className="bg-green-500 text-white hover:bg-green-600 border-green-500"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDeleteUser("Discount/admin-api/ProductDelete/" + params.Id + "/" + item.ProductId)}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                          No products added to this discount yet. Click "Add Products" to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="p-6 mt-6 bg-white dark:bg-black rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4 text-orange-500">Usage History</h3>
        <div className="space-y-4">
          <section className="mx-auto w-full max-w-7xl">
            <div className="mt-6 flex flex-col">
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="divide-x divide-gray-200">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Total
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {UsageHistoryList && UsageHistoryList.length > 0 ? (
                      UsageHistoryList.map((item) => (
                        <tr key={item.Id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">{item.CustomOrderNumber}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">{item.OrderId}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">{item.OrderTotal}</div>
                          </td>
                          <td className="px-4 py-4">
                            <Button
                              size="sm"
                              onClick={() => handleDeleteUser("/Discount/admin-api/UsageHistoryDelete/" + params.Id + "/" + item.Id)}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          No usage history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-end">
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUsageHistoryPage(prev => Math.max(prev - 1, 1));
                    fetchUsageHistoryList();
                  }}
                  disabled={currentUsageHistoryPage === 1}
                  className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50"
                >
                  &larr; Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentUsageHistoryPage}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUsageHistoryPage(prev => prev + 1);
                    fetchUsageHistoryList();
                  }}
                  className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor2}
        onDelete={handleDeleteSuccess}
        delUrl={`${selectedUserId}`}
      />
    </div>
  )
}

export default AddOfferDiscount;