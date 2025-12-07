// frontend/src/components/LevelSystem/LevelUpModal.tsx
import React, { useEffect } from 'react';
import { LevelUpData } from '../../types/game.types';
import Confetti from 'react-confetti';

interface LevelUpModalProps {
  levelData: LevelUpData;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ levelData, onClose }) => {
  const { new_level, rewards, old_level } = levelData;

  useEffect(() => {
    // Автоматическое закрытие через 5 секунд
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const renderReward = (type: string, value: number) => {
    const rewardIcons: Record<string, string> = {
      coins: '🪙',
      diamonds: '💎',
      seeds: '🌱'
    };

    const rewardNames: Record<string, string> = {
      coins: 'Монет',
      diamonds: 'Алмазов',
      seeds: 'Семян'
    };

    return (
      <div key={type} className="flex items-center justify-between bg-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{rewardIcons[type]}</span>
          <div>
            <div className="font-bold text-white">{rewardNames[type]}</div>
            <div className="text-white/80 text-sm">Награда</div>
          </div>
        </div>
        <div className="text-2xl font-bold text-yellow-300">+{value}</div>
      </div>
    );
  };

  return (
    <>
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div className="relative bg-gradient-to-br from-purple-700 to-pink-600 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-popIn">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">Новый уровень!</h2>
            <div className="text-white/80">
              {old_level} → <span className="text-4xl font-bold text-yellow-300">{new_level}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-3">Полученные награды:</h3>
            <div className="space-y-3">
              {Object.entries(rewards).map(([type, value]) =>
                renderReward(type, value)
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-white text-purple-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Продолжить игру
          </button>
        </div>
      </div>
    </>
  );
};

export default LevelUpModal;