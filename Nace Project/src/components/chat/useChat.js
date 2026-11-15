import { useCallback, useEffect, useState } from 'react';
import { askGroq } from '../../services/groqChatApi';

const STORAGE_KEY = 'nepton_chat_v2';
const GREETING_KEY = 'nepton_greeting_dismissed';

function getInitialMessages() {
  if (typeof window === 'undefined') {
    return [
      {
        id: 'welcome',
        role: 'bot',
        text: "Hi, I'm Nepton. I read the live hotspot feed and the 20-year archive. What would you like to know?",
        timestamp: Date.now(),
      },
    ];
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [
        {
          id: 'welcome',
          role: 'bot',
          text: "Hi, I'm Nepton. I read the live hotspot feed and the 20-year archive. What would you like to know?",
          timestamp: Date.now(),
        },
      ];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(-50);
    }
  } catch (error) {
    console.warn('Unable to restore chat history', error);
  }

  return [
    {
      id: 'welcome',
      role: 'bot',
      text: "Hi, I'm Nepton. I read the live hotspot feed and the 20-year archive. What would you like to know?",
      timestamp: Date.now(),
    },
  ];
}

export default function useChat(context = {}) {
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showGreeting, setShowGreeting] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(GREETING_KEY) !== '1';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem(GREETING_KEY) === '1') {
      setShowGreeting(false);
      return;
    }

    const showTimer = window.setTimeout(() => setShowGreeting(true), 3000);
    const hideTimer = window.setTimeout(() => setShowGreeting(false), 12000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
    }
  }, [open]);

  const dismissGreeting = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(GREETING_KEY, '1');
    setShowGreeting(false);
  }, []);

  const sendMessage = useCallback(
    async (text = input) => {
      const trimmed = String(text ?? input ?? '').trim();
      if (!trimmed || loading) {
        return;
      }

      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: Date.now(),
      };

      setMessages((previous) => [...previous.slice(-49), userMessage]);
      setInput('');
      setLoading(true);

      const botId = `bot-${Date.now()}`;
      setMessages((previous) => [
        ...previous.slice(-49),
        {
          id: botId,
          role: 'bot',
          text: '',
          pending: true,
          timestamp: Date.now(),
        },
      ]);

      try {
        const history = messages.slice(-19);
        const response = await askGroq(
          {
            message: trimmed,
            history,
            context,
          },
          (token) => {
            setMessages((previous) =>
              previous.map((message) =>
                message.id === botId
                  ? {
                      ...message,
                      text: `${message.text || ''}${token}`,
                    }
                  : message,
              ),
            );
          },
        );

        setMessages((previous) =>
          previous.map((message) =>
            message.id === botId
              ? {
                  ...message,
                  pending: false,
                  hotspot: response.hotspot || null,
                  sources: response.sources || [],
                  text: response.text || message.text || '',
                }
              : message,
          ),
        );

        if (!open) {
          setUnread((count) => count + 1);
        }
      } catch (error) {
        setMessages((previous) =>
          previous.map((message) =>
            message.id === botId
              ? {
                  ...message,
                  pending: false,
                  text: error.message || "I couldn't reach the analysis service. Try again.",
                  error: true,
                }
              : message,
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [context, input, loading, messages, open],
  );

  return {
    open,
    setOpen,
    messages,
    input,
    setInput,
    loading,
    unread,
    showGreeting,
    dismissGreeting,
    sendMessage,
  };
}
