import Layout from "../components/layout/Layout";
import AvatarUpload from "../components/profile/AvatarUpload";
import ProfileForm from "../components/profile/ProfileForm";
import ProfileStats from "../components/profile/ProfileStats";
import { UserCog } from "lucide-react";

function Profile() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-6 animate-fade-scale">
        <div className="flex items-center gap-3 mb-8">
          <UserCog className="text-blue-600 dark:text-blue-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Profile Settings
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar and Stats */}
          <div className="lg:col-span-1 space-y-8">
            <AvatarUpload />
            <ProfileStats />
          </div>

          {/* Right Column: Profile Form */}
          <div className="lg:col-span-2">
            <ProfileForm />
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default Profile;