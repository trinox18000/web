// ==========================================
// LISTE DES JEUX (AJOUTE LES NOUVEAUX EN HAUT)
// ==========================================
const gamesData = [
    {
        title: "Stalker 2 : Heart of Chornobyl",
        url: "pages-jeux/stalker2.html",
        image: "assets/stalker2/images/cover.jpg",
        description: "Plongez dans la Zone d'exclusion de Tchernobyl dans ce jeu de tir et de survie.",
        tag: "Survie / FPS / Horreur",
        styleData: "survival fps horror",
        searchData: "stalker 2 heart of chornobyl"
    },
    {
        title: "Beast of Reincarnation",
        url: "pages-jeux/Beast-of-Reincarnation.html",
        image: "assets/Beast-of-Reincarnation/images/cover.jpg",
        description: "Explorez un monde post-apocalyptique à travers un voyage aux côtés d'une paria et de son chien, combinant tour par tour et temps réel.",
        tag: "Action / Aventure / RPG",
        styleData: "action aventure rpg",
        searchData: "Beast of Reincarnation"
    }
];

// PARAMÈTRES DE PAGINATION
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let currentFilteredGames = [...gamesData];

// ÉCOUTEURS D'ÉVÉNEMENTS (RECHERCHE ET FILTRES)
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById('searchInput');
    
    // Filtre dynamique avec la barre de recherche
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();
            currentFilteredGames = gamesData.filter(game => 
                game.title.toLowerCase().includes(query) || 
                game.searchData.toLowerCase().includes(query) ||
                game.tag.toLowerCase().includes(query)
            );
            currentPage = 1;
            renderGames();
        });
    }

    // Premier rendu au chargement
    renderGames();
});

// GÉNÉRATION DES CARTES DANS LE DOM
function renderGames() {
    const container = document.getElementById('gamesContainer');
    if (!container) return;

    // Calcul des jeux à afficher sur la page actuelle
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const gamesToShow = currentFilteredGames.slice(startIndex, endIndex);

    if (gamesToShow.length === 0) {
        container.innerHTML = `<p style="color: #8b949e; grid-column: 1/-1; text-align: center; padding: 40px;">Aucun jeu trouvé.</p>`;
    } else {
        container.innerHTML = gamesToShow.map(game => `
            <a href="${game.url}" class="game-card" data-style="${game.styleData}" data-name="${game.searchData}">
                <div class="media-container">
                    <img src="${game.image}" alt="${escapeHtml(game.title)}" loading="lazy">
                </div>
                <h3>${escapeHtml(game.title)}</h3>
                <p class="description">${escapeHtml(game.description)}</p>
                <span class="tag-style">${escapeHtml(game.tag)}</span>
            </a>
        `).join('');
    }

    renderPaginationControls();
}

// CRÉATION DES BOUTONS DE PAGINATION EN BAS DE PAGE
function renderPaginationControls() {
    const gamesContainer = document.getElementById('gamesContainer');
    if (!gamesContainer) return;

    let paginationContainer = document.getElementById('paginationControls');
    
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'paginationControls';
        paginationContainer.className = 'pagination-container';
        gamesContainer.after(paginationContainer);
    }

    const totalPages = Math.ceil(currentFilteredGames.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let buttonsHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        buttonsHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }

    paginationContainer.innerHTML = buttonsHTML;
}

function goToPage(pageNumber) {
    currentPage = pageNumber;
    renderGames();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// FILTRAGE PAR CATEGORIE / TAG
function filterByStyle(style) {
    if (style === 'all') {
        currentFilteredGames = [...gamesData];
    } else {
        currentFilteredGames = gamesData.filter(game => game.styleData.includes(style));
    }
    currentPage = 1;
    renderGames();
}

// FILTRAGE PAR LETTRE (A-Z)
function filterByLetter(letter) {
    if (letter === 'all') {
        currentFilteredGames = [...gamesData];
    } else {
        currentFilteredGames = gamesData.filter(game => {
            let name = game.searchData.toLowerCase();
            return name.startsWith(letter);
        });
    }
    currentPage = 1;
    renderGames();
}