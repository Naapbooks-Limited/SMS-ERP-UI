

import {
  Application,
  Chart,
  Components,
  DashBoard,
  Stacks2,
  Map,
  Grid,
  Files,
  Graph,
  ClipBoard,
  Cart,
  Envelope,
  Messages,
  Monitor,
  ListFill,
  Calendar,
  Flag,
  Book,
  Note,
  ClipBoard2,
  Note2,
  Note3,
  BarLeft,
  BarTop,
  ChartBar,
  PretentionChartLine,
  PretentionChartLine2,
  Google,
  Pointer,
  Map2,
  MenuBar,
  Icons,
  ChartArea,
  Building,
  Building2,
  Sheild,
  Error,
  Diamond,
  Heroicon,
  LucideIcon,
  CustomIcon,
  WareHouse,
  StationLogo,
  CataLog,
  Purchase,
  CustomerInq,
  AuditLog,
  Report,
  Portal,
  Sales,
  HomeDash,
  Employee,
  Ordring
} from "@/components/svg";
import Link from "next/link";
// import { DashBoard } from "@/components/svg";

export const Adminmenu = {
  mainNav: [
    {
      title: "Dashboard",
      icon: HomeDash,
      href: "/admin/admindashboard",
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: HomeDash,
        href: "/admin/admindashboard",
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: HomeDash,
        href: "/admin/admindashboard",
      },
      {
        title: "Employee",
        icon: Employee,
        href: "/admin/Employee",
      },
      {
        title: "Warehouses",
        icon: WareHouse,
        href: "/Warehouse",
        child: [
          {
            title: "List",
            href: "/admin/Warehouse/list",
            icon: Graph,
          },
          {
            title: "Staff",
            href: "/admin/Warehouse/staff",
            icon: Cart,
          },
          {
            title: "Documents",
            href: "/admin/Warehouse/document",
            icon: ClipBoard,
          },
        ],
      },
      {
        title: "station",
        icon: StationLogo,
        href: "/admin/station",
        child: [
          {
            title: "List",
            href: "/admin/station/list",
            icon: Graph,
          },
          {
            title: "Staff",
            href: "/admin/station/staff",
            icon: Graph,
          },
          {
            title: "Documents",
            href: "/admin/station/document",
            icon: Cart,
          },
          {
            title: "Customer ",
            href: "/admin/station/customer",
            icon: ClipBoard,
          },
          // {
          //   title: "Delivery Scheduling ",
          //   href: "/admin/station/delivery_schedule",
          //   icon: ClipBoard,
          // },
        ],
      },

      {
        title: "Catalogs",
        icon: CataLog,
        href: "#",
        child: [
          {
            title: "Product",
            href: "/admin/Catalogue/product",
            icon: Graph,
          },
          {
            title: "Categories",
            href: "/admin/Catalogue/Category",
            icon: Cart,
          },
          {
            title: "Document",
            href: "/admin/Catalogue/document",
            icon: ClipBoard,
          },
          {
            title: "Manufacturer",
            href: "/admin/Catalogue/Manufacturer",
            icon: ClipBoard,
          },
          {
            title: "Attribute",
            href: "/admin/Catalogue/Attribute",
            icon: ClipBoard,
          }
        ],
      },
      {
        title: "Ordering",
        icon: Ordring,
        href: "#",
        child: [
          {
            title: "Sales",
            href: "#",
            icon: Sales,
            multi_menu: [
              {
                title: "Order",
                icon: "heroicons:information-circle",
                href: "/admin/Ordering/sales/Orders",
              },
              {
                title: "Delivery",
                icon: "heroicons:information-circle",
                href: "/admin/Ordering/sales/delievery",
              },
              {
                title: "Returned",
                icon: "heroicons:information-circle",
                href: "/admin/Ordering/sales/Returned",
              },
            ],
          },
          {
            title: "Purchase",
            href: "/demo1",
            icon: Purchase,
            multi_menu: [
              {
                title: "Requisition",
                icon: "heroicons:information-circle",
                href: "/admin/Ordering/Purchase/Requistion",
              },
              {
                title: "PO",
                icon: "heroicons:information-circle",
                href: "/admin/Ordering/Purchase/po",
              },
              {
                title: "Delivery",
                icon: "heroicons:information-circle",
                href: "/admin/Ordering/Purchase/delivery",
              },
              {
                title: "Returns",
                icon: "heroicons:information-circle",
                href: "/admin/Ordering/Purchase/returns",
              },
            ],
          },
        ],
      },

      // {
      //   title: "Portal Content",
      //   icon: Portal,
      //   href: "/admin/Portal_content",
      // },
      {
        title: "Customer Inquiry",
        icon: CustomerInq,
        href: "/admin/Customer_Inquiry",
      },

      {
        title: "Audit logs",
        icon: AuditLog,
        href: "/admin/Audit_logs",
      },
      // {
      //   title: "Reports",
      //   icon: Report,
      //   href: "/admin/Report",
      // },
    ],
  },
};
