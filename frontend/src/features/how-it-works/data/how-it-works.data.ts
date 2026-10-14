export type DocumentationSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  steps?: string[];
  items?: string[];
};

export type DocumentationArticle = {
  slug: string;
  module: string;
  title: string;
  intro: string;
  sections: DocumentationSection[];
  relatedSlugs: string[];
  keywords: string[];
};

export type HowItWorksModule = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  articleSlug: string;
};

export type HowItWorksVideo = {
  title: string;
  channel: string;
  url: string;
  videoId: string;
  description: string;
  topic: string;
  articleSlug: string;
};

export type GettingStartedItem = {
  title: string;
  description: string;
  articleSlug: string;
  keywords: string[];
};

export const gettingStartedItems: GettingStartedItem[] = [
  {
    title: 'Explora el catálogo',
    description: 'Revisa productos, variantes, imágenes y características antes de comenzar una personalización.',
    articleSlug: 'catalogo-de-productos',
    keywords: ['productos', 'catálogo', 'variantes', 'galería'],
  },
  {
    title: 'Personaliza tu producto',
    description: 'Abre el diseñador desde un producto o empieza un documento nuevo para trabajar sobre tu idea.',
    articleSlug: 'crear-y-personalizar-productos',
    keywords: ['personalizar', 'diseñador', 'producto', 'carrito'],
  },
  {
    title: 'Guarda y retoma tus diseños',
    description: 'Trabaja en el modo que necesites y vuelve a tus proyectos y diseños desde tu cuenta.',
    articleSlug: 'disenador-easy-y-avanzado',
    keywords: ['guardar', 'proyecto', 'diseños', 'easy', 'avanzado'],
  },
  {
    title: 'Encuentra recursos para producir',
    description: 'Consulta el catálogo público de recursos y revisa sus archivos, formatos y condiciones de uso.',
    articleSlug: 'recursos',
    keywords: ['recursos', 'mockups', 'plantillas', 'archivos', 'formatos'],
  },
];

export const howItWorksVideos: HowItWorksVideo[] = [
  {
    title: 'Cómo hacer diseños de camisetas en Canva',
    channel: 'Cómo hacer',
    url: 'https://www.youtube.com/watch?v=BXfIsXqtx78',
    videoId: 'BXfIsXqtx78',
    description: 'Una guía externa para preparar una idea gráfica de camiseta antes de llevarla a un flujo de personalización.',
    topic: 'Diseñar una idea',
    articleSlug: 'crear-y-personalizar-productos',
  },
  {
    title: 'Mockups gratis con Canva: tutorial en español',
    channel: 'diego fol.',
    url: 'https://www.youtube.com/watch?v=PF3mfQe2ME4',
    videoId: 'PF3mfQe2ME4',
    description: 'Tutorial externo sobre mockups que puede complementar la preparación visual de una presentación de producto.',
    topic: 'Presentar un producto',
    articleSlug: 'recursos',
  },
  {
    title: 'Cómo hacer mockups de taza y camiseta para sublimación en Photoshop',
    channel: 'CreaSion',
    url: 'https://www.youtube.com/watch?v=4-mGYv70PGI',
    videoId: '4-mGYv70PGI',
    description: 'Ejemplo externo de preparación de mockups para visualizar aplicaciones en tazas y camisetas.',
    topic: 'Mockups y sublimación',
    articleSlug: 'catalogo-de-productos',
  },
  {
    title: 'Cómo crear catálogos de productos interactivos',
    channel: 'Karito Vargas',
    url: 'https://www.youtube.com/watch?v=Xv3V8nL7VBY',
    videoId: 'Xv3V8nL7VBY',
    description: 'Referencia externa para organizar y presentar un catálogo de productos de forma interactiva.',
    topic: 'Catálogos',
    articleSlug: 'catalogo-de-productos',
  },
  {
    title: 'Cómo quitar el fondo de una imagen con Canva',
    channel: 'EducaTIC',
    url: 'https://www.youtube.com/watch?v=anVKn4B_neE',
    videoId: 'anVKn4B_neE',
    description: 'Tutorial externo para preparar imágenes antes de incorporarlas a una composición de diseño.',
    topic: 'Preparar imágenes',
    articleSlug: 'disenador-easy-y-avanzado',
  },
];

export const howItWorksModules: HowItWorksModule[] = [
  {
    slug: 'catalogo-de-productos',
    title: 'Catálogo de productos',
    description: 'Consulta productos, galerías, características, variantes y opciones disponibles antes de decidir cómo trabajar.',
    keywords: ['productos', 'catálogo', 'galería', 'variantes', 'precio'],
    articleSlug: 'catalogo-de-productos',
  },
  {
    slug: 'crear-y-personalizar-productos',
    title: 'Crear y personalizar productos',
    description: 'Conoce las entradas disponibles para personalizar desde un producto o comenzar un producto nuevo.',
    keywords: ['crear', 'personalizar', 'producto', 'carrito', 'diseñador'],
    articleSlug: 'crear-y-personalizar-productos',
  },
  {
    slug: 'disenador-easy-y-avanzado',
    title: 'Diseñador Easy y Avanzado',
    description: 'Aprende cuándo usar cada modo del Diseñador, cómo cargar elementos y cómo retomar proyectos guardados.',
    keywords: ['designer', 'diseñador', 'easy', 'avanzado', 'proyecto', 'guardar'],
    articleSlug: 'disenador-easy-y-avanzado',
  },
  {
    slug: 'disenos',
    title: 'Diseños',
    description: 'Explora packs publicados, consulta sus detalles y gestiona el acceso a tus diseños desde la biblioteca.',
    keywords: ['diseños', 'packs', 'biblioteca', 'originales', 'descarga'],
    articleSlug: 'disenos',
  },
  {
    slug: 'recursos',
    title: 'Recursos',
    description: 'Busca plantillas, mockups y recursos técnicos publicados, con sus formatos y condiciones de uso.',
    keywords: ['recursos', 'plantillas', 'mockups', 'formatos', 'licencia'],
    articleSlug: 'recursos',
  },
  {
    slug: 'cuentas',
    title: 'Cuenta de cliente y tienda',
    description: 'Ubica las áreas de cuenta disponibles para consultar pedidos, diseños, clientes y operaciones de tienda.',
    keywords: ['cuenta', 'cliente', 'tienda', 'pedidos', 'clientes', 'diseños'],
    articleSlug: 'cuentas',
  },
];

