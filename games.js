// ==========================================
// LISTE DES JEUX (AJOUTE LES NOUVEAUX EN HAUT)
// ==========================================
const gamesData = [
    {
        title: "Stalker 2: Heart of Chornobyl",
        url: "pages jeux/stalker2.html",
        image: "assets/stalker2/images/cover.jpg",
        description: "Plongez dans la Zone d'exclusion de Tchernobyl dans ce jeu de tir et de survie.",
        tag: "Survie / FPS",
        styleData: "survival fps",
        searchData: "stalker 2 heart of chornobyl"
    },
    {
        title: "Super Course Auto",
        url: "pages jeux/supercourse.html",
        image: "images/jeu2-cover.jpg",
        description: "Un jeu de course arcade ultra rapide avec des graphismes modernes.",
        tag: "Voiture",
        styleData: "cars",
        searchData: "super course auto"
    }
];

// PARAMÈTRES DE PAGINATION
const ITEMS_PER_PAGE = 12; // Nombre de jeux par page
let currentPage = 1;
let currentFilteredGames = [...gamesData];

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
                    <img src="${game.image}" alt="${game.title}" loading="lazy">
                </div>
                <h3>${game.title}</h3>
                <p class="description">${game.description}</p>
                <span class="tag-style">${game.tag}</span>
            </a>
        `).join('');
    }

    renderPaginationControls();
}

// CRÉATION DES BOUTONS DE PAGINATION EN BAS DE PAGE
function renderPaginationControls() {
    let paginationContainer = document.getElementById('paginationControls');
    
    // Si le conteneur n'existe pas encore, on le crée après le bloc des jeux
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'paginationControls';
        paginationContainer.className = 'pagination-container';
        document.getElementById('gamesContainer').after(paginationContainer);
    }

    const totalPages = Math.ceil(currentFilteredGames.length / ITEMS_PER_PAGE);

    // Si tout rentre sur une seule page ou qu'on est sur l'accueil, on ne montre pas la pagination
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

// Premier rendu
renderGames();