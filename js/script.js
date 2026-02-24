/* ═══════════════════════════════════════════════════
   Kinetic Cards — Portfolio Interactions
   ═══════════════════════════════════════════════════ */

const GITHUB_USERNAME = 'YdvVipin';
const GITHUB_API = 'https://api.github.com';

// ─── Base path for multi-page navigation ──────────
const BASE = document.body.dataset.basePath || '';

// ─── Local Project Detail Pages ───────────────────
const LOCAL_PROJECTS = [
  { name: 'QA Automation AI Enabler', path: 'projects/ai-enabled-qa/', desc: '50K+ LOC platform with 72 FastAPI endpoints, 18 AI agents, React dashboard', tags: ['Python', 'React', 'FastAPI'], category: 'ai-platforms' },
  { name: 'Playwright BDD Framework', path: 'projects/playwright-bdd-framework/', desc: 'TypeScript BDD framework with 3 AI agents and 9-tier intelligent locator system', tags: ['TypeScript', 'Playwright'], category: 'qa-frameworks' },
  { name: 'Multi-Agent Orchestration', path: 'projects/multi-agent-orchestration/', desc: '5 specialized agents with 5 MCP servers using CrewAI and LangChain', tags: ['Python', 'CrewAI'], category: 'ai-platforms' },
  { name: 'QA RAG System', path: 'projects/rag-system/', desc: '25+ data collectors with FAISS vector search for intelligent QA knowledge retrieval', tags: ['Python', 'FAISS'], category: 'ai-ml' },
  { name: 'GenAI QA Automation', path: 'projects/genai-qa-automation/', desc: 'Generative AI powered test case generation and execution pipeline', tags: ['Python', 'AI/ML'], category: 'ai-ml' },
  { name: 'AI-Enabled API Automation', path: 'projects/ai-enabled-api-automation/', desc: 'BDD framework with AI-driven API testing, Allure reports, and schema validation', tags: ['Python', 'BDD'], category: 'qa-frameworks' },
  { name: 'AI Gig Discovery', path: 'projects/gig-flow/', desc: 'AI-powered freelance gig discovery automation using Claude API', tags: ['Python', 'Claude API'], category: 'ai-ml' },
  { name: 'JIRA Data Analysis', path: 'projects/jira-data-analysis/', desc: 'Prophet forecasting and NLP analysis on Jira project data', tags: ['Python', 'NLP'], category: 'data-intelligence' },
  { name: 'Jira-TestRail Integration', path: 'projects/JiraTestRailIntegration/', desc: 'Jira to TestRail sync with Grok AI achieving 98% accuracy', tags: ['Python', 'Grok AI'], category: 'data-intelligence' },
  { name: 'E-Commerce Testing', path: 'projects/qa-automation-1/', desc: 'End-to-end e-commerce test automation suite', tags: ['Selenium', 'Java'], category: 'qa-frameworks' },
  { name: 'API Testing Suite', path: 'projects/qa-automation-2/', desc: 'Comprehensive API testing framework with data-driven approach', tags: ['REST', 'Python'], category: 'qa-frameworks' },
];

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', 'C#': '#178600',
  Ruby: '#701516', Go: '#00ADD8', Rust: '#dea584', PHP: '#4F5D95',
  Swift: '#F05138', Kotlin: '#A97BFF', Shell: '#89e051', Dart: '#00B4AB',
  'Jupyter Notebook': '#DA5B0B', Vue: '#41b883', Dockerfile: '#384d54',
  SCSS: '#c6538c', Makefile: '#427819',
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || '#9CA3AF';
}

// ─── Init ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollAnimations();
  initCardTilt();
  initCounters();
  initFilters();
  initThemeToggle();
  loadGitHubData();
  renderLocalProjects();
  initVideoPlayers();
});

// ─── Theme Toggle (Light/Dark) ───────────────────
function initThemeToggle() {
  const root = document.documentElement;
  const toggleKey = 'vipin-theme';
  const stored = window.localStorage.getItem(toggleKey);

  if (stored === 'dark') {
    root.classList.add('kc-theme--dark');
  }

  const nav = document.querySelector('.kc-nav__inner');
  if (!nav) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'kc-theme-toggle';
  btn.setAttribute('aria-label', 'Toggle theme');
  btn.innerHTML = '<span class="kc-theme-toggle__icon">☾</span>';

  btn.addEventListener('click', () => {
    const isDark = root.classList.toggle('kc-theme--dark');
    window.localStorage.setItem(toggleKey, isDark ? 'dark' : 'light');
  });

  nav.appendChild(btn);
}

// ─── Navigation ───────────────────────────────────
function initNav() {
  const nav = document.querySelector('.kc-nav');
  const hamburger = document.querySelector('.kc-nav__hamburger');
  const links = document.querySelector('.kc-nav__links');

  if (!nav) return;

  // Scroll shrink
  window.addEventListener('scroll', () => {
    nav.classList.toggle('kc-nav--scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && links) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      links.classList.toggle('open');
    });

    // Close on link click (mobile)
    links.querySelectorAll('.kc-nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  // Active link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.kc-nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && href === BASE + 'index.html') || (currentPage === '' && href === BASE + 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ─── Scroll Animations ───────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('kc-fade--visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.kc-fade:not(.kc-fade--visible)').forEach(el => {
    observer.observe(el);
  });
}

// ─── 3D Card Tilt ─────────────────────────────────
function initCardTilt() {
  // Disable on touch devices
  if ('ontouchstart' in window) return;

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = '';
  };

  document.querySelectorAll('.kc-card, .kc-skill-card').forEach(card => {
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
  });
}

// ─── Counter Animations ──────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.kc-stat__value');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const text = el.dataset.target || el.textContent;
  const suffix = text.replace(/[\d,]/g, '');
  const target = parseInt(text.replace(/\D/g, ''), 10);

  if (isNaN(target)) return;

  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);

    el.textContent = current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

// ─── Filter Bar ───────────────────────────────────
function initFilters() {
  const filters = document.querySelectorAll('.kc-filter');
  if (filters.length === 0) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      // Toggle active state
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      const cards = document.querySelectorAll('.kc-card[data-category]');
      cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.classList.remove('kc-card--hidden');
        } else {
          card.classList.add('kc-card--hidden');
        }
      });
    });
  });
}

