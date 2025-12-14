// frontend/src/game/graphics/Modern2DFarm.tsx (ПОЛНЫЙ ФАЙЛ С ИСПРАВЛЕННЫМИ ТИПАМИ)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Plant {
  id: string;
  type: string;
  stage: number;
  planted_at: string;
  last_watered: string;
  is_withered: boolean;
  position: {
    x: number;
    y: number;
    gardenId?: number;
  };
  gardenId?: number;
}

// Интерфейс для частиц
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  type: 'plant' | 'harvest' | 'water';
}

interface Modern2DFarmProps {
  farm: Plant[];
  onPlant: (position: { x: number; y: number; gardenId: number }) => void;
  onHarvest: (plantId: string) => void;
  onWater: (plantId: string) => void;
  selectedSeed: string | null;
}

// === СОВРЕМЕННАЯ 2D ГРАФИКА ===

// Размеры и масштаб
const TILE_SIZE = 96; // Большие тайлы для детализации
const PLANT_SIZE = 64;
const GRID_COLS = 6;
const GRID_ROWS = 5;
const TOTAL_WIDTH = TILE_SIZE * GRID_COLS;
const TOTAL_HEIGHT = TILE_SIZE * GRID_ROWS;

// ТЕМЫ ГРЯДОК (современный дизайн)
const MODERN_THEMES = [
  {
    id: 0,
    name: "🌿 ЭКО-ФЕРМА",
    icon: "🌿",
    description: "Экологичное земледелие",
    colors: {
      soil: "#8B7355",
      soilLight: "#A89070",
      soilDark: "#6B5A45",
      accent: "#4ADE80",
      accentLight: "#86EFAC",
      highlight: "#10B981"
    },
    background: "bg-gradient-to-br from-emerald-50/80 to-teal-50/80",
    border: "border-2 border-emerald-200/60",
    effects: ["🌱", "💧", "🪴"],
    particleColor: "#10B981"
  },
  {
    id: 1,
    name: "🍓 ЯГОДНЫЙ САД",
    icon: "🍓",
    description: "Сочные ягоды в террасах",
    colors: {
      soil: "#C4625F",
      soilLight: "#E6B8A2",
      soilDark: "#A0525D",
      accent: "#EC4899",
      accentLight: "#F9A8D4",
      highlight: "#DB2777"
    },
    background: "bg-gradient-to-br from-rose-50/80 to-pink-50/80",
    border: "border-2 border-rose-200/60",
    effects: ["🍓", "✨", "💖"],
    particleColor: "#EC4899"
  },
  {
    id: 2,
    name: "🏙️ УРБАН-ФЕРМА",
    icon: "🏙️",
    description: "Городское фермерство",
    colors: {
      soil: "#6B7280",
      soilLight: "#9CA3AF",
      soilDark: "#4B5563",
      accent: "#3B82F6",
      accentLight: "#93C5FD",
      highlight: "#1D4ED8"
    },
    background: "bg-gradient-to-br from-slate-50/80 to-blue-50/80",
    border: "border-2 border-slate-200/60",
    effects: ["🏢", "⚡", "💡"],
    particleColor: "#3B82F6"
  },
  {
    id: 3,
    name: "✨ ВОЛШЕБНЫЙ САД",
    icon: "✨",
    description: "Магические растения",
    colors: {
      soil: "#7C3AED",
      soilLight: "#A78BFA",
      soilDark: "#5B21B6",
      accent: "#8B5CF6",
      accentLight: "#C4B5FD",
      highlight: "#7C3AED"
    },
    background: "bg-gradient-to-br from-violet-50/80 to-purple-50/80",
    border: "border-2 border-purple-200/60",
    effects: ["🌟", "🔮", "💫"],
    particleColor: "#8B5CF6"
  }
];

