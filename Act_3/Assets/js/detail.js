import { Cart } from './cart.js';
import {
  fetchBook,
  fetchReviews,
  fetchSimilar,
  sendReview
} from './api.js';

/* ─── obtiene el ?id= de la URL ─── */
const id = new URLSearchParams(location.search).get('id');
if (!id) location.replace('index.html');   // si falta → vuelve al listado

/* ─── estado ─── */
const cart = new Cart();

/* ─── referencias DOM (ajusta si tus IDs cambian) ─── */
const coverEl   = document.getElementById('book-cover');
const titleEl   = document.getElementById('book-title');
const authorEl  = document.getElementById('book-author');
const priceEl   = document.getElementById('book-price');
const descEl    = document.getElementById('book-desc');
const reviewsEl = document.getElementById('reviews');
const similarEl = document.getElementById('similar');
const addBtn    = document.getElementById('add-to-cart');
const formEl    = document.getElementById('review-form');

/* ─── carga inicial ─── */
(async () => {
  const book = await fetchBook(id);                  // ficha
  renderBook(book);

  renderReviews(await fetchReviews(id));             // opiniones
  renderSimilar(await fetchSimilar(book.category, book.id)); // similares

  addBtn.onclick = () => {
    cart.add(book.isbn);
    alert('Libro añadido al carrito ✔');
  };
})();

/* ─── envío de nueva review ─── */
formEl.onsubmit = async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(formEl));
  data.rating = +data.rating;            // convierte a número

  try {
    await sendReview(id, data);          // POST /reviews/:id
    formEl.reset();
    renderReviews(await fetchReviews(id));   // refresca la lista
    alert('¡Gracias por tu opinión!');
  } catch (err) {
    alert('Error guardando la reseña: ' + err.message);
  }
};

/* ─── funciones de pintado ─── */
function renderBook(b) {
  coverEl.src         = `Assets/img/${b.cover || 'placeholder.jpg'}`;
  coverEl.alt         = b.title;
  titleEl.textContent = b.title;
  authorEl.textContent= b.author;
  priceEl.textContent = `${b.price.toFixed(2)} €`;
  descEl.textContent  = b.description || '';
}

function renderReviews(list) {
  reviewsEl.innerHTML = list.length
    ? list.map(r => `
        <div class="review">
          <strong>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</strong>
          <p>${r.comment}</p>
        </div>`).join('')
    : '<p>Aún no hay opiniones.</p>';
}

function renderSimilar(list) {
  similarEl.innerHTML = list.length
    ? list.map(b => `<li><a href="libro.html?id=${b.id}">${b.title}</a></li>`).join('')
    : '<p>No hay sugerencias.</p>';
}
