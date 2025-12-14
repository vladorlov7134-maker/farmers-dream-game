export interface SellModalProps {
  plantsInfo: PlantInfo[];
  onSell: (plantType: string, quantity: number) => Promise<void>;
  onClose: () => void;
}