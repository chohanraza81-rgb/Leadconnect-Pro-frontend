declare module 'react-simple-maps' {
  import { ComponentType, SVGProps } from 'react';

  export const ComposableMap: ComponentType<{
    projectionConfig?: { scale?: number; center?: [number, number] };
    width?: number;
    height?: number;
    style?: any;
    className?: string;
    children?: React.ReactNode;
  }>;

  export const Geographies: ComponentType<{
    geography: string | object;
    children: (data: { geographies: any[] }) => React.ReactNode;
    className?: string;
  }>;

  export const Geography: ComponentType<{
    key?: string | number;
    geography: any;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: object;
      hover?: object;
      pressed?: object;
    };
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: (event: any) => void;
    onClick?: (event: any) => void;
    className?: string;
    tabIndex?: number;
  }>;
}
