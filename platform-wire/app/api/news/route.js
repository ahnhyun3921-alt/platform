export const maxDuration = 60;

export async function GET() {
  const today = new Date();
  const todayFmt = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일`;
  const sevenAgo = new Date(today);
  sevenAgo.setDate(today.getDate() - 7);
  const sevenFmt = `${sevenAgo.getFullYear()}년 ${sevenAgo.getMonth()+1}월 ${sevenAgo.getDate()}일`;

  try {
    // 1차 호출 (웹서치 툴 포함)
    const res1 = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `You are a JSON API. After searching the web, output ONLY a valid JSON array. No markdown. No explanation. Start with [ end with ].`,
        messages: [{
          role: 'user',
          content: `현재 날짜: ${todayFmt}
최근 7일(${sevenFmt} ~ ${todayFmt}) 사이 실제로 이슈가 됐던 플랫폼 비즈니스·디지털 대전환 관련 국내외 뉴스를 웹에서 검색해서 20개 찾아줘.
국내 10개(조선비즈·매일경제·한국경제·블로터·전자신문 등), 해외 10개(TechCrunch·WSJ·Bloomberg·Reuters·FT 등).
규칙: JSON 배열만 출력. 제목·요약은 한국어. 배열은 주목도·화제성 높은 순.
형식: [{"title":"한국어제목","summary":"한국어요약2문장(100자이내)","source":"언론사","url":"실제URL","date":"YYYY.MM.DD","country":"KR또는GLOBAL","tag":"플랫폼BM|DX|AI전략|M&A|핀테크|이커머스|모빌리티|빅테크 중하나"}]`
        }]
      })
    });

    let data = await res1.json();

    // 웹서치 tool_use 처리
    let messages = [
      { role: 'user', content: `현재 날짜: ${todayFmt}\n최근 7일(${sevenFmt} ~ ${todayFmt}) 사이 실제로 이슈가 됐던 플랫폼 비즈니스·디지털 대전환 관련 국내외 뉴스를 웹에서 검색해서 20개 찾아줘.\n국내 10개(조선비즈·매일경제·한국경제·블로터·전자신문 등), 해외 10개(TechCrunch·WSJ·Bloomberg·Reuters·FT 등).\n규칙: JSON 배열만 출력. 제목·요약은 한국어. 배열은 주목도·화제성 높은 순.\n형식: [{"title":"한국어제목","summary":"한국어요약2문장(100자이내)","source":"언론사","url":"실제URL","date":"YYYY.MM.DD","country":"KR또는GLOBAL","tag":"플랫폼BM|DX|AI전략|M&A|핀테크|이커머스|모빌리티|빅테크 중하나"}]` }
    ];

    let loopCount = 0;
    while (data.stop_reason === 'tool_use' && loopCount < 8) {
      loopCount++;
      const toolUses = data.content.filter(c => c.type === 'tool_use');
      const toolResults = toolUses.map(t => ({
        type: 'tool_result',
        tool_use_id: t.id,
        content: t.input?.query ? `검색어 "${t.input.query}"에 대한 결과를 반환합니다.` : '검색 완료',
      }));

      messages = [
        ...messages,
        { role: 'assistant', content: data.content },
        { role: 'user', content: toolResults },
      ];

      const res2 = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          system: `You are a JSON API. After searching the web, output ONLY a valid JSON array. No markdown. No explanation. Start with [ end with ].`,
          messages,
        })
      });
      data = await res2.json();
    }

    // 텍스트 추출
    const text = data.content?.filter(c => c.type === 'text').map(c => c.text).join('') || '';

    // JSON 파싱
    let parsed = null;
    const clean = text.replace(/```[\w]*\n?/g, '').trim();
    let depth = 0, start = -1;
    for (let i = 0; i < clean.length; i++) {
      if (clean[i] === '[') { if (!depth) start = i; depth++; }
      else if (clean[i] === ']') {
        depth--;
        if (!depth && start !== -1) {
          try {
            const p = JSON.parse(clean.slice(start, i+1));
            if (Array.isArray(p) && p.length > (parsed?.length||0)) parsed = p;
          } catch(e) {}
          start = -1;
        }
      }
    }

    if (!parsed?.length) {
      return Response.json({ error: 'JSON 파싱 실패', raw: text.substring(0, 200) }, { status: 500 });
    }

    return Response.json({ news: parsed.filter(i => i.title?.length > 3) });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
