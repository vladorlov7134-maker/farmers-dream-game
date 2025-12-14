import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
  ChevronUp, ChevronDown, Sprout, Flower2, Trees,
  CloudRain, Sun, Bug, Droplets, Sparkles
} from 'lucide-react';

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

interface GardenCarouselProps {
  farm: Plant[];
  onPlant: (position: { x: number; y: number; gardenId: number }) => void;
  onHarvest: (plantId: string) => void;
  onWater: (plantId: string) => void;
  selectedSeed: string | null;
}

const GARDENS = [
  {
    id: 0,
    name: "🥕 Огород",
    bgColor: "from-green-100 to-amber-100",
    icon: "🥕",
    description: "Классические овощи",
    plants: ['carrot', 'tomato', 'cucumber'],
    background: "bg-gradient-to-br from-green-50 to-amber-50",
    effects: ["🐝", "🦋", "🌾"]
  },
  {
    id: 1,
    name: "🍓 Ягоды",
    bgColor: "from-pink-100 to-rose-100",
    icon: "🍓",
    description: "Сладкие ягоды",
    plants: ['strawberry', 'berry', 'grape'],
    background: "bg-gradient-to-br from-pink-50 to-rose-50",
    effects: ["💎", "✨", "💧"]
  },
  {
    id: 2,
    name: "🌸 Цветы",
    bgColor: "from-purple-100 to-fuchsia-100",
    icon: "🌸",
    description: "Декоративные цветы",
    plants: ['flower', 'sunflower', 'tulip'],
    background: "bg-gradient-to-br from-purple-50 to-fuchsia-50",
    effects: ["🦋", "🌈", "🌺"]
  },
  {
    id: 3,
    name: "🌶️ Экзотика",
    bgColor: "from-orange-100 to-red-100",
    icon: "🌶️",
    description: "Тропические растения",
    plants: ['pumpkin', 'pepper', 'pineapple'],
    background: "bg-gradient-to-br from-orange-50 to-red-50",
    effects: ["🦜", "🌴", "💦"]
  }
];

const PLANTING_ZONES = [
  // Грядка 1: Огород
  [
    { x: 20, y: 30, width: 60, height: 40 },
    { x: 10, y: 75, width: 80, height: 20 },
  ],
  // Грядка 2: Ягоды
  [
    { x: 15, y: 20, width: 70, height: 60 },
    { x: 5, y: 80, width: 90, height: 15 },
  ],
  // Грядка 3: Цветы
  [
    { x: 10, y: 10, width: 80, height: 80 },
  ],
  // Грядка 4: Экзотика
  [
    { x: 5, y: 40, width: 90, height: 40 },
    { x: 30, y: 10, width: 40, height: 25 },
  ]
];

