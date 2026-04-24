import React from 'react';
import { BUSINESS_TYPES } from '../config/businessConfig';

export default function BusinessSelector({ onSelect, loading }) {
  return (
    <div className="landing">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      <div className="landing-logo">
        <div className="landing-logo-icon">🤖</div>
        <h1>SMB <span>Copilot</span></h1>
      </div>

      <p className="landing-tagline">
        Your Smart AI Copilot for Small Business Operations
      </p>

      <p className="selector-label">Select Your Business Type</p>

      <div className="business-cards-grid">
        {Object.entries(BUSINESS_TYPES).map(([type, config]) => (
          <div
            key={type}
            className="business-card"
            onClick={() => !loading && onSelect(type)}
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <div className="business-card-emoji">{config.emoji}</div>
            <div className="business-card-name">{config.label}</div>
            <div className="business-card-subtitle">{config.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
