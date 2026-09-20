import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  X, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
  Laptop
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeadNotificationBell({
  unreadCount = 0,
  recentLeads = [],
  soundEnabled = true,
  onToggleSound = () => {},
  onTestAlert = () => {},
  onSelectLead = () => {},
  onClearAll = () => {},
  onOpen = () => {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [desktopPerm, setDesktopPerm] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const dropdownRef = useRef(null);

  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Close dropdown on outside click / touch
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleRequestPermission = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (typeof window === 'undefined') return;

    // If Notification API is not exposed (e.g. mobile browser on local HTTP network)
    if (!('Notification' in window)) {
      if ('vibrate' in navigator) {
        try { navigator.vibrate([200, 100, 200]); } catch (err) {}
      }
      setDesktopPerm('active');
      toast.success(
        isMobile 
          ? 'Mobile lead pop-up cards, audio chimes & vibration alerts are active!' 
          : 'Lead pop-up cards and audio chime alerts are active!',
        { id: 'notif-perm-toast' }
      );
      return;
    }

    if (Notification.permission === 'denied') {
      toast(
        'Browser push alerts were previously blocked. In-app popups & sound chimes will continue alerting you live!',
        { icon: '🔔', id: 'notif-perm-toast', duration: 4500 }
      );
      setDesktopPerm('active');
      return;
    }

    try {
      let perm = null;
      const promiseOrVoid = Notification.requestPermission((p) => {
        perm = p;
        setDesktopPerm(p);
      });

      if (promiseOrVoid && typeof promiseOrVoid.then === 'function') {
        perm = await promiseOrVoid;
        setDesktopPerm(perm);
      }

      if (perm === 'granted') {
        toast.success(
          isMobile 
            ? 'Mobile notifications & alerts enabled!' 
            : 'Desktop notifications enabled!',
          { id: 'notif-perm-toast' }
        );

        if ('vibrate' in navigator) {
          try { navigator.vibrate([200, 100, 200]); } catch (err) {}
        }
      } else {
        setDesktopPerm('active');
        toast.success('Live lead pop-up alerts and sound chimes are active!', { id: 'notif-perm-toast' });
      }
    } catch (err) {
      setDesktopPerm('active');
      toast.success('Live lead pop-up alerts and sound chimes are active!', { id: 'notif-perm-toast' });
    }
  };

  const handleToggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      onOpen();
    }
  };

  return (
    <div className="lead-notification-bell-wrapper" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        className={`lead-bell-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={handleToggleOpen}
        title="Live Lead Notifications & Sound Controls"
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="lead-bell-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="lead-notification-dropdown" role="dialog" aria-label="Notifications panel">
          {/* Header */}
          <div className="lead-dropdown-header">
            <div>
              <div className="lead-dropdown-title">Lead Notifications</div>
              <div className="lead-dropdown-subtitle">
                {unreadCount > 0 ? `${unreadCount} new pending client leads` : 'All leads reviewed'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={onToggleSound}
                className={`lead-sound-toggle-btn ${soundEnabled ? 'active' : 'muted'}`}
                title={soundEnabled ? 'Mute alert chime' : 'Unmute alert chime'}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="lead-dropdown-close-btn"
                aria-label="Close notifications menu"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Quick Controls Bar */}
          <div className="lead-dropdown-controls">
            <button
              type="button"
              onClick={() => {
                onTestAlert();
              }}
              className="btn-test-alert"
              title="Trigger a preview pop-up notification with chime and mobile push"
            >
              <Zap size={13} />
              <span>Test Pop-up</span>
            </button>

            {(desktopPerm === 'granted' || desktopPerm === 'active') ? (
              <div 
                className="lead-perm-active-pill"
                title="System notifications are active on this device"
              >
                <CheckCircle2 size={13} color="#16a34a" />
                <span>{isMobile ? 'Mobile Alerts Active' : 'Desktop Alerts Active'}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="btn-enable-desktop"
                title={isMobile ? 'Receive alerts in mobile notification panel & lockscreen' : 'Receive alerts on desktop screen'}
              >
                {isMobile ? <Smartphone size={13} /> : <Laptop size={13} />}
                <span>{isMobile ? 'Enable Mobile Alerts' : 'Enable Desktop Alerts'}</span>
              </button>
            )}

            {recentLeads.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="btn-clear-leads"
              >
                Clear
              </button>
            )}
          </div>

          {/* Recent Leads Feed */}
          <div className="lead-dropdown-feed">
            {recentLeads.length === 0 ? (
              <div className="lead-dropdown-empty">
                <Bell size={28} className="empty-icon" />
                <p>No new notifications at the moment.</p>
                <span>New inquiries and site visit bookings will pop up here live!</span>
              </div>
            ) : (
              recentLeads.slice(0, 8).map((lead) => {
                const isEnquiry = lead.type === 'enquiry';
                return (
                  <div
                    key={lead._id || lead.id}
                    className={`lead-feed-item ${lead.isNew ? 'is-unread' : ''}`}
                    onClick={() => {
                      onSelectLead(lead);
                      setIsOpen(false);
                    }}
                  >
                    <div className={`lead-feed-icon ${isEnquiry ? 'enquiry' : 'appointment'}`}>
                      {isEnquiry ? <MessageSquare size={14} /> : <Calendar size={14} />}
                    </div>

                    <div className="lead-feed-content">
                      <div className="lead-feed-line-top">
                        <span className="lead-feed-name">{lead.clientName || 'Buyer'}</span>
                        <span className="lead-feed-badge">
                          {isEnquiry ? 'Enquiry' : 'Site Visit'}
                        </span>
                      </div>
                      <div className="lead-feed-prop">
                        {lead.propertyTitle || 'General Property Inquiry'}
                      </div>
                      <div className="lead-feed-sub">
                        {isEnquiry 
                          ? (lead.message ? lead.message.slice(0, 48) + '...' : lead.phone) 
                          : `📅 ${lead.preferredDate || 'Date set'} · ⏰ ${lead.preferredTime || 'Slot'}`}
                      </div>
                    </div>

                    <ArrowRight size={14} className="lead-feed-arrow" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
