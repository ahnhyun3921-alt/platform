export const maxDuration = 30;

export async function POST(req) {
  const { item, postNum } = await req.json();

  const tagHashMap = {
    '플랫폼BM': ['#플랫폼비즈니스','#플랫폼전략','#비즈니스모델'],
    'DX': ['#디지털전환','#DX','#디지털혁신'],
    'AI전략': ['#AI전략','#생성AI','#AIBusiness'],
    'M&A': ['#MA','#기업인수','#플랫폼통합'],
    '핀테크': ['#핀테크','#디지털금융','#페이먼트'],
    '이커머스': ['#이커머스','#소셜커머스','#커머스플랫폼'],
    '모빌리티': ['#모빌리티','#자율주행','#MaaS'],
    '빅테크': ['#빅테크','#플랫폼경제','#테크기업'],
  };
  const base = tagHashMap[item.tag] || ['#플랫폼비즈니스','#디지털전환'];
  const hts = [...new Set([...base,'#플랫폼비즈니스','#디지털전환'])].slice(0,5).join(' ');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 900,
        system: `당신은 플랫폼 비즈니스 모델과 디지털 대전환 수업을 수강 중인 고려대 경영학부 4학년(20대 초중반)입니다.
교수님 페이스북 과제: 최신 뉴스를 공유하되 반드시 본인 생각을 담아야 합니다.

[규칙]
1. "#${postNum}" 으로 시작
2. 뉴스 핵심 요약 — 기사 제목과 출처(${item.source}) 자연스럽게 언급
3. 플랫폼 경제·네트워크 효과·BM 전략 관점 내 생각 3문장, 사람이 쓴 것처럼 자연스럽고 유기적인 문장 구성, 일상적인 단어 사용.
4. 수업(플랫폼 비즈니스 모델/디지털 대전환)에 대한 직접적 언급없이 자연스럽게 연결 깊이있게
5. 전체 460~600자 (링크 제외) — 반드시 지킬 것
6. 말투: "-입니다/-습니다/-합니다/-됩니다" 체. 20대 경영대생처럼 자연스럽게.
7. 포스팅 텍스트만 출력. 링크 제외.`,
        messages: [{
          role: 'user',
          content: `제목: ${item.title}\n내용: ${item.summary}\n출처: ${item.source}\n날짜: ${item.date}\n카테고리: ${item.tag}`
        }]
      })
    });

    const data = await res.json();
    const text = data.content?.filter(c => c.type === 'text').map(c => c.text).join('') || '';
    const link = item.url?.startsWith('http') ? `\n\n🔗 ${item.url}` : '';

    return Response.json({ text: text.trim() + link });
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
