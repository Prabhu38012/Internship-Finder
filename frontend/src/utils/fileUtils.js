/**
 * Utility functions for handling file URLs
 */

// Backend base URL (without /api)
const BACKEND_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

/**
 * Converts a relative file path to an absolute URL pointing to the backend server
 * @param {string} path - Relative path like /uploads/file.pdf
 * @returns {string} - Absolute URL like http://localhost:5000/uploads/file.pdf
 */
export const getFileUrl = (path) => {
  if (!path) return "";

  // If already an absolute URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${BACKEND_URL}${cleanPath}`;
};

/**
 * Gets the resume download URL
 * @param {string} resumePath - Resume path from user profile or application
 * @returns {string} - Full download URL
 */
export const getResumeUrl = (resumePath) => {
  return getFileUrl(resumePath);
};

/**
 * Gets the avatar/image URL
 * @param {string} imagePath - Image path from profile
 * @returns {string} - Full image URL
 */
export const getImageUrl = (imagePath) => {
  return getFileUrl(imagePath);
};

export default {
  getFileUrl,
  getResumeUrl,
  getImageUrl,
};
