import React, { useState, useEffect, useCallback } from 'react';
import { T, I } from '../../components/admin/theme';
import { useAuth } from '../../context/AuthContext';
import { getBookings, getClinics } from '../../services/adminApi';
import ScheduleCard from '../../components/admin/appointmentCard';
import ClinicFilterBar from '../../components/admin/ClinicFilterBar';

export default function HistoryPage() {
  const { token } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [stats, setStats] = useState({ total: 0 });

  const fetchBookings = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const lastId = isLoadMore && bookings.length > 0 ? bookings[bookings.length - 1].id : null;
      const res = await getBookings(token, {
        status: 'completed,cancelled,rejected',
        clinicId: selectedClinic || undefined,
        limit: 20,
        lastId
      });

      if (isLoadMore) {
        setBookings(prev => [...prev, ...res.bookings]);
      } else {
        setBookings(res.bookings || []);
        setStats({ total: res.totalCount || 0 });
      }
      setHasMore(res.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token, selectedClinic, bookings.length]);

  useEffect(() => {
    if (!token) return;
    getClinics(token).then(r => setClinics(r.clinics || [])).catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchBookings();
  }, [token, selectedClinic]);

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3 md:px-0 bg-white sticky top-0 z-10 border-b md:border-none" style={{ borderColor: T.mint }}>
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.tealLight, fontFamily: 'Outfit' }}>
          Past Appointments
        </p>
        <div className="flex items-end justify-between mt-0.5 mb-4">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'DM Serif Display, serif', color: T.navy }}>
              History
            </h1>
            <p className="text-[11px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>
              {stats.total} total past appointments
            </p>
          </div>
        </div>

        {/* Clinic filter */}
        {clinics.length > 0 && (
          <div className="mb-1">
            <ClinicFilterBar clinics={clinics} selected={selectedClinic} onChange={setSelectedClinic} />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-4 pb-32 flex flex-col gap-4 md:px-0">
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ height: 80, background: '#f1f5f9' }} />
            ))}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.hero }}>
              <span style={{ color: T.teal }}><I n="history" s={26} /></span>
            </div>
            <p className="text-sm" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>No history found</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bookings.map(appt => (
            <ScheduleCard
              key={appt.id}
              appt={appt}
              clinics={clinics}
              showClinicBadge={!selectedClinic}
              expanded={expandedId === appt.id}
              onToggle={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
            />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => fetchBookings(true)}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
              style={{
                background: T.hero,
                color: T.teal,
                border: `1px solid ${T.mint}`,
                fontFamily: 'Outfit'
              }}>
              {loadingMore ? (
                <div className="w-4 h-4 border-2 border-t-transparent animate-spin rounded-full" style={{ borderColor: T.teal, borderTopColor: 'transparent' }} />
              ) : (
                <>Load More <I n="chevDn" s={14} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
