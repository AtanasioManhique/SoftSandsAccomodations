export default function SuccessPopup({ message }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-popup z-50">
      {message}
    </div>
  );
}
