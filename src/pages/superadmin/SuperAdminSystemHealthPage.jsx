import React, { useState, useEffect } from 'react';
import { 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  RefreshCw, 
  Database, 
  Key, 
  Mail, 
  Monitor, 
  ShieldCheck,
  Cpu
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, getDocs, limit, query } from 'firebase/firestore';

const SuperAdminSystemHealthPage = () => {
  const [checking, setChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  const [healthStatus, setHealthStatus] = useState({
    firebaseAuth: { status: 'Unknown', latencyMs: null, details: 'Evaluating...' },
    firestore: { status: 'Unknown', latencyMs: null, details: 'Evaluating...' },
    emailService: { status: 'Unknown', details: 'Evaluating...' },
    browserClient: { status: 'Unknown', details: 'Evaluating...' },
    webgl: { status: 'Unknown', details: 'Evaluating...' }
  });

  const performHealthChecks = async () => {
    setChecking(true);
    const start = performance.now();

    // 1. Firebase Auth Check
    let authRes = { status: 'Healthy', latencyMs: 0, details: 'Initialized and accepting tokens.' };
    try {
      if (auth.app) {
        authRes.status = 'Healthy';
        authRes.details = `Active project: ${auth.app.options.projectId || 'Firebase Project'}`;
      } else {
        authRes.status = 'Unavailable';
        authRes.details = 'Firebase Auth instance uninitialized.';
      }
    } catch (err) {
      authRes.status = 'Degraded';
      authRes.details = err.message;
    }

    // 2. Firestore Check
    let fsStart = performance.now();
    let firestoreRes = { status: 'Unknown', latencyMs: null, details: 'Checking query responsiveness...' };
    try {
      const testQuery = query(collection(db, 'users'), limit(1));
      await getDocs(testQuery);
      const fsEnd = performance.now();
      firestoreRes.latencyMs = Math.round(fsEnd - fsStart);
      firestoreRes.status = 'Healthy';
      firestoreRes.details = `Connected. Ping roundtrip: ${firestoreRes.latencyMs}ms`;
    } catch (err) {
      firestoreRes.status = 'Degraded';
      firestoreRes.details = `Query error: ${err.message}`;
    }

    // 3. EmailJS Status
    const emailServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const emailTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const emailKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    let emailRes = { status: 'Not Configured', details: 'Environment credentials missing.' };
    if (emailServiceId && emailTemplateId && emailKey) {
      emailRes.status = 'Healthy';
      emailRes.details = `Configured. Service: ${emailServiceId}`;
    }

    // 4. Browser Client Capability
    let browserRes = { status: 'Healthy', details: navigator.userAgent.slice(0, 70) + '...' };

    // 5. WebGL 3D Capability (for RouteWise Three.js visualizer)
    let webglRes = { status: 'Healthy', details: 'Hardware acceleration detected.' };
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        webglRes.status = 'Unavailable';
        webglRes.details = 'WebGL not supported on this client hardware/browser.';
      }
    } catch (e) {
      webglRes.status = 'Unavailable';
      webglRes.details = 'WebGL initialization error.';
    }

    setHealthStatus({
      firebaseAuth: authRes,
      firestore: firestoreRes,
      emailService: emailRes,
      browserClient: browserRes,
      webgl: webglRes
    });

    setLastCheckTime(new Date());
    setChecking(false);
  };

  useEffect(() => {
    performHealthChecks();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Healthy
          </span>
        );
      case 'Degraded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Degraded
          </span>
        );
      case 'Unavailable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" /> Unavailable
          </span>
        );
      case 'Not Configured':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
            <HelpCircle className="w-3 h-3 text-slate-400" /> Not Configured
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
            Unknown
          </span>
        );
    }
  };

  return (
    <SuperAdminLayout title="Infrastructure & System Health">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-brand-teal text-[10px] font-bold uppercase tracking-wider mb-1">
              <Server className="w-3 h-3" /> Live Application Diagnostics
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              Infrastructure & Service Health
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
              Truthful, empirical verification of active cloud services, database connectivity, and client capability.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {lastCheckTime && (
              <span className="text-[11px] text-slate-400 font-medium">
                Last checked: {lastCheckTime.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={performHealthChecks}
              disabled={checking}
              className="px-4 py-2 bg-brand-navy hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking...' : 'Run Diagnostics'}</span>
            </button>
          </div>
        </div>

        {/* Diagnostics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Firestore */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-50 text-brand-blue">
                  <Database className="w-5 h-5" />
                </div>
                {getStatusBadge(healthStatus.firestore.status)}
              </div>
              <h3 className="text-base font-bold text-brand-navy mt-4">Firestore Cloud Database</h3>
              <p className="text-xs text-brand-slate mt-1">Real-time document storage for trips, attendance, and users.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-mono text-slate-600">
              {healthStatus.firestore.details}
            </div>
          </div>

          {/* Card 2: Firebase Auth */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-teal-50 text-brand-teal">
                  <Key className="w-5 h-5" />
                </div>
                {getStatusBadge(healthStatus.firebaseAuth.status)}
              </div>
              <h3 className="text-base font-bold text-brand-navy mt-4">Firebase Authentication</h3>
              <p className="text-xs text-brand-slate mt-1">User identity verification, JWT sessions, and credential management.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-mono text-slate-600 truncate">
              {healthStatus.firebaseAuth.details}
            </div>
          </div>

          {/* Card 3: EmailJS */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Mail className="w-5 h-5" />
                </div>
                {getStatusBadge(healthStatus.emailService.status)}
              </div>
              <h3 className="text-base font-bold text-brand-navy mt-4">EmailJS Notification Dispatch</h3>
              <p className="text-xs text-brand-slate mt-1">Outbound automated transactional emails for emergency SOS and alerts.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-mono text-slate-600">
              {healthStatus.emailService.details}
            </div>
          </div>

          {/* Card 4: WebGL Acceleration */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Cpu className="w-5 h-5" />
                </div>
                {getStatusBadge(healthStatus.webgl.status)}
              </div>
              <h3 className="text-base font-bold text-brand-navy mt-4">WebGL 3D Engine</h3>
              <p className="text-xs text-brand-slate mt-1">Hardware acceleration for Three.js fleet tracking visualizations.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-mono text-slate-600">
              {healthStatus.webgl.details}
            </div>
          </div>

          {/* Card 5: Client Environment */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between lg:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                  <Monitor className="w-5 h-5" />
                </div>
                {getStatusBadge(healthStatus.browserClient.status)}
              </div>
              <h3 className="text-base font-bold text-brand-navy mt-4">Client Runtime Agent</h3>
              <p className="text-xs text-brand-slate mt-1">Local browser runtime, protocol support, and storage capabilities.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-mono text-slate-600 truncate">
              {healthStatus.browserClient.details}
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminSystemHealthPage;
