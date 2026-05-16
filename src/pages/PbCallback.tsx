import { useEffect } from 'react';
import { pb } from '@/lib/pocketbase';

export default function PbCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const savedState = localStorage.getItem('pb_google_state');
    const codeVerifier = localStorage.getItem('pb_google_verifier');

    if (!code || !codeVerifier || state !== savedState) {
      window.location.href = '/';
      return;
    }

    const redirectUrl = window.location.origin + '/pb-callback';

    pb.collection('users').authWithOAuth2Code(
      'google', code, codeVerifier, redirectUrl,
      { emailVisibility: false }
    ).then(() => {
      localStorage.removeItem('pb_google_verifier');
      localStorage.removeItem('pb_google_state');
      window.location.href = '/';
    }).catch((e) => {
      console.error('OAuth error:', e);
      window.location.href = '/';
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <p className="text-white text-sm animate-pulse">Autentificare Google...</p>
    </div>
  );
}
