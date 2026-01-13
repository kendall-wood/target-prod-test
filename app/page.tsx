'use client';

import { useState, useEffect } from 'react';

interface Product {
  name: string;
  image: string | null;
  url: string | null;
}

export default function Home() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/product');
      if (!response.ok) throw new Error('Failed to fetch product');
      
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError('Failed to load product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={fetchProduct}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && product && (
          <div className="space-y-6">
            {product.image && (
              <div className="flex justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-w-full h-auto max-h-[600px] object-contain rounded-lg"
                />
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button
                onClick={fetchProduct}
                className="px-8 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
