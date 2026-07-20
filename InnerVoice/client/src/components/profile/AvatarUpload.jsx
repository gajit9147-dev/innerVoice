import { useState, useEffect } from "react";
import { Camera, Upload, Trash2 } from "lucide-react";
import { uploadProfileImage } from "../../api/upload";

function AvatarUpload({ user, onUploadSuccess }) {
  const [avatar, setAvatar] = useState(user?.profile_image || null);
  
  useEffect(() => {
    setAvatar(user?.profile_image || null);
  }, [user]);

  const initials = user?.full_name
    ? user.full_name.substring(0, 2).toUpperCase()
    : "GU";

  const handleUploadClick = () => {
    document.getElementById("avatarInput").click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadProfileImage(formData);

      setAvatar(res.data.image);

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      alert("Profile image updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  const handleRemove = () => {
    setAvatar(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-slate-700 flex flex-col items-center">

      <input
        id="avatarInput"
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      <div className="relative group mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white">

          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}

        </div>

        <button
          onClick={handleUploadClick}
          className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
        >
          <Camera size={28} className="text-white" />
        </button>
      </div>

      <h2 className="text-2xl font-bold">
        {user?.full_name}
      </h2>

      <p className="text-gray-500 mb-6">
        Journaler
      </p>

      <div className="flex gap-3 w-full">

        <button
          onClick={handleUploadClick}
          className="flex-1 flex justify-center items-center gap-2 bg-blue-500 text-white rounded-xl py-2"
        >
          <Upload size={18} />
          Upload New
        </button>

        <button
          onClick={handleRemove}
          className="flex-1 flex justify-center items-center gap-2 bg-red-500 text-white rounded-xl py-2"
        >
          <Trash2 size={18} />
          Remove
        </button>

      </div>

    </div>
  );
}

export default AvatarUpload;