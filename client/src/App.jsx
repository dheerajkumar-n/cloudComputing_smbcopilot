import React, { useState, useEffect } from 'react';
import BusinessSelector from './components/BusinessSelector';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatPanel from './components/ChatPanel';
import InventoryModule from './components/modules/InventoryModule';
import StaffModule from './components/modules/StaffModule';
import AppointmentsModule from './components/modules/AppointmentsModule';
import SuppliersModule from './components/modules/SuppliersModule';
import AnalyticsModule from './components/modules/AnalyticsModule';
import { BUSINESS_TYPES } from './config/businessConfig';
import { businessAPI } from './services/api';

export default function App() {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSelectBusiness = async (type) => {
    setLoading(true);
    try {
      const config = BUSINESS_TYPES[type];
      const profile = await businessAPI.createProfile({
        name: config.label,
        businessType: type,
        ownerName: 'Demo Owner'
      });
      setBusinessProfile(profile);
      setSelectedBusiness(type);
      setActiveModule('dashboard');
    } catch (err) {
      const mock = { _id: `mock-${type}`, businessType: type, name: BUSINESS_TYPES[type].label };
      setBusinessProfile(mock);
      setSelectedBusiness(type);
      setActiveModule('dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedBusiness(null);
    setBusinessProfile(null);
    setActiveModule('dashboard');
  };

  const renderModule = () => {
    if (!businessProfile) return null;
    const props = { businessId: businessProfile._id, businessType: selectedBusiness };
    switch (activeModule) {
      case 'dashboard': return <Dashboard {...props} onNavigate={setActiveModule} />;
      case 'appointments': return <AppointmentsModule {...props} />;
      case 'staff': return <StaffModule {...props} />;
      case 'inventory': return <InventoryModule {...props} />;
      case 'suppliers': return <SuppliersModule {...props} />;
      case 'analytics': return <AnalyticsModule {...props} />;
      default: return <Dashboard {...props} onNavigate={setActiveModule} />;
    }
  };

  if (!selectedBusiness) {
    return <BusinessSelector onSelect={handleSelectBusiness} loading={loading} />;
  }

  const bizConfig = BUSINESS_TYPES[selectedBusiness];

  return (
    <div className="app-layout">
      <Sidebar
        modules={bizConfig.modules}
        activeModule={activeModule}
        onNavigate={setActiveModule}
        businessType={selectedBusiness}
        onBack={handleBack}
        accentColor={bizConfig.color}
      />
      <div className="main-area">
        <Header
          business={bizConfig}
          businessProfile={businessProfile}
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen(o => !o)}
        />
        <div className="content-wrapper">
          <div className="module-content">
            {renderModule()}
          </div>
          {chatOpen && (
            <ChatPanel
              businessId={businessProfile._id}
              businessType={selectedBusiness}
              accentColor={bizConfig.color}
              samplePrompts={bizConfig.samplePrompts}
              onClose={() => setChatOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
