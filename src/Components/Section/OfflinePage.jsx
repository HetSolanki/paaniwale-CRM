import { WifiOff } from "lucide-react";

const OfflinePage = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          You&apos;re Offline
        </h1>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          It looks like you&apos;ve lost your internet connection. Some features
          may not be available until you&apos;re back online.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>

          <p className="text-sm text-gray-500">
            Don&apos;t worry, your cached data is still available
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
