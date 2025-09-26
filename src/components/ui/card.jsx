// src/components/ui/card.jsx
export function Card({ children, className }) {
  return (
    <div
      className={`bg-white shadow-md rounded-2xl p-6 border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={`mt-2 ${className}`}>{children}</div>;
}
