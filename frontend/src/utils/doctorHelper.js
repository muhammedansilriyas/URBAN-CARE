// Helper utility for accurate Doctor photo resolution & relative URL formatting

const BACKEND_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

// SVG Data URI Neutral Doctor Avatar Placeholder
export const DEFAULT_DOCTOR_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%"><rect width="128" height="128" rx="24" fill="%23646E57"/><path d="M64 28a20 20 0 1 0 0 40 20 20 0 0 0 0-40zM36 96c0-15.467 12.533-28 28-28s28 12.533 28 28v4H36v-4z" fill="%23FFFFFF"/><path d="M58 42h12v12H58z" fill="%23646E57"/><path d="M64 36v24M52 48h24" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round"/></svg>`;

// Standard Doctor Photo Assets Map by Name Keywords
const DOCTOR_NAME_ASSET_MAP = [
  { keyword: 'anand', image: '/dr-anand-kumar.png' },
  { keyword: 'balaji', image: '/dr-balaji-srimurugan.png' },
  { keyword: 'anjali', image: '/dr-anjali-murali.png' },
  { keyword: 'aiswarya', image: '/dr-aiswarya-r-kamath.png' },
  { keyword: 'balu', image: '/dr-balu-vaidyanathan.png' },
  { keyword: 'saraf', image: '/dr-saraf-udit-umesh.png' },
  { keyword: 'udit', image: '/dr-saraf-udit-umesh.png' },
  { keyword: 'praveena', image: '/dr-praveena-n-b.png' },
  { keyword: 'rakesh', image: '/dr-rakesh-m-p.png' },
  { keyword: 'soumya', image: '/dr-soumya-jagadeesan.png' },
];

/**
 * Formats a raw image URL string.
 * Prepends backend base URL for relative upload paths (/uploads/...)
 * Preserves public static paths (/dr-...) and absolute URLs (http...)
 */
export const formatImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/dr-') || trimmed.startsWith('/assets') || trimmed.startsWith('/favicon')) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${BACKEND_BASE_URL}${cleanPath}`;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

/**
 * Gets the correct photo URL for a doctor or appointment object.
 * 1. Resolves populated doctorId.imageUrl or item.imageUrl
 * 2. Matches doctor name against standard doctor photo assets map
 * 3. Returns neutral doctor SVG avatar fallback if unresolvable
 */
export const getDoctorPhoto = (apptOrDoc) => {
  if (!apptOrDoc) return DEFAULT_DOCTOR_AVATAR;

  const doctorObj = apptOrDoc.doctorId && typeof apptOrDoc.doctorId === 'object' ? apptOrDoc.doctorId : apptOrDoc;
  const doctorName = (apptOrDoc.doctorName || doctorObj?.name || apptOrDoc.name || '').trim();
  const rawUrl = doctorObj?.imageUrl || apptOrDoc.imageUrl || doctorObj?.photo || apptOrDoc.photo;

  // 1. Try formatted URL from database
  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== '') {
    return formatImageUrl(rawUrl);
  }

  // 2. Try matching by doctor name keywords
  if (doctorName) {
    const lowerName = doctorName.toLowerCase();
    const match = DOCTOR_NAME_ASSET_MAP.find((item) => lowerName.includes(item.keyword));
    if (match) {
      return match.image;
    }
  }

  // 3. Fallback to clean neutral doctor avatar
  return DEFAULT_DOCTOR_AVATAR;
};

/**
 * Image error handler to prevent looping and replace failed src with doctor specific photo or neutral avatar.
 */
export const handleDoctorImageError = (e, doctorName = '') => {
  if (!e || !e.target) return;
  e.target.onerror = null; // Prevent infinite error loop

  if (doctorName) {
    const lowerName = doctorName.toLowerCase();
    const match = DOCTOR_NAME_ASSET_MAP.find((item) => lowerName.includes(item.keyword));
    if (match) {
      e.target.src = match.image;
      return;
    }
  }

  e.target.src = DEFAULT_DOCTOR_AVATAR;
};
