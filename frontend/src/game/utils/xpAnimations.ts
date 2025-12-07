// frontend/src/utils/xpAnimations.ts
export const showXpAnimation = (xpAmount: number, position: { x: number, y: number }) => {
  // Создаем элемент для анимации XP
  const xpElement = document.createElement('div');
  xpElement.className = 'fixed z-50 pointer-events-none';
  xpElement.style.left = `${position.x}px`;
  xpElement.style.top = `${position.y}px`;
  xpElement.style.transform = 'translate(-50%, -50%)';
  xpElement.innerHTML = `
    <div class="animate-xpFloat text-green-500 font-bold text-xl">
      +${xpAmount} XP
    </div>
  `;

  document.body.appendChild(xpElement);

  // Удаляем элемент после анимации
  setTimeout(() => {
    document.body.removeChild(xpElement);
  }, 1000);
};

// Добавить в Tailwind конфиг
// frontend/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'xpFloat': 'xpFloat 1s ease-out forwards',
      },
      keyframes: {
        xpFloat: {
          '0%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          },
          '100%': {
            opacity: 0,
            transform: 'translateY(-50px) scale(1.2)'
          },
        }
      }
    }
  }
}