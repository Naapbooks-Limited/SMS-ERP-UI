"use client"
import { 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  Package, 
  TrendingUp, 
  Tag, 
  ShoppingCart,
  FileText,
  Eye,
  Calendar,
  Target,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Report = () => {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({
    inventory: true,
    sales: true,
    category: false,
    orders: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const reportSections = [
    {
      id: 'inventory',
      title: 'Inventory Reports',
      icon: Package,
      color: 'blue',
      reports: [
        { name: 'Daily Stock', route: '/station/reports/getDailyStock', icon: Eye, description: 'View current stock levels' },
        { name: 'Daily Inventory', route: '/station/reports/getDailyInventory', icon: Calendar, description: 'Track inventory changes' },
        { name: 'Daily Dispatch', route: '/station/reports/getDailyDispatch', icon: TrendingUp, description: 'Monitor dispatch activities' },
        { name: 'Low Wastage', route: '/station/reports/lowWastage', icon: Target, description: 'Items with minimal waste' },
        { name: 'Top Wastage', route: '/station/reports/topWastage', icon: Activity, description: 'High wastage items' },
      ]
    },
    {
      id: 'sales',
      title: 'Sales Reports',
      icon: BarChart3,
      color: 'green',
      reports: [
        { name: 'Location Wise Sales', route: '/station/reports/locationWiseSales', icon: Target, description: 'Sales by location' },
        { name: 'Lowest Selling Day', route: '/station/reports/lowestSellingDay', icon: TrendingUp, description: 'Identify slow days' },
        { name: 'Highest Selling Day', route: '/station/reports/highestSellingDay', icon: Activity, description: 'Peak performance days' },
        { name: 'Product Wise Sale', route: '/station/reports/getProductWiseSale', icon: Package, description: 'Individual product sales' },
        // { name: 'Daily Sales Report', route: '/station/reports/getDailySalesReport', icon: Calendar, description: 'Comprehensive daily sales' },
        { name: 'Top Products', route: '/station/reports/getTopProducts', icon: TrendingUp, description: 'Best performing products' },
      ]
    },
    {
      id: 'category',
      title: 'Category Reports',
      icon: Tag,
      color: 'purple',
      reports: [
        { name: 'Low Category', route: '/station/reports/lowCategory', icon: Target, description: 'Underperforming categories' },
        { name: 'Top Category', route: '/station/reports/topCategory', icon: TrendingUp, description: 'Best selling categories' },
      ]
    },
    // {
    //   id: 'orders',
    //   title: 'Orders Reports',
    //   icon: ShoppingCart,
    //   color: 'orange',
    //   reports: [
    //     { name: 'Get Orders', route: '/station/reports/ordersReport', icon: FileText, description: 'View all orders' },
    //     { name: 'Get Orders Item', route: '/station/reports/getOrdersItem', icon: Package, description: 'Order item details' },
    //   ]
    // }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-100',
        card: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-950/30'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-950/20',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-100',
        card: 'border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:border-green-600 dark:hover:bg-green-950/30'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'text-purple-600 dark:text-purple-400',
        title: 'text-purple-900 dark:text-purple-100',
        card: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:border-purple-600 dark:hover:bg-purple-950/30'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'text-orange-600 dark:text-orange-400',
        title: 'text-orange-900 dark:text-orange-100',
        card: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:border-orange-600 dark:hover:bg-orange-950/30'
      }
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reports Dashboard
            </h1>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Generate and view comprehensive business reports
          </div>
        </div>

        {/* Report Sections */}
        <div className="space-y-6">
          {reportSections.map((section) => {
            const colors = getColorClasses(section.color);
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id];
            
            return (
              <div key={section.id} className={`rounded-xl border-2 ${colors.border} ${colors.bg} shadow-sm transition-all duration-200`}>
                {/* Section Header */}
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-opacity-80 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <Icon className={`h-6 w-6 ${colors.icon}`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-semibold ${colors.title}`}>
                        {section.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {section.reports.length} reports available
                      </p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                    {isExpanded ? (
                      <ChevronUp className={`h-5 w-5 ${colors.icon}`} />
                    ) : (
                      <ChevronDown className={`h-5 w-5 ${colors.icon}`} />
                    )}
                  </div>
                </div>

                {/* Report Cards */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {section.reports.map((report, index) => {
                        const ReportIcon = report.icon;
                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 bg-white dark:bg-gray-800 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-md ${colors.card}`}
                            onClick={() => router.push(report.route)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-md ${colors.bg} border ${colors.border} flex-shrink-0`}>
                                <ReportIcon className={`h-4 w-4 ${colors.icon}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 leading-tight">
                                  {report.name}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                  {report.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select any report above to view detailed analytics and insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;