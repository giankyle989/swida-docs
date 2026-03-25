/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'PRD',
      items: [
        {type: 'doc', id: 'prd/SWIDA_PRD_EN', label: 'English'},
        {type: 'doc', id: 'prd/SWIDA_PRD_KO', label: '한국어'},
      ],
    },
    {
      type: 'category',
      label: 'TSD',
      items: [
        {type: 'doc', id: 'tsd/SWIDA_TSD_EN', label: 'English'},
        {type: 'doc', id: 'tsd/SWIDA_TSD_KO', label: '한국어'},
      ],
    },
    {
      type: 'category',
      label: 'FSD',
      items: [
        {
          type: 'category',
          label: 'Customer Web',
          items: [
            {type: 'doc', id: 'fsd/SWIDA_FSD_Customer_Web_EN', label: 'English'},
            {type: 'doc', id: 'fsd/SWIDA_FSD_Customer_Web_KO', label: '한국어'},
          ],
        },
        {
          type: 'category',
          label: 'Admin Web',
          items: [
            {type: 'doc', id: 'fsd/SWIDA_FSD_Admin_Web_EN', label: 'English'},
            {type: 'doc', id: 'fsd/SWIDA_FSD_Admin_Web_KO', label: '한국어'},
          ],
        },
      ],
    },
    {type: 'doc', id: 'glossary', label: 'Glossary'},
  ],
};

export default sidebars;
