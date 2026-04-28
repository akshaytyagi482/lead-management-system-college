const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mt-2 rounded-md bg-red-50 border border-red-300 px-4 py-2">
      <p className="text-sm text-red-700 font-medium">
        {message}
      </p>
    </div>
  );
};

export default ErrorMessage;