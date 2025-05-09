export default function ProductApprovalCard({ product, onApprove }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
        <div>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-gray-600">
            Submitted by: {product.seller.username}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onApprove(product._id)}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Approve
          </button>
          <button className="px-3 py-1 bg-red-500 text-white rounded text-sm">
            Reject
          </button>
        </div>
      </div>
    );
  }