
  
  
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
  HomeDash,
  Sales,
  CataLog,
  AuditLog,
  Report,
  WareHouse
} from "@/components/svg";
// import { DashBoard } from "@/components/svg";

export const Warehousemenu = {
  mainNav: [
    {
      title: "Dashboard",
      icon: DashBoard,
      href: "/warehouse/warehousedashboard",
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/warehouse/warehousedashboard",
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
        href: "/warehouse/warehousedashboard",
      },
      {
        title: "Warehouses",
        icon: WareHouse,
        href: "#",
        child: [
          {
            title: "Staff",
            href: "/warehouse/warehouses/staff",
            icon: Graph,
          },
          {
            title: "Station",
            href: "/warehouse/warehouses/station",
            icon: Cart,
          },
          {
            title: "Documents ",
            href: "/warehouse/warehouses/document",
            icon: ClipBoard,
          },
        ],
      },
      {
        title: "Sales",
        icon: Sales,
        href: "#",
        child: [
          {
            title: "Quotation",
            href: "/warehouse/sales/quotation",
            icon: Graph,
          },
          {
            title: "SO",
            href: "/warehouse/sales/so",
            icon: Cart,
          },
          {
            title: "Delivery",
            href: "/warehouse/sales/delivery",
            icon: ClipBoard,
          },
          {
            title: "Returns",
            href: "/warehouse/sales/returns",
            icon: ClipBoard,
          },
        ],
      },
      ,
      {
        title: "Catalogs",
        icon: CataLog,
        href: "#",
        child: [
          {
            title: "Product",
            href: "/warehouse/Catalogue/Products",
            icon: Graph,
          },
          {
            title: "Categories",
            href: "/warehouse/Catalogue/Categories",
            icon: Cart,
          },
          {
            title: "Document",
            href: "/warehouse/Catalogue/Document",
            icon: ClipBoard,
          },
          // {
          //   title: "Requests",
          //   href: "/warehouse/Catalogue/Requests",
          //   icon: ClipBoard,
          // },
        ],
      },
      {
        title: "Audit logs",
        icon: AuditLog,
        href: "/warehouse/auditlogs",
      },
      // {
      //   title: "Reports",
      //   icon: Report,
      //   href: "/warehouse/reports",
      // },
    ],
  },
};
