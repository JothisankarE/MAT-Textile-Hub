import { createContext, useEffect, useState } from "react";
import { menu_list } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const url = import.meta.env.VITE_API_URL || 
                (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
                ? "http://localhost:4000" 
                : "https://mat-textile-hub.vercel.app");



    const [product_list, setProductList] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("")
    const [selectedProduct, setSelectedProduct] = useState(null); // State for product popup
    const [selectedCategory, setSelectedCategory] = useState(null); // State for category popup
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [userData, setUserData] = useState({ name: "", email: "", address: "", theme: "light" });
    const [profileImagePreview, setProfileImagePreview] = useState(null);


    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        toast.success("Product added to cart!");
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    }


    const updateCartItemQuantity = (itemId, quantity) => {
        setCartItems((prevState) => ({
            ...prevState,
            [itemId]: quantity,
        }));
    };


    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        toast.info("Product removed from cart");
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    }

    /*const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = product_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    }*/
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = product_list.find((product) => product._id === item);
                if (itemInfo) {  // Check if itemInfo is defined
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };


    const fetchProductList = async () => {
        const response = await axios.get(url + "/api/food/list");
        setProductList(response.data.data)
    }

    const loadCartData = async (token) => {
        const response = await axios.post(url + "/api/cart/get", {}, { headers: token });
        setCartItems(response.data.cartData || {});
    }

    const fetchUserProfile = async (userToken) => {
        const activeToken = userToken || token;
        if (activeToken) {
            const response = await axios.get(url + "/api/user/profile", { headers: { token: activeToken } });
            if (response.data.success) {
                setUserData(response.data.data);
                if (response.data.data.theme) {
                    setTheme(response.data.data.theme);
                }
            }
        }
    }

    const updateUserProfile = async (formData) => {
        if (token) {
            const response = await axios.post(url + "/api/user/update-profile", formData, { headers: { token } });
            if (response.data.success) {
                toast.success("Profile updated");
                // Allow DB update propogation and await fresh data
                await new Promise(resolve => setTimeout(resolve, 300));
                await fetchUserProfile();
            } else {
                toast.error(response.data.message);
            }
        }
    }

    useEffect(() => {
        document.body.className = theme === "dark" ? "dark-theme" : "light-theme";
        localStorage.setItem("theme", theme);
    }, [theme])

    useEffect(() => {
        async function loadData() {
            await fetchProductList();
            if (localStorage.getItem("token")) {
                const storedToken = localStorage.getItem("token");
                setToken(storedToken)
                await loadCartData({ token: storedToken })
                await fetchUserProfile(storedToken);
            }
        }
        loadData()

        // Polling for product list updates every 5 seconds
        const interval = setInterval(() => {
            fetchProductList();
        }, 5000);

        return () => clearInterval(interval);
    }, [])

    const contextValue = {
        url,
        product_list,
        menu_list,
        cartItems,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        getTotalCartAmount,
        token,
        setToken,
        loadCartData,
        setCartItems,
        fetchProductList,
        selectedProduct,
        setSelectedProduct,
        selectedCategory,
        setSelectedCategory,
        theme,
        setTheme,
        userData,
        setUserData,
        fetchUserProfile,
        updateUserProfile,
        profileImagePreview,
        setProfileImagePreview
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}

export default StoreContextProvider;



// import { createContext, useEffect, useState } from "react";
// import { menu_list } from "../assets/assets";
// import axios from "axios";

// export const StoreContext = createContext(null);

// const StoreContextProvider = (props) => {
//     const url = "http://localhost:4000";
//     const [product_list, setProductList] = useState([]);
//     const [cartItems, setCartItems] = useState({});
//     const [token, setToken] = useState("");

//     // Add an item to the cart
//     const addToCart = async (itemId) => {
//         if (!cartItems[itemId]) {
//             setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
//         } else {
//             setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
//         }

//         if (token) {
//             await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
//         }
//     };

//     // Update item quantity in the cart
//     const updateCartItemQuantity = (itemId, quantity) => {
//         setCartItems((prevState) => ({
//             ...prevState,
//             [itemId]: quantity,
//         }));
//     };

//     // Remove item from the cart
//     const removeFromCart = async (itemId) => {
//         setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

//         if (token) {
//             await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
//         }
//     };

//     // Get the total amount of the cart
//     const getTotalCartAmount = () => {
//         let totalAmount = 0;
//         for (const item in cartItems) {
//             if (cartItems[item] > 0) {
//                 let itemInfo = product_list.find((product) => product._id === item);
//                 if (itemInfo) {
//                     totalAmount += itemInfo.price * cartItems[item];
//                 }
//             }
//         }
//         return totalAmount;
//     };

//     // Fetch product list from backend
//     const fetchProductList = async () => {
//         const response = await axios.get(url + "/api/food/list");
//         setProductList(response.data.data);
//     };

//     // Load cart data from the backend
//     const loadCartData = async (token) => {
//         const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
//         setCartItems(response.data.cartData);
//     };

//     useEffect(() => {
//         async function loadData() {
//             await fetchProductList();
//             const tokenFromStorage = localStorage.getItem("token");
//             if (tokenFromStorage) {
//                 setToken(tokenFromStorage);
//                 await loadCartData(tokenFromStorage);
//             }
//         }
//         loadData();
//     }, []);

//     const contextValue = {
//         url,
//         product_list,
//         menu_list,
//         cartItems,
//         addToCart,
//         updateCartItemQuantity,
//         removeFromCart,
//         getTotalCartAmount,
//         token,
//         setToken,
//         loadCartData,
//         setCartItems,
//         fetchProductList,
//     };

//     return (
//         <StoreContext.Provider value={contextValue}>
//             {props.children}
//         </StoreContext.Provider>
//     );
// };

// export default StoreContextProvider;
