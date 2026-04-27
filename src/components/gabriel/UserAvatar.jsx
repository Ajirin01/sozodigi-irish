import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { defaultUser } from '../../assets';

/**
 * UserAvatar Component
 * A resilient image component that handles broken links and missing profile images.
 * @param {Object} user - The user object containing profileImage
 * @param {string} className - Tailwind classes for the wrapper (must include height/width)
 * @param {string} rounded - Tailwind class for rounding (default: rounded-full)
 * @param {string} border - Tailwind class for border (default: border-2 border-white)
 * @param {string} imgClassName - Additional classes for the internal Image
 * @param {number} width - Base width for Next.js Image optimization
 * @param {number} height - Base height for Next.js Image optimization
 */
const UserAvatar = ({ 
  user, 
  className = "h-8 w-8", 
  rounded = "rounded-full",
  border = "border-2 border-white",
  imgClassName = "",
  width = 300, 
  height = 300, 
  crossOrigin = true 
}) => {
  const [imgError, setImgError] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_NODE_BASE_URL || "";

  useEffect(() => {
    setImgError(false);
  }, [user?.profileImage]);

  const getSource = () => {
    if (imgError || !user?.profileImage) {
      return defaultUser?.src || defaultUser;
    }
    if (user.profileImage.startsWith('http')) return user.profileImage;
    return `${apiUrl}${user.profileImage}`;
  };

  return (
    <div className={`${className} ${rounded} ${border} overflow-hidden shadow-sm relative shrink-0`}>
      <Image
        src={getSource()}
        alt={user?.firstName || "User"}
        width={width}
        height={height}
        onError={() => setImgError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${imgClassName}`}
        crossOrigin={crossOrigin ? "anonymous" : undefined}
      />
    </div>
  );
};

export default UserAvatar;
