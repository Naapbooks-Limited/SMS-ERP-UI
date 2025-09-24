"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowLeft } from "lucide-react";
import CallFor from '@/utilities/CallFor';
import { Card } from '@/components/ui/card';

function ViewAttributePage({ params }) {
  const [attribute, setAttribute] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAttributeDetails();
  }, [params.id]);

  const fetchAttributeDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await CallFor(`v2/Product/GetAttributeByID?Id=${params.id}`, 'post', null, 'Auth');
      
      if (response?.data?.data) {
        setAttribute(response.data.data);
      }
    } catch (error) {
      setError('Failed to fetch attribute details. Please try again later.');
      console.error('Error fetching attribute details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-2">Loading attribute details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Attribute Details</h1>
        </div>
        <Button 
          onClick={() => router.push(`/admin/Catalogue/Attribute/editattribute/${params.id}`)}
          className="bg-primary text-white"
        >
          Edit Attribute
        </Button>
      </div>

      {attribute && (
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1">{attribute.attributename}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1">{attribute.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Is Specification</label>
                  <div className="mt-1">
                    {attribute.isspecification ? (
                      <Check className="text-success-700" size={20} />
                    ) : (
                      <X className="text-red-500" size={20} />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Attribute ID</label>
                  <p className="mt-1">{attribute.attributeid}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Attribute Values */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Attribute Values</h2>
            {attribute.attributevalues && attribute.attributevalues.length > 0 ? (
              <div className="grid gap-4">
                {attribute.attributevalues.map((value) => (
                  <div key={value.avid} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Value Name</label>
                        <p className="mt-1">{value.avname}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Value ID</label>
                        <p className="mt-1">{value.avid}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No attribute values found.</p>
            )}
          </Card>

          {/* Additional Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Created By</label>
                <p className="mt-1">{attribute.createdby || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Modified By</label>
                <p className="mt-1">{attribute.modifiedby || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Modified Date</label>
                <p className="mt-1">{attribute.modifieddate ? new Date(attribute.modifieddate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">UO ID</label>
                <p className="mt-1">{attribute.uoid}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ViewAttributePage; 