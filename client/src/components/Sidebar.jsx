import React from 'react';
import { BUSINESS_TYPES } from '../config/businessConfig';

export default function Sidebar({ modules, activeModule, onNavigate, businessType, onBack, accentColor }) {
  const bizConfig = BUSINESS_TYPES[businessType];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <div className="sidebar-logo-icon">🤖</div>
          <span className="sidebar-logo-text">SMB Copilot</span>
        </div>
      </div>

      <div className="sidebar-business">
        <div className="sidebar-business-badge">
          <span className="sidebar-business-emoji">{bizConfig.emoji}</span>
          <div className="sidebar-business-info">
            <div className="sidebar-business-name">{bizConfig.label}</div>
            <div className="sidebar-business-type">Active Business</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {modules.map(mod => (
          <button
            key={mod.id}
            className={`sidebar-nav-item ${activeModule === mod.id ? 'active' : ''}`}
            onClick={() => onNavigate(mod.id)}
            style={activeModule === mod.id ? { borderLeft: `3px solid ${accentColor}` } : {}}
          >
            <span className="nav-icon">{mod.icon}</span>
            <span className="nav-label">{mod.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="back-btn" onClick={onBack}>
          ← Switch Business
        </button>
      </div>
    </div>
  );
}
