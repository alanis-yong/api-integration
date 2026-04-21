import React, { useState, useEffect } from 'react';

// --- THE SIMULATOR (Don't change this part) ---
const fakeBackendGetItems = async (token: string | null) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (token === "EXPIRED") {
        reject({ status: 401, message: "Token Expired!" });
      } else if (!token) {
        reject({ status: 403, message: "No Token Found!" });
      } else {
        resolve(["🍎 Apple", "🍌 Banana", "🍒 Cherry"]);
      }
    }, 1000);
  });
};

const fakeRefreshTokenAPI = async () => {
  console.log("🔄 Calling Refresh API...");
  return new Promise((resolve) => {
    setTimeout(() => resolve("NEW_VALID_TOKEN"), 2000);
  });
};
// ----------------------------------------------

function Practice() {
  // 2. STATE: Our "Cart" (just a number for now)
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('myshoppingcart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [items, setItems] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>("EXPIRED"); // Start expired!
  const [status, setStatus] = useState("Idle");

  // 3. LOGIC: What happens when we click?
  const addCount = () => {
    setCount(count + 1);
  };

  const resetInput = () => {
    setText('');
  };

  const products = [
    {id: 1, name:'Apple', price: 30},
    {id: 2, name:'Banana', price: 10},
    {id: 3, name:'Cherry', price: 20},
  ];

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(text.toLowerCase())
  );

  const addToCart = (product) => {
    const exist = cart.find((item) => item.id === product.id);
    if (exist) {
      const newCart = cart.map((item) => item.id === product.id ? {...item, quantity: item.quantity + 1} : item);
      setCart(newCart);
    } else {
      setCart([...cart, {...product, quantity: 1}]);
    }
  }

  const removeFromCart = (indexToMatch) => {
    const newCart = cart.filter((_, index) => index !== indexToMatch)
    setCart(newCart);  
  }

  const totalPrice = cart.reduce((sum, item) => sum + (item.price*item.quantity), 0);

  const removeItem = (id) => {
    const exist = cart.find((item) => item.id === id);
    if (exist.quantity === 1) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      setCart(cart.map((item) => item.id === id ? {...item, quantity: item.quantity - 1} : item));
    }
  }

  const addItem = (id) => {
    const updatedCart = cart.map((item) => item.id === id ? {...item, quantity: item.quantity + 1} : item);
      setCart(updatedCart);
    }

  const clearCart = () => {
    setCart([]); 
  }

  useEffect(() => {
    localStorage.setItem('myshoppingcart', JSON.stringify(cart));
  }, [cart]
)

// YOUR MISSION STARTS HERE
  const fetchData = async () => {
    setStatus("Loading...");
    
    try {
      // 1. Try to get items with the current token
      const data = await fakeBackendGetItems(token) as string[];
      setItems(data);
      setStatus("Success!");
    } catch (error: any) {
      
      // 🚩 TASK 1: If the error status is 401, what should we do?
      if (error.status === 401) {
        setStatus("Token expired! Attempting refresh...");
        
        // WRITE THE LOGIC HERE:
        // 1. Call fakeRefreshTokenAPI()
        // 2. Update the token state with the new token
        // 3. Try the fakeBackendGetItems call AGAIN with the new token
        // 4. Update the items state
        const newValidToken = await fakeRefreshTokenAPI() as string;
        setToken(newValidToken);
        const data = await fakeBackendGetItems(newValidToken) as string[];
      setItems(data);
      setStatus("Success!");
      } else {
        setStatus("Error: " + error.message);
      }
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <input value={text} onChange={(e) => setText(e.target.value)}></input>
       <p>{count}</p>
    <button style={{backgroundColor:"green", color:"white"}} onClick={() => addCount()}>Add Count</button>
    <button style={{backgroundColor:"green", color:"white"}} onClick={() => resetInput()}>Reset Input</button>
    {filtered.map(p => (
      <div key={p.id}>{p.name} {p.price}<button style={{backgroundColor:"green", color:"white"}} onClick={() => addToCart(p)}>Add To Cart</button></div>
    ))}

    <h3>Your Cart</h3>{cart.length === 0 ? <p>Your cart is empty</p> :
    (cart.map((item, index) => (
      <div key={index}>{index} {item.name} - {item.price} - {item.quantity}<button style={{backgroundColor:"green", color:"white"}} onClick={() => removeFromCart(index)}>Remove</button><button style={{backgroundColor:"green", color:"white"}} onClick={() => removeItem(item.id)}>-</button><button style={{backgroundColor:"green", color:"white"}} onClick={() => addItem(item.id)}>+</button></div>
    )))}

    {cart.length > 0 ? <button style={{backgroundColor:"green", color:"white"}} onClick={() => clearCart()}>Clear Cart</button> : ''
 }
    <h3>Total Price: ${totalPrice.toLocaleString()}</h3>

     <div style={{ padding: '20px' }}>
      <h3>Status: {status}</h3>
      <p>Current Token: <b>{token}</b></p>
      <button onClick={fetchData}>Fetch Items</button>
      <ul>
        {items.map(i => <li key={i}>{i}</li>)}
      </ul>
    </div>
    </div>

    
  );
  
}

export default Practice;