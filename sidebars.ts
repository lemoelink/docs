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
        'avanzado/plugins',
        'avanzado/plugin-image-router',
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
    {
      type: 'category',
      label: 'Extras',
      items: [
        'extras/roadmap',
      ],
    },
  ],
};

export default sidebars;
