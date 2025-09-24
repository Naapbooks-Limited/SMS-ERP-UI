"use client";
import React, { useEffect, useState } from "react";
import CallFor from "@/utilities/CallFor";
import Select from 'react-select';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast as reToast } from "react-hot-toast";
import * as yup from 'yup';
import { Button } from "@/components/ui/button";
import { components } from 'react-select';
import { useTheme } from "next-themes";

const sharedClasses = {
  border: "border border-zinc-300 dark:border-zinc-700 rounded p-2",
  button: "p-2 rounded",
};


const darkStyles = {
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#333", // Dark background for menu
    color: "white", // White text color
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#555" : "#333", // Selected item background
    color: "white", // White text color
  }),
  control: (provided) => ({
    ...provided,
    backgroundColor: "#333", // Dark background for control
    color: "white", // White text color
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "white", // White text color
  }),
};

const lightStyles = {
  // You can add styles for light mode if needed
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#fff", // Light background for menu
    color: "#333", // Dark text color
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#f0f0f0" : "#fff", // Selected item background
    color: "#333", // Dark text color
  }),
  control: (provided) => ({
    ...provided,
    backgroundColor: "#fff", // Light background for control
    color: "#333", // Dark text color
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#333", // Dark text color
  }),
};



const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 1000 }),
    control: (base, state) => ({
      ...base,
      backgroundColor: state.selectProps.menuIsOpen ? "#000" : "#fff", // White in light mode, black in dark mode
      color: state.selectProps.menuIsOpen ? "#fff" : "#000",
      borderColor: "#ccc",
      "&:hover": {
        borderColor: "#aaa",
      },
      "&.dark &": {
        backgroundColor: state.selectProps.menuIsOpen ? "#000" : "#2d2d2d", // Darker shade for dark mode
        color: state.selectProps.menuIsOpen ? "#0" : "#fff", // White text in dark mode
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#fff", // Light mode
      "&.dark &": {
        backgroundColor: "#000", // Dark mode
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#ddd" : state.isFocused ? "#eee" : "#fff", // Light mode
      color: state.isSelected ? "#000" : "#000", // Light mode text color
      "&.dark &": {
        backgroundColor: state.isSelected
          ? "#444"
          : state.isFocused
          ? "#555"
          : "#2d2d2d", // Dark mode
        color: "#fff", // White text in dark mode
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#000", // Light mode text color
      "&.dark &": {
        color: "#fff", // Dark mode text color
      },
    }),
  }


  

  
  const requisitionSchema = yup.object().shape({
    mrdate: yup.date().required("Requisition date is required"),
    mrrequireddate: yup.date().required("Due date is required").min(yup.ref('mrdate'), "Due date must be after the requisition date"),
    selectedWarehouse: yup.object().nullable(),
    selectedChildOrganization: yup.object().nullable(),
    items: yup.array().of(
      yup.object().shape({
        selectedProductId: yup.object().nullable().required("Product is required"),
        quantities: yup.number().required("Quantity is required").min(1, "Quantity must be at least 1"),
        selectedAttributes: yup.array().of(
          yup.object().shape({
            attributeId: yup.number().nullable(),
            attributeValue: yup.object().nullable()
          }).test('attribute-validation', 'Attribute validation', function(value) {
            const { attributeId, attributeValue } = value || {};
            
            // If both are null/undefined, it's valid (no attribute selected - this is allowed)
            if ((attributeId === null || attributeId === undefined) && (attributeValue === null || attributeValue === undefined)) {
              return true;
            }
            
            // If attributeId is selected but attributeValue is not - this is NOT allowed
            if (attributeId && (!attributeValue || attributeValue === null)) {
              return this.createError({
                path: `${this.path}.attributeValue`,
                message: 'Attribute value is required when attribute is selected'
              });
            }
            
            // If attributeValue is selected but attributeId is not - this shouldn't happen in UI but handle it
            if (attributeValue && (!attributeId || attributeId === null)) {
              return this.createError({
                path: `${this.path}.attributeId`,
                message: 'Attribute is required when attribute value is selected'
              });
            }
            
            // If both are filled, it's valid
            if (attributeId && attributeValue) {
              return true;
            }
            
            return true;
          })
        )
        // Removed the "at-least-one-complete-attribute" test since attributes are now optional
      })
    ).min(1, "At least one item is required")
  }).test('warehouse-or-external', 'Either Warehouse or External Vendor must be selected', function(values) {
    if (values.selectedWarehouse && values.selectedChildOrganization) {
      return this.createError({ path: 'selectedWarehouse', message: 'Only one of Warehouse or External Vendor can be selected' });
    }
    if (!values.selectedWarehouse && !values.selectedChildOrganization) {
      return this.createError({ path: 'selectedWarehouse', message: 'Either Warehouse or External Vendor must be selected' });
    }
    return true;
  });

  const getShortErrorMessage = (errorMessage) => {
    if (errorMessage.includes("required")) return "Required";
    if (errorMessage.includes("at least 1")) return "Min 1";
    return "Quantity Required";
  };

const CreateRequisition = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [items, setItems] = useState([{
    id: 1,
    selectedProductId: null,
    quantities: "",
    attributes: [],
    selectedAttributes: [{ attributeId: null, attributeValue: null }]
  }]);
  const [formData, setFormData] = useState({});
  const [productList, setProductList] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [errors, setErrors] = useState({});
  const [childOrganizations, setChildOrganizations] = useState([]);
  const [selectedChildOrganization, setSelectedChildOrganization] = useState(null);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const orgid = userData.orgid;
  const uid = userData.uid;

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const response = await CallFor(
        `v2/Orders/SaveMaterialRequest`,
        "Get",
        null,
        "Auth"
      );

      setProductList(
        response.data.dropdowns.products.map((product) => ({
          value: product.id,
          valuee: product.pvId,
          price: product.price,
          label: product.proname,
          itemuom: product.prouom,
          attributes: product.attributes.map(attr => ({
            id: attr.id,
            name: attr.name,
            values: attr.subdata.map(sub => ({
              value: sub.id,
              label: sub.name
            }))
          }))
        }))
      );

      setWarehouseOptions(
        response.data.dropdowns.organisations.map((org) => ({
          value: org.id,
          label: org.name,
          uaid: org.uaid
        }))
      );

      setChildOrganizations(response.data.dropdowns.childOrganisations.map(org => ({
        value: org.id,
        label: org.name,
        uid: org.uid,
        uaid: org.uaid
      })));
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        selectedProductId: null,
        quantities: "",
        attributes: [],
        selectedAttributes: [] // Initialize as empty array since we'll populate it when product is selected
      }
    ]);
  };
  

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const currentDate = new Date().toISOString().split('T')[0];
    if (value < currentDate) {
      setErrors(prev => ({ ...prev, [name]: "Date cannot be in the past" }));
    } else {
      setErrors(prev => ({ ...prev, [name]: undefined }));
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleDeleteItem = (itemId) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    setItems(updatedItems);
  };

  const handleAttributeChange = (itemIndex, attrIndex, selectedOption) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].selectedAttributes[attrIndex].attributeId = selectedOption.value;
    updatedItems[itemIndex].selectedAttributes[attrIndex].attributeName = selectedOption.label;
    updatedItems[itemIndex].selectedAttributes[attrIndex].attributeValue = null;
    setItems(updatedItems);
  };

  const handleAttributeValueChange = (itemIndex, attrIndex, selectedOption) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].selectedAttributes[attrIndex].attributeValue = selectedOption;
    setItems(updatedItems);
  };

  const handleAddAttribute = (itemIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].selectedAttributes.push({ attributeId: null, attributeValue: null });
    setItems(updatedItems);
  };

  const handleRemoveAttribute = (itemIndex, attrIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].selectedAttributes.splice(attrIndex, 1);
    setItems(updatedItems);
  };

  const handleSave = async () => {
    const itemList = items.map(item => ({
      selectedProductId: item.selectedProductId,
      quantities: item.quantities,
      // Filter out empty attributes (where both attributeId and attributeValue are null)
      selectedAttributes: item.selectedAttributes.filter(attr => 
        attr.attributeId !== null || attr.attributeValue !== null
      )
    }));
  
    const formDataForValidation = {
      mrdate: formData.mrdate,
      mrrequireddate: formData.mrrequireddate,
      selectedWarehouse,
      selectedChildOrganization,
      items: itemList
    };
  
    try {
      await requisitionSchema.validate(formDataForValidation, { abortEarly: false });
  
      const materialRequestItems = items.map(item => {
        const productId = item.selectedProductId?.value;
        const productpvid = item.selectedProductId?.valuee;
        const productprice = item.selectedProductId?.price;
  
        return {
          mriid: 0,
          mrid: 0,
          proid: productId,
          pvid: productpvid,
          price: productprice,
          itemqty: parseInt(item.quantities),
          itemtargetlocation: selectedWarehouse?.uaid ? selectedWarehouse?.uaid : selectedChildOrganization?.uaid,
          itemrequestby: uid,
          itemuom: productList.find(p => p.value === productId)?.itemuom || '',
          itemuomcfactor: 0,
          itemselecteduom: 0,
          // Only include complete attributes in the final submission
          mridetails: item.selectedAttributes
            .filter(attr => attr.attributeId !== null && attr.attributeValue !== null)
            .map(attr => ({
              mridid: 0,
              mriid: null,
              mrid: null,
              attributeid: attr.attributeId,
              attrvalue: attr.attributeValue?.value
            }))
        };
      });
  
      const body = {
        mrid: 0,
        mrtype: true,
        uoid: orgid,
        seriesid: null,
        mrno: 0,
        sourcewarehouse: orgid,
        targetwarehouse: selectedWarehouse?.value ? selectedWarehouse?.value : selectedChildOrganization?.value,
        mrdate: formData.mrdate,
        mrrequireddate: formData.mrrequireddate,
        ordertandc: "null",
        materialrequestitems: materialRequestItems,
        materialattachments: []
      };
  
      const response2 = await CallFor(
        `v2/Orders/SaveMaterialRequest`,
        "post",
        body,
        "Auth"
      );
  
      if (response2.data.status === true) {
        reToast.success("Requisition saved successfully!");
        router.push("/station/Purchase/Requistion");
      } else {
        reToast.error("Failed to save requisition");
      }
  
    } catch (error) {
      if (error.name === 'ValidationError') {
        const newErrors = {};
        error.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.log(error);
      }
    }
  };

  const CustomOption = ({ children, ...props }) => {
    if (props.data.value === 'add-external') {
      return (
        <div className="py-2 px-3 cursor-pointer hover:bg-gray-100" onClick={() => router.push("/station/station/Externalwarehouse/AddExternalWarehouse")}>
          <Button color="warning" className="shadow-md w-full">
            Add External
          </Button>
        </div>
      );
    }
    return <components.Option {...props}>{children}</components.Option>;
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const price = item.selectedProductId?.price || 0;
      const quantity = parseFloat(item.quantities) || 0;
      return total + (price * quantity);
    }, 0);
  };

  return (
    <div className="p-2 dark:bg-zinc-800 min-h-screen relative">
      <div className="mx-auto rounded-lg p-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-4 text-orange-500">
            Create Requisition
          </h2>
        </div>

        {/* Form Section */}
        <div className="bg-white dark:bg-zinc-700 rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Req. Date</label>
              <input
                type="date"
                className={`${sharedClasses.border} ${errors.mrdate ? 'border-red-500' : ''}`}
                name="mrdate"
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.mrdate && <p className="text-red-500 text-sm mt-1">{errors.mrdate}</p>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                className={`${sharedClasses.border} ${errors.mrrequireddate ? 'border-red-500' : ''}`}
                name="mrrequireddate"
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.mrrequireddate && <p className="text-red-500 text-sm mt-1">{errors.mrrequireddate}</p>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Warehouse</label>
              <Select
                options={warehouseOptions}
                value={selectedWarehouse}
                onChange={(selected) => {
                  setSelectedWarehouse(selected);
                  setSelectedChildOrganization(null);
                }}
                isDisabled={!!selectedChildOrganization}
                isClearable={true}
                menuPortalTarget={document.body}
                styles={theme === "dark" ? darkStyles : lightStyles}
              />
              {errors.selectedWarehouse && <p className="text-red-500 text-sm mt-1">{errors.selectedWarehouse}</p>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">External Vendor</label>
              <Select
                options={[
                  ...childOrganizations,
                  { value: 'add-external', label: 'Add External' }
                ]}
                value={selectedChildOrganization}
                onChange={(selected) => {
                  if (selected && selected.value === 'add-external') {
                    router.push("/station/Externalwarehouse/AddExternalWarehouse");
                  } else {
                    setSelectedChildOrganization(selected);
                    setSelectedWarehouse(null);
                  }
                }}
                isDisabled={!!selectedWarehouse}
                components={{ Option: CustomOption }}
                placeholder="Select External Vendor"
                isClearable={true}
                className={`z-5 text-black`}
                menuPortalTarget={document.body}
                styles={theme === "dark" ? darkStyles : lightStyles}
              />
              {errors.selectedChildOrganization && <p className="text-red-500 text-sm mt-1">{errors.selectedChildOrganization}</p>}
            </div>
          </div>

          <h3 className="text-xl font-bold text-orange-500 mb-4 border-b pb-2">
            Requested Items
          </h3>

          {items.map((item, index) => (
            <div key={index} className="mb-8 bg-gray-50 dark:bg-zinc-600 rounded-lg p-4 relative">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h4 className="text-lg font-medium text-orange-500">Item {index + 1}</h4>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Product</label>
                  <Select
                    options={productList}
                    value={item.selectedProductId}
                    onChange={(selectedOption) => {
                      const updatedItems = [...items];
                      updatedItems[index].selectedProductId = selectedOption;
                      if (selectedOption && selectedOption.attributes) {
                        updatedItems[index].selectedAttributes = selectedOption.attributes.map(attr => ({
                          attributeId: attr.id,
                          attributeName: attr.name,
                          attributeValue: null
                        }));
                      } else {
                        updatedItems[index].selectedAttributes = [];
                      }
                      setItems(updatedItems);
                    }}
                    className={`z-5 ${errors[`items[${index}].selectedProductId`] ? 'border-red-500' : ''}`}
                    menuPortalTarget={document.body}
                    styles={theme === "dark" ? darkStyles : lightStyles}
                  />
                  {errors[`items[${index}].selectedProductId`] && 
                    <p className="text-red-500 text-sm mt-1">{errors[`items[${index}].selectedProductId`]}</p>
                  }
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="text"
                    value={item.quantities}
                    onChange={(e) => {
                      const updatedItems = [...items];
                      updatedItems[index].quantities = e.target.value.replace(/[^0-9]/g, "");
                      setItems(updatedItems);
                    }}
                    className={`w-full border rounded p-2 ${errors[`items[${index}].quantities`] ? 'border-red-500' : ''}`}
                    placeholder="Enter quantity"
                  />
                  {errors[`items[${index}].quantities`] && 
                    <p className="text-red-500 text-sm mt-1">{getShortErrorMessage(errors[`items[${index}].quantities`])}</p>
                  }
                </div>
              </div>

              {item.selectedAttributes.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Product Attributes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.selectedAttributes.map((attr, attrIndex) => (
                      <div key={attrIndex} className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={attr.attributeName || ''}
                            disabled
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded border"
                          />
                        </div>
                        <div className="flex-1">
                          <Select
                            options={item.selectedProductId?.attributes.find(a => a.id === attr.attributeId)?.values || []}
                            value={attr.attributeValue}
                            onChange={(selectedOption) => handleAttributeValueChange(index, attrIndex, selectedOption)}
                            className={`${errors[`items[${index}].selectedAttributes[${attrIndex}].attributeValue`] ? 'border-red-500' : ''}`}
                            menuPortalTarget={document.body}
                            styles={theme === "dark" ? darkStyles : lightStyles}
                            isDisabled={!item.selectedProductId}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            onClick={handleAddItem}
          >
            <span>+</span> Add Another Item
          </button>
        </div>

        {/* Preview Section */}
        {items.some(item => item.selectedProductId) && (
          <div className="bg-white dark:bg-zinc-700 rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-orange-500 mb-4 border-b pb-2">
              Requisition Preview
            </h3>
            
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Requisition Date:</p>
                  <p className="text-lg">{formData.mrdate || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Due Date:</p>
                  <p className="text-lg">{formData.mrrequireddate || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Warehouse:</p>
                  <p className="text-lg">{selectedWarehouse?.label || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">External Vendor:</p>
                  <p className="text-lg">{selectedChildOrganization?.label || 'Not selected'}</p>
                </div>
              </div>

              <div className="border-t border-b py-4 my-4">
                <h4 className="text-lg font-medium mb-3">Selected Items</h4>
                {items.map((item, index) => (
                  item.selectedProductId && (
                    <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-zinc-600 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium">Item {index + 1}: {item.selectedProductId.label}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Quantity: {item.quantities} {item.selectedProductId.itemuom}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Unit Price: {item.selectedProductId.price}
                          </p>
                        </div>
                        <p className="font-medium">
                          Total: {(item.selectedProductId.price * (parseFloat(item.quantities) || 0)).toFixed(2)}
                        </p>
                      </div>
                      
                      {item.selectedAttributes.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-orange-200">
                          <p className="text-sm font-medium mb-1">Selected Attributes:</p>
                          {item.selectedAttributes.map((attr, attrIndex) => (
                            <p key={attrIndex} className="text-sm text-gray-600 dark:text-gray-300">
                              {attr.attributeName}: {attr.attributeValue?.label || 'Not selected'}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>

              <div className="flex justify-between items-center text-lg font-medium">
                <span>Total Amount:</span>
                <span>{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/station/Purchase/Requistion">
            <Button className="bg-gray-500 hover:bg-gray-600 text-white transition-colors">Cancel</Button>
          </Link>
          <Button 
            onClick={handleSave} 
            className="bg-orange-500 hover:bg-orange-600 text-white transition-colors"
          >
            Save Requisition
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRequisition;