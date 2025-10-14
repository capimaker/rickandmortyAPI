const API_URL = 'https://rickandmortyapi.com/api/character';
const personajesDiv = document.querySelector('.personajes');
const formulario = document.getElementById('form');
const buscar = document.getElementById('buscar');
const pagination = document.getElementById('pagination');

let state = {
  personajes: [],
  currentPage: 1,
  perPage: 10,
};

const obtenerPersonajes = async (e) => {
    e.preventDefault();
    try {
        const searching = buscar.value;
    const res = await axios.get(API_URL +"?name=" + searching);
    const personajes = res.data.results || [];
    
    state.personajes = personajes;
    state.currentPage = 1;

    mostrarPersonajes();
    renderPagination();
    }catch (error) {
        console.error(error);
        personajesDiv.innerHTML = `<div class="alert alert-warning mt-3">No se encontraron personajes.</div>`;
    pagination.innerHTML = ''
    }
};
const mostrarPersonajes = () => {
  const { personajes, currentPage, perPage } = state;
  personajesDiv.innerHTML = '';

  // calcular el tramo
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const slice = personajes.slice(start, end);

  slice.forEach((character) => {
    personajesDiv.innerHTML += `
      <div class="card col-lg-3 col-xs-12 col-md-6">
        <div class="personaje">
          <div class="card-body text-center">
            <img style="height: 200px; width: 100%; display: block; border-radius:10px;"
                 src="${character.image}" alt="${character.name}">
            <h3 class="card-title mt-2">${character.name}</h3>
            <h5 class="card-text">Estado: ${character.status}</h5>
          </div>
        </div>
      </div>
    `;
  });
};

// NEW: botones Prev/Next + numeración compacta
function renderPagination() {
  const { personajes, currentPage, perPage } = state;
  const totalPages = Math.max(1, Math.ceil(personajes.length / perPage));

  if (personajes.length === 0 || totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';

  // Ventana de 5 páginas máx
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

  let nums = '';
  for (let p = start; p <= end; p++) {
    nums += `
      <li class="page-item ${p === currentPage ? 'active' : ''}">
        <button class="page-link" data-page="${p}">${p}</button>
      </li>`;
  }

  pagination.innerHTML = `
    <ul class="pagination">
      <li class="page-item ${prevDisabled}">
        <button class="page-link" data-step="-1" ${prevDisabled ? 'tabindex="-1" aria-disabled="true"' : ''}>Previous</button>
      </li>
      ${nums}
      <li class="page-item ${nextDisabled}">
        <button class="page-link" data-step="1" ${nextDisabled ? 'tabindex="-1" aria-disabled="true"' : ''}>Next</button>
      </li>
    </ul>
    <small class="text-muted">Página ${currentPage} de ${totalPages} (10 por página)</small>
  `;

  // handlers
  pagination.querySelectorAll('button.page-link').forEach(btn => {
    const step = btn.dataset.step ? Number(btn.dataset.step) : null;
    const page = btn.dataset.page ? Number(btn.dataset.page) : null;

    btn.onclick = () => {
      if (step) {
        const next = state.currentPage + step;
        goToPage(next);
      } else if (page) {
        goToPage(page);
      }
    };
  });
}

// NEW: cambia de página y repinta
function goToPage(page) {
  const totalPages = Math.max(1, Math.ceil(state.personajes.length / state.perPage));
  const next = Math.min(totalPages, Math.max(1, page));
  if (next !== state.currentPage) {
    state.currentPage = next;
    mostrarPersonajes();
    renderPagination();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
}


formulario.addEventListener('submit', obtenerPersonajes);