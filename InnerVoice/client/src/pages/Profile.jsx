import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import AvatarUpload from "../components/profile/AvatarUpload";
import ProfileForm from "../components/profile/ProfileForm";
import ProfileStats from "../components/profile/ProfileStats";
import { UserCog, Loader2 } from "lucide-react";
import { getProfileInfo } from "../api/profile";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await getProfileInfo();
      setProfileData(res.data.profile);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      </Layout>
    );
  }

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
            <AvatarUpload
              user={profileData}
              onUploadSuccess={fetchProfile}
            />
            <ProfileStats stats={profileData?.stats} createdAt={profileData?.created_at} />
          </div>

          {/* Right Column: Profile Form */}
          <div className="lg:col-span-2">
            <ProfileForm user={profileData} onUpdate={fetchProfile} />
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default Profile;