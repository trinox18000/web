// Mot de passe admin
const ADMIN_PASSWORD = "MonMotDePasseSecret"; 
let isAdminMode = false;

// Exécuté automatiquement dès que la page est chargée
document.addEventListener("DOMContentLoaded", function() {
    // Initialisation d'EmailJS
    emailjs.init({
        publicKey: "_KJIQgzKnZEuNb72R",
    });

    // Bouton admin global (Optionnel : retire ces 5 lignes si tes HTML ont déjà un bouton admin)
    const adminTriggerContainer = document.createElement('div');
    adminTriggerContainer.classList.add('admin-trigger');
    adminTriggerContainer.innerHTML = `<button onclick="toggleAdminMode()">🔐 Connexion Admin</button>`;
    const container = document.querySelector('.site-container') || document.body;
    container.appendChild(adminTriggerContainer);

    // Charge les commentaires si on est sur la page d'accueil
    renderRecentComments();
});

// Fonction pour basculer le mode admin
function toggleAdminMode() {
    if (!isAdminMode) {
        const password = prompt("Entrez le mot de passe admin :");
        if (password === ADMIN_PASSWORD) {
            isAdminMode = true;
            document.body.classList.add('admin-logged-in');
            alert("Mode Admin activé ! Tu peux maintenant supprimer les commentaires.");
        } else if (password !== null) {
            alert("Mot de passe incorrect.");
        }
    } else {
        isAdminMode = false;
        document.body.classList.remove('admin-logged-in');
        alert("Mode Admin désactivé.");
    }
}

function scrollCarousel(id, distance) {
    const track = document.getElementById(id);
    if (track) {
        track.scrollBy({ left: distance, behavior: 'smooth' });
    }
}

// Fonction pour ajouter un commentaire
function addComment(event, gameTitle = "Jeu", gameUrl = "#") {
    event.preventDefault();

    const authorInput = document.getElementById('commentAuthor');
    const textInput = document.getElementById('commentText');
    const commentsList = document.getElementById('commentsList');

    if (!authorInput || !textInput) return;
    if (authorInput.value.trim() === '' || textInput.value.trim() === '') return;

    const author = authorInput.value.trim();
    const text = textInput.value.trim();

    // 1. Affiche le commentaire sur la page du jeu
    if (commentsList) {
        const commentItem = document.createElement('div');
        commentItem.classList.add('comment-item');

        commentItem.innerHTML = `
            <div class="comment-header">
                <strong>${escapeHtml(author)}</strong>
                <button class="btn-delete" onclick="this.closest('.comment-item').remove()">❌ Supprimer</button>
            </div>
            <p>${escapeHtml(text)}</p>
        `;

        commentsList.prepend(commentItem);
    }

    // 2. Sauvegarde dans LocalStorage pour l'accueil
    const newComment = {
        author: author,
        text: text,
        gameTitle: gameTitle,
        gameUrl: gameUrl,
        date: new Date().toLocaleDateString('fr-FR')
    };

    let comments = JSON.parse(localStorage.getItem('siteComments')) || [];
    comments.unshift(newComment);
    localStorage.setItem('siteComments', JSON.stringify(comments.slice(0, 10))); // Conserve les 10 derniers

    // 3. Notification EmailJS
    emailjs.send("service_5dyx1td", "template_s3bbiv5", {
        name: author,
        message: `${gameTitle} : ${text}`
    }).then(function() {
        console.log("E-mail de notification envoyé avec succès !");
    }, function(error) {
        console.log("Erreur lors de l'envoi de l'e-mail...", error);
    });

    // Reinitialise le formulaire
    authorInput.value = '';
    textInput.value = '';
}

// Fonction pour afficher les commentaires sur la page d'accueil
function renderRecentComments() {
    const commentsContainer = document.getElementById('recentCommentsContainer');
    if (!commentsContainer) return;

    const comments = JSON.parse(localStorage.getItem('siteComments')) || [];

    if (comments.length === 0) {
        commentsContainer.innerHTML = `<p style="color: #8b949e; grid-column: 1/-1; text-align: center;">Aucun commentaire pour le moment.</p>`;
        return;
    }

    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment-card">
            <div>
                <strong>${escapeHtml(comment.author)}</strong> sur <a href="${comment.gameUrl}">${escapeHtml(comment.gameTitle)}</a>
                <p>"${escapeHtml(comment.text)}"</p>
            </div>
            <small>Le ${comment.date}</small>
        </div>
    `).join('');
}

// Protection XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}