export const howItWorksArticles: DocumentationArticle[] = [
  {
    slug: 'catalogo-de-productos',
    module: 'Catálogo de productos',
    title: 'Explorar el catálogo de productos',
    intro: 'El catálogo público es el punto de partida para conocer los productos disponibles y decidir si quieres personalizarlos o añadirlos al carrito.',
    keywords: ['productos', 'catálogo', 'galería', 'características', 'variantes'],
    relatedSlugs: ['crear-y-personalizar-productos', 'disenos', 'recursos'],
    sections: [
      {
        id: 'que-encontraras',
        title: 'Qué encontrarás',
        paragraphs: ['En /products puedes abrir la vista de producto. Cada detalle reúne categoría, nombre, descripción, galería, información complementaria y productos relacionados.'],
        items: ['Galería con imagen principal y miniaturas.', 'Características configurables, como color, talla, material o calidad cuando el producto las define.', 'Precio, disponibilidad y opciones para personalizar o agregar al carrito.'],
      },
      {
        id: 'como-consultar',
        title: 'Cómo consultar un producto',
        steps: ['Entra en Productos desde la navegación pública.', 'Abre un producto para ver su detalle y recorre la galería.', 'Revisa las características disponibles y selecciona las opciones requeridas antes de continuar.', 'Elige Personalizar para entrar al flujo de diseño o Agregar al carrito si ya tienes clara la configuración.'],
      },
      {
        id: 'limites',
        title: 'Lo que debes tener en cuenta',
        paragraphs: ['Las opciones mostradas dependen de la configuración real de cada producto. Si una característica es obligatoria, el detalle la valida antes de agregar el artículo al carrito.'],
      },
    ],
  },
  {
    slug: 'crear-y-personalizar-productos',
    module: 'Crear y personalizar productos',
    title: 'Crear y personalizar productos',
    intro: 'PrintShop ofrece dos entradas relacionadas: personalizar un producto desde su detalle o comenzar un documento nuevo desde el Diseñador.',
    keywords: ['crear', 'personalizar', 'producto', 'diseñador', 'carrito'],
    relatedSlugs: ['catalogo-de-productos', 'disenador-easy-y-avanzado'],
    sections: [
      {
        id: 'desde-catalogo',
        title: 'Desde el catálogo',
        paragraphs: ['En el detalle de un producto, Personalizar abre /designer/personalize. La selección de atributos y la cantidad se mantienen en el detalle para que puedas configurar el artículo antes de comprarlo.'],
        steps: ['Abre el detalle del producto.', 'Selecciona color, talla u otros atributos disponibles.', 'Pulsa Personalizar para continuar con el diseño.', 'Cuando la configuración esté completa, usa Agregar al carrito desde el detalle del producto.'],
      },
      {
        id: 'desde-disenador',
        title: 'Desde un documento nuevo',
        paragraphs: ['Crear producto abre /designer/new. El constructor permite escoger una categoría disponible y continuar hacia el espacio de trabajo con el producto elegido.'],
        steps: ['Abre Crear producto o entra en /designer/new.', 'Selecciona una categoría y el producto que quieres preparar.', 'Continúa al espacio de trabajo para cargar y ajustar el diseño.', 'Guarda el proyecto si quieres retomarlo más adelante.'],
      },
      {
        id: 'alcance',
        title: 'Alcance del flujo',
        paragraphs: ['La disponibilidad de categorías, atributos y acciones se determina por el producto y por el estado de la cuenta. Esta guía no sustituye las validaciones que aparecen en pantalla.'],
      },
    ],
  },
  {
    slug: 'disenador-easy-y-avanzado',
    module: 'Diseñador Easy y Avanzado',
    title: 'Trabajar en el Diseñador Easy y Avanzado',
    intro: 'El Diseñador reúne un modo Easy para preparar imágenes con herramientas directas y un espacio Avanzado para trabajar con un documento y sus elementos.',
    keywords: ['diseñador', 'easy', 'avanzado', 'herramientas', 'proyecto', 'guardar'],
    relatedSlugs: ['crear-y-personalizar-productos', 'disenos', 'recursos'],
    sections: [
      {
        id: 'elige-el-modo',
        title: 'Elige el modo adecuado',
        items: ['Easy: dispone de ajustes de imagen, carga de archivos y herramientas como recorte, borrado y ajustes.', 'Avanzado: trabaja sobre un documento con superficies, capas y herramientas del espacio de trabajo.', 'Las rutas públicas disponibles son /designer/easy, /designer/advanced y /designer/new.'],
      },
      {
        id: 'flujo-easy',
        title: 'Flujo en Easy',
        steps: ['Abre el modo Easy.', 'Carga o selecciona una imagen.', 'Usa las herramientas visibles para ajustar la imagen y revisa el resultado en el lienzo.', 'Guarda el diseño cuando quieras conservar el estado de trabajo.'],
      },
      {
        id: 'flujo-avanzado',
        title: 'Flujo en Avanzado',
        steps: ['Abre el Diseñador Avanzado o crea un producto nuevo.', 'Trabaja con los elementos y superficies del documento.', 'Guarda el documento para que aparezca en Mis proyectos.', 'Retoma un proyecto guardado desde la vista de proyectos del constructor.'],
      },
      {
        id: 'consideraciones',
        title: 'Consideraciones',
        paragraphs: ['El contenido disponible en cada modo depende del documento y de la ruta desde la que entres. La biblioteca de diseños del Diseñador y los proyectos guardados son espacios distintos.'],
      },
    ],
  },
  {
    slug: 'disenos',
    module: 'Diseños',
    title: 'Explorar y gestionar diseños',
    intro: 'La biblioteca de Diseños permite explorar packs publicados, consultar sus condiciones y acceder a los originales después de obtenerlos.',
    keywords: ['diseños', 'packs', 'biblioteca', 'gratis', 'compra', 'originales'],
    relatedSlugs: ['disenador-easy-y-avanzado', 'recursos'],
    sections: [
      {
        id: 'explorar-packs',
        title: 'Explorar packs publicados',
        paragraphs: ['En /designs puedes buscar packs por nombre, categoría o formato, filtrar por acceso y ordenar el resultado. Solo se muestran packs publicados.'],
        steps: ['Busca por nombre, categoría o formato.', 'Usa los filtros de acceso y orden si necesitas acotar la lista.', 'Abre un pack para consultar su galería, contenido, formatos y licencia.'],
      },
      {
        id: 'obtener-y-descargar',
        title: 'Obtener y descargar',
        paragraphs: ['Los packs gratuitos se pueden añadir a la biblioteca. Los packs de pago muestran una confirmación de compra. Cuando el pack está en tu biblioteca, puedes abrir /designs/library y descargar sus originales.'],
      },
      {
        id: 'condiciones',
        title: 'Condiciones de uso',
        paragraphs: ['Cada pack publica su propia licencia y sus formatos originales. Revisa esa información en el detalle antes de usar los archivos.'],
      },
    ],
  },
  {
    slug: 'recursos',
    module: 'Recursos',
    title: 'Buscar y consultar recursos',
    intro: 'El catálogo de Recursos reúne archivos publicados por sus creadores, con filtros para encontrar plantillas, mockups y materiales de producción.',
    keywords: ['recursos', 'plantillas', 'mockups', 'archivos', 'formatos', 'licencia'],
    relatedSlugs: ['disenos', 'disenador-easy-y-avanzado', 'catalogo-de-productos'],
    sections: [
      {
        id: 'buscar',
        title: 'Buscar en el catálogo',
        paragraphs: ['En /resources puedes buscar por nombre, descripción, creador, etiquetas o formatos y filtrar por categoría, tipo de archivo, producto compatible y técnica.'],
        steps: ['Escribe una búsqueda o deja el campo vacío para consultar el catálogo.', 'Combina los filtros disponibles para acotar el resultado.', 'Ordena por recursos recientes o por nombre.', 'Abre un recurso publicado para revisar su detalle.'],
      },
      {
        id: 'detalle-y-descarga',
        title: 'Consultar el detalle',
        paragraphs: ['El detalle muestra la galería de previsualizaciones, el nombre del creador, la cantidad de archivos, los formatos, las dimensiones, la resolución, la transparencia y la licencia cuando están disponibles. Descargar recurso inicia la descarga de los archivos originales.'],
      },
      {
        id: 'publicacion',
        title: 'Publicación de recursos',
        paragraphs: ['La opción Publicar recurso lleva al área de creador. El catálogo público solo muestra recursos publicados, por lo que el estado de cada recurso determina su visibilidad.'],
      },
    ],
  },
  {
    slug: 'cuentas',
    module: 'Cuenta de cliente y tienda',
    title: 'Orientarte en las cuentas de cliente y tienda',
    intro: 'La aplicación separa los espacios de cliente y tienda para que cada cuenta encuentre sus operaciones y herramientas en el contexto correspondiente.',
    keywords: ['cuenta', 'cliente', 'tienda', 'pedidos', 'clientes', 'diseños', 'configuración'],
    relatedSlugs: ['disenador-easy-y-avanzado', 'disenos', 'recursos'],
    sections: [
      {
        id: 'cuenta-cliente',
        title: 'Cuenta de cliente',
        paragraphs: ['La cuenta de cliente está disponible en /account. Desde allí puedes acceder al resumen, pedidos, diseños, favoritos, direcciones, notificaciones, configuración y al Diseñador de la cuenta.'],
        items: ['Resumen: entrada general de la cuenta.', 'Mis pedidos: consulta del historial de pedidos.', 'Mis diseños: acceso a tus diseños.', 'Diseñador: entrada al espacio de creación desde la cuenta.'],
      },
      {
        id: 'cuenta-tienda',
        title: 'Cuenta de tienda',
        paragraphs: ['La cuenta de tienda está disponible en /store. Su navegación incluye dashboard, pedidos, productos, clientes, diseños, plantillas, descuentos, marketing, reportes, finanzas, envíos, tienda online y configuración.'],
        steps: ['Entra al área de tienda desde la ruta correspondiente.', 'Usa el menú lateral para cambiar entre las áreas disponibles.', 'Abre Diseñador desde la sección de diseño de la tienda cuando necesites preparar contenido para ella.'],
      },
      {
        id: 'permisos',
        title: 'Acceso y permisos',
        paragraphs: ['Las áreas de cuenta dependen de la sesión y del rol con el que se haya iniciado. Si una ruta requiere acceso, la aplicación conserva su flujo de autenticación y no expone esa información en el módulo público.'],
      },
    ],
  },
];

export function getHowItWorksArticle(slug: string) {
  return howItWorksArticles.find((article) => article.slug === slug);
}
