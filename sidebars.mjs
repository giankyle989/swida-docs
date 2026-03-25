/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'PRD',
      items: [
        {type: 'doc', id: 'prd/en', label: 'English'},
        {type: 'doc', id: 'prd/ko', label: '한국어'},
      ],
    },
    {
      type: 'category',
      label: 'TSD',
      items: [
        {type: 'doc', id: 'tsd/en', label: 'English'},
        {type: 'doc', id: 'tsd/ko', label: '한국어'},
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
            {type: 'doc', id: 'fsd/customer-web/en', label: 'English'},
            {type: 'doc', id: 'fsd/customer-web/ko', label: '한국어'},
          ],
        },
      ],
    },
  ],
};

export default sidebars;