// ДЕТАЛИЗИРОВАННЫЕ ТЕКСТУРЫ ДЛЯ СОВРЕМЕННОЙ 2D ГРАФИКИ
const createSoilTexture = (colors: any) => {
  // Создаем canvas для динамической текстуры земли
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Основной цвет
  ctx.fillStyle = colors.soil;
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  // Добавляем детализацию (камни, комки)
  ctx.fillStyle = colors.soilDark;
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * TILE_SIZE;
    const y = Math.random() * TILE_SIZE;
    const size = 2 + Math.random() * 4;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Светлые вкрапления
  ctx.fillStyle = colors.soilLight;
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * TILE_SIZE;
    const y = Math.random() * TILE_SIZE;
    const size = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Тень для объема
  const gradient = ctx.createLinearGradient(0, 0, 0, TILE_SIZE);
  gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  return canvas.toDataURL();
};

// ДЕТАЛИЗИРОВАННЫЕ РАСТЕНИЯ (векторные SVG с градиентами)
const PLANT_SPRITES = {
  carrot: {
    stages: [
      // Стадия 1
      `<svg width="${PLANT_SIZE}" height="${PLANT_SIZE}" viewBox="0 0 ${PLANT_SIZE} ${PLANT_SIZE}">
        <defs>
          <linearGradient id="carrotStem1" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stop-color="#9BE564"/>
            <stop offset="100%" stop-color="#7CCD3C"/>
          </linearGradient>
        </defs>
        <path d="M${PLANT_SIZE/2-2} ${PLANT_SIZE-10} L${PLANT_SIZE/2-2} ${PLANT_SIZE-20}
                M${PLANT_SIZE/2+2} ${PLANT_SIZE-10} L${PLANT_SIZE/2+2} ${PLANT_SIZE-18}"
              stroke="url(#carrotStem1)" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="${PLANT_SIZE/2}" cy="${PLANT_SIZE-22}" rx="6" ry="3" fill="#9BE564" opacity="0.8"/>
      </svg>`,
      // Стадия 2
      `<svg width="${PLANT_SIZE}" height="${PLANT_SIZE}" viewBox="0 0 ${PLANT_SIZE} ${PLANT_SIZE}">
        <defs>
          <linearGradient id="carrotStem2" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stop-color="#6A994E"/>
            <stop offset="100%" stop-color="#9BE564"/>
          </linearGradient>
        </defs>
        <path d="M${PLANT_SIZE/2} ${PLANT_SIZE-8} L${PLANT_SIZE/2} ${PLANT_SIZE-30}"
              stroke="url(#carrotStem2)" stroke-width="4" stroke-linecap="round"/>
        <path d="M${PLANT_SIZE/2-8} ${PLANT_SIZE-25} Q${PLANT_SIZE/2-12} ${PLANT_SIZE-35} ${PLANT_SIZE/2-4} ${PLANT_SIZE-28}
                M${PLANT_SIZE/2+8} ${PLANT_SIZE-25} Q${PLANT_SIZE/2+12} ${PLANT_SIZE-35} ${PLANT_SIZE/2+4} ${PLANT_SIZE-28}"
              stroke="#7CCD3C" stroke-width="3" fill="none"/>
        <ellipse cx="${PLANT_SIZE/2}" cy="${PLANT_SIZE-32}" rx="8" ry="4" fill="#6A994E" opacity="0.9"/>
      </svg>`,
      // Стадия 3
      `<svg width="${PLANT_SIZE}" height="${PLANT_SIZE}" viewBox="0 0 ${PLANT_SIZE} ${PLANT_SIZE}">
        <defs>
          <linearGradient id="carrotBody" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stop-color="#FF7F50"/>
            <stop offset="100%" stop-color="#FF4500"/>
          </linearGradient>
          <linearGradient id="carrotLeaves" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stop-color="#6A994E"/>
            <stop offset="100%" stop-color="#9BE564"/>
          </linearGradient>
        </defs>
        <!-- Морковь -->
        <path d="M${PLANT_SIZE/2-6} ${PLANT_SIZE-15}
                Q${PLANT_SIZE/2} ${PLANT_SIZE-40} ${PLANT_SIZE/2+6} ${PLANT_SIZE-15}"
              fill="url(#carrotBody)" stroke="#D2691E" stroke-width="1"/>
        <!-- Стебель -->
        <path d="M${PLANT_SIZE/2} ${PLANT_SIZE-40} L${PLANT_SIZE/2} ${PLANT_SIZE-50}"
              stroke="url(#carrotLeaves)" stroke-width="3"/>
        <!-- Листья -->
        <path d="M${PLANT_SIZE/2} ${PLANT_SIZE-50}
                Q${PLANT_SIZE/2-12} ${PLANT_SIZE-60} ${PLANT_SIZE/2-6} ${PLANT_SIZE-52}
                M${PLANT_SIZE/2} ${PLANT_SIZE-50}
                Q${PLANT_SIZE/2+12} ${PLANT_SIZE-60} ${PLANT_SIZE/2+6} ${PLANT_SIZE-52}"
              stroke="#7CCD3C" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>`,
      // Стадия 4 (готово)
      `<svg width="${PLANT_SIZE}" height="${PLANT_SIZE}" viewBox="0 0 ${PLANT_SIZE} ${PLANT_SIZE}">
        <defs>
          <linearGradient id="carrotRipe" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stop-color="#FF4500"/>
            <stop offset="100%" stop-color="#FF6347"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- Большая морковь с бликом -->
        <ellipse cx="${PLANT_SIZE/2}" cy="${PLANT_SIZE-20}" rx="10" ry="15" fill="url(#carrotRipe)" filter="url(#glow)"/>
        <ellipse cx="${PLANT_SIZE/2+3}" cy="${PLANT_SIZE-25}" rx="3" ry="5" fill="#FFFFFF" opacity="0.3"/>
        <!-- Пышная ботва -->
        <path d="M${PLANT_SIZE/2} ${PLANT_SIZE-35}
                Q${PLANT_SIZE/2-15} ${PLANT_SIZE-55} ${PLANT_SIZE/2-8} ${PLANT_SIZE-40}
                M${PLANT_SIZE/2} ${PLANT_SIZE-35}
                Q${PLANT_SIZE/2+15} ${PLANT_SIZE-55} ${PLANT_SIZE/2+8} ${PLANT_SIZE-40}
                M${PLANT_SIZE/2} ${PLANT_SIZE-35}
                Q${PLANT_SIZE/2-5} ${PLANT_SIZE-60} ${PLANT_SIZE/2+5} ${PLANT_SIZE-60}"
              stroke="#6A994E" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Эффект готовности -->
        <circle cx="${PLANT_SIZE/2}" cy="${PLANT_SIZE-45}" r="2" fill="#FFD700">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>`
    ]
  },
  strawberry: {
    stages: [
      // ... аналогично детализированные стадии клубники
    ]
  }
  // Можно добавить другие растения
};

