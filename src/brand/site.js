// Which website this build is.
//
// Each Netlify site sets VITE_BRAND to lock the whole app to one brand:
//   VITE_BRAND=eden-strong       → Eden Strong (women)
//   VITE_BRAND=fidoryn           → Fidoryn (men)  (faith-over-flesh also works)
//   VITE_BRAND=one-accord        → One Accord (couples)
// Leave it unset for the brand-family site that lets people choose.
//
// Optional: each site's web address, so the brand-family page and the
// "wrong site" notice can link people to the right place.
//   VITE_URL_EDEN_STRONG, VITE_URL_FIDORYN, VITE_URL_ONE_ACCORD

const ALIASES = {
  women: 'women', es: 'women', 'eden-strong': 'women', edenstrong: 'women',
  men: 'men', fidoryn: 'men', fof: 'men', ff: 'men', 'faith-over-flesh': 'men', faithoverflesh: 'men',
  together: 'together', couples: 'together', oa: 'together', 'one-accord': 'together', oneaccord: 'together',
};

export const SITE_BRAND = ALIASES[String(import.meta.env.VITE_BRAND || '').toLowerCase().trim()] || null;

const SITE_URLS = {
  women: import.meta.env.VITE_URL_EDEN_STRONG || '',
  men: import.meta.env.VITE_URL_FIDORYN || import.meta.env.VITE_URL_FAITH_OVER_FLESH || '',
  together: import.meta.env.VITE_URL_ONE_ACCORD || '',
};

export function siteUrlFor(editionId) {
  return (SITE_URLS[editionId] || '').replace(/\/$/, '');
}
