import React, { useState } from 'react';
import { PlantInfo } from '../../types/game.types';
import { Coins } from 'lucide-react';

interface SellModalProps {
  plantsInfo: PlantInfo[];
  onSell: (plantType: string, quantity: number) => void;
  onClose: () => void;
  gameState?: any; // Добавим gameState в пропсы
}

const SellModal: React.FC<SellModalProps> = ({
  plantsInfo,
  onSell,
  onClose,
  gameState
}) => {
  const [selectedAmounts, setSelectedAmounts] = useState<Record<string, number>>({});

  // Безопасное получение инвентаря
  const inventory = gameState?.inventory?.harvest || {};

  // Безопасный расчет общего инвентаря
  const totalInventoryValue = Object.values(inventory).reduce((sum: number, count: any) => {
    return sum + (Number(count) || 0);
  }, 0);

  // Получаем растения с урожаем
  const plantsWithHarvest = plantsInfo
    .filter(plant => plant && plant.type && (inventory[plant.type] || 0) > 0)
    .map(plant => ({
      ...plant,
      harvestCount: Number(inventory[plant.type]) || 0,
      totalValue: (Number(inventory[plant.type]) || 0) * (plant.sell_price || 0)
    }));

  const handleSell = (plantType: string) => {
    const amount = selectedAmounts[plantType] || 1;
    onSell(plantType, amount);
    setSelectedAmounts(prev => ({ ...prev, [plantType]: 1 }));
  };

  const increaseAmount = (plantType: string, maxAmount: number) => {
    setSelectedAmounts(prev => ({
      ...prev,
      [plantType]: Math.min(maxAmount, (prev[plantType] || 1) + 1)
    }));
  };

  const decreaseAmount = (plantType: string) => {
    setSelectedAmounts(prev => ({
      ...prev,
      [plantType]: Math.max(1, (prev[plantType] || 1) - 1)
    }));
  };

  const getPlantName = (type: string | undefined) => {
    if (!type) return 'Неизвестное растение';
    const names: Record<string, string> = {
      carrot: 'Морковь',
      tomato: 'Помидор',
      cucumber: 'Огурец',
      strawberry: 'Клубника',
      pumpkin: 'Тыква'
    };
    return names[type] || type;
  };

  const getPlantEmoji = (type: string | undefined) => {
    if (!type) return '🌱';
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
            <h2 className="text-2xl font-bold text-gray-800">💰 Продать урожай</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full">
                <Coins className="h-4 w-4 text-amber-600" />
                <span className="font-bold text-amber-700">
                  Всего урожая: {totalInventoryValue} шт.
                </span>
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
          {plantsWithHarvest.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantsWithHarvest.map((plant, index) => {
                const amount = selectedAmounts[plant.type] || 1;
                const maxAmount = plant.harvestCount;
                const totalPrice = (plant.sell_price || 0) * amount;
                const plantName = getPlantName(plant.type);
                const plantEmoji = getPlantEmoji(plant.type);

                return (
                  <div
                    key={`${plant.type}-${index}`}
                    className="border rounded-xl p-4 hover:border-amber-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{plantEmoji}</span>
                            <div>
                              <h3 className="font-bold text-gray-800">{plantName}</h3>
                              <div className="text-xs text-gray-500">
                                В инвентаре: {plant.harvestCount} шт.
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {plant.sell_price}🪙
                            </div>
                            <div className="text-xs text-gray-500">за 1 шт.</div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-4">
                          <div>Можно продать: {plant.harvestCount} шт.</div>
                          <div>Общая стоимость: {plant.totalValue}🪙</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">Количество:</div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decreaseAmount(plant.type)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                              disabled={amount <= 1}
                            >
                              −
                            </button>
                            <span className="font-bold w-8 text-center">{amount}</span>
                            <button
                              onClick={() => increaseAmount(plant.type, maxAmount)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                              disabled={amount >= maxAmount}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between font-bold">
                          <span>Итого:</span>
                          <span className="text-green-600">
                            {totalPrice}🪙
                          </span>
                        </div>

                        <button
                          onClick={() => handleSell(plant.type)}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors"
                        >
                          Продать {amount} шт. за {totalPrice}🪙
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl">🌾</span>
              <p className="text-gray-500 mt-2">Нет урожая для продажи</p>
              <p className="text-sm text-gray-400 mt-1">
                Соберите урожай с растений, чтобы продать его здесь
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellModal;