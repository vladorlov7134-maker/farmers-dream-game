// frontend/src/components/LevelSystem/LevelUpModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Star, Award, Gift, Zap, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';
import { LevelUpData } from '../../types/game.types';

interface LevelUpModalProps {
  levelData: LevelUpData;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ levelData, onClose }) => {
  const { old_level, new_level, rewards } = levelData;

  return (
    <>
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.1}
      />

      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-br from-yellow-50 via-white to-emerald-50 rounded-3xl max-w-md w-full shadow-2xl border-2 border-yellow-200 overflow-hidden"
        >
          {/* Заголовок */}
          <div className="relative p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex justify-center items-center space-x-6 mb-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-4xl font-bold text-gray-800"
              >
                {old_level}
              </motion.div>

              <div className="text-3xl text-yellow-500">
                <Sparkles className="w-8 h-8" />
              </div>

              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-5xl font-bold text-green-600"
              >
                {new_level}
              </motion.div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🎉 Уровень повышен!
            </h2>
            <p className="text-gray-600">
              Поздравляем! Новые возможности открыты!
            </p>
          </div>

          {/* Награды */}
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Gift className="w-6 h-6 mr-2 text-yellow-600" />
                Ваши награды
              </h3>

              <div className="space-y-4">
                {/* Монеты */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between p-3 bg-white/80 rounded-xl"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xl">💰</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">Монеты</div>
                      <div className="text-sm text-gray-600">Для покупки семян</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">
                    +{rewards.coins}
                  </div>
                </motion.div>

                {/* Кристаллы */}
                {rewards.diamonds && rewards.diamonds > 0 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between p-3 bg-white/80 rounded-xl"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xl">💎</span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">Кристаллы</div>
                        <div className="text-sm text-gray-600">Особая валюта</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      +{rewards.diamonds}
                    </div>
                  </motion.div>
                )}

                {/* Новые растения */}
                {rewards.unlocked_plants && rewards.unlocked_plants.length > 0 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-3 bg-white/80 rounded-xl"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xl">🌱</span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">Новые растения</div>
                        <div className="text-sm text-gray-600">Теперь доступны в магазине</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rewards.unlocked_plants.map((plant: string, index: number) => (
                        <div
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm"
                        >
                          {plant === 'carrot' && '🥕 Морковь'}
                          {plant === 'tomato' && '🍅 Помидор'}
                          {plant === 'cucumber' && '🥒 Огурец'}
                          {plant === 'strawberry' && '🍓 Клубника'}
                          {plant === 'pumpkin' && '🎃 Тыква'}
                          {!['carrot', 'tomato', 'cucumber', 'strawberry', 'pumpkin'].includes(plant) && plant}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Новые возможности */}
                {rewards.unlocked_features && rewards.unlocked_features.length > 0 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-3 bg-white/80 rounded-xl"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">Новые возможности</div>
                        <div className="text-sm text-gray-600">Доступны новые функции</div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      {rewards.unlocked_features.map((feature: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-700"
                        >
                          <span className="text-green-500 mr-2">✓</span>
                          {feature === 'shop' && '🛒 Расширенный магазин'}
                          {feature === 'sell' && '💰 Оптовая продажа'}
                          {feature === 'bonus' && '🎁 Ежедневный бонус'}
                          {!['shop', 'sell', 'bonus'].includes(feature) && feature}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Кнопка продолжить */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition"
            >
              Продолжить игру 🚀
            </motion.button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Уровень {new_level} открывает новые горизонты!
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LevelUpModal;