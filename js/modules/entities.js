// js/modules/entities.js - Módulo funcional de entidades
import { getEntities } from '../data/secop-contracts.js';

export default {
  title: 'Entidades',
  
  async init() {
    console.log('[entities] Iniciando módulo...');
  },
  
  render() {
    const container = document.createElement('div');
    container.className = 'card';
    
    const h2 = document.createElement('h2');
    h2.textContent = 'Expedientes Contractuales';
    container.appendChild(h2);
    
    const p = document.createElement('p');
    p.textContent = 'Módulo de gestión de entidades y contratos SECOP II';
    container.appendChild(p);
    
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Cargar Contratos';
    btn.addEventListener('click', async () => {
      try {
        const contracts = await getEntities();
        console.log('[entities] Contratos cargados:', contracts.length);
        p.textContent = `Contratos encontrados: ${contracts.length}`;
      } catch (err) {
        console.error('[entities] Error:', err);
        p.textContent = 'Error al cargar contratos';
      }
    });
    container.appendChild(btn);
    
    return container;
  }
};
