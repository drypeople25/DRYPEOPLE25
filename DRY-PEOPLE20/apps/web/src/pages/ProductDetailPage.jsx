import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Minus, Plus } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { getProductImage } from '@/lib/utils';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Order state
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const record = await pb.collection('products').getOne(id, {
          $autoCancel: false,
        });
        setProduct(record);
      } catch (err) {
        console.warn('PocketBase not reachable, using mock data for detail');
        const mockProducts = {
          'mock1': {
            id: 'mock1',
            name: 'KAOS PREMIUM BOXY DRY PEOPLE',
            price: 125000,
            description: 'Kaos Premium Boxy 210GSM 100% Heavy Cotton Gramasi 210,Cutting Boxy,Artikel Pertama dari brand Dry People.',
            category: 'BOXY',
            status: 'READY STOCK',
            sizes: ['S', 'M', 'L', 'XL'],
          },
          'mock2': {
            id: 'mock2',
            name: 'Signature Oversized Hoodie',
            price: 750000,
            description: 'Comfy oversized hoodie perfect for the urban explorer. Features a double-lined hood and spacious kangaroo pocket.',
            category: 'Hoodie',
            status: 'PRE-ORDER',
            sizes: ['M', 'L', 'XL'],
          },
          'mock3': {
            id: 'mock3',
            name: 'Cargo Tech Pants',
            price: 650000,
            description: 'Water-resistant tech pants with multiple utility pockets. Designed for functionality without compromising on style.',
            category: 'Pants',
            status: 'READY STOCK',
            sizes: ['28', '30', '32', '34'],
          }
        };
        
        if (mockProducts[id]) {
          setProduct(mockProducts[id]);
          if (mockProducts[id].sizes?.length > 0) {
            setSelectedSize(mockProducts[id].sizes[0]);
          }
        } else {
          setError('Product not found');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handleQuantityChange = (type) => {
    if (type === 'decrease') {
      if (quantity > 1) setQuantity(quantity - 1);
    } else {
      if (quantity < 99) setQuantity(quantity + 1);
    }
  };

  const handleQuantityInput = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 99) {
      setQuantity(val);
    }
  };

  const handleCheckout = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast({
        title: 'Please select a size',
        description: 'You must select a size before proceeding to checkout.',
        variant: 'destructive',
      });
      return;
    }

    const totalPrice = product.price * quantity;

    navigate('/checkout', {
      state: {
        product,
        size: selectedSize,
        quantity,
        totalPrice
      }
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <p className="text-gray-600">Loading product...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="text-red-600 mb-4">Product not found</p>
            <button
              onClick={() => navigate('/katalog')}
              className="text-[#E8001D] hover:underline"
            >
              Back to Katalog
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${product.name} - DRY PEOPLE`}</title>
        <meta name="description" content={product.description || `Shop ${product.name} at DRY PEOPLE`} />
      </Helmet>

      <Header />

      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/katalog')}
            className="flex items-center text-gray-600 hover:text-[#E8001D] mb-8 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Katalog
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {getProductImage(product, pb) ? (
                  <img
                    src={getProductImage(product, pb)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4">
                <span
                  className={`px-4 py-2 text-sm font-bold text-white rounded ${
                    product.status === 'PRE-ORDER' ? 'bg-[#E8001D]' : 'bg-black'
                  }`}
                >
                  {product.status}
                </span>
              </div>

              <h1 className="text-4xl font-bebas text-gray-900 mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-[#E8001D] mb-6">
                {formatPrice(product.price)}
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Category</h3>
                <p className="text-gray-600">{product.category}</p>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">Select Size</h3>
                  <div className="flex gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 border-2 rounded flex items-center justify-center font-semibold transition-all ${
                          selectedSize === size
                            ? 'border-[#E8001D] bg-[#E8001D] text-white'
                            : 'border-gray-300 hover:border-[#E8001D] text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {!selectedSize && (
                    <p className="text-sm text-red-500 mt-2">* Please select a size</p>
                  )}
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="p-3 hover:text-[#E8001D] transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={quantity}
                      onChange={handleQuantityInput}
                      className="w-16 text-center font-bold text-lg outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-3 hover:text-[#E8001D] transition-colors"
                      disabled={quantity >= 99}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="text-gray-600">
                    Total: <span className="font-bold text-[#E8001D]">{formatPrice(product.price * quantity)}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full bg-[#E8001D] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#c00018] transition-colors"
              >
                CHECKOUT NOW
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetailPage;