import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaChartBar, FaUtensils, FaQrcode, FaClipboardList, 
  FaBell, FaStar, FaPlus, FaTrash, FaCheck, 
  FaToggleOn, FaToggleOff, FaSignOutAlt, FaEye 
} from 'react-icons/fa';
import * as api from '../services/api';
import '../App.css';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for stats
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0.0,
    averageRating: 0.0,
    totalReviews: 0,
    pendingRequests: 0,
    menuItemsCount: 0
  });

  // Database lists
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // Menu Builder form states
  const [newSecName, setNewSecName] = useState('');
  const [editingSecId, setEditingSecId] = useState(null);
  const [editingSecName, setEditingSecName] = useState('');

  // MenuItem form states
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    sectionId: '',
    imageUrl: '',
    isVeg: true,
    isAvailable: true,
    tags: '',
    modifiers: [] // option groups
  });

  // Table form state
  const [newTableName, setNewTableName] = useState('');
  const [selectedQRTable, setSelectedQRTable] = useState(null);

  // Fetch initial profile & metrics
  useEffect(() => {
    fetchProfileAndData();
    
    // Auto refresh active orders and alerts every 10 seconds (Live feel)
    const interval = setInterval(() => {
      if (restaurant) {
        refreshLiveData(restaurant.id);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchProfileAndData = async () => {
    try {
      setLoading(true);
      const resProfile = await api.getMyRestaurant();
      const rest = resProfile.data.restaurant;
      setRestaurant(rest);
      
      await refreshLiveData(rest.id);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load restaurant profile. Please login.');
      navigate('/login');
    }
  };

  const refreshLiveData = async (restId) => {
    try {
      const [resMetrics, resOrders, resRequests, resFeedbacks] = await Promise.all([
        api.getMetrics(restId),
        api.getRestaurantOrders(restId),
        api.getRestaurantRequests(restId),
        api.getRestaurantFeedbacks(restId)
      ]);
      setMetrics(resMetrics.data.metrics);
      setOrders(resOrders.data.orders);
      setRequests(resRequests.data.requests);
      setFeedbacks(resFeedbacks.data.feedbacks);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const handleLogout = () => {
    api.logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  // ==========================================
  // RESTAURANT PROFILE ACTIONS
  // ==========================================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const name = e.target.restName.value;
      const themeColor = e.target.themeColor.value;
      const description = e.target.description.value;
      const bannerUrl = e.target.bannerUrl.value;
      const logoUrl = e.target.logoUrl.value;

      const res = await api.updateRestaurant(restaurant.id, {
        name, themeColor, description, bannerUrl, logoUrl
      });
      setRestaurant(res.data.restaurant);
      toast.success('Restaurant profile updated!');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  // ==========================================
  // TABLE MANAGER ACTIONS
  // ==========================================
  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableName) return;
    try {
      const res = await api.addTable(restaurant.id, newTableName);
      setRestaurant(res.data.restaurant);
      setNewTableName('');
      toast.success(`Table "${newTableName}" added!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add table');
    }
  };

  const handleRemoveTable = async (tblName) => {
    if (!window.confirm(`Are you sure you want to delete ${tblName}?`)) return;
    try {
      const res = await api.removeTable(restaurant.id, tblName);
      setRestaurant(res.data.restaurant);
      toast.success(`Table "${tblName}" deleted.`);
    } catch (err) {
      toast.error('Failed to delete table');
    }
  };

  // ==========================================
  // MENU CATEGORY ACTIONS
  // ==========================================
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSecName) return;
    try {
      await api.createSection({
        restaurantId: restaurant.id,
        name: newSecName
      });
      setNewSecName('');
      toast.success('Category section added!');
      fetchProfileAndData();
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleUpdateSectionName = async (e) => {
    e.preventDefault();
    try {
      await api.updateSection(editingSecId, { name: editingSecName });
      setEditingSecId(null);
      toast.success('Category updated!');
      fetchProfileAndData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDeleteSection = async (secId) => {
    if (!window.confirm('Delete category and all items inside it?')) return;
    try {
      await api.deleteSection(secId);
      toast.success('Category deleted.');
      fetchProfileAndData();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  // ==========================================
  // MENU ITEM ACTIONS
  // ==========================================
  const openAddItemModal = (secId) => {
    setEditingItemId(null);
    setItemForm({
      name: '',
      description: '',
      price: '',
      sectionId: secId,
      imageUrl: '',
      isVeg: true,
      isAvailable: true,
      tags: '',
      modifiers: []
    });
    setShowItemModal(true);
  };

  const openEditItemModal = (item) => {
    setEditingItemId(item.id);
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      sectionId: item.sectionId,
      imageUrl: item.imageUrl || '',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      tags: item.tags ? item.tags.join(', ') : '',
      modifiers: item.modifiers || []
    });
    setShowItemModal(true);
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    const payload = {
      restaurantId: restaurant.id,
      sectionId: itemForm.sectionId,
      name: itemForm.name,
      description: itemForm.description,
      price: parseFloat(itemForm.price),
      imageUrl: itemForm.imageUrl,
      isVeg: itemForm.isVeg,
      isAvailable: itemForm.isAvailable,
      tags: itemForm.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      modifiers: itemForm.modifiers
    };

    try {
      if (editingItemId) {
        await api.updateMenuItem(editingItemId, payload);
        toast.success('Menu item updated!');
      } else {
        await api.createMenuItem(payload);
        toast.success('Menu item added!');
      }
      setShowItemModal(false);
      fetchProfileAndData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.deleteMenuItem(itemId);
      toast.success('Item deleted.');
      fetchProfileAndData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await api.updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      toast.success(`Item status updated`);
      fetchProfileAndData();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const handleAddModifierGroup = () => {
    setItemForm(prev => ({
      ...prev,
      modifiers: [
        ...prev.modifiers,
        { name: '', required: false, minSelections: 0, maxSelections: 1, options: [{ name: '', price: 0 }] }
      ]
    }));
  };

  const handleModifierGroupChange = (index, field, value) => {
    const updated = [...itemForm.modifiers];
    updated[index][field] = value;
    setItemForm(prev => ({ ...prev, modifiers: updated }));
  };

  const handleModifierOptionChange = (groupIndex, optIndex, field, value) => {
    const updated = [...itemForm.modifiers];
    updated[groupIndex].options[optIndex][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setItemForm(prev => ({ ...prev, modifiers: updated }));
  };

  const handleAddModifierOption = (groupIndex) => {
    const updated = [...itemForm.modifiers];
    updated[groupIndex].options.push({ name: '', price: 0 });
    setItemForm(prev => ({ ...prev, modifiers: updated }));
  };

  const handleRemoveModifierGroup = (groupIndex) => {
    const updated = itemForm.modifiers.filter((_, idx) => idx !== groupIndex);
    setItemForm(prev => ({ ...prev, modifiers: updated }));
  };

  // ==========================================
  // LIVE ORDERS & TABLE CALL ACTIONS
  // ==========================================
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      refreshLiveData(restaurant.id);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleResolveRequest = async (reqId) => {
    try {
      await api.resolveServiceRequest(reqId);
      toast.success('Alert resolved!');
      refreshLiveData(restaurant.id);
    } catch (err) {
      toast.error('Failed to resolve alert');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', background: 'var(--bg-dark-radial)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Ambient background glows */}
      <div className="ambient-glow-purple" style={{ top: '10%', left: '5%' }}></div>
      <div className="ambient-glow-emerald" style={{ bottom: '20%', right: '10%' }}></div>

      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar">
        <div className="text-center mb-4">
          <div className="navbar-brand mb-1">{restaurant?.name}</div>
          <span className="badge bg-secondary">Owner Dashboard</span>
        </div>

        <button 
          onClick={() => setActiveTab('overview')} 
          className={`sidebar-link w-100 text-start ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <FaChartBar /> Overview & Stats
        </button>
        <button 
          onClick={() => setActiveTab('menu')} 
          className={`sidebar-link w-100 text-start ${activeTab === 'menu' ? 'active' : ''}`}
        >
          <FaUtensils /> Menu Builder
        </button>
        <button 
          onClick={() => setActiveTab('tables')} 
          className={`sidebar-link w-100 text-start ${activeTab === 'tables' ? 'active' : ''}`}
        >
          <FaQrcode /> Tables & QR Codes
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`sidebar-link w-100 text-start ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <FaClipboardList /> Kitchen Orders
          {orders.filter(o => o.status === 'PENDING').length > 0 && (
            <span className="badge bg-danger ms-auto">{orders.filter(o => o.status === 'PENDING').length}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`sidebar-link w-100 text-start ${activeTab === 'requests' ? 'active' : ''}`}
        >
          <FaBell /> Table Service calls
          {requests.length > 0 && (
            <span className="badge bg-danger ms-auto">{requests.length}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('feedback')} 
          className={`sidebar-link w-100 text-start ${activeTab === 'feedback' ? 'active' : ''}`}
        >
          <FaStar /> Customer Feedbacks
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`sidebar-link w-100 text-start ${activeTab === 'profile' ? 'active' : ''}`}
        >
          Customize Styling
        </button>
        
        <button onClick={handleLogout} className="sidebar-link mt-auto w-100 text-start text-danger border-0 bg-transparent">
          <FaSignOutAlt /> Log Out
        </button>
      </div>

      {/* Main View Area */}
      <div className="dashboard-content">

        {/* 1) OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="mb-4 fw-bold">Business Overview</h2>
            <div className="metrics-grid">
              <div className="glass-panel metric-card">
                <div className="metric-header">
                  <span>TOTAL SALES REVENUE</span>
                  <span style={{ color: 'var(--emerald-glow)' }}>$$$</span>
                </div>
                <div className="metric-value">${metrics.totalRevenue}</div>
              </div>
              <div className="glass-panel metric-card">
                <div className="metric-header">
                  <span>TOTAL COMPLETED ORDERS</span>
                  <span style={{ color: 'var(--sky-glow)' }}><FaClipboardList /></span>
                </div>
                <div className="metric-value">{metrics.totalOrders}</div>
              </div>
              <div className="glass-panel metric-card">
                <div className="metric-header">
                  <span>CUSTOMER SATISFACTION</span>
                  <span style={{ color: 'var(--amber-glow)' }}><FaStar /></span>
                </div>
                <div className="metric-value">{metrics.averageRating} / 5.0</div>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Based on {metrics.totalReviews} ratings</span>
              </div>
              <div className="glass-panel metric-card">
                <div className="metric-header">
                  <span>ACTIVE TABLE ALERTS</span>
                  <span style={{ color: 'var(--rose-glow)' }}><FaBell /></span>
                </div>
                <div className="metric-value">{metrics.pendingRequests}</div>
              </div>
            </div>

            {/* Quick action shortcuts */}
            <div className="row g-4">
              <div className="col-md-6">
                <div className="glass-panel p-4 h-100">
                  <h4 className="fw-bold mb-3">Table Calls Quick Queue</h4>
                  {requests.length === 0 ? (
                    <p className="text-secondary">No active waiter or bill requests.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {requests.slice(0, 3).map(req => (
                        <div key={req.id} className={`p-3 rounded d-flex justify-content-between align-items-center ${req.type === 'BILL' ? 'bill-card-flashing' : 'waiter-card-flashing'}`}>
                          <div>
                            <strong className="text-uppercase">{req.type} Call</strong> from <strong>{req.table}</strong>
                            {req.paymentMethod && <span className="d-block text-secondary text-sm">Payment: {req.paymentMethod}</span>}
                          </div>
                          <button onClick={() => handleResolveRequest(req.id)} className="btn btn-sm btn-glass-secondary">
                            <FaCheck /> Resolve
                          </button>
                        </div>
                      ))}
                      {requests.length > 3 && (
                        <button onClick={() => setActiveTab('requests')} className="btn btn-glass-secondary w-100 mt-2">
                          View All {requests.length} Alerts
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="glass-panel p-4 h-100">
                  <h4 className="fw-bold mb-3">Recent Kitchen Tickets</h4>
                  {orders.length === 0 ? (
                    <p className="text-secondary">No orders placed yet.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="p-3 glass-panel d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{order.table}</strong> - ${order.totalAmount}
                            <span className={`status-badge ms-2 ${
                              order.status === 'PENDING' ? 'status-pending' :
                              order.status === 'PREPARING' ? 'status-preparing' : 'status-served'
                            }`}>{order.status}</span>
                          </div>
                          <button onClick={() => setActiveTab('orders')} className="btn btn-sm btn-glass-secondary">
                            Open Board
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2) MENU BUILDER PANEL */}
        {activeTab === 'menu' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">Menu Builder & Customizer</h2>
              <form onSubmit={handleAddSection} className="d-flex gap-2">
                <input 
                  type="text" 
                  placeholder="New Category Name (e.g. Desserts)"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  className="form-control glass-panel bg-transparent border-secondary text-white"
                  style={{ width: '280px' }}
                  required
                />
                <button type="submit" className="btn btn-glass-primary d-flex align-items-center gap-2">
                  <FaPlus /> Add Category
                </button>
              </form>
            </div>

            {/* List Categories and Items */}
            {restaurant?.menuSections.length === 0 ? (
              <div className="glass-panel p-5 text-center">
                <h4 className="text-secondary">Your menu is empty. Add a category above to get started!</h4>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {restaurant?.menuSections.map(sec => (
                  <div key={sec.id} className="glass-panel p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
                      {editingSecId === sec.id ? (
                        <form onSubmit={handleUpdateSectionName} className="d-flex gap-2 align-items-center">
                          <input 
                            type="text"
                            value={editingSecName}
                            onChange={(e) => setEditingSecName(e.target.value)}
                            className="form-control bg-transparent text-white border-primary"
                          />
                          <button type="submit" className="btn btn-sm btn-success">Save</button>
                          <button onClick={() => setEditingSecId(null)} className="btn btn-sm btn-secondary">Cancel</button>
                        </form>
                      ) : (
                        <h4 className="fw-bold m-0">{sec.name}</h4>
                      )}

                      <div className="d-flex gap-2">
                        <button onClick={() => {
                          setEditingSecId(sec.id);
                          setEditingSecName(sec.name);
                        }} className="btn btn-sm btn-glass-secondary">Rename</button>
                        <button onClick={() => handleDeleteSection(sec.id)} className="btn btn-sm btn-glass-danger"><FaTrash /></button>
                        <button onClick={() => openAddItemModal(sec.id)} className="btn btn-sm btn-glass-primary d-flex align-items-center gap-1">
                          <FaPlus /> Add Food Item
                        </button>
                      </div>
                    </div>

                    {/* Category Items */}
                    {sec.menuItems.length === 0 ? (
                      <p className="text-secondary text-center py-3">No items in this category.</p>
                    ) : (
                      <div className="row g-3">
                        {sec.menuItems.map(item => (
                          <div key={item.id} className="col-md-6">
                            <div className="glass-panel p-3 d-flex gap-3 align-items-center h-100" style={{ opacity: item.isAvailable ? 1 : 0.6 }}>
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="food-item-image" style={{ width: '80px', height: '80px' }} />
                              )}
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center justify-content-between">
                                  <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                                    {item.name}
                                    {item.isVeg ? (
                                      <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: '0.65rem' }}>Veg</span>
                                    ) : (
                                      <span className="badge bg-danger-subtle text-danger border border-danger" style={{ fontSize: '0.65rem' }}>Non-Veg</span>
                                    )}
                                  </h5>
                                  <span className="fw-bold">${item.price}</span>
                                </div>
                                <p className="text-secondary small m-0 mt-1">{item.description}</p>
                                <div className="mt-2 d-flex gap-1 flex-wrap">
                                  {item.tags.map(t => (
                                    <span key={t} className="badge bg-secondary text-light" style={{ fontSize: '0.65rem' }}>{t}</span>
                                  ))}
                                  {item.modifiers && item.modifiers.length > 0 && (
                                    <span className="badge bg-info text-dark" style={{ fontSize: '0.65rem' }}>Has Modifiers</span>
                                  )}
                                </div>
                              </div>
                              <div className="d-flex flex-column gap-2">
                                <button 
                                  onClick={() => handleToggleAvailability(item)} 
                                  className="btn btn-sm border-0 bg-transparent"
                                  title={item.isAvailable ? "Set Out of Stock" : "Set Available"}
                                >
                                  {item.isAvailable ? <FaToggleOn size={24} color="var(--emerald-glow)" /> : <FaToggleOff size={24} color="var(--text-muted)" />}
                                </button>
                                <button onClick={() => openEditItemModal(item)} className="btn btn-sm btn-glass-secondary">Edit</button>
                                <button onClick={() => handleDeleteItem(item.id)} className="btn btn-sm btn-glass-danger"><FaTrash /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3) TABLES & QR CODES PANEL */}
        {activeTab === 'tables' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">Tables & QR Code Generator</h2>
              <form onSubmit={handleAddTable} className="d-flex gap-2">
                <input 
                  type="text" 
                  placeholder="Table Name (e.g. Table 5)"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="form-control glass-panel bg-transparent border-secondary text-white"
                  style={{ width: '220px' }}
                  required
                />
                <button type="submit" className="btn btn-glass-primary">
                  <FaPlus /> Add Table
                </button>
              </form>
            </div>

            {restaurant?.tables.length === 0 ? (
              <div className="glass-panel p-5 text-center">
                <p className="text-secondary">No tables added yet.</p>
              </div>
            ) : (
              <div className="qr-cards-grid">
                {restaurant?.tables.map(tbl => {
                  const url = `http://localhost:3000/menu/${restaurant.id}?table=${encodeURIComponent(tbl)}`;
                  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0c0714&data=${encodeURIComponent(url)}`;
                  
                  return (
                    <div key={tbl} className="glass-panel qr-card">
                      <h5 className="fw-bold m-0">{tbl}</h5>
                      <div className="qr-image-wrapper">
                        <img src={qrSrc} alt="QR Code" className="qr-image" />
                      </div>
                      <div className="d-flex gap-2 w-100">
                        <button onClick={() => setSelectedQRTable({ name: tbl, url, qrSrc })} className="btn btn-glass-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1">
                          <FaEye /> View Card
                        </button>
                        <button onClick={() => handleRemoveTable(tbl)} className="btn btn-glass-danger btn-sm"><FaTrash /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Print QR Modal Card */}
            {selectedQRTable && (
              <div className="drawer-backdrop" onClick={() => setSelectedQRTable(null)}>
                <div className="glass-panel-glow p-4 text-center text-white" style={{
                  position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '320px', zIndex: 300, background: '#0c0714', borderRadius: '24px'
                }} onClick={e => e.stopPropagation()}>
                  <h4 className="fw-bold mb-2">Scan & Order</h4>
                  <p className="text-secondary small">Direct digital menu checkout</p>
                  
                  <div className="bg-white p-3 rounded-4 d-inline-block mb-3">
                    <img src={selectedQRTable.qrSrc} alt="QR" style={{ width: '180px', height: '180px' }} />
                  </div>
                  
                  <h3 className="fw-bold text-primary mb-1">{selectedQRTable.name}</h3>
                  <div className="text-muted small mb-4">{restaurant.name}</div>
                  
                  <div className="d-flex gap-2">
                    <button onClick={() => window.print()} className="btn btn-glass-primary flex-grow-1">Print Card</button>
                    <button onClick={() => setSelectedQRTable(null)} className="btn btn-glass-secondary">Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4) KITCHEN ORDERS BOARD */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="mb-4 fw-bold">Live Kitchen Board</h2>
            
            <div className="order-board-grid">
              {/* PENDING COLUMN */}
              <div className="order-column">
                <div className="order-column-title">
                  <span>PENDING CHECKOUTS</span>
                  <span className="badge bg-warning">{orders.filter(o => o.status === 'PENDING').length}</span>
                </div>
                {orders.filter(o => o.status === 'PENDING').length === 0 ? (
                  <p className="text-secondary text-center py-4">No pending orders.</p>
                ) : (
                  orders.filter(o => o.status === 'PENDING').map(o => (
                    <div key={o.id} className="glass-panel order-ticket">
                      <div className="order-ticket-header">
                        <span>{o.table}</span>
                        <span>${o.totalAmount}</span>
                      </div>
                      <div className="d-flex flex-column gap-1">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="order-ticket-item">
                            <span>{it.quantity}x {it.name}</span>
                            {it.selectedModifiers && it.selectedModifiers.length > 0 && (
                              <span className="text-muted small">({it.selectedModifiers.map(m => m.optionName).join(', ')})</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {o.notes && <p className="small text-warning m-0">Note: {o.notes}</p>}
                      <div className="d-flex gap-2 mt-2">
                        <button onClick={() => handleUpdateOrderStatus(o.id, 'PREPARING')} className="btn btn-glass-primary btn-sm flex-grow-1">
                          Start Cooking
                        </button>
                        <button onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')} className="btn btn-glass-danger btn-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PREPARING COLUMN */}
              <div className="order-column">
                <div className="order-column-title">
                  <span>IN KITCHEN / COOKING</span>
                  <span className="badge bg-info">{orders.filter(o => o.status === 'PREPARING').length}</span>
                </div>
                {orders.filter(o => o.status === 'PREPARING').length === 0 ? (
                  <p className="text-secondary text-center py-4">Kitchen is clear.</p>
                ) : (
                  orders.filter(o => o.status === 'PREPARING').map(o => (
                    <div key={o.id} className="glass-panel-glow order-ticket">
                      <div className="order-ticket-header">
                        <span>{o.table}</span>
                        <span>${o.totalAmount}</span>
                      </div>
                      <div className="d-flex flex-column gap-1">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="order-ticket-item">
                            <span>{it.quantity}x {it.name}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => handleUpdateOrderStatus(o.id, 'SERVED')} className="btn btn-success btn-sm mt-2 w-100 fw-bold">
                        Serve Table
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* SERVED/COMPLETED COLUMN */}
              <div className="order-column">
                <div className="order-column-title">
                  <span>SERVED / COMPLETED</span>
                  <span className="badge bg-secondary">{orders.filter(o => o.status === 'SERVED' || o.status === 'COMPLETED').length}</span>
                </div>
                {orders.filter(o => o.status === 'SERVED' || o.status === 'COMPLETED').length === 0 ? (
                  <p className="text-secondary text-center py-4">No served orders.</p>
                ) : (
                  orders.filter(o => o.status === 'SERVED' || o.status === 'COMPLETED').map(o => (
                    <div key={o.id} className="glass-panel order-ticket" style={{ opacity: o.status === 'COMPLETED' ? 0.6 : 1 }}>
                      <div className="order-ticket-header">
                        <span>{o.table}</span>
                        <span className={`status-badge ${o.status === 'COMPLETED' ? 'status-completed' : 'status-served'}`}>{o.status}</span>
                      </div>
                      <div className="d-flex flex-column gap-1">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="order-ticket-item">
                            <span>{it.quantity}x {it.name}</span>
                          </div>
                        ))}
                      </div>
                      {o.status === 'SERVED' && (
                        <button onClick={() => handleUpdateOrderStatus(o.id, 'COMPLETED')} className="btn btn-glass-secondary btn-sm mt-2 w-100">
                          Mark Completed
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5) TABLE SERVICE CALLS */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="mb-4 fw-bold">Active Table alerts</h2>
            
            {requests.length === 0 ? (
              <div className="glass-panel p-5 text-center">
                <h4 className="text-secondary">All alerts cleared. No table calls currently pending!</h4>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {requests.map(req => (
                  <div key={req.id} className={`p-4 glass-panel rounded-4 d-flex justify-content-between align-items-center ${req.type === 'BILL' ? 'bill-card-flashing' : 'waiter-card-flashing'}`}>
                    <div>
                      <h4 className="fw-bold m-0 text-uppercase">{req.type} REQUEST</h4>
                      <p className="m-0 mt-1">Table: <strong>{req.table}</strong> | Called at: {new Date(req.createdAt).toLocaleTimeString()}</p>
                      {req.paymentMethod && (
                        <span className="badge bg-dark text-success border border-success mt-2">
                          PAYMENT METHOD: {req.paymentMethod.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleResolveRequest(req.id)} className="btn btn-glass-primary">
                      Mark Resolved / Cleared
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6) CUSTOMER FEEDBACK */}
        {activeTab === 'feedback' && (
          <div>
            <h2 className="mb-4 fw-bold">Customer Feedbacks</h2>
            {feedbacks.length === 0 ? (
              <div className="glass-panel p-5 text-center">
                <p className="text-secondary">No customer feedback reviews submitted yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {feedbacks.map(fb => (
                  <div key={fb.id} className="glass-panel p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="text-primary">{fb.customerName}</strong>
                      <div className="d-flex gap-1" style={{ color: 'var(--amber-glow)' }}>
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} color={i < fb.rating ? 'var(--amber-glow)' : 'var(--text-muted)'} />
                        ))}
                      </div>
                    </div>
                    <p className="m-0 text-secondary">{fb.comment || 'No text review left.'}</p>
                    <small className="text-muted d-block mt-2">{new Date(fb.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7) BRAND STYLING PROFILE CUSTOMIZATION */}
        {activeTab === 'profile' && (
          <div className="glass-panel p-4" style={{ maxWidth: '600px' }}>
            <h3 className="fw-bold mb-4">Customize Brand Settings</h3>
            
            <form onSubmit={handleUpdateProfile} className="d-flex flex-column gap-3">
              <div className="mb-2">
                <label className="form-label text-secondary">Restaurant Name</label>
                <input type="text" name="restName" defaultValue={restaurant?.name} className="form-control glass-panel bg-transparent border-secondary text-white" required />
              </div>
              <div className="mb-2">
                <label className="form-label text-secondary">Brand Custom Theme Color (Hex)</label>
                <div className="d-flex gap-2">
                  <input type="color" name="themeColor" defaultValue={restaurant?.themeColor} className="form-control glass-panel p-1 bg-transparent border-secondary" style={{ width: '60px', height: '42px' }} />
                  <input type="text" name="themeColorText" value={restaurant?.themeColor} className="form-control glass-panel bg-transparent border-secondary text-white" disabled />
                </div>
              </div>
              <div className="mb-2">
                <label className="form-label text-secondary">Restaurant Description</label>
                <textarea name="description" defaultValue={restaurant?.description} rows="3" className="form-control glass-panel bg-transparent border-secondary text-white"></textarea>
              </div>
              <div className="mb-2">
                <label className="form-label text-secondary">Brand Logo URL</label>
                <input type="text" name="logoUrl" defaultValue={restaurant?.logoUrl || ''} className="form-control glass-panel bg-transparent border-secondary text-white" placeholder="https://..." />
              </div>
              <div className="mb-2">
                <label className="form-label text-secondary">Brand Banner Image URL</label>
                <input type="text" name="bannerUrl" defaultValue={restaurant?.bannerUrl || ''} className="form-control glass-panel bg-transparent border-secondary text-white" placeholder="https://..." />
              </div>
              <button type="submit" className="btn btn-glass-primary mt-2">Save Configuration</button>
            </form>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT MENU ITEM */}
      {showItemModal && (
        <div className="drawer-backdrop" onClick={() => setShowItemModal(false)}>
          <div className="glass-panel-glow p-4 text-white" style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '560px', maxHeight: '90vh', overflowY: 'auto', zIndex: 300, background: '#0d081a', borderRadius: '24px'
          }} onClick={e => e.stopPropagation()}>
            <h4 className="fw-bold mb-3">{editingItemId ? 'Edit Menu Item' : 'Add Menu Item'}</h4>
            
            <form onSubmit={handleSaveMenuItem} className="d-flex flex-column gap-3">
              <div className="row">
                <div className="col-8">
                  <label className="form-label text-secondary">Item Name</label>
                  <input 
                    type="text" 
                    value={itemForm.name} 
                    onChange={e => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                    className="form-control glass-panel bg-transparent border-secondary text-white" required 
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-secondary">Price ($)</label>
                  <input 
                    type="number" step="0.01" 
                    value={itemForm.price} 
                    onChange={e => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                    className="form-control glass-panel bg-transparent border-secondary text-white" required 
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label text-secondary">Description</label>
                <textarea 
                  value={itemForm.description} 
                  onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  className="form-control glass-panel bg-transparent border-secondary text-white" rows="2"
                ></textarea>
              </div>

              <div className="row">
                <div className="col-6">
                  <label className="form-label text-secondary">Item Image URL</label>
                  <input 
                    type="text" 
                    value={itemForm.imageUrl} 
                    onChange={e => setItemForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="form-control glass-panel bg-transparent border-secondary text-white" placeholder="https://..." 
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={itemForm.tags} 
                    onChange={e => setItemForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="form-control glass-panel bg-transparent border-secondary text-white" placeholder="Spicy, Chef Choice" 
                  />
                </div>
              </div>

              <div className="d-flex gap-4">
                <label className="d-flex align-items-center gap-2 text-secondary cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={itemForm.isVeg} 
                    onChange={e => setItemForm(prev => ({ ...prev, isVeg: e.target.checked }))}
                    style={{ width: '18px', height: '18px' }}
                  /> Vegetarian
                </label>
                <label className="d-flex align-items-center gap-2 text-secondary cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={itemForm.isAvailable} 
                    onChange={e => setItemForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    style={{ width: '18px', height: '18px' }}
                  /> In Stock / Available
                </label>
              </div>

              {/* Modifier options builder */}
              <div className="border-top border-secondary pt-3 mt-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="m-0 fw-bold">Modifier Option Groups (e.g. Size, Crust)</h6>
                  <button type="button" onClick={handleAddModifierGroup} className="btn btn-xs btn-glass-secondary">
                    <FaPlus size={10} /> Add Group
                  </button>
                </div>

                {itemForm.modifiers.map((group, gIdx) => (
                  <div key={gIdx} className="p-3 mb-2 rounded border border-secondary bg-dark-subtle position-relative">
                    <button type="button" onClick={() => handleRemoveModifierGroup(gIdx)} className="btn btn-xs btn-link text-danger position-absolute top-0 end-0 m-1">
                      <FaTrash size={12} />
                    </button>
                    
                    <div className="row g-2 mb-2">
                      <div className="col-8">
                        <input 
                          type="text" placeholder="Group Name (e.g., Size)" 
                          value={group.name}
                          onChange={e => handleModifierGroupChange(gIdx, 'name', e.target.value)}
                          className="form-control form-control-sm bg-transparent text-white" required
                        />
                      </div>
                      <div className="col-4 d-flex align-items-center">
                        <label className="small text-secondary cursor-pointer d-flex align-items-center gap-1">
                          <input 
                            type="checkbox" checked={group.required}
                            onChange={e => handleModifierGroupChange(gIdx, 'required', e.target.checked)}
                          /> Required
                        </label>
                      </div>
                    </div>

                    {/* Options list inside group */}
                    <div className="d-flex flex-column gap-1">
                      {group.options.map((opt, oIdx) => (
                        <div key={oIdx} className="row g-2">
                          <div className="col-8">
                            <input 
                              type="text" placeholder="Option (e.g., Large)" 
                              value={opt.name}
                              onChange={e => handleModifierOptionChange(gIdx, oIdx, 'name', e.target.value)}
                              className="form-control form-control-sm bg-transparent text-white" required
                            />
                          </div>
                          <div className="col-4">
                            <input 
                              type="number" step="0.1" placeholder="+$0.00" 
                              value={opt.price || ''}
                              onChange={e => handleModifierOptionChange(gIdx, oIdx, 'price', e.target.value)}
                              className="form-control form-control-sm bg-transparent text-white"
                            />
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddModifierOption(gIdx)} className="btn btn-link btn-xs text-info p-0 text-start mt-1 small">
                        + Add option
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-2 border-top border-secondary pt-3 mt-2">
                <button type="submit" className="btn btn-glass-primary flex-grow-1">Save Item</button>
                <button type="button" onClick={() => setShowItemModal(false)} className="btn btn-glass-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
