import { useState, useRef, useEffect } from 'react'
import { initials } from '../utils/helpers.js'
import s from './ChatTab.module.css'

/**
 * ChatTab — 1:1 messaging, WhatsApp style
 *
 * In production:
 *   WebSocket (Socket.io): emit 'send_message', on 'new_message'
 *   REST fallback: POST /messages, GET /messages?conversationId=
 *   Status updates: PATCH /messages/:id/status (delivered|read)
 *   Entity: Message { id, conversationId, fromId, toId, text, status, createdAt }
 *   Index: (conversationId, createdAt DESC)
 */

function convId(a, b) {
  // Deterministic conversation key from two user names
  return [a, b].sort().join('::')
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const STATUS_ICONS = { sent: '✓', delivered: '✓✓', read: '✓✓' }

export default function ChatTab({ user, users, messages, setMessages }) {
  const [activeConv, setActiveConv] = useState(null) // name of the other user
  const [inputText, setInputText]   = useState('')
  const [search, setSearch]         = useState('')
  const endRef = useRef()

  // All users except current
  const contacts = users.filter(u => u.name !== user.name)
  const filtered  = contacts.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

  // Get last message per conversation for inbox
  const getLastMsg = (contactName) => {
    const msgs = messages.filter(m =>
      (m.from === user.name && m.to === contactName) ||
      (m.from === contactName && m.to === user.name)
    )
    return msgs[msgs.length - 1] || null
  }

  // Get unread count for a contact
  const getUnread = (contactName) =>
    messages.filter(m => m.from === contactName && m.to === user.name && m.status !== 'read').length

  // Messages in active conversation
  const convMsgs = activeConv
    ? messages.filter(m =>
        (m.from === user.name && m.to === activeConv) ||
        (m.from === activeConv && m.to === user.name)
      )
    : []

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (!activeConv) return
    setMessages(prev => prev.map(m =>
      m.from === activeConv && m.to === user.name && m.status !== 'read'
        ? { ...m, status: 'read' }
        : m
    ))
  }, [activeConv])

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convMsgs.length])

  const sendMessage = () => {
    if (!inputText.trim() || !activeConv) return
    const newMsg = {
      id: Date.now(),
      from: user.name,
      to: activeConv,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
      status: 'sent',
    }
    setMessages(prev => [...prev, newMsg])
    setInputText('')

    // Simulate delivery after 800ms (in production: WebSocket ack)
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m))
    }, 800)
  }

  const activeUser = users.find(u => u.name === activeConv)

  // ── Conversation view ─────────────────────────────────────────────────────
  if (activeConv) {
    return (
      <div className={s.convWrap}>
        {/* Header */}
        <div className={s.convHeader}>
          <button className={s.backBtn} onClick={() => setActiveConv(null)}>←</button>
          {activeUser?.photo
            ? <img src={activeUser.photo} alt="" className={s.convAvImg} />
            : <div className={s.convAv}>{initials(activeConv)}</div>
          }
          <div>
            <div className={s.convName}>{activeConv}</div>
            <div className={s.convOnline}>membro</div>
          </div>
        </div>

        {/* Messages */}
        <div className={s.messages}>
          {convMsgs.length === 0 && (
            <div className={s.emptyConv}>
              Nenhuma mensagem ainda.<br />Diga olá! 👋
            </div>
          )}
          {convMsgs.map(m => {
            const isMe = m.from === user.name
            return (
              <div key={m.id} className={`${s.bubble} ${isMe ? s.bubbleMe : s.bubbleThem}`}>
                <div className={s.bubbleText}>{m.text}</div>
                <div className={s.bubbleMeta}>
                  <span className={s.bubbleTime}>{fmtTime(m.createdAt)}</span>
                  {isMe && (
                    <span className={`${s.bubbleStatus} ${m.status === 'read' ? s.statusRead : ''}`}>
                      {STATUS_ICONS[m.status]}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className={s.inputBar}>
          <input
            className={s.msgInput}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Digite uma mensagem..."
          />
          <button className={s.sendBtn} onClick={sendMessage} disabled={!inputText.trim()}>
            ➤
          </button>
        </div>
      </div>
    )
  }

  // ── Inbox view ────────────────────────────────────────────────────────────
  return (
    <div className={s.wrap}>
      <div className={s.inboxHeader}>
        <span className={s.inboxTitle}>MENSAGENS</span>
      </div>
      <div className={s.searchWrap}>
        <input className={s.searchInput} value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Buscar contato..." />
      </div>
      {filtered.map(contact => {
        const last    = getLastMsg(contact.name)
        const unread  = getUnread(contact.name)
        return (
          <button key={contact.id} className={s.contactRow} onClick={() => setActiveConv(contact.name)}>
            <div className={s.contactAvWrap}>
              {contact.photo
                ? <img src={contact.photo} alt="" className={s.contactAvImg} />
                : <div className={s.contactAv}>{initials(contact.name)}</div>
              }
              {unread > 0 && <span className={s.unreadBadge}>{unread}</span>}
            </div>
            <div className={s.contactInfo}>
              <div className={s.contactName}>{contact.name}</div>
              <div className={s.contactLast}>
                {last
                  ? (last.from === user.name ? `Você: ${last.text}` : last.text)
                  : 'Iniciar conversa'
                }
              </div>
            </div>
            {last && <div className={s.contactTime}>{fmtTime(last.createdAt)}</div>}
          </button>
        )
      })}
    </div>
  )
}
