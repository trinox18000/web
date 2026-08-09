// Mot de passe admin
const ADMIN_PASSWORD = "MonMotDePasseSecret"; 
let isAdminMode = false;

// Exécuté automatiquement dès que la page est chargée
document.addEventListener("DOMContentLoaded", function() {
    // Initialisation d'EmailJS avec ta vraie Public Key
    emailjs.init({
        publicKey: "_KJIQgzKnZEuNb72R",
    });

    // Crée automatiquement le bouton admin discret en bas de page
    const adminTriggerContainer = document.createElement('div');
    adminTriggerContainer.classList.add('admin-trigger');
    adminTriggerContainer.innerHTML = `<button onclick="toggleAdminMode()">🔐 Connexion Admin</button>`;
    
    const container = document.querySelector('.site-container') || document.body;
    container.appendChild(adminTriggerContainer);
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
    track.scrollBy({ left: distance, behavior: 'smooth' });
}

function addComment(event) {
    event.preventDefault(); // Empêche la page de se recharger

    const authorInput = document.getElementById('commentAuthor');
    const textInput = document.getElementById('commentText');
    const commentsList = document.getElementById('commentsList');

    if (authorInput.value.trim() === '' || textInput.value.trim() === '') return;

    // 1. Affiche le commentaire sur la page
    const commentItem = document.createElement('div');
    commentItem.classList.add('comment-item');

    commentItem.innerHTML = `
        <div class="comment-header">
            <strong>${escapeHtml(authorInput.value)}</strong>
            <button class="btn-delete" onclick="this.closest('.comment-item').remove()">❌ Supprimer</button>
        </div>
        <p>${escapeHtml(textInput.value)}</p>
    `;

    commentsList.prepend(commentItem);

    // 2. Envoie l'e-mail de notification via EmailJS avec ton Service ID et ton Template ID
    emailjs.send("service_5dyx1td", "template_s3bbiv5", {
        name: authorInput.value,
        message: textInput.value
    }).then(function() {
        console.log("E-mail de notification envoyé avec succès !");
    }, function(error) {
        console.log("Erreur lors de l'envoi de l'e-mail...", error);
    });

    // Vide les champs du formulaire
    authorInput.value = '';
    textInput.value = '';
}

// Petite fonction de sécurité pour éviter les failles HTML/JS dans les commentaires
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