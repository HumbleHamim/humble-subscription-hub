'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { CartItem, Order, User } from '@/lib/types';
import { firebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import {
  authErrorMessage,
  getOrCreateProfile,
  register as firebaseRegister,
  saveProfile,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  type ProfileInput,
} from '@/lib/firebase-auth';

type Toast = { id: number; message: string; tone: 'success' | 'error' | 'info' };

type CheckoutDetails = {
  customer: Order['customer'];
  payment: string;
  delivery: number;
  discount: number;
};

type StoreContextValue = {
  hydrated: boolean;
  authReady: boolean;
  firebaseConfigured: boolean;
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  orders: Order[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (item: Omit<CartItem, 'key' | 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  signIn: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, input: ProfileInput) => Promise<User>;
  saveProfile: (input: ProfileInput) => Promise<User>;
  logout: () => Promise<void>;
  placeOrder: (details: CheckoutDetails) => Order;
  notify: (message: string, tone?: Toast['tone']) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE = {
  cart: 'humble.cart.v1',
  wishlist: 'humble.wishlist.v1',
  orders: 'humble.orders.v1',
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = ++toastId.current;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2600);
  }, []);

  useEffect(() => {
    setCart(readJSON<CartItem[]>(STORAGE.cart, []));
    setWishlist(readJSON<string[]>(STORAGE.wishlist, []));
    setOrders(readJSON<Order[]>(STORAGE.orders, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (account) => {
      if (!account) {
        setUser(null);
        setAuthReady(true);
        return;
      }

      void getOrCreateProfile(account)
        .then((profile) => setUser(profile))
        .catch(() => notify('We could not load your profile. Please try again.', 'error'))
        .finally(() => setAuthReady(true));
    });

    return unsubscribe;
  }, [notify]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE.cart, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE.wishlist, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE.orders, JSON.stringify(orders));
  }, [orders, hydrated]);

  const addToCart = useCallback<StoreContextValue['addToCart']>((item) => {
    const quantity = Math.max(1, item.quantity ?? 1);
    const key = [item.slug, item.optionLabel ?? '', item.planLabel ?? ''].join('::');
    setCart((current) => {
      const existing = current.find((entry) => entry.key === key);
      if (existing) {
        return current.map((entry) =>
          entry.key === key ? { ...entry, quantity: entry.quantity + quantity } : entry,
        );
      }
      return [...current, { ...item, key, quantity }];
    });
    notify('Added to cart');
  }, [notify]);

  const removeFromCart = useCallback((key: string) => {
    setCart((current) => current.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) => (item.key === key ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback<StoreContextValue['toggleWishlist']>((slug) => {
    setWishlist((current) => {
      if (current.includes(slug)) {
        notify('Removed from wishlist', 'info');
        return current.filter((item) => item !== slug);
      }
      notify('Saved to wishlist');
      return [...current, slug];
    });
  }, [notify]);

  const isWishlisted = useCallback((slug: string) => wishlist.includes(slug), [wishlist]);

  const signIn = useCallback<StoreContextValue['signIn']>(async (email, password) => {
    const nextUser = await firebaseSignIn(email, password);
    setUser(nextUser);
    notify(`Welcome back, ${nextUser.name.split(' ')[0]}!`);
    return nextUser;
  }, [notify]);

  const register = useCallback<StoreContextValue['register']>(async (email, password, input) => {
    const nextUser = await firebaseRegister(email, password, input);
    setUser(nextUser);
    notify(`Welcome to Humble, ${nextUser.name.split(' ')[0]}!`);
    return nextUser;
  }, [notify]);

  const updateProfile = useCallback<StoreContextValue['saveProfile']>(async (input) => {
    if (!firebaseAuth?.currentUser) throw new Error('You must be signed in to update your profile.');
    const nextUser = await saveProfile(firebaseAuth.currentUser, input);
    setUser(nextUser);
    notify('Profile updated');
    return nextUser;
  }, [notify]);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured) await firebaseSignOut();
    setUser(null);
    notify('Signed out', 'info');
  }, [notify]);

  const placeOrder = useCallback<StoreContextValue['placeOrder']>((details) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = Math.max(0, subtotal + details.delivery - details.discount);
    const order: Order = {
      id: `HSH-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      createdAt: new Date().toISOString(),
      items: cart,
      subtotal,
      delivery: details.delivery,
      discount: details.discount,
      total,
      customer: details.customer,
      payment: details.payment,
      status: 'Processing',
    };
    setOrders((current) => [order, ...current]);
    setCart([]);
    return order;
  }, [cart]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      hydrated,
      authReady,
      firebaseConfigured: isFirebaseConfigured,
      cart,
      wishlist,
      user,
      orders,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      signIn,
      register,
      saveProfile: updateProfile,
      logout,
      placeOrder,
      notify,
    }),
    [
      hydrated,
      authReady,
      cart,
      wishlist,
      user,
      orders,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      signIn,
      register,
      updateProfile,
      logout,
      placeOrder,
      notify,
    ],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6 md:right-6 md:left-auto md:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-toast-in pointer-events-auto flex items-center gap-2.5 rounded-full px-4 py-3 text-sm font-bold text-white shadow-xl ${
              toast.tone === 'error'
                ? 'bg-red-500'
                : toast.tone === 'info'
                  ? 'bg-navy'
                  : 'bg-theme-primary'
            }`}
          >
            <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[11px]">
              {toast.tone === 'error' ? '!' : toast.tone === 'info' ? 'i' : '✓'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}

export { authErrorMessage };
