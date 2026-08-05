declare module 'react-tooltip' {
  import { ComponentType } from 'react';

  export const Tooltip: ComponentType<{
    id?: string;
    content?: string;
    children?: React.ReactNode;
    place?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    style?: object;
    [key: string]: any;
  }>;
}
