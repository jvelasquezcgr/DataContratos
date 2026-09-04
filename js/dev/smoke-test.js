// js/dev/smoke-test.js - Prueba de humo
export async function runSmokeTest() {
  console.log('=== Smoke Test ===');
  
  try {
    // Test 1: Verificar módulos core
    console.log('[test] Core modules...');
    const dom = await import('../core/dom.js');
    const state = await import('../core/state.js');
    const text = await import('../core/text.js');
    console.log('[test] ✓ Core modules OK');
    
    // Test 2: Verificar data layer
    console.log('[test] Data layer...');
    const config = await import('../data/config.js');
    const api = await import('../data/secop-api.js');
    const contracts = await import('../data/secop-contracts.js');
    console.log('[test] ✓ Data layer OK');
    
    // Test 3: Verificar storage
    console.log('[test] Storage...');
    const db = await import('../storage/db.js');
    console.log('[test] ✓ Storage OK');
    
    // Test 4: Ejecutar función real
    console.log('[test] Ejecutando getEntities...');
    const result = await contracts.getEntities();
    console.log('[test] ✓ getEntities:', result.length, 'contratos');
    
    console.log('=== Todos los tests PASARON ===');
    return true;
  } catch (err) {
    console.error('=== Smoke Test FALLÓ ===', err);
    return false;
  }
}
