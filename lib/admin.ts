import { collection, doc, getDoc, getDocs, limit, query } from 'firebase/firestore';
import { requireFirebase } from '@/lib/firebase';

export type Customer = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  createdAt: number; // epoch ms, 0 if unknown
};

/** An account is an admin when a document exists at admins/{uid}.
 *  Only the Firebase console can create it (client writes are blocked by the rules). */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  const { db } = requireFirebase();
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}

function toMillis(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'toMillis' in value) {
    const fn = (value as { toMillis: () => number }).toMillis;
    if (typeof fn === 'function') return fn.call(value);
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function listCustomers(): Promise<Customer[]> {
  const { db } = requireFirebase();
  const snap = await getDocs(query(collection(db, 'users'), limit(500)));
  return snap.docs
    .map((entry) => {
      const data = entry.data();
      return {
        uid: entry.id,
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        phone: String(data.phone ?? ''),
        createdAt: toMillis(data.createdAt),
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}
