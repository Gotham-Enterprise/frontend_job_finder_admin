import { UserIcon, PencilIcon, InfoIcon } from "@/icons";

export const profileDropdownItems = [
  {
    label: "Edit profile",
    href: "/profile",
    Icon: UserIcon,
  },
  {
    label: "Account settings", 
    href: "/",
    Icon: PencilIcon,
  },
  {
    label: "Support",
    href: "#", 
    Icon: InfoIcon,
  },
];