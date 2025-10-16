import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Chat, Type } from "@google/genai";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(false);
  const [pastOrders, setPastOrders] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [menu, setMenu] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const aiRef = useRef(null);
  const numberedMenuRef = useRef('');
  const cartButtonRef = useRef(null);
  const searchInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isSearchVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);
  
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('madrasMasalaPastOrders');
      if (savedOrders) {
        setPastOrders(JSON.parse(savedOrders));
      }
    } catch (e) {
      console.error("Failed to load past orders from localStorage", e);
    }
    initializeChat();
  }, []);

   const initializeChat = () => {
    if (chatRef.current) return;
    try {
      if (!aiRef.current) {
         aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
         const rawMenuText = `
          **DOSA SPECIALS**
          - PLAIN DOSA: Crisp rice and lentil crepe served with chutney and sambar. £5.49
          - MASALA DOSA: Dosa filled with spiced mashed potatoes, served with chutney and sambar. £6.99
          - GHEE DOSA: Crispy dosa roasted with ghee for extra flavour. £5.99
          - GHEE PODI DOSA: Dosa layered with ghee and spicy chutney powder. £6.99
          - CHICKEN DOSA: Crispy dosa stuffed with chicken masala. £7.49
          - LAMB DOSA: Dosa filled with spiced minced lamb curry. £7.99
          - EGG DOSA: Thin dosa spread with whisked egg and spices. £6.99

          **STARTERS**
          - MEDU VADAI (2 PCS): Golden fried lentil doughnuts, crispy on the outside, fluffy inside. £2.49
          - MASALA VADAI (2 PCS): Crunchy spiced chana dal fritters with onions, curry leaves and green chillies. £3.49
          - ONION PAKORA: Thinly sliced onions coated in seasoned batter and deep-fried. £3.49
          - VEG ROLL: Crisp pastry roll stuffed with lightly spiced mixed vegetables. £3.49
          - MUTTON ROLLS: Flaky fried roll filled with spiced minced mutton and herbs. £4.49
          - FISH CUTLET: Spiced fish patties coated in breadcrumbs and shallow-fried. £4.49
          - BEACH SIDE NETHLI FRY: Tiny anchovies marinated in chilli and turmeric, fried until crisp. £7.49
          - DEVIL (CHICKEN/LAMB/PRAWN): A fiery Sri Lankan-style stir fry. £8.99/£9.99/£10.99
          - CHICKEN 65: Spicy, deep-fried marinated chicken cubes tossed in masalas. £8.49
          - CHICKEN VARUVAL: Traditional South Indian dry chicken fry with spices, onions, and curry leaves. £8.49

          **VEGETARIAN CURRIES**
          - YELLOW DAL: Comforting yellow lentils slow-cooked with garlic, cumin and turmeric. £6.49
          - DAL MAKHNI: Rich and creamy black lentils simmered overnight with butter and spices. £8.49
          - SAAG PANEER: Cottage cheese cubes simmered in smooth spinach gravy. £8.49
          - VEGETABLE CHETTINAD: Mixed vegetables cooked in a bold Chettinad-style pepper and coconut masala. £8.49
          - KADAAI PANEER: Paneer tossed with onions, capsicum and kadai masala. £8.49
          - KADAAI VEGETABLE: Seasonal vegetables cooked with onion, tomato and kadai spices. £8.49

          **NON-VEG CURRIES**
          - BUTTER CHICKEN MASALA: Juicy chicken pieces in a silky tomato, butter and cream sauce. £8.49
          - KERALA FISH CURRY: Fish cooked in coconut milk with tamarind and curry leaves. £8.49
          - MADRAS MASALA PRAWNS: Fresh prawns simmered in a spicy Madras-style masala. £10.49
          - SOUTH-INDIAN EGG CURRY: Boiled eggs cooked in a hot and tangy tomato gravy. £7.49
          - SAAG LAMB: Tender lamb pieces cooked in a smooth spinach-based sauce. £9.49
          - SAAG CHICKEN: Chicken simmered in spiced spinach gravy with a creamy finish. £8.49
          - SAAG PRAWNS: Prawns cooked in a mildly spiced spinach curry. £9.49
          - KADAI PRAWNS: Juicy prawns stir-fried with onions, peppers and kadai spices. £9.49
          - KADAI CHICKEN: Chicken cooked with capsicum, onion and kadai-style masala. £8.49
          - KADAI LAMB: Spiced lamb curry cooked with kadai flavours of onion and capsicum. £9.49
          - CHETTINAD CHICKEN: Spicy chicken curry flavoured with black pepper, fennel and Chettinad spices. £8.49
          - LAMB ROGAN JOSH: Kashmiri-style lamb curry cooked in a rich tomato and onion gravy. £9.49
          - SRI-LANKAN LAMB CURRY (ON THE BONE): Authentic island-style lamb curry. £9.49

          **BIRYANIS & RICE DISHES**
          - CHICKEN BIRYANI: Aromatic basmati rice layered with spiced chicken. £9.49
          - LAMB BIRYANI: Tender lamb pieces cooked with saffron rice. £10.49
          - VEGETABLE BIRYANI: Fragrant rice mixed with seasonal vegetables. £7.99
          - CHICKEN KOTHU: Shredded parotta stir-fried with chicken. £8.49
          - MUTTON KOTHU: Tender mutton tossed with chopped parotta. £9.49
          - VEG KOTHU: Flaky parotta stir-fried with mixed vegetables. £7.99
          - CHICKEN FRIED RICE: Basmati rice stir-fried with chicken, Fresh Vegetables, and soy seasoning. £8.49
          - EGG FRIED RICE: Lightly spiced fried rice with scrambled eggs and vegetables. £8.99
          - VEG FRIED RICE: Fluffy rice stir-fried with fresh seasonal vegetables. £7.99
          - MIXED FRIED RICE: Fried rice with chicken, egg, Prawn, Lamb and assorted vegetables. £10.49
          - STEAMED RICE: Fragrant, fluffy steamed white rice. £3.49
          - PULAO RICE: Fragrant basmati rice cooked with light spices. £4.49

          **BREADS & SIDES**
          - PARATHA (2 PCS): Soft, layered flatbread. £4.99
          - APPAM (2 PCS): £3.99
          - MILK APPAM: £4.49
          - EGG APPAM (1 PC): £3.49
          - IDLY (3 PCS): Soft, steamed rice and lentil cakes. £5.49
          - IDIYAPPAM (50/100 PCS): £9.99 / £21.99

          **DESSERTS**
          - KESARI: Sweet semolina pudding. £4.49
          - CARROT HALWA: Grated carrots slow-cooked with milk. £4.49
          - GULAB JAMUN: Soft milk dumplings in sugar syrup. £4.49
          - PAYASAM: Creamy South Indian rice pudding. £4.49

          **TEA & COFFEE**
          - INDIAN MASALA TEA: Spiced chai. £2.49
          - SOUTH INDIAN FILTER COFFEE: Strong coffee decoction blended with frothy milk. £2.49
          - GINGER TEA: Warming tea brewed with fresh ginger and milk. £1.99
          - BLACK TEA: Classic Indian black tea. £1.49
        `;
        const parsedMenu = {};
        const menuWithNumbersLines = [];
        let itemCounter = 1;

        rawMenuText.split('\n').forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('- ')) {
            const itemLineContent = trimmedLine.substring(2);
            const namePart = itemLineContent.split(':')[0].trim();
            const priceMatch = trimmedLine.match(/£(\d+\.\d+)/);
            
            if (namePart && priceMatch) {
              parsedMenu[namePart] = {
                price: parseFloat(priceMatch[1]),
                id: itemCounter,
              };
              menuWithNumbersLines.push(`- ${itemCounter}. ${itemLineContent}`);
              itemCounter++;
            } else {
              menuWithNumbersLines.push(line);
            }
          } else {
            menuWithNumbersLines.push(line);
          }
        });
        
        numberedMenuRef.current = menuWithNumbersLines.join('\n');
        setMenu(parsedMenu);
      }
      
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: 'The action to perform. Either "addToOrder" or "chatResponse".'
          },
          items: {
            type: Type.ARRAY,
            description: 'A list of items to add to the order. Only present if action is "addToOrder".',
            items: {
              type: Type.OBJECT,
              properties: {
                itemName: {
                  type: Type.STRING,
                  description: 'The name of the menu item, matching the menu exactly.'
                },
                quantity: {
                  type: Type.INTEGER,
                  description: 'The quantity of the item.'
                }
              },
              required: ['itemName', 'quantity']
            }
          },
          responseText: {
            type: Type.STRING,
            description: 'The chatbot\'s conversational response to the user.'
          }
        },
        required: ['action', 'responseText']
      };

      chatRef.current = aiRef.current.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          responseMimeType: "application/json",
          responseSchema,
          systemInstruction: `You are a friendly, concise, and helpful chatbot for an Indian restaurant called "Madras Masala". Your goal is to assist customers by answering questions about the menu, suggesting popular dishes, and helping them with their orders.

When a customer wants to order something (e.g., "add 2 masala dosas", "I want item #3", "2 of number 5"), you MUST use the "addToOrder" action. Find the item on the menu, either by its name or number, and use its exact full name from the menu in the \`itemName\` field. Match \`itemName\` exactly to the menu. After adding an item, your \`responseText\` should confirm the action. HOWEVER, if the item added is from the **STARTERS** category, make the confirmation funny and suggest a main course or dessert. For example: 'Mutton Rolls are in the cart! A bold move. To make it a legendary meal, might I tempt you with our creamy Payasam for dessert?' or 'Excellent choice! The Onion Pakoras are a great start. They get lonely without a main course, though. Might I suggest our famous Butter Chicken to keep them company?'. For all other non-starter items, a simple confirmation is fine, like: "Great! I've added a Masala Dosa to your order. Anything else?".

For all other queries (greetings, menu questions, recommendations), you MUST use the "chatResponse" action and provide the answer in \`responseText\`.

When a customer asks for the menu or a menu category (e.g., 'starters', 'curries', 'biryanis', 'desserts'), you MUST format the \`responseText\` using simple HTML. Use a \`<strong>\` tag for each category title, followed by a \`<ul>\` for the items in that category. Each \`<li>\` should contain the item number, full name, and price. For example: "<strong>STARTERS</strong><ul><li>8. MEDU VADAI (2 PCS) - £2.49</li><li>9. MASALA VADAI (2 PCS) - £3.49</li></ul>". If a user asks for 'curries', show both 'VEGETARIAN CURRIES' and 'NON-VEG CURRIES' sections, each formatted this way.

If a user asks for 'vegetarian options', you must filter the menu to show only vegetarian items. Present the results using the same HTML format as the main menu (<strong> for categories, <ul>/<li> for items). The following categories are entirely vegetarian: VEGETARIAN CURRIES, BREADS & SIDES, DESSERTS, TEA & COFFEE. For other categories like DOSA SPECIALS, STARTERS, and BIRYANIS & RICE DISHES, you must carefully inspect each item and include only those that do not contain meat (Chicken, Lamb, Mutton, Fish, Prawns) or Egg. The NON-VEG CURRIES section should be completely excluded.

When a customer asks for recommendations, suggest 'Butter Chicken Masala' and 'Lamb Rogan Josh'. If a customer asks about 'special offers', respond with "We don't have any special offers at the moment, but our Butter Chicken is a crowd favorite!".

Do not answer questions that are not related to the restaurant. Here is the menu with item numbers:\n\n${numberedMenuRef.current}`,
        },
      });

      setMessages([
        {
          role: "model",
          text: "Welcome to Madras Masala! How can I help you today? You can ask me about our menu or place an order.",
        },
      ]);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to initialize the chatbot. Please check the API key and refresh.");
    }
  };

  const resetChat = () => {
    chatRef.current = null; // Force re-initialization
    setMessages([]);
    initializeChat();
  }

  const handleClearChat = () => {
    if (isLoading) return;
    setCart([]);
    setIsCartOpen(false);
    setShowConfirmationModal(false);
    resetChat();
  };

  const handleAddToCart = (items) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      const menuKeys = Object.keys(menu);

      items.forEach(item => {
        const menuItemKey = menuKeys.find(key => key.trim().toUpperCase() === item.itemName.trim().toUpperCase());
        
        if (!menuItemKey) {
          console.warn(`Item not found in menu: ${item.itemName}`);
          return;
        }

        const price = menu[menuItemKey].price;
        const existingItemIndex = newCart.findIndex(cartItem => cartItem.name === menuItemKey);
        
        if (existingItemIndex > -1) {
          newCart[existingItemIndex].quantity += item.quantity;
        } else {
          newCart.push({ name: menuItemKey, quantity: item.quantity, price });
        }
      });
      return newCart;
    });
    
    if (cartButtonRef.current) {
        cartButtonRef.current.classList.add('animate');
        setTimeout(() => {
            cartButtonRef.current?.classList.remove('animate');
        }, 820);
    }
  };

  const handleUpdateQuantity = (itemName, delta) => {
    setCart(prevCart => {
        const newCart = prevCart.map(item => {
            if (item.name === itemName) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0);
        
        if (newCart.length === 0) {
            setIsCartOpen(false);
        }
        return newCart;
    });
  };

  const handleClearCart = () => {
      setCart([]);
      setIsCartOpen(false);
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmOrder = () => {
    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        items: cart,
        total: calculateTotal(),
    };
    const updatedPastOrders = [newOrder, ...pastOrders];
    setPastOrders(updatedPastOrders);
    localStorage.setItem('madrasMasalaPastOrders', JSON.stringify(updatedPastOrders));
    
    setShowConfirmationModal(false);
    setCart([]);
    const confirmationMessage = { role: "model", text: "Thank you for your order! It has been placed and will be ready for you shortly." };
    setMessages(prev => [...prev, confirmationMessage]);
  };

  const handleCancelOrder = () => {
    setShowConfirmationModal(false);
    setIsCartOpen(true);
  };

  const handleReorder = (orderItems) => {
    const itemsToAdd = orderItems.map(item => ({ itemName: item.name, quantity: item.quantity }));
    handleAddToCart(itemsToAdd);
    setIsPastOrdersOpen(false);
  };

  const submitMessage = async (text) => {
    if (!text.trim() || isLoading || !chatRef.current) return;

    const userMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatRef.current.sendMessage({ message: text });
      const responseText = response.text;
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON response:", responseText);
        throw new Error("Invalid response from server.");
      }

      if (parsedData.responseText) {
        const botMessage = { role: "model", text: parsedData.responseText };
        setMessages(prev => [...prev, botMessage]);
      }
      
      if (parsedData.action === 'addToOrder' && parsedData.items) {
        handleAddToCart(parsedData.items);
      }

    } catch (e) {
      console.error(e);
      const errorMessage = { role: "model", text: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    submitMessage(inputValue);
  };
  
  const handleSuggestionClick = (suggestion) => {
    submitMessage(suggestion);
  };

  const handleMenuSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const lowerCaseQuery = query.toLowerCase();
    const resultsByCat = new Map();
    let currentCategory = "Misc";

    numberedMenuRef.current.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('**')) {
            currentCategory = trimmedLine.replace(/\*\*/g, '');
        } else if (trimmedLine.startsWith('- ') && trimmedLine.toLowerCase().includes(lowerCaseQuery)) {
            if (!resultsByCat.has(currentCategory)) {
                resultsByCat.set(currentCategory, []);
            }
            resultsByCat.get(currentCategory).push(trimmedLine.substring(2));
        }
    });

    let htmlResponse;
    if (resultsByCat.size > 0) {
        htmlResponse = `<p><strong>Search results for "${query}":</strong></p>`;
        resultsByCat.forEach((items, category) => {
            htmlResponse += `<strong>${category}</strong><ul>`;
            items.forEach(item => {
                htmlResponse += `<li>${item}</li>`;
            });
            htmlResponse += `</ul>`;
        });
    } else {
        htmlResponse = `Sorry, no menu items found matching "${query}".`;
    }

    setMessages(prev => [...prev, { role: 'model', text: htmlResponse }]);
    setSearchQuery("");
    setIsSearchVisible(false);
  };

  const isOverlayVisible = isCartOpen || isPastOrdersOpen;
  const closeAllSidebars = () => {
    setIsCartOpen(false);
    setIsPastOrdersOpen(false);
  }

  return (
    <>
      <style>{`
        :root {
          --primary-color: #ff9900;
          --background-color-rgb: 40, 44, 52;
          --background-color: #282c34;
          --user-bubble-color: #ff9900;
          --bot-bubble-color: #4a4f59;
          --text-color: #ffffff;
          --input-bg-color: #3a3f47;
          --danger-color: #ff6b6b;
        }
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--background-color);
        }
        .message-list {
          flex-grow: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .message {
          max-width: 80%;
          padding: 10px 15px;
          border-radius: 18px;
          line-height: 1.5;
          word-wrap: break-word;
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .user-message {
          align-self: flex-end;
          background-color: var(--user-bubble-color);
          color: #000;
        }
        .bot-message {
          align-self: flex-start;
          background-color: var(--bot-bubble-color);
          color: var(--text-color);
        }
        .message-form {
          display: flex;
          padding: 10px 20px;
          border-top: 1px solid var(--bot-bubble-color);
          background-color: var(--background-color);
        }
        .message-input {
          flex-grow: 1;
          border: none;
          padding: 12px 15px;
          border-radius: 20px;
          background-color: var(--input-bg-color);
          color: var(--text-color);
          font-size: 16px;
        }
        .message-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--user-bubble-color);
        }
        .send-button {
          margin-left: 10px;
          border: none;
          background-color: var(--user-bubble-color);
          color: #000;
          padding: 10px 18px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        .send-button:hover:not(:disabled) {
          background-color: #e68a00;
        }
        .send-button:disabled {
          background-color: #555;
          color: #888;
          cursor: not-allowed;
        }
        .loading-indicator span {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--text-color);
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .loading-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
        .loading-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        .error-message {
          text-align: center;
          color: var(--danger-color);
          padding: 10px;
        }
        .header {
          background-color: var(--bot-bubble-color);
          color: var(--text-color);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 10;
          display: flex;
          flex-direction: column;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
        }
        .header h1 {
          font-size: 1.2rem;
          font-weight: 500;
          margin: 0;
        }
        .header-controls { display: flex; align-items: center; gap: 15px; }
        .header-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
        }
        .header-icon-btn svg { width: 24px; height: 24px; fill: currentColor; }
        .clear-button {
          background-color: transparent;
          border: 1px solid var(--primary-color);
          color: var(--primary-color);
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
        }
        .clear-button:hover:not(:disabled) {
          background-color: var(--primary-color);
          color: #000;
        }
        .clear-button:disabled { border-color: #555; color: #555; cursor: not-allowed; }
        .bot-message ul { padding-left: 20px; margin: 10px 0; list-style-position: inside;}
        .bot-message li { margin-bottom: 5px; }
        .suggestion-buttons {
          margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;
        }
        .suggestion-buttons button {
          background-color: transparent; border: 1px solid var(--primary-color);
          color: var(--primary-color); padding: 6px 14px; border-radius: 20px;
          cursor: pointer; font-size: 14px; font-weight: 500;
          transition: all 0.2s ease-in-out;
        }
        .suggestion-buttons button:hover:not(:disabled) {
          background-color: var(--primary-color); color: #000;
        }
        .suggestion-buttons button:disabled { border-color: #555; color: #555; cursor: not-allowed; }

        .search-bar-container {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
          padding: 0 20px;
        }
        .search-bar-container.open {
          max-height: 100px;
          padding: 10px 20px;
        }
        .search-form { display: flex; gap: 10px; }
        .search-input {
          flex-grow: 1; border: none; padding: 10px 15px; border-radius: 20px;
          background-color: var(--input-bg-color); color: var(--text-color); font-size: 14px;
        }
        .search-input:focus { outline: none; box-shadow: 0 0 0 2px var(--primary-color); }
        .search-button {
          border: none; background-color: var(--primary-color); color: #000;
          padding: 10px 18px; border-radius: 20px; cursor: pointer;
          font-weight: 500; font-size: 14px;
        }
        
        .cart-button { position: relative; }
        .cart-count {
          position: absolute; top: -5px; right: -8px;
          background-color: #fff; color: #000;
          border-radius: 50%; width: 18px; height: 18px;
          display: flex; justify-content: center; align-items: center;
          font-size: 12px; font-weight: bold;
        }

        .sidebar-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.5); z-index: 99;
          opacity: 0; transition: opacity 0.3s ease-in-out;
          pointer-events: none;
        }
        .sidebar-overlay.open { opacity: 1; pointer-events: auto; }

        @keyframes cart-shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .cart-button.animate { animation: cart-shake 0.82s cubic-bezier(.36,.07,.19,.97) both; }
        
        .sidebar {
          position: fixed; top: 0; width: 320px; height: 100%;
          background-color: var(--input-bg-color); box-shadow: -2px 0 5px rgba(0,0,0,0.5);
          transition: transform 0.3s ease-in-out;
          display: flex; flex-direction: column; z-index: 100;
        }
        .sidebar-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--bot-bubble-color); }
        .sidebar-header h2 { margin: 0; }
        .sidebar-close-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
        .sidebar-content { flex-grow: 1; overflow-y: auto; padding: 20px; }
        .sidebar-content ul { list-style: none; padding: 0; margin: 0; }

        .cart-sidebar { right: 0; transform: translateX(100%); }
        .cart-sidebar.open { transform: translateX(0); }
        
        .past-orders-sidebar { left: 0; transform: translateX(-100%); }
        .past-orders-sidebar.open { transform: translateX(0); }
        
        .empty-message { text-align: center; padding: 40px 20px; color: #ccc; }
        .empty-message svg { width: 60px; height: 60px; fill: #666; margin-bottom: 15px; }
        .empty-message h3 { margin: 0 0 10px 0; font-size: 1.1rem; color: white; }
        
        .cart-item {
          display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;
          padding-bottom: 20px; border-bottom: 1px solid var(--bot-bubble-color);
        }
        .cart-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .cart-item-details { display: flex; justify-content: space-between; align-items: flex-start; }
        .cart-item-details span:first-child { font-weight: 500; font-size: 1rem; color: white; padding-right: 10px; }
        .cart-item-details span:last-child { font-size: 0.9rem; color: #ccc; }
        .cart-item-controls { display: flex; justify-content: space-between; align-items: center; }
        
        .quantity-controls {
          display: flex; align-items: center; gap: 10px;
          background-color: var(--bot-bubble-color); border-radius: 20px; padding: 2px;
        }
        .quantity-btn {
          background-color: transparent; border: none; color: var(--primary-color);
          width: 28px; height: 28px; border-radius: 50%; font-size: 1.2rem;
          font-weight: bold; cursor: pointer; display: flex; justify-content: center;
          align-items: center; line-height: 1; transition: background-color 0.2s;
        }
        .quantity-btn:hover { background-color: rgba(255, 153, 0, 0.2); }
        .quantity-text { font-size: 1rem; font-weight: 500; min-width: 20px; text-align: center; }
        
        .cart-footer { padding: 20px; border-top: 1px solid var(--bot-bubble-color); display: flex; flex-direction: column; gap: 10px; }
        .cart-total { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 1.1rem; }
        .place-order-btn {
          width: 100%; padding: 12px; border: none; border-radius: 8px;
          background-color: var(--primary-color); color: #000; font-size: 16px; font-weight: bold; cursor: pointer;
        }
        .place-order-btn:disabled { background-color: #555; cursor: not-allowed; }
        .clear-cart-btn {
            width: 100%; padding: 10px; border: 1px solid var(--danger-color); border-radius: 8px;
            background-color: transparent; color: var(--danger-color); font-size: 14px;
            font-weight: 500; cursor: pointer; transition: all 0.2s;
        }
        .clear-cart-btn:hover { background-color: var(--danger-color); color: black; }

        .past-order-card {
          background-color: var(--bot-bubble-color); padding: 15px; border-radius: 8px; margin-bottom: 15px;
        }
        .past-order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .past-order-header span { font-size: 0.9rem; color: #ccc; }
        .past-order-header strong { font-size: 1rem; color: white; }
        .past-order-items li { display: flex; justify-content: space-between; font-size: 0.95rem; margin-bottom: 4px; padding-left: 10px; }
        .reorder-btn {
          width: 100%; margin-top: 15px; padding: 10px; border: 1px solid var(--primary-color);
          background: transparent; color: var(--primary-color); border-radius: 8px;
          cursor: pointer; font-weight: 500;
        }
        .reorder-btn:hover { background-color: var(--primary-color); color: #000; }
        
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-color: rgba(var(--background-color-rgb), 0.8);
          display: flex; justify-content: center; align-items: center; z-index: 200;
          animation: fadeIn 0.2s ease;
        }
        .modal {
          background-color: var(--input-bg-color); padding: 30px; border-radius: 12px;
          width: 90%; max-width: 400px; text-align: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .modal h2 { margin-top: 0; }
        .modal p { margin: 15px 0; }
        .modal-buttons { display: flex; justify-content: center; gap: 15px; margin-top: 25px; }
        .modal-buttons button {
          padding: 10px 20px; border-radius: 8px; border: none;
          font-size: 16px; font-weight: 500; cursor: pointer;
        }
        .modal-buttons button:first-child { background-color: var(--bot-bubble-color); color: white; }
        .modal-buttons button:last-child { background-color: var(--primary-color); color: #000; }
      `}</style>
      <header className="header">
        <div className="header-top">
            <h1>Madras Masala</h1>
            <div className="header-controls">
                <button onClick={() => setIsSearchVisible(prev => !prev)} className="header-icon-btn" aria-label="Toggle menu search">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                </button>
                <button onClick={() => setIsPastOrdersOpen(true)} className="header-icon-btn" aria-label="View past orders">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.75-1.23-3.5-2.07V8H12z"/></svg>
                </button>
                <button onClick={handleClearChat} className="clear-button" disabled={isLoading} aria-label="Clear chat">
                    Clear
                </button>
                <button ref={cartButtonRef} className="cart-button header-icon-btn" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    {cart.length > 0 && <span className="cart-count">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>}
                </button>
            </div>
        </div>
        <div className={`search-bar-container ${isSearchVisible ? 'open' : ''}`}>
            <form className="search-form" onSubmit={handleMenuSearch}>
                <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menu items..."
                    aria-label="Search menu"
                />
                <button type="submit" className="search-button">Search</button>
            </form>
        </div>
      </header>

      <div className={`sidebar-overlay ${isOverlayVisible ? 'open' : ''}`} onClick={closeAllSidebars}></div>

      <div className={`sidebar past-orders-sidebar ${isPastOrdersOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
            <h2>Past Orders</h2>
            <button className="sidebar-close-btn" onClick={() => setIsPastOrdersOpen(false)}>&times;</button>
        </div>
        <div className="sidebar-content">
            {pastOrders.length === 0 ? (
                <div className="empty-message">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.75-1.23-3.5-2.07V8H12z"/></svg>
                    <h3>No past orders yet</h3>
                    <p>Place an order and it will show up here for easy reordering.</p>
                </div>
            ) : (
                <ul>
                    {pastOrders.map(order => (
                        <li key={order.id} className="past-order-card">
                            <div className="past-order-header">
                                <span>{order.date}</span>
                                <strong>£{order.total.toFixed(2)}</strong>
                            </div>
                            <ul className="past-order-items">
                                {order.items.map(item => (
                                    <li key={item.name}>
                                        <span>{item.quantity} x {item.name}</span>
                                        <span>£{(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="reorder-btn" onClick={() => handleReorder(order.items)}>
                                Reorder
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>

      <div className={`sidebar cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Your Order</h2>
          <button className="sidebar-close-btn" onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>
        <div className="sidebar-content">
          {cart.length === 0 ? (
            <div className="empty-message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25.99 2H17v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44-.01.02z"/></svg>
                <h3>Your cart is empty</h3>
                <p>Add some delicious items from the menu to get started!</p>
            </div>
          ) : (
            <ul>
              {cart.map(item => (
                <li key={item.name} className="cart-item">
                  <div className="cart-item-details">
                    <span>{item.name}</span>
                    <span>£{item.price.toFixed(2)}</span>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button className="quantity-btn" onClick={() => handleUpdateQuantity(item.name, -1)} aria-label={`Decrease quantity of ${item.name}`}>-</button>
                      <span className="quantity-text">{item.quantity}</span>
                      <button className="quantity-btn" onClick={() => handleUpdateQuantity(item.name, 1)} aria-label={`Increase quantity of ${item.name}`}>+</button>
                    </div>
                    <strong>£{(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cart.length > 0 && (
            <div className="cart-footer">
                <div className="cart-total">
                    <strong>Total</strong>
                    <strong>£{calculateTotal().toFixed(2)}</strong>
                </div>
                <button className="place-order-btn" onClick={handlePlaceOrder} disabled={cart.length === 0}>
                    Place Order
                </button>
                <button className="clear-cart-btn" onClick={handleClearCart}>
                    Clear Cart
                </button>
            </div>
        )}
      </div>

      {showConfirmationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Your Order</h2>
            <p>You are about to place an order with a total of £{calculateTotal().toFixed(2)}.</p>
            <p>Are you sure you want to proceed?</p>
            <div className="modal-buttons">
              <button onClick={handleCancelOrder}>Cancel</button>
              <button onClick={handleConfirmOrder}>Confirm Order</button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="message-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}>
               <div dangerouslySetInnerHTML={{ __html: msg.text }} />
               {msg.role === 'model' && index === 0 && (
                  <div className="suggestion-buttons">
                    <button onClick={() => handleSuggestionClick('Show me the starters')} disabled={isLoading}>Starters</button>
                    <button onClick={() => handleSuggestionClick('Show me the Dosa Specials')} disabled={isLoading}>Dosa</button>
                    <button onClick={() => handleSuggestionClick('Show me the curries')} disabled={isLoading}>Curries</button>
                    <button onClick={() => handleSuggestionClick('Show me the Biryanis')} disabled={isLoading}>Biryani</button>
                    <button onClick={() => handleSuggestionClick('Show me the desserts')} disabled={isLoading}>Desserts</button>
                    <button onClick={() => handleSuggestionClick('Any special offers?')} disabled={isLoading}>Special offers</button>
                    <button onClick={() => handleSuggestionClick('Show me vegetarian options')} disabled={isLoading}>Veg only</button>
                  </div>
                )}
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message">
              <div className="loading-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
           <div ref={messagesEndRef} />
        </div>
        {error && <div className="error-message">{error}</div>}
        <form className="message-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="message-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question or place an order..."
            aria-label="Chat input"
            disabled={isLoading}
          />
          <button type="submit" className="send-button" disabled={isLoading || !inputValue.trim()}>
            Send
          </button>
        </form>
      </div>
    </>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);