import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Battery Informatics",
  description: "MOQD-NMC Crystal Structure Prediction Documentation",
  base: '/Documentation/',

  markdown: {
    math: true
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Background', link: '/background/nmc' },
      { text: 'Implementation', link: '/implementation/composition' },
      { text: 'Results', link: '/results/experiments' }
    ],

    sidebar: [
      {
        text: 'Background',
        items: [
          { text: 'NMC Cathode Materials', link: '/background/nmc' },
          { text: 'XtalOpt Architecture', link: '/background/xtalopt' },
          { text: 'GULP Setup', link: '/background/gulp' },
          { text: 'MOME-MAP-Elites', link: '/background/moqd' }
        ]
      },
      {
        text: 'Implementation',
        items: [
          { text: 'Composition Input', link: '/implementation/composition' },
          { text: 'Descriptors', link: '/implementation/descriptors' },
          { text: 'Grid Archive', link: '/implementation/archive' },
          { text: 'Parent Selection', link: '/implementation/selection' }
        ]
      },
      {
        text: 'Results',
        items: [
          { text: 'Experiment Log', link: '/results/experiments' },
          { text: 'Baseline Validation', link: '/results/stability' },
          { text: 'Variable and Multi-Composition', link: '/results/composition' },
          { text: 'MOQD Archive', link: '/results/pareto' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Battery-Informatics/Documentation' }
    ]
  }
})
