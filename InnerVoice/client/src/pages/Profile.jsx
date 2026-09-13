import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import AvatarUpload from "../components/profile/AvatarUpload";
import ProfileForm from "../components/profile/ProfileForm";
import ProfileStats from "../components/profile/ProfileStats";
import ChangePasswordCard from "../components/profile/ChangePasswordCard";
import ExportBackupCard from "../components/profile/ExportBackupCard";
import DangerZoneCard from "../components/profile/DangerZoneCard";
import VaultPinCard from "../components/profile/VaultPinCard";
import { Settings, Loader2, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { getProfileInfo } from "../api/profile";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedSecurity, setShowAdvancedSecurity] = useState(false);

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
      <Layout headerSubtitle="Every thought you save, builds a better you.">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-[#e2b17a]" size={42} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerSubtitle="Every thought you save, builds a better you.">
      <div className="max-w-7xl mx-auto py-2 sm:py-4 animate-fade-scale">
        {/* =============================================
            PROFILE SETTINGS HEADER
            [ glowing amber settings icon ] Profile Settings
            Manage your account and personalize your InnerVoice experience.
           ============================================= */}
        <div className="flex items-center gap-3.5 mb-7 sm:mb-9 select-none">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#d8b27a]/15 border border-[#d8b27a]/35 flex items-center justify-center shadow-[0_0_24px_rgba(216,178,122,0.22)] text-[#e2b17a] shrink-0">
            <Settings size={22} className="text-[#e2b17a]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#f5f2eb] font-normal tracking-tight">
              Profile Settings
            </h1>
            <p className="text-xs sm:text-sm text-[#9e9990] mt-0.5 font-sans">
              Manage your account and personalize your InnerVoice experience.
            </p>
          </div>
        </div>

        {/* =============================================
            3-COLUMN RESPONSIVE GRID
            Left (~30%): Your Profile + Account Statistics
            Center (~34%): Personal Information
            Right (~36%): Change Password + Export & Backup
            Mobile order:
            1: Your Profile
            2: Personal Information
            3: Change Password
            4: Account Statistics
            5: Export & Backup
           ============================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
          {/* Card 1: Your Profile (Col 1 Top, Mobile Order 1) */}
          <div className="order-1 md:order-1 lg:col-start-1 lg:col-span-4 lg:row-start-1">
            <AvatarUpload user={profileData} onUploadSuccess={fetchProfile} />
          </div>

          {/* Card 2: Account Statistics (Col 1 Bottom, Mobile Order 4) */}
          <div className="order-4 md:order-4 lg:order-2 lg:col-start-1 lg:col-span-4 lg:row-start-2">
            <ProfileStats
              stats={profileData?.stats}
              createdAt={profileData?.created_at}
            />
          </div>

          {/* Card 3: Personal Information (Col 2 Center, Mobile Order 2) */}
          <div className="order-2 md:order-2 lg:order-3 lg:col-start-5 lg:col-span-4 lg:row-start-1 lg:row-span-2">
            <ProfileForm user={profileData} onUpdate={fetchProfile} />
          </div>

          {/* Card 4: Change Password (Col 3 Top, Mobile Order 3) */}
          <div className="order-3 md:order-3 lg:order-4 lg:col-start-9 lg:col-span-4 lg:row-start-1">
            <ChangePasswordCard />
          </div>

          {/* Card 5: Export & Backup (Col 3 Bottom, Mobile Order 5) */}
          <div className="order-5 md:order-5 lg:order-5 lg:col-start-9 lg:col-span-4 lg:row-start-2">
            <ExportBackupCard />
          </div>
        </div>

        {/* =============================================
            ADDITIONAL VAULT & ACCOUNT CONTROLS (COLLAPSIBLE)
            Preserves Vault PIN and Account Deletion
           ============================================= */}
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowAdvancedSecurity(!showAdvancedSecurity)}
            className="flex items-center gap-2 text-xs font-medium text-[#9e9990] hover:text-[#f5f2eb] transition cursor-pointer select-none py-1.5"
          >
            <ShieldCheck size={16} className="text-[#e2b17a]" />
            <span>Advanced Security & Vault Options</span>
            {showAdvancedSecurity ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvancedSecurity && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 animate-fade-scale">
              <VaultPinCard />
              <DangerZoneCard />
            </div>
          )}
        </div>

        {/* =============================================
            BOTTOM EMOTIONAL DIVIDER MESSAGE
            ──────────── ♥ Your thoughts matter. Keep going. ────────────
           ============================================= */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 py-10 sm:py-14 select-none">
          <div className="h-px bg-white/[0.08] flex-1 max-w-[90px] sm:max-w-xs" />
          <div className="flex items-center gap-2 text-xs sm:text-sm font-serif italic text-[#9e9990]">
            <span className="text-[#e2b17a]">♥</span>
            <span>Your thoughts matter. Keep going.</span>
          </div>
          <div className="h-px bg-white/[0.08] flex-1 max-w-[90px] sm:max-w-xs" />
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
