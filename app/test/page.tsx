export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Image Test Page</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">Test 1: Direct Target Image</h2>
            <img 
              src="https://target.scene7.com/is/image/Target/GUEST_a06ae2f9-cb8e-4a63-bcaf-feb60f0d6dda"
              alt="Test product"
              className="max-w-full h-auto max-h-64 border border-gray-300"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Test 2: With Parameters</h2>
            <img 
              src="https://target.scene7.com/is/image/Target/GUEST_a06ae2f9-cb8e-4a63-bcaf-feb60f0d6dda?wid=400&hei=400&fmt=pjpeg"
              alt="Test product with params"
              className="max-w-full h-auto max-h-64 border border-gray-300"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Test 3: Simple placeholder</h2>
            <img 
              src="https://via.placeholder.com/400x400.png?text=Test+Image"
              alt="Placeholder"
              className="max-w-full h-auto max-h-64 border border-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
