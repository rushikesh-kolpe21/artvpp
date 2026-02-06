import { triggerDownload } from '../utils/productHelpers';

function DigitalDownload({ digitalProducts, orderData }) {
  const handleDownload = (fileName) => {
    triggerDownload(fileName);
  };

  const handleDownloadAll = () => {
    digitalProducts.forEach((product) => {
      if (product.downloadUrl) {
        setTimeout(() => {
          triggerDownload(product.downloadUrl);
        }, 100);
      }
    });
  };

  return (
    <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
          ✓
        </div>
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Order Placed Successfully!
      </h1>
      <p className="text-gray-600 mb-8">
        Your digital product is ready for download
      </p>

      {/* Order ID */}
      <div className="bg-green-50 rounded-lg p-4 mb-8 border border-green-200">
        <p className="text-gray-600 text-sm mb-1">Order ID</p>
        <p className="text-2xl font-bold text-green-700 font-mono">
          ORD{Date.now().toString().slice(-8)}
        </p>
      </div>

      {/* Downloads Section */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Download Your Files</h2>

        {/* Individual Downloads */}
        <div className="space-y-3 mb-6">
          {digitalProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200"
            >
              <div className="text-left">
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">{product.downloadUrl}</p>
              </div>
              <button
                onClick={() => handleDownload(product.downloadUrl)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap ml-4"
              >
                ⬇ Download
              </button>
            </div>
          ))}
        </div>

        {/* Download All Button */}
        {digitalProducts.length > 1 && (
          <button
            onClick={handleDownloadAll}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition"
          >
            ⬇ Download All ({digitalProducts.length})
          </button>
        )}
      </div>

      {/* Order Details */}
      {orderData && (
        <div className="text-left bg-gray-50 rounded-lg p-6 border border-gray-200 mb-8">
          <h3 className="font-bold text-gray-900 mb-3">Download Confirmation</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <p>
              <span className="font-medium">Email:</span> confirmation@artvpp.com
            </p>
            <p>
              <span className="font-medium">Download Link:</span> Sent to your registered email
            </p>
            <p>
              <span className="font-medium">Expiry:</span> Download links valid for 30 days
            </p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
        <p className="text-yellow-700 text-sm">
          💡 Download links have been sent to your email. You can also download from your account dashboard anytime.
        </p>
      </div>
    </div>
  );
}

export default DigitalDownload;
