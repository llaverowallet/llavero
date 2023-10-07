import {
  IconBoxMultiple, IconCircleDot, IconHome, IconInfoCircle, IconLayout, IconLayoutGrid, IconPhoto, IconPoint, IconStar, IconTable, IconUser
} from "@tabler/icons-react";

const Menuitems = [
  {
    id:"dashboard",
    title: "Dashboard",
    icon: IconHome,
    href: "/",
  },
  {
    id: "buttons",
    title: "Buttons",
    icon: IconCircleDot,
    href: "/ui-components/buttons",
  },
  {
    id: "forms",
    title: "Forms",
    icon: IconTable,
    href: "/ui-components/forms",
  },
  {
    id: "alerts",
    title: "Alerts",
    icon: IconInfoCircle,
    href: "/ui-components/alerts",
  },
  {
    id: "ratings",
    title: "Ratings",
    icon: IconStar,
    href: "/ui-components/ratings",
  },
  {
    id: "images",
    title: "Images",
    icon: IconPhoto,
    href: "/ui-components/images",
  },
  {
    id: "pagination",
    title: "Pagination",
    icon: IconUser,
    href: "/ui-components/pagination",
  },
  {
    id: "tables",
    title: "Tables",
    icon: IconLayoutGrid,
    href: "/ui-components/table",
  },
];

export default Menuitems;
