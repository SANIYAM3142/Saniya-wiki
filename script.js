// Initialize wiki data with default home page
let wikiPages = JSON.parse(localStorage.getItem('wikiPages')) || {
  'Home': {
    content: '# Welcome to Saniya\'s Wiki\nThis is the home page. Click "Create New Page" to add content or select a page from the list below.\n\n```javascript\nconsole.log("Welcome to Saniya\'s Wiki!");\n```',
    author: 'Saniya.M'
  }
};

// Creator details
const creatorDetails = {
  name: 'Saniya.M',
  description: 'Creator of this wiki'
};

let currentPage = 'Home';

// DOM elements
const contentDiv = document.getElementById('pageContent');
const creatorInfoDiv = document.getElementById('creatorInfo');
const pageTitle = document.getElementById('pageTitle');
const pageAuthor = document.getElementById('pageAuthor');
const editBtn = document.getElementById('editBtn');
const shareBtn = document.getElementById('shareBtn');
const editorDiv = document.getElementById('editor');
const titleInput = document.getElementById('titleInput');
const contentInput = document.getElementById('contentInput');
const authorInput = document.getElementById('authorInput');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const createBtn = document.getElementById('createBtn');
const homeBtn = document.getElementById('homeBtn');
const pageListItems = document.getElementById('pageListItems');
const previewBtn = document.getElementById('previewBtn');
const previewDiv = document.getElementById('preview');

// Ensure Highlight.js is loaded before initializing
window.onload = function() {
  if (typeof hljs !== 'undefined') {
    hljs.highlightAll();
  } else {
    console.warn('Highlight.js not loaded');
  }

  // Render page content
  function renderPage(title) {
    if (!wikiPages[title]) {
      console.error('Page not found:', title);
      alert('Page not found. Loading Home page.');
      title = 'Home';
    }
    currentPage = title;
    pageTitle.textContent = title;
    contentDiv.innerHTML = marked.parse(wikiPages[title]?.content || '');
    pageAuthor.textContent = `Author: ${wikiPages[title]?.author || 'Unknown'}`;
    if (title === 'Home') {
      creatorInfoDiv.innerHTML = `
        <h3>Creator Info</h3>
        <p><strong>Name:</strong> ${creatorDetails.name}</p>
        <p>${creatorDetails.description}</p>
      `;
    } else {
      creatorInfoDiv.innerHTML = '';
    }
    editorDiv.classList.add('hidden');
    editBtn.classList.remove('hidden');
    contentDiv.classList.add('animate-fade-in');
    setTimeout(() => contentDiv.classList.remove('animate-fade-in'), 500);
    if (typeof hljs !== 'undefined') {
      hljs.highlightAll();
    }
    updatePageList();
    // Update URL with page parameter
    history.replaceState(null, '', `?page=${encodeURIComponent(title)}`);
  }

  // Update page list with thumbnails
  function updatePageList() {
    pageListItems.innerHTML = '';
    Object.keys(wikiPages).forEach(title => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.onclick = () => renderPage(title);
      const titleDiv = document.createElement('div');
      titleDiv.textContent = title;
      const snippet = document.createElement('div');
      snippet.textContent = wikiPages[title].content.split('\n')[0].replace(/^#+/, '').trim() || 'No content preview';
      a.appendChild(titleDiv);
      a.appendChild(snippet);
      li.appendChild(a);
      pageListItems.appendChild(li);
    });
  }

  // Show editor
  function showEditor(title, content, author) {
    titleInput.value = title;
    contentInput.value = content || '';
    authorInput.value = author || creatorDetails.name;
    editorDiv.classList.remove('hidden');
    editBtn.classList.add('hidden');
    previewDiv.classList.add('hidden');
  }

  // Toggle Markdown preview
  previewBtn.onclick = () => {
    if (previewDiv.classList.contains('hidden')) {
      previewDiv.innerHTML = marked.parse(contentInput.value || '');
      previewDiv.classList.remove('hidden');
      contentInput.classList.add('hidden');
      if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
      }
    } else {
      previewDiv.classList.add('hidden');
      contentInput.classList.remove('hidden');
    }
  };

  // Share page
  shareBtn.onclick = () => {
    const pageUrl = `${window.location.origin}${window.location.pathname}?page=${encodeURIComponent(currentPage)}`;
    const shareData = {
      title: `Saniya's Wiki: ${currentPage}`,
      text: `Check out the "${currentPage}" page on Saniya's Wiki!`,
      url: pageUrl
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('Shared successfully'))
        .catch(err => {
          console.error('Share failed:', err);
          fallbackCopyToClipboard(pageUrl);
        });
    } else {
      fallbackCopyToClipboard(pageUrl);
    }
  };

  // Fallback for copying URL to clipboard
  function fallbackCopyToClipboard(url) {
    navigator.clipboard.writeText(url)
      .then(() => alert('Page URL copied to clipboard! Paste it in WhatsApp or elsewhere to share.'))
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Copy failed. Please manually copy this URL: ' + url);
      });
  }

  // Save page with validation
  saveBtn.onclick = () => {
    const title = titleInput.value.trim();
    const content = contentInput.value;
    const author = authorInput.value.trim() || creatorDetails.name;

    if (!title) {
      alert('Please enter a page title.');
      return;
    }

    if (title === 'Home' && !confirm('Editing the Home page will overwrite its content. Continue?')) {
      return;
    }

    if (title !== 'Home' && wikiPages[title] && !confirm(`Page "${title}" already exists. Overwrite?`)) {
      return;
    }

    if (title && title !== 'Home') {
      wikiPages[title] = { content, author };
      localStorage.setItem('wikiPages', JSON.stringify(wikiPages));
      renderPage(title);
    } else if (title === 'Home') {
      wikiPages['Home'] = { content, author: wikiPages['Home'].author };
      localStorage.setItem('wikiPages', JSON.stringify(wikiPages));
      renderPage('Home');
    }
  };

  // Event listeners
  editBtn.onclick = () => showEditor(currentPage, wikiPages[currentPage]?.content, wikiPages[currentPage]?.author);
  createBtn.onclick = () => showEditor('', '', creatorDetails.name);
  cancelBtn.onclick = () => {
    editorDiv.classList.add('hidden');
    editBtn.classList.remove('hidden');
    previewDiv.classList.add('hidden');
    contentInput.classList.remove('hidden');
  };
  homeBtn.onclick = () => renderPage('Home');

  // Load page from URL parameter
  function loadPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page && wikiPages[page]) {
      renderPage(page);
    } else {
      renderPage('Home');
    }
  }

  // Initial render
  loadPageFromUrl();
};