import { useMemo, useRef, useState } from "react";
import { chatApi } from "../services/api";
import "./Chatbot.css";

const initialMessages = [
  {
    role: "assistant",
    content: "Hi, I can help with events, tickets, speakers, venues, and registrations.",
  },
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);

  const chatMessages = useMemo(
    () => messages.filter((message) => message.role === "user" || message.role === "assistant"),
    [messages]
  );

  const openChat = () => {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    const content = draft.trim();

    if (!content || isSending) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setIsSending(true);

    try {
      const data = await chatApi.send(
        nextMessages.map(({ role, content: messageContent }) => ({
          role,
          content: messageContent,
        }))
      );

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error.message || "The chatbot is unavailable right now.",
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className={`chatbot ${isOpen ? "chatbot--open" : ""}`} aria-label="AI chatbot">
      {isOpen ? (
        <div className="chatbot__panel">
          <header className="chatbot__header">
            <div>
              <p className="chatbot__eyebrow">AI assistant</p>
              <h2>Event help</h2>
            </div>
            <button
              className="chatbot__close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              x
            </button>
          </header>

          <div className="chatbot__messages" aria-live="polite">
            {chatMessages.map((message, index) => (
              <div
                className={`chatbot__message chatbot__message--${message.role} ${
                  message.isError ? "chatbot__message--error" : ""
                }`}
                key={`${message.role}-${index}`}
              >
                {message.content}
              </div>
            ))}
            {isSending && (
              <div className="chatbot__message chatbot__message--assistant">
                Thinking...
              </div>
            )}
          </div>

          <form className="chatbot__form" onSubmit={sendMessage}>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  sendMessage(event);
                }
              }}
              placeholder="Ask about events..."
              rows="2"
            />
            <button type="submit" disabled={isSending || !draft.trim()}>
              Send
            </button>
          </form>
        </div>
      ) : (
        <button className="chatbot__launcher" type="button" onClick={openChat}>
          AI
        </button>
      )}
    </section>
  );
}

export default Chatbot;
