// Supabase configuration and image URL utilities
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fkpimtcxncgwtdsfyrjb.supabase.co"

// Bucket names for different types of images
const BUCKETS = {
  PRODUCTS: "products",
  SUCCESS_STORIES: "success-stories", 
  PET_IMAGES: "pet-images",
  PROFILE_PICTURES: "profile-pictures",
  MESSAGES: "messages"
}

// Get product image URL
export const getProductImageUrl = (imageName) => {
  if (!imageName) return "https://via.placeholder.com/400x300?text=Product+Image"
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKETS.PRODUCTS}/${imageName}`
}

// Get success story image URL
export const getSuccessStoryImageUrl = (imageName) => {
  if (!imageName) return "https://via.placeholder.com/400x300?text=Pet+Love"
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKETS.SUCCESS_STORIES}/${imageName}`
}

// Get pet image URL
export const getPetImageUrl = (imageName) => {
  if (!imageName) return "https://via.placeholder.com/400x300?text=Pet+Image"
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKETS.PET_IMAGES}/${imageName}`
}

// Get profile picture URL
export const getProfileImageUrl = (imageName) => {
  if (!imageName) return "https://via.placeholder.com/150x150?text=Profile"
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKETS.PROFILE_PICTURES}/${imageName}`
}

// Get message image URL
export const getMessageImageUrl = (imageName) => {
  if (!imageName) return "https://via.placeholder.com/300x200?text=Message+Image"
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKETS.MESSAGES}/${imageName}`
}

// Generic function to get image URL by bucket
export const getImageUrl = (imageName, bucket) => {
  if (!imageName) return "https://via.placeholder.com/400x300?text=Image"
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${imageName}`
}

// Export configuration for use in other files
export { SUPABASE_URL, BUCKETS }
