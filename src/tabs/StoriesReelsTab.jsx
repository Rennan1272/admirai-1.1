import { useState, useRef } from 'react'
import { initials } from '../utils/helpers.js'
import s from './StoriesReelsTab.module.css'

/**
 * StoriesReelsTab
 * Stories: 24h expiration — filtered by expiresAt > now
 * Reels: vertical autoplay feed
 *
 * In production:
 *   Stories: GET /stories (filter: WHERE expires_at > NOW())
 *            Cron job or DB trigger to delete/archive expired stories
 *   Reels:   GET /reels?page=&limit=10 (cursor pagination)
 *            Video stored in CDN (S3/CloudFront), URL returned from API
 */

function timeLeft(expiresAt) {
  const diff = new Date(expiresAt) - new Date()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  if (h >= 1) return `${h}h`
  const m = Math.floor(diff / 60000)
  return `${m}m`
}

export default function StoriesReelsTab({ user, stories, setStories, reels, setReels }) {
  const [subTab, setSubTab]         = useState('stories')
  const [viewStory, setViewStory]   = useState(null) // story object being viewed
  const [likedReels, setLikedReels] = useState({})
  const [showAddStory, setShowAddStory] = useState(false)
  const [storyText, setStoryText]   = useState('')
  const [storyBg, setStoryBg]       = useState('#1a0a00')
  const [storyImg, setStoryImg]     = useState(null)
  const imgRef = useRef()

  // Filter out expired stories
  const activeStories = stories.filter(s => new Date(s.expiresAt) > new Date())

  const addStory = () => {
    if (!storyText.trim() && !storyImg) return
    const now = new Date()
    setStories(prev => [...prev, {
      id: Date.now(),
      author: user.name,
      avatar: initials(user.name),
      mediaUrl: storyImg,
      mediaType: 'image',
      text: storyText,
      bgColor: storyBg,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 86400000).toISOString(), // +24h
    }])
    setStoryText('')
    setStoryImg(null)
    setShowAddStory(false)
  }

  const toggleLikeReel = (id, base) => {
    setLikedReels(prev => {
      const liked = prev[id]
      setReels(rs => rs.map(r => r.id === id ? { ...r, likes: liked ? r.likes - 1 : r.likes + 1 } : r))
      return { ...prev, [id]: !liked }
    })
  }

  const BG_OPTIONS = ['#1a0a00','#001a0a','#0a001a','#1a1a00','#001a1a','#1a000a']

  return (
    <div className={s.wrap}>
      {/* Sub-tabs */}
      <div className={s.subTabs}>
        <button className={`${s.subBtn} ${subTab === 'stories' ? s.subActive : ''}`} onClick={() => setSubTab('stories')}>
          Stories
        </button>
        <button className={`${s.subBtn} ${subTab === 'reels' ? s.subActive : ''}`} onClick={() => setSubTab('reels')}>
          Reels
        </button>
      </div>

      {/* ── STORIES ── */}
      {subTab === 'stories' && (
        <div>
          {/* Story viewer overlay */}
          {viewStory && (
            <div className={s.storyViewer} onClick={() => setViewStory(null)}
              style={{ background: viewStory.bgColor || '#111' }}>
              {viewStory.mediaUrl && (
                <img src={viewStory.mediaUrl} alt="" className={s.storyViewImg} />
              )}
              <div className={s.storyViewHeader}>
                <div className={s.storyViewAv}>{viewStory.avatar}</div>
                <div>
                  <div className={s.storyViewName}>{viewStory.author}</div>
                  <div className={s.storyViewTime}>{timeLeft(viewStory.expiresAt)} restante</div>
                </div>
                <button className={s.storyViewClose} onClick={() => setViewStory(null)}>✕</button>
              </div>
              {viewStory.text && (
                <div className={s.storyViewText}>{viewStory.text}</div>
              )}
              <div className={s.storyViewTap}>Toque para fechar</div>
            </div>
          )}

          {/* Add story form */}
          {showAddStory && (
            <div className={s.addStoryForm}>
              <div className={s.addStoryPreview} style={{ background: storyBg }}>
                {storyImg
                  ? <img src={storyImg} alt="" className={s.addStoryImg} />
                  : <span className={s.addStoryPlaceholder}>{storyText || 'Prévia do story'}</span>
                }
              </div>
              <div className={s.bgPicker}>
                {BG_OPTIONS.map(c => (
                  <button key={c} className={`${s.bgBtn} ${storyBg === c ? s.bgActive : ''}`}
                    style={{ background: c }} onClick={() => setStoryBg(c)} />
                ))}
              </div>
              <input className={s.storyTextInput} value={storyText} onChange={e => setStoryText(e.target.value)}
                placeholder="Texto do story..." />
              <div className={s.addStoryActions}>
                <button className={s.btnPhoto} onClick={() => imgRef.current.click()}>📷 Foto</button>
                <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = ev => setStoryImg(ev.target.result)
                    reader.readAsDataURL(file)
                  }} />
                <button className={s.btnPub} onClick={addStory}>Publicar</button>
                <button className={s.btnCancel} onClick={() => setShowAddStory(false)}>Cancelar</button>
              </div>
            </div>
          )}

          {/* Stories row */}
          <div className={s.storiesRow}>
            {/* Add my story */}
            <div className={s.storyAddBtn} onClick={() => setShowAddStory(!showAddStory)}>
              <div className={s.storyAddCircle}>+</div>
              <span className={s.storyAddLabel}>Seu story</span>
            </div>

            {activeStories.map(st => (
              <div key={st.id} className={s.storyItem} onClick={() => setViewStory(st)}>
                <div className={s.storyCircle} style={{ background: st.bgColor || '#222', border: st.author === user.name ? '2px solid #FF8C00' : '2px solid #444' }}>
                  {st.mediaUrl
                    ? <img src={st.mediaUrl} alt="" className={s.storyCircleImg} />
                    : <span className={s.storyCircleInitial}>{st.avatar}</span>
                  }
                </div>
                <span className={s.storyLabel}>{st.author.split(' ')[0]}</span>
                {timeLeft(st.expiresAt) && (
                  <span className={s.storyExpiry}>{timeLeft(st.expiresAt)}</span>
                )}
              </div>
            ))}
          </div>

          {activeStories.length === 0 && !showAddStory && (
            <div className={s.emptyState}>
              <p>Nenhum story ativo no momento.</p>
              <button className={s.btnPub} onClick={() => setShowAddStory(true)}>Criar story</button>
            </div>
          )}
        </div>
      )}

      {/* ── REELS ── */}
      {subTab === 'reels' && (
        <div className={s.reelsFeed}>
          {reels.map(reel => (
            <div key={reel.id} className={s.reelCard} style={{ background: reel.bgColor || '#111' }}>
              {/* Video placeholder — in prod: <video src={reel.videoUrl} autoPlay muted loop playsInline /> */}
              <div className={s.reelVideoPlaceholder}>
                <div className={s.reelPlayIcon}>▶</div>
                <span className={s.reelVideoLabel}>Vídeo do Reel</span>
                <span className={s.reelVideoNote}>Upload de vídeo disponível na versão nativa</span>
              </div>

              {/* Author */}
              <div className={s.reelAuthorRow}>
                <div className={s.reelAv}>{reel.avatar}</div>
                <span className={s.reelAuthor}>{reel.author}</span>
              </div>

              {/* Caption */}
              <p className={s.reelCaption}>{reel.caption}</p>

              {/* Actions */}
              <div className={s.reelActions}>
                <button className={`${s.reelBtn} ${likedReels[reel.id] ? s.reelLiked : ''}`}
                  onClick={() => toggleLikeReel(reel.id, reel.likes)}>
                  <span>{likedReels[reel.id] ? '❤️' : '🤍'}</span>
                  <span className={s.reelBtnCount}>{reel.likes}</span>
                </button>
                <button className={s.reelBtn}>
                  <span>💬</span><span className={s.reelBtnCount}>0</span>
                </button>
                <button className={s.reelBtn} onClick={() => navigator.share?.({ text: reel.caption }).catch(()=>{})}>
                  <span>↗</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
