import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { supabase } from './lib/supabase';
import { WaveHeader } from './components/WaveHeader';

type Confession = {
  id: string;
  content: string;
  created_at: string;
  anonymous_id: string;
};

export default function App() {
  const [newConfession, setNewConfession] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'terms' | 'main'>('terms');
  const [showAbout, setShowAbout] = useState(false);
  const successTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (successTimeout.current) {
        clearTimeout(successTimeout.current);
      }
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newConfession.trim()) return;

    const anonymousId = localStorage.getItem('anonymousId') || 
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem('anonymousId', anonymousId);

    await supabase.from('confessions').insert([
      { content: newConfession, anonymous_id: anonymousId }
    ]);

    setNewConfession('');
    setShowSuccess(true);
    if (successTimeout.current) {
      clearTimeout(successTimeout.current);
    }
    successTimeout.current = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (currentScreen === 'terms') {
        setCurrentScreen('main');
      }
    }
  }

  if (currentScreen === 'terms') {
    return (
      <div className="h-screen p-4" onKeyPress={handleKeyPress} tabIndex={0}>
        <div className="border border-white h-full p-8 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-2xl mb-6 tracking-wider">[ TERMS OF SERVICE ]</h1>
            <div className="w-full max-w-6xl mx-auto grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-white/90 mb-3">1. Content Distribution</h2>
                <p className="mb-2">Your confessions may be shared anonymously on our social media channels:</p>
                <p className="pl-4">
                  - Twitter: <a href="https://x.com/BSC_Confessions" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">@BSC_Confessions</a><br/>
                </p>

                <h2 className="text-white/90 mt-6 mb-3">2. Anonymity & Permanence</h2>
                <p className="mb-2">All confessions are:</p>
                <div className="pl-4">
                  <p>- Completely anonymous and cannot be traced back to you</p>
                  <p>- Permanent and cannot be deleted once submitted</p>
                  <p>- Stored securely in our database</p>
                </div>
              </div>

              <div>
                <h2 className="text-white/90 mb-3">3. User Responsibility</h2>
                <div className="pl-4 mb-6">
                  <p>- You maintain full responsibility for your confession content</p>
                  <p>- No illegal or harmful content will be tolerated</p>
                  <p>- We reserve the right to moderate content</p>
                </div>

                <h2 className="text-white/90 mb-3">4. Privacy & Security</h2>
                <div className="pl-4">
                  <p>- We do not collect any personal information</p>
                  <p>- Your IP address is not stored</p>
                  <p>- We use encryption for data transmission</p>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-white/70">Press [ENTER] to accept and continue...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen p-4">
      <div className="border border-white h-full p-8 flex flex-col">
        <header className="text-center mb-4">
          <WaveHeader />
          <pre className="text-xs sm:text-sm md:text-base whitespace-pre mt-1">
{` __      __      __         __      __              ___     ___     __      __           __              __  
|__)    /__\`    /  \`       /  \`    /  \\    |\\ |    |__     |__     /__\`    /__\`    |    /  \\    |\\ |    /__\` 
|__)    .__/    \\__,       \\__,    \\__/    | \\|    |       |___    .__/    .__/    |    \\__/    | \\|    .__/ 
                                                                                                              `}
          </pre>
        </header>

        <div className="max-w-2xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="mb-2">
            <div className="flex flex-col space-y-2">
              <textarea
                value={newConfession}
                onChange={(e) => setNewConfession(e.target.value)}
                className="w-full p-4 bg-black text-white border border-white focus:outline-none resize-none"
                rows={3}
                placeholder="Type your confession here..."
              />
              <div className="relative">
                <button
                  type="submit"
                  className="w-full p-2 border border-white hover:bg-white hover:text-black transition-colors"
                >
                  [ SUBMIT CONFESSION ]
                </button>
              </div>
            </div>
          </form>
        </div>

        <footer className="mt-auto">
          <p className="text-center text-lg mb-6 text-white/90">
            Share your secrets anonymously. No judgment, just release.
          </p>
          <div className="text-center h-6">
            {showSuccess && (
              <span className="text-green-500">
              [ Confession submitted successfully ]
              </span>
            )}
          </div>
          <div className="flex justify-between items-center px-4 -mt-2">
            <div className="space-x-4">
              <a href="https://github.com/BSCConfession/BSC-Confessions" target="_blank" rel="noopener noreferrer" className="no-underline hover:text-white/80">[ GitHub ]</a>
              <button onClick={() => setShowAbout(true)} className="no-underline hover:text-white/80">[ About ]</button>
            </div>
            <div className="space-x-4">
              <a href="https://x.com/BSC_Confessions" target="_blank" rel="noopener noreferrer" className="no-underline hover:text-white/80">[ Twitter ]</a>
              <a href="https://t.me/bscconfessions" target="_blank" rel="noopener noreferrer" className="no-underline hover:text-white/80">[ Telegram ]</a>
            </div>
          </div>
        </footer>

        {/* About Modal */}
        {showAbout && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-black border border-white max-w-2xl w-full p-6 relative">
              <button
                onClick={() => setShowAbout(false)}
                className="absolute top-2 right-2 hover:text-white/80"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl mb-4 tracking-wider">[ ABOUT BSC CONFESSIONS ]</h2>
              
              <div className="space-y-4 text-sm">
                <p>
                  BSC chain is currently full of noise and hype. Everyone's probably trading, 
                  winning, and losing. But we all have sins here — the bad trades, the missed 
                  entries, the early exits. This is the place to confess. Keep it real, share your story, and let the chain hear it.
                </p>
                
                <div className="border-t border-white/20 pt-4">
                  <h3 className="text-white/90 mb-2">Features:</h3>
                  <ul className="list-none space-y-1 pl-4">
                    <li>- Anonymous confessions about your BSC trading experiences</li>
                    <li>- Secure and permanent storage</li>
                    <li>- Selected confessions shared on social media</li>
                    <li>- No personal data collection</li>
                  </ul>
                </div>
                
                <div className="border-t border-white/20 pt-4 text-center">
                  <p className="text-white/70">
                    Share your BSC trading sins. Anonymous. Permanent. Cathartic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}