const Modern2DFarm: React.FC<Modern2DFarmProps> = ({
  farm = [],
  onPlant,
  onHarvest,
  onWater,
  selectedSeed
}) => {
  const [currentGarden, setCurrentGarden] = useState(0);
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]); // Исправлено: добавлен тип
  const [soilTextures, setSoilTextures] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTheme = MODERN_THEMES[currentGarden];

  // Инициализация текстур
  useEffect(() => {
    const textures = MODERN_THEMES.map(theme =>
      createSoilTexture(theme.colors)
    );
    setSoilTextures(textures);
  }, []);

  // Фильтруем растения для текущей грядки
  const currentGardenPlants = farm.filter(p => {
    const plantGardenId = p.gardenId || 0;
    return plantGardenId === currentGarden;
  });

  // Создание частиц для эффектов
  const createParticles = useCallback((x: number, y: number, type: 'plant' | 'harvest' | 'water') => {
    const newParticles: Particle[] = []; // Исправлено: добавлен тип
    const count = type === 'harvest' ? 12 : 6;
    const color = type === 'water' ? '#3B82F6' : currentTheme.particleColor;

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        color,
        size: 4 + Math.random() * 6,
        speedX: (Math.random() - 0.5) * 8,
        speedY: -Math.random() * 6 - 2,
        life: 1,
        type
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, [currentTheme]);

  // Анимация частиц
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + p.speedX,
          y: p.y + p.speedY,
          life: p.life - 0.02,
          size: p.size * 0.98
        })).filter(p => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  // Рисуем сетку на canvas
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || soilTextures.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем землю
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const tileX = x * TILE_SIZE;
        const tileY = y * TILE_SIZE;

        // Рисуем текстуру земли
        const img = new Image();
        img.src = soilTextures[currentGarden];

        img.onload = () => {
          ctx.drawImage(img, tileX, tileY, TILE_SIZE, TILE_SIZE);

          // Добавляем тень между тайлами
          ctx.fillStyle = 'rgba(0,0,0,0.1)';
          ctx.fillRect(tileX, tileY + TILE_SIZE - 2, TILE_SIZE, 2);
          ctx.fillRect(tileX + TILE_SIZE - 2, tileY, 2, TILE_SIZE);
        };

        // Подсветка при наведении
        if (hoveredTile?.x === x && hoveredTile?.y === y) {
          ctx.fillStyle = `${currentTheme.colors.highlight}20`;
          ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

          // Обводка
          ctx.strokeStyle = currentTheme.colors.accent;
          ctx.lineWidth = 2;
          ctx.strokeRect(tileX + 1, tileY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        }

        // Если выбрано семя - показываем доступные клетки
        if (selectedSeed) {
          const hasPlant = currentGardenPlants.some(p =>
            Math.floor(p.position.x / 100 * GRID_COLS) === x &&
            Math.floor(p.position.y / 100 * GRID_ROWS) === y
          );

          if (!hasPlant) {
            ctx.fillStyle = `${currentTheme.colors.accent}40`;
            ctx.beginPath();
            ctx.arc(
              tileX + TILE_SIZE / 2,
              tileY + TILE_SIZE / 2,
              TILE_SIZE / 4,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }
    }

    // Рисуем растения
    currentGardenPlants.forEach(plant => {
      const gridX = Math.floor(plant.position.x / 100 * GRID_COLS);
      const gridY = Math.floor(plant.position.y / 100 * GRID_ROWS);

      const x = gridX * TILE_SIZE + (TILE_SIZE - PLANT_SIZE) / 2;
      const y = gridY * TILE_SIZE + (TILE_SIZE - PLANT_SIZE) / 2 - 10;

      // Здесь можно отрисовывать SVG растения
      // Для простоты используем эмодзи, но можно заменить на SVG
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let emoji = '🌱';
      if (plant.type === 'carrot') {
        const stages = ['🌱', '🌿', '🥕', '🥕✨'];
        emoji = stages[Math.min(plant.stage, 3)];
      } else if (plant.type === 'strawberry') {
        const stages = ['🌱', '🍓🌿', '🍓', '🍓💎'];
        emoji = stages[Math.min(plant.stage, 3)];
      }

      if (plant.is_withered) {
        ctx.fillStyle = '#666';
        emoji = '🥀';
      } else if (plant.stage >= 3) {
        // Эффект свечения для готовых растений
        ctx.shadowColor = currentTheme.colors.accent;
        ctx.shadowBlur = 10;
      }

      ctx.fillText(emoji, x + PLANT_SIZE / 2, y + PLANT_SIZE / 2);

      // Сбрасываем тень
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Индикаторы
      if (plant.is_withered) {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(x + PLANT_SIZE - 8, y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText('💧', x + PLANT_SIZE - 8, y + 8);
      } else if (plant.stage >= 3) {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(x + PLANT_SIZE - 8, y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText('!', x + PLANT_SIZE - 8, y + 8);
      }
    });
  }, [currentGarden, hoveredTile, selectedSeed, currentGardenPlants, soilTextures, currentTheme]);

  // Обработчик клика
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    if (gridX >= 0 && gridX < GRID_COLS && gridY >= 0 && gridY < GRID_ROWS) {
      const plant = currentGardenPlants.find(p =>
        Math.floor(p.position.x / 100 * GRID_COLS) === gridX &&
        Math.floor(p.position.y / 100 * GRID_ROWS) === gridY
      );

      if (plant) {
        createParticles(x, y, plant.is_withered ? 'water' : 'harvest');

        if (plant.stage >= 3 && !plant.is_withered) {
          onHarvest(plant.id);
        } else if (plant.is_withered) {
          onWater(plant.id);
        }
      } else if (selectedSeed) {
        createParticles(x, y, 'plant');

        const position = {
          x: (gridX / GRID_COLS) * 100,
          y: (gridY / GRID_ROWS) * 100,
          gardenId: currentGarden
        };
        onPlant(position);
      }
    }
  };

  // Перерисовываем при изменениях
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Рендерим частицы
  const renderParticles = () => {
    return particles.map(p => (
      <motion.div
        key={p.id}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          backgroundColor: p.color,
          boxShadow: `0 0 ${p.size/2}px ${p.color}`
        }}
        initial={{ opacity: 1, scale: 0 }}
        animate={{
          opacity: p.life,
          scale: 1,
          y: p.y - 50
        }}
        transition={{ duration: 1 }}
      />
    ));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className={`relative rounded-2xl ${currentTheme.background} ${currentTheme.border} p-6 backdrop-blur-sm`}>

        {/* Заголовок с анимацией */}
        <motion.div
          className="flex items-center justify-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{currentTheme.icon}</span>
              <div className="text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {currentTheme.name}
                </h2>
                <p className="text-sm text-gray-600">{currentTheme.description}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Основной canvas с фермой */}
        <div className="relative mx-auto" style={{ width: TOTAL_WIDTH, height: TOTAL_HEIGHT }}>
          <canvas
            ref={canvasRef}
            width={TOTAL_WIDTH}
            height={TOTAL_HEIGHT}
            className="rounded-xl shadow-2xl cursor-pointer"
            onClick={handleCanvasClick}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
              const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
              setHoveredTile({ x, y });
            }}
            onMouseLeave={() => setHoveredTile(null)}
          />

          {/* Частицы поверх canvas */}
          <div className="absolute inset-0 pointer-events-none">
            {renderParticles()}
          </div>

          {/* Эффекты темы */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            {currentTheme.effects.map((effect, idx) => (
              <motion.div
                key={idx}
                className="absolute text-2xl opacity-20"
                animate={{
                  y: [0, -20, 0],
                  x: [idx * 30, idx * 30 + 10],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 8 + idx * 2,
                  repeat: Infinity,
                  delay: idx * 0.5
                }}
                style={{
                  left: `${20 + idx * 20}%`,
                  top: `${10 + idx * 15}%`
                }}
              >
                {effect}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Панель переключения грядок */}
        <div className="flex justify-center space-x-4 mt-6">
          {MODERN_THEMES.map((theme, index) => (
            <motion.button
              key={theme.id}
              onClick={() => setCurrentGarden(index)}
              className={`px-4 py-2 rounded-full transition-all flex items-center space-x-2 ${
                index === currentGarden
                  ? 'bg-white shadow-lg scale-105'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl">{theme.icon}</span>
              <span className="font-medium text-gray-700">{theme.name.split(' ')[0]}</span>
            </motion.button>
          ))}
        </div>

        {/* Подсказка */}
        {selectedSeed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-200/50"
          >
            <p className="text-green-700 text-center font-medium">
              🌱 Выбрано: <span className="font-bold">{selectedSeed}</span>.
              Кликните на свободную клетку для посадки!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Modern2DFarm;