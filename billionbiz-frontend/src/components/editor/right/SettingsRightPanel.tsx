import React from 'react';
import { ChevronRight, ShieldCheck, FileText, Globe, Key } from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import styles from '../../../pages/editor/EditorLayout.module.css';

export const SettingsRightPanel: React.FC = () => {
  const { settingsSection, closeRightSidebar } = useLandingEditorStore();

  const section = settingsSection || 'launch-checklist';

  return (
    <aside className={styles.rightPanel}>
      <div className={styles.panelHeader} style={{ padding: '14px 18px' }}>
        <div className={styles.phLeft} style={{ gap: '8px' }}>
          <button className={styles.iconBtn} onClick={closeRightSidebar} title="Close Panel">
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, fontSize: '15px' }}>
            Settings Guidance
          </h3>
        </div>
      </div>

      <div className={styles.propContent} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {(section === 'launch-checklist' || section === 'setup') && (
          <>
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0284c7', fontWeight: 600, fontSize: '13px' }}>
                <ShieldCheck size={16} />
                <span>Launch Readiness Check</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Before going public, ensure at least one payment gateway is tested and your return policy is clearly stated.
              </p>
            </div>
          </>
        )}

        {(section === 'refund-policy' || section === 'privacy-policy' || section === 'terms-of-service' || section === 'shipping-policy') && (
          <>
            <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#16a34a', fontWeight: 600, fontSize: '13px' }}>
                <FileText size={16} />
                <span>Legal Compliance Notice</span>
              </div>
              <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                Clear customer policies reduce checkout friction, lower dispute chargebacks, and are required by payment processors like Stripe and PayPal.
              </p>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#ffffff' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                Policy Checklist:
              </div>
              <ul style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, margin: 0, paddingLeft: '16px' }}>
                <li>Specify refund eligibility window</li>
                <li>Clarify return shipping costs responsibility</li>
                <li>State expected refund timeframe</li>
              </ul>
            </div>
          </>
        )}

        {(section === 'language-region' || section === 'language') && (
          <>
            <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1d4ed8', fontWeight: 600, fontSize: '13px' }}>
                <Globe size={16} />
                <span>Currency &amp; Formatting</span>
              </div>
              <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                Currency settings automatically format prices across your catalogue, cart totals, invoices, and checkout screens.
              </p>
            </div>
          </>
        )}

        {(section === 'integrations' || section === 'api-webhooks' || section === 'custom-code') && (
          <>
            <div style={{ padding: '14px', background: '#f5f3ff', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#6d28d9', fontWeight: 600, fontSize: '13px' }}>
                <Key size={16} />
                <span>Developer Security Best Practice</span>
              </div>
              <p style={{ fontSize: '12px', color: '#4c1d95', lineHeight: 1.5, margin: 0 }}>
                Keep your secret API keys confidential. Webhook endpoints must respond with HTTP 200 within 5 seconds of event receipt.
              </p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
