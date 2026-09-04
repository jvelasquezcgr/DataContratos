// js/router.js - Registro + Navegación
let currentRoute = null;
const routes = new Map();

export function registerRoute(path, module) {
  routes.set(path, module);
}

export function initRouter() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) {
    console.error('[router] Sidebar no encontrado');
    return;
  }
  
  // Construir menú lateral
  const nav = document.createElement('nav');
  const ul = document.createElement('ul');
  
  for (const [path, module] of routes) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${path}`;
    a.textContent = module.title || path;
    a.dataset.path = path;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(path);
    });
    li.appendChild(a);
    ul.appendChild(li);
  }
  
  nav.appendChild(ul);
  sidebar.appendChild(nav);
}

export function navigate(path) {
  console.log('[router] Navegando a:', path);
  
  const module = routes.get(path);
  if (!module) {
    console.error('[router] Módulo no encontrado para:', path);
    return;
  }
  
  // Actualizar estado activo en sidebar
  document.querySelectorAll('#sidebar a').forEach(a => {
    a.classList.toggle('active', a.dataset.path === path);
  });
  
  // Renderizar módulo
  const main = document.getElementById('main-content');
  if (main && module.render) {
    main.innerHTML = '';
    main.appendChild(module.render());
  }
  
  currentRoute = path;
}
