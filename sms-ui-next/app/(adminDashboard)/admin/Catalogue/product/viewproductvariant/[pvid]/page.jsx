"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft, Eye, Package, DollarSign, Archive, Tag, Truck, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import CallFor from "@/utilities/CallFor";
import { ChevronDown, ChevronUp } from "lucide-react";

// Add this new component before the ViewProductForm component
const ImagePreviewModal = ({ isOpen, onClose, imageUrl, imageName }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
        <img
          src={imageUrl}
          alt={imageName}
          className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        {imageName && (
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded">
            <p className="text-center text-sm">{imageName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ViewProductForm = ({ params }) => {
  const router = useRouter();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attributes, setAttributes] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await CallFor(`v2/Product/GetProductVariantByPvId?PvId=${params.pvid}`, "get", null, "Auth");
      const data = response.data.data;
      setProductData(data);
      
      // Fetch dropdown options for display
      const optionsResponse = await CallFor("v2/Product/SaveProductvariant", "get", null, "Auth");
      const optionsData = optionsResponse.data;
      setSkuOptions(optionsData.dropdowns.products.map(product => ({ value: product.id, label: product.proname })));
      setCurrencyOptions(optionsData.dropdowns.currency.map(curr => ({ value: curr.id, label: curr.name })));
      setAttributes(optionsData.dropdowns.attributes.map(attr => ({
        id: attr.id,
        name: attr.name,
        values: attr.subdata.map(sub => ({ value: sub.id, label: sub.name }))
      })));
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.pvid) {
      fetchProductData();
    }
  }, [params.pvid]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const getCurrencyName = (currencyId) => {
    const currency = currencyOptions.find(curr => curr.value === currencyId);
    return currency ? currency.label : 'Unknown';
  };

  const getSkuName = (skuId) => {
    const sku = skuOptions.find(option => option.value === skuId);
    return sku ? sku.label : 'Unknown';
  };

  const getAttributeName = (attributeId) => {
    const attribute = attributes.find(attr => attr.id === attributeId);
    return attribute ? attribute.name : 'Unknown';
  };

  const getAttributeValueName = (attributeId, valueId) => {
    const attribute = attributes.find(attr => attr.id === attributeId);
    if (attribute) {
      const value = attribute.values.find(val => val.value === valueId);
      return value ? value.label : 'Unknown';
    }
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Product not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft size={16} className="mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Product Details
          </h1>
        </div>
      
      </div>

      {/* Product Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          productData?.isPublished 
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          <Eye size={14} className="mr-1" />
          {productData?.isPublished ? 'Published' : 'Unpublished'}
        </span>
        {productData?.markAsNew && (
          <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
            <Tag size={14} className="mr-1" />
            New
          </span>
        )}
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-4">
          <Package className="text-orange-500 mr-2" size={24} />
          <h2 className="text-2xl font-bold text-orange-500">Basic Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Product Name
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {productData.pvname || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Short Description
              </label>
              <p className="text-gray-700 dark:text-gray-300">
                {productData.shortdesc || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Barcode
              </label>
              <p className="text-gray-700 dark:text-gray-300 font-mono">
                {productData.pvbarcode || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                SKU
              </label>
              <p className="text-gray-700 dark:text-gray-300">
                {productData.pvsku || 'Not specified' }
                {/* {getSkuName(productData.pvsku)} */}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Description
              </label>
              <p className="text-gray-700 dark:text-gray-300">
                {productData.pvdesc || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Available Date Range
              </label>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="block">Start: {formatDate(productData.availabledate)}</span>
                <span className="block">End: {formatDate(productData.enddate)}</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={productData.autorenew || false}
                  disabled
                  className="mr-2"
                />
                <label className="text-sm text-gray-600 dark:text-gray-300">Auto Renew</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={productData.displayOnHomePage || false}
                  disabled
                  className="mr-2"
                />
                <label className="text-sm text-gray-600 dark:text-gray-300">Show on Homepage</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-4">
          <DollarSign className="text-orange-500 mr-2" size={24} />
          <h2 className="text-2xl font-bold text-orange-500">Pricing</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Currency
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {/* {getCurrencyName(productData.pvcurrencyid)} */}
              {productData?.pvcurrency?.currname ||""}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Sales Price
            </label>
            <p className="text-lg font-semibold text-green-600">
              {productData.pvsalesprice || '0.00'}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Purchase Price
            </label>
            <p className="text-lg font-semibold text-blue-600">
              {productData.pvpurchaseprice || '0.00'}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Old Price
            </label>
            <p className="text-lg font-semibold text-gray-500 line-through">
              {productData.pvoldprice || '0.00'}
            </p>
          </div>
        </div>
        
        {productData.pvspecialprice && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Special Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                  Special Price
                </label>
                <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  {productData.pvspecialprice}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                  Start Date
                </label>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {formatDate(productData.pvspstartdate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                  End Date
                </label>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {formatDate(productData.pvspenddate)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-4">
          <Archive className="text-orange-500 mr-2" size={24} />
          <h2 className="text-2xl font-bold text-orange-500">Inventory</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Opening Stock
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {productData.openingstock || '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(productData.openingstockdate)}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Closing Stock
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {productData.closingstock || '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(productData.closingstockdate)}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Safety Level
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {productData.safetylevel || '0'}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Reorder Level
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {productData.reorderlevel || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Attributes */}
     {productData.pvamappings && productData.pvamappings.filter(mapping => mapping.ispecification !== true).length > 0 && (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
    <div className="flex items-center mb-4">
      <Tag className="text-orange-500 mr-2" size={24} />
      <h2 className="text-2xl font-bold text-orange-500">Attributes</h2>
    </div>

    <div className="space-y-4">
      {productData.pvamappings
        .filter(mapping => mapping.ispecification !== true)
        .map((mapping, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {mapping.attrname || getAttributeName(mapping.attributeid)}
            </span>
            <span className="text-gray-500">→</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {mapping.pvamvalues && mapping.pvamvalues.length > 0
                ? mapping.pvamvalues.map((val) => val.avname).join(', ')
                : 'No value set'}
            </span>
          </div>
          {mapping.isrequired && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              Required
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
)}

      {/* Specification Section */}
      {productData.specification && productData.specification.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center mb-4">
            <Tag className="text-orange-500 mr-2" size={24} />
            <h2 className="text-2xl font-bold text-orange-500">Specification</h2>
          </div>
          <div className="space-y-4">
            {productData.specification.map((spec, idx) => (
              <div key={spec.attributeid || idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4 mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {spec.attributename}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {spec?.attributevalues && spec?.attributevalues.length > 0 ? (
                    spec.attributevalues.map((val) => (
                      <span
                        key={val?.avid}
                        className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100 border border-orange-300 dark:border-orange-700"
                        style={val?.avcolor ? { backgroundColor: val.avcolor, color: '#fff' } : {}}
                      >
                        {val?.avname}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No values</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {productData.relatedproducts && productData.relatedproducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productData.relatedproducts.map((product, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.relatedProName}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

       {productData.protags && productData.protags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">Product Tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productData.protags.map((product, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">
                  {product}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images */}
      {productData?.pvummappings && productData?.pvummappings?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center mb-4">
            <ImageIcon className="text-orange-500 mr-2" size={24} />
            <h2 className="text-2xl font-bold text-orange-500">Product Images</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productData.pvummappings.map((mapping, index) => (
              <div key={index} className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div 
                  className="relative overflow-hidden rounded-lg"
                  onClick={() => setSelectedImage({
                    url: `${process.env.NEXT_PUBLIC_VIEW_DOCUMENT}/${mapping?.productimg?.umurl}`,
                    name: mapping?.productimg?.umname
                  })}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_VIEW_DOCUMENT}/${mapping?.productimg?.umurl}`}
                    alt={mapping.productimg?.umname}
                    className="w-full h-48 object-cover rounded-lg shadow-md transition-all duration-300 hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Eye className="text-white" size={24} />
                  </div>
                </div>
                {mapping.productimgid === productData.pvdefaultimgid && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Default
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white bg-black bg-opacity-60 p-1 rounded truncate">
                    {mapping?.productimg?.umname}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ImagePreviewModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url}
        imageName={selectedImage?.name}
      />

      {/* Current Stock Section */}
<div className="mt-8 rounded-md border bg-white dark:text-accent_light">
  <div className="p-4 border-b">
    <h2 className="text-xl font-semibold text-inputLabel_light"> Stock Transaction </h2>
  </div>
  <div className="">
    <table className="w-full">
      <thead className="tableheader">
        <tr>
          <th className="p-2">Stock ID</th>
          <th className="p-2">Product</th>
          <th className="p-2">Ref ID</th>
          <th className="p-2">Purchase Qty</th>
          <th className="p-2">Stock Qty</th>
          <th className="p-2">Balance Qty</th>
          <th className="p-2">Transaction Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {productData?.currentStock .map((stock) => (
          <tr key={`stock-${stock.stid}`}>
            <td className="p-2">{stock.stid}</td>
            <td className="p-2">{stock.product || 'N/A'}</td>
            <td className="p-2">{stock.refid}</td>
            <td className="p-2">{stock.pqty}</td>
            <td className="p-2">{stock.sqty ?? '0.00'}</td>
            <td className="p-2">{stock.bqty}</td>
            <td className="p-2">{formatDate(stock.transactiondate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>



      {/* Action Buttons */}
     
    </div>
  );
};

export default ViewProductForm;