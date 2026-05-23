import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'LEMoE Docs',
  tagline: 'Light Easy Mix Of Experts — Documentación oficial',
  favicon: 'img/favicon.ico',

  url: 'https://docs.lemoe.link',
  baseUrl: '/',

  organizationName: 'lemoelink',
  projectName: 'docs',

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    localeConfigs: {
      es: { label: 'Español', direction: 'ltr' },
      en: { label: 'English', direction: 'ltr' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/lemoelink/docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/lemoe-social.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'LEMoE',
      logo: {
        alt: 'LEMoE Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentación',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://lemoe.link',
          label: 'lemoe.link',
          position: 'right',
        },
        {
          href: 'https://github.com/lemoelink/docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentación',
          items: [
            { label: 'Guía de Inicio Rápido', to: '/intro' },
            { label: 'Configuración', to: '/configuracion/config-json' },
            { label: 'Referencia API', to: '/api/endpoints' },
          ],
        },
        {
          title: 'Comunidad',
          items: [
            { label: 'Sitio web', href: 'https://lemoe.link' },
            { label: 'GitHub', href: 'https://github.com/lemoelink' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} LEMoE — Light Easy Mix Of Experts`,
    },
    prism: {
      theme: prismThemes.vsDark,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'json', 'python'],
    },
    algolia: undefined,
  } satisfies Preset.ThemeConfig,
};

export default config;
