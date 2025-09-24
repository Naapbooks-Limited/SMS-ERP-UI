"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import CallFor from '@/utilities/CallFor';

function ViewManufacturerPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [manufacturer, setManufacturer] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchManufacturer();
  }, [id]);

  const fetchManufacturer = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await CallFor(`v2/Common/GetManufactureById?id=${id}`, 'post', null, 'Auth');
      setManufacturer(response.data.data);
    } catch (error) {
      setError('Failed to fetch manufacturer details. Please try again later.');
      console.error('Error fetching manufacturer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/Catalogue/Manufacturer')}
          >
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  if (!manufacturer) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center">Manufacturer not found</div>
          <div className="flex justify-center mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/Catalogue/Manufacturer')}
            >
              Back to List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Manufacturer Details</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Name</label>
            <p className="mt-1 text-lg">{manufacturer.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Status</label>
            <p className="mt-1">
              <span className={`px-2 py-1 rounded ${manufacturer.published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {manufacturer.published ? 'Published' : 'Draft'}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Created On</label>
            <p className="mt-1">{new Date(manufacturer.createdOnUtc).toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Last Updated</label>
            <p className="mt-1">{new Date(manufacturer.updatedOnUtc).toLocaleString()}</p>
          </div>

          <div className="flex space-x-4 mt-6">
            <Button
              type="button"
              onClick={() => router.push(`/admin/Catalogue/Manufacturer/editmanufacturer/${id}`)}
              className="bg-primary text-white"
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/Catalogue/Manufacturer')}
            >
              Back to List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewManufacturerPage; 