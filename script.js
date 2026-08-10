// --- 1. GESTION DE LA MODALE & DU MENU ---
let currentMode = 'style';

function openAboutModal() {
    document.getElementById('aboutModal').style.display = 'flex';
}

function closeAboutModal() {
    document.getElementById('aboutModal').style.display = 'none';
}

function closeAboutModalOnOverlay(event) {
    if (event.target.id === 'aboutModal') {
        closeAboutModal();
    }
}

function showAccueil() {
    document.getElementById('accueilBtn').classList.add('active');
    document.getElementById('jeuxPcBtn').classList.remove('active');
    document.getElementById('subMenuContainer').style.display = 'none';
    filterByStyle('all');
}

function showJeuxPC() {
    document.getElementById('jeuxPcBtn').classList.add('active');
    document.getElementById('accueilBtn').classList.remove('active');
    document.getElementById('subMenuContainer').style.display = 'block';
    setBrowseMode('style');
}

function setBrowseMode(mode) {
    currentMode = mode;
    const styleBtn = document.querySelectorAll('.mode-btn')[0];
    const alphaBtn = document.querySelectorAll('.mode-btn')[1];
    const styleFilters = document.getElementById('styleFilters');
    const alphaFilters = document.getElementById('alphaFilters');

    if (mode === 'style') {
        styleBtn.classList.add('active');
        alphaBtn.classList.remove('active');
        styleFilters.style.display = 'flex';
        alphaFilters.style.display = 'none';
        filterByStyle('all');
    } else {
        alphaBtn.classList.add('active');
        styleBtn.classList.remove('active');
        alphaFilters.style.display = 'flex';
        styleFilters.style.display = 'none';
        filterByLetter('all');
    }
}

function handleStyleFilter(style, evt) {
    if (evt) {
        document.querySelectorAll('#styleFilters .filter-btn').forEach(btn => btn.classList.remove('active'));
        evt.target.classList.add('active');
    }
    filterByStyle(style);
}

function handleLetterFilter(letter, evt) {
    if (evt) {
        document.querySelectorAll('#alphaFilters .filter-btn').forEach(btn => btn.classList.remove('active'));
        evt.target.classList.add('active');
    }
    filterByLetter(letter);
}


// --- 2. GESTION FAVICON, ADMIN, COMMENTAIRES ET LIGHTBOX ---

// Injection automatique du Favicon sur toutes les pages
(function() {
    let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    let isSubFolder = window.location.pathname.includes('/pages-jeux/');
    link.href = isSubFolder ? '../assets/logo site/images/favicon.png' : 'assets/logo site/images/favicon.png';
    document.getElementsByTagName('head')[0].appendChild(link);
})();

// Mot de passe admin
const ADMIN_PASSWORD = "MonMotDePasseSecret"; 
let isAdminMode = false;
let currentCaptchaAnswer = 0;

document.addEventListener("DOMContentLoaded", function() {
    showAccueil(); // Lancer l'accueil au chargement
    
    emailjs.init({ publicKey: "_KJIQgzKnZEuNb72R" });

    const adminTriggerContainer = document.createElement('div');
    adminTriggerContainer.classList.add('admin-trigger');
    adminTriggerContainer.innerHTML = `<button onclick="toggleAdminMode()">🔐 Connexion Admin</button>`;
    const container = document.querySelector('.site-container') || document.body;
    container.appendChild(adminTriggerContainer);

    generateCaptcha(); 
    renderRecentComments();
    loadGameComments(); 
    initImageLightbox(); 
});

// Fonction pour faire défiler les carrousels
function scrollCarousel(containerId, distance) {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
    });

    const container = document.getElementById(containerId);
    if (container) {
        container.scrollBy({
            left: distance,
            behavior: 'smooth'
        });
    }
}

function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    currentCaptchaAnswer = num1 + num2;
    const qElement = document.getElementById('captchaQuestion');
    if (qElement) qElement.textContent = `${num1} + ${num2}`;
}

