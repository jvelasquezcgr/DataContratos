# Analista de Expedientes Contractuales

Aplicación estática (HTML + ES Modules). Sin WordPress, sin IA.

## Cómo se conecta todo (cadena de arranque)

```
index.html
  -> <script type="module" src="./js/main.js">
       js/main.js            (ENTRADA ÚNICA: abre IndexedDB, registra módulos, arranca router)
         -> js/modules/index.js   (registra cada módulo en el router)
         -> js/router.js          (menú lateral + navigate())
              -> js/modules/entities.js  (módulo funcional)
                   -> js/data/secop-contracts.js -> secop-api.js -> config.js/soql.js
```

`main.js` es el "main" que faltaba: es lo único que carga el HTML.

Para agregar un módulo nuevo se edita **SOLO** `js/modules/index.js`.

## Ejecutar

Los ES Modules requieren HTTP, no file://:

```bash
cd analista-contratos
python3 -m http.server 8080
# abrir http://localhost:8080
```

## Prueba de humo (consola del navegador)

```js
import('./js/dev/smoke-test.js').then(m => m.runSmokeTest());
```

## Árbol

```
index.html
css/app.css
js/
  main.js            <- entrada
  router.js          <- registro + navegación
  modules/
    index.js         <- aquí se registran todos los módulos
    entities.js      <- módulo funcional
  core/   (dom, state, text, format, toast, catalogs, identity)
  data/   (config, soql, secop-api, secop-contracts, secop-documents)
  models/ (entities.js)
  storage/(db.js, repositories.js)
  dev/    (smoke-test.js)
```

## Estado

- Fase 1 y 2: reescritas.
- Router + main + registro de módulos: listos.
- Módulo entities: funcional. Resto: placeholders.
