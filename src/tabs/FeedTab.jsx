import { useState, useRef } from 'react'
import { ROLE_LABELS } from '../data/initialData.js'
import { initials } from '../utils/helpers.js'
import s from './FeedTab.module.css'

const TAG_COLORS = { Missões: '#FF8C00', Culto: '#fff', Louvor: '#aaa', Infantil: '#ddd', Post: '#666' }

function Avatar({ user, size = 42 }) {
  if (user?.photo) {
    return <img src={user.photo} alt="foto" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #333', flexShrink: 0 }} />
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#222', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.3, fontWeight: 700, flexShrink: 0 }}>
      {initials(user?.name || '??')}
    </div>
  )
}

export default function FeedTab({ user, posts, setPosts, users }) {
  const [newText, setNewText]       = useState('')
  const [newPhoto, setNewPhoto]     = useState(null)
  const [showNew, setShowNew]       = useState(false)
  const [liked, setLiked]           = useState({})
  const [openComments, setOpenComments] = useState({})
  const [commentText, setCommentText]   = useState({})
  const fileRef = useRef()

  // Find user object by name to get their photo
  const findUser = (name) => users?.find(u => u.name === name)

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setNewPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handlePost = () => {
    if (!newText.trim() && !newPhoto) return
    setPosts([
      {
        id: Date.now(),
        author: user.name,
        role: user.role,
        av: initials(user.name),
        photo: newPhoto,
        time: 'agora',
        text: newText,
        likes: 0,
        comments: [],
        tag: 'Post',
      },
      ...posts,
    ])
    setNewText('')
    setNewPhoto(null)
    setShowNew(false)
  }

  const toggleLike = (id) => {
    const isLiked = liked[id]
    setLiked(prev => ({ ...prev, [id]: !isLiked }))
    setPosts(ps => ps.map(p => p.id === id ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 } : p))
  }

  const toggleComments = (id) => setOpenComments(prev => ({ ...prev, [id]: !prev[id] }))

  const addComment = (postId) => {
    const text = (commentText[postId] || '').trim()
    if (!text) return
    setPosts(ps => ps.map(p => p.id === postId
      ? { ...p, comments: [...(Array.isArray(p.comments) ? p.comments : []), { author: user.name, text, time: 'agora' }] }
      : p
    ))
    setCommentText(prev => ({ ...prev, [postId]: '' }))
  }

  const handleShare = (post) => {
    const shareText = `${post.author} no Admirai: ${post.text}`
    if (navigator.share) {
      navigator.share({ title: 'Admirai', text: shareText }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(shareText)
      alert('Link copiado para compartilhar!')
    }
  }

  const commentCount = (post) => Array.isArray(post.comments) ? post.comments.length : post.comments || 0

  return (
    <div className={s.wrap}>
      <div className={s.pageHeader}>
        <span className={s.pageTitle}>INÍCIO</span>
        <button className={s.btnNew} onClick={() => setShowNew(!showNew)}>+ POST</button>
      </div>

      {/* Composer */}
      {showNew && (
        <div className={s.composer}>
          <div className={s.composerTop}>
            <Avatar user={user} size={36} />
            <div>
              <div className={s.composerName}>{user.name}</div>
              <div className={s.composerRole}>{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          <textarea
            className={s.textarea}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Compartilhe algo com a igreja..."
          />
          {newPhoto && (
            <div className={s.previewWrap}>
              <img src={newPhoto} alt="preview" className={s.previewImg} />
              <button className={s.removePhoto} onClick={() => setNewPhoto(null)}>✕</button>
            </div>
          )}
          <div className={s.composerActions}>
            <button className={s.btnPhoto} onClick={() => fileRef.current.click()}>📷 Foto</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
            <button className={s.btnPublish} onClick={handlePost}>Publicar</button>
            <button className={s.btnCancel} onClick={() => { setShowNew(false); setNewPhoto(null) }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.map(post => {
        const isLiked    = liked[post.id]
        const tagColor   = TAG_COLORS[post.tag] || '#888'
        const postUser   = findUser(post.author)
        const showCmts   = openComments[post.id]
        const cmtList    = Array.isArray(post.comments) ? post.comments : []

        return (
          <div key={post.id} className={s.postCard}>
            <div className={s.postTop}>
              <Avatar user={postUser || { name: post.author, photo: null }} size={42} />
              <div style={{ flex: 1 }}>
                <div className={s.postAuthorRow}>
                  <span className={s.postAuthor}>{post.author}</span>
                  <span className={s.tag} style={{ color: tagColor, borderColor: tagColor }}>{post.tag}</span>
                </div>
                <span className={s.postMeta}>{ROLE_LABELS[post.role] || post.role} · {post.time}</span>
              </div>
            </div>

            {post.text && <p className={s.postText}>{post.text}</p>}

            {post.photo && (
              <img src={post.photo} alt="post" className={s.postImg} />
            )}

            <div className={s.postFooter}>
              <button
                className={`${s.actionBtn} ${isLiked ? s.liked : ''}`}
                onClick={() => toggleLike(post.id)}
              >
                <span>{isLiked ? '❤️' : '🤍'}</span> {post.likes}
              </button>
              <button className={s.actionBtn} onClick={() => toggleComments(post.id)}>
                <span>💬</span> {commentCount(post)}
              </button>
              <button className={s.actionBtn} onClick={() => handleShare(post)}>
                <span>↗</span> Compartilhar
              </button>
            </div>

            {/* Comments section */}
            {showCmts && (
              <div className={s.comments}>
                {cmtList.map((c, i) => {
                  const cUser = findUser(c.author)
                  return (
                    <div key={i} className={s.comment}>
                      <Avatar user={cUser || { name: c.author, photo: null }} size={28} />
                      <div className={s.commentBody}>
                        <span className={s.commentAuthor}>{c.author}</span>
                        <span className={s.commentText}>{c.text}</span>
                        <span className={s.commentTime}>{c.time}</span>
                      </div>
                    </div>
                  )
                })}
                <div className={s.commentInput}>
                  <Avatar user={user} size={28} />
                  <input
                    className={s.commentField}
                    placeholder="Escreva um comentário..."
                    value={commentText[post.id] || ''}
                    onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                  />
                  <button className={s.commentSend} onClick={() => addComment(post.id)}>→</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
