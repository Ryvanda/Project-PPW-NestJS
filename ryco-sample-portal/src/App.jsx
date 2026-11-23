import React, { useEffect, useRef, useState } from 'react';
import EmptyState from './components/EmptyState';
import Header from './components/Header';
import SampleDetailModal from './components/SampleDetailModal';
import SampleForm from './components/SampleForm';
import SampleList from './components/SampleList';
import StatsSummary from './components/StatsSummary';
import {
  createSample,
  deleteSample,
  getSamples,
  resetSamples,
  updateSample,
} from './services/samplesApi';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * App Component (Root)
 * Fullstack React portal integrated with NestJS MVC REST API (http://localhost:3000/samples).
 */
export default function App() {
  const [samples, setSamples] = useState([]);
  const [activeTab, setActiveTab] = useState('monitoring');
  const [selectedSample, setSelectedSample] = useState(null);
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const notificationTimerRef = useRef(null);

  const triggerNotification = (message, type = 'success') => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification(message);
    setNotificationType(type);
    notificationTimerRef.current = setTimeout(() => {
      setNotification('');
    }, 4500);
  };

  const loadSamples = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const data = await getSamples();
      setSamples(data);
    } catch (err) {
      setApiError(
        err.message ||
          'Gagal terhubung ke server backend NestJS (http://localhost:3000).',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialSamples() {
      try {
        const data = await getSamples();
        if (!cancelled) {
          setSamples(data);
          setApiError('');
        }
      } catch (err) {
        if (!cancelled) {
          setApiError(
            err.message ||
              'Gagal terhubung ke server backend NestJS (http://localhost:3000).',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchInitialSamples();

    return () => {
      cancelled = true;
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Handler: Create new sample via POST /samples
  const handleAddSample = async (payload) => {
    const created = await createSample(payload);
    setSamples((prev) => [created, ...prev]);
    setActiveTab('monitoring');
    triggerNotification(
      `Permintaan sampel ${created.id} untuk "${created.companyName}" (${created.country}) berhasil dicatat ke server.`,
      'success',
    );
    return created;
  };

  // Handler: Delete sample via DELETE /samples/:id
  const handleDeleteSample = async (id) => {
    const target = samples.find((item) => item.id === id);
    try {
      await deleteSample(id);
      setSamples((prev) => prev.filter((item) => item.id !== id));
      if (selectedSample && selectedSample.id === id) {
        setSelectedSample(null);
      }
      if (target) {
        triggerNotification(
          `Permintaan ${id} (${target.companyName}) berhasil dihapus dari backend.`,
          'success',
        );
      }
    } catch (err) {
      triggerNotification(err.message || 'Gagal menghapus data sampel.', 'error');
    }
  };

  // Handler: Cycle lifecycle status via PATCH /samples/:id
  const handleToggleStatus = async (id) => {
    const target = samples.find((item) => item.id === id);
    if (!target) return;

    let nextStatus = 'Shipped / Dispatched';
    if (target.status === 'Pending Review') nextStatus = 'Shipped / Dispatched';
    else if (target.status === 'Shipped / Dispatched') nextStatus = 'Delivered';
    else nextStatus = 'Pending Review';

    try {
      const updated = await updateSample(id, { status: nextStatus });
      setSamples((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
      if (selectedSample && selectedSample.id === id) {
        setSelectedSample(updated);
      }
      triggerNotification(
        `Status ${updated.id} diperbarui menjadi "${updated.status}".`,
        'success',
      );
    } catch (err) {
      triggerNotification(err.message || 'Gagal memperbarui status sampel.', 'error');
    }
  };

  // Handler: Update status & notes from Detail Dossier Modal via PATCH /samples/:id
  const handleUpdateSampleStatus = async (id, newStatus, newNotes) => {
    try {
      const updated = await updateSample(id, {
        status: newStatus,
        dispatchNotes: newNotes,
      });

      setSamples((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );

      if (selectedSample && selectedSample.id === id) {
        setSelectedSample(updated);
      }

      triggerNotification(
        `Status dossier ${updated.id} berhasil diperbarui menjadi "${updated.status}".`,
        'success',
      );
      return updated;
    } catch (err) {
      triggerNotification(err.message || 'Gagal menyimpan pembaruan dossier.', 'error');
      throw err;
    }
  };

  // Handler: Delete all items on backend (to test empty state)
  const handleClearAll = async () => {
    try {
      await Promise.all(samples.map((item) => deleteSample(item.id)));
      setSamples([]);
      setSelectedSample(null);
      triggerNotification(
        'Semua antrean sampel telah dikosongkan pada server untuk pengujian.',
        'success',
      );
    } catch (err) {
      triggerNotification(err.message || 'Gagal mengosongkan antrean.', 'error');
    }
  };

  // Handler: Restore initial seed data via POST /samples/reset
  const handleResetInitial = async () => {
    try {
      const restored = await resetSamples();
      setSamples(restored);
      setSelectedSample(null);
      setApiError('');
      triggerNotification(
        'Data sampel awal B2B berhasil dipulihkan dari backend NestJS.',
        'success',
      );
    } catch (err) {
      triggerNotification(err.message || 'Gagal memulihkan data awal.', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* 1. Header Component */}
      <Header />

      {/* 2. Top Navigation Tabs Bar */}
      <nav className="portal-tabs-nav" aria-label="Portal Navigation Tabs">
        <div className="portal-tabs-container">
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === 'monitoring' ? 'tab-nav-btn--active' : ''}`}
            onClick={() => setActiveTab('monitoring')}
            id="tab-btn-monitoring"
          >
            <i className="bi bi-bar-chart-steps"></i>
            <span>Monitoring &amp; Pelacakan Sampel</span>
            <span className="tab-counter-badge">{samples.length}</span>
          </button>

          <button
            type="button"
            className={`tab-nav-btn ${activeTab === 'form' ? 'tab-nav-btn--active' : ''}`}
            onClick={() => setActiveTab('form')}
            id="tab-btn-form"
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Catat Permintaan Sampel Baru</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Dynamic Notification Toast */}
        {notification && (
          <div
            className="portal-notification"
            role="alert"
            style={
              notificationType === 'error'
                ? {
                    background: '#fef2f2',
                    borderColor: '#fecaca',
                    color: '#991b1b',
                  }
                : undefined
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i
                className={`bi ${
                  notificationType === 'error'
                    ? 'bi-exclamation-triangle-fill'
                    : 'bi-check-circle-fill'
                } fs-5`}
              ></i>
              <span>{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                fontSize: '1rem',
              }}
              aria-label="Tutup notifikasi"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* API Connection Error Banner */}
        {apiError && (
          <div
            className="portal-notification"
            role="alert"
            style={{
              background: '#fef2f2',
              borderColor: '#fecaca',
              color: '#991b1b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i className="bi bi-wifi-off fs-5"></i>
              <span>
                <strong>Koneksi Backend Gagal:</strong> {apiError}
              </span>
            </div>
            <button
              type="button"
              className="btn-action-status"
              onClick={loadSamples}
              id="btn-retry-api"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Muat Ulang dari API
            </button>
          </div>
        )}

        {/* View 1: Monitoring & Tracking Dashboard */}
        {activeTab === 'monitoring' && (
          <div className="tab-view-monitoring">
            {/* Dynamic Metric Statistics */}
            <StatsSummary samples={samples} />

            {/* Test Helper Bar */}
            <div className="monitoring-test-bar">
              <span className="text-muted small">
                <i className="bi bi-hdd-network me-1"></i>
                {isLoading
                  ? 'Memuat data sampel dari NestJS API...'
                  : `Total ${samples.length} permintaan sampel tersinkronisasi dengan NestJS API.`}
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {samples.length > 0 && (
                  <button
                    type="button"
                    className="btn-action-delete"
                    onClick={handleClearAll}
                    id="btn-clear-all"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                  >
                    <i className="bi bi-trash3 me-1"></i> Kosongkan Antrean (Uji Empty State)
                  </button>
                )}
                {samples.length === 0 && !isLoading && (
                  <button
                    type="button"
                    className="btn-action-status"
                    onClick={handleResetInitial}
                    id="btn-quick-reset"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i> Pulihkan Data Awal
                  </button>
                )}
              </div>
            </div>

            {/* Loading Indicator vs Empty State vs Full Width Grid */}
            {isLoading ? (
              <div className="empty-state-modern-card" role="status">
                <div className="empty-state__icon-wrap">
                  <i className="bi bi-arrow-repeat"></i>
                </div>
                <h3 className="empty-state__title font-serif">
                  Menghubungkan ke Backend NestJS...
                </h3>
                <p className="empty-state__desc">
                  Sedang mengambil daftar permintaan sampel ekspor dari server API{' '}
                  <code>http://localhost:3000/samples</code>.
                </p>
              </div>
            ) : samples.length === 0 ? (
              <EmptyState
                onSwitchTab={setActiveTab}
                onResetData={handleResetInitial}
              />
            ) : (
              <SampleList
                samples={samples}
                onDelete={handleDeleteSample}
                onToggleStatus={handleToggleStatus}
                onSelectSample={setSelectedSample}
              />
            )}
          </div>
        )}

        {/* View 2: Dedicated Form View */}
        {activeTab === 'form' && (
          <div className="tab-view-form">
            <SampleForm
              onAddSample={handleAddSample}
              onCancel={() => setActiveTab('monitoring')}
            />
          </div>
        )}
      </main>

      {/* Interactive Detail Dossier Modal */}
      {selectedSample && (
        <SampleDetailModal
          key={`${selectedSample.id}-${selectedSample.status}`}
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
          onUpdateStatus={handleUpdateSampleStatus}
        />
      )}

      {/* Footer */}
      <footer className="portal-footer">
        <p>
          &copy; {CURRENT_YEAR}{' '}
          <strong>Ryco Spices International Trade Desk</strong> · B2B Sample
          Tracking &amp; Monitoring System (Bab 9: Fullstack React + NestJS MVC)
        </p>
      </footer>
    </div>
  );
}
