'use client';

import { useState, useEffect } from 'react';
import { fetchProducts, getImageUrl, fetchReviews, createReviewCall } from '@/lib/api';

export default function ProductsPage() {
  const dummyProducts = [
    { id: 1, name: 'Organic Cotton Onesie', price: '1499.00', category: 'Clothes', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&h=300&q=80' },
    { id: 2, name: 'Educational Wooden Toy', price: '2499.00', category: 'Toys', image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=400&h=300&q=80' },
    { id: 3, name: 'Silicone Feeding Set', price: '1199.00', category: 'Feeding', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=400&h=300&q=80' },
    { id: 4, name: 'Premium Stroller', price: '18999.00', category: 'Strollers', image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=400&h=300&q=80' },
    { id: 5, name: 'Soft Baby Blanket', price: '899.00', category: 'Bedding', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&h=300&q=80' },
    { id: 6, name: 'Diaper Bag Backpack', price: '3499.00', category: 'Accessories', image: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=400&h=300&q=80' },
    { id: 7, name: 'Baby Bath Tub', price: '2199.00', category: 'Bath', image: 'https://images.unsplash.com/photo-1508808789047-9759676051a0?auto=format&fit=crop&w=400&h=300&q=80' },
    { id: 8, name: 'Digital Thermometer', price: '599.00', category: 'Health', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&h=300&q=80' },
    { id: 9, name: 'Teething Ring Set', price: '399.00', category: 'Toys', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&h=300&q=80' },
    { id: 10, name: 'Baby Monitor Camera', price: '8499.00', category: 'Safety', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&h=300&q=80' },
  ];

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [selectedProductForReviews, setSelectedProductForReviews] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [user, setUser] = useState(null);

  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [wishlist, setWishlist] = useState([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const priceRanges = [
    { label: 'All Prices', min: 0, max: Infinity },
    { label: 'Under ₹1,000', min: 0, max: 1000 },
    { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
    { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
    { label: 'Over ₹10,000', min: 10000, max: Infinity },
  ];

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  const toggleWishlist = (product) => {
    let updated;
    if (wishlist.some(item => item.id === product.id)) {
      updated = wishlist.filter(item => item.id !== product.id);
    } else {
      updated = [...wishlist, product];
    }
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const openReviewsModal = async (product) => {
    setSelectedProductForReviews(product);
    try {
      const reviews = await fetchReviews(product.id);
      setProductReviews(reviews);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setProductReviews([]);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a review!");
      return;
    }
    setSubmittingReview(true);
    try {
      await createReviewCall(selectedProductForReviews.id, newReview, user.token);
      alert("Review submitted successfully!");
      const reviews = await fetchReviews(selectedProductForReviews.id);
      setProductReviews(reviews);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      alert("Failed to submit review: " + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const getProductsData = async () => {
      try {
        const data = await fetchProducts();
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(dummyProducts);
        }
      } catch (err) {
        console.error("API error, loading offline fallbacks", err);
        setProducts(dummyProducts);
      } finally {
        setLoading(false);
      }
    };
    getProductsData();
  }, []);

  // Derive unique categories dynamically
  const categories = ['All', ...Array.from(new Set((products.length > 0 ? products : dummyProducts).map(p => p.category)))];

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  // Filter products based on search, category, wishlist toggle, and price range
  const filteredProducts = products.filter(product => {
    if (showWishlistOnly) {
      return wishlist.some(item => item.id === product.id);
    }
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const activeRange = priceRanges.find(r => r.label === selectedPriceRange) || priceRanges[0];
    const numericPrice = parseFloat(product.price);
    const matchesPrice = numericPrice >= activeRange.min && numericPrice <= activeRange.max;

    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="products-layout">
      
      {/* Sidebar Navigation */}
      <aside className="products-sidebar">
        
        {/* Wishlist View Selector */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
          <button
            onClick={() => {
              setShowWishlistOnly(!showWishlistOnly);
              setSelectedCategory('All');
              setSelectedPriceRange('All');
            }}
            style={{
              background: showWishlistOnly ? 'var(--accent)' : 'none',
              border: '1px solid var(--border)',
              color: showWishlistOnly ? 'black' : 'white',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 'bold',
              transition: 'background 0.2s, color 0.2s'
            }}
          >
            ❤️ {showWishlistOnly ? 'Show All Products' : `My Wishlist (${wishlist.length})`}
          </button>
        </div>

        {/* Categories Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Categories</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categories.map(category => (
              <li key={category}>
                <button 
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowWishlistOnly(false);
                  }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: selectedCategory === category && !showWishlistOnly ? 'var(--accent)' : 'var(--foreground)',
                    fontWeight: selectedCategory === category && !showWishlistOnly ? 'bold' : 'normal',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    padding: '0.5rem 0',
                    transition: 'color 0.2s'
                  }}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range Section */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Price Range</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {priceRanges.map(range => (
              <li key={range.label}>
                <button 
                  onClick={() => {
                    setSelectedPriceRange(range.label);
                    setShowWishlistOnly(false);
                  }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: selectedPriceRange === range.label && !showWishlistOnly ? 'var(--accent)' : 'var(--foreground)',
                    fontWeight: selectedPriceRange === range.label && !showWishlistOnly ? 'bold' : 'normal',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    padding: '0.5rem 0',
                    transition: 'color 0.2s'
                  }}
                >
                  {range.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="products-main">
        
        {/* Top Bar with Search */}
        <div className="products-header">
          <h1>Shop {selectedCategory !== 'All' ? selectedCategory : 'All Products'}</h1>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                background: 'var(--secondary)',
                color: 'white',
                width: '300px',
                outline: 'none'
              }}
            />
          </div>
        </div>
        
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="grid">
            {filteredProducts.length > 0 ? filteredProducts.map(product => (
              <div key={product.id} className="card" style={{ position: 'relative' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: wishlist.some(item => item.id === product.id) ? '#ef4444' : 'white',
                    fontSize: '1.2rem',
                    transition: 'transform 0.2s, color 0.2s',
                    zIndex: 10
                  }}
                >
                  {wishlist.some(item => item.id === product.id) ? '❤️' : '🤍'}
                </button>
                <img src={getImageUrl(product.image)} alt={product.name} className="card-image" />
                <div className="card-content">
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{product.category}</p>
                  <h3 className="card-title">{product.name}</h3>
                  <p className="card-price">₹{product.price}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn" style={{ width: '100%' }} onClick={() => addToCart(product)}>Add to Cart</button>
                    <button className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'white', fontSize: '0.85rem' }} onClick={() => openReviewsModal(product)}>Reviews & Ratings</button>
                  </div>
                </div>
              </div>
            )) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                No products found matching your search.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Reviews & Ratings Modal Overlay */}
      {selectedProductForReviews && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--secondary)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
          }}>
            <button 
              onClick={() => setSelectedProductForReviews(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>

            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
              Reviews for {selectedProductForReviews.name}
            </h2>

            {/* List of Reviews */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#cbd5e1' }}>Customer Reviews</h3>
              {productReviews.length === 0 ? (
                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No reviews yet. Be the first to review this product!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {productReviews.map(review => (
                    <div key={review.id} style={{
                      background: 'var(--background)',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{review.userName}</span>
                        <span style={{ color: '#fbbf24' }}>
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1' }}>{review.comment}</p>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.5rem' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Review Form */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#cbd5e1' }}>Write a Review</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Rating</label>
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        background: 'var(--background)',
                        color: 'white',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Good)</option>
                      <option value="3">3 Stars (Average)</option>
                      <option value="2">2 Stars (Poor)</option>
                      <option value="1">1 Star (Very Bad)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Comment</label>
                    <textarea
                      required
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Share your thoughts about this product..."
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.25rem',
                        background: 'var(--background)',
                        color: 'white',
                        border: '1px solid var(--border)',
                        resize: 'none'
                      }}
                    />
                  </div>
                  <button type="submit" className="btn btn-accent" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                  Please <a href="/login" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>log in</a> to write a review.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
