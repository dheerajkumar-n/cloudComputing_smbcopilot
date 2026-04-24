import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';

function TypingIndicator() {
  return (
    <div className="chat-message">
      <div className="chat-avatar ai">🤖</div>
      <div className="chat-typing">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

function ActionCard({ result }) {
  if (!result || result.type === 'general') return null;

  const items = result.lowStock || result.orders || result.staff || result.shifts || result.suppliers || [];
  if (items.length === 0) return null;

  const typeLabels = {
    inventory_status: '📦 Low Stock Items',
    reorder_result: '✅ Reorder Requests Created',
    staff_list: '👥 Team Members',
    schedule: '📅 Upcoming Shifts',
    supplier_list: '🚚 Suppliers',
    analytics: '📊 Quick Stats'
  };

  if (result.type === 'analytics' && result.stats) {
    const s = result.stats;
    return (
      <div className="chat-action-card">
        <div className="chat-action-card-title">{typeLabels[result.type] || 'Result'}</div>
        <div className="chat-action-item">📦 {s.totalItems} inventory items ({s.lowCount} low)</div>
        <div className="chat-action-item">👥 {s.totalStaff} active staff</div>
        <div className="chat-action-item">🔄 {s.pendingOrders} pending orders</div>
      </div>
    );
  }

  return (
    <div className="chat-action-card">
      <div className="chat-action-card-title">{typeLabels[result.type] || 'Result'}</div>
      {items.slice(0, 4).map((item, i) => (
        <div key={i} className="chat-action-item">
          • {item.name || item.itemName || item.employeeName || item.customerName || 'Item'}
          {item.quantity !== undefined && ` — ${item.quantity} ${item.unit || ''}`}
          {item.role && ` (${item.role})`}
          {item.status && <span className={`badge badge-${item.status === 'pending' ? 'yellow' : 'green'}`} style={{ marginLeft: 4 }}>{item.status}</span>}
        </div>
      ))}
      {items.length > 4 && <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>+{items.length - 4} more</div>}
    </div>
  );
}

export default function ChatPanel({ businessId, businessType, accentColor, samplePrompts, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: `Hi! I'm your AI copilot for your ${businessType} business. Ask me to check stock, manage orders, view staff, or get analytics. How can I help?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatAPI.send({ message: msg, businessType, businessId });
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: res.result?.message || 'Here\'s what I found.',
        result: res.result
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: 'I couldn\'t reach the server. Make sure the backend is running and try again.',
        }
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="ai-dot" />
          <div>
            <div className="chat-header-title">AI Copilot</div>
            <div className="chat-header-sub">Powered by intent AI</div>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className={`chat-avatar ${msg.role}`}>{msg.role === 'ai' ? '🤖' : '👤'}</div>
            <div>
              <div className={`chat-bubble ${msg.role}`}>{msg.text}</div>
              {msg.role === 'ai' && msg.result && <ActionCard result={msg.result} />}
            </div>
          </div>
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && (
        <div className="chat-suggestions">
          {samplePrompts.map((prompt, i) => (
            <button key={i} className="chat-suggestion-chip" onClick={() => send(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Ask anything about your business..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          style={{ maxHeight: 80 }}
        />
        <button
          className="chat-send-btn"
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{ background: input.trim() && !loading ? accentColor : undefined }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
