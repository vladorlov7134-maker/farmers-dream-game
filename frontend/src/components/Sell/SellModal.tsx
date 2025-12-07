// frontend/src/components/Sell/SellModal.tsx
import React, { useState } from 'react';
import { PlantInfo } from '../../types/game.types';
import { Coins } from 'lucide-react';

interface HarvestItem {
  plantType: string;
  count: number;
}

interface SellModalProps {
  harvest: HarvestItem[];
  plantsInfo: PlantInfo[];
  onSell: (plantType: string, amount: number) => void;
  onClose: () => void;
}

const SellModal: React.FC<SellModalProps> = ({
  harvest,
  plantsInfo,
  onSell,
  onClose
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    harvest.reduce((acc, item) => ({ ...acc, [item.plantType]: 1 }), {})
  );

  const getPlantInfo = (plantType: string): PlantInfo | undefined => {
    return plantsInfo.find(p => p.type === plantType);
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
    return emojis[type] || '🌾';
  };

  const increaseQuantity = (plantType: string) => {
    const item = harvest.find(h => h.plantType === plantType);
    if (item) {
      setQuantities(prev => ({
        ...prev,
        [plantType]: Math.min(item.count, (prev[plantType] || 1) + 1)
      }));
    }
  };

  const decreaseQuantity = (plantType: string) => {
    setQuantities(prev => ({
      ...prev,
      [plantType]: Math.max(1, (prev[plantType] || 1) - 1)
    }));
  };

  const calculateTotalPrice = () => {
    return harvest.reduce((total, item) => {
      const plantInfo = getPlantInfo(item.plantType);
      const price = plantInfo?.sell_price || 0;
      const quantity = quantities[item.plantType] || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handleSellAll = () => {
    harvest.forEach(item => {
      onSell(item.plantType, item.count);
    });
    onClose();
  };

  const handleSellSelected = () => {
    harvest.forEach(item => {
      const quantity = quantities[item.plantType] || 0;
      if (quantity > 0) {
        onSell(item.plantType, quantity);
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">💰 Продажа урожая</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                <Coins className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-700">Всего: {calculateTotalPrice()}🪙</span>
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

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {harvest.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-600 text-lg">Урожая нет</p>
              <p className="text-gray-500 text-sm mt-2">Сначала соберите растения с фермы</p>
            </div>
          ) : (
            <div className="space-y-4">
              {harvest.map((item) => {
                const plantInfo = getPlantInfo(item.plantType);
                const quantity = quantities[item.plantType] || 1;
                const itemTotal = (plantInfo?.sell_price || 0) * quantity;
                const plantName = getPlantName(item.plantType);
                const plantEmoji = getPlantEmoji(item.plantType);

                return (
                  <div key={item.plantType} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{plantEmoji}</span>
                        <div>
                          <h3 className="font-bold text-gray-800">{plantName}</h3>
                          <div className="text-sm text-gray-600">
                            В наличии: {item.count} шт.
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {plantInfo?.sell_price || 0}🪙
                        </div>
                        <div className="text-xs text-gray-500">за шт.</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Продать:</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQuantity(item.plantType)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                          >
                            −
                          </button>
                          <span className="font-bold w-12 text-center">{quantity}</span>
                          <button
                            onClick={() => increaseQuantity(item.plantType)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onSell(item.plantType, item.count)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200"
                        >
                          Все
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <span className="text-sm text-gray-600">Итого за этот товар:</span>
                      <span className="font-bold text-green-600">{itemTotal}🪙</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {harvest.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t px-6 py-4">
            <div className="flex gap-3">
              <button
                onClick={handleSellSelected}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
              >
                Продать выбранное ({calculateTotalPrice()}🪙)
              </button>
              <button
                onClick={handleSellAll}
                className="px-6 bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors"
              >
                Всё
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellModal;