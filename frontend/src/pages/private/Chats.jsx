import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import chatService from '../../services/chatService.js';
import requestService from '../../services/requestService.js';

const Chats = () => {
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const loadThreads = async () => {
    setLoadingThreads(true);
    setError('');
    try {
      const [mine, incoming] = await Promise.all([requestService.getMine(), requestService.getIncoming()]);
      const combined = [...(mine?.data || []), ...(incoming?.data || [])];
      setThreads(combined);
      const paramId = searchParams.get('requestId');
      const firstId = combined[0]?._id || combined[0]?.id || '';
      const nextId = paramId && combined.find((c) => (c._id || c.id) === paramId) ? paramId : firstId;
      if (nextId) {
        setSelectedId(nextId);
        searchParams.set('requestId', nextId);
        setSearchParams(searchParams, { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Could not load chats');
    } finally {
      setLoadingThreads(false);
    }
  };

  const loadMessages = async (requestId) => {
    if (!requestId) return;
    setLoadingMessages(true);
    setError('');
    try {
      const res = await chatService.getByRequest(requestId);
      setMessages(res?.data || []);
    } catch (err) {
      setError(err?.message || 'Could not load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    loadMessages(selectedId);
  }, [selectedId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedId || !messageInput.trim()) return;
    try {
      await chatService.sendMessage({ requestId: selectedId, content: messageInput.trim() });
      setMessageInput('');
      await loadMessages(selectedId);
    } catch (err) {
      setError(err?.message || 'Could not send message');
    }
  };

  const activeThread = threads.find((t) => (t._id || t.id) === selectedId);

  return (
    <section className="grid gap-4 md:grid-cols-[320px_1fr]">
      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
          <h2>Threads</h2>
          {loadingThreads ? <span className="text-xs text-gray-500">Loading…</span> : null}
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {!loadingThreads && !threads.length ? (
          <p className="text-sm text-gray-600">No chats yet. Engage with requests to start messaging.</p>
        ) : null}
        <div className="space-y-2 text-sm text-gray-700">
          {threads.map((t) => {
            const id = t._id || t.id;
            return (
              <button
                key={id}
                onClick={() => setSelectedId(id)}
                className={`w-full rounded-md border px-3 py-3 text-left ${
                  selectedId === id ? 'border-gray-300 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="font-semibold text-gray-900">{t.buyer?.name || t.seller?.name || 'Counterparty'}</div>
                <div className="text-xs text-gray-600">Status: {t.status || 'pending'}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {!selectedId ? (
          <p className="text-sm text-gray-600">Select a thread to view messages.</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeThread?.buyer?.name || activeThread?.seller?.name || 'Chat'}
                </h3>
              </div>
              <a
                href={`/requests/my`}
                className="rounded-md border border-gray-200 px-3 py-1 text-sm hover:border-gray-300"
              >
                View request
              </a>
            </div>

            {loadingMessages ? <p className="mt-3 text-sm text-gray-600">Loading messages…</p> : null}
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

            <div className="mt-4 h-64 space-y-3 overflow-y-auto rounded-md bg-gray-50 p-3 text-sm text-gray-700">
              {!loadingMessages && !messages.length ? (
                <p className="text-sm text-gray-600">No messages yet. Start the conversation.</p>
              ) : null}
              {messages.map((m) => (
                <div key={m._id || m.id} className="rounded-md bg-white p-2 shadow-sm">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">{m.sender?.name || m.senderName || 'User'}</div>
                  <div className="text-gray-800">{m.body || m.content}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="mt-4 flex gap-2">
              <input
                className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="Type a message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
                disabled={!messageInput.trim()}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
};

export default Chats;
