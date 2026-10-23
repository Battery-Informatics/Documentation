import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Battery Informatics",
  description: "MOQD-NMC Crystal Structure Prediction Documentation",
  base: '/Documentation/',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Implementation', link: '/implementation' },
      { text: 'Results', link: '/results' }
    ],

    sidebar: [
      {
        text: 'Background',
        items: [
          { text: 'NMC Cathode Materials', link: '/background/nmc' },
          { text: 'XtalOpt Architecture', link: '/background/xtalopt' },
          { text: 'MOME-MAP-Elites', link: '/background/moqd' }
        ]
      },
      {
        text: 'Implementation',
        items: [
          { text: 'GULP Setup', link: '/implementation/gulp' },
          { text: 'Descriptors', link: '/implementation/descriptors' },
          { text: 'Grid Archive', link: '/implementation/archive' },
          { text: 'Parent Selection', link: '/implementation/selection' }
        ]
      },
      {
        text: 'Results',
        items: [
          { text: 'Pareto Fronts', link: '/results/pareto' },
          { text: 'Phase Stability', link: '/results/stability' },
          { text: 'Composition Analysis', link: '/results/composition' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Battery-Informatics/Documentation' }
    ]
  }
})