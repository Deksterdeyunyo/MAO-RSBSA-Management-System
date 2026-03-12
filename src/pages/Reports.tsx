import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Filter, Calendar, Search, ChevronDown } from 'lucide-react';
import { supabase } from '../supabase';
import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';

export default function Reports() {
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('distributions')
        .select('*, recipient:recipients(*)')
        .order('date_distributed', { ascending: false });
      
      if (error) throw error;
      setDistributions(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const headers = ['Recipient', 'RSBSA No.', 'Item Type', 'Quantity', 'Date', 'Distributed By'];
    const csvContent = [
      headers.join(','),
      ...distributions.map(d => [
        `"${d.recipient?.first_name} ${d.recipient?.last_name}"`,
        `"${d.recipient?.rsbsa_number}"`,
        d.item_type,
        d.quantity_given,
        d.date_distributed,
        d.distributed_by
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `MAO_Distribution_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500">Generate and export distribution summaries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all"
          >
            <Printer className="w-5 h-5" />
            Print Report
          </button>
          <button 
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-4">Filter by Date</h4>
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="date" 
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input 
              type="date" 
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-4">Item Category</h4>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="seed">Seeds</option>
            <option value="fertilizer">Fertilizers</option>
            <option value="vet_chemical">Vet & Chemicals</option>
            <option value="pesticide">Pesticides</option>
          </select>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-4">Quick Stats</h4>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900">{distributions.length}</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Total Records</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print:shadow-none print:border-none">
        <div className="p-8 hidden print:block text-center border-b border-slate-200 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Municipal Agriculture Office</h1>
          <p className="text-slate-500">Resource Distribution Official Report</p>
          <p className="text-xs text-slate-400 mt-2">Generated on {new Date().toLocaleString()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">RSBSA No.</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center">Loading...</td></tr>
              ) : distributions.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{d.recipient?.first_name} {d.recipient?.last_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{d.recipient?.rsbsa_number}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 capitalize">{d.item_type.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{d.quantity_given}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(d.date_distributed)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{d.distributed_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 hidden print:block mt-12">
          <div className="flex justify-between">
            <div className="text-center">
              <div className="w-48 border-b border-slate-900 mb-2"></div>
              <p className="text-sm font-bold">Prepared By</p>
              <p className="text-xs text-slate-500">MAO Staff Officer</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-slate-900 mb-2"></div>
              <p className="text-sm font-bold">Approved By</p>
              <p className="text-xs text-slate-500">Municipal Agriculturist</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          main { padding: 0 !important; }
          aside { display: none !important; }
          header { display: none !important; }
        }
      `}} />
    </div>
  );
}
