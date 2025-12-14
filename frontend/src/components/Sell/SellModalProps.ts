// frontend/src/components/Sell/SellModalProps.ts
import { PlantInfo } from '../../types/game.types';

export interface SellModalProps {
  plantsInfo: PlantInfo[];
  onSell: (plantType: string, quantity: number) => void;
  onClose: () => void;
  gameState?: any;
}