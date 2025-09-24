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
            attributeId: yup.number().nullable().required("Attribute is required"),
            attributeValue: yup.object().nullable().required("Attribute value is required")
          })
        ).min(1, "At least one attribute is required")
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
        selectedAttributes: [{ attributeId: null, attributeValue: null }] // Ensure this is initialized
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
      selectedAttributes: item.selectedAttributes
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
          mridetails: item.selectedAttributes.map(attr => ({
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
        seriesid: 1,
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

      if (response2.data.status) {
        reToast.success("Requisition saved successfully!");
        router.push("/admin/Ordering/Purchase/Requistion");
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

  return (
    <div className="p-6 bg-zinc-100 dark:bg-zinc-800 min-h-screen relative">
      <div className="max-w-7xl mx-auto rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-4 text-orange-500">
            Create Requisition
          </h2>
        </div>

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
            {errors.mrdate && <p className="text-red-500 text-xs mt-1">{errors.mrdate}</p>}
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
            {errors.mrrequireddate && <p className="text-red-500 text-xs mt-1">{errors.mrrequireddate}</p>}
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
            {errors.selectedWarehouse && <p className="text-red-500 text-xs mt-1">{errors.selectedWarehouse}</p>}
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
            {errors.selectedChildOrganization && <p className="text-red-500 text-xs mt-1">{errors.selectedChildOrganization}</p>}
          </div>
        </div>
        <h3 className="text-xl font-bold text-orange-500 mb-4">
          Requested Items
        </h3>
        <table className="w-full mb-6">
        <thead>
          <tr>
            <th className="text-left p-2">#</th>
            <th className="text-left p-2">Select Items</th>
            <th className="text-left p-2">Attributes</th>
            <th className="text-left p-2">Attribute Values</th>
            <th className="text-left p-2">Quantity</th>
            <th className="text-left p-2"></th>
          </tr>
        </thead>
        <tbody>
        {items.map((item, index) => (
    <React.Fragment key={index}>
      <tr>
        <td className="p-2">{index + 1}</td>
        <td className="p-2">
          <Select
            options={productList}
            value={item.selectedProductId}
            onChange={(selectedOption) => {
              const updatedItems = [...items];
              updatedItems[index].selectedProductId = selectedOption;
              updatedItems[index].selectedAttributes = [{ attributeId: null, attributeValue: null }];
              setItems(updatedItems);
            }}
            className={`z-5 text-black dark:bg-transparent w-full ${errors[`items[${index}].selectedProductId`] ? 'border-red-500' : ''}`}
            menuPortalTarget={document.body}
            styles={theme === "dark" ? darkStyles : lightStyles}
          />
        </td>
        <td className="p-2">
        {item.selectedAttributes.map((attr, attrIndex) => (
  <div key={attrIndex} className="flex items-center">
    <Select
      options={item.selectedProductId?.attributes
        .filter(a => !item.selectedAttributes.some((sa, i) => i !== attrIndex && sa.attributeId === a.id))
        .map(a => ({ value: a.id, label: a.name })) || []}
      value={attr.attributeId ? { value: attr.attributeId, label: attr.attributeName } : null}
      onChange={(selectedOption) => handleAttributeChange(index, attrIndex, selectedOption)}
      className={`z-5 text-black w-full mt-1 mr-2 ${errors[`items[${index}].selectedAttributes[${attrIndex}].attributeId`] ? 'border-red-500' : ''}`}
      menuPortalTarget={document.body}
      styles={theme === "dark" ? darkStyles : lightStyles}
      isDisabled={!item.selectedProductId}
    />
    {attrIndex > 0 && (
      <button
        onClick={() => handleRemoveAttribute(index, attrIndex)}
        className="bg-red-500 text-white px-2 py-1 rounded ml-2"
      >
        x
      </button>
    )}
  </div>
))}
        </td>
        <td className="p-2">
          {item.selectedAttributes.map((attr, attrIndex) => (
            <div key={attrIndex}>
              <Select
                options={item.selectedProductId?.attributes.find(a => a.id === attr.attributeId)?.values || []}
                value={attr.attributeValue}
                onChange={(selectedOption) => handleAttributeValueChange(index, attrIndex, selectedOption)}
                className={`z-5 text-black w-full mt-1 ${errors[`items[${index}].selectedAttributes[${attrIndex}].attributeValue`] ? 'border-red-500' : ''}`}
                menuPortalTarget={document.body}
                styles={theme === "dark" ? darkStyles : lightStyles}
                isDisabled={!item.selectedProductId || !attr.attributeId} // Disable if no product or attribute is selected
              />
            </div>
          ))}
        </td>
        <td className="p-2">
          <input
            type="number"
            value={item.quantities}
            onChange={(e) => {
              const updatedItems = [...items];
              updatedItems[index].quantities = e.target.value;
              setItems(updatedItems);
            }}
            className={`border p-2 w-36 ${errors[`items[${index}].quantities`] ? 'border-red-500' : ''}`}
            placeholder="Quantity"
          />
        </td>
        <td className="p-2">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => handleDeleteItem(item.id)}
          >
            Delete
          </button>
        </td>
      </tr>
      {/* Error messages below each input */}
      <tr>
        <td></td>
        <td>{errors[`items[${index}].selectedProductId`] && <p className="text-red-500 text-xs mt-1">{errors[`items[${index}].selectedProductId`]}</p>}</td>
        <td>
          {errors[`items[${index}].selectedAttributes`] && <p className="text-red-500 text-xs mt-1">{errors[`items[${index}].selectedAttributes`]}</p>}
          <button
            onClick={() => handleAddAttribute(index)}
            className="bg-green-500 text-white px-2 ml-2 py-1 rounded mt-2"
            disabled={item.selectedAttributes.length === item.selectedProductId?.attributes.length}
          >
            +
          </button>
        </td>
        <td>
          {item.selectedAttributes.map((attr, attrIndex) => (
            <div key={attrIndex}>
              {errors[`items[${index}].selectedAttributes[${attrIndex}].attributeValue`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`items[${index}].selectedAttributes[${attrIndex}].attributeValue`]}
                </p>
              )}
            </div>
          ))}
        </td>
        <td>
          {errors[`items[${index}].quantities`] && (
            <p className="text-red-500 text-xs mt-1">
              {getShortErrorMessage(errors[`items[${index}].quantities`])}
            </p>
          )}
        </td>
        <td></td>
      </tr>
    </React.Fragment>
  ))}
        </tbody>
      </table>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddItem}
        >
          Add Item
        </button>
      </div>

      <div className="flex justify-end mt-6">
        <Link href="/admin/Ordering/Purchase/Requistion/">
          <Button className="bg-blue-950 text-white mr-2">Cancel</Button>
        </Link>
        <Button onClick={handleSave} className="bg-orange-400 text-white">
          Save
        </Button>
      </div>
    </div>
  );
};

export default CreateRequisition;