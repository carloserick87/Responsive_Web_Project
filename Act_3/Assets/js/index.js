import { Cart } from './cart.js';
import { fetchBooks } from './api.js';

/* ─── referencias DOM ───────────────────────────────────────── */
const listEl     = document.getElementById('book-list');   // <section>
const filterInp  = document.getElementById('filter-input');
const filterBtn  = document.getElementById('filter-btn');  // <button>
const cartBox    = document.getElementById('cart');

/* ─── estado ────────────────────────────────────────────────── */
const cart      = new Cart();          // gestiona localStorage
let booksIndex  = new Map();           // isbn → objeto libro (para precios)

/* ─── eventos ───────────────────────────────────────────────── */
filterBtn.addEventListener('click', () => renderList());
filterInp.addEventListener('input', debounce(renderList, 400));

/* ─── arranque ──────────────────────────────────────────────── */
renderList();

/* ───────────────────────────────────────────────────────────── */
async function renderList() {
  const term   = filterInp.value.trim();
  const books  = await fetchBooks(term);      // GET /books  (con filtro si procede)
  booksIndex   = new Map(books.map(b => [b.isbn, b]));

  /* pinta las tarjetas */
  listEl.innerHTML = books.map(renderCard).join('');

  /* listeners “Add to cart” */
  listEl.querySelectorAll('.add-btn').forEach(btn => {
    btn.onclick = () => {
      cart.add(btn.dataset.isbn);
      toast(`Añadido «${btn.dataset.title}»`);
      renderCart();
    };
  });

  renderCart();     // al terminar, refresca el carrito
}

function renderCard(b) {
  return `
    <div class="cards">
      <img src="Assets/img/${b.cover || 'placeholder.jpg'}"
           class="books_img" alt="${b.title}">
      <div class="content">
        <h3>${b.title}</h3>
        <p>${b.author}</p>
        <p><strong>${b.price.toFixed(2)} €</strong></p>

        <button class="add-btn"
                data-isbn="${b.isbn}"
                data-title="${b.title}">
          Add to cart
        </button>

        <a href="libro.html?id=${b.id}">
          <button>Detalles</button>
        </a>
      </div>
    </div>`;
}

function renderCart() {
  /* si aún no hay <aside id="cart"> evita errores */
  if (!cartBox) return;

  const items = cart.items();          // { isbn: unidades, … }
  let total   = 0;

  const html = Object.entries(items).map(([isbn, qty]) => {
    const book = booksIndex.get(isbn);
    const sub  = book ? book.price * qty : 0;
    total += sub;

    return `<div class="cart-item">
              <span>${qty} × ${book?.title || isbn}</span>
              <span>${sub.toFixed(2)} €</span>
            </div>`;
  }).join('');

  cartBox.innerHTML = html
      ? html + `<hr><strong>Total: ${total.toFixed(2)} €</strong>`
      : '<p>Carrito vacío</p>';
}

/* ─── utilidades ────────────────────────────────────────────── */
function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
