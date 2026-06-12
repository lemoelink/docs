import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Inicio Rápido',
    },
    {
      type: 'category',
      label: 'Instalación',
      collapsed: false,
      items: [
        'instalacion/requisitos',
        'instalacion/instalacion',
        'instalacion/primer-arranque',
        'instalacion/docker',
      ],
    },
    {
      type: 'category',
      label: 'Configuración',
      items: [
        'configuracion/config-json',
        'configuracion/experts-json',
        'configuracion/modelos',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/endpoints',
        'api/seguridad',
      ],
    },
    {
      type: 'category',
      label: 'Expertos',
      items: [
        'expertos/arquitectura',
        'expertos/router',
        'expertos/memoria',
      ],
    },
    {
      type: 'category',
      label: 'Avanzado',
      items: [
        'avanzado/open-webui',
          'avanzado/enrutamiento-contextual',
        {
          type: 'category',
          label: 'Sistema de Herramientas (Tools)',
          link: {
            type: 'doc',
            id: 'avanzado/tools',
          },
          items: [
            'avanzado/tool-calendar-smart',
          ],
        },
        {
          type: 'category',
          label: 'Sistema de Plugins',
          link: {
            type: 'doc',
            id: 'avanzado/plugins',
          },
          items: [
            'avanzado/plugin-image-router',
            'avanzado/plugin-system-time',
            'avanzado/plugin-user-profile',
            'avanzado/plugin-routing-transparency',
            'avanzado/plugin-pii-masker',
          ],
        },
        'avanzado/route-endpoint',
        'avanzado/cluster-proxy',
        'avanzado/ajuste-rendimiento',
      ],
    },
    {
      type: 'category',
      label: 'Soporte',
      items: [
        'soporte/troubleshooting',
        'soporte/faq',
      ],
    },
  ],
};

export default sidebars;
