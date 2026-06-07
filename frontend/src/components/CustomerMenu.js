import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaSearch, FaUtensils, FaBell, FaReceipt, 
  FaStar, FaTimes, FaPlus, FaMinus, FaChevronUp, FaCheckCircle 
} from 'react-icons/fa';
import * as api from '../services/api';
import '../App.css';

// Mock Restaurant configuration for direct demo sandbox testing
const mockRestaurant = {
  id: 'demo',
  name: 'Veloce Gourmet Pizza',
  description: 'Artisanal wood-fired pizzas, handcrafted pastas, and premium Italian wines.',
  bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
  logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80',
  themeColor: '#10B981', // Emerald theme
  tables: ['Table 1', 'Table 2', 'Table 3', 'Table 4'],
  menuSections: [
    {
      id: 'sec-starters',
      name: 'Starters & Salads',
      menuItems: [
        {
          id: 'item-bruschetta',
          name: 'Classic Tomato Bruschetta',
          description: 'Toasted ciabatta topped with heirloom cherry tomatoes, fresh garlic, organic basil, and premium extra virgin olive oil.',
          price: 9.50,
          isVeg: true,
          imageUrl: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=200&auto=format&fit=crop&q=80',
          tags: ['Popular', 'Vegetarian'],
          modifiers: []
        },
        {
          id: 'item-calamari',
          name: 'Crispy Pepper Calamari',
          description: 'Lightly dusted salt & pepper calamari served with wild rocket greens and a house-made lemon aioli dip.',
          price: 14.00,
          isVeg: false,
          imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&auto=format&fit=crop&q=80',
          tags: ['Spicy'],
          modifiers: []
        }
      ]
    },
    {
      id: 'sec-pizzas',
      name: 'Wood-Fired Pizza',
      menuItems: [
        {
          id: 'item-margherita',
          name: 'Margherita DOC',
          description: 'San Marzano tomato base, fresh buffalo mozzarella, organic fresh basil leaves, and extra virgin olive oil.',
          price: 16.50,
          isVeg: true,
          imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=200&auto=format&fit=crop&q=80',
          tags: ['Best Seller', 'Vegetarian'],
          modifiers: [
            {
              name: 'Choose Size',
              required: true,
              options: [
                { name: '12" Regular', price: 0 },
                { name: '16" Family Size', price: 6.50 }
              ]
            },
            {
              name: 'Extra Toppings',
              required: false,
              options: [
                { name: 'Extra Buffalo Mozzarella', price: 2.50 },
                { name: 'Add Truffle Oil Drizzle', price: 1.50 }
              ]
            }
          ]
        },
        {
          id: 'item-diavola',
          name: 'Diavola Hot Pizza',
          description: 'Spicy Calabrian salami, hand-pinched Italian sausage, mozzarella cheese, crushed red chili flakes, and hot honey drizzle.',
          price: 18.00,
          isVeg: false,
          imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=200&auto=format&fit=crop&q=80',
          tags: ['Spicy', 'Chef Special'],
          modifiers: [
            {
              name: 'Choose Size',
              required: true,
              options: [
                { name: '12" Regular', price: 0 },
                { name: '16" Family Size', price: 6.50 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'sec-drinks',
      name: 'Premium Beverages',
      menuItems: [
        {
          id: 'item-wine',
          name: 'Chianti Classico Reserva',
          description: 'A glass of premium dry Tuscan red wine with ripe cherry notes and elegant spice.',
          price: 12.00,
          isVeg: true,
          imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&auto=format&fit=crop&q=80',
          tags: ['Gluten-Free'],
          modifiers: []
        },
        {
          id: 'item-water',
          name: 'San Pellegrino Sparkling',
          description: 'Refreshing Italian natural sparkling mineral water.',
          price: 4.50,
          isVeg: true,
          imageUrl: 'https://images.unsplash.com/photo-1608885898957-a599fb18de37?w=200&auto=format&fit=crop&q=80',
          tags: ['Vegetarian', 'Gluten-Free'],
          modifiers: []
        }
      ]
    }
  ]
};

export default function CustomerMenu() {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const tableName = searchParams.get('table') || 'Table 1';

  // Core database states
  const [restaurant, setRestaurant] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart states
  const [cart, setCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [specialNotes, setSpecialNotes] = useState('');

  // Item customization modal states
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState({}); // { groupName: { optionName, price } }

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Active Order tracking states
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderTrackingInterval, setOrderTrackingInterval] = useState(null);

  // Feedback & Service dialog states
  const [showBillModal, setShowBillModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Fetch restaurant menu configuration
  useEffect(() => {
    fetchMenu();
    
    // Check local storage if there is an active order being tracked for this restaurant
    const storedOrderId = localStorage.getItem(`active_order_${restaurantId}`);
    if (storedOrderId && restaurantId !== 'demo') {
      trackOrderProgress(storedOrderId);
    }

    return () => {
      if (orderTrackingInterval) clearInterval(orderTrackingInterval);
    };
  }, [restaurantId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      if (restaurantId === 'demo' || !restaurantId) {
        setRestaurant(mockRestaurant);
        if (mockRestaurant.menuSections.length > 0) {
          setActiveCategory(mockRestaurant.menuSections[0].id);
        }
        setLoading(false);
        return;
      }
      
      const res = await api.getRestaurant(restaurantId);
      const rest = res.data.restaurant;
      setRestaurant(rest);
      if (rest.menuSections.length > 0) {
        setActiveCategory(rest.menuSections[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.info('API offline or restaurant not found. Loading Demo sandbox menu!');
      setRestaurant(mockRestaurant);
      if (mockRestaurant.menuSections.length > 0) {
        setActiveCategory(mockRestaurant.menuSections[0].id);
      }
      setLoading(false);
    }
  };

  // Track order state updates every 8 seconds
  const trackOrderProgress = (orderId) => {
    if (orderTrackingInterval) clearInterval(orderTrackingInterval);

    const interval = setInterval(async () => {
      try {
        const res = await api.getOrder(orderId);
        const order = res.data.order;
        setActiveOrder(order);

        // Stop polling if completed or cancelled
        if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
          clearInterval(interval);
          localStorage.removeItem(`active_order_${restaurantId}`);
          if (order.status === 'COMPLETED') {
            toast.success('Hope you enjoyed your meal! Leave us a feedback.', { autoClose: 6000 });
            setShowFeedbackModal(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 8000);

    setOrderTrackingInterval(interval);
  };

  // ==========================================
  // CART ACTIONS
  // ==========================================
  const handleAddToCartClick = (item) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setCustomizingItem(item);
      const initialSelection = {};
      item.modifiers.forEach(group => {
        if (group.options && group.options.length > 0) {
          initialSelection[group.name] = {
            optionName: group.options[0].name,
            price: group.options[0].price || 0
          };
        }
      });
      setSelectedModifiers(initialSelection);
    } else {
      addToCartDirect(item, []);
    }
  };

  const handleModifierChange = (groupName, optionName, price) => {
    setSelectedModifiers(prev => ({
      ...prev,
      [groupName]: { optionName, price }
    }));
  };

  const submitCustomizedAdd = () => {
    const modifiersList = Object.keys(selectedModifiers).map(groupName => ({
      groupName,
      optionName: selectedModifiers[groupName].optionName,
      price: selectedModifiers[groupName].price
    }));

    addToCartDirect(customizingItem, modifiersList);
    setCustomizingItem(null);
  };

  const addToCartDirect = (item, modifiersList) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(cartIt => {
        if (cartIt.id !== item.id) return false;
        if (cartIt.selectedModifiers.length !== modifiersList.length) return false;
        return cartIt.selectedModifiers.every(m1 => 
          modifiersList.some(m2 => m2.groupName === m1.groupName && m2.optionName === m1.optionName)
        );
      });

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        toast.success(`Increased quantity of ${item.name}`);
        return updated;
      } else {
        toast.success(`${item.name} added to cart!`);
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            selectedModifiers: modifiersList
          }
        ];
      }
    });
  };

  const updateCartQty = (idx, delta) => {
    setCart(prev => {
      const updated = [...prev];
      updated[idx].quantity += delta;
      if (updated[idx].quantity <= 0) {
        return updated.filter((_, i) => i !== idx);
      }
      return updated;
    });
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      let unitPrice = item.price;
      item.selectedModifiers.forEach(m => {
        unitPrice += m.price || 0;
      });
      return sum + (unitPrice * item.quantity);
    }, 0);
  };

  // ==========================================
  // CHECKOUT & ACTIONS
  // ==========================================
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const itemsPayload = cart.map(item => ({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedModifiers: item.selectedModifiers
    }));

    // Demo Mode Order Simulation
    if (restaurant.id === 'demo') {
      const mockPlacedOrder = {
        id: 'demo-order-' + Math.random().toString(36).substr(2, 9),
        restaurantId: 'demo',
        table: tableName,
        items: itemsPayload,
        totalAmount: parseFloat(getCartTotal().toFixed(2)),
        status: 'PENDING',
        notes: specialNotes
      };
      
      setActiveOrder(mockPlacedOrder);
      setCart([]);
      setSpecialNotes('');
      setShowCartDrawer(false);
      
      toast.success('Order placed successfully! Sending to kitchen (Demo Mode).');
      
      // Simulate kitchen state progress every 6 seconds
      let currentStep = 0;
      const statuses = ['PENDING', 'PREPARING', 'SERVED', 'COMPLETED'];
      const demoInterval = setInterval(() => {
        currentStep += 1;
        if (currentStep < statuses.length) {
          setActiveOrder(prev => prev ? { ...prev, status: statuses[currentStep] } : null);
        } else {
          clearInterval(demoInterval);
          setActiveOrder(null);
          toast.success('Hope you enjoyed your meal! Leave us a feedback.', { autoClose: 6000 });
          setShowFeedbackModal(true);
        }
      }, 6000);

      return;
    }

    try {
      const res = await api.createOrder({
        restaurantId: restaurant.id,
        table: tableName,
        items: itemsPayload,
        notes: specialNotes
      });

      const placedOrder = res.data.order;
      setActiveOrder(placedOrder);
      setCart([]);
      setSpecialNotes('');
      setShowCartDrawer(false);
      localStorage.setItem(`active_order_${restaurant.id}`, placedOrder.id);
      
      toast.success('Order placed successfully! Sending to kitchen.');
      trackOrderProgress(placedOrder.id);
    } catch (err) {
      toast.error('Failed to submit order. Please retry.');
    }
  };

  const handleCallWaiter = async () => {
    if (restaurant.id === 'demo') {
      toast.success('Waiter summoned! Someone will be with you shortly (Demo Mode).');
      return;
    }

    try {
      await api.createServiceRequest({
        restaurantId: restaurant.id,
        table: tableName,
        type: 'WAITER'
      });
      toast.success('Waiter summoned! Someone will be with you shortly.');
    } catch (err) {
      toast.error('Call failed. Please attract staff attention.');
    }
  };

  const handleRequestBill = async (method) => {
    if (restaurant.id === 'demo') {
      setShowBillModal(false);
      toast.success(`Bill checkout requested via ${method.toUpperCase()} (Demo Mode)!`);
      return;
    }

    try {
      await api.createServiceRequest({
        restaurantId: restaurant.id,
        table: tableName,
        type: 'BILL',
        paymentMethod: method
      });
      setShowBillModal(false);
      toast.success(`Bill checkout requested via ${method.toUpperCase()}!`);
    } catch (err) {
      toast.error('Request failed');
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (restaurant.id === 'demo') {
      setFeedbackComment('');
      setShowFeedbackModal(false);
      toast.success('Thank you for your feedback! ❤️ (Demo Mode)');
      return;
    }

    try {
      await api.createFeedback({
        restaurantId: restaurant.id,
        customerName: e.target.custName.value || 'Table Customer',
        rating: feedbackRating,
        comment: feedbackComment
      });
      setFeedbackComment('');
      setShowFeedbackModal(false);
      toast.success('Thank you for your feedback! ❤️');
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  // Set hex brand values dynamically in stylesheet root variables
  const brandThemeStyles = {
    '--theme-color': restaurant?.themeColor || '#8B5CF6',
  };

  // Filters items depending on searchQuery and vegOnly toggle
  const getFilteredItems = (menuItems) => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVeg = !vegOnly || item.isVeg;
      return matchesSearch && matchesVeg;
    });
  };

  return (
    <div className="customer-menu-container" style={brandThemeStyles}>
      
      {/* 1) Banner & Restaurant Profile */}
      <div className="customer-menu-header">
        <img 
          src={restaurant?.bannerUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'} 
          alt="Banner" 
          className="customer-menu-banner" 
        />
      </div>

      <div className="glass-panel customer-menu-profile-card">
        {restaurant?.logoUrl ? (
          <img src={restaurant.logoUrl} alt="Logo" className="customer-menu-logo" />
        ) : (
          <div className="customer-menu-logo d-flex align-items-center justify-content-center font-weight-bold text-white bg-primary">
            {restaurant?.name?.charAt(0) || 'R'}
          </div>
        )}
        <h3 className="fw-bold m-0 text-white">{restaurant?.name}</h3>
        <p className="small text-secondary m-0">{restaurant?.description}</p>
        <span className="badge bg-dark border border-secondary mt-2 px-3 py-2 text-primary" style={{ fontSize: '0.85rem' }}>
          🍽️ seated at: <strong>{tableName}</strong>
        </span>
      </div>

      {/* Active Order Live Progress Panel */}
      {activeOrder && (
        <div className="mx-3 mb-4 glass-panel-glow p-3 text-center">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2 text-white">
            <FaCheckCircle color="var(--theme-color)" />
            <h6 className="fw-bold m-0 text-uppercase">ORDER PLACED ({tableName})</h6>
          </div>
          <p className="small text-secondary mb-3">Kitchen state tracking updates live...</p>
          
          <div className="d-flex justify-content-around align-items-center px-2">
            <div className="text-center" style={{ opacity: activeOrder.status === 'PENDING' ? 1 : 0.4 }}>
              <div className="badge bg-warning rounded-circle p-2 mb-1">1</div>
              <div className="small text-white">Pending</div>
            </div>
            <div style={{ height: '2px', width: '30px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
            <div className="text-center" style={{ opacity: activeOrder.status === 'PREPARING' ? 1 : 0.4 }}>
              <div className="badge bg-info rounded-circle p-2 mb-1">2</div>
              <div className="small text-white">Cooking</div>
            </div>
            <div style={{ height: '2px', width: '30px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
            <div className="text-center" style={{ opacity: activeOrder.status === 'SERVED' ? 1 : 0.4 }}>
              <div className="badge bg-success rounded-circle p-2 mb-1">3</div>
              <div className="small text-white">Served!</div>
            </div>
          </div>
        </div>
      )}

      {/* Floating service buttons */}
      <div className="d-flex gap-2 justify-content-center px-3 mb-4">
        <button onClick={handleCallWaiter} className="btn btn-sm btn-glass-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2">
          <FaBell /> Call Waiter
        </button>
        <button onClick={() => setShowBillModal(true)} className="btn btn-sm btn-glass-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2">
          <FaReceipt /> Request Bill
        </button>
      </div>

      {/* Search & Veg Filter */}
      <div className="px-3 mb-4">
        <div className="input-group glass-panel border-secondary mb-2 overflow-hidden">
          <span className="input-group-text bg-transparent border-0 text-secondary"><FaSearch /></span>
          <input 
            type="text" 
            placeholder="Search food items..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-control bg-transparent border-0 text-white outline-none"
            style={{ boxShadow: 'none' }}
          />
        </div>
        <div className="d-flex align-items-center justify-content-between px-1">
          <span className="small text-secondary">Toggle Vegetarian Only</span>
          <label className="d-flex align-items-center gap-2 cursor-pointer text-success font-weight-bold" style={{ fontSize: '0.85rem' }}>
            <input 
              type="checkbox" 
              checked={vegOnly} 
              onChange={e => setVegOnly(e.target.checked)} 
              className="form-check-input mt-0"
              style={{ width: '16px', height: '16px' }}
            /> Veg Only 🟢
          </label>
        </div>
      </div>

      {/* 2) Sticky Category Tabs */}
      <div className="customer-category-tabs-wrapper">
        <div className="customer-category-tabs">
          {restaurant?.menuSections.map(sec => (
            <div 
              key={sec.id} 
              onClick={() => {
                setActiveCategory(sec.id);
                document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`customer-category-tab ${activeCategory === sec.id ? 'active' : ''}`}
            >
              {sec.name}
            </div>
          ))}
        </div>
      </div>

      {/* 3) Categories and Items Lists */}
      <div className="customer-menu-list">
        {restaurant?.menuSections.map(sec => {
          const items = getFilteredItems(sec.menuItems);
          if (items.length === 0) return null;

          return (
            <div key={sec.id} id={sec.id} className="pt-2">
              <h5 className="fw-bold mb-3 text-white border-bottom border-secondary pb-2">{sec.name}</h5>
              
              <div className="d-flex flex-column gap-3">
                {items.map(item => (
                  <div key={item.id} className="glass-panel food-item-card">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="food-item-image" />
                    )}
                    <div className="food-item-details">
                      <h6 className="food-item-name text-white d-flex align-items-center gap-2">
                        {item.name}
                        {item.isVeg ? (
                          <span style={{ color: '#10B981', fontSize: '0.7rem' }}>🟢</span>
                        ) : (
                          <span style={{ color: '#EF4444', fontSize: '0.7rem' }}>🔴</span>
                        )}
                      </h6>
                      <p className="food-item-desc text-secondary">{item.description}</p>
                      
                      <div className="food-item-price-row">
                        <span className="food-item-price">${item.price}</span>
                        <button onClick={() => handleAddToCartClick(item)} className="add-item-btn">
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4) Sticky Bottom Cart Bar */}
      {cart.length > 0 && !showCartDrawer && (
        <div className="sticky-bottom-bar" style={{ borderRadius: '16px 16px 0 0' }}>
          <div>
            <div className="small text-secondary">{cart.reduce((s,i) => s + i.quantity, 0)} Items Selected</div>
            <div className="fw-bold text-white" style={{ fontSize: '1.2rem' }}>Total: ${getCartTotal().toFixed(2)}</div>
          </div>
          <button onClick={() => setShowCartDrawer(true)} className="btn btn-glass-primary d-flex align-items-center gap-2">
            View Cart <FaChevronUp />
          </button>
        </div>
      )}

      {/* 5) Slide-Up Cart Drawer */}
      {showCartDrawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowCartDrawer(false)}></div>
          <div className="slide-up-drawer">
            <div className="drawer-header">
              <h5 className="fw-bold m-0 text-white">Your Plate Cart</h5>
              <button onClick={() => setShowCartDrawer(false)} className="btn border-0 bg-transparent text-secondary p-0">
                <FaTimes size={18} />
              </button>
            </div>

            {/* Cart Items list */}
            <div className="d-flex flex-column gap-1 overflow-y-auto" style={{ maxHeight: '250px' }}>
              {cart.map((cIt, idx) => {
                let unitPrice = cIt.price;
                cIt.selectedModifiers.forEach(m => { unitPrice += m.price || 0; });
                
                return (
                  <div key={idx} className="cart-item-row text-white">
                    <div>
                      <div className="fw-bold">{cIt.name}</div>
                      {cIt.selectedModifiers.length > 0 && (
                        <div className="small text-secondary">
                          {cIt.selectedModifiers.map(m => m.optionName).join(', ')}
                        </div>
                      )}
                      <div className="small text-primary">${(unitPrice * cIt.quantity).toFixed(2)}</div>
                    </div>
                    
                    <div className="quantity-controller">
                      <button onClick={() => updateCartQty(idx, -1)} className="qty-btn"><FaMinus size={10} /></button>
                      <strong style={{ fontSize: '0.9rem' }}>{cIt.quantity}</strong>
                      <button onClick={() => updateCartQty(idx, 1)} className="qty-btn"><FaPlus size={10} /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chef Notes */}
            <div>
              <label className="form-label text-secondary small">Special instructions for the chef?</label>
              <textarea 
                value={specialNotes} 
                onChange={e => setSpecialNotes(e.target.value)}
                className="form-control glass-panel bg-transparent border-secondary text-white" 
                placeholder="No onions, extra spicy, etc..."
                rows="2"
              ></textarea>
            </div>

            <div className="border-top border-secondary pt-3 mt-1">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary">Total Amount:</span>
                <span className="fw-bold text-white" style={{ fontSize: '1.4rem' }}>${getCartTotal().toFixed(2)}</span>
              </div>
              
              <button onClick={handlePlaceOrder} className="btn btn-glass-primary w-100 py-3 fw-bold text-uppercase" style={{ fontSize: '1rem' }}>
                Place Checkout Order 🚀
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL: ITEM MODIFIERS CUSTOMIZATION */}
      {customizingItem && (
        <div className="drawer-backdrop" onClick={() => setCustomizingItem(null)}>
          <div className="glass-panel-glow p-4 text-white" style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '320px', zIndex: 300, background: '#0d0916', borderRadius: '24px'
          }} onClick={e => e.stopPropagation()}>
            <h5 className="fw-bold mb-1">{customizingItem.name}</h5>
            <p className="small text-secondary mb-3">Customize your options</p>

            <form onSubmit={e => { e.preventDefault(); submitCustomizedAdd(); }} className="d-flex flex-column gap-3">
              {customizingItem.modifiers.map(group => (
                <div key={group.name} className="mb-2">
                  <label className="form-label text-secondary small fw-bold">{group.name} {group.required && <span className="text-danger">*</span>}</label>
                  
                  <div className="d-flex flex-column gap-2">
                    {group.options.map(opt => (
                      <label key={opt.name} className="d-flex align-items-center justify-content-between p-2 rounded glass-panel cursor-pointer">
                        <span className="small">
                          <input 
                            type="radio" 
                            name={group.name} 
                            checked={selectedModifiers[group.name]?.optionName === opt.name}
                            onChange={() => handleModifierChange(group.name, opt.name, opt.price)}
                            className="form-check-input me-2"
                            required={group.required}
                          /> {opt.name}
                        </span>
                        <span className="small text-secondary">
                          {opt.price > 0 ? `+$${opt.price}` : 'Free'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="d-flex gap-2 mt-2 pt-2 border-top border-secondary">
                <button type="submit" className="btn btn-glass-primary flex-grow-1">Add to Cart</button>
                <button type="button" onClick={() => setCustomizingItem(null)} className="btn btn-glass-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST BILL CHECKS */}
      {showBillModal && (
        <div className="drawer-backdrop" onClick={() => setShowBillModal(false)}>
          <div className="glass-panel-glow p-4 text-white text-center" style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '320px', zIndex: 300, background: '#0c0714', borderRadius: '24px'
          }} onClick={e => e.stopPropagation()}>
            <FaReceipt size={32} color="var(--theme-color)" className="mb-3" />
            <h4 className="fw-bold mb-2">Request Bill / Checkout</h4>
            <p className="text-secondary small mb-4">Choose your preferred payment method:</p>

            <div className="d-flex flex-column gap-2 mb-3">
              <button onClick={() => handleRequestBill('cash')} className="btn btn-glass-secondary py-3 fw-bold">
                💵 Pay with Cash
              </button>
              <button onClick={() => handleRequestBill('card')} className="btn btn-glass-secondary py-3 fw-bold">
                💳 Pay with Card
              </button>
              <button onClick={() => handleRequestBill('upi')} className="btn btn-glass-secondary py-3 fw-bold">
                📱 Pay with UPI / Phone
              </button>
            </div>
            
            <button onClick={() => setShowBillModal(false)} className="btn btn-glass-danger w-100">Cancel</button>
          </div>
        </div>
      )}

      {/* MODAL: FEEDBACK SUBMITTALS */}
      {showFeedbackModal && (
        <div className="drawer-backdrop" onClick={() => setShowFeedbackModal(false)}>
          <div className="glass-panel-glow p-4 text-white text-center" style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '340px', zIndex: 300, background: '#0d0916', borderRadius: '24px'
          }} onClick={e => e.stopPropagation()}>
            <FaStar size={36} color="var(--theme-color)" className="mb-2" />
            <h4 className="fw-bold mb-1">Rate Your Experience</h4>
            <p className="text-secondary small mb-3">We would love to hear your thoughts!</p>

            <form onSubmit={handleSendFeedback} className="d-flex flex-column gap-3 text-start">
              <div className="mb-1 text-center">
                <label className="form-label text-secondary small d-block mb-1">Score Rating</label>
                <div className="rating-stars-row">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setFeedbackRating(star)} 
                      className={`star-icon-btn ${star <= feedbackRating ? 'selected' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label text-secondary small">Customer Name (Optional)</label>
                <input type="text" name="custName" placeholder="Anonymous" className="form-control glass-panel bg-transparent border-secondary text-white" />
              </div>

              <div>
                <label className="form-label text-secondary small">Review Comments</label>
                <textarea 
                  value={feedbackComment} 
                  onChange={e => setFeedbackComment(e.target.value)}
                  className="form-control glass-panel bg-transparent border-secondary text-white" 
                  placeholder="Tell us what you liked or how we can improve..."
                  rows="3"
                ></textarea>
              </div>

              <div className="d-flex gap-2 mt-2 pt-2 border-top border-secondary">
                <button type="submit" className="btn btn-glass-primary flex-grow-1">Submit Feedback</button>
                <button type="button" onClick={() => setShowFeedbackModal(false)} className="btn btn-glass-secondary">Skip</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
