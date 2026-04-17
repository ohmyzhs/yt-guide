import { promptLibrary } from './data/prompts.js';

const state = {
  activeCategoryId: promptLibrary.categories[0]?.id ?? '',
  activePromptId: promptLibrary.categories[0]?.prompts[0]?.id ?? '',
  query: '',
};

const categoryNavEl = document.getElementById('category-nav');
const promptListEl = document.getElementById('prompt-list');
const promptCountEl = document.getElementById('prompt-count');
const searchInputEl = document.getElementById('search-input');
const detailTitleEl = document.getElementById('detail-title');
const detailCategoryEl = document.getElementById('detail-category');
const detailDescriptionEl = document.getElementById('detail-description');
const detailMetaEl = document.getElementById('detail-meta');
const detailContentEl = document.getElementById('detail-content');
const copyPromptBtnEl = document.getElementById('copy-prompt-btn');
const copyFullBtnEl = document.getElementById('copy-full-btn');
const mobileCategorySelectEl = document.getElementById('mobile-category-select');
const emptyStateEl = document.getElementById('empty-state');
const detailPanelEl = document.getElementById('detail-panel');
const toastEl = document.getElementById('toast');

function flattenPrompts() {
  return promptLibrary.categories.flatMap((category) =>
    category.prompts.map((prompt) => ({ ...prompt, categoryId: category.id, categoryName: category.name })),
  );
}

function getPromptById(promptId) {
  return flattenPrompts().find((prompt) => prompt.id === promptId);
}

function getFilteredPrompts(categoryId, query) {
  const normalized = query.trim().toLowerCase();
  const category = promptLibrary.categories.find((item) => item.id === categoryId);
  if (!category) return [];

  if (!normalized) {
    return category.prompts;
  }

  return category.prompts.filter((prompt) => {
    const haystack = `${prompt.title} ${prompt.summary} ${prompt.content}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toastEl.classList.remove('show'), 1800);
}

async function copyText(text, message) {
  await navigator.clipboard.writeText(text);
  showToast(message);
}

function renderCategories() {
  categoryNavEl.innerHTML = promptLibrary.categories
    .map(
      (category) => `
        <button
          class="category-link ${category.id === state.activeCategoryId ? 'active' : ''}"
          type="button"
          data-category-id="${category.id}"
        >
          <span>${escapeHtml(category.name)}</span>
          <strong>${category.prompts.length}</strong>
        </button>
      `,
    )
    .join('');

  mobileCategorySelectEl.innerHTML = promptLibrary.categories
    .map(
      (category) => `
        <option value="${category.id}" ${category.id === state.activeCategoryId ? 'selected' : ''}>
          ${escapeHtml(category.name)} (${category.prompts.length})
        </option>
      `,
    )
    .join('');
}

function renderPromptList() {
  const filteredPrompts = getFilteredPrompts(state.activeCategoryId, state.query);
  promptCountEl.textContent = `${filteredPrompts.length}개`;

  if (!filteredPrompts.length) {
    promptListEl.innerHTML = '';
    emptyStateEl.hidden = false;
    detailPanelEl.hidden = true;
    return;
  }

  emptyStateEl.hidden = true;
  detailPanelEl.hidden = false;

  if (!filteredPrompts.some((prompt) => prompt.id === state.activePromptId)) {
    state.activePromptId = filteredPrompts[0].id;
  }

  promptListEl.innerHTML = filteredPrompts
    .map(
      (prompt) => `
        <button
          class="prompt-link ${prompt.id === state.activePromptId ? 'active' : ''}"
          type="button"
          data-prompt-id="${prompt.id}"
        >
          <span class="prompt-link-title">${escapeHtml(prompt.title)}</span>
          <span class="prompt-link-summary">${escapeHtml(prompt.summary)}</span>
        </button>
      `,
    )
    .join('');
}

function renderPromptDetail() {
  const activePrompt = getPromptById(state.activePromptId);
  if (!activePrompt) return;

  detailTitleEl.textContent = activePrompt.title;
  detailCategoryEl.textContent = activePrompt.categoryName;
  detailDescriptionEl.textContent = activePrompt.summary;
  detailMetaEl.textContent = `${activePrompt.tags.join(' · ')} · ${activePrompt.content.split('\n').length} lines`;
  detailContentEl.textContent = activePrompt.content.trim();

  copyPromptBtnEl.onclick = () => copyText(activePrompt.content.trim(), '프롬프트를 복사했습니다.');
  copyFullBtnEl.onclick = () =>
    copyText(
      `${activePrompt.title}\n\n${activePrompt.content.trim()}`,
      '제목과 프롬프트를 함께 복사했습니다.',
    );
}

function render() {
  renderCategories();
  renderPromptList();
  renderPromptDetail();
}

categoryNavEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category-id]');
  if (!button) return;

  state.activeCategoryId = button.dataset.categoryId;
  state.query = '';
  searchInputEl.value = '';
  state.activePromptId = getFilteredPrompts(state.activeCategoryId, '')[0]?.id ?? '';
  render();
});

promptListEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-prompt-id]');
  if (!button) return;

  state.activePromptId = button.dataset.promptId;
  render();
});

searchInputEl.addEventListener('input', (event) => {
  state.query = event.target.value;
  render();
});

mobileCategorySelectEl.addEventListener('change', (event) => {
  state.activeCategoryId = event.target.value;
  state.query = '';
  searchInputEl.value = '';
  state.activePromptId = getFilteredPrompts(state.activeCategoryId, '')[0]?.id ?? '';
  render();
});

render();
