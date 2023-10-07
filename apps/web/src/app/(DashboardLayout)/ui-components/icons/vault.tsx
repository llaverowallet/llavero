// icon:vault | Fontawesome https://fontawesome.com/ | Fontawesome
import * as React from "react";

function Vault(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 576 512"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M64 0C28.7 0 0 28.7 0 64v352c0 35.3 28.7 64 64 64h16l16 32h64l16-32h224l16 32h64l16-32h16c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zm160 320c44.2 0 80-35.8 80-80s-35.8-80-80-80-80 35.8-80 80 35.8 80 80 80zm0 80c-88.4 0-160-71.6-160-160S135.6 80 224 80s160 71.6 160 160-71.6 160-160 160zm256-178.7V336c0 8.8-7.2 16-16 16s-16-7.2-16-16V221.3c-18.6-6.6-32-24.4-32-45.3 0-26.5 21.5-48 48-48s48 21.5 48 48c0 20.9-13.4 38.7-32 45.3z" />
    </svg>
  );
}

export default Vault;
