import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Filter, Calendar, User, Package, X, CheckCircle2 } from 'lucide-react';
import { supabase, type Distribution, type Recipient, type Seed, type Fertilizer, type VetChemical, type Pesticide } from '../supabase';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../lib/utils';

export default function Distribution() {
  const [distributions, setDistributions] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [inventoryItems, setInventoryItems] = useState<{
    seeds: Seed[],
    fertilizers: Fertilizer[],
    vet_chemicals: VetChemical[],
    pesticides: Pesticide[]
  }>({ seeds: [], fertilizers: [], vet_chemicals: [], pesticides: [] });
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient_id: '',
    item_type: 'seed' as any,
    item_id: '',
    quantity_given: 1,
    date_distributed: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [distRes, recRes, seedRes, fertRes, vetRes, pestRes] = await Promise.all([
        supabase.from('distributions').select('*, recipient:recipients(*)').order('date_distributed', { ascending: false }),
        supabase.from('recipients').select('*'),
        supabase.from('seeds').select('*'),
        supabase.from('fertilizers').select('*'),
        supabase.from('vet_chemicals').select('*'),
        supabase.from('pesticides').select('*')
      ]);

      setDistributions(distRes.data || []);
      setRecipients(recRes.data || []);
      setInventoryItems({
        seeds: seedRes.data || [],
        fertilizers: fertRes.data || [],
        vet_chemicals: vetRes.data || [],
        pesticides: pestRes.data || []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('distributions').insert([{
        ...formData,
        distributed_by: user?.email || 'Unknown'
      }]);

      if (error) throw error;
      
      // Update inventory quantity (simplified logic)
      const table = formData.item_type === 'seed' ? 'seeds' : 
                    formData.item_type === 'fertilizer' ? 'fertilizers' :
                    formData.item_type === 'vet_chemical' ? 'vet_chemicals' : 'pesticides';
      
      const currentItem = (inventoryItems as any)[table + (table.endsWith('s') ? '' : 's')].find((i: any) => i.id === formData.item_id);
      if (currentItem) {
        await supabase.from(table).update({ quantity: currentItem.quantity - formData.quantity_given }).eq('id', formData.item_id);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding distribution:', error);
    }
  };

  const getItemsForType = () => {
    switch (formData.item_type) {
      case 'seed': return inventoryItems.seeds;
      case 'fertilizer': return inventoryItems.fertilizers;
      case 'vet_chemical': return inventoryItems.vet_chemicals;
      case 'pesticide': return inventoryItems.pesticides;
      default: return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resource Distribution</h1>
          <p className="text-slate-500">Track and record distribution of agriculture resources.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-100 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Distribution
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Distributed</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Distributed By</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  </td>
                </tr>
              ) : distributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No distributions recorded yet.</td>
                </tr>
              ) : (
                distributions.map((dist) => (
                  <tr key={dist.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{dist.recipient?.first_name} {dist.recipient?.last_name}</span>
                        <span className="text-xs text-slate-500 font-mono">{dist.recipient?.rsbsa_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 capitalize">{dist.item_type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{dist.quantity_given}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(dist.date_distributed)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{dist.distributed_by}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Distributed</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
                <h3 className="text-xl font-bold">Record New Distribution</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Select Recipient</label>
                    <select
                      required
                      value={formData.recipient_id}
                      onChange={(e) => setFormData({...formData, recipient_id: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">-- Choose Farmer --</option>
                      {recipients.map(r => (
                        <option key={r.id} value={r.id}>{r.last_name}, {r.first_name} ({r.rsbsa_number})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Item Category</label>
                      <select
                        value={formData.item_type}
                        onChange={(e) => setFormData({...formData, item_type: e.target.value as any, item_id: ''})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="seed">Seeds</option>
                        <option value="fertilizer">Fertilizers</option>
                        <option value="vet_chemical">Vet & Chemicals</option>
                        <option value="pesticide">Pesticides</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Select Item</label>
                      <select
                        required
                        value={formData.item_id}
                        onChange={(e) => setFormData({...formData, item_id: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">-- Choose Item --</option>
                        {getItemsForType().map((item: any) => (
                          <option key={item.id} value={item.id}>{item.name} (Stock: {item.quantity})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity Given</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={formData.quantity_given}
                        onChange={(e) => setFormData({...formData, quantity_given: parseInt(e.target.value)})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Date Distributed</label>
                      <input
                        required
                        type="date"
                        value={formData.date_distributed}
                        onChange={(e) => setFormData({...formData, date_distributed: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                  >
                    Confirm Distribution
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
