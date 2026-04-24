import React from 'react';

export default function Header({ business, businessProfile, chatOpen, onToggleChat }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="header">
      <div className="header-left">
        <span className="header-emoji">{business.emoji}</span>
        <div>
          <div className="header-title">{businessProfile?.name || business.label}</div>
          <div className="header-subtitle">{business.label}</div>
        </div>
      </div>
      <div className="header-right">
        <span className="header-date">{dateStr}</span>
        <button
          className={`chat-toggle-btn ${chatOpen ? 'active' : ''}`}
          onClick={onToggleChat}
        >
          🤖 {chatOpen ? 'Hide AI' : 'AI Copilot'}
        </button>
      </div>
    </div>
  );
}
