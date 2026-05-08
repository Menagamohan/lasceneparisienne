let currentIndex = 0;
const visibleCards = 4;
let cards = [];
const slider = document.getElementById("slider");

/* Initialize Slider after content is loaded */
function initSlider() {
    cards = document.querySelectorAll(".program-card");
    if (cards.length === 0) return;

    /* 🔥 CLONE FIRST & LAST CARDS for Infinite Effect */
    const firstClones = [];
    const lastClones = [];

    cards.forEach((card, i) => {
        if (i < visibleCards) {
            firstClones.push(card.cloneNode(true));
        }
        if (i >= cards.length - visibleCards) {
            lastClones.push(card.cloneNode(true));
        }
    });

    /* Add clones */
    firstClones.forEach(clone => slider.appendChild(clone));
    lastClones.reverse().forEach(clone => slider.insertBefore(clone, slider.firstChild));

    /* Update cards list after clones */
    cards = document.querySelectorAll(".program-card");

    /* Start from real first (after lastClones) */
    currentIndex = visibleCards;
    updateSlider();

    /* Auto Slide */
    if (window.sliderInterval) clearInterval(window.sliderInterval);
    window.sliderInterval = setInterval(() => {
        slideRight();
    }, 3000);
}

/* Slide Right */
function slideRight() {
    if (cards.length === 0) return;
    currentIndex++;
    updateSlider();

    if (currentIndex === cards.length - visibleCards) {
        setTimeout(() => {
            slider.style.transition = "none";
            currentIndex = visibleCards;
            updateSlider();
            slider.offsetHeight; // force reflow
            slider.style.transition = "transform 0.5s ease-in-out";
        }, 500);
    }
}

/* Slide Left */
function slideLeft() {
    if (cards.length === 0) return;
    currentIndex--;
    updateSlider();

    if (currentIndex === 0) {
        setTimeout(() => {
            slider.style.transition = "none";
            currentIndex = cards.length - (2 * visibleCards);
            updateSlider();
            slider.offsetHeight; // force reflow
            slider.style.transition = "transform 0.5s ease-in-out";
        }, 500);
    }
}

function updateSlider() {
    if (cards.length === 0) return;
    const cardWidth = cards[0].offsetWidth;
    slider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

function openProgram(index) {
    window.location.href = "program.html?slide=" + index;
}

/* Banner Slider (Always static or handled separately) */
let banner = document.getElementById("banner");
let bannerIndex = 0;

function showBanner(i) {
    const totalBanners = banner.children.length;
    if (i >= totalBanners) bannerIndex = 0;
    else if (i < 0) bannerIndex = totalBanners - 1;
    else bannerIndex = i;

    banner.style.transform = `translateX(-${bannerIndex * 100}%)`;
}

function nextBanner() {
    showBanner(bannerIndex + 1);
}

function prevBanner() {
    showBanner(bannerIndex - 1);
}

/* Auto Slide Banner */
setInterval(() => {
    nextBanner();
}, 3000);

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
    const nav = document.getElementById("navMenu");
    if (nav) {
        nav.classList.toggle("active");
    }
}
