import React, { useState } from 'react';
import {
  COMMODITY_GRADES,
  COMMODITY_OPTIONS,
  COUNTRY_OPTIONS,
  SAMPLE_WEIGHT_OPTIONS,
} from '../constants/spices';

const WEIGHT_GRAMS_MAP = {
  '250 gram (Micro-Sample Kit)': 250,
  '500 gram (Standard Evaluation Kit)': 500,
  '1000 gram (1 kg Comparative Box)': 1000,
  '2000 gram (2 kg Pilot Lot)': 2000,
};

/**
 * SampleForm Component (Controlled Component)
 * Submits validated sample request payloads directly to the NestJS backend API.
 * @param {{ onAddSample: Function, onCancel: Function }} props
 */
export default function SampleForm({ onAddSample, onCancel }) {
  const initialCommodity = COMMODITY_OPTIONS[0];
  const initialGrade = COMMODITY_GRADES[initialCommodity][0];

  const [formData, setFormData] = useState({
    buyerName: '',
    companyName: '',
    email: '',
    trackingAwb: '',
    country: '',
    shippingAddress: '',
    commodity: initialCommodity,
    grade: initialGrade,
    sampleWeight: SAMPLE_WEIGHT_OPTIONS[1],
    requiresCoa: true,
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleCommodityChange = (e) => {
    const selectedCommodity = e.target.value;
    const availableGrades = COMMODITY_GRADES[selectedCommodity] || [];
    const firstGrade = availableGrades[0] || '';

    setFormData((prev) => ({
      ...prev,
      commodity: selectedCommodity,
      grade: firstGrade,
    }));

    if (errors.commodity || errors.grade) {
      setErrors((prev) => ({
        ...prev,
        commodity: '',
        grade: '',
      }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const newErrors = {};
    if (!formData.buyerName.trim()) {
      newErrors.buyerName = 'Nama PIC / Buyer wajib diisi.';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nama Perusahaan Importir wajib diisi.';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Negara tujuan wajib dipilih.';
    }
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress =
        'Alamat lengkap kurir pengiriman sampel wajib diisi.';
    }
    if (!formData.commodity.trim()) {
      newErrors.commodity = 'Komoditas rempah wajib dipilih.';
    }
    if (!formData.grade.trim()) {
      newErrors.grade = 'Grade kualitas ekspor wajib dipilih.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const weightGrams = WEIGHT_GRAMS_MAP[formData.sampleWeight] || 500;
    const payload = {
      buyerName: formData.buyerName.trim(),
      companyName: formData.companyName.trim(),
      country: formData.country.trim(),
      shippingAddress: formData.shippingAddress.trim(),
      commodity: formData.commodity,
      grade: formData.grade,
      weightGrams,
      sampleWeight: formData.sampleWeight,
      requiresCoa: Boolean(formData.requiresCoa),
      requestDate: new Date().toISOString().split('T')[0],
    };

    if (formData.email.trim()) {
      payload.email = formData.email.trim();
    }
    if (formData.trackingAwb.trim()) {
      payload.trackingAwb = formData.trackingAwb.trim();
    }

    setIsSubmitting(true);
    try {
      await onAddSample(payload);
      setFormData({
        buyerName: '',
        companyName: '',
        email: '',
        trackingAwb: '',
        country: '',
        shippingAddress: '',
        commodity: initialCommodity,
        grade: initialGrade,
        sampleWeight: SAMPLE_WEIGHT_OPTIONS[1],
        requiresCoa: true,
      });
      setErrors({});
    } catch (err) {
      setSubmitError(
        err.message || 'Gagal mengirim permintaan sampel ke server backend.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAvailableGrades = COMMODITY_GRADES[formData.commodity] || [];

  return (
    <div className="dedicated-form-container">
      <div className="dedicated-form-card" aria-labelledby="form-heading">
        <div className="form-card-header">
          <div className="form-card-header__icon">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <div>
            <h2 id="form-heading" className="card-title font-serif">
              Catat Permintaan Sampel Baru
            </h2>
            <p className="card-subtitle">
              Input data pengiriman sampel rempah ke backend NestJS untuk pengiriman via kurir udara (DHL/FedEx Air-Freight).
            </p>
          </div>
        </div>

        {submitError && (
          <div
            className="portal-notification"
            role="alert"
            id="form-api-error"
            style={{
              background: '#fef2f2',
              borderColor: '#fecaca',
              color: '#991b1b',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i className="bi bi-exclamation-octagon-fill fs-5"></i>
              <span>{submitError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: Partner & Buyer Info */}
          <div className="form-section-block">
            <h3 className="form-section-title">
              <i className="bi bi-building-check me-2"></i>
              1. Informasi Mitra Importir &amp; PIC
            </h3>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="buyerName" className="form-label">
                  Nama PIC / Contact Person <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="buyerName"
                  name="buyerName"
                  className={`form-control ${errors.buyerName ? 'is-invalid' : ''}`}
                  placeholder="cth. Elena Rossi"
                  value={formData.buyerName}
                  onChange={handleChange}
                />
                {errors.buyerName && <p className="form-error">{errors.buyerName}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="companyName" className="form-label">
                  Nama Perusahaan Importir <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
                  placeholder="cth. Milano Spezie S.r.l."
                  value={formData.companyName}
                  onChange={handleChange}
                />
                {errors.companyName && <p className="form-error">{errors.companyName}</p>}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Bisnis Importir (Opsional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="cth. e.rossi@milanospezie.it"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="trackingAwb" className="form-label">
                  Nomor Resi / AWB Kurir (Opsional)
                </label>
                <input
                  type="text"
                  id="trackingAwb"
                  name="trackingAwb"
                  className="form-control"
                  placeholder="Kosongkan untuk generate otomatis oleh server"
                  value={formData.trackingAwb}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Commodity & Quality Grade (Dependent Selection) */}
          <div className="form-section-block">
            <h3 className="form-section-title">
              <i className="bi bi-flower1 me-2"></i>
              2. Spesifikasi Mutu &amp; Grade Rempah
            </h3>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="commodity" className="form-label">
                  Komoditas Rempah Utama <span className="req">*</span>
                </label>
                <select
                  id="commodity"
                  name="commodity"
                  className={`form-select ${errors.commodity ? 'is-invalid' : ''}`}
                  value={formData.commodity}
                  onChange={handleCommodityChange}
                >
                  {COMMODITY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.commodity && <p className="form-error">{errors.commodity}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="grade" className="form-label">
                  Grade Kualitas Ekspor (Dependent) <span className="req">*</span>
                </label>
                <select
                  id="grade"
                  name="grade"
                  className={`form-select ${errors.grade ? 'is-invalid' : ''}`}
                  value={formData.grade}
                  onChange={handleChange}
                >
                  {currentAvailableGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.grade && <p className="form-error">{errors.grade}</p>}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="sampleWeight" className="form-label">
                  Ukuran Paket Sampel <span className="req">*</span>
                </label>
                <select
                  id="sampleWeight"
                  name="sampleWeight"
                  className="form-select"
                  value={formData.sampleWeight}
                  onChange={handleChange}
                >
                  {SAMPLE_WEIGHT_OPTIONS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="country" className="form-label">
                  Negara Tujuan Ekspor <span className="req">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  className={`form-select ${errors.country ? 'is-invalid' : ''}`}
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="">-- Pilih Negara Tujuan --</option>
                  {COUNTRY_OPTIONS.map((countryName) => (
                    <option key={countryName} value={countryName}>
                      {countryName}
                    </option>
                  ))}
                </select>
                {errors.country && <p className="form-error">{errors.country}</p>}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.25rem', marginBottom: 0 }}>
              <label
                htmlFor="requiresCoa"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                <input
                  type="checkbox"
                  id="requiresCoa"
                  name="requiresCoa"
                  checked={formData.requiresCoa}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--forest)' }}
                />
                <span>
                  Sertakan Sertifikat Analisis Laboratorium (COA &amp; Uji Aflatoksin)
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Full Courier Shipping Address */}
          <div className="form-section-block">
            <h3 className="form-section-title">
              <i className="bi bi-geo-alt-fill me-2"></i>
              3. Alamat Lengkap Pengiriman Kurir Internasional
            </h3>
            <div className="form-group">
              <label htmlFor="shippingAddress" className="form-label">
                Alamat Kantor / Fasilitas QC Penerima <span className="req">*</span>
              </label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                rows="3"
                className={`form-control ${errors.shippingAddress ? 'is-invalid' : ''}`}
                placeholder="Contoh: Via Torino 88, Suite 4B, 20123 Milano, Italy"
                value={formData.shippingAddress}
                onChange={handleChange}
              ></textarea>
              {errors.shippingAddress && (
                <p className="form-error">{errors.shippingAddress}</p>
              )}
              <p className="form-help-text">
                Wajib mencantumkan nama jalan, gedung/gudang, kode pos, dan kota tujuan minimal 10 karakter untuk pencetakan Airway Bill (AWB).
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-bar">
            <button
              type="button"
              className="btn-secondary-action"
              onClick={onCancel}
              id="btn-cancel-form"
              disabled={isSubmitting}
            >
              <i className="bi bi-arrow-left"></i>
              Batal / Kembali ke Monitoring
            </button>
            <button
              type="submit"
              className="btn-primary-action"
              id="btn-submit-sample"
              disabled={isSubmitting}
            >
              <i className="bi bi-check2-circle"></i>
              {isSubmitting ? 'Menyimpan ke Server...' : 'Catat Permintaan Sampel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