// ─── GitHub API ───────────────────────────────────
async function loadGitHubData() {
  const statsEl = document.getElementById('github-stats');
  const gridEl = document.getElementById('repo-grid');

  if (!statsEl && !gridEl) return;

  try {
    const [profile, repos] = await Promise.all([
      fetchJSON(`${GITHUB_API}/users/${GITHUB_USERNAME}`),
      fetchJSON(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`)
    ]);

    if (statsEl) renderProfileStats(profile);
    if (gridEl) renderRepos(repos);

    // Fetch languages in parallel
    if (gridEl) {
      const langPromises = repos.filter(r => !r.fork).map(repo =>
        fetchJSON(repo.languages_url).then(langs => ({ name: repo.name, langs }))
      );
      const langResults = await Promise.all(langPromises);
      const langMap = {};
      langResults.forEach(r => { langMap[r.name] = r.langs; });
      updateRepoLanguages(langMap);
    }
  } catch (err) {
    console.error('GitHub API error:', err);
    showAPIError();
  }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function renderProfileStats(profile) {
  const container = document.getElementById('github-stats');
  if (!container) return;

  container.innerHTML = `
    <div class="kc-gh-stat">
      <span class="kc-gh-stat__val">${profile.public_repos}</span>
      <span class="kc-gh-stat__label">Repositories</span>
    </div>
    <div class="kc-gh-stat">
      <span class="kc-gh-stat__val">${profile.followers}</span>
      <span class="kc-gh-stat__label">Followers</span>
    </div>
    <div class="kc-gh-stat">
      <span class="kc-gh-stat__val">${profile.following}</span>
      <span class="kc-gh-stat__label">Following</span>
    </div>
  `;
}

function renderRepos(repos) {
  const grid = document.getElementById('repo-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const filtered = repos.filter(r => !r.fork);

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="kc-gh-empty">No public repositories found.</p>';
    return;
  }

  filtered.forEach((repo) => {
    const card = document.createElement('a');
    card.href = repo.html_url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.className = 'kc-repo kc-fade';

    const timeAgo = getTimeAgo(new Date(repo.updated_at));

    card.innerHTML = `
      <div class="kc-repo__header">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="color:var(--kc-text3)">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>
        </svg>
        <span class="kc-repo__name">${repo.name}</span>
      </div>
      <p class="kc-repo__desc">${repo.description || 'No description provided'}</p>
      <div class="kc-repo__meta">
        <div class="kc-repo__lang" data-repo="${repo.name}">
          ${repo.language ? `<span class="kc-lang-dot" style="background:${getLangColor(repo.language)}"></span> ${repo.language}` : ''}
        </div>
        <div class="kc-repo__stats">
          ${repo.stargazers_count > 0 ? `<span class="kc-repo__stat"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg> ${repo.stargazers_count}</span>` : ''}
          ${repo.forks_count > 0 ? `<span class="kc-repo__stat"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.878a.25.25 0 0 1-.25.25h-1.5V2.25a.75.75 0 0 0-1.5 0v4.25h-1.5a.25.25 0 0 1-.25-.25v-.878a2.25 2.25 0 1 0-1.5 0ZM7.25 1.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM5 12.75v.878a2.25 2.25 0 1 0 1.5 0v-.878a.25.25 0 0 1 .25-.25h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.878a.25.25 0 0 1-.25.25h-4.5a.75.75 0 0 0-.75.75Z"/></svg> ${repo.forks_count}</span>` : ''}
          <span class="kc-repo__stat kc-repo__size">${formatSize(repo.size)}</span>
        </div>
      </div>
      <div class="kc-repo__footer">Updated ${timeAgo}</div>
    `;

    grid.appendChild(card);
  });

  // Re-observe new fade targets
  initScrollAnimations();
}

function updateRepoLanguages(langMap) {
  Object.entries(langMap).forEach(([repoName, langs]) => {
    const el = document.querySelector(`.kc-repo__lang[data-repo="${repoName}"]`);
    if (!el || !langs || Object.keys(langs).length === 0) return;

    const total = Object.values(langs).reduce((a, b) => a + b, 0);
    const entries = Object.entries(langs).slice(0, 4);

    const barHTML = `<div class="kc-lang-bar">${entries.map(([lang, bytes]) => {
      const pct = ((bytes / total) * 100).toFixed(1);
      return `<div class="kc-lang-bar__seg" style="width:${pct}%;background:${getLangColor(lang)}" title="${lang} ${pct}%"></div>`;
    }).join('')}</div>`;

    const labelsHTML = entries.map(([lang, bytes]) => {
      const pct = ((bytes / total) * 100).toFixed(1);
      return `<span class="kc-lang-label"><span class="kc-lang-dot" style="background:${getLangColor(lang)}"></span>${lang} <span class="kc-lang-pct">${pct}%</span></span>`;
    }).join('');

    el.innerHTML = barHTML + `<div class="kc-lang-labels">${labelsHTML}</div>`;
  });
}

function showAPIError() {
  const grid = document.getElementById('repo-grid');
  if (grid) {
    grid.innerHTML = '<p class="kc-gh-error">Unable to load repositories. GitHub API rate limit may be exceeded.</p>';
  }
}

// ─── Local Project Cards ──────────────────────────
function renderLocalProjects() {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  grid.innerHTML = '';

  LOCAL_PROJECTS.forEach((project) => {
    const card = document.createElement('a');
    card.href = BASE + project.path;
    card.className = 'kc-card kc-fade';
    card.dataset.category = project.category;

    const tagsHTML = project.tags.map(tag =>
      `<span class="kc-card__tag" style="border-color:${getLangColor(tag)};color:${getLangColor(tag)}">${tag}</span>`
    ).join('');

    card.innerHTML = `
      <div class="kc-card__icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </div>
      <h3 class="kc-card__title">${project.name}</h3>
      <p class="kc-card__desc">${project.desc}</p>
      <div class="kc-card__tags">${tagsHTML}</div>
      <div class="kc-card__cta">
        View Details
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
    `;

    grid.appendChild(card);
  });

  // Re-init animations and tilt for new cards
  initScrollAnimations();
  initCardTilt();
}

// ─── Helpers ──────────────────────────────────────
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

function formatSize(kb) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

// ─── Video Player ─────────────────────────────────
function initVideoPlayers() {
  document.querySelectorAll('.kc-video').forEach(container => {
    const video = container.querySelector('video');
    const poster = container.querySelector('.kc-video__poster');
    const playPauseBtn = container.querySelector('.kc-video__play-pause');
    const progress = container.querySelector('.kc-video__progress');
    const progressBar = container.querySelector('.kc-video__progress-bar');
    const timeDisplay = container.querySelector('.kc-video__time');

    if (!video) return;

    // Click poster to play (lazy load)
    if (poster) {
      poster.addEventListener('click', () => {
        const src = video.dataset.src;
        if (src && !video.src) {
          video.src = src;
          video.load();
        }
        video.play();
        poster.classList.add('hidden');
      });
    }

    // Play/Pause toggle
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
          video.play();
          if (poster) poster.classList.add('hidden');
        } else {
          video.pause();
        }
      });
    }

    // Progress bar update
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        if (progressBar) progressBar.style.width = pct + '%';
        if (timeDisplay) {
          const cur = formatVideoTime(video.currentTime);
          const dur = formatVideoTime(video.duration);
          timeDisplay.textContent = cur + ' / ' + dur;
        }
      }
    });

    // Click progress bar to seek
    if (progress) {
      progress.addEventListener('click', (e) => {
        const rect = progress.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        video.currentTime = pct * video.duration;
      });
    }

    // Reset on end
    video.addEventListener('ended', () => {
      if (poster) poster.classList.remove('hidden');
      if (progressBar) progressBar.style.width = '0%';
    });
  });
}

function formatVideoTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}
