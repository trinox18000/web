function scrollCarousel(id, distance) {
    const track = document.getElementById(id);
    track.scrollBy({ left: distance, behavior: 'smooth' });
}