
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
  StationLogo,
  HomeDash,
  CataLog,
  Sales,
  Purchase,
  CustomerInq,
  Portal,
  AuditLog,
  Report
  
} from "@/components/svg";
import { Airplay, ClipboardList, FileBarChart2, Home, HomeIcon, MailQuestion, ShoppingBag, ShoppingCart, Store } from "lucide-react";
// import { DashBoard } from "@/components/svg";

 const baseMenus = {
  mainNav: [
    
    {
      title: "Dashboard",
      icon: HomeDash,
      href: "/station/stationdashboard",
    },
    {
      title: "station",
      icon: StationLogo,
      href: "#",
      child: [
        {
          title: "Staff",
          href: "/station/station/staff",
          icon: Graph,
        },
        {
          title: "Document",
          href: "/station/station/document",
          icon: Cart,
        },
        {
          title: "Customer ",
          href: "/station/station/customer",
          icon: ClipBoard,
        },
        {
          title: "External Vendor",
          href: "/station/station/Externalwarehouse",
          icon: Graph,
        }
      ]
    },
    {
      title: "Catalogs",
      icon: CataLog,
      href: "/Catalogue",
      child: [
        {
          title: "Products",
          href: "/station/Catalogue/Products",
          icon: Graph,
        },

        {
          title: "Categories",
          href: "/station/Catalogue/Categories",
          icon: Cart,
        },
        {
          title: "Document",
          href: "/station/Catalogue/Document",
          icon: ClipBoard,
        },
        // {
        //   title: "Requests",
        //   href: "/station/Catalogue/Requests",
        //   icon: ClipBoard,
        // }
      ]
    },
    {
      title: "Sales",
      icon: Sales,
      href: "#",
      child: [
        {
          title: "Order",
          href: "/station/sales/order",
          icon: Graph,
        },
        {
          title: "Delivery",
          href: "/station/sales/delievery",
          icon: Cart,
        },
        {
          title: "Return",
          href: "/station/sales/return",
          icon: ClipBoard,
        }
      ]
    },
    {
      title: "Purchase",
      icon: Purchase,
      href: "#",
      child: [
        {
          title: "Requisition",
          href: "/station/Purchase/Requistion",
          icon: Graph,
        },

        {
          title: "PO",
          href: "/station/Purchase/po",
          icon: Cart,
        },
        {
          title: "Delivery",
          href: "/station/Purchase/delievery",
          icon: ClipBoard,
        },
        {
          title: "Returns",
          href: "/station/Purchase/returns",
          icon: ClipBoard,
        }
      ]

    }, {
      title: "Customer Inquiry",
      icon: CustomerInq,
      href: "/station/Customer_Inquiry",

    },
    {
      title: "Portals",
      icon: Portal,
      href: "#",
      child: [
        {
          title: "Banner",
          href: "/station/portals/Banner",
          icon: Graph,
        },
        {
          title: "Offer & Discount",
          href: "/station/portals/offerDiscount",
          icon: Cart,
        },
        {
          title: "Portal Setting",
          href: "/station/portals/portal_setting",
          icon: ClipBoard,
        },
        {
          title: "Vendor Profile",
          href: "/station/portals/vendorprofile",
          icon: ClipBoard,
        },
        {
          title: "Carousels",
          href: "/station/portals/carousels",
          icon: ClipBoard,
        }
      ]
    },
    {
      title: "Audit logs",
      icon: AuditLog,
      href: "/station/auditlogs",

    },
    {
      title: "Reports",
      icon: Report,
      href: "/station/reports",
    }


  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: Home,
        href: "/dashboardpage",
      },
      {
        title: "Dashboard",
        icon: HomeDash,
        href: "/station/stationdashboard",
      },
      {
        title: "station",
        icon: StationLogo,
        href: "#",
        child: [
          {
            title: "Staff",
            href: "/station/station/staff",
            icon: Graph,
          },
          {
            title: "Document",
            href: "/station/station/document",
            icon: Cart,
          },
          {
            title: "Customer ",
            href: "/station/station/customer",
            icon: ClipBoard,
          },
          {
            title: "External Vendor",
            href: "/station/station/Externalwarehouse",
            icon: Graph,
          }
        ]
      },
      {
        title: "Catalogs",
        icon: CataLog,
        href: "/Catalogue",
        child: [
          {
            title: "Products",
            href: "/station/Catalogue/Products",
            icon: Graph,
          },

          {
            title: "Categories",
            href: "/station/Catalogue/Categories",
            icon: Cart,
          },
          {
            title: "Document",
            href: "/station/Catalogue/Document",
            icon: ClipBoard,
          },
          // {
          //   title: "Requests",
          //   href: "/station/Catalogue/Requests",
          //   icon: ClipBoard,
          // }
        ]
      },
      {
        title: "Sales",
        icon: Sales,
        href: "#",
        child: [
          {
            title: "Order",
            href: "/station/sales/order",
            icon: Graph,
          },
          {
            title: "Delivery",
            href: "/station/sales/delievery",
            icon: Cart,
          },
          {
            title: "Return",
            href: "/station/sales/return",
            icon: ClipBoard,
          }
        ]
      },
      {
        title: "Purchase",
        icon: Purchase,
        href: "#",
        child: [
          {
            title: "Requisition",
            href: "/station/Purchase/Requistion",
            icon: Graph,
          },

          {
            title: "PO",
            href: "/station/Purchase/po",
            icon: Cart,
          },
          {
            title: "Delivery",
            href: "/station/Purchase/delievery",
            icon: ClipBoard,
          },
          {
            title: "Returns",
            href: "/station/Purchase/returns",
            icon: ClipBoard,
          }
        ]

      }, {
        title: "Customer Inquiry",
        icon: CustomerInq,
        href: "/station/Customer_Inquiry",

      },
      {
        title: "Portals",
        icon: Portal,
        href: "#",
        child: [
          {
            title: "Banner",
            href: "/station/portals/Banner",
            icon: Graph,
          },
          {
            title: "Offer & Discount",
            href: "/station/portals/offerDiscount",
            icon: Cart,
          },
          {
            title: "Portal Setting",
            href: "/station/portals/portal_setting",
            icon: ClipBoard,
          },
          {
            title: "Vendor Profile",
            href: "/station/portals/vendorprofile",
            icon: ClipBoard,
          },
          {
            title: "Carousels",
            href: "/station/portals/carousels",
            icon: ClipBoard,
          }
        ]
      },
      {
        title: "Audit logs",
        icon: AuditLog,
        href: "/station/auditlogs",

      },
      {
        title: "Reports",
        icon: Report,
        href: "/station/reports",
      }
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: HomeDash,
        href: "/station/stationdashboard",
      },
      {
        title: "station",
        icon: StationLogo,
        href: "#",
        child: [
          {
            title: "Staff",
            href: "/station/station/staff",
            icon: Graph,
          },
          {
            title: "Document",
            href: "/station/station/document",
            icon: Cart,
          },
          {
            title: "Customer ",
            href: "/station/station/customer",
            icon: ClipBoard,
          },
          {
            title: "External Vendor",
            href: "/station/station/Externalwarehouse",
            icon: Graph,
          }
        ]
      },
      {
        title: "Catalogs",
        icon: CataLog,
        href: "/Catalogue",
        child: [
          {
            title: "Products",
            href: "/station/Catalogue/Products",
            icon: Graph,
          },
          
          {
            title: "Categories",
            href: "/station/Catalogue/Categories",
            icon: Cart,
          },
          {
            title: "Document",
            href: "/station/Catalogue/Document",
            icon: ClipBoard,
          },
          // {
          //   title: "Requests",
          //   href: "/station/Catalogue/Requests",
          //   icon: ClipBoard,
          // }
        ]
      },
      {
        title: "Sales",
        icon: Sales,
        href: "#",
        child: [
          {
            title: "Order",
            href: "/station/sales/order",
            icon: Graph,
          },
          {
            title: "Delivery",
            href: "/station/sales/delievery",
            icon: Cart,
          },
          {
            title: "Return",
            href: "/station/sales/return",
            icon: ClipBoard,
          }
        ]
      },
      {
        title: "Purchase",
        icon: Purchase,
        href: "#",
        child: [
          {
            title: "Requisition",
            href: "/station/Purchase/Requistion",
            icon: Graph,
          },
          
          {
            title: "PO",
            href: "/station/Purchase/po",
            icon: Cart,
          },
          {
            title: "Delivery",
            href: "/station/Purchase/delievery",
            icon: ClipBoard,
          },
          {
            title: "Returns",
            href: "/station/Purchase/returns",
            icon: ClipBoard,
          }
        ]
        
      },{
        title: "Customer Inquiry",
        icon: CustomerInq,
        href: "/station/Customer_Inquiry",
        
      },
      {
        title: "Portals",
        icon: Portal,
        href: "#",
        child: [
          {
            title: "Banner",
            href: "/station/portals/Banner",
            icon: Graph,
          },
          {
            title: "Offer & Discount",
            href: "/station/portals/offerDiscount",
            icon: Cart,
          },
          {
            title: "Portal Setting",
            href: "/station/portals/portal_setting",
            icon: ClipBoard,
          },
          {
            title: "Vendor Profile",
            href: "/station/portals/vendorprofile",
            icon: ClipBoard,
          },
          {
            title: "Carousels",
            href: "/station/portals/carousels",
            icon: ClipBoard,
          }
        ]
      },
      {
        title: "Audit logs",
        icon: AuditLog,
        href: "/station/auditlogs",
        
      },
      {
        title: "Reports",
        icon: Report,
        href: "/station/reports",
      }

      
    ],
    

  },
};




