import { useState } from "react";
import { Upload, Avatar } from "antd";
import { uploadProfilePicture } from "../supabaseClient";

function ProfileUpload({ user }) {
  const [imageUrl, setImageUrl] = useState(null);

  const handleUpload = async ({ file }) => {
    const { data, error } = await uploadProfilePicture(file, user.id);
    if (!error) setImageUrl(data.path);
  };

  return (
    <Upload customRequest={handleUpload} showUploadList={false}>
      <Avatar src={imageUrl ? `${supabase.storage.from("avatars").getPublicUrl(imageUrl)}` : null} size="large" />
    </Upload>
  );
}

export default ProfileUpload;
