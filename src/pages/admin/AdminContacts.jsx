import { useState, useEffect, useMemo } from 'react';
import { 
  getContacts, updateContactStatus, deleteContact 
} from '../../services/dataService';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { 
  MessageSquare, Mail, Phone, Calendar, 
  Trash2, CheckCircle2, Clock, Search, RefreshCw,
  ExternalLink, UserCheck
} from 'lucide-react';

export const AdminContacts = () => {
  const { success, error } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadContacts = async () => {
    setLoading(true);
    try {
      const list = await getContacts();
      setContacts(list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await updateContactStatus(contactId, newStatus);
      success('Status Updated', `Inquiry marked as ${newStatus.toUpperCase()}`);
      loadContacts();
    } catch (err) {
      error('Failed to update', err.message);
    }
  };

  const handleDelete = async (contactId) => {
    try {
      await deleteContact(contactId);
      success('Message Deleted', 'Contact inquiry removed from inbox.');
      loadContacts();
    } catch (err) {
      error('Delete failed', err.message);
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.message?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contacts, search, statusFilter]);

  const newCount = contacts.filter(c => c.status === 'new').length;
  const repliedCount = contacts.filter(c => c.status === 'replied').length;
  const resolvedCount = contacts.filter(c => c.status === 'resolved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-[#0373b9] dark:text-[#38bdf8]" />
            <span>Customer Contact Inquiries</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time messages dispatched directly from the public Contact Us form.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadContacts}
          >
            Refresh Inbox
          </Button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Inquiries</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{contacts.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">Unread / New</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{newCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-sky-500 uppercase tracking-wider block">Replied</span>
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{repliedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">Resolved</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiry, customer name, phone..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
          />
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'new', 'replied', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                statusFilter === st
                  ? 'bg-[#0373b9] text-white shadow-md shadow-[#0373b9]/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {st === 'new' ? 'New Unread' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Cards Grid */}
      {filteredContacts.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70">
          <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Inquiries Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {search ? 'Try adjusting your search criteria.' : 'When customers submit inquiries via the Contact Us form, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                contact.status === 'new'
                  ? 'bg-[#0373b9]/5 dark:bg-[#0373b9]/15 border-[#0373b9]/30 dark:border-[#0373b9]/50 shadow-md shadow-[#0373b9]/5'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header: Name & Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      {contact.name}
                    </h3>
                    <span className="text-[11px] text-[#0373b9] dark:text-[#38bdf8] font-bold uppercase tracking-wider block">
                      Target: {contact.category || 'General Fleet'}
                    </span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                    contact.status === 'new'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
                      : contact.status === 'replied'
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  }`}>
                    {contact.status}
                  </span>
                </div>

                {/* Message Body */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic my-3">
                  "{contact.message}"
                </div>

                {/* Contact details */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#0373b9] shrink-0" />
                    <a href={`mailto:${contact.email}`} className="hover:underline hover:text-[#0373b9] truncate font-mono text-[11px]">
                      {contact.email}
                    </a>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <a href={`tel:${contact.phone}`} className="hover:underline hover:text-emerald-600 font-mono text-[11px]">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>{new Date(contact.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {contact.status === 'new' && (
                    <button
                      onClick={() => handleStatusChange(contact.id, 'replied')}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 hover:bg-sky-100 text-[11px] font-bold transition-colors"
                    >
                      Mark Replied
                    </button>
                  )}
                  {contact.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusChange(contact.id, 'resolved')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 text-[11px] font-bold transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  {contact.status === 'resolved' && (
                    <button
                      onClick={() => handleStatusChange(contact.id, 'new')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold"
                    >
                      Reopen
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
