export async function askGroq({ message, history = [], context = {} }, onToken) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, context }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Chat request failed (${response.status}).`);
  }

  if (!response.body) {
    throw new Error('The chat service returned an empty response.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let done = false;

  const readEvent = (event) => {
    const data = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n');

    if (!data || data === '[DONE]') return;

    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      throw new Error('The chat service returned an invalid response.');
    }

    if (payload.error) {
      throw new Error(payload.error);
    }

    const token = payload.choices?.[0]?.delta?.content;
    if (typeof token === 'string' && token) {
      text += token;
      onToken?.(token);
    }
  };

  try {
    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';
      events.forEach(readEvent);
    }

    if (buffer.trim()) readEvent(buffer);
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  }

  if (!text) {
    throw new Error('The chat service returned no answer. Please try again.');
  }

  return { text, sources: [] };
}
