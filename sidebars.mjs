/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'PRD',
      items: [
        {
          type: 'category',
          label: 'English',
          items: [
            {type: 'doc', id: 'prd/en', label: 'Overview'},
            {type: 'doc', id: 'prd/en/overview', label: '1. Overview'},
            {type: 'doc', id: 'prd/en/goals-success-metrics', label: '2. Goals & Success Metrics'},
            {type: 'doc', id: 'prd/en/user-roles-permissions', label: '3. User Roles & Permissions'},
            {type: 'doc', id: 'prd/en/location-system', label: '4. Location System'},
            {type: 'doc', id: 'prd/en/shop-listing-data-model', label: '5. Shop Listing Data Model'},
            {type: 'doc', id: 'prd/en/search-filtering-system', label: '6. Search & Filtering'},
            {type: 'doc', id: 'prd/en/navigation-menus', label: '7. Navigation & Menus'},
            {type: 'doc', id: 'prd/en/review-system', label: '8. Review System'},
            {type: 'doc', id: 'prd/en/service-themes', label: '9. Service Themes'},
            {type: 'doc', id: 'prd/en/partnership-flow', label: '10. Partnership Flow'},
            {type: 'doc', id: 'prd/en/non-functional-requirements', label: '11. Non-Functional Requirements'},
            {type: 'doc', id: 'prd/en/future-considerations', label: '12. Future Considerations'},
            {type: 'doc', id: 'prd/en/technical-architecture', label: '13. Technical Architecture'},
          ],
        },
        {
          type: 'category',
          label: '한국어',
          items: [
            {type: 'doc', id: 'prd/ko', label: '개요'},
            {type: 'doc', id: 'prd/ko/overview', label: '1. 개요'},
            {type: 'doc', id: 'prd/ko/goals-success-metrics', label: '2. 목표 및 성공 지표'},
            {type: 'doc', id: 'prd/ko/user-roles-permissions', label: '3. 사용자 역할 및 권한'},
            {type: 'doc', id: 'prd/ko/location-system', label: '4. 위치 시스템'},
            {type: 'doc', id: 'prd/ko/shop-listing-data-model', label: '5. 업체 리스팅 데이터 모델'},
            {type: 'doc', id: 'prd/ko/search-filtering-system', label: '6. 검색 및 필터링'},
            {type: 'doc', id: 'prd/ko/navigation-menus', label: '7. 네비게이션 및 메뉴'},
            {type: 'doc', id: 'prd/ko/review-system', label: '8. 리뷰 시스템'},
            {type: 'doc', id: 'prd/ko/service-themes', label: '9. 서비스 테마'},
            {type: 'doc', id: 'prd/ko/partnership-flow', label: '10. 파트너십 흐름'},
            {type: 'doc', id: 'prd/ko/non-functional-requirements', label: '11. 비기능 요구사항'},
            {type: 'doc', id: 'prd/ko/future-considerations', label: '12. 향후 고려 사항'},
            {type: 'doc', id: 'prd/ko/technical-architecture', label: '13. 기술 아키텍처'},
          ],
        },
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
    {type: 'doc', id: 'glossary', label: 'Glossary'},
  ],
};

export default sidebars;
