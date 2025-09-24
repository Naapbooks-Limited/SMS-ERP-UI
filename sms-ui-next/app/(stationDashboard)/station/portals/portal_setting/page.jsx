"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CallFor2 from '@/utilities/CallFor2';
import { toast as reToast } from "react-hot-toast";
// const checkboxInfoIcon = 'https://openui.fly.dev/openui/24x24.svg';
const commonClasses = 'flex items-center';
const buttonClasses = 'text-blue-500 hover:text-blue-700';
const saveButtonClasses = 'mt-6 bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded-lg';

const VendorshipConfiguration = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  
  const fetchConfig = async () => {
    try {
      // const response = await axios.get('/api/VendorShopAdminApi/Configure');

      const response = await CallFor2(
        `api/VendorShopAdminApi/Configure`,
        "get",
        null,
        "Auth"
    );

    
      setConfig(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load configuration');
      setLoading(false);
    }
  };

  const handleCheckboxChange = (key) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [key]: !prevConfig[key]
    }));
  };

  const handleSave = async () => {
    try {
     const response  =  await CallFor2('api/VendorShopAdminApi/Configure', "post", config,"Auth");
     
     if(response)
     {
      reToast.success('Configuration saved successfully');
     }
     else
     {
      
     }
    } catch (err) {
      reToast.error('Failed to save configuration');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6 bg-background rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Vendorship configuration</h2>
      <div className="space-y-4">
        <CheckboxWithInfo
          label="Enable carousel"
          id="EnableOCarousel"
          checked={config.EnableOCarousel}
          onChange={() => handleCheckboxChange('EnableOCarousel')}
        />
        <CheckboxWithInfo
          label="Enable slider"
          id="EnableSlider"
          checked={config.EnableSlider}
          onChange={() => handleCheckboxChange('EnableSlider')}
        />
        <CheckboxWithInfo
          label="Enable product tab"
          id="EnableProductTabs"
          checked={config.EnableProductTabs}
          onChange={() => handleCheckboxChange('EnableProductTabs')}
        />
        <CheckboxWithInfo
          label="Enable vendor campaign"
          id="EnableVendorShopCampaign"
          checked={config.EnableVendorShopCampaign}
          onChange={() => handleCheckboxChange('EnableVendorShopCampaign')}
        />
        <CheckboxWithInfo
          label="Enable custom CSS"
          id="EnableVendorCustomCss"
          checked={config.EnableVendorCustomCss}
          onChange={() => handleCheckboxChange('EnableVendorCustomCss')}
        />
      </div>
      <button className={saveButtonClasses} onClick={handleSave}>Save</button>
    </div>
  );
};

const CheckboxWithInfo = ({ label, id, checked, onChange }) => {
  return (
    <div className={commonClasses}>
      <input type="checkbox" id={id} className="mr-2" checked={checked} onChange={onChange} />
      <label htmlFor={id} className="flex-1">{label}</label>
      
    </div>
  );
};

export default VendorshipConfiguration;