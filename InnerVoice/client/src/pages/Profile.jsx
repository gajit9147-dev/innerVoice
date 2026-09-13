import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AvatarUpload from "../components/profile/AvatarUpload";
import ProfileForm from "../components/profile/ProfileForm";
import ProfileStats from "../components/profile/ProfileStats";
import ChangePasswordCard from "../components/profile/ChangePasswordCard";
import ExportBackupCard from "../components/profile/ExportBackupCard";
import DangerZoneCard from "../components/profile/DangerZoneCard";
import { UserCog, Loader2, SquarePen } from "lucide-react";
import { getProfileInfo } from "../api/profile";
import VaultPinCard from "../components/profile/VaultPinCard";

function Profile() {
  const navigate = useNavigate();

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
      <div className="max-w-7xl mx-auto py-6 animate-fade-scale">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <UserCog className="text-[#e2b17a]" size={30} />
            <h1 className="font-serif text-3xl font-normal text-[#f5f2eb]">
              Profile Settings
            </h1>
          </div>

          <button
            onClick={() => navigate("/profile/edit")}
            className="btn-champagne flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
          >
            <SquarePen size={17} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {/* Column 1: Identity & Stats */}
          <div className="space-y-8">
            <AvatarUpload user={profileData} onUploadSuccess={fetchProfile} />
            <ProfileStats
              stats={profileData?.stats}
              createdAt={profileData?.created_at}
            />
          </div>

          {/* Column 2: Personal Information & Vault PIN */}
          <div className="space-y-8">
            <ProfileForm user={profileData} onUpdate={fetchProfile} />
            <VaultPinCard />
          </div>

          {/* Column 3: Security, Export, & Deletion */}
          <div className="space-y-8">
            <ChangePasswordCard />
            <ExportBackupCard />
            <DangerZoneCard />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
