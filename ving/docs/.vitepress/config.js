import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Ving",
  base: '/ving/',
  description: "An opinionated Nuxt starter with restful API included",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/installation' }
    ],

    sidebar: [
      {
        text: 'Basics',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Environment Variables', link: '/env' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Error Codes', link: '/error-codes' },
          { text: 'Change Log', link: '/change-log' },
        ]
      },
      {
        text: 'Subsystems',
        items: [
          { text: 'Cache', link: '/subsystems/cache' },
          { text: 'CDK', link: '/subsystems/cdk' },
          { text: 'CLI', link: '/subsystems/cli' },
          { text: 'Drizzle', link: '/subsystems/drizzle' },
          { text: 'Email', link: '/subsystems/email' },
          { text: 'Jobs', link: '/subsystems/jobs' },
          { text: 'Logging', link: '/subsystems/logging' },
          { text: 'Message Bus', link: '/subsystems/messagebus' },
          { text: 'PM2', link: '/subsystems/pm2' },
          { text: 'Rest', link: '/subsystems/rest' },
          { text: 'Social Integration', link: '/subsystems/social' },
          { text: 'UI', link: '/subsystems/ui' },
          { text: 'Utilities', link: '/subsystems/utils' },
          { text: 'Ving Record', link: '/subsystems/ving-record' },
          { text: 'Ving Schema', link: '/subsystems/ving-schema' },
        ]
      },
      {
        text: 'Rest APIs',
        items: [
          { text: 'APIKey', link: '/rest/APIKey' },
          { text: 'CronJob', link: '/rest/CronJob' },
          { text: 'S3File', link: '/rest/S3File' },
          { text: 'Session', link: '/rest/Session' },
          { text: 'Test', link: '/rest/Test' },
          { text: 'User', link: '/rest/User' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/plainblack/ving' }
    ]
  }
})
