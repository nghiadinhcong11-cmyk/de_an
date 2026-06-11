import * as React from "react"

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

export const Tabs = ({ className, defaultValue, onValueChange, children, ...props }: any) => {
  const [value, setValue] = React.useState(defaultValue);

  const handleValueChange = React.useCallback((newValue: string) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  }, [onValueChange]);

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export const TabsList = ({ className, children, ...props }: any) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`} {...props}>
    {children}
  </div>
)

export const TabsTrigger = ({ className, value, ...props }: any) => {
  const context = React.useContext(TabsContext);
  if (!context) return null;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${context.value === value ? 'bg-white text-gray-950 shadow-sm' : 'hover:bg-gray-200/50'} ${className}`}
      {...props}
    />
  );
}

export const TabsContent = ({ className, value, ...props }: any) => {
  const context = React.useContext(TabsContext);
  if (!context || context.value !== value) return null;

  return <div className={`mt-2 focus-visible:outline-none ${className}`} {...props} />;
}
