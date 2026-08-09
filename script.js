// Mot de passe admin
const ADMIN_PASSWORD = "MonMotDePasseSecret"; 
let isAdminMode = false;
let currentCaptchaAnswer = 0;

document.addEventListener("DOMContentLoaded", function() {
    emailjs.init({ publicKey: "_KJIQgzKnZEuNb72R" });

    const adminTriggerContainer = document.createElement('div');
    adminTriggerContainer.classList.add('admin-trigger');
    adminTriggerContainer.innerHTML = `<button onclick="toggleAdminMode()">🔐 Connexion Admin</button>`;
    const container = document.querySelector('.site-container') || document.body;
    container.appendChild(adminTriggerContainer);

    generateCaptcha(); 
    renderRecentComments();
    loadGameComments(); // Charge uniquement les commentaires de ce jeu
});

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
            // Rafraîchit les listes pour afficher les boutons de suppression
            loadGameComments();
            renderRecentComments();
        } else if (password !== null) {
            alert("Mot de passe incorrect.");
        }
    } else {
        isAdminMode = false;
        document.body.classList.remove('admin-logged-in');
        alert("Mode Admin désactivé.");
        // Rafraîchit les listes pour masquer les boutons
        loadGameComments();
        renderRecentComments();
    }
}

// Fonction pour ajouter un commentaire
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

    // Sauvegarde globale dans le LocalStorage
    let comments = JSON.parse(localStorage.getItem('siteComments')) || [];
    comments.unshift(newComment);
    localStorage.setItem('siteComments', JSON.stringify(comments)); // On garde tout l'historique global

    // Notification EmailJS
    emailjs.send("service_5dyx1td", "template_s3bbiv5", {
        name: author,
        message: `${gameTitle} : ${text}`
    }).then(() => {
        alert("Commentaire publié avec succès !");
        authorInput.value = '';
        textInput.value = '';
        captchaInput.value = ''; 
        generateCaptcha();
        loadGameComments(); // Recharge la liste propre à cette page
        renderRecentComments(); // Recharge la liste de l'accueil
    }, (error) => {
        alert("Erreur lors de l'envoi.");
        console.error(error);
    });
}

// Affiche uniquement les commentaires du jeu de la page actuelle
function loadGameComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    const comments = JSON.parse(localStorage.getItem('siteComments')) || [];
    
    // Récupère le titre exact de la page (ex: "Stalker 2 : Heart of Chornobyl")
    const gameTitleElement = document.querySelector('h2');
    const currentGame = gameTitleElement ? gameTitleElement.textContent.trim() : "";

    // FILTRE : Ne garde que les commentaires dont le gameTitle correspond à cette page
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

// Supprimer un commentaire proprement du stockage global
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

// Fonction pour afficher les 10 derniers commentaires sur la page d'accueil
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
    document.getElementById('modalMessage').textContent = `Quel hébergeur pose problème pour ${gameName} ?`;
    modal.style.display = 'flex';

    const yesBtn = document.getElementById('modalYesBtn');
    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    
    document.getElementById('modalNoBtn').onclick = () => modal.style.display = 'none';
    document.getElementById('modalYesBtn').onclick = function() {
        const selectedHost = document.querySelector('input[name="deadHost"]:checked');
        const hostName = selectedHost ? selectedHost.value : "Inconnu";
        modal.style.display = 'none';
        emailjs.send("service_5dyx1td", "template_s3bbiv5", {
            name: "Système d'alerte",
            message: `⚠️ LIEN MORT SIGNALÉ : [${hostName}] ne fonctionne plus sur : ${gameName}`
        }).then(() => alert('Merci !'), () => alert('Erreur.'));
    };
}

function escapeHtml(text) {
    const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
    return text.replace(/[&<>"']/g, m => map[m]);
}