(() => {
  const switcher = document.querySelector('.language-switch');
  if (!switcher) return;

  // Translate the profile, About, Education and section headings. Entries in
  // the remaining sections retain their content and live interaction state.
  const chinese = {
    '.skip-link': '跳至正文',
    'nav a[href="#about"]': '关于我',
    'nav a[href="#education"]': '教育经历',
    'nav a[href="#publications"]': '学术论文',
    'nav a[href="#projects"]': '代码项目',
    'nav a[href="#research"]': '知识产权',
    'nav a[href="#awards"]': '奖项与荣誉',
    'nav .nav-cv': '简历 <span aria-hidden="true">↗</span>',
    '#publications-title': '学术论文',
    '#conference-papers-heading': '会议论文',
    '#journal-papers-heading': '期刊论文',
    '#projects-title': '代码项目',
    '#research-title': '知识产权',
    '#intellectual-property-heading': '专利与软件著作权',
    '#research-projects-heading': '科研项目',
    '#awards-title': '奖项与荣誉',
    '#competition-awards-heading': '竞赛奖项',
    '#personal-honors-heading': '个人荣誉',
    '#contributions-title': '年度成果统计',
    '#contribution-tab-all': '汇总',
    '#contribution-tab-publications': '学术论文',
    '#contribution-tab-projects': '代码项目',
    '#contribution-tab-research': '知识产权',
    '#contribution-tab-awards': '奖项与荣誉',
    '.profile-field': 'MPhil 研究生',
    '.profile .school-line': '香港科技大学',
    '.profile .school-campus': '（广州）',
    '#about-title': '关于我',
    '.intro-lead': '你好，我是<strong>谭昊<span class="name-zh" lang="en">（Hao Tan）</span></strong>。',
    '.intro-copy:nth-child(2)': '我目前是<strong>香港科技大学（广州）</strong>的 MPhil 研究生，师从<strong>胡旭明教授</strong>。本科毕业于<strong>广东工业大学</strong>，师从<strong>秦景辉教授</strong>。我的研究聚焦于<strong>高效、具备感知能力且可信的人工智能</strong>，同时探索人工智能的跨学科融合与应用。',
    '.intro-copy:nth-child(3)': '科研之外，我喜欢阅读侦探与推理小说，最喜欢的作家是<a href="https://en.wikipedia.org/wiki/Ellery_Queen" target="_blank" rel="noopener">埃勒里·奎因</a>和<a href="https://zh.wikipedia.org/wiki/%E4%B8%89%E6%B4%A5%E7%94%B0%E4%BF%A1%E4%B8%89" target="_blank" rel="noopener">三津田信三</a>。',
    '.intro-copy:nth-child(4)': '如果你有任何问题，或希望进行科研交流与合作，欢迎随时通过邮箱联系我：<strong><a href="mailto:tanhao4869@gmail.com">tanhao4869@gmail.com</a></strong>。',
    '.research-interests > .subheading': '研究兴趣',
    '.research-overview li:nth-child(1) > span': '高效人工智能',
    '.research-overview li:nth-child(2) > span': '多模态生成模型',
    '.research-overview li:nth-child(3) > span': '多模态大语言模型',
    '.research-overview li:nth-child(4) > span': 'AIGC 内容检测',
    '.research-overview li:nth-child(5) > span': '世界模型',
    '.research-overview li:nth-child(6) > span': 'AI for Science（科学智能）',
    '.research-interests > p': '我的研究兴趣是面向开放世界环境构建通用世界模型。围绕这一愿景，我从<strong>高效性、感知能力与可信性</strong>三个核心维度开展研究，并积极探索与医疗健康及生命科学的交叉融合。',
    '.interest-group:nth-of-type(1) > p': '<strong class="interest-label">高效性。</strong>关注人工智能模型在资源受限或数据稀缺条件下的泛化与适应问题：',
    '.interest-group:nth-of-type(1) li:nth-child(1)': '域适应（DA）',
    '.interest-group:nth-of-type(1) li:nth-child(2)': '域泛化（DG）',
    '.interest-group:nth-of-type(1) li:nth-child(3)': '面向大语言模型、多模态大语言模型与 AIGC 模型的高效推理技术',
    '.interest-group:nth-of-type(2) > p': '<strong class="interest-label">感知能力。</strong>关注人工智能模型如何从多模态信号中提取深层语义，实现对人类状态与意图的细粒度理解：',
    '.interest-group:nth-of-type(2) li:nth-child(1)': '基于脑电信号的神经解码与视觉重建',
    '.interest-group:nth-of-type(2) li:nth-child(2)': '多模态生成模型，包括图像与视频生成等',
    '.interest-group:nth-of-type(3) > p': '<strong class="interest-label">可信性。</strong>关注 AIGC 内容检测、合成媒体溯源以及虚假信息传播的对抗与防范机制：',
    '.interest-group:nth-of-type(3) li:nth-child(1)': '医疗健康与生命科学场景下的 AIGC 内容检测，包括医学图像伪造、远程医疗问诊造假，以及面向可信医疗的主动防御等',
    '.interest-group:nth-of-type(3) li:nth-child(2)': '常见场景下的 AIGC 内容检测，包括人脸伪造、自然图像伪造、视频伪造与虚假新闻等',
    '#news-title': '最新动态',
    '#news-scroll-hint': '滚动查看往期动态 <span aria-hidden="true">↓</span>',
    '#education-title': '教育经历',
    '.education-row:nth-child(1) h3 a': '香港科技大学（广州）',
    '.education-row:nth-child(1) .education-school': '信息枢纽（Information Hub）',
    '.education-row:nth-child(1) .education-summary': '哲学硕士研究生（MPhil），导师：<span>胡旭明教授</span>。',
    '.education-row:nth-child(1) .education-period > span:first-child': '2026年9月 — 2028年6月 <span class="education-expected">（预计）</span>',
    '.education-row:nth-child(1) .education-period > span:last-child': '中国，广州',
    '.education-row:nth-child(2) h3 a': '广东工业大学',
    '.education-row:nth-child(2) .education-school': '信息工程学院',
    '.education-row:nth-child(2) .education-summary': '信息工程专业，工学学士，导师：<span>秦景辉教授</span>。',
    '.education-row:nth-child(2) .education-period > span:first-child': '2022年9月 — 2026年6月',
    '.education-row:nth-child(2) .education-period > span:last-child': '中国，广州',
  };

  const news = {
    'contest-voiceprint': '在讯飞 AI 算法赛「声纹迷雾：复杂场景说话人确认挑战赛」中获得<strong>第三名（国际排名 3/346）</strong>。',
    'paper-mff-net': '论文 <strong>MFF-Net</strong> 在线发表于 Expert Systems with Applications（ESWA）。',
    'contest-hyena': '在讯飞 AI 算法赛「野生鬣狗个体识别挑战赛」中获得<strong>第五名（国际排名 5/127）</strong>。',
    'contest-speaker': '在讯飞 AI 算法赛「角色分离转写挑战赛」中取得<strong>国际前三名</strong>。',
    'contest-substation': '在讯飞 AI 算法赛「高分辨率遥感影像变电站识别挑战赛」中获得<strong>第七名（国际排名 7/1465）</strong>。',
    'contest-multilingual': '在讯飞 AI 算法赛「受限场景多语言识别挑战赛」中获得<strong>第十名（国际排名 10/245）</strong>。',
    'contest-ptcg': '在 Kaggle 宝可梦 PTCG AI 对战模拟挑战赛中获得<strong>铜牌（国际排名 438/6807）</strong>。',
    'contest-rogii': '在 Kaggle ROGII 井筒地质预测竞赛中获得<strong>银牌（国际排名 124/6191）</strong>。',
    'contest-neurogolf': '在 Kaggle 2026 NeuroGolf 锦标赛中获得<strong>铜牌（国际排名 244/2963）</strong>。',
    'paper-scsd': '论文 <strong>SCSD</strong> 在线发表于 IEEE Transactions on Circuits and Systems for Video Technology（TCSVT）。',
    'paper-tdaf-net': '论文 <strong>TDAF-Net</strong> 发表于 CVPR 2026 Workshops。',
    'honor-graduation': '获评<strong>广东工业大学优秀毕业生</strong>及<strong>信息工程学院十佳优秀毕业生</strong>。',
    'paper-hlf-ciknet': '论文 <strong>HLF-CIKNet</strong> 在线发表于 Biomedical Signal Processing and Control（BSPC）。',
    'contest-svc': '在 CVPR 2026 微视觉计算挑战赛的多模态欺骗检测赛道中获得<strong>第三名</strong>。',
    'honor-top-ten': '获评<strong>广东工业大学十佳大学生</strong>。',
    'honor-scholarship': '获得<strong>国家奖学金</strong>。',
    'contest-drawing': '在 Kaggle 2025 大语言模型绘图挑战赛中获得<strong>银牌（国际排名 48/1313）</strong>。',
    'paper-afsp': '论文 <strong>Adaptive Few-shot Prompting</strong> 发表于 AAAI 2025。',
    'paper-pscnet': '论文 <strong>PSCNet</strong> 在线发表于 Applied Intelligence（APIN）。',
  };
  for (const [id, copy] of Object.entries(news)) {
    const selector = `[data-news-id="${id}"] > div`;
    const link = document.querySelector(selector)?.querySelector('a');
    let resource = '';
    if (link) {
      const translated = link.cloneNode(true);
      const label = link.textContent.trim().startsWith('Code') ? '代码' : '论文';
      translated.innerHTML = `${label} <span aria-hidden="true">↗</span>`;
      translated.setAttribute('aria-label', `${label}：${copy.replace(/<[^>]*>/g, '')}`);
      resource = ' ' + translated.outerHTML;
    }
    chinese[selector] = copy + resource;
  }

  const entries = Object.entries(chinese).flatMap(([selector, zh]) => {
    const element = document.querySelector(selector);
    return element ? [{element, en: element.innerHTML, zh}] : [];
  });
  const buttons = [...switcher.querySelectorAll('button')];
  let language;
  function selectLanguage(next, remember = false) {
    if (!['en', 'zh'].includes(next)) next = 'en';
    if (next === language) return;
    language = next;
    for (const entry of entries) {
      entry.element.innerHTML = entry[next];
      entry.element.lang = next === 'zh' ? 'zh-CN' : 'en';
    }
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
    document.documentElement.dataset.language = next;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.language === next));
    if (remember) {
      try { localStorage.setItem('homepage-language', next); } catch (_) { /* Storage may be disabled. */ }
      // Keep the current section and other query parameters when sharing a language.
      const url = new URL(location.href);
      url.searchParams.set('lang', next);
      try { history.replaceState(null, '', url); } catch (_) { /* file:// previews still switch. */ }
    }
    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new Event('homepage-language-change'));
  }
  let saved;
  try { saved = localStorage.getItem('homepage-language'); } catch (_) { /* Use English. */ }
  const requested = new URLSearchParams(location.search).get('lang');
  selectLanguage(['en', 'zh'].includes(requested) ? requested : saved);
  buttons.forEach(button => button.addEventListener('click', () => selectLanguage(button.dataset.language, true)));
  switcher.hidden = false;
})();
