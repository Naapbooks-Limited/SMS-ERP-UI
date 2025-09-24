import Link from "next/link";
import React from "react";

const ProductForm = () => {
  return (
    <div className="container mx-auto p-4">
      <form className="space-y-16">
        <div className="dark:text-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Product</h2>
           
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Product Name</label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Aashirvaad Atta"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Short Description
            </label>
            <textarea
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Aashirvaad Superior MP Atta is Made with Love in India"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Full Description
            </label>
            <textarea
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Aashirvaad Superior MP Atta is made using the 4 step advantage process which ensures pure and natural whole wheat atta"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">SKU</label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Categories</label>
            <select className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Manufactures</label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Published</label>
            <input type="checkbox" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Product tags</label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              GTIN (global trade item number)
            </label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Manufacturer part number
            </label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Show on home page
            </label>
            <input type="checkbox" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Product type</label>
            <select className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Product template
            </label>
            <select className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Visible individually
            </label>
            <input type="checkbox" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Customer roles</label>
            <input
              type="text"
              className="w-1/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
            <h1 className="w-1/2 border border-black pl-2 rounded-sm dark:border-white">
              In order to use this functionality, you have to disable the
              following setting: Catalog settings Ignore ACL rules.
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Limited to stores
            </label>
            <input
              type="text"
              className="w-1/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
            <h1 className="w-1/2 border border-black pl-2 rounded-sm dark:border-white">
              In order to use this functionality, you have to disable the
              following setting: Catalog settings Ignore "limit per store"
              rules.
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Vendor</label>
            <select className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Require other products
            </label>
            <input type="checkbox" />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Allow customer reviews
            </label>
            <input type="checkbox" />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Available start date
            </label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Available end date
            </label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Mark as new</label>
            <input type="checkbox" />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Admin comment</label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Add more fields similarly */}
        </div>

        {/* //////PRICING/////////// */}

        <div className=" p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-2xl font-bold mb-4">Pricing</h2>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Price</label>
            <select className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Old price</label>
            <select className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Product cost</label>
            <select className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Disable buy button
            </label>
            <input type="checkbox" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Disable wishlist button
            </label>
            <input type="checkbox" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Available for pre-order
            </label>
            <input type="checkbox" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Call for price</label>
            <input type="checkbox" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Customer enters price
            </label>
            <input type="checkbox" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Pang V (base price) enabled
            </label>
            <input type="checkbox" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Discounts</label>
            <input
              type="number"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Tax exempt</label>
            <input type="checkbox" />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Tax category</label>
            <select className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300">
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Telecommunications, broadcasting and electronic services
            </label>
            <input type="checkbox" />
          </div>
          <div className="border-b-2 pb-2">Tier prices</div>
          <div>
            You need to save the product before you can add tier prices for this
            product page.
          </div>
        </div>

        {/* ///inventory// */}
        <div className="p-6 rounded-lg shadow-md space-y-4 mt-10">
          <h2 className="text-2xl font-bold mb-4">Inventory</h2>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Inventory Method
            </label>
            <input
              type="number"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Minimum Cart Quantity
            </label>
            <input
              type="number"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Maximum Cart Quantity
            </label>
            <input
              type="number"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Allowed Quantities
            </label>
            <input
              type="number"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Not returnable</label>
            <input type="checkbox" />
          </div>
        </div>

        <div className=" p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl  text-orange-500 font-bold mb-4">
            Multimedia
          </h2>
          admin.catalog.products.multimedia.savebeforeedit
        </div>

        <div className=" p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl  text-orange-500 font-bold mb-4">
            Product attributes
          </h2>
          <div>
            Product attributes are quantifiable or descriptive aspects of a
            product (such as, color). For example, if you were to create an
            attribute for color, with the values of blue, green, yellow, and so
            on, you may want to apply this attribute to shirts, which you sell
            in various colors (you can adjust a price or weight for any of
            existing attribute values). You can add attribute for your product
            using existing list of attributes, or if you need to create a new
            one go to Catalog Attributes Product attributes. Please notice that
            if you want to manage inventory by product attributes (e.g. 5 green
            shirts and 3 blue ones), then ensure that "Inventory method" is set
            to "Track inventory by product attributes"
          </div>
          <Link href={"/admin/Catalogue/product/addnewattribute"}>
            {" "}
            <button
              type="submit"
              className="mt-6 me-3  px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none "
            >
              Add a new attribute
            </button>{" "}
          </Link>
        </div>

        {/* 
        /////SEO//// */}
        <div className="p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-2xl font-bold mb-4">SEO</h2>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Search Engine Friendly Page Name
            </label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Meta Title</label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Meta Keywords</label>
            <input
              type="text"
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Meta Description
            </label>
            <textarea className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300" />
          </div>
        </div>
        <div className=" p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <Link href={"/admin/Catalogue/product"}>
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </Link>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