const GardenCarousel: React.FC<GardenCarouselProps> = ({
  farm = [],
  onPlant,
  onHarvest,
  onWater,
  selectedSeed
}) => {
  const [currentGarden, setCurrentGarden] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const y = useMotionValue(0);
  const scale = useTransform(y, [-300, 0, 300], [0.9, 1, 0.9]);
  const opacity = useTransform(y, [-300, -100, 0, 100, 300], [0, 0.5, 1, 0.5, 0]);

  // Фильтруем растения для текущей грядки
  const currentGardenPlants = farm.filter(p => {
    const plantGardenId = p.gardenId || 0;
    return plantGardenId === currentGarden;
  }).map(p => ({
    ...p,
    gardenId: p.gardenId || 0
  }));

  const currentGardenData = GARDENS[currentGarden];
  const plantingZones = PLANTING_ZONES[currentGarden];

  const handleDragStart = (event: any) => {
    let clientY: number;

    if (event.type === 'touchstart') {
      clientY = event.touches[0].clientY;
    } else {
      clientY = event.clientY;
    }

    setDragStartY(clientY);
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info?: PanInfo) => {
    setIsDragging(false);

    let clientY: number;

    if (event.type === 'touchend') {
      clientY = event.changedTouches[0].clientY;
    } else {
      clientY = event.clientY;
    }

    const deltaY = clientY - dragStartY;
    const threshold = 50;

    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0 && currentGarden > 0) {
        setCurrentGarden(prev => prev - 1);
      } else if (deltaY < 0 && currentGarden < GARDENS.length - 1) {
        setCurrentGarden(prev => prev + 1);
      }
    }

    y.set(0);
  };

  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentGarden < GARDENS.length - 1) {
      setCurrentGarden(prev => prev + 1);
    } else if (direction === 'down' && currentGarden > 0) {
      setCurrentGarden(prev => prev - 1);
    }
  };

  const handleGardenClick = (event: React.MouseEvent) => {
    if (isDragging) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !selectedSeed) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const isInZone = plantingZones.some(zone =>
      x >= zone.x && x <= zone.x + zone.width &&
      y >= zone.y && y <= zone.y + zone.height
    );

    if (isInZone) {
      onPlant({ x, y, gardenId: currentGarden });
    }
  };

  const handlePlantAction = (plant: Plant, action: 'harvest' | 'water') => {
    if (action === 'harvest') {
      onHarvest(plant.id);
    } else {
      onWater(plant.id);
    }
  };

  const renderGardenEffects = () => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {currentGardenData.effects.map((effect, idx) => (
          <motion.div
            key={idx}
            className="absolute text-2xl"
            initial={{ y: 0, x: Math.random() * 100 }}
            animate={{
              y: [0, -20, 0],
              x: [Math.random() * 80, Math.random() * 80 + 10]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: idx * 0.5
            }}
            style={{
              left: `${10 + idx * 25}%`,
              top: `${20 + idx * 15}%`
            }}
          >
            {effect}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="garden-carousel-container relative h-[500px] sm:h-[600px]">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 hidden sm:block">
        <div className="flex flex-col items-center space-y-2">
          {GARDENS.map((garden, idx) => (
            <button
              key={garden.id}
              onClick={() => setCurrentGarden(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentGarden ? 'bg-green-500 scale-125' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
        <button
          onClick={() => handleSwipe('up')}
          disabled={currentGarden === GARDENS.length - 1}
          className="p-2 rounded-full bg-white/80 shadow-lg mb-4 disabled:opacity-30"
        >
          <ChevronUp className="w-6 h-6 text-green-600" />
        </button>
        <button
          onClick={() => handleSwipe('down')}
          disabled={currentGarden === 0}
          className="p-2 rounded-full bg-white/80 shadow-lg disabled:opacity-30"
        >
          <ChevronDown className="w-6 h-6 text-green-600" />
        </button>
      </div>

      <motion.div
        ref={containerRef}
        style={{ y, scale, opacity }}
        drag="y"
        dragConstraints={{ top: -100, bottom: 100 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`relative w-full h-full rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl ${currentGardenData.background} bg-cover bg-center`}
        onClick={handleGardenClick}
      >
        <div className={`absolute inset-0 bg-gradient-to-b ${currentGardenData.bgColor} opacity-90`} />

        {renderGardenEffects()}

        <div className="absolute inset-0">
          {plantingZones.map((zone, idx) => (
            <motion.div
              key={idx}
              className="absolute border-2 border-dashed border-white/40 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedSeed ? 0.5 : 0.2 }}
              transition={{ duration: 0.3 }}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0">
          {currentGardenPlants.map((plant) => {
            const emoji =
              plant.type === 'carrot' ? '🥕' :
              plant.type === 'tomato' ? '🍅' :
              plant.type === 'cucumber' ? '🥒' :
              plant.type === 'strawberry' ? '🍓' :
              plant.type === 'pumpkin' ? '🎃' : '🌱';

            return (
              <motion.div
                key={plant.id}
                className="absolute cursor-pointer"
                initial={{ scale: 0 }}
                animate={{
                  scale: plant.is_withered ? 0.9 : 1,
                  y: plant.stage >= 3 ? [0, -3, 0] : 0
                }}
                transition={{
                  y: { repeat: plant.stage >= 3 ? Infinity : 0, duration: 2 }
                }}
                style={{
                  left: `${plant.position.x}%`,
                  top: `${plant.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (plant.stage >= 3 && !plant.is_withered) {
                    handlePlantAction(plant, 'harvest');
                  } else if (plant.is_withered) {
                    handlePlantAction(plant, 'water');
                  }
                }}
              >
                <div className="relative">
                  <motion.span
                    className="text-3xl sm:text-4xl block"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {plant.is_withered ? '🥀' : emoji}
                  </motion.span>

                  {plant.is_withered && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      💧
                    </motion.div>
                  )}
                  {plant.stage >= 3 && !plant.is_withered && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="absolute -top-1 -right-1 text-xs bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      !
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <span className="text-2xl">{currentGardenData.icon}</span>
              <span>{currentGardenData.name}</span>
            </h2>
            <p className="text-sm text-gray-600 text-center">{currentGardenData.description}</p>
          </motion.div>
        </div>

        <div className="sm:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="bg-black/70 text-white px-4 py-2 rounded-full text-sm"
          >
            Свайп вверх/вниз для смены грядки
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="mt-6 p-4 bg-gradient-to-r from-white/90 to-gray-50/90 rounded-2xl backdrop-blur-sm border border-white/50"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{currentGardenPlants.length}</div>
            <div className="text-sm text-gray-600">Растений на грядке</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {currentGardenPlants.filter(p => p.stage >= 3).length}
            </div>
            <div className="text-sm text-gray-600">Готово к сбору</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {plantingZones.length}
            </div>
            <div className="text-sm text-gray-600">Зон посадки</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {currentGarden + 1}/{GARDENS.length}
            </div>
            <div className="text-sm text-gray-600">Грядка</div>
          </div>
        </div>

        {selectedSeed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
          >
            <p className="text-green-700 text-sm flex items-center">
              <Sprout className="w-4 h-4 mr-2" />
              <span>Кликните в пределах пунктирной зоны, чтобы посадить <strong>{selectedSeed}</strong></span>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GardenCarousel;