// frontend/src/components/Shop/ShopModal.tsx
import React, { useState } from 'react';
import { PlantInfo } from '../../types/game.types';
import { Coins } from 'lucide-react';

interface ShopModalProps {
  plantsInfo: PlantInfo[];
  coins: number;
  onBuy: (plantType: string, amount: number) => void;
  onClose: () => void;
  unlockedPlants: string[];
}

const ShopModal: React.FC<ShopModalProps> = ({
  plantsInfo,
  coins,
  onBuy,
  onClose,
  unlockedPlants
}) => {
  const [selectedAmounts, setSelectedAmounts] = useState<Record<string, number>>({});

  const handleBuy = (plantType: string) => {
    const amount = selectedAmounts[plantType] || 1;
    onBuy(plantType, amount);
    // Сбросить количество после покупки
    setSelectedAmounts(prev => ({ ...prev, [plantType]: 1 }));
  };

  const increaseAmount = (plantType: string) => {
    setSelectedAmounts(prev => ({
      ...prev,
      [plantType]: (prev[plantType] || 1) + 1
    }));
  };

  const decreaseAmount = (plantType: string) => {
    setSelectedAmounts(prev => ({
      ...prev,
      [plantType]: Math.max(1, (prev[plantType] || 1) - 1)
    }));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Обычный';
      case 'uncommon': return 'Необычный';
      case 'rare': return 'Редкий';
      case 'epic': return 'Эпический';
      default: return 'Обычный';
    }
  };

  const getPlantName = (type: string) => {
    const names: Record<string, string> = {
      carrot: 'Морковь',
      tomato: 'Помидор',
      cucumber: 'Огурец',
      strawberry: 'Клубника',
      pumpkin: 'Тыква'
    };
    return names[type] || type;
  };

  const getPlantEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      carrot: '🥕',
      tomato: '🍅',
      cucumber: '🥒',
      strawberry: '🍓',
      pumpkin: '🎃'
    };
    return emojis[type] || '🌱';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🛒 Магазин семян</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-bold text-yellow-700">{coins}🪙</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plantsInfo.map((plant) => {
              const isUnlocked = unlockedPlants.includes(plant.type);
              const amount = selectedAmounts[plant.type] || 1;
              const totalPrice = plant.seed_price * amount;
              const canAfford = coins >= totalPrice;
              const plantName = getPlantName(plant.type);

              return (
                <div
                  key={plant.type}
                  className={`border rounded-xl p-4 transition-all ${
                    isUnlocked
                      ? 'hover:border-green-400 hover:shadow-lg'
                      : 'opacity-60'
                  } ${!isUnlocked ? 'cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getPlantEmoji(plant.type)}</span>
                          <div>
                            <h3 className="font-bold text-gray-800">{plantName}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(plant.rarity)}`}>
                              {getRarityName(plant.rarity)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {plant.seed_price}🪙
                          </div>
                          <div className="text-xs text-gray-500">за 1 шт.</div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <div>Продажа: {plant.sell_price}🪙 за шт.</div>
                        <div>Время роста: {Math.floor(plant.growth_time / 60)} мин</div>
                      </div>

                      {!isUnlocked && (
                        <div className="mb-3 p-2 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-yellow-700 text-center">
                            🔒 Откроется на {plant.required_level} уровне
                          </p>
                        </div>
                      )}
                    </div>

                    {isUnlocked && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">Количество:</div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decreaseAmount(plant.type)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                              −
                            </button>
                            <span className="font-bold w-8 text-center">{amount}</span>
                            <button
                              onClick={() => increaseAmount(plant.type)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between font-bold">
                          <span>Итого:</span>
                          <span className={`${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                            {totalPrice}🪙
                          </span>
                        </div>

                        <button
                          onClick={() => handleBuy(plant.type)}
                          disabled={!canAfford}
                          className={`w-full py-2 rounded-lg font-bold transition-colors ${
                            canAfford
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? `Купить ${amount} шт.` : 'Недостаточно монет'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopModal;