import { UserIcon, PencilIcon, InfoIcon } from "@/icons";
import SettingsIcon from "../ui/icons/Settings";

export const profileDropdownItems = [
  {
    label: "Edit profile",
    href: "/admin/profile",
    Icon: PencilIcon,
  },
  {
    label: "Account settings", 
    href: "/",
    Icon: SettingsIcon,
  },
  {
    label: "Support",
    href: "#", 
    Icon: UserIcon,
  },
];