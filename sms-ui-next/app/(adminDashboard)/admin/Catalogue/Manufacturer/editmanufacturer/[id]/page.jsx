"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import CallFor from '@/utilities/CallFor';

function EditManufacturerPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [formData, setFormData] = useState({
    name: '',
    published: true,
    metaKeywords: null,
    metaTitle: null,
    pageSizeOptions: null,
    description: null,
    manufacturerTemplateId: 0,
    metaDescription: null,
    pictureId: 0,
    pageSize: 0,
    allowCustomersToSelectPageSize: false,
    subjectToAcl: false,
    limitedToStores: false,
    isdeleted: false,
    displayOrder: 0,
    createdOnUtc: new Date().toISOString(),
    updatedOnUtc: new Date().toISOString(),
    priceRangeFiltering: false,
    priceFrom: 0,
    priceTo: 0,
    manuallyPriceRange: false
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchManufacturer();
  }, [id]);

  const fetchManufacturer = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await CallFor(`v2/Common/GetManufactureById?id=${id}`, 'post', null, 'Auth');
      const manufacturer = response.data.data;
      setFormData({
        name: manufacturer.name,
        published: manufacturer.published,
        metaKeywords: manufacturer.metaKeywords || null,
        metaTitle: manufacturer.metaTitle || null,
        pageSizeOptions: manufacturer.pageSizeOptions || null,
        description: manufacturer.description || null,
        manufacturerTemplateId: manufacturer.manufacturerTemplateId || 0,
        metaDescription: manufacturer.metaDescription || null,
        pictureId: manufacturer.pictureId || 0,
        pageSize: manufacturer.pageSize || 0,
        allowCustomersToSelectPageSize: manufacturer.allowCustomersToSelectPageSize || false,
        subjectToAcl: manufacturer.subjectToAcl || false,
        limitedToStores: manufacturer.limitedToStores || false,
        isdeleted: manufacturer.isdeleted || false,
        displayOrder: manufacturer.displayOrder || 0,
        createdOnUtc: manufacturer.createdOnUtc || new Date().toISOString(),
        updatedOnUtc: new Date().toISOString(),
        priceRangeFiltering: manufacturer.priceRangeFiltering || false,
        priceFrom: manufacturer.priceFrom || 0,
        priceTo: manufacturer.priceTo || 0,
        manuallyPriceRange: manufacturer.manuallyPriceRange || false
      });
    } catch (error) {
      setError('Failed to fetch manufacturer details. Please try again later.');
      console.error('Error fetching manufacturer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setError(null);
      setIsSubmitting(true);
      await CallFor('v2/Common/UpdateManufacture', 'post', {
        ...formData,
        id: parseInt(id),
        updatedOnUtc: new Date().toISOString()
      }, 'Auth');
      router.push('/admin/Catalogue/Manufacturer');
    } catch (error) {
      setError('Failed to update manufacturer. Please try again.');
      console.error('Error updating manufacturer:', error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Manufacturer</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter manufacturer name"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                disabled={isSubmitting}
              />
              <label className="text-sm font-medium">Published</label>
            </div>

            <div className="flex space-x-4 mt-6">
              <Button 
                type="submit" 
                className="bg-primary text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Manufacturer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/Catalogue/Manufacturer')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditManufacturerPage; 