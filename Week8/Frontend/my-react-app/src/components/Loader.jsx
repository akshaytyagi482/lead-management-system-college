const Loader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

export default Loader;