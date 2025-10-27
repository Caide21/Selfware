import { useState } from 'react';
import { TextInput } from '@/components/Form';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: 'dY"?',
  title: 'Caide Access Portal',
  subtitle: 'Enter your credentials to access The Mirror backend.',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  usePageHeading(PAGE_HEADING);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError('Login failed. Check your credentials.');
      return;
    }

    router.push('/caide/clients');
  };

  return (
    <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 mx-auto">
      <TextInput type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <TextInput
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button type="submit" className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 transition">
        Enter the Mirror
      </button>
    </form>
  );
}
