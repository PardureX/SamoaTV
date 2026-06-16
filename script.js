// ============================================================
// CONFIGURACIÓN - SAMOATV
// ============================================================
const API_KEY = 'ee351a3977ec29cc4021bbc4a482ad96';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZTM1MWEzOTc3ZWMyOWNjNDAyMWJiYzRhNDgyYWQ5NiIsIm5iZiI6MTc4MTY0NDY3OC43OTYsInN1YiI6IjZhMzFiZDg2ZmVlMjM1MWZmODNkOTU0YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WUuPeV8rW19Limoni350eyT7TedoMCLDrMUMh92ty4A';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

const moviesGrid = document.getElementById('moviesGrid');
const categoryTitle = document.getElementById('categoryTitle');
const hero = document.getElementById('hero');
const heroTitle = document.getElementById('heroTitle');
const heroOverview = document.getElementById('heroOverview');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');
const navLinks = document.querySelectorAll('.nav a');

let currentCategory = 'popular';

async function fetchWithAuth(url) {
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
}

async function fetchMovies(category = 'popular', page = 1) {
    try {
        const url = `${BASE_URL}/movie/${category}?language=es-ES&page=${page}`;
        const data = await fetchWithAuth(url);
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function searchMovies(query) {
    try {
        const url = `${BASE_URL}/search/movie?language=es-ES&query=${encodeURIComponent(query)}`;
        const data = await fetchWithAuth(url);
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function getMovieDetails(movieId) {
    try {
        const url = `${BASE_URL}/movie/${movieId}?language=es-ES`;
        const data = await fetchWithAuth(url);
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function renderMovies(movies, title = 'Películas') {
    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 0; color:#666;">
                <i class="fas fa-film" style="font-size:48px; display:block; margin-bottom:15px;"></i>
                <p>No se encontraron películas</p>
            </div>
        `;
        categoryTitle.textContent = title;
        return;
    }

    categoryTitle.textContent = title;

    moviesGrid.innerHTML = movies.map(movie => {
        const poster = movie.poster_path 
            ? `${IMG_BASE}${movie.poster_path}` 
            : 'https://via.placeholder.com/300x450/1a1a1a/666?text=Sin+Imagen';
        
        const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';

        return `
            <div class="movie-card" data-id="${movie.id}">
                <img src="${poster}" alt="${movie.title}" loading="lazy" />
                <div class="movie-year">${year}</div>
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${rating}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            openModal(id);
        });
    });
}

function updateHero(movie) {
    if (!movie) return;
    
    const backdrop = movie.backdrop_path 
        ? `${BACKDROP_BASE}${movie.backdrop_path}` 
        : 'https://via.placeholder.com/1920x1080/1a1a1a/333?text=Sin+Imagen';
    
    hero.style.backgroundImage = `url(${backdrop})`;
    heroTitle.textContent = movie.title;
    heroOverview.textContent = movie.overview || 'Sin descripción disponible.';
}

async function openModal(movieId) {
    const movie = await getMovieDetails(movieId);
    if (!movie) return;

    const poster = movie.poster_path 
        ? `${IMG_BASE}${movie.poster_path}` 
        : 'https://via.placeholder.com/400x600/1a1a1a/666?text=Sin+Imagen';

    const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : 'N/A';
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';

    modalBody.innerHTML = `
        <img src="${poster}" alt="${movie.title}" />
        <h2>${movie.title}</h2>
        <div class="modal-rating">
            <i class="fas fa-star"></i> ${rating} / 10
        </div>
        <p class="modal-overview">${movie.overview || 'Sin descripción disponible.'}</p>
        <div class="modal-details">
            <span><strong>Año:</strong> ${year}</span>
            <span><strong>Duración:</strong> ${runtime}</span>
            <span><strong>Géneros:</strong> ${genres}</span>
        </div>
    `;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModalFn() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

async function loadCategory(category) {
    currentCategory = category;
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.category === category) {
            link.classList.add('active');
        }
    });

    const movies = await fetchMovies(category);
    
    if (movies.length > 0) {
        updateHero(movies[0]);
        const titles = {
            popular: 'Películas Populares',
            top_rated: 'Mejor Valoradas',
            upcoming: 'Próximamente'
        };
        renderMovies(movies, titles[category] || 'Películas');
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        if (category) {
            loadCategory(category);
            searchInput.value = '';
        }
    });
});

searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) {
        loadCategory(currentCategory);
        return;
    }
    
    const results = await searchMovies(query);
    renderMovies(results, `Resultados para: "${query}"`);
    
    if (results.length > 0) {
        updateHero(results[0]);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

closeModal.addEventListener('click', closeModalFn);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalFn();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModalFn();
    }
});

window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

loadCategory('popular');