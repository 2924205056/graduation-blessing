export interface Blessing {
  id: string;
  name: string;
  message: string;
  imageUrl?: string;
  gownColor?: 'red' | 'blue';
  sticker?: string;
  isHidden?: boolean;
  createdAt: number;
}