function toggleAdminMode() {
    if (!isAdminMode) {
        const password = prompt("Entrez le mot de passe admin :");
        if (password === ADMIN_PASSWORD) {
            isAdminMode = true;
            document.body.classList.add('admin-logged-in');
            alert("Mode Admin activé !");
            loadGameComments();
            renderRecentComments();
        } else if (password !== null) {
            alert("Mot de passe incorrect.");
        }
    } else {
        isAdminMode = false;
        document.body.classList.remove('admin-logged-in');
        alert("Mode Admin désactivé.");
        loadGameComments();
        renderRecentComments();
    }
}

function addComment(event, gameTitle = "Jeu", gameUrl = "#") {
    event.preventDefault();

    const authorInput = document.getElementById('commentAuthor');
    const textInput = document.getElementById('commentText');
    const captchaInput = document.getElementById('captcha');

    if (!captchaInput || parseInt(captchaInput.value) !== currentCaptchaAnswer) {
        alert("Réponse incorrecte ! Nouveau calcul généré.");
        captchaInput.value = '';
        generateCaptcha();
        return;
    }

    if (!authorInput || !textInput) return;
    if (authorInput.value.trim() === '' || textInput.value.trim() === '') return;

    const author = authorInput.value.trim();
    const text = textInput.value.trim();

    const newComment = {
        author: author,
        text: text,
        gameTitle: gameTitle,
        gameUrl: gameUrl,
        date: new Date().toLocaleDateString('fr-FR')
    };

    let comments = JSON.parse(localStorage.getItem('siteComments')) || [];
    comments.unshift(newComment);
    localStorage.setItem('siteComments', JSON.stringify(comments));

    emailjs.send("service_5dyx1td", "template_s3bbiv5", {
        name: author,
        message: `${gameTitle} : ${text}`
    }).then(() => {
        alert("Commentaire publié avec succès !");
        authorInput.value = '';
        textInput.value = '';
        captchaInput.value = ''; 
        generateCaptcha();
        loadGameComments(); 
        renderRecentComments(); 
    }, (error) => {
        alert("Erreur lors de l'envoi.");
        console.error(error);
    });
}

function loadGameComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    const comments = JSON.parse(localStorage.getItem('siteComments')) || [];
    const gameTitleElement = document.querySelector('h2');
    const currentGame = gameTitleElement ? gameTitleElement.textContent.trim() : "";

    const gameComments = comments.filter(c => c.gameTitle === currentGame);

    commentsList.innerHTML = gameComments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <strong>${escapeHtml(comment.author)}</strong>
                ${isAdminMode ? `<button class="btn-delete" onclick="deleteGameComment('${escapeHtml(comment.author)}', '${escapeHtml(comment.text)}')">❌ Supprimer</button>` : ''}
            </div>
            <p>${escapeHtml(comment.text)}</p>
        </div>
    `).join('');
}

function deleteGameComment(author, text) {
    if (!isAdminMode) {
        alert("Mode admin requis pour supprimer un commentaire.");
        return;
    }
    let comments = JSON.parse(localStorage.getItem('siteComments')) || [];
    comments = comments.filter(c => !(c.author === author && c.text === text));
    localStorage.setItem('siteComments', JSON.stringify(comments));
    loadGameComments();
    renderRecentComments();
}

function renderRecentComments() {
    const commentsContainer = document.getElementById('recentCommentsContainer');
    if (!commentsContainer) return;
    
    const comments = JSON.parse(localStorage.getItem('siteComments')) || [];
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = `<p style="color: #8b949e; text-align: center;">Aucun commentaire.</p>`;
        return;
    }
    
    commentsContainer.innerHTML = comments.slice(0, 10).map(c => `
        <div class="comment-card">
            <strong>${escapeHtml(c.author)}</strong> sur <a href="${c.gameUrl}">${escapeHtml(c.gameTitle)}</a>
            <p>"${escapeHtml(c.text)}"</p>
            <small>Le ${c.date}</small>
            ${isAdminMode ? `<br><button class="btn-delete" style="margin-top: 8px;" onclick="deleteGameComment('${escapeHtml(c.author)}', '${escapeHtml(c.text)}')">❌ Supprimer</button>` : ''}
        </div>
    `).join('');
}

function reportDeadLink(gameName) {
    const modal = document.getElementById('customConfirmModal');
    if (!modal) return;
    
    const modalBox = modal.querySelector('.modal-box');
    const messageEl = document.getElementById('modalMessage');
    const buttonsDiv = modal.querySelector('.modal-buttons');
    
    messageEl.textContent = `Quel hébergeur pose problème pour ${gameName} ?`;
    if (buttonsDiv) buttonsDiv.style.display = 'flex';
    
    modal.style.display = 'flex';

    const yesBtn = document.getElementById('modalYesBtn');
    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    
    document.getElementById('modalNoBtn').onclick = () => {
        modal.style.display = 'none';
        if (buttonsDiv) buttonsDiv.style.display = 'flex';
    };
    
    document.getElementById('modalYesBtn').onclick = function() {
        const selectedHost = document.querySelector('input[name="deadHost"]:checked');
        const hostName = selectedHost ? selectedHost.value : "Inconnu";
        
        messageEl.textContent = "⏳ Envoi en cours...";
        if (buttonsDiv) buttonsDiv.style.display = 'none';
        
        const allRadios = modalBox.querySelectorAll('input[type="radio"], label');
        allRadios.forEach(el => el.style.display = 'none');

        emailjs.send("service_5dyx1td", "template_s3bbiv5", {
            name: "Système d'alerte",
            message: `⚠️ LIEN MORT SIGNALÉ : [${hostName}] ne fonctionne plus sur : ${gameName}`
        }).then(() => {
            messageEl.textContent = "✅ Merci ! Le signalement a bien été envoyé.";
            
            setTimeout(() => {
                modal.style.display = 'none';
                if (buttonsDiv) buttonsDiv.style.display = 'flex';
                allRadios.forEach(el => el.style.display = '');
            }, 2000);
        }, () => {
            messageEl.textContent = "❌ Erreur lors de l'envoi du signalement.";
            
            setTimeout(() => {
                modal.style.display = 'none';
                if (buttonsDiv) buttonsDiv.style.display = 'flex';
                allRadios.forEach(el => el.style.display = '');
            }, 2000);
        });
    };
}

function escapeHtml(text) {
    const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
    return text.replace(/[&<>"']/g, m => map[m]);
} 

function initImageLightbox() {
    const trackImages = document.querySelectorAll('.carousel-track img');

    trackImages.forEach((img) => {
        img.addEventListener('click', () => {
            const track = img.closest('.carousel-track');
            const imagesInCarousel = Array.from(track.querySelectorAll('img'));
            let currentIndex = imagesInCarousel.indexOf(img);

            const overlay = document.createElement('div');
            overlay.classList.add('image-modal-overlay');

            const fullImg = document.createElement('img');
            fullImg.src = img.src;
            fullImg.classList.add('image-modal-content');
            fullImg.setAttribute('draggable', 'false');

            overlay.appendChild(fullImg);

            if (imagesInCarousel.length > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.innerHTML = '❮';
                prevBtn.className = 'lightbox-nav-btn lightbox-prev';
                
                const nextBtn = document.createElement('button');
                nextBtn.innerHTML = '❯';
                nextBtn.className = 'lightbox-nav-btn lightbox-next';

                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex - 1 + imagesInCarousel.length) % imagesInCarousel.length;
                    fullImg.src = imagesInCarousel[currentIndex].src;
                });

                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex + 1) % imagesInCarousel.length;
                    fullImg.src = imagesInCarousel[currentIndex].src;
                });

                overlay.appendChild(prevBtn);
                overlay.appendChild(nextBtn);
            }

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.className = 'lightbox-close-btn';
            closeBtn.addEventListener('click', () => overlay.remove());
            overlay.appendChild(closeBtn);

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });

            document.body.appendChild(overlay);
        });
    });
}