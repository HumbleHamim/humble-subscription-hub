'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
} from 'lucide-react';
import { useStore } from '@/components/store/StoreProvider';
import { formatPrice } from '@/lib/data';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Order } from '@/lib/types';

const districts = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cumilla',
  'Narayanganj',
  'Gazipur',
  'Other district',
];

const payments = [
  { id: 'bkash', label: 'bKash', hint: 'Send Money', accent: 'text-[#e2136e]' },
  { id: 'nagad', label: 'Nagad', hint: 'Send Money', accent: 'text-[#ec1c24]' },
  { id: 'cod', label: 'Cash on Delivery', hint: 'Pay when it arrives', accent: 'text-[#1b253c]' },
];

export default function CheckoutPage() {
  const { cart, hydrated, cartSubtotal, placeOrder, user, notify } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState('bkash');
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: 'Dhaka',
    note: '',
    transactionId: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.name,
      email: current.email || user.email,
      phone: current.phone || user.phone || '',
    }));
  }, [user]);

  const delivery = cartSubtotal >= 3000 ? 0 : form.district === 'Dhaka' ? 60 : 120;
  const total = Math.max(0, cartSubtotal + delivery - discount);

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === 'HUMBLE10') {
      const amount = Math.min(300, Math.round(cartSubtotal * 0.1));
      setDiscount(amount);
      setPromoApplied(true);
      notify(`Promo applied — ${formatPrice(amount)} off`);
    } else {
      notify('Invalid promo code', 'error');
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (cart.length === 0) return;
    const placed = placeOrder({
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        district: form.district,
        note: `${form.note.trim()}${form.transactionId ? ` | TrxID: ${form.transactionId.trim()}` : ''}`.trim(),
      },
      payment:
        payments.find((method) => method.id === payment)?.label ?? 'Cash on Delivery',
      delivery,
      discount,
    });
    setOrder(placed);
  };

  if (!hydrated) {
    return (
      <div className="site-container py-20">
        <div className="mx-auto h-96 max-w-4xl animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (order) {
    return (
      <div className="min-h-[70vh] bg-gray-50/70 py-12">
        <div className="site-container">
          <div className="mx-auto max-w-xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-green-50 text-green-500">
              <CheckCircle2 className="h-10 w-10" strokeWidth={1.8} />
            </div>
            <h1 className="text-2xl font-black text-[#1b253c] md:text-3xl">Order Placed!</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Thank you, {order.customer.name.split(' ')[0]}. We have received your order and our
              team will contact you on WhatsApp shortly.
            </p>
            <div className="mt-6 space-y-2 rounded-2xl bg-gray-50 p-5 text-left text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-black text-[#1b253c]">{order.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-bold text-[#1b253c]">{order.payment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Items</span>
                <span className="font-bold text-[#1b253c]">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-2">
                <span className="font-black uppercase tracking-wider text-[#1b253c]">Total</span>
                <span className="text-xl font-black text-theme-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/product"
                className="flex-1 rounded-xl bg-theme-primary px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
              >
                Continue Shopping
              </Link>
              <Link
                href="/profile"
                className="flex-1 rounded-xl border-2 border-[#1b253c] px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-[#1b253c] transition-colors hover:bg-[#1b253c] hover:text-white"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-10 w-10" strokeWidth={1.5} />}
        title="Your Cart is Empty"
        description="Add a product to your cart before checking out."
        action={
          <Link
            href="/product"
            className="inline-block rounded-lg bg-theme-primary px-8 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
          >
            Browse Products
          </Link>
        }
      />
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50/70 pb-16">
      <div className="site-container py-8 md:py-10">
        <Link
          href="/cart"
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors hover:text-theme-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-[#1b253c] md:text-3xl">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete your details and choose how you want to pay.
          </p>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-8">
          <div className="space-y-4">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-theme-primary/10 text-theme-primary">
                  <Phone className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-black uppercase tracking-wider text-[#1b253c]">
                  Contact Details
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-bold text-[#1b253c]">
                    Full name *
                  </label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(event) => update('name', event.target.value)}
                    placeholder="Your full name"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-xs font-bold text-[#1b253c]">
                    Phone number *
                  </label>
                  <input
                    id="phone"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(event) => update('phone', event.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-[#1b253c]">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    placeholder="your@email.com"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-theme-primary/10 text-theme-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-black uppercase tracking-wider text-[#1b253c]">
                  Delivery Address
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="district" className="mb-1.5 block text-xs font-bold text-[#1b253c]">
                    District *
                  </label>
                  <select
                    id="district"
                    required
                    value={form.district}
                    onChange={(event) => update('district', event.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none transition-all focus:border-theme-primary"
                  >
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="city" className="mb-1.5 block text-xs font-bold text-[#1b253c]">
                    City / Area *
                  </label>
                  <input
                    id="city"
                    required
                    value={form.city}
                    onChange={(event) => update('city', event.target.value)}
                    placeholder="e.g. Mirpur"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="mb-1.5 block text-xs font-bold text-[#1b253c]">
                    Full address *
                  </label>
                  <input
                    id="address"
                    required
                    value={form.address}
                    onChange={(event) => update('address', event.target.value)}
                    placeholder="House, road, block, area"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="note" className="mb-1.5 block text-xs font-bold text-[#1b253c]">
                    Order note (optional)
                  </label>
                  <textarea
                    id="note"
                    rows={3}
                    value={form.note}
                    onChange={(event) => update('note', event.target.value)}
                    placeholder="Anything we should know?"
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-theme-primary/10 text-theme-primary">
                  <CreditCard className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-black uppercase tracking-wider text-[#1b253c]">
                  Payment Method
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {payments.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPayment(method.id)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      payment === method.id
                        ? 'border-theme-primary bg-theme-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-sm font-black ${method.accent}`}>{method.label}</span>
                    <span className="mt-1 block text-[11px] font-semibold text-gray-400">
                      {method.hint}
                    </span>
                  </button>
                ))}
              </div>

              {payment !== 'cod' ? (
                <div className="mt-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs leading-relaxed text-amber-800">
                    Send the total amount to <strong>01300-741882</strong> ({payments.find((p) => p.id === payment)?.label}) and
                    enter the transaction ID below. Our team will verify it before dispatch.
                  </p>
                  <label htmlFor="trx" className="block text-xs font-bold text-amber-900">
                    Transaction ID
                  </label>
                  <input
                    id="trx"
                    value={form.transactionId}
                    onChange={(event) => update('transactionId', event.target.value)}
                    placeholder="e.g. 9F7A2B1C"
                    className="h-10 w-full rounded-lg border border-amber-200 bg-white px-3 text-sm outline-none focus:border-theme-primary"
                  />
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-500">
                  Pay in cash when your order arrives. Please keep the exact amount ready for the
                  delivery rider.
                </p>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#1b253c]">
              Your Order
            </h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.key} className="flex gap-2.5">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    <img src={item.image} alt="" className="size-full object-cover" />
                    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#1b253c] text-[9px] font-black text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[11px] font-bold leading-tight text-[#1b253c]">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {item.planLabel ?? item.optionLabel ?? ''}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#1b253c]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={promo}
                    onChange={(event) => setPromo(event.target.value)}
                    placeholder="Promo code"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-2 text-xs uppercase outline-none focus:border-theme-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyPromo}
                  className="h-9 shrink-0 rounded-lg bg-[#1b253c] px-3 text-xs font-bold text-white transition-colors hover:bg-theme-primary"
                >
                  Apply
                </button>
              </div>
              {promoApplied ? (
                <p className="mt-1.5 text-[11px] font-bold text-green-600">HUMBLE10 applied</p>
              ) : null}
            </div>

            <div className="mt-4 space-y-2.5 border-t border-dashed border-gray-200 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-[#1b253c]">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="font-bold text-[#1b253c]">
                  {delivery === 0 ? 'Free' : formatPrice(delivery)}
                </span>
              </div>
              {discount > 0 ? (
                <div className="flex items-center justify-between text-green-600">
                  <span>Promo</span>
                  <span className="font-bold">-{formatPrice(discount)}</span>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between border-t border-dashed border-gray-200 pt-3">
                <span className="text-sm font-black uppercase tracking-wider text-[#1b253c]">
                  Total
                </span>
                <span className="text-2xl font-black text-theme-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-theme-primary text-sm font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
            >
              <ShieldCheck className="h-4 w-4" /> Place Order
            </button>
            <div className="mt-3 flex items-center justify-center gap-3 text-[10px] font-semibold text-gray-400">
              <span className="inline-flex items-center gap-1">
                <Truck className="h-3 w-3" /> Fast delivery
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Secure order
              </span>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
