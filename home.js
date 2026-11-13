/* Lightweight homepage behavior: keep the gallery transition without loading dashboard code. */
document.addEventListener('DOMContentLoaded', function () {
    const splash = document.getElementById('splash');
    const galleryLink = document.querySelector('.hero-buttons .btn-primary');
    let openingGallery = false;

    if (!splash || !galleryLink) return;

    galleryLink.addEventListener('click', function (event) {
        if (openingGallery) {
            event.preventDefault();
            return;
        }

        openingGallery = true;
        event.preventDefault();
        splash.classList.remove('hidden');
        splash.setAttribute('aria-hidden', 'false');

        window.setTimeout(function () {
            window.location.assign(galleryLink.href);
        }, 1200);
    });
});
