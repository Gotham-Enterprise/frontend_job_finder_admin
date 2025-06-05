import { UserIcon, PencilIcon } from "@/icons";
import SettingsIcon from "../ui/icons/Settings";

export const profileDropdownItems = [
  // {
  //   label: "Edit profile",
  //   href: "/admin/profile",
  //   Icon: PencilIcon,
  // },
  {
    label: "Account settings", 
    href: "/admin/account-settings",
    Icon: SettingsIcon,
  },
  {
    label: "Support",
    href: "#", 
    Icon: UserIcon,
  },
];