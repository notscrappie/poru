import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';

const config: Config = {
  title: 'Poru',
  tagline: 'A stable and powerful Lavalink client with some best features',
  favicon: 'img/poru.png',

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/poru',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'UnschooledGamer', // Usually your GitHub org/user name.
  projectName: 'poru', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  plugins: [
    [
    'docusaurus-plugin-typedoc-api',
      {
        projectRoot: path.join(__dirname, '..'),
        packages: [{
          path: ".",
          entry: {
            index: "index.ts",
          }
        }],
        readmes: true,
        // minimal: ,
        debug: true,
        // typedocOptions: {
        //   entryPoints: ['../../index.ts'],
        // }
        sidebarCollapsed: false,
      },
    ],
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // sidebarCollapsed: false,
          sidebarCollapsible: false,
        },
        blog: false,  // not used for this project
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/poru.png',
    navbar: {
      title: 'Poru',
      logo: {
        alt: 'My Site Logo',
        src: 'img/poru.png',
      },
      items: [
        {
          href: 'https://github.com/parasop/poru',
          label: 'GitHub',
          position: 'right',
        },
        {
          to: 'api',
          label: 'API',
          position: 'left',
          sidebarId: 'apiSidebar',
          // type: "autogenerated",
        },
      ],
    },
    docs: {
      sidebar: {
        autoCollapseCategories: false,
      },
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Overview',
              to: '/api',
            },
            {
              label: 'Poru Music (Example)',
              to: 'https://github.com/parasop/poru-example',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Npm',
              href: 'https://www.npmjs.com/package/poru',
            },
            {
              label: 'Discord',
              href: 'https://discord.com/invite/Zmmc47Nrh8',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/parasop/poru',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Donate',
              href: 'https://ko-fi.com/parasop',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Poru. Built with Docusaurus. Configured By UnschooledGamer`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
