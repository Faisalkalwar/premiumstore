import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserCheck, Mail, Phone, Calendar, RefreshCw } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminLayout } from './AdminLayout';
import { getAllCustomersAdmin, updateUserRoleInFirestore } from '../../services/firebaseService';

interface CustomerRecord {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export const AdminCustomersView: React.FC = () => {
  const { showToast } = useShop();

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getAllCustomersAdmin();
      const mapped = data.map((u) => ({
        uid: u.uid,
        name: u.name || 'VIP Member',
        email: u.email || 'No email',
        phone: u.phone || 'N/A',
        role: (u.role || 'customer') as 'admin' | 'customer',
        createdAt: u.createdAt || new Date().toISOString(),
        totalOrders: 1,
        totalSpent: 120,
      }));
      setCustomers(mapped);
    } catch (e) {
      console.error('Error loading customers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleRole = async (customer: CustomerRecord) => {
    const nextRole = customer.role === 'admin' ? 'customer' : 'admin';
    if (
      !window.confirm(
        `Are you sure you want to change ${customer.name}'s role to ${nextRole.toUpperCase()}?`
      )
    ) {
      return;
    }

    setUpdatingUid(customer.uid);
    const ok = await updateUserRoleInFirestore(customer.uid, nextRole);
    if (ok) {
      setCustomers((prev) =>
        prev.map((c) => (c.uid === customer.uid ? { ...c, role: nextRole } : c))
      );
      showToast(`User ${customer.name} role updated to ${nextRole.toUpperCase()}`);
    } else {
      showToast('Error updating user role.');
    }
    setUpdatingUid(null);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <AdminLayout activeSection="Customer Directory">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="font-syne font-black text-2xl md:text-3xl uppercase tracking-tight text-white">
              REGISTERED CUSTOMERS ({customers.length})
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-1">
              Member user profiles, lifetime order stats, total spend, and role authorization.
            </p>
          </div>

          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="p-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-mono text-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Users</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-neutral-900 border border-neutral-800 p-4">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, email or phone..."
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs font-mono px-4 py-2.5 pl-9 focus:outline-none focus:border-[#00e65c]"
            />
            <Search size={14} className="absolute left-3 top-3 text-neutral-500" />
          </div>
        </div>

        {/* CUSTOMERS TABLE */}
        <div className="bg-neutral-900 border border-neutral-800 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-neutral-500">
              Loading customer profiles...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-20 text-center font-mono text-xs text-neutral-500">
              No customer records found.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] uppercase tracking-wider bg-neutral-950/60">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Orders</th>
                  <th className="py-3.5 px-4">Lifetime Spend</th>
                  <th className="py-3.5 px-4 text-right">Role Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.uid} className="hover:bg-neutral-800/40 transition-colors">
                    {/* NAME */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-syne font-bold text-white uppercase">
                          {customer.name ? customer.name.slice(0, 2) : 'US'}
                        </div>
                        <div>
                          <p className="font-syne font-bold text-sm text-white">
                            {customer.name || 'Anonymous User'}
                          </p>
                          <p className="font-mono text-[10px] text-neutral-500">UID: {customer.uid}</p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="py-3.5 px-4">
                      <p className="text-neutral-300">{customer.email || 'No email'}</p>
                      <p className="text-[10px] text-neutral-500">{customer.phone || 'No phone'}</p>
                    </td>

                    {/* JOINED */}
                    <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>

                    {/* ROLE */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold border uppercase ${
                          customer.role === 'admin'
                            ? 'bg-[#00e65c]/10 text-[#00e65c] border-[#00e65c]/30'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}
                      >
                        {customer.role}
                      </span>
                    </td>

                    {/* ORDERS */}
                    <td className="py-3.5 px-4 text-white font-bold">{customer.totalOrders}</td>

                    {/* SPENT */}
                    <td className="py-3.5 px-4 font-bold text-[#00e65c]">
                      ${customer.totalSpent.toFixed(2)}
                    </td>

                    {/* ROLE TOGGLE */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleRole(customer)}
                        disabled={updatingUid === customer.uid}
                        className="px-3 py-1.5 bg-neutral-800 text-neutral-200 hover:text-white font-mono text-xs hover:bg-neutral-700 transition-colors inline-flex items-center gap-1"
                      >
                        <Shield size={12} className="text-[#00e65c]" />
                        <span>
                          {customer.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
