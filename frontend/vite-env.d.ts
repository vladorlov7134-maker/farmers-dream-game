/// <reference types="vite/client" />

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_URL: string;
      readonly VITE_BOT_USERNAME: string;
      readonly VITE_ENVIRONMENT: string;
      readonly [key: string]: string;
    };
  }
}

export {};