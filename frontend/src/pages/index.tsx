import { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({
    name: '',
    city: '',
    phone: '',
    actorId: 'actor_1'
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    try {
      try {
        // First test if the server is reachable
        const testResponse = await fetch('http://localhost:4000/test');
        console.log('Test response:', await testResponse.text());
      } catch (error) {
        console.error('Test endpoint failed:', error);
      }

      console.log('Attempting generate request:', {
        url: 'http://localhost:4000/api/generate',
        data: form
      });
      
      const response = await fetch('http://localhost:4000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(form),
      });

      console.log('Generate response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Generate response error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.ok) {
        setStatus('success');
        setMessage('Video generation started! You will receive it on WhatsApp soon.');
      } else {
        throw new Error(data.error || 'Failed to generate video');
      }
    } catch (error: any) {
      console.error('Request failed:', error);
      setStatus('error');
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setMessage('Could not connect to the server. Please make sure the backend is running.');
      } else {
        setMessage(error.message || 'Something went wrong');
      }
    }
  };

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

        <div className="mt-8">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <div className="mt-1">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="actorId" className="block text-sm font-medium text-gray-700">
                  Select Actor
                </label>
                <div className="mt-1">
                  <select
                    id="actorId"
                    name="actorId"
                    value={form.actorId}
                    onChange={(e) => setForm({ ...form, actorId: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="actor_1">Actor 1 (Mock)</option>
                    <option value="actor_2">Actor 2 (Mock)</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {status === 'loading' ? 'Generating...' : 'Generate Video'}
                </button>
              </div>
            </form>

            {message && (
              <div className={`mt-4 p-4 rounded-md ${
                status === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-400' 
                  : 'bg-red-50 text-red-800 border border-red-400'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}