baseMenus.sidebarNav.modern = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboardpage",
  },
  ...baseMenus.mainNav,
];

baseMenus.sidebarNav.classic = [
  { isHeader: true, title: "menu" },
  ...baseMenus.mainNav,
];

let cachedMenus = null;

const getUserRoleType = () => {
  if (typeof window !== "undefined") {
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    return userData?.roletypeid || null;
  }
  return null;
};

const filterMenus = (menus, roletypeid) => {
  return menus
    .filter(item => roletypeid == 5 || item.title != "Portals")
    .map(item => ({
      ...item,
      child: item.child ? filterMenus(item.child, roletypeid) : undefined,
    }));
};

const buildMenus = () => {
  const roletypeid = getUserRoleType();

  return {
    mainNav: filterMenus(baseMenus.mainNav, roletypeid),
    sidebarNav: {
      modern: filterMenus([
        { title: "Dashboard", icon: Home, href: "/dashboardpage" },
        ...baseMenus.mainNav,
      ], roletypeid),
      classic: filterMenus([
        { isHeader: true, title: "menu" },
        ...baseMenus.mainNav,
      ], roletypeid),
    },
  };
};

// 👇 Export object with a getter — will refresh after reload
export const Stationmenus = new Proxy({}, {
  get: (_, prop) => {
    if (cachedMenus == null && typeof window != "undefined") {
      cachedMenus = buildMenus();
    }
    return cachedMenus?.[prop];
  },
});
