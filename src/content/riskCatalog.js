export const riskCatalog = {
  'Trabajo en Alturas': {
    summary:
      'Se requiere control estricto de accesos, líneas de vida y coordinación de trabajos en altura.',
    risks: [
      { label: 'Caída al mismo nivel', level: 'alto', description: 'Pérdida de estabilidad en andamios o escaleras.' },
      { label: 'Caída a desnivel', level: 'alto', description: 'Mala fijación de sistemas de protección personal.' },
      { label: 'Golpes por herramientas', level: 'medio', description: 'Objetos o herramientas que se desploman.' },
    ],
    epp: ['Casco de seguridad', 'Arnés de seguridad', 'Línea de vida', 'Botas de seguridad'],
  },
  'Riesgo Eléctrico': {
    summary:
      'Debe existir un control riguroso de instalaciones energizadas, cortes y procedimientos de trabajo seguro.',
    risks: [
      { label: 'Contacto directo con tensión', level: 'alto', description: 'Instalaciones energizadas sin aislamiento.' },
      { label: 'Arco eléctrico', level: 'alto', description: 'Fallas en equipos o cableado defectuoso.' },
      { label: 'Choque por descarga estática', level: 'medio', description: 'Acumulación eléctrica durante actividades de montaje.' },
    ],
    epp: ['Guantes dieléctricos', 'Casco dieléctrico', 'Calzado aislante', 'Careta de protección'],
  },
  Excavaciones: {
    summary:
      'La estabilidad del terreno y la protección de taludes son factores críticos para prevenir colapsos.',
    risks: [
      { label: 'Desprendimiento de taludes', level: 'alto', description: 'Falta de entibado o taludes inestables.' },
      { label: 'Aplastamiento por maquinaria', level: 'alto', description: 'Vehículos y equipos sin señalización.' },
      { label: 'Fugas de servicios públicos', level: 'medio', description: 'Falta de localización previa de redes.' },
    ],
    epp: ['Casco', 'Botas de seguridad', 'Chaleco reflectivo', 'Guantes de mano'],
  },
  'Izaje de Cargas': {
    summary:
      'Es imprescindible verificar cargas, rutas de tránsito y la resistencia de los equipos de izaje.',
    risks: [
      { label: 'Aplastamiento por carga', level: 'alto', description: 'Mala señalización o sobrecarga del equipo.' },
      { label: 'Colisión con personal', level: 'alto', description: 'Zona de trabajo sin delimitación.' },
      { label: 'Falla mecánica', level: 'medio', description: 'Inspección insuficiente del equipo.' },
    ],
    epp: ['Casco', 'Guantes de trabajo', 'Botas de seguridad', 'Chaleco reflectivo'],
  },
  'Espacios Confinados': {
    summary:
      'La ventilación, la vigilancia y la autorización previa son condiciones esenciales para operar sin riesgo.',
    risks: [
      { label: 'Falta de oxígeno', level: 'alto', description: 'Ambientes con deficiencia de ventilación.' },
      { label: 'Exposición a gases tóxicos', level: 'alto', description: 'Acumulación de vapores o gases peligrosos.' },
      { label: 'Desmayo o inconsciencia', level: 'alto', description: 'Condiciones atmosféricas no controladas.' },
    ],
    epp: ['Casco', 'Guantes resistentes', 'Respirador o línea de vida', 'Botas de seguridad'],
  },
  Demolición: {
    summary: 'Delimitar el área, confirmar redes y estabilidad estructural, y ejecutar la actividad según un plan aprobado.',
    risks: [
      { label: 'Caída de materiales', level: 'alto', description: 'Elementos desprendidos pueden golpear a trabajadores o personas cercanas.' },
      { label: 'Colapso no controlado', level: 'alto', description: 'Una secuencia inadecuada puede comprometer elementos que permanecen en pie.' },
      { label: 'Polvo y partículas', level: 'medio', description: 'La generación de polvo puede afectar ojos y vías respiratorias.' },
    ],
    epp: ['Casco con barbuquejo', 'Gafas de seguridad', 'Protección respiratoria adecuada', 'Guantes y botas de seguridad'],
  },
  'Soldadura y corte': {
    summary: 'Realizar trabajos en caliente con autorización, control de fuentes de ignición y vigilancia del área.',
    risks: [
      { label: 'Quemaduras e incendio', level: 'alto', description: 'Chispas y superficies calientes pueden causar lesiones o iniciar un incendio.' },
      { label: 'Radiación del arco', level: 'alto', description: 'La exposición sin protección puede lesionar ojos y piel.' },
      { label: 'Humos de soldadura', level: 'medio', description: 'Los humos requieren ventilación y controles según el material y el proceso.' },
    ],
    epp: ['Careta para soldar', 'Guantes de carnaza', 'Ropa de protección', 'Protección respiratoria según evaluación'],
  },
  'Operación de maquinaria': {
    summary: 'Usar equipos autorizados e inspeccionados, con operadores competentes y área de maniobra controlada.',
    risks: [
      { label: 'Atropellamiento o atrapamiento', level: 'alto', description: 'La interacción entre personas y equipos móviles puede provocar lesiones graves.' },
      { label: 'Vuelco o pérdida de estabilidad', level: 'alto', description: 'Las condiciones del terreno o la operación pueden desestabilizar el equipo.' },
      { label: 'Falla del equipo', level: 'medio', description: 'Defectos o falta de mantenimiento pueden causar incidentes durante la operación.' },
    ],
    epp: ['Casco', 'Chaleco de alta visibilidad', 'Botas de seguridad', 'Protección auditiva según exposición'],
  },
  'Tránsito de vehículos': {
    summary: 'Planear rutas, separar peatones y vehículos, y mantener señalización visible y control de accesos.',
    risks: [
      { label: 'Colisión o atropellamiento', level: 'alto', description: 'Puntos ciegos, maniobras y circulación mixta elevan el riesgo de impacto.' },
      { label: 'Choque con estructuras', level: 'medio', description: 'Espacios reducidos o rutas no coordinadas pueden causar colisiones.' },
      { label: 'Exposición a polvo y ruido', level: 'medio', description: 'El tránsito continuo puede generar ruido y material particulado.' },
    ],
    epp: ['Chaleco de alta visibilidad', 'Casco en zona de obra', 'Botas de seguridad', 'Protección auditiva según evaluación'],
  },
  'Manejo de sustancias químicas': {
    summary: 'Identificar los productos, consultar sus hojas de seguridad y aplicar controles de almacenamiento y uso.',
    risks: [
      { label: 'Contacto con sustancias', level: 'alto', description: 'Salpicaduras o contacto pueden irritar o lesionar piel y ojos.' },
      { label: 'Inhalación de vapores', level: 'alto', description: 'Algunos productos requieren ventilación y controles específicos.' },
      { label: 'Derrames o incompatibilidad', level: 'medio', description: 'Un almacenamiento inadecuado puede generar exposición o reacciones no deseadas.' },
    ],
    epp: ['Gafas según el producto', 'Guantes compatibles con la sustancia', 'Ropa de protección', 'Respirador según hoja de seguridad'],
  },
  'Manipulación manual de cargas': {
    summary: 'Evaluar peso, dimensiones y recorrido; usar ayudas mecánicas y coordinar el movimiento cuando sea necesario.',
    risks: [
      { label: 'Sobreesfuerzo', level: 'medio', description: 'La carga o postura inadecuada puede producir lesiones musculoesqueléticas.' },
      { label: 'Golpes y atrapamientos', level: 'medio', description: 'La carga puede desplazarse o atrapar manos y pies durante el traslado.' },
      { label: 'Caídas al transportar', level: 'medio', description: 'La carga puede limitar la visión o dificultar el equilibrio.' },
    ],
    epp: ['Guantes adecuados a la carga', 'Botas con protección', 'Chaleco de alta visibilidad cuando aplique'],
  },
  'Encofrado y desencofrado': {
    summary: 'Verificar diseño, estabilidad, secuencia de montaje y condiciones antes de cargar o retirar los elementos.',
    risks: [
      { label: 'Colapso del encofrado', level: 'alto', description: 'Un montaje deficiente o carga no prevista puede ocasionar fallas estructurales temporales.' },
      { label: 'Caídas a distinto nivel', level: 'alto', description: 'El trabajo en bordes y plataformas requiere protección contra caídas.' },
      { label: 'Golpes por elementos', level: 'medio', description: 'Tableros, puntales o herramientas pueden caer durante el montaje.' },
    ],
    epp: ['Casco', 'Guantes de trabajo', 'Botas de seguridad', 'Protección contra caídas según evaluación'],
  },
  'Vaciado de concreto': {
    summary: 'Coordinar el suministro y bombeo, mantener comunicación y controlar el acceso al área de vaciado.',
    risks: [
      { label: 'Contacto con concreto húmedo', level: 'medio', description: 'El contacto prolongado puede irritar o quemar la piel.' },
      { label: 'Golpe por mangueras o equipos', level: 'alto', description: 'La presión y el movimiento de los equipos requieren control y coordinación.' },
      { label: 'Caídas y resbalones', level: 'medio', description: 'Derrames y superficies húmedas pueden generar pérdida de estabilidad.' },
    ],
    epp: ['Gafas de seguridad', 'Guantes impermeables compatibles', 'Botas impermeables', 'Casco'],
  },
  'Instalaciones eléctricas': {
    summary: 'Planear el trabajo, identificar fuentes de energía y aplicar procedimientos de aislamiento y verificación.',
    risks: [
      { label: 'Contacto eléctrico', level: 'alto', description: 'La energía presente puede causar descarga, quemaduras o lesiones graves.' },
      { label: 'Arco eléctrico', level: 'alto', description: 'Una falla puede liberar calor, presión y partículas peligrosas.' },
      { label: 'Caídas durante la instalación', level: 'medio', description: 'El uso de escaleras y plataformas exige estabilidad y acceso seguro.' },
    ],
    epp: ['EPP dieléctrico definido por persona competente', 'Gafas o careta según evaluación', 'Casco adecuado', 'Calzado de seguridad'],
  },
  'Pintura y recubrimientos': {
    summary: 'Revisar la hoja de seguridad, controlar ventilación y fuentes de ignición, y evitar exposición innecesaria.',
    risks: [
      { label: 'Inhalación de vapores', level: 'alto', description: 'La exposición depende del producto, método de aplicación y ventilación.' },
      { label: 'Contacto con piel y ojos', level: 'medio', description: 'Las salpicaduras pueden causar irritación u otras afectaciones.' },
      { label: 'Incendio', level: 'alto', description: 'Algunos productos y vapores pueden ser inflamables.' },
    ],
    epp: ['Gafas de seguridad', 'Guantes compatibles con el producto', 'Ropa de protección', 'Respirador según hoja de seguridad'],
  },
};

export const activities = Object.keys(riskCatalog);
