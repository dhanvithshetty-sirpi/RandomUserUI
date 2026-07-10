const API_URL = 'https://randomuser.me/api/?results=10';
const LS_FAVORITES_KEY = 'randomUserFavorites';

let allUsers = [];
let favorites = loadFavorites();

const usersContainer = document.getElementById('usersContainer');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const generateBtn = document.getElementById('generateBtn');
const retryBtn = document.getElementById('retryBtn');
const searchInput = document.getElementById('searchInput');
const genderFilter = document.getElementById('genderFilter');
const favoritesOnly = document.getElementById('favoritesOnly');
const favCount = document.getElementById('favCount');

function loadFavorites() {
  try {
    const data = localStorage.getItem(LS_FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify(favorites));
}

function showLoading() {
  loadingEl.classList.remove('hidden');
  usersContainer.innerHTML = '';
  errorEl.classList.add('hidden');
}

function hideLoading() {
  loadingEl.classList.add('hidden');
}

function showError(message) {
  errorMessage.textContent = message || 'Failed to fetch users. Please try again.';
  errorEl.classList.remove('hidden');
  loadingEl.classList.add('hidden');
}

function formatUser(user) {
  return {
    id: user.login.uuid,
    picture: user.picture.large,
    title: user.name.title,
    firstName: user.name.first,
    lastName: user.name.last,
    email: user.email,
    phone: user.phone,
    age: user.dob.age,
    country: user.location.country,
    gender: user.gender,
  };
}

function renderUsers(users) {
  if (!users.length) {
    usersContainer.innerHTML = '<p class="no-results">No users match your criteria.</p>';
    return;
  }

  usersContainer.innerHTML = users.map(user => {
    const isFav = favorites.includes(user.id);
    return `
      <div class="user-card ${isFav ? 'card-favorited' : ''}" data-id="${user.id}">
        <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${user.id}" aria-label="Toggle favorite">
          ${isFav ? '★' : '☆'}
        </button>
        <div class="card-header">
          <img class="card-avatar" src="${user.picture}" alt="${user.firstName} ${user.lastName}" loading="lazy">
          <div class="card-name">${user.title} ${user.firstName} ${user.lastName}</div>
        </div>
        <div class="card-details">
          <div class="card-detail">
            <span class="icon">✉</span>
            <span>${user.email}</span>
          </div>
          <div class="card-detail">
            <span class="icon">📞</span>
            <span>${user.phone}</span>
          </div>
          <div class="card-detail">
            <span class="icon">🎂</span>
            <span>${user.age} years old</span>
          </div>
          <div class="card-detail">
            <span class="icon">🌍</span>
            <span>${user.country}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.id);
    });
  });
}

function toggleFavorite(userId) {
  const idx = favorites.indexOf(userId);
  if (idx === -1) {
    favorites.push(userId);
  } else {
    favorites.splice(idx, 1);
  }
  saveFavorites();
  applyFilters();
}

function updateFavCount() {
  const count = allUsers.filter(u => favorites.includes(u.id)).length;
  favCount.textContent = count;
  favCount.classList.toggle('empty', count === 0);
}

function applyFilters() {
  let filtered = [...allUsers];

  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(query)
    );
  }

  const gender = genderFilter.value;
  if (gender !== 'all') {
    filtered = filtered.filter(u => u.gender === gender);
  }

  if (favoritesOnly.checked) {
    filtered = filtered.filter(u => favorites.includes(u.id));
  }

  renderUsers(filtered);
  updateFavCount();
}

async function fetchUsers() {
  showLoading();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allUsers = data.results.map(formatUser);
    hideLoading();
    errorEl.classList.add('hidden');
    applyFilters();
  } catch (err) {
    hideLoading();
    showError(err.message || 'Failed to fetch users. Please try again.');
    allUsers = [];
    usersContainer.innerHTML = '';
  }
}

generateBtn.addEventListener('click', fetchUsers);
retryBtn.addEventListener('click', fetchUsers);

searchInput.addEventListener('input', () => {
  if (allUsers.length) applyFilters();
});

genderFilter.addEventListener('change', () => {
  if (allUsers.length) applyFilters();
});

favoritesOnly.addEventListener('change', () => {
  if (allUsers.length) applyFilters();
});

document.addEventListener('DOMContentLoaded', fetchUsers);
