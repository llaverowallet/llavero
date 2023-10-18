import React from "react";
import Menuitems from "./MenuItems";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";

const SidebarItems = ({ toggleMobileSidebar }: any) => {
  const pathname = usePathname();
  const pathDirect = pathname;
  
  return (
    <Box sx={{ px: 2 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {Menuitems.map((item) => {
          // {/********SubHeader**********/}
          // if (item.subheader) {
          //   return <NavGroup item={item} key={item.subheader} />;

          //   // {/********If Sub Menu**********/}
          //   /* eslint no-else-return: "off" */
          // } else {
            return (
              <span key={item.id}>
                {item}
                {item.id}
                {pathDirect}
                {toggleMobileSidebar}
                </span>
            );
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
