'use client';
import { useState, useEffect, useRef } from 'react';

const TAG_COLORS = {
  '플랫폼BM': { bg:'#eff6ff', color:'#1a4fd6', border:'#c7d9f8' },
  'DX':       { bg:'#f0faf4', color:'#1a7a3c', border:'#a7dfc0' },
  'AI전략':   { bg:'#f5f3ff', color:'#7c3aed', border:'#ddd6fe' },
  'M&A':      { bg:'#fffbeb', color:'#b45309', border:'#fde68a' },
  '핀테크':   { bg:'#ecfeff', color:'#0e7490', border:'#a5f3fc' },
  '이커머스': { bg:'#fdf2f8', color:'#be185d', border:'#fbcfe8' },
  '모빌리티': { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0' },
  '빅테크':   { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe' },
};

const TAG_HASH = {
  '플랫폼BM':  ['#플랫폼비즈니스','#플랫폼전략','#비즈니스모델'],
  'DX':        ['#디지털전환','#DX','#디지털혁신'],
  'AI전략':    ['#AI전략','#생성AI','#AIBusiness'],
  'M&A':       ['#MA','#기업인수','#플랫폼통합'],
  '핀테크':    ['#핀테크','#디지털금융','#페이먼트'],
  '이커머스':  ['#이커머스','#소셜커머스','#커머스플랫폼'],
  '모빌리티':  ['#모빌리티','#자율주행','#MaaS'],
  '빅테크':    ['#빅테크','#플랫폼경제','#테크기업'],
};

function getHts(tag) {
  return [...new Set([...(TAG_HASH[tag]||[]),'#플랫폼비즈니스','#디지털전환'])].slice(0,5);
}

const today = new Date();
const todayDisplay = today.toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'short'});

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMsg, setLoadMsg] = useState('최근 7일 뉴스 검색 중...');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [postLoading, setPostLoading] = useState(false);
  const [postText, setPostText] = useState('');
  const [postNum, setPostNum] = useState(1);
  const [copied, setCopied] = useState(false);
  const postRef = useRef(null);

  useEffect(() => { fetchNews(); }, []);

  async function fetchNews() {
    setLoading(true); setError(''); setNews([]); setSelected(null); setPostText('');
    setLoadMsg('최근 7일 뉴스 검색 중...');
    const msgs = ['국내 플랫폼·DX 기사 수집 중...','해외 빅테크·AI 기사 수집 중...','기사 정리 및 번역 중...'];
    msgs.forEach((m, i) => setTimeout(() => setLoadMsg(m), (i+1)*3000));
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNews(data.news || []);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function selectNews(item) {
    setSelected(item); setPostText(''); setPostLoading(true);
    setTimeout(() => postRef.current?.scrollIntoView({behavior:'smooth',block:'start'}), 100);
    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ item, postNum }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPostText(data.text);
    } catch(e) {
      setPostText(`#${postNum}\n\n${item.title}\n\n[생성 오류 — 재생성을 눌러주세요]`);
    } finally {
      setPostLoading(false);
    }
  }

  function charCount() {
    return postText.replace(/\n🔗 https?:\/\/\S+/g,'').length;
  }

  function copyPost() {
    navigator.clipboard.writeText(postText).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  const ts = (tag) => TAG_COLORS[tag] || {bg:'#f4f1ec',color:'#555',border:'#ddd'};

  return (
    <div style={{background:'#f7f5f0',minHeight:'100vh',fontFamily:"'Noto Sans KR',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet"/>

      {/* 헤더 */}
      <div style={{borderBottom:'4px double #16140f',padding:'20px 0 14px',textAlign:'center',background:'#fff'}}>
        <div style={{fontFamily:'monospace',fontSize:10,letterSpacing:4,color:'#a09890',textTransform:'uppercase',marginBottom:6}}>
          Real-time Web Search · Platform Business & DX
        </div>
        <div style={{fontSize:42,fontWeight:900,letterSpacing:-2,lineHeight:1,color:'#16140f'}}>PLATFORM WIRE</div>
        <div style={{height:1,background:'#16140f',margin:'8px 40px 6px'}}/>
        <div style={{fontSize:12,color:'#5c5750'}}>플랫폼 비즈니스 · 디지털 대전환 뉴스 포스팅 자동화 · 고려대 경영학부</div>
      </div>

      {/* 날짜바 */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 32px',borderBottom:'1px solid #16140f',fontFamily:'monospace',fontSize:10,color:'#5c5750',background:'#fff'}}>
        <span>{todayDisplay}</span>
        <span>최근 7일 · 주목도 순 · 클릭하면 포스팅 생성</span>
        <span>고려대 경영학부</span>
      </div>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'28px 20px'}}>

        {/* 로딩 */}
        {loading && (
          <div style={{padding:'80px 0',textAlign:'center'}}>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <div style={{display:'inline-flex',alignItems:'center',gap:10,fontFamily:'monospace',fontSize:13,color:'#5c5750'}}>
              <span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span>
              <span>{loadMsg}</span>
            </div>
          </div>
        )}

        {/* 에러 */}
        {error && !loading && (
          <div style={{background:'#fff5f2',border:'1px solid #ffc9b8',padding:'20px 24px',marginBottom:24,borderRadius:2,textAlign:'center'}}>
            <p style={{fontSize:13,color:'#c8370a',marginBottom:12}}>{error}</p>
            <button onClick={fetchNews} style={{background:'#16140f',color:'#fff',border:'none',padding:'10px 24px',cursor:'pointer',fontFamily:'monospace',fontSize:12}}>다시 시도</button>
          </div>
        )}

        {/* 뉴스 목록 */}
        {!loading && news.length > 0 && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'2px solid #16140f',borderBottom:'1px solid #ccc7be',padding:'10px 0',marginBottom:20}}>
              <span style={{fontFamily:'monospace',fontSize:11,letterSpacing:2,textTransform:'uppercase'}}>최근 7일 플랫폼 뉴스 — 주목도 순</span>
              <span style={{fontFamily:'monospace',fontSize:10,color:'#a09890'}}>{news.length}건 · 국내 {news.filter(n=>n.country==='KR').length} / 해외 {news.filter(n=>n.country==='GLOBAL').length}</span>
            </div>

            <div style={{border:'1px solid #ccc7be',display:'flex',flexDirection:'column',gap:1,background:'#ccc7be',marginBottom:16}}>
              {news.map((item, i) => {
                const isSel = selected?.title === item.title;
                const t = ts(item.tag);
                return (
                  <div key={i} onClick={() => selectNews(item)}
                    style={{background:isSel?'#16140f':'#fff',display:'grid',gridTemplateColumns:'44px 1fr',cursor:'pointer',color:isSel?'#fff':'#16140f',transition:'background .12s'}}
                    onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background='#fffdf8'}}
                    onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background='#fff'}}
                  >
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'16px 0 0',fontFamily:'monospace',fontSize:12,color:isSel?'rgba(255,255,255,.35)':'#a09890',borderRight:`1px solid ${isSel?'rgba(255,255,255,.12)':'#e0dbd2'}`}}>
                      {String(i+1).padStart(2,'0')}
                    </div>
                    <div style={{padding:'14px 16px 13px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:7,flexWrap:'wrap'}}>
                        <span style={{fontFamily:'monospace',fontSize:9,padding:'2px 7px',borderRadius:2,border:`1px solid ${isSel?'rgba(255,255,255,.2)':(item.country==='KR'?'#c7d9f8':'#fbd89a')}`,background:isSel?'rgba(255,255,255,.12)':(item.country==='KR'?'#eff6ff':'#fef3c7'),color:isSel?'rgba(255,255,255,.75)':(item.country==='KR'?'#1a4fd6':'#92400e')}}>
                          {item.country==='KR'?'🇰🇷 국내':'🌐 해외'}
                        </span>
                        <span style={{fontFamily:'monospace',fontSize:9,padding:'2px 7px',borderRadius:2,border:`1px solid ${isSel?'rgba(255,255,255,.15)':t.border}`,background:isSel?'rgba(255,255,255,.12)':t.bg,color:isSel?'rgba(255,255,255,.75)':t.color}}>
                          {item.tag}
                        </span>
                        <span style={{fontFamily:'monospace',fontSize:9,color:isSel?'rgba(255,255,255,.4)':'#a09890',marginLeft:'auto'}}>📅 {item.date}</span>
                      </div>
                      <div style={{fontSize:14.5,fontWeight:700,lineHeight:1.45,marginBottom:6}}>{item.title}</div>
                      {item.summary && <div style={{fontSize:12.5,color:isSel?'rgba(255,255,255,.7)':'#5c5750',lineHeight:1.7,marginBottom:9}}>{item.summary}</div>}
                      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                        <span style={{fontFamily:'monospace',fontSize:10,color:isSel?'rgba(255,255,255,.4)':'#a09890',border:`1px solid ${isSel?'rgba(255,255,255,.2)':'#e0dbd2'}`,padding:'1px 8px',borderRadius:2}}>{item.source}</span>
                        <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                          {getHts(item.tag).map(h=><span key={h} style={{fontSize:11,color:isSel?'#7eb3ff':'#1a4fd6',fontFamily:'monospace'}}>{h}</span>)}
                        </div>
                        {item.url?.startsWith('http') && (
                          <a href={item.url} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()}
                            style={{marginLeft:'auto',fontSize:10,color:isSel?'rgba(255,255,255,.55)':'#5c5750',fontFamily:'monospace',textDecoration:'none',padding:'3px 10px',border:`1px solid ${isSel?'rgba(255,255,255,.3)':'#ccc7be'}`,borderRadius:2,background:isSel?'transparent':'#f7f5f0'}}>
                            ↗ 원문
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{textAlign:'right',marginBottom:40}}>
              <button onClick={fetchNews} style={{background:'transparent',border:'1px solid #ccc7be',padding:'8px 20px',fontSize:12,fontFamily:'monospace',color:'#5c5750',cursor:'pointer'}}>↺ &nbsp;새로 검색</button>
            </div>
          </div>
        )}

        {/* 포스팅 */}
        {selected && (
          <div ref={postRef}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'2px solid #16140f',borderBottom:'1px solid #ccc7be',padding:'10px 0',marginBottom:20}}>
              <span style={{fontFamily:'monospace',fontSize:11,letterSpacing:2,textTransform:'uppercase'}}>생성된 포스팅 초안</span>
              <span style={{fontFamily:'monospace',fontSize:10,color:'#a09890'}}>수정 후 복사 → 페이스북 붙여넣기</span>
            </div>
            {postLoading ? (
              <div style={{padding:28,textAlign:'center',background:'#fff',border:'1px solid #e0dbd2',fontFamily:'monospace',fontSize:12,color:'#5c5750'}}>
                <span style={{animation:'spin 1s linear infinite',display:'inline-block',marginRight:8}}>⟳</span>포스팅 작성 중...
              </div>
            ) : (
              <div style={{background:'#fff',border:'1px solid #ccc7be'}}>
                <div style={{background:'#16140f',color:'#fff',padding:'12px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontFamily:'monospace',fontSize:11,letterSpacing:1.5,textTransform:'uppercase'}}>Facebook Posting Draft</span>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>selectNews(selected)} style={{padding:'5px 14px',fontSize:11,fontFamily:'monospace',cursor:'pointer',border:'1px solid rgba(255,255,255,.3)',background:'transparent',color:'#fff'}}>↺ 재생성</button>
                    <button onClick={copyPost} style={{padding:'5px 14px',fontSize:11,fontFamily:'monospace',cursor:'pointer',border:'none',background:'#c8370a',color:'#fff'}}>
                      {copied?'✓ 복사됨!':'📋 복사'}
                    </button>
                  </div>
                </div>
                <div style={{padding:20}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                    <span style={{fontFamily:'monospace',fontSize:20,color:'#c8370a'}}>#</span>
                    <input type="number" value={postNum} min={1} onChange={e=>setPostNum(parseInt(e.target.value)||1)}
                      style={{fontFamily:'monospace',fontSize:18,color:'#c8370a',background:'transparent',border:'none',borderBottom:'2px solid #c8370a',width:60,outline:'none',padding:'0 2px'}}/>
                    <span style={{fontFamily:'monospace',fontSize:10,color:'#a09890'}}>← 포스팅 번호</span>
                  </div>
                  <textarea value={postText} onChange={e=>setPostText(e.target.value)}
                    style={{width:'100%',border:'1px solid #e0dbd2',padding:18,fontSize:14.5,fontFamily:"'Noto Sans KR',sans-serif",lineHeight:1.9,resize:'vertical',minHeight:260,background:'#f7f5f0',color:'#16140f',outline:'none',boxSizing:'border-box'}}/>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                    <span style={{fontFamily:'monospace',fontSize:11,color:charCount()<430?'#a09890':charCount()<=560?'#1a7a3c':'#c8370a'}}>{charCount()}자 (링크 제외)</span>
                    <span style={{fontFamily:'monospace',fontSize:11,color:'#a09890'}}>목표: 450~550자</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
