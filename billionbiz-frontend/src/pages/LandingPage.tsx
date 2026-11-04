import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPortalUrl } from '../utils/subdomain';
import logoLightBg from '../assets/logo-light-bg.png';
import logoDarkBg from '../assets/logo-dark-bg.png';
import {
  Calendar,
  CreditCard,
  Layers,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Store,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();
  const adminHost = `admin.${rootDomain}`;
  const posHost = `pos.${rootDomain}`;
  const staffHost = `staff.${rootDomain}`;
  const storePattern = `*.${rootDomain}`;

  const loginUrl = getPortalUrl('admin', '/login');
  const registerUrl = getPortalUrl('root', '/register');
  const forgotPasswordUrl = getPortalUrl('admin', '/forgot-password');
  const adminUrl = getPortalUrl('admin', '/dashboard');
  const posUrl = getPortalUrl('pos', '/');
  const staffUrl = getPortalUrl('staff', '/');
  const opsUrl = getPortalUrl('ops', '/');

  const ActionLink = ({
    to,
    style,
    children
  }: {
    to: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
  }) => {
    if (to.startsWith('http')) {
      return (
        <a href={to} style={style}>
          {children}
        </a>
      );
    }
    return (
      <Link to={to} style={style}>
        {children}
      </Link>
    );
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 1. TOPBAR NAVIGATION */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.85rem 1.5rem'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <img 
              src={logoLightBg} 
              alt="BillionBiz" 
              style={{ height: '38px', width: 'auto', objectFit: 'contain' }} 
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <a href="#features" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '0.95rem' }}>
              Features
            </a>
            <a href="#solutions" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '0.95rem' }}>
              Solutions
            </a>
            <a href="#pos" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '0.95rem' }}>
              POS & Counters
            </a>
            <a href="#plans" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '0.95rem' }}>
              Plans & Pricing
            </a>
            <a href="#faq" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '0.95rem' }}>
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ActionLink
              to={loginUrl}
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#064652',
                textDecoration: 'none',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                transition: 'all 0.15s ease'
              }}
            >
              Log in
            </ActionLink>
            <ActionLink
              to={registerUrl}
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '6px',
                backgroundColor: '#064652',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(6, 70, 82, 0.25)'
              }}
            >
              Start free <ArrowRight size={16} />
            </ActionLink>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)',
          padding: '4.5rem 1.5rem 5rem 1.5rem',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div style={{ maxWidth: '1080px', margin: '0 auto', textAlign: 'center' }}>
          {/* Eyebrow Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#e6fffa',
              color: '#064652',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid #b2f5ea',
              marginBottom: '1.5rem'
            }}
          >
            <Sparkles size={16} color="#447515" />
            <span>The Unified Business Engine at {rootDomain}</span>
          </div>

          <h1
            style={{
              fontSize: '3.25rem',
              lineHeight: 1.15,
              fontWeight: 900,
              color: '#064652',
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem'
            }}
          >
            Sell Products. Book Services. <br />
            <span style={{ color: '#447515' }}>Bill at the Counter.</span> All in One Place.
          </h1>

          <p
            style={{
              fontSize: '1.2rem',
              lineHeight: 1.6,
              color: '#475569',
              maxWidth: '780px',
              margin: '0 auto 2.25rem auto'
            }}
          >
            BillionBiz eliminates fragile plugin stacks by combining an elegant Online Store, high-speed Cashier POS, real-time Appointment Scheduling, and Multi-Location Inventory into a single, cohesive operating system.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <ActionLink
              to={registerUrl}
              style={{
                backgroundColor: '#064652',
                color: '#ffffff',
                padding: '0.85rem 2rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                textDecoration: 'none',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(6, 70, 82, 0.3)'
              }}
            >
              Get started free <ArrowRight size={18} />
            </ActionLink>
            <a
              href="#plans"
              style={{
                backgroundColor: '#ffffff',
                color: '#334155',
                padding: '0.85rem 1.75rem',
                fontSize: '1.05rem',
                fontWeight: 600,
                textDecoration: 'none',
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
              }}
            >
              View pricing plans
            </a>
          </div>

          {/* Social Proof Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#447515" /> No credit card required
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#447515" /> 100% Native (No SiteStore)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#447515" /> Real-time sync & offline POS
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#447515" /> Free subdomain ({storePattern})
            </span>
          </div>
        </div>

        {/* Live System Preview Card */}
        <div style={{ maxWidth: '1080px', margin: '3.5rem auto 0 auto', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {/* Mock Window Topbar */}
          <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
              {adminHost}/dashboard
            </span>
          </div>

          <div style={{ padding: '2rem', backgroundColor: '#fcfdfd' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>GROSS SALES (LIVE)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064652', marginTop: '0.25rem' }}>₹48,920</div>
                <span style={{ fontSize: '0.75rem', color: '#447515', fontWeight: 600 }}>↑ +18.4% today</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>COUNTER TRANSACTIONS</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064652', marginTop: '0.25rem' }}>48 Orders</div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across 2 active registers</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>APPOINTMENTS BOOKED</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064652', marginTop: '0.25rem' }}>14 Slots</div>
                <span style={{ fontSize: '0.75rem', color: '#447515', fontWeight: 600 }}>0 Overlap Conflicts</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>REAL-TIME STATUS</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#447515', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#447515' }}></span> Connected
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>WebSocket latency: 18ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE ARCHITECTURAL PILLARS (Section 14 & 16) */}
      <section id="features" style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ color: '#447515', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Built for Scale & Reliability
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#064652', marginTop: '0.5rem' }}>
            One Operating System. Four Specialized Portals.
          </h2>
          <p style={{ color: '#64748b', maxWidth: '650px', margin: '0.75rem auto 0 auto', fontSize: '1.05rem' }}>
            Say goodbye to clunky, unintegrated plugins. BillionBiz provides role-tailored workspaces built on an authoritative PostgreSQL foundation.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
          {/* Card 1 */}
          <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', marginBottom: '1.25rem' }}>
              <Store size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#064652', marginBottom: '0.65rem' }}>Merchant Admin Shell</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Manage your entire catalog, orders, promotions, customer relations, staff roles, and analytics from <code>{adminHost}</code>. Honest zeros on launch with zero mock data.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', marginBottom: '1.25rem' }}>
              <CreditCard size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#064652', marginBottom: '0.65rem' }}>Dedicated Cashier POS</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Fast in-person checkout at <code>{posHost}</code>. Individual cashier PIN authentication, register drawer sessions, opening floats, X/Z reports, and offline reconciliation.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309', marginBottom: '1.25rem' }}>
              <Calendar size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#064652', marginBottom: '0.65rem' }}>Staff & Appointments Portal</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.95rem' }}>
              At <code>{staffHost}</code>, service providers see only their assigned calendar, client intake notes, and shifts. Atomic locking prevents double-booking.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7e22ce', marginBottom: '1.25rem' }}>
              <Layers size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#064652', marginBottom: '0.65rem' }}>Native Storefront & Editor</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Completely free of SiteStore. Features custom page trees, section builders, immutable release snapshots, and atomic whole-store publishing to <code>{storePattern}</code>.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PRICING PLANS SECTION */}
      <section id="plans" style={{ backgroundColor: '#f8fafc', padding: '5.5rem 1.5rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: '#447515', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Simple, Transparent Pricing
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#064652', marginTop: '0.5rem' }}>
              Choose the Plan That Fits Your Ambition
            </h2>
            <p style={{ color: '#64748b', maxWidth: '580px', margin: '0.75rem auto 1.5rem auto' }}>
              Every plan includes our secure multi-tenant cloud, real-time WebSocket sync, and automated transactional email dispatch.
            </p>

            {/* Monthly / Annual Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#e2e8f0', borderRadius: '9999px', padding: '0.25rem' }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '0.45rem 1.25rem',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: billingCycle === 'monthly' ? '#064652' : 'transparent',
                  color: billingCycle === 'monthly' ? '#ffffff' : '#64748b'
                }}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '0.45rem 1.25rem',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: billingCycle === 'annual' ? '#064652' : 'transparent',
                  color: billingCycle === 'annual' ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                Annual billing <span style={{ backgroundColor: '#447515', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Save 20%</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
            {/* Plan 1: Starter */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064652' }}>Starter</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: '1.5rem' }}>
                Perfect for solo founders, independent stylists, and boutique stores launching their first store.
              </p>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#064652', marginBottom: '1.5rem' }}>
                {billingCycle === 'monthly' ? '₹999' : '₹799'}{' '}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> 1 Online Store on {storePattern}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Up to 50 Products or 5 Service Offerings
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#447515' }}>
                  <CheckCircle2 size={18} color="#447515" /> 1 POS Register Station
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Native Store Editor with 6 preset themes
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Standard Email Notifications
                </li>
              </ul>
              <ActionLink
                to={registerUrl}
                style={{
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                  color: '#064652',
                  border: '2px solid #064652',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Register free store
              </ActionLink>
            </div>

            {/* Plan 2: Growth (Highlighted) */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '2px solid #064652',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 12px 30px -10px rgba(6, 70, 82, 0.2)'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#064652',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.85rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.05em'
                }}
              >
                MOST POPULAR
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064652' }}>Growth</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: '1.5rem' }}>
                For growing omnichannel retailers, salons, and multi-staff service businesses.
              </p>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#064652', marginBottom: '1.5rem' }}>
                {billingCycle === 'monthly' ? '₹2,499' : '₹1,999'}{' '}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Unlimited Products & Unlimited Appointments
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Custom Domain Integration (e.g. yourbrand.com)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Up to 5 Cashier Counters & Staff Calendars
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Offline POS Mode with Idempotency Queues
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Razorpay Payments & Shiprocket Tracking
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Transactional Outbox Email & SMS Alerts
                </li>
              </ul>
              <ActionLink
                to={registerUrl}
                style={{
                  textAlign: 'center',
                  backgroundColor: '#064652',
                  color: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 10px rgba(6, 70, 82, 0.25)'
                }}
              >
                Start 14-day free trial
              </ActionLink>
            </div>

            {/* Plan 3: Enterprise */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064652' }}>Enterprise</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: '1.5rem' }}>
                For multi-location retailers, franchise operations, and high-volume merchant groups.
              </p>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#064652', marginBottom: '1.5rem' }}>
                {billingCycle === 'monthly' ? '₹7,999' : '₹6,499'}{' '}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Multi-Location Warehouses & Store Outlets
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Unlimited Staff Profiles & Cashier Counters
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Dedicated Realtime API & Webhooks
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Custom CSS & Headless Storefront Hooks
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#447515" /> Dedicated Priority Account Manager
                </li>
              </ul>
              <ActionLink
                to={registerUrl}
                style={{
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                  color: '#064652',
                  border: '2px solid #064652',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Scale with Enterprise
              </ActionLink>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" style={{ padding: '5rem 1.5rem', maxWidth: '840px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: '#447515', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Got Questions?
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#064652', marginTop: '0.5rem' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              q: 'Can I sell physical products and take service bookings in the same store?',
              a: 'Yes, absolutely! BillionBiz is natively hybrid. You can enable Product Commerce, Appointments, or Both in your store settings. Your customers can purchase products and schedule service appointments in a unified storefront experience.'
            },
            {
              q: 'Is SiteStore still required to run my storefront?',
              a: 'No. SiteStore has been 100% removed. BillionBiz now runs on its own native Store Editor and template engine. You get complete drag-and-drop page editing, atomic publishing, and release rollbacks directly within BillionBiz.'
            },
            {
              q: 'How does the offline POS work when internet drops?',
              a: `The POS cashier portal at ${posHost} caches your products and register session locally in IndexedDB. Cash sales and transactions queue up with unique idempotency keys and automatically reconcile with the backend as soon as connectivity resumes.`
            },
            {
              q: 'Can I connect my own custom domain?',
              a: `Yes. In addition to your free ${storePattern} subdomain, you can bind custom root domains and subdomains (e.g. store.yourbrand.com) with automated Let’s Encrypt SSL provisioning.`
            },
            {
              q: 'How are cashiers and staff separated from store settings?',
              a: `BillionBiz enforces role-aware portal routing. Cashiers log into ${posHost} and only see their assigned register drawer. Staff log into ${staffHost} to manage their bookings. Full configuration and financial reports remain protected in ${adminHost}.`
            }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => toggleFaq(idx)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064652' }}>{item.q}</span>
                {openFaq === idx ? <ChevronUp size={20} color="#064652" /> : <ChevronDown size={20} color="#64748b" />}
              </div>
              {openFaq === idx && (
                <p style={{ marginTop: '0.85rem', color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section
        style={{
          backgroundColor: '#064652',
          color: '#ffffff',
          padding: '5rem 1.5rem',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.6rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to Build Your BillionBiz Store?
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#99f6e4', marginBottom: '2.25rem', lineHeight: 1.6 }}>
            Join thousands of ambitious business owners operating on the official platform at {rootDomain}. Setup takes under 60 seconds.
          </p>
          <ActionLink
            to={registerUrl}
            style={{
              backgroundColor: '#447515',
              color: '#ffffff',
              padding: '0.95rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(68, 117, 21, 0.4)'
            }}
          >
            Start free now <ArrowRight size={20} />
          </ActionLink>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer style={{ backgroundColor: '#032329', color: '#94a3b8', padding: '3.5rem 1.5rem 2rem 1.5rem', borderTop: '1px solid #0f3d45' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <img 
                src={logoDarkBg} 
                alt="BillionBiz" 
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
              />
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              The unified commerce, appointments, and POS platform for ambitious retail and service brands.
            </p>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.75rem' }}>
              Domain: {rootDomain}
            </span>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Platform Portals</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li><ActionLink to={adminUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Merchant Admin (admin)</ActionLink></li>
              <li><ActionLink to={posUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Cashier POS (pos)</ActionLink></li>
              <li><ActionLink to={staffUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Staff Portal (staff)</ActionLink></li>
              <li><ActionLink to={opsUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Platform Operations (ops)</ActionLink></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Resources</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Platform Architecture</a></li>
              <li><a href="#plans" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing & Plans</a></li>
              <li><a href="#faq" style={{ color: '#94a3b8', textDecoration: 'none' }}>Store Editor Guide</a></li>
              <li><a href="#faq" style={{ color: '#94a3b8', textDecoration: 'none' }}>POS Offline Manual</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Authentication</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li><ActionLink to={loginUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Merchant Sign In</ActionLink></li>
              <li><ActionLink to={registerUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Register New Store</ActionLink></li>
              <li><ActionLink to={forgotPasswordUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Password Recovery</ActionLink></li>
            </ul>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid #134e5a', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem' }}>
          <div>© {new Date().getFullYear()} BillionBiz Platform. All rights reserved. Hosted on {rootDomain}.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ color: '#64748b' }}>Privacy Policy</span>
            <span style={{ color: '#64748b' }}>Terms of Service</span>
            <span style={{ color: '#64748b' }}>Security (MFA / TLS 1.3)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
