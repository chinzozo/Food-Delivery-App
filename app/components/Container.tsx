interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container = ({ children, className = "" }: ContainerProps) => {
  return (
    <div
      className={`w-full max-w-360 mx-auto px-4 sm:px-8 md:px-12 lg:px-20 ${className}`}
    >
      {children}
    </div>
  );
};