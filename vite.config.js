import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Each website (Eden Strong, Fidoryn, One Accord) is the same app
// built with a different VITE_BRAND. This sets the browser-tab title, icon,
// description, and theme color for whichever brand is being built.
const SITES = {
  women: { title: 'Eden Strong', description: 'Faith-led fitness and wellness for women. Faith, fitness, purpose.', color: '#120E10', icon: '/brand/favicon-eden-strong.svg' },
  men: { title: 'Fidoryn', description: 'Discipline, strength, and faith for men. Stronger than yesterday.', color: '#0F0F0E', icon: '/brand/favicon-faith-over-flesh.svg' },
  together: { title: 'One Accord', description: 'Faith, fitness, and purpose for couples. United in Christ. Stronger together.', color: '#121311', icon: '/brand/favicon-one-accord.svg' },
  family: { title: 'Eden Strong, Fidoryn, One Accord', description: 'Faith-rooted fitness. One mission, three expressions.', color: '#F5F0E8', icon: '/brand/favicon-family.svg' },
};
const ALIASES = { women: 'women', es: 'women', 'eden-strong': 'women', edenstrong: 'women', men: 'men', fidoryn: 'men', fof: 'men', ff: 'men', 'faith-over-flesh': 'men', faithoverflesh: 'men', together: 'together', couples: 'together', oa: 'together', 'one-accord': 'together', oneaccord: 'together' };

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const brand = ALIASES[String(env.VITE_BRAND || '').toLowerCase().trim()] || 'family';
  const site = SITES[brand];
  return {
    plugins: [
      react(),
      {
        name: 'brand-head',
        transformIndexHtml(html) {
          return html
            .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(site.title)}</title>`)
            .replace(
              '</head>',
              `    <meta name="description" content="${escape(site.description)}" />
    <meta name="theme-color" content="${site.color}" />
    <meta property="og:title" content="${escape(site.title)}" />
    <meta property="og:description" content="${escape(site.description)}" />
    <link rel="icon" type="image/svg+xml" href="${site.icon}" />
    <link rel="apple-touch-icon" href="${site.icon}" />
  </head>`
            );
        },
      },
    ],
  };
});
