import React, { useState, useEffect } from 'react';
import { Settings, Save, Database, DollarSign, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminLayout } from './AdminLayout';
import { getSiteSettingsFromFirestore, saveSiteSettingsToFirestore } from '../../services/firebaseService';

export const AdminSettingsView: React.FC = () => {
  const { seedData, isSeeding, showToast } = useShop();

  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState('PREMIUM STORE');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [codEnabled, setCodEnabled] = useState(true);
  const [supportEmail, setSupportEmail] = useState('thepremiumstoree@gmail.com');
  const [supportPhone, setSupportPhone] = useState('+92 323 7506649');
  const [shippingFeeDefault, setShippingFeeDefault] = useState(15);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(150);

  useEffect(() => {
    getSiteSettingsFromFirestore().then((settings) => {
      if (settings) {
        if (settings.storeName) setStoreName(settings.storeName);
        if (settings.currencySymbol) setCurrencySymbol(settings.currencySymbol);
        if (settings.codEnabled !== undefined) setCodEnabled(settings.codEnabled);
        if (settings.supportEmail) setSupportEmail(settings.supportEmail);
        if (settings.supportPhone) setSupportPhone(settings.supportPhone);
        if (settings.shippingFeeDefault !== undefined)
          setShippingFeeDefault(settings.shippingFeeDefault);
        if (settings.freeShippingThreshold !== undefined)
          setFreeShippingThreshold(settings.freeShippingThreshold);
      }
    });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await saveSiteSettingsToFirestore({
        storeName,
        currencySymbol,
        codEnabled,
        supportEmail,
        supportPhone,
        shippingFeeDefault,
        freeShippingThreshold,
      });
      if (ok) {
        showToast('Store settings saved successfully!');
      } else {
        showToast('Error saving settings.');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeSection="Store Settings & System">
      <div className="space-y-8 max-w-4xl">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="font-syne font-black text-2xl md:text-3xl uppercase tracking-tight text-white">
              STORE SYSTEM SETTINGS
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-1">
              Configure payment modes, shipping fees, support info, and catalog database seeding.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase px-6 py-3.5 hover:bg-[#00ff66] transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Save size={16} />
            <span>{saving ? 'SAVING...' : 'SAVE SETTINGS'}</span>
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* GENERAL STORE INFO */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4 font-mono text-xs">
            <h3 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-3">
              GENERAL STORE IDENTIFICATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-400 mb-1">STORE DISPLAY NAME</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">CURRENCY SYMBOL</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-400 mb-1">SUPPORT EMAIL</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">SUPPORT PHONE</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>
            </div>
          </div>

          {/* PAYMENT & SHIPPING CONFIG */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4 font-mono text-xs">
            <h3 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-3">
              PAYMENTS & SHIPPING DISPATCH
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 cursor-pointer">
                <div>
                  <p className="font-bold text-white text-sm">CASH ON DELIVERY (COD)</p>
                  <p className="text-[10px] text-neutral-500">
                    Allow customers to place orders and pay in cash upon package delivery.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#00e65c]"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">STANDARD SHIPPING FEE ($)</label>
                  <input
                    type="number"
                    value={shippingFeeDefault}
                    onChange={(e) => setShippingFeeDefault(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">FREE SHIPPING THRESHOLD ($)</label>
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* DATABASE SEEDING UTILITY */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-purple-400 border-b border-neutral-800 pb-3">
            <Database size={18} />
            <h3 className="font-syne font-bold text-sm uppercase text-white">
              FIRESTORE DATA SEEDING & RESET
            </h3>
          </div>

          <p className="text-neutral-400">
            Populate initial catalog items, default categories, and collections into your Firestore database.
          </p>

          <button
            type="button"
            onClick={seedData}
            disabled={isSeeding}
            className="px-6 py-3 bg-purple-600 text-white font-syne font-bold text-xs uppercase hover:bg-purple-500 transition-colors inline-flex items-center gap-2"
          >
            <Database size={14} />
            <span>{isSeeding ? 'SEEDING FIRESTORE...' : 'SEED SAMPLE CATALOG DATA'}</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};
