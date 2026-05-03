export const zones = {
  morros: {
    id: 'morros',
    name: 'Los Morros (Norte)',
    subtitle: 'Zona montañosa y formaciones rocosas',
    description: 'Explora los imponentes morros de San Juan, joyas naturales de Roscio, Guárico. Un lugar de geología única, biodiversidad y paisajes que inspiran.',
    texture: '/textures/morros_norte.jpg',
    color: '#6d28d9',
    glowColor: '#a855f7',
    spherePosition: [-4.0, 0, -5.5], // Noroeste
    cameraTarget: [0, 2, 0],
    cameraPosition: [8, 6, 12],
    terrainConfig: {
      type: 'karst',
      amplitude: 4.5,
      frequency: 0.08,
      color1: '#2d5a27',
      color2: '#8B7355',
      color3: '#a0a0a0',
      waterLevel: -2.0,
      dominant: 'rock',
    },
    hotspots: [
      {
        id: 'morros-1',
        position: [1, 3.5, 0],
        title: '¿Sabías que...?',
        content: 'Estos Morros eran arrecifes de coral bajo el mar hace 80 millones de años.',
        icon: '🪸',
      },
      {
        id: 'morros-2',
        position: [-2, 2.8, 2],
        title: 'Monumento Natural',
        content: 'Declarados Monumento Natural "Arístides Rojas" en 1949.',
        icon: '🏛️',
      },
      {
        id: 'morros-3',
        position: [3, 2, -2],
        title: 'Formaciones Kársticas',
        content: 'Estas formaciones de piedra caliza alcanzan alturas de hasta 300 metros.',
        icon: '🦅',
      },
    ],
  },
  valle: {
    id: 'valle',
    name: 'Valle de San Juan',
    subtitle: 'Zona Central',
    description: 'Corazón administrativo y geográfico del municipio',
    texture: '/textures/valle_san_juan.jpg',
    color: '#3b82f6',
    glowColor: '#60a5fa',
    spherePosition: [-6.5, 0, -3.0], // Más a la izquierda y separado
    cameraTarget: [0, 1, 0],
    cameraPosition: [10, 8, 14],
    terrainConfig: {
      type: 'valley',
      amplitude: 1.5,
      frequency: 0.04,
      color1: '#3a7d32',
      color2: '#7cb342',
      color3: '#c8a94e',
      waterLevel: 0.95, // Slightly raised river level
      dominant: 'soil',
    },
    hotspots: [
      {
        id: 'valle-1',
        position: [0, 1.5, 1],
        title: 'Cuenca del Río Guárico',
        content: 'El Valle es irrigado por el río Guárico y sus afluentes.',
        icon: '🌊',
      },
      {
        id: 'valle-2',
        position: [-6, 1.2, -3],
        title: 'Capital del Estado',
        content: 'San Juan de los Morros es la capital del estado Guárico.',
        icon: '🏢',
      },
    ],
  },
  piedemonte: {
    id: 'piedemonte',
    name: 'Piedemonte y Parapara',
    subtitle: 'Zona Sur',
    description: 'Zona de transición y parroquia histórica de Parapara',
    texture: '/textures/piedemonte.jpg',
    color: '#22c55e',
    glowColor: '#4ade80',
    spherePosition: [-4.0, 0, -0.5], // Más al frente y separado
    cameraTarget: [0, 3, 0],
    cameraPosition: [10, 7, 12],
    terrainConfig: {
      type: 'mountain',
      amplitude: 6,
      frequency: 0.06,
      color1: '#2d5a27',
      color2: '#6b4c2a',
      color3: '#8a8a8a',
      waterLevel: 0.0,
      dominant: 'grass',
    },
    hotspots: [
      {
        id: 'pied-1',
        position: [-2, 4, 1],
        title: 'Cerro Pariapán',
        content: 'El Cerro Pariapán es una elevación importante del piedemonte.',
        icon: '⛰️',
      },
      {
        id: 'pied-2',
        position: [2, 3.5, -1],
        title: 'Parapara',
        content: 'Parapara es una de las poblaciones más antiguas de la región.',
        icon: '🏘️',
      },
    ],
    quiz: {
      question: '¿Cuál es la función principal de este relieve para la ciudad?',
      options: [
        { id: 'A', text: 'Producción de minerales', correct: false },
        { id: 'B', text: 'Reserva hídrica y climática', correct: true },
      ],
      correctFeedback: '¡Correcto! Actúan como reserva hídrica.',
      incorrectFeedback: 'No exactamente. Su función principal es servir como reserva hídrica.',
    },
  },
};

export const zoneOrder = ['morros', 'valle', 'piedemonte'];
