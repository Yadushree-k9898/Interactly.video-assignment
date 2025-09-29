import { useState, useEffect } from 'react';

export default function Home() {
  const [form, setForm] = useState({
    name: '',
    city: '',
    phone: '',
    actorId: 'actor_1',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setVideoUrl(null);

    try {
      const response = await fetch('http://localhost:4000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.ok && data.id) {
        setRequestId(data.id);
        setStatus('success');
        setMessage('Video generation started! Waiting for completion...');
      } else {
        throw new Error(data.error || 'Failed to generate video');
      }
    } catch (err: any) {
      console.error('Request failed:', err);
      setStatus('error');
      setMessage(err.message || 'Something went wrong');
    }
  };

  // Polling for video status
  useEffect(() => {
    if (!requestId) return;

    const interval = setInterval(async () => {
      try {
        const resp = await fetch(`http://localhost:4000/api/video-status/${requestId}`);
        if (!resp.ok) throw new Error('Failed to fetch video status');
        const data = await resp.json();

        if (data.status === 'generated' && data.syncResponse?.outputUrl) {
          setVideoUrl(data.syncResponse.outputUrl);
          setMessage('Your video is ready!');
          clearInterval(interval);
        } else if (data.status === 'failed' || data.status === 'timeout') {
          setStatus('error');
          setMessage('Video generation failed or timed out.');
          clearInterval(interval);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 10000); // check every 10 seconds

    return () => clearInterval(interval);
  }, [requestId]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Generate Personalized Video
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details below to create your personalized video
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm"
                placeholder="Enter your name"
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                id="city"
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm"
                placeholder="Enter your city"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm"
                placeholder="+1234567890"
              />
            </div>

            {/* Actor */}
            <div>
              <label htmlFor="actorId" className="block text-sm font-medium text-gray-700">Select Actor</label>
              <select
                id="actorId"
                value={form.actorId}
                onChange={(e) => setForm({ ...form, actorId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm"
              >
                <option value="actor_1">Actor 1 (Mock)</option>
                <option value="actor_2">Actor 2 (Mock)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {status === 'loading' ? 'Generating...' : 'Generate Video'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-md ${
              status === 'success' ? 'bg-green-50 text-green-800 border border-green-400' : 'bg-red-50 text-red-800 border border-red-400'
            }`}>
              {message}
            </div>
          )}

          {videoUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Your Video:</h3>
              <video src={videoUrl} controls className="mt-2 w-full rounded-md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
