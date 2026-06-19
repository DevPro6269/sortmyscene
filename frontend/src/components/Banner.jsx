export default function Banner({ type = "info", children, onClose }) {
  const styles = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };
  if (!children) return null;
  return (
    <div className={`flex items-center justify-between rounded px-4 py-2 ${styles[type]}`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold">
          ×
        </button>
      )}
    </div>
  );
}
