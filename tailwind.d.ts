declare module "tailwindcss/plugin" {
  const plugin: (
    callback: (helpers: {
      addUtilities: (utilities: Record<string, object>) => void;
    }) => void
  ) => () => void;
  export default plugin;
}
