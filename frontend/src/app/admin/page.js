'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchProducts, 
  createProductCall, 
  updateProductCall, 
  deleteProductCall, 
  uploadProductImage, 
  fetchOrders, 
  updateOrderStatusCall, 
  fetchUsers,
  getImageUrl
} from '@/lib/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Product Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/products');
      return;
    }
    setToken(user.token);
    loadData(user.token);
  }, [router]);

  const loadData = async (authToken) => {
    setLoading(true);
    try {
      const prodData = await fetchProducts();
      setProducts(prodData);
      
      const ordData = await fetchOrders(authToken);
      setOrders(ordData);

      const userData = await fetchUsers(authToken);
      setUsers(userData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Product Form Changes
  const handleFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Upload image to backend S3 / local storage
  const handleUploadImage = async () => {
    if (!imageFile) return null;
    setUploading(true);
    try {
      const res = await uploadProductImage(imageFile, token);
      setProductForm(prev => ({ ...prev, image: res.imageUrl }));
      alert("Image uploaded successfully!");
      return res.imageUrl;
    } catch (err) {
      alert("Image upload failed: " + err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    let finalImageUrl = productForm.image;
    
    if (imageFile) {
      const uploadedUrl = await handleUploadImage();
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }

    const payload = {
      ...productForm,
      image: finalImageUrl || 'https://via.placeholder.com/300x200?text=No+Image',
    };

    try {
      if (isEditing) {
        await updateProductCall(currentProductId, payload, token);
        alert("Product updated successfully!");
      } else {
        await createProductCall(payload, token);
        alert("Product created successfully!");
      }
      // Reset form
      setProductForm({ name: '', price: '', category: '', description: '', image: '' });
      setIsEditing(false);
      setImageFile(null);
      loadData(token);
    } catch (err) {
      alert("Action failed: " + err.message);
    }
  };

  const handleEditClick = (product) => {
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      image: product.image || '',
    });
    setCurrentProductId(product.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProductCall(id, token);
        alert("Product deleted!");
        loadData(token);
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusCall(orderId, newStatus, token);
      alert("Order status updated!");
      loadData(token);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin Console</h1>
        <button className="btn" onClick={() => loadData(token)}>Refresh Data</button>
      </div>
      
      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-accent' : ''}`}
          onClick={() => setActiveTab('orders')}
          style={{ padding: '0.75rem 2rem' }}
        >
          Orders ({orders.length})
        </button>
        <button 
          className={`btn ${activeTab === 'products' ? 'btn-accent' : ''}`}
          onClick={() => setActiveTab('products')}
          style={{ padding: '0.75rem 2rem' }}
        >
          Products CRUD ({products.length})
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-accent' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{ padding: '0.75rem 2rem' }}
        >
          Registered Users ({users.length})
        </button>
      </div>

      <div style={{ background: 'var(--secondary)', padding: '2rem', borderRadius: '1rem', minHeight: '400px', border: '1px solid var(--border)' }}>
        
        {/* ORDERS MANAGEMENT PANEL */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Recent Customer Orders</h2>
            {orders.length === 0 ? (
              <p style={{ color: '#cbd5e1' }}>No orders placed yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: '#cbd5e1' }}>
                      <th style={{ padding: '1rem' }}>Order ID</th>
                      <th style={{ padding: '1rem' }}>User Email</th>
                      <th style={{ padding: '1rem' }}>Shipping Address</th>
                      <th style={{ padding: '1rem' }}>Payment Method</th>
                      <th style={{ padding: '1rem' }}>Total</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>{order.id}</td>
                        <td style={{ padding: '1rem' }}>{order.User?.email || `User #${order.userId}`}</td>
                        <td style={{ padding: '1rem' }}>{order.address}</td>
                        <td style={{ padding: '1rem' }}>{order.paymentMethod}</td>
                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{parseFloat(order.totalAmount).toFixed(2)}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            backgroundColor: order.status === 'Completed' ? '#10b981' : order.status === 'Shipped' ? '#3b82f6' : '#f59e0b',
                            color: 'white' 
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select 
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{ padding: '0.4rem', borderRadius: '0.25rem', background: 'var(--background)', color: 'white', border: '1px solid var(--border)' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS CRUD PANEL */}
        {activeTab === 'products' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>{isEditing ? "Edit Product" : "Add New Product"}</h2>
            
            {/* Create/Edit Form */}
            <form onSubmit={handleProductSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem', background: 'var(--background)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={productForm.name} 
                  onChange={handleFormChange}
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border)', background: 'var(--secondary)', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Price (INR)</label>
                <input 
                  type="number" 
                  name="price"
                  value={productForm.price} 
                  onChange={handleFormChange}
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border)', background: 'var(--secondary)', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Category</label>
                <input 
                  type="text" 
                  name="category"
                  placeholder="e.g. Toys, Clothes, Feeding"
                  value={productForm.category} 
                  onChange={handleFormChange}
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border)', background: 'var(--secondary)', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Media Image (Upload File)</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', background: 'var(--secondary)', color: 'white' }}
                  />
                  {imageFile && (
                    <button type="button" onClick={handleUploadImage} className="btn" style={{ padding: '0.5rem 1rem' }}>
                      {uploading ? "Uploading..." : "Pre-Upload Image"}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Or Image URL (Fallback)</label>
                <input 
                  type="text" 
                  name="image"
                  value={productForm.image} 
                  onChange={handleFormChange}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border)', background: 'var(--secondary)', color: 'white' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Description</label>
                <textarea 
                  name="description"
                  value={productForm.description} 
                  onChange={handleFormChange}
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border)', background: 'var(--secondary)', color: 'white', resize: 'none' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-accent" style={{ padding: '0.75rem 2rem' }}>
                  {isEditing ? "Update Product" : "Create Product"}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => {
                      setIsEditing(false);
                      setProductForm({ name: '', price: '', category: '', description: '', image: '' });
                    }}
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'white' }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <h3 style={{ marginBottom: '1rem' }}>Product Inventory List</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: '#cbd5e1' }}>
                    <th style={{ padding: '1rem' }}>Image</th>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Category</th>
                    <th style={{ padding: '1rem' }}>Price</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{product.name}</td>
                      <td style={{ padding: '1rem' }}>{product.category}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{parseFloat(product.price).toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          className="btn" 
                          onClick={() => handleEditClick(product)}
                          style={{ marginRight: '0.5rem', background: '#3b82f6', color: 'white', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn" 
                          onClick={() => handleDeleteClick(product.id)}
                          style={{ background: '#ef4444', color: 'white', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS LISTING PANEL */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Registered Users</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: '#cbd5e1' }}>
                    <th style={{ padding: '1rem' }}>User ID</th>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Email Address</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>{u.id}</td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                      <td style={{ padding: '1rem' }}>{u.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          backgroundColor: u.role === 'admin' ? '#ef4444' : '#64748b',
                          color: 'white'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
