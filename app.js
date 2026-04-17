const state = {
  items: [],
  currentIndex: 0,
  viewerMode: localStorage.getItem('tubeFactoryViewerMode') || 'detail',
};

const galleryEl = document.getElementById('gallery');
const lightboxEl = document.getElementById('lightbox');
const lightboxInnerEl = document.getElementById('lightbox-inner');
const toastEl = document.getElementById('toast');
const viewerButtons = {
  detail: document.getElementById('viewer-detail-btn'),
  fullscreen: document.getElementById('viewer-fullscreen-btn'),
};

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function showToast() {
  toastEl.classList.add('show');
  window.setTimeout(() => toastEl.classList.remove('show'), 2200);
}

async function copyPrompt(index) {
  await navigator.clipboard.writeText(state.items[index].prompt);
  showToast();
  const button = document.getElementById('lb-copy-btn');
  if (!button) return;

  const original = button.innerHTML;
  button.classList.add('copied');
  button.innerHTML = '<span>복사 완료!</span>';
  window.setTimeout(() => {
    button.classList.remove('copied');
    button.innerHTML = original;
  }, 1600);
}

function setViewerMode(mode) {
  state.viewerMode = mode === 'fullscreen' ? 'fullscreen' : 'detail';
  localStorage.setItem('tubeFactoryViewerMode', state.viewerMode);
  viewerButtons.detail.classList.toggle('active', state.viewerMode === 'detail');
  viewerButtons.fullscreen.classList.toggle('active', state.viewerMode === 'fullscreen');

  if (lightboxEl.classList.contains('active')) {
    renderLightbox(state.currentIndex);
  }
}

function renderCards() {
  galleryEl.innerHTML = state.items
    .map(
      (item, index) => `
        <article class="card" data-index="${index}">
          <div class="card-img-wrap">
            ${item.tag ? `<span class="tag-badge">${escapeHtml(item.tag)}</span>` : ''}
            <img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />
          </div>
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(item.name)}</h3>
            <p class="card-prompt">${escapeHtml(item.prompt)}</p>
            <button class="copy-btn" type="button" data-copy-index="${index}">프롬프트 복사</button>
          </div>
        </article>
      `,
    )
    .join('');
}

function renderLightbox(index) {
  const item = state.items[index];
  state.currentIndex = index;
  lightboxEl.classList.toggle('fullscreen-mode', state.viewerMode === 'fullscreen');

  if (state.viewerMode === 'fullscreen') {
    lightboxInnerEl.innerHTML = `
      <div class="lb-fullscreen">
        <div class="lb-fullscreen-media">
          <img src="${item.image}" alt="${escapeHtml(item.name)}" />
        </div>
        <div class="lb-fullscreen-bottom">
          <div class="lb-fullscreen-top">
            <div class="lb-fullscreen-title">
              <h2>${escapeHtml(item.name)}</h2>
              ${item.tag ? `<span class="lb-tag">${escapeHtml(item.tag)}</span>` : ''}
            </div>
            <button class="lb-copy-btn compact" id="lb-copy-btn" type="button">프롬프트 복사</button>
          </div>
          <p class="lb-fullscreen-prompt">${escapeHtml(item.prompt)}</p>
        </div>
      </div>
    `;
  } else {
    lightboxInnerEl.innerHTML = `
      <div class="lb-media">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" />
      </div>
      <div class="lb-info">
        <h2>${escapeHtml(item.name)}</h2>
        ${item.tag ? `<span class="lb-tag">${escapeHtml(item.tag)}</span>` : ''}
        <div class="lb-prompt-label">PROMPT</div>
        <p class="lb-prompt">${escapeHtml(item.prompt)}</p>
        <button class="lb-copy-btn" id="lb-copy-btn" type="button">프롬프트 복사</button>
      </div>
    `;
  }

  document.getElementById('lb-copy-btn')?.addEventListener('click', () => copyPrompt(index));
}

function openLightbox(index) {
  renderLightbox(index);
  lightboxEl.classList.add('active');
  document.body.classList.add('lock-scroll');
}

function closeLightbox() {
  lightboxEl.classList.remove('active', 'fullscreen-mode');
  document.body.classList.remove('lock-scroll');
}

function moveLightbox(step) {
  const next = (state.currentIndex + step + state.items.length) % state.items.length;
  renderLightbox(next);
}

async function init() {
  const response = await fetch('./data/gallery.json');
  const data = await response.json();
  state.items = data.items;

  document.getElementById('page-title').textContent = data.title;
  document.getElementById('page-subtitle').textContent = `${data.subtitle} | 카드를 클릭하면 크게 볼 수 있습니다`;

  renderCards();
  setViewerMode(state.viewerMode);

  galleryEl.addEventListener('click', (event) => {
    const copyButton = event.target.closest('[data-copy-index]');
    if (copyButton) {
      event.stopPropagation();
      copyPrompt(Number(copyButton.dataset.copyIndex));
      return;
    }

    const card = event.target.closest('.card');
    if (!card) return;
    openLightbox(Number(card.dataset.index));
  });

  viewerButtons.detail.addEventListener('click', () => setViewerMode('detail'));
  viewerButtons.fullscreen.addEventListener('click', () => setViewerMode('fullscreen'));
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', () => moveLightbox(-1));
  document.getElementById('lb-next').addEventListener('click', () => moveLightbox(1));

  lightboxEl.addEventListener('click', (event) => {
    if (event.target === lightboxEl) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightboxEl.classList.contains('active')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
}

init().catch((error) => {
  document.getElementById('page-subtitle').textContent = '갤러리 로딩에 실패했습니다.';
  console.error(error);
});
