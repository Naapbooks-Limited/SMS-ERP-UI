
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
} from "@/components/svg";
// import { DashBoard } from "@/components/svg";

export const menusConfig = {
  mainNav: [
    {
      title: "Dashboard",
      icon: DashBoard,
      href: "/",
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboardpage",
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/",
      },
      {
        title: "station",
        icon: DashBoard,
        href: "/demo1",
        child: [
          {
            title: "Staff",
            href: "/demo1",
            icon: Graph,
          },
          {
            title: "Document",
            href: "/ecommerce",
            icon: Cart,
          },
          {
            title: "Customer ",
            href: "/project",
            icon: ClipBoard,
          },
          {
            title: "Delivery Scheduling ",
            href: "/project",
            icon: ClipBoard,
          }
        ]
      },
      {
        title: "Catalogs",
        icon: DashBoard,
        href: "#",
        child: [
          {
            title: "Product",
            href: "/demo1",
            icon: Graph,
          },
          {
            title: "Categories",
            href: "#",
            icon: Cart,
          },
          {
            title: "Document",
            href: "#",
            icon: ClipBoard,
          },
          {
            title: "Request",
            href: "#",
            icon: ClipBoard,
          }
        ]
      },
      {
        title: "Sales",
        icon: DashBoard,
        href: "#",
        child: [
          {
            title: "Order",
            href: "/demo1",
            icon: Graph,
          },
          {
            title: "Delivery",
            href: "#",
            icon: Cart,
          },
          {
            title: "Return",
            href: "#",
            icon: ClipBoard,
          }
        ]
      },
      {
        title: "Purchase",
        icon: DashBoard,
        href: "#",
        
      },{
        title: "Customer Inquiry",
        icon: DashBoard,
        href: "#",
        
      },
      {
        title: "Portals",
        icon: DashBoard,
        href: "#",
        child: [
          {
            title: "Banner",
            href: "/demo1",
            icon: Graph,
          },
          {
            title: "Offer & Discount",
            href: "#",
            icon: Cart,
          },
          {
            title: "Portal Setting",
            href: "#",
            icon: ClipBoard,
          }
        ]
      },
      {
        title: "Audit logs",
        icon: DashBoard,
        href: "#",
        
      },
      {
        title: "Reports",
        icon: DashBoard,
        href: "#",
        
      }

      
    ],
    

  },
};
