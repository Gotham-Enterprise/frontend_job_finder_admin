import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";

export default function ProfilePage() {
    return (
      <>
        <div className="mb-5">
            <UserMetaCard />
         </div>   
        <div className="mb-5">
        <UserInfoCard />
        </div>
        <div className="mb-5">
        <UserAddressCard />
        </div>
      

       
      </>
      
    );
}