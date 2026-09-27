(() => {
  const card = document.querySelector('[data-contribution-chart]');
  if (!card) return;
  const collections = [
    {id: 'publications', label: 'Publications', color: '#c49545', light: '#e9d3ab', selector: '.paper:not([data-placeholder="true"])'},
    {id: 'projects', label: 'Code projects', color: '#579f96', light: '#a8d4c9', selector: '.project-card'},
    {id: 'research', label: 'Intellectual property', color: '#cf9292', light: '#efd0cc', selector: '.record-list > li'},
    {id: 'awards', label: 'Awards & honors', color: '#dedede', light: '#f0f0f0', selector: '.award-list > li'},
  ];
  const tabs = [...card.querySelectorAll('[role="tab"]')];
  const panel = card.querySelector('[role="tabpanel"]');
  const plot = card.querySelector('.contribution-plot');
  const svg = card.querySelector('svg');
  const tooltip = card.querySelector('.contribution-tooltip');
  const ns = 'http://www.w3.org/2000/svg';
  let selected = 'all';
  let collectionsData = [];
  let years = [];
  let frame;

  function node(tag, attrs, text) {
    const element = document.createElementNS(ns, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => element.setAttribute(key, value));
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function readItems() {
    collectionsData = collections.map(collection => {
      const section = document.getElementById(collection.id);
      const items = [...section.querySelectorAll(collection.selector)];
      const records = items.map(item => {
        const time = item.querySelector('time');
        const value = item.dataset.year || time?.getAttribute('datetime') || time?.textContent || '';
        const match = value.trim().match(/^(\d{4})(?:\D|$)/);
        return match ? Number(match[1]) : null;
      });
      // Keep the existing heading totals in sync with the same source entries.
      const total = section.querySelector('.section-count-value');
      if (total) total.textContent = items.length;
      return {...collection, records};
    });
    const dated = collectionsData.flatMap(collection => collection.records).filter(year => year !== null);
    const start = dated.length ? Math.min(...dated) : new Date().getFullYear();
    const end = dated.length ? Math.max(...dated) : start;
    years = Array.from({length: end - start + 1}, (_, index) => start + index);
    draw();
  }
  function draw() {
    tooltip.hidden = true;
    const active = selected === 'all' ? collectionsData : collectionsData.filter(item => item.id === selected);
    const records = active.flatMap(item => item.records);
    const values = years.map(year => {
      const parts = active.map(item => ({...item, count: item.records.filter(value => value === year).length}));
      const annual = parts.reduce((sum, part) => sum + part.count, 0);
      return {year, annual, parts};
    });
    const label = selected === 'all' ? 'All contributions' : active[0].label;
    const heading = card.querySelector('.contribution-view-title');
    const chinese = document.documentElement.dataset.language === 'zh';
    heading.textContent = chinese ? (selected === 'all' ? '全部成果' : tabs.find(tab => tab.dataset.category === selected).textContent) : label;
    heading.lang = chinese ? 'zh-CN' : 'en';
    card.querySelector('.contribution-total strong').textContent = records.length;
    const legend = card.querySelector('.contribution-legend');
    legend.replaceChildren(...active.map(item => {
      const entry = document.createElement('span');
      const swatch = document.createElement('i');
      swatch.className = 'contribution-bar-key';
      swatch.style.background = `linear-gradient(135deg, ${item.light}, ${item.color})`;
      swatch.setAttribute('aria-hidden', 'true');
      entry.append(swatch, item.label);
      return entry;
    }));
    const lineKey = document.createElement('span');
    lineKey.innerHTML = '<i class="contribution-line-key" aria-hidden="true"></i>Annual total';
    legend.append(lineKey);
    const missing = records.filter(year => year === null).length;
    const note = card.querySelector('.contribution-missing');
    note.hidden = missing === 0;
    note.textContent = `${missing} undated ${missing === 1 ? 'entry is' : 'entries are'} included in the total but excluded from the yearly chart.`;
    panel.setAttribute('aria-labelledby', `contribution-tab-${selected}`);
    const width = Math.max(200, Math.round(plot.clientWidth));
    const height = width < 450 ? 220 : 240;
    const margin = {top: 28, right: 16, bottom: 32, left: 36};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const maximum = Math.max(1, ...values.map(value => value.annual));
    const rawStep = maximum / 4;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const step = Math.max(1, Math.ceil([1, 2, 2.5, 5, 10].find(value => value * magnitude >= rawStep) * magnitude));
    const ceiling = Math.ceil(maximum / step) * step;
    const slot = innerWidth / values.length;
    const barWidth = Math.min(58, slot * 0.45);
    const x = index => margin.left + slot * (index + 0.5);
    const y = value => height - margin.bottom - (value / ceiling) * innerHeight;
    svg.replaceChildren();
    const definitions = node('defs');
    active.forEach(item => {
      const gradient = node('linearGradient', {id: `contribution-gradient-${item.id}`, x1: '0%', y1: '0%', x2: '100%', y2: '100%'});
      gradient.append(node('stop', {offset: '0%', 'stop-color': item.light}), node('stop', {offset: '100%', 'stop-color': item.color}));
      definitions.append(gradient);
    });
    svg.append(definitions);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', height);
    svg.setAttribute('aria-label', `${label}: ${records.length} entries. Bar colors identify contribution categories; the line connects annual totals at the bar tops.`);
    svg.append(node('text', {x: margin.left, y: 15, class: 'chart-axis-title'}, 'Contributions'));
    for (let tick = 0; tick <= ceiling + step / 2; tick += step) {
      svg.append(node('line', {x1: margin.left, x2: width - margin.right, y1: y(tick), y2: y(tick), class: 'chart-grid'}));
      svg.append(node('text', {x: margin.left - 12, y: y(tick) + 4, 'text-anchor': 'end', class: 'chart-axis-label'}, tick));
    }
    values.forEach((value, index) => {
      let stacked = 0;
      value.parts.forEach(part => {
        const barHeight = part.count / ceiling * innerHeight;
        stacked += part.count;
        if (!part.count) return;
        const segment = node('rect', {x: x(index) - barWidth / 2, y: y(stacked), width: barWidth, height: barHeight, class: 'chart-bar', 'data-category': part.id, 'data-count': part.count, 'data-year': value.year});
        segment.style.fill = `url(#contribution-gradient-${part.id})`;
        segment.append(node('title', {}, `${part.label}: ${part.count}`));
        svg.append(segment);
        if (selected === 'all' && barHeight >= 16 && barWidth >= 22) {
          svg.append(node('text', {x: x(index), y: y(stacked) + barHeight / 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'chart-segment-label'}, part.count));
        }
      });
      svg.append(node('text', {x: x(index), y: y(value.annual) - 10, 'text-anchor': 'middle', class: 'chart-bar-label'}, value.annual));
    });
    svg.append(node('path', {d: values.map((value, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(value.annual)}`).join(' '), class: 'chart-line'}));
    values.forEach((value, index) => {
      svg.append(node('circle', {cx: x(index), cy: y(value.annual), r: 4, class: 'chart-point'}));
      svg.append(node('text', {x: x(index), y: height - 13, 'text-anchor': 'middle', class: 'chart-axis-label'}, value.year));
      const summary = `${value.year}: ${value.annual} ${value.annual === 1 ? 'contribution' : 'contributions'}`;
      const breakdown = value.parts.map(part => `${part.label}: ${part.count}`).join('; ');
      const group = node('g', {tabindex: 0, role: 'img', 'aria-label': `${summary}. ${breakdown}`, class: 'chart-year'});
      group.append(node('rect', {x: margin.left + slot * index, y: margin.top - 8, width: slot, height: innerHeight + 30, class: 'chart-hit'}));
      const showTooltip = () => {
        const heading = document.createElement('strong');
        heading.textContent = `${value.year} · Total ${value.annual}`;
        tooltip.replaceChildren(heading, ...value.parts.map(part => {
          const row = document.createElement('span');
          row.className = 'chart-tooltip-row';
          const swatch = document.createElement('i');
          swatch.style.background = `linear-gradient(135deg, ${part.light}, ${part.color})`;
          const name = document.createElement('span');
          name.textContent = part.label;
          const count = document.createElement('b');
          count.textContent = part.count;
          row.append(swatch, name, count);
          return row;
        }));
        tooltip.hidden = false;
        tooltip.style.left = `${Math.max(0, Math.min(width - tooltip.offsetWidth, x(index) - tooltip.offsetWidth / 2))}px`;
      };
      group.addEventListener('pointerenter', showTooltip);
      group.addEventListener('pointerleave', () => { tooltip.hidden = true; });
      group.addEventListener('focus', showTooltip);
      group.addEventListener('blur', () => { tooltip.hidden = true; });
      group.addEventListener('click', showTooltip);
      group.addEventListener('keydown', event => { if (event.key === 'Escape') tooltip.hidden = true; });
      svg.append(group);
    });
    const header = card.querySelector('thead tr');
    header.replaceChildren(...['Year', ...active.map(item => item.label), ...(selected === 'all' ? ['Total'] : [])].map(label => {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = label;
      return cell;
    }));
    const tbody = card.querySelector('tbody');
    tbody.replaceChildren(...values.map(value => {
      const row = document.createElement('tr');
      [value.year, ...value.parts.map(part => part.count), ...(selected === 'all' ? [value.annual] : [])].forEach((number, index) => {
        const cell = document.createElement(index ? 'td' : 'th');
        if (!index) cell.scope = 'row';
        cell.textContent = number;
        row.append(cell);
      });
      return row;
    }));
  }
  function select(tab) {
    selected = tab.dataset.category;
    tabs.forEach(button => {
      const active = button === tab;
      button.setAttribute('aria-selected', active);
      button.tabIndex = active ? 0 : -1;
    });
    draw();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next]);
      tabs[next].focus();
    });
  });
  const refresh = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(readItems); };
  const observer = new MutationObserver(mutations => {
    const relevant = mutations.some(mutation => {
      if (mutation.type === 'attributes') return true;
      if (mutation.target.parentElement?.closest('time') || mutation.target.closest?.('time')) return true;
      return [...mutation.addedNodes, ...mutation.removedNodes].some(element => element.nodeType === 1 && (element.matches('time, .paper, .project-card, li') || element.querySelector('time, .paper, .project-card, li')));
    });
    if (relevant) refresh();
  });
  collections.forEach(collection => observer.observe(document.getElementById(collection.id), {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['datetime', 'data-year']}));
  let lastWidth = 0;
  new ResizeObserver(entries => {
    const width = Math.round(entries[0].contentRect.width);
    if (width !== lastWidth) { lastWidth = width; draw(); }
  }).observe(plot);
  document.addEventListener('homepage-language-change', draw);
  readItems();
})();
