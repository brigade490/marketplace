'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface VerificationDoc {
  id: string;
  doc_type: 'gst' | 'business';
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  note: string | null;
  uploaded_at: string;
}

const STATUS_CONFIG = {
  approved: { label: 'Verified', bg: '#dcfce7', color: '#166534', icon: '✅' },
  pending:  { label: 'Pending Review', bg: '#fef9c3', color: '#854d0e', icon: '⏳' },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b', icon: '❌' },
};

export default function VerificationPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<'gst' | 'business' | null>(null);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const gstRef = useRef<HTMLInputElement>(null);
  const bizRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('user_id', user.id);

      setDocs((data as VerificationDoc[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleUpload(docType: 'gst' | 'business', file: File) {
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return; }
    setUploading(docType);
    setError('');

    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `verification/${userId}/${docType}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
    if (upErr) {
      setError('Upload failed: ' + upErr.message);
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);

    const { data } = await supabase
      .from('verification_documents')
      .upsert({
        user_id: userId,
        doc_type: docType,
        file_url: publicUrl,
        status: 'pending',
        uploaded_at: new Date().toISOString(),
      }, { onConflict: 'user_id,doc_type' })
      .select('*')
      .single();

    if (data) {
      setDocs(prev => {
        const existing = prev.find(d => d.doc_type === docType);
        if (existing) return prev.map(d => d.doc_type === docType ? data as VerificationDoc : d);
        return [...prev, data as VerificationDoc];
      });
    }

    setUploading(null);
  }

  const gstDoc = docs.find(d => d.doc_type === 'gst');
  const bizDoc = docs.find(d => d.doc_type === 'business');

  const overallStatus = docs.length === 0 ? 'not_submitted'
    : docs.every(d => d.status === 'approved') ? 'approved'
    : docs.some(d => d.status === 'rejected') ? 'rejected'
    : 'pending';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading verification status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-black mb-6">Verification Status</h1>

        {/* Overall status banner */}
        <div
          className="mb-6 p-5 flex items-center gap-4"
          style={{
            borderRadius: '14px',
            background: overallStatus === 'approved' ? '#dcfce7' : overallStatus === 'rejected' ? '#fee2e2' : overallStatus === 'pending' ? '#fef9c3' : 'var(--bg)',
          }}
        >
          <span className="text-3xl">
            {overallStatus === 'approved' ? '✅' : overallStatus === 'rejected' ? '❌' : overallStatus === 'pending' ? '⏳' : '📋'}
          </span>
          <div>
            <h2 className="font-black text-black text-lg">
              {overallStatus === 'approved' ? 'Business Verified' :
               overallStatus === 'rejected' ? 'Verification Rejected' :
               overallStatus === 'pending' ? 'Under Review' :
               'Not Submitted'}
            </h2>
            <p className="text-sm text-gray-600">
              {overallStatus === 'approved' ? 'Your business is verified on Karobarrr. Your profile shows a verified badge.' :
               overallStatus === 'rejected' ? 'One or more documents were rejected. Please re-upload valid documents.' :
               overallStatus === 'pending' ? 'Your documents are being reviewed. This usually takes 1–3 business days.' :
               'Upload your business documents to get verified and build buyer trust.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        {/* Document cards */}
        <div className="space-y-4">
          <DocCard
            title="GST Certificate"
            description="Upload your GST registration certificate (PDF, JPG, or PNG)"
            doc={gstDoc}
            isUploading={uploading === 'gst'}
            onUpload={file => handleUpload('gst', file)}
            inputRef={gstRef}
          />
          <DocCard
            title="Business Proof"
            description="Upload business registration certificate or trade license"
            doc={bizDoc}
            isUploading={uploading === 'business'}
            onUpload={file => handleUpload('business', file)}
            inputRef={bizRef}
          />
        </div>

        <div className="mt-6 p-4 bg-white" style={{ borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 className="font-bold text-black text-sm mb-2">Why get verified?</h3>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li>✓ Verified badge on your profile and products</li>
            <li>✓ Higher trust from buyers — increased conversions</li>
            <li>✓ Priority listing in search results</li>
            <li>✓ Access to premium seller features</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function DocCard({
  title, description, doc, isUploading, onUpload, inputRef,
}: {
  title: string;
  description: string;
  doc: VerificationDoc | undefined;
  isUploading: boolean;
  onUpload: (file: File) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const statusCfg = doc ? STATUS_CONFIG[doc.status] : null;

  return (
    <div className="bg-white" style={{ borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-black">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        {statusCfg && (
          <span
            className="flex-shrink-0 px-3 py-1 text-xs font-bold"
            style={{ borderRadius: 'var(--radius-pill)', background: statusCfg.bg, color: statusCfg.color }}
          >
            {statusCfg.icon} {statusCfg.label}
          </span>
        )}
      </div>

      {doc && (
        <div className="mb-3">
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-black underline"
          >
            View uploaded document →
          </a>
          <p className="text-xs text-gray-400 mt-1">
            Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          {doc.note && <p className="text-xs text-red-600 mt-1">Note: {doc.note}</p>}
        </div>
      )}

      <button
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="px-4 py-2 text-sm font-semibold transition-colors"
        style={{
          border: '1.5px solid #000',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--surface)',
          color: '#000',
          opacity: isUploading ? 0.6 : 1,
        }}
      >
        {isUploading ? 'Uploading...' : doc ? 'Re-upload' : 'Upload Document'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); if (inputRef.current) inputRef.current.value = ''; }}
      />
    </div>
  );
}
