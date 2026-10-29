/**
 * ============================================================================
 * SISTEMA DE CONTROL DE INVENTARIOS POR BODEGAS - ESTi
 * Controlador Frontend Multibodega (6 Bodegas)
 * ============================================================================
 * Bodegas Oficiales:
 * - Bodega 3 - Mantenimiento (B3)
 * - Bodega 4 - Electrónica (B4)
 * - Bodega 5 - LOMA (B5)
 * - Bodega 6 - Equipos de audio (B6)
 * - Bodega 7 - Pinturas y electricidad (B7)
 * - Bodega 8 - Jardinería (B8)
 * ============================================================================
 */

// 1. CONFIGURACIÓN Y CONSTANTES
const STORAGE_KEY_URL = 'esti_script_url';
const STORAGE_KEY_PRODUCTS = 'esti_multibodega_productos_v3';
const STORAGE_KEY_MOVEMENTS = 'esti_multibodega_movimientos_v3';
const STORAGE_KEY_INTENDENTES = 'esti_intendentes_v3';

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSlTUSW3lj3O-v1BYduHpjYoRfcZSxz2VuL2OM9dgvCF4Zwb60V_P6IAXKo--f-_Xw/exec';

// Configuración Canónica de las 6 Bodegas
const BODEGAS = {
  B3: { id: "B3", key: "bodega3", nombre: "Bodega 3 - Mantenimiento", corto: "Mantenimiento", color: "blue", badgeClass: "badge-b3" },
  B4: { id: "B4", key: "bodega4", nombre: "Bodega 4 - Electrónica", corto: "Electrónica", color: "indigo", badgeClass: "badge-b4" },
  B5: { id: "B5", key: "bodega5", nombre: "Bodega 5 - LOMA", corto: "LOMA", color: "purple", badgeClass: "badge-b5" },
  B6: { id: "B6", key: "bodega6", nombre: "Bodega 6 - Equipos de audio", corto: "Equipos de audio", color: "amber", badgeClass: "badge-b6" },
  B7: { id: "B7", key: "bodega7", nombre: "Bodega 7 - Pinturas y electricidad", corto: "Pinturas y elec", color: "rose", badgeClass: "badge-b7" },
  B8: { id: "B8", key: "bodega8", nombre: "Bodega 8 - Jardinería", corto: "Jardinería", color: "emerald", badgeClass: "badge-b8" }
};

// Lista canónica inicial por defecto de Intendentes autorizados
const INTENDENTES_DEFAULT = [
  "Hermelinda",
  "Maika",
  "Lili",
  "Diego",
  "Anita",
  "Ricardo",
  "Oscar",
  "Jesus",
  "Gabriela",
  "Cynthia",
  "Enrique"
];

// Estado dinámico y modificable de personal de intendencia
let listaIntendentes = [...INTENDENTES_DEFAULT];

// Migración automática de URL
let storedUrl = localStorage.getItem(STORAGE_KEY_URL);
if (!storedUrl || storedUrl.includes('/a/macros/uaeh.edu.mx/')) {
  storedUrl = DEFAULT_SCRIPT_URL;
  localStorage.setItem(STORAGE_KEY_URL, DEFAULT_SCRIPT_URL);
}
let scriptURL = storedUrl;

// Estado global de la aplicación
let catalogoProductos = [];
let historialMovimientos = [];
let bodegaFiltroActivo = 'ALL'; // 'ALL', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'
let tabActiva = 'inventario';
let filtroMovTipo = 'ALL';
let productoSeleccionadoParaEliminar = null;
let isSyncing = false;

// Datos de demostración iniciales para las 6 bodegas (cada producto asignado exclusivamente a su bodega)
const DATOS_DEMO = [
  {
    codigo: "LIM-001",
    descripcion: "Cloro Multiusos 1L",
    categoria: "Limpieza",
    bodegaId: "B3",
    bodegas: { bodega3: 25, bodega4: 0, bodega5: 0, bodega6: 0, bodega7: 0, bodega8: 0 },
    stock: 25,
    stockMinimo: 5,
    ultimaActualizacion: "2026-10-28 10:00:00"
  },
  {
    codigo: "HER-001",
    descripcion: "Juego de Destornilladores",
    categoria: "Herramientas",
    bodegaId: "B3",
    bodegas: { bodega3: 10, bodega4: 0, bodega5: 0, bodega6: 0, bodega7: 0, bodega8: 0 },
    stock: 10,
    stockMinimo: 3,
    ultimaActualizacion: "2026-10-28 10:00:00"
  },
  {
    codigo: "ELE-001",
    descripcion: "Multímetro Digital Profesional",
    categoria: "Electrónica",
    bodegaId: "B4",
    bodegas: { bodega3: 0, bodega4: 9, bodega5: 0, bodega6: 0, bodega7: 0, bodega8: 0 },
    stock: 9,
    stockMinimo: 2,
    ultimaActualizacion: "2026-10-28 10:00:00"
  },
  {
    codigo: "LOM-001",
    descripcion: "Filtro de Agua Industrial",
    categoria: "LOMA",
    bodegaId: "B5",
    bodegas: { bodega3: 0, bodega4: 0, bodega5: 6, bodega6: 0, bodega7: 0, bodega8: 0 },
    stock: 6,
    stockMinimo: 2,
    ultimaActualizacion: "2026-10-28 10:00:00"
  },
  {
    codigo: "AUD-001",
    descripcion: "Cable XLR Balanceado 10m",
    categoria: "Audio",
    bodegaId: "B6",
    bodegas: { bodega3: 0, bodega4: 0, bodega5: 0, bodega6: 8, bodega7: 0, bodega8: 0 },
    stock: 8,
    stockMinimo: 3,
    ultimaActualizacion: "2026-10-28 10:00:00"
  },
  {
    codigo: "PIN-001",
    descripcion: "Pintura Vinílica Blanca 19L",
    categoria: "Pinturas",
    bodegaId: "B7",
    bodegas: { bodega3: 0, bodega4: 0, bodega5: 0, bodega6: 0, bodega7: 3, bodega8: 0 },
    stock: 3,
    stockMinimo: 2,
    ultimaActualizacion: "2026-10-28 10:00:00"
  },
  {
    codigo: "JAR-001",
    descripcion: "Manguera Reforzada 25m",
    categoria: "Jardinería",
    bodegaId: "B8",
    bodegas: { bodega3: 0, bodega4: 0, bodega5: 0, bodega6: 0, bodega7: 0, bodega8: 4 },
    stock: 4,
    stockMinimo: 2,
    ultimaActualizacion: "2026-10-28 10:00:00"
  }
];

// ========================================================
// 2. INICIALIZACIÓN
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  inicializarEstado();
  renderizarIntendentes();
  configurarEventListeners();
  actualizarUICompleta();

  // Intentar sincronizar con Google Sheets en segundo plano
  sincronizarConGoogleSheets(false);
});

function inicializarEstado() {
  const localProds = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  const localMovs = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
  const localInt = localStorage.getItem(STORAGE_KEY_INTENDENTES);

  if (localInt) {
    try {
      const parsed = JSON.parse(localInt);
      if (Array.isArray(parsed) && parsed.length > 0) {
        listaIntendentes = parsed;
      } else {
        listaIntendentes = [...INTENDENTES_DEFAULT];
      }
    } catch (e) {
      listaIntendentes = [...INTENDENTES_DEFAULT];
    }
  } else {
    listaIntendentes = [...INTENDENTES_DEFAULT];
    guardarIntendentesEnLocalStorage();
  }

  if (localProds) {
    try {
      catalogoProductos = JSON.parse(localProds);
      // Garantizar que cada producto tenga el objeto bodegas y bodegaId
      catalogoProductos.forEach(p => {
        if (!p.bodegas) {
          p.bodegas = { bodega3: p.stock || 0, bodega4: 0, bodega5: 0, bodega6: 0, bodega7: 0, bodega8: 0 };
        }
        if (!p.bodegaId) {
          if (p.bodegas.bodega4 > 0) p.bodegaId = "B4";
          else if (p.bodegas.bodega5 > 0) p.bodegaId = "B5";
          else if (p.bodegas.bodega6 > 0) p.bodegaId = "B6";
          else if (p.bodegas.bodega7 > 0) p.bodegaId = "B7";
          else if (p.bodegas.bodega8 > 0) p.bodegaId = "B8";
          else p.bodegaId = "B3";
        }
      });
    } catch (e) {
      catalogoProductos = JSON.parse(JSON.stringify(DATOS_DEMO));
    }
  } else {
    catalogoProductos = JSON.parse(JSON.stringify(DATOS_DEMO));
    guardarEnLocalStorage();
  }

  if (localMovs) {
    try {
      historialMovimientos = JSON.parse(localMovs);
    } catch (e) {
      historialMovimientos = [];
    }
  }
}

function guardarEnLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(catalogoProductos));
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(historialMovimientos));
  } catch (err) {
    console.error("Error al guardar en LocalStorage:", err);
  }
}

function guardarIntendentesEnLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_INTENDENTES, JSON.stringify(listaIntendentes));
  } catch (err) {
    console.error("Error al guardar intendentes en LocalStorage:", err);
  }
}

// ========================================================
// 3. SINCRONIZACIÓN CON GOOGLE APPS SCRIPT
// ========================================================
async function sincronizarConGoogleSheets(mostrarToastExito = true) {
  if (isSyncing) return;
  isSyncing = true;
  actualizarIconoSincronizacion(true);

  if (!scriptURL) {
    actualizarBadgeConexion(false, "Falta URL");
    actualizarIconoSincronizacion(false);
    isSyncing = false;
    return;
  }

  try {
    const url = `${scriptURL}?action=obtenerDatos&t=${Date.now()}`;
    const response = await fetch(url, { method: 'GET', mode: 'cors' });

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const res = await response.json();

    if (res.success && res.data) {
      if (Array.isArray(res.data.inventario) && res.data.inventario.length > 0) {
        catalogoProductos = res.data.inventario;
      }
      if (Array.isArray(res.data.movimientos)) {
        historialMovimientos = res.data.movimientos;
      }
      if (Array.isArray(res.data.intendentes) && res.data.intendentes.length > 0) {
        listaIntendentes = res.data.intendentes;
        guardarIntendentesEnLocalStorage();
      }

      guardarEnLocalStorage();
      actualizarUICompleta();
      renderizarIntendentes();
      actualizarBadgeConexion(true, "Conectado a Sheets");

      if (mostrarToastExito) {
        mostrarToast("Sincronización completa con Google Sheets", "success");
      }
    } else {
      throw new Error(res.error || "Respuesta sin datos");
    }
  } catch (error) {
    console.warn("Aviso de sincronización:", error);
    actualizarBadgeConexion(false, "Modo Local");
    if (mostrarToastExito) {
      mostrarToast("Operando en modo local (sin conexión a Sheets)", "warning");
    }
  } finally {
    actualizarIconoSincronizacion(false);
    isSyncing = false;
  }
}

async function enviarPeticionAppsScript(payload) {
  if (!scriptURL) return { success: false, error: "URL no configurada" };

  try {
    const response = await fetch(scriptURL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      mode: 'cors'
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("Error al enviar petición a Apps Script:", err);
    return { success: false, error: err.message };
  }
}

function actualizarBadgeConexion(online, texto) {
  const badge = document.getElementById('statusBadge');
  const textElem = document.getElementById('statusText');
  if (!badge || !textElem) return;

  textElem.textContent = texto;
  if (online) {
    badge.className = "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200";
    badge.firstElementChild.className = "h-2 w-2 rounded-full bg-emerald-500 animate-pulse";
  } else {
    badge.className = "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200";
    badge.firstElementChild.className = "h-2 w-2 rounded-full bg-amber-500";
  }
}

function actualizarIconoSincronizacion(animar) {
  const icon = document.getElementById('syncIcon');
  if (!icon) return;
  if (animar) icon.classList.add('spin-slow');
  else icon.classList.remove('spin-slow');
}

// ========================================================
// 4. OPERACIONES DE NEGOCIO (ENTRADAS, SALIDAS Y TRASPASOS)
// ========================================================

/**
 * Registra una entrada a una bodega específica
 */
async function procesarEntradaForm(e) {
  e.preventDefault();

  const bodegaId = document.getElementById('entradaBodegaSelect').value || 'B3';
  const codigo = document.getElementById('entradaProductoSelect').value;
  const cantidad = parseInt(document.getElementById('entradaCantidad').value, 10);
  const origen = document.getElementById('entradaOrigen').value.trim() || "Compra / Almacén";
  const notas = document.getElementById('entradaNotas').value.trim();

  if (!codigo) return mostrarToast("Por favor selecciona un producto.", "warning");
  if (isNaN(cantidad) || cantidad <= 0) return mostrarToast("La cantidad debe ser mayor a 0.", "warning");

  const prod = catalogoProductos.find(p => p.codigo === codigo);
  if (!prod) return mostrarToast("Producto no encontrado en catálogo.", "error");

  const bodegaInfo = BODEGAS[bodegaId] || BODEGAS.B3;
  const key = bodegaInfo.key;

  if (!prod.bodegas) prod.bodegas = { bodega3: 0, bodega4: 0, bodega5: 0, bodega6: 0, bodega7: 0, bodega8: 0 };

  // 1. Actualización optimista local
  prod.bodegas[key] = (prod.bodegas[key] || 0) + cantidad;
  prod.stock = Object.values(prod.bodegas).reduce((acc, v) => acc + (Number(v) || 0), 0);
  prod.ultimaActualizacion = new Date().toLocaleString();

  const now = new Date();
  const fechaStr = now.toISOString().slice(0, 10);
  const horaStr = now.toTimeString().slice(0, 8);
  const idMov = "ENT-" + now.getTime();

  historialMovimientos.unshift({
    id: idMov,
    tipo: "ENTRADA",
    fecha: fechaStr,
    hora: horaStr,
    bodega: bodegaInfo.nombre,
    codigo: prod.codigo,
    descripcion: prod.descripcion,
    cantidad: cantidad,
    responsable: origen,
    observaciones: notas
  });

  guardarEnLocalStorage();
  actualizarUICompleta();
  cerrarTodosLosModales();
  document.getElementById('formEntrada').reset();
  mostrarToast(`+${cantidad} piezas ingresadas a ${bodegaInfo.corto}`, "success");

  // 2. Enviar a Google Sheets
  enviarPeticionAppsScript({
    action: "registrarEntrada",
    bodega: bodegaId,
    codigo: prod.codigo,
    descripcion: prod.descripcion,
    cantidad: cantidad,
    origen: origen,
    observaciones: notas
  });
}

/**
 * Registra una salida desde una bodega específica
 */
async function procesarSalidaForm(e) {
  e.preventDefault();

  const bodegaId = document.getElementById('salidaBodegaSelect').value || 'B3';
  const codigo = document.getElementById('salidaProductoSelect').value;
  const cantidad = parseInt(document.getElementById('salidaCantidad').value, 10);
  const intendente = document.getElementById('salidaIntendenteSelect').value;
  const notas = document.getElementById('salidaNotas').value.trim();

  if (!codigo) return mostrarToast("Por favor selecciona un producto.", "warning");
  if (isNaN(cantidad) || cantidad <= 0) return mostrarToast("La cantidad debe ser mayor a 0.", "warning");
  if (!intendente) return mostrarToast("Por favor selecciona un intendente solicitante.", "warning");

  const prod = catalogoProductos.find(p => p.codigo === codigo);
  if (!prod) return mostrarToast("Producto no encontrado en catálogo.", "error");

  const bodegaInfo = BODEGAS[bodegaId] || BODEGAS.B3;
  const key = bodegaInfo.key;
  const stockEnBodega = (prod.bodegas && prod.bodegas[key]) ? prod.bodegas[key] : 0;

  if (stockEnBodega < cantidad) {
    return mostrarToast(`Stock insuficiente en ${bodegaInfo.corto}. Solo hay ${stockEnBodega} pieza(s).`, "error");
  }

  // 1. Actualización optimista local
  prod.bodegas[key] -= cantidad;
  prod.stock = Object.values(prod.bodegas).reduce((acc, v) => acc + (Number(v) || 0), 0);
  prod.ultimaActualizacion = new Date().toLocaleString();

  const now = new Date();
  const fechaStr = now.toISOString().slice(0, 10);
  const horaStr = now.toTimeString().slice(0, 8);
  const idMov = "SAL-" + now.getTime();

  historialMovimientos.unshift({
    id: idMov,
    tipo: "SALIDA",
    fecha: fechaStr,
    hora: horaStr,
    bodega: bodegaInfo.nombre,
    codigo: prod.codigo,
    descripcion: prod.descripcion,
    cantidad: cantidad,
    responsable: intendente,
    observaciones: notas
  });

  guardarEnLocalStorage();
  actualizarUICompleta();
  cerrarTodosLosModales();
  document.getElementById('formSalida').reset();
  mostrarToast(`-${cantidad} piezas retiradas de ${bodegaInfo.corto} para ${intendente}`, "success");

  // 2. Enviar a Google Sheets
  enviarPeticionAppsScript({
    action: "registrarSalida",
    bodega: bodegaId,
    codigo: prod.codigo,
    descripcion: prod.descripcion,
    cantidad: cantidad,
    intendente: intendente,
    observaciones: notas
  });
}

/**
 * Traspaso entre bodegas
 */
async function procesarTraspasoForm(e) {
  e.preventDefault();

  const codigo = document.getElementById('traspasoProductoSelect').value;
  const origenId = document.getElementById('traspasoOrigenSelect').value;
  const destinoId = document.getElementById('traspasoDestinoSelect').value;
  const cantidad = parseInt(document.getElementById('traspasoCantidad').value, 10);
  const responsable = document.getElementById('traspasoResponsable').value.trim() || "Personal";
  const notas = document.getElementById('traspasoNotas').value.trim();

  if (!codigo) return mostrarToast("Selecciona un producto.", "warning");
  if (origenId === destinoId) return mostrarToast("La bodega de origen y destino no pueden ser la misma.", "warning");
  if (isNaN(cantidad) || cantidad <= 0) return mostrarToast("Cantidad inválida.", "warning");

  const prod = catalogoProductos.find(p => p.codigo === codigo);
  if (!prod) return mostrarToast("Producto no encontrado.", "error");

  const bOrigen = BODEGAS[origenId];
  const bDestino = BODEGAS[destinoId];
  const stockOrigen = (prod.bodegas && prod.bodegas[bOrigen.key]) ? prod.bodegas[bOrigen.key] : 0;

  if (stockOrigen < cantidad) {
    return mostrarToast(`Stock insuficiente en ${bOrigen.corto}. Disponible: ${stockOrigen}`, "error");
  }

  // 1. Actualización optimista local
  prod.bodegas[bOrigen.key] -= cantidad;
  prod.bodegas[bDestino.key] = (prod.bodegas[bDestino.key] || 0) + cantidad;
  prod.stock = Object.values(prod.bodegas).reduce((acc, v) => acc + (Number(v) || 0), 0);
  prod.ultimaActualizacion = new Date().toLocaleString();

  const now = new Date();
  const fechaStr = now.toISOString().slice(0, 10);
  const horaStr = now.toTimeString().slice(0, 8);
  const idMov = "TRA-" + now.getTime();

  historialMovimientos.unshift({
    id: idMov,
    tipo: "TRASPASO",
    fecha: fechaStr,
    hora: horaStr,
    bodega: `${bOrigen.corto} ➔ ${bDestino.corto}`,
    codigo: prod.codigo,
    descripcion: prod.descripcion,
    cantidad: cantidad,
    responsable: responsable,
    observaciones: notas
  });

  guardarEnLocalStorage();
  actualizarUICompleta();
  cerrarTodosLosModales();
  document.getElementById('formTraspaso').reset();
  mostrarToast(`Traspaso completado: ${cantidad} piezas de ${bOrigen.corto} a ${bDestino.corto}`, "success");

  // 2. Enviar a Google Sheets
  enviarPeticionAppsScript({
    action: "registrarTraspaso",
    bodegaOrigen: origenId,
    bodegaDestino: destinoId,
    codigo: prod.codigo,
    descripcion: prod.descripcion,
    cantidad: cantidad,
    responsable: responsable,
    observaciones: notas
  });
}

/**
 * Guarda o actualiza un producto en la bodega seleccionada exclusivamente
 */
async function procesarProductoForm(e) {
  e.preventDefault();

  const isEdit = document.getElementById('prodEditMode').value === "true";
  const codigo = document.getElementById('prodCodigo').value.trim().toUpperCase();
  const descripcion = document.getElementById('prodDescripcion').value.trim();
  const categoria = document.getElementById('prodCategoria').value.trim() || "General";
  const bodegaId = document.getElementById('prodBodegaSelect')?.value || 'B3';
  const stock = parseInt(document.getElementById('prodStock')?.value, 10) || 0;
  const stockMinimo = parseInt(document.getElementById('prodStockMinimo')?.value, 10) || 5;

  if (!codigo || !descripcion) return mostrarToast("Código y descripción son obligatorios.", "warning");

  const bodegaInfo = BODEGAS[bodegaId] || BODEGAS.B3;

  // El stock inicial se registra exclusivamente en la bodega seleccionada, las demás inician en 0
  const bodegasObj = {
    bodega3: 0,
    bodega4: 0,
    bodega5: 0,
    bodega6: 0,
    bodega7: 0,
    bodega8: 0
  };
  bodegasObj[bodegaInfo.key] = stock;

  if (isEdit) {
    const prod = catalogoProductos.find(p => p.codigo === codigo);
    if (prod) {
      prod.descripcion = descripcion;
      prod.categoria = categoria;
      prod.stockMinimo = stockMinimo;
      prod.bodegaId = bodegaId;
      prod.bodegas = bodegasObj;
      prod.stock = stock;
      prod.ultimaActualizacion = new Date().toLocaleString();
      mostrarToast(`Producto ${codigo} actualizado en ${bodegaInfo.corto}.`, "success");
    }
  } else {
    if (catalogoProductos.some(p => p.codigo === codigo)) {
      return mostrarToast(`Ya existe un producto con el código ${codigo}.`, "error");
    }

    catalogoProductos.push({
      codigo,
      descripcion,
      categoria,
      bodegaId,
      bodegas: bodegasObj,
      stock,
      stockMinimo,
      ultimaActualizacion: new Date().toLocaleString()
    });
    mostrarToast(`Producto ${codigo} registrado exclusivamente en ${bodegaInfo.corto}.`, "success");
  }

  guardarEnLocalStorage();
  actualizarUICompleta();
  cerrarTodosLosModales();
  document.getElementById('formProducto').reset();

  enviarPeticionAppsScript({
    action: isEdit ? "actualizarProducto" : "nuevoProducto",
    codigo,
    descripcion,
    categoria,
    bodega: bodegaId,
    stock,
    stockMinimo,
    bodega3: bodegasObj.bodega3,
    bodega4: bodegasObj.bodega4,
    bodega5: bodegasObj.bodega5,
    bodega6: bodegasObj.bodega6,
    bodega7: bodegasObj.bodega7,
    bodega8: bodegasObj.bodega8
  });
}

/**
 * Elimina un producto del catálogo
 */
async function confirmarEliminacionProducto() {
  if (!productoSeleccionadoParaEliminar) return;

  const codigo = productoSeleccionadoParaEliminar;
  catalogoProductos = catalogoProductos.filter(p => p.codigo !== codigo);

  guardarEnLocalStorage();
  actualizarUICompleta();
  cerrarTodosLosModales();
  mostrarToast(`Producto ${codigo} eliminado.`, "info");

  productoSeleccionadoParaEliminar = null;

  enviarPeticionAppsScript({
    action: "eliminarProducto",
    codigo: codigo
  });
}

// ========================================================
// 5. RENDERIZADO Y CONTROLADORES DE INTERFAZ
// ========================================================

function actualizarUICompleta() {
  actualizarEstadisticasKPI();
  poblarCategoriasFiltro();
  renderizarTablaProductos();
  renderizarTablaMovimientos();
  poblarSelectsDeProductos();
}

/**
 * Calcula y renderiza las tarjetas de resumen según la bodega activa
 */
function actualizarEstadisticasKPI() {
  const statTotalProd = document.getElementById('statTotalProductos');
  const statTotalStock = document.getElementById('statTotalStock');
  const statStockBajo = document.getElementById('statStockBajo');
  const statTotalMovs = document.getElementById('statTotalMovimientos');
  const statStockLabel = document.getElementById('statStockLabel');
  const statStockSubLabel = document.getElementById('statStockSubLabel');

  let totalProductos = 0;
  let totalStock = 0;
  let bajoStock = 0;

  if (bodegaFiltroActivo === 'ALL') {
    totalProductos = catalogoProductos.length;
    totalStock = catalogoProductos.reduce((acc, p) => acc + (p.stock || 0), 0);
    bajoStock = catalogoProductos.filter(p => (p.stock || 0) <= (p.stockMinimo || 5)).length;
    if (statStockLabel) statStockLabel.textContent = "Stock Total";
    if (statStockSubLabel) statStockSubLabel.textContent = "En las 6 bodegas";
  } else {
    const bInfo = BODEGAS[bodegaFiltroActivo];
    const key = bInfo.key;
    // Solo productos que pertenecen a esta bodega o tienen stock físico aquí
    const prodsEnBodega = catalogoProductos.filter(p => {
      const stockEnBodega = (p.bodegas && p.bodegas[key]) || 0;
      const pertenece = (p.bodegaId === bodegaFiltroActivo);
      return pertenece || stockEnBodega > 0;
    });

    totalProductos = prodsEnBodega.length;
    totalStock = prodsEnBodega.reduce((acc, p) => acc + ((p.bodegas && p.bodegas[key]) || 0), 0);
    bajoStock = prodsEnBodega.filter(p => {
      const s = (p.bodegas && p.bodegas[key]) || 0;
      return s <= (p.stockMinimo || 5);
    }).length;

    if (statStockLabel) statStockLabel.textContent = `Stock en ${bInfo.corto}`;
    if (statStockSubLabel) statStockSubLabel.textContent = "Piezas en esta bodega";
  }

  if (statTotalProd) statTotalProd.textContent = totalProductos;
  if (statTotalStock) statTotalStock.textContent = totalStock;
  if (statStockBajo) statStockBajo.textContent = bajoStock;
  if (statTotalMovs) statTotalMovs.textContent = historialMovimientos.length;
}

/**
 * Renderiza la lista de productos filtrada
 */
function renderizarTablaProductos() {
  const tbody = document.getElementById('tablaProductosBody');
  const noResults = document.getElementById('noResults');
  const colHeaderStock = document.getElementById('colHeaderStock');
  if (!tbody) return;

  const query = (document.getElementById('inputBuscar')?.value || "").toLowerCase().trim();
  const filterEstado = document.getElementById('filterEstado')?.value || "ALL";
  const filterCat = document.getElementById('filterCategoria')?.value || "ALL";

  if (colHeaderStock) {
    if (bodegaFiltroActivo === 'ALL') {
      colHeaderStock.textContent = "Stock / Desglose";
    } else {
      colHeaderStock.textContent = `Stock en ${BODEGAS[bodegaFiltroActivo].corto}`;
    }
  }

  const filtrados = catalogoProductos.filter(p => {
    // Si estamos en una bodega específica, excluir productos que no pertenezcan y no tengan stock
    if (bodegaFiltroActivo !== 'ALL') {
      const key = BODEGAS[bodegaFiltroActivo].key;
      const stockEnEstaBodega = (p.bodegas && p.bodegas[key]) || 0;
      const pertenece = (p.bodegaId === bodegaFiltroActivo);
      if (!pertenece && stockEnEstaBodega === 0) {
        return false;
      }
    }

    // 1. Filtro textual
    const matchText = p.codigo.toLowerCase().includes(query) ||
                      p.descripcion.toLowerCase().includes(query) ||
                      p.categoria.toLowerCase().includes(query);
    if (!matchText) return false;

    // Obtener stock evaluado (global o de la bodega seleccionada)
    const stockEvaluado = bodegaFiltroActivo === 'ALL'
      ? (p.stock || 0)
      : ((p.bodegas && p.bodegas[BODEGAS[bodegaFiltroActivo].key]) || 0);

    // 2. Filtro de estado
    if (filterEstado === 'IN_STOCK' && stockEvaluado <= (p.stockMinimo || 5)) return false;
    if (filterEstado === 'LOW_STOCK' && (stockEvaluado > (p.stockMinimo || 5) || stockEvaluado === 0)) return false;
    if (filterEstado === 'EMPTY' && stockEvaluado > 0) return false;

    // 3. Filtro de categoría
    if (filterCat !== 'ALL' && p.categoria !== filterCat) return false;

    return true;
  });

  tbody.innerHTML = '';

  if (filtrados.length === 0) {
    if (noResults) noResults.classList.remove('hidden');
    return;
  }

  if (noResults) noResults.classList.add('hidden');

  filtrados.forEach(prod => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50/80 transition-colors";

    const stockActual = bodegaFiltroActivo === 'ALL'
      ? (prod.stock || 0)
      : ((prod.bodegas && prod.bodegas[BODEGAS[bodegaFiltroActivo].key]) || 0);

    // Badge de estado
    let badgeHtml = '';
    if (stockActual === 0) {
      badgeHtml = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold badge-stock-empty">
        <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Agotado
      </span>`;
    } else if (stockActual <= prod.stockMinimo) {
      badgeHtml = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold badge-stock-low">
        <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Stock Bajo
      </span>`;
    } else {
      badgeHtml = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold badge-stock-ok">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> En Stock
      </span>`;
    }

    // Desglose visual por bodegas
    let desgloseHtml = '';
    if (bodegaFiltroActivo === 'ALL') {
      const b3 = (prod.bodegas && prod.bodegas.bodega3) || 0;
      const b4 = (prod.bodegas && prod.bodegas.bodega4) || 0;
      const b5 = (prod.bodegas && prod.bodegas.bodega5) || 0;
      const b6 = (prod.bodegas && prod.bodegas.bodega6) || 0;
      const b7 = (prod.bodegas && prod.bodegas.bodega7) || 0;
      const b8 = (prod.bodegas && prod.bodegas.bodega8) || 0;

      desgloseHtml = `
        <div class="flex items-center justify-center gap-1 mt-1 flex-wrap max-w-xs mx-auto">
          ${b3 > 0 ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold badge-b3" title="Bodega 3 - Mantenimiento: ${b3}">B3:${b3}</span>` : ''}
          ${b4 > 0 ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold badge-b4" title="Bodega 4 - Electrónica: ${b4}">B4:${b4}</span>` : ''}
          ${b5 > 0 ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold badge-b5" title="Bodega 5 - LOMA: ${b5}">B5:${b5}</span>` : ''}
          ${b6 > 0 ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold badge-b6" title="Bodega 6 - Audio: ${b6}">B6:${b6}</span>` : ''}
          ${b7 > 0 ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold badge-b7" title="Bodega 7 - Pinturas/Elec: ${b7}">B7:${b7}</span>` : ''}
          ${b8 > 0 ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold badge-b8" title="Bodega 8 - Jardinería: ${b8}">B8:${b8}</span>` : ''}
        </div>
      `;
    } else {
      desgloseHtml = `<span class="text-[10px] text-slate-400 font-medium block">Total en 6 bodegas: ${prod.stock || 0}</span>`;
    }

    const bAsignada = BODEGAS[prod.bodegaId] || BODEGAS.B3;
    const bodegaBadge = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${bAsignada.badgeClass}">${bAsignada.corto}</span>`;

    tr.innerHTML = `
      <td class="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[130px]">
        <span class="badge-codigo-producto" title="Código: ${escapeHtml(prod.codigo)}">
          ${escapeHtml(prod.codigo)}
        </span>
      </td>
      <td class="py-3.5 px-4">
        <div class="font-bold text-slate-900">${escapeHtml(prod.descripcion)}</div>
      </td>
      <td class="py-3.5 px-4">
        <span class="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
          ${escapeHtml(prod.categoria)}
        </span>
      </td>
      <td class="py-3.5 px-4 text-center">
        ${bodegaBadge}
      </td>
      <td class="py-3.5 px-4 text-center">
        <div class="flex flex-col items-center">
          <span class="text-base font-black ${stockActual === 0 ? 'text-rose-600' : (stockActual <= prod.stockMinimo ? 'text-amber-600' : 'text-slate-900')}">
            ${stockActual}
          </span>
          ${desgloseHtml}
        </div>
      </td>
      <td class="py-3.5 px-4 text-center">
        <span class="text-xs font-bold text-slate-500">${prod.stockMinimo}</span>
      </td>
      <td class="py-3.5 px-4 text-center">
        ${badgeHtml}
      </td>
      <td class="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
        <div class="flex items-center justify-end gap-1.5">
          <!-- Entrada -->
          <button onclick="abrirEntradaConProducto('${escapeHtml(prod.codigo)}')" title="Registrar Entrada"
            class="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer active:scale-95 transition-all">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <!-- Salida -->
          <button onclick="abrirSalidaConProducto('${escapeHtml(prod.codigo)}')" title="Registrar Salida"
            class="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer active:scale-95 transition-all">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>

          <!-- Traspaso -->
          <button onclick="abrirTraspasoConProducto('${escapeHtml(prod.codigo)}')" title="Traspasar entre bodegas"
            class="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer active:scale-95 transition-all">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          <!-- Editar -->
          <button onclick="abrirEditarProducto('${escapeHtml(prod.codigo)}')" title="Editar Producto"
            class="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer active:scale-95 transition-all">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <!-- Eliminar -->
          <button onclick="abrirModalEliminar('${escapeHtml(prod.codigo)}')" title="Eliminar Producto"
            class="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 cursor-pointer active:scale-95 transition-all">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Renderiza el historial de movimientos
 */
function renderizarTablaMovimientos() {
  const tbody = document.getElementById('tablaMovimientosBody');
  const noMovs = document.getElementById('noMovements');
  if (!tbody) return;

  const filtrados = historialMovimientos.filter(m => {
    if (filtroMovTipo === 'ENTRADA' && m.tipo !== 'ENTRADA') return false;
    if (filtroMovTipo === 'SALIDA' && m.tipo !== 'SALIDA') return false;
    if (filtroMovTipo === 'TRASPASO' && m.tipo !== 'TRASPASO') return false;
    return true;
  });

  tbody.innerHTML = '';

  if (filtrados.length === 0) {
    if (noMovs) noMovs.classList.remove('hidden');
    return;
  }

  if (noMovs) noMovs.classList.add('hidden');

  filtrados.forEach(mov => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50/80 transition-colors";

    let tipoBadge = '';
    let cantidadSign = '';
    let cantidadClass = '';

    if (mov.tipo === 'ENTRADA') {
      tipoBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-mov-entrada"><svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg> Entrada</span>`;
      cantidadSign = '+';
      cantidadClass = 'text-emerald-700 font-black';
    } else if (mov.tipo === 'SALIDA') {
      tipoBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-mov-salida"><svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg> Salida</span>`;
      cantidadSign = '-';
      cantidadClass = 'text-rose-700 font-black';
    } else {
      tipoBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-mov-traspaso"><svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg> Traspaso</span>`;
      cantidadSign = '↔ ';
      cantidadClass = 'text-indigo-700 font-black';
    }

    tr.innerHTML = `
      <td class="py-3.5 px-4 sm:px-6 whitespace-nowrap">
        <div class="font-bold text-slate-800 text-xs">${escapeHtml(mov.fecha || '')}</div>
        <div class="text-[11px] text-slate-400 font-mono">${escapeHtml(mov.hora || '')}</div>
      </td>
      <td class="py-3.5 px-4 text-center whitespace-nowrap">
        ${tipoBadge}
      </td>
      <td class="py-3.5 px-4 whitespace-nowrap">
        <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          ${escapeHtml(mov.bodega || 'B3')}
        </span>
      </td>
      <td class="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
        <span class="badge-codigo-producto" title="Código: ${escapeHtml(mov.codigo)}">
          ${escapeHtml(mov.codigo)}
        </span>
      </td>
      <td class="py-3.5 px-4 font-semibold text-slate-900">
        ${escapeHtml(mov.descripcion || '')}
      </td>
      <td class="py-3.5 px-4 text-center whitespace-nowrap">
        <span class="text-sm ${cantidadClass}">
          ${cantidadSign}${mov.cantidad}
        </span>
      </td>
      <td class="py-3.5 px-4 font-medium text-slate-800">
        ${escapeHtml(mov.responsable || 'General')}
      </td>
      <td class="py-3.5 px-4 sm:px-6 text-slate-500 text-xs">
        ${escapeHtml(mov.observaciones || '—')}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function poblarCategoriasFiltro() {
  const select = document.getElementById('filterCategoria');
  if (!select) return;

  const actual = select.value;
  const cats = Array.from(new Set(catalogoProductos.map(p => p.categoria).filter(Boolean))).sort();

  select.innerHTML = '<option value="ALL">Todas las Categorías</option>';
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === actual) opt.selected = true;
    select.appendChild(opt);
  });
}

function poblarSelectsDeProductos() {
  const selectEnt = document.getElementById('entradaProductoSelect');
  const selectSal = document.getElementById('salidaProductoSelect');
  const selectTra = document.getElementById('traspasoProductoSelect');

  const optionsHtml = ['<option value="" disabled selected>Selecciona un producto...</option>']
    .concat(catalogoProductos.map(p =>
      `<option value="${escapeHtml(p.codigo)}">[${escapeHtml(p.codigo)}] ${escapeHtml(p.descripcion)} (${BODEGAS[p.bodegaId]?.corto || 'B3'} | Stock: ${p.stock || 0})</option>`
    )).join('');

  if (selectEnt) selectEnt.innerHTML = optionsHtml;
  if (selectSal) selectSal.innerHTML = optionsHtml;
  if (selectTra) selectTra.innerHTML = optionsHtml;
}

function renderizarIntendentes() {
  const container = document.getElementById('intendentesChipsContainer');
  const select = document.getElementById('salidaIntendenteSelect');
  if (!container || !select) return;

  const prevValue = select.value;
  container.innerHTML = '';
  select.innerHTML = '<option value="" disabled selected>Selecciona un intendente...</option>';

  listaIntendentes.forEach(nombre => {
    const opt = document.createElement('option');
    opt.value = nombre;
    opt.textContent = nombre;
    if (nombre === prevValue) opt.selected = true;
    select.appendChild(opt);

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `intendente-chip ${nombre === prevValue ? 'selected' : ''}`;
    chip.innerHTML = `
      <svg class="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>${escapeHtml(nombre)}</span>
    `;

    chip.addEventListener('click', () => {
      container.querySelectorAll('.intendente-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      select.value = nombre;
    });

    container.appendChild(chip);
  });

  select.addEventListener('change', () => {
    const val = select.value;
    container.querySelectorAll('.intendente-chip').forEach(c => {
      if (c.textContent.trim() === val) c.classList.add('selected');
      else c.classList.remove('selected');
    });
  });
}

/**
 * Renderiza la lista de intendentes dentro del modal de administración
 */
function renderizarListaAdminIntendentes() {
  const container = document.getElementById('listaIntendentesAdmin');
  const contador = document.getElementById('contadorIntendentes');
  if (!container) return;

  container.innerHTML = '';
  if (contador) contador.textContent = listaIntendentes.length;

  if (listaIntendentes.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400 text-xs font-medium">
        No hay intendentes registrados actualmente. Agrega uno usando el formulario de arriba.
      </div>
    `;
    return;
  }

  listaIntendentes.forEach(nombre => {
    const item = document.createElement('div');
    item.className = 'intendente-admin-item';

    // Generar iniciales del nombre
    const partes = nombre.trim().split(/\s+/);
    const iniciales = partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : nombre.substring(0, 2).toUpperCase();

    item.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0">
          ${escapeHtml(iniciales)}
        </div>
        <div>
          <span class="text-xs sm:text-sm font-bold text-slate-800">${escapeHtml(nombre)}</span>
          <span class="block text-[10px] text-slate-400 font-medium">Personal de intendencia autorizado</span>
        </div>
      </div>
      <button type="button" onclick="eliminarIntendente('${escapeHtml(nombre)}')" title="Dar de baja a ${escapeHtml(nombre)}"
        class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer active:scale-95">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    `;
    container.appendChild(item);
  });
}

/**
 * Agrega un nuevo intendente a la lista oficial
 */
async function procesarAgregarIntendente(e) {
  e.preventDefault();
  const input = document.getElementById('inputNuevoIntendente');
  if (!input) return;

  const nombre = input.value.trim();
  if (!nombre) return mostrarToast("Por favor escribe el nombre del intendente.", "warning");

  // Validar si ya existe
  const existe = listaIntendentes.some(n => n.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    return mostrarToast(`El intendente "${nombre}" ya está registrado.`, "warning");
  }

  listaIntendentes.push(nombre);
  listaIntendentes.sort((a, b) => a.localeCompare(b));
  guardarIntendentesEnLocalStorage();

  renderizarIntendentes();
  renderizarListaAdminIntendentes();

  input.value = '';
  mostrarToast(`Intendente "${nombre}" agregado con éxito.`, "success");

  // Sincronizar en Google Sheets
  enviarPeticionAppsScript({
    action: "agregarIntendente",
    nombre: nombre
  });
}

/**
 * Elimina un intendente de la lista
 */
window.eliminarIntendente = function (nombre) {
  if (!nombre) return;

  const confirma = confirm(`¿Estás seguro de que deseas eliminar a "${nombre}" de la lista de intendentes autorizados?`);
  if (!confirma) return;

  listaIntendentes = listaIntendentes.filter(n => n.toLowerCase() !== nombre.toLowerCase());
  guardarIntendentesEnLocalStorage();

  renderizarIntendentes();
  renderizarListaAdminIntendentes();

  mostrarToast(`Intendente "${nombre}" eliminado del sistema.`, "info");

  // Sincronizar en Google Sheets
  enviarPeticionAppsScript({
    action: "eliminarIntendente",
    nombre: nombre
  });
};

// ========================================================
// 6. ACCIONES DIRECTAS EN FILAS
// ========================================================

window.abrirEntradaConProducto = function (codigo) {
  abrirModal('modalEntrada');
  const select = document.getElementById('entradaProductoSelect');
  const bSelect = document.getElementById('entradaBodegaSelect');
  if (bSelect && bodegaFiltroActivo !== 'ALL') bSelect.value = bodegaFiltroActivo;
  if (select) {
    select.value = codigo;
    actualizarPreviewEntrada();
  }
};

window.abrirSalidaConProducto = function (codigo) {
  abrirModal('modalSalida');
  const select = document.getElementById('salidaProductoSelect');
  const bSelect = document.getElementById('salidaBodegaSelect');
  if (bSelect && bodegaFiltroActivo !== 'ALL') bSelect.value = bodegaFiltroActivo;
  if (select) {
    select.value = codigo;
    actualizarPreviewSalida();
  }
};

window.abrirTraspasoConProducto = function (codigo) {
  abrirModal('modalTraspaso');
  const select = document.getElementById('traspasoProductoSelect');
  const origenSelect = document.getElementById('traspasoOrigenSelect');
  if (origenSelect && bodegaFiltroActivo !== 'ALL') origenSelect.value = bodegaFiltroActivo;
  if (select) {
    select.value = codigo;
    actualizarPreviewTraspaso();
  }
};

window.abrirEditarProducto = function (codigo) {
  const prod = catalogoProductos.find(p => p.codigo === codigo);
  if (!prod) return;

  document.getElementById('modalProductoTitle').textContent = `Editar Producto ${prod.codigo}`;
  document.getElementById('prodEditMode').value = "true";

  const codInput = document.getElementById('prodCodigo');
  codInput.value = prod.codigo;
  codInput.readOnly = true;
  codInput.classList.add('bg-slate-100');

  document.getElementById('prodDescripcion').value = prod.descripcion;
  document.getElementById('prodCategoria').value = prod.categoria;
  document.getElementById('prodStockMinimo').value = prod.stockMinimo;

  const bSelect = document.getElementById('prodBodegaSelect');
  if (bSelect) {
    bSelect.value = prod.bodegaId || 'B3';
  }

  const stockInput = document.getElementById('prodStock');
  if (stockInput) {
    const bKey = BODEGAS[prod.bodegaId || 'B3'] ? BODEGAS[prod.bodegaId || 'B3'].key : 'bodega3';
    stockInput.value = (prod.bodegas && prod.bodegas[bKey] !== undefined) ? prod.bodegas[bKey] : (prod.stock || 0);
  }

  abrirModal('modalProducto');
};

window.abrirModalEliminar = function (codigo) {
  const prod = catalogoProductos.find(p => p.codigo === codigo);
  if (!prod) return;

  productoSeleccionadoParaEliminar = codigo;
  const txt = document.getElementById('deleteProductText');
  if (txt) {
    txt.textContent = `¿Seguro que deseas eliminar "${prod.descripcion}" (${prod.codigo}) de todas las bodegas?`;
  }
  abrirModal('modalEliminar');
};

// ========================================================
// 7. PREVIEWS DE STOCK EN MODALES
// ========================================================
function actualizarPreviewEntrada() {
  const cod = document.getElementById('entradaProductoSelect')?.value;
  const bId = document.getElementById('entradaBodegaSelect')?.value || 'B3';
  const preview = document.getElementById('entradaStockPreview');
  const currElem = document.getElementById('entradaCurrentStock');

  if (!cod || !preview || !currElem) return;
  const prod = catalogoProductos.find(p => p.codigo === cod);
  if (prod) {
    const key = BODEGAS[bId].key;
    const stockBodega = (prod.bodegas && prod.bodegas[key]) ? prod.bodegas[key] : 0;
    currElem.textContent = stockBodega;
    preview.classList.remove('hidden');
  }
}

function actualizarPreviewSalida() {
  const cod = document.getElementById('salidaProductoSelect')?.value;
  const bId = document.getElementById('salidaBodegaSelect')?.value || 'B3';
  const preview = document.getElementById('salidaStockPreview');
  const currElem = document.getElementById('salidaCurrentStock');
  const warnElem = document.getElementById('salidaStockWarning');
  const cantInput = document.getElementById('salidaCantidad');

  if (!cod || !preview || !currElem) return;
  const prod = catalogoProductos.find(p => p.codigo === cod);
  if (prod) {
    const key = BODEGAS[bId].key;
    const stockBodega = (prod.bodegas && prod.bodegas[key]) ? prod.bodegas[key] : 0;
    currElem.textContent = stockBodega;
    preview.classList.remove('hidden');
    cantInput.max = stockBodega;

    if (stockBodega === 0) {
      warnElem.textContent = "⚠️ ¡Agotado en esta bodega!";
      warnElem.className = "text-[11px] font-bold text-rose-600";
    } else {
      warnElem.textContent = "Disponible en esta bodega";
      warnElem.className = "text-[11px] font-semibold text-emerald-600";
    }
  }
}

function actualizarPreviewTraspaso() {
  const cod = document.getElementById('traspasoProductoSelect')?.value;
  const origenId = document.getElementById('traspasoOrigenSelect')?.value || 'B3';
  const preview = document.getElementById('traspasoStockPreview');
  const availElem = document.getElementById('traspasoStockAvailable');
  const cantInput = document.getElementById('traspasoCantidad');

  if (!cod || !preview || !availElem) return;
  const prod = catalogoProductos.find(p => p.codigo === cod);
  if (prod) {
    const key = BODEGAS[origenId].key;
    const stockOrigen = (prod.bodegas && prod.bodegas[key]) ? prod.bodegas[key] : 0;
    availElem.textContent = stockOrigen;
    preview.classList.remove('hidden');
    cantInput.max = stockOrigen;
  }
}

// ========================================================
// 8. EVENT LISTENERS Y NAVEGACIÓN
// ========================================================
function configurarEventListeners() {
  // Pestañas
  document.getElementById('tabBtnInventario')?.addEventListener('click', () => cambiarTab('inventario'));
  document.getElementById('tabBtnBitacora')?.addEventListener('click', () => cambiarTab('bitacora'));

  // Chips de selección de bodega
  document.querySelectorAll('.bodega-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const bId = chip.dataset.bodega;
      bodegaFiltroActivo = bId;

      document.querySelectorAll('.bodega-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const labelElem = document.getElementById('labelBodegaActiva');
      if (labelElem) {
        if (bId === 'ALL') {
          labelElem.textContent = "🏢 Todas las Bodegas (Consolidado)";
          labelElem.className = "text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200";
        } else {
          labelElem.textContent = `📍 ${BODEGAS[bId].nombre}`;
          labelElem.className = `text-xs font-extrabold text-white bg-slate-900 px-3 py-1 rounded-full`;
        }
      }

      actualizarUICompleta();
    });
  });

  // Botones para abrir modales
  document.getElementById('btnOpenEntrada')?.addEventListener('click', () => {
    document.getElementById('formEntrada')?.reset();
    document.getElementById('entradaStockPreview')?.classList.add('hidden');
    if (bodegaFiltroActivo !== 'ALL') {
      document.getElementById('entradaBodegaSelect').value = bodegaFiltroActivo;
    }
    abrirModal('modalEntrada');
  });

  document.getElementById('btnOpenSalida')?.addEventListener('click', () => {
    document.getElementById('formSalida')?.reset();
    document.getElementById('salidaStockPreview')?.classList.add('hidden');
    document.querySelectorAll('.intendente-chip').forEach(c => c.classList.remove('selected'));
    if (bodegaFiltroActivo !== 'ALL') {
      document.getElementById('salidaBodegaSelect').value = bodegaFiltroActivo;
    }
    abrirModal('modalSalida');
  });

  document.getElementById('btnOpenTraspaso')?.addEventListener('click', () => {
    document.getElementById('formTraspaso')?.reset();
    document.getElementById('traspasoStockPreview')?.classList.add('hidden');
    if (bodegaFiltroActivo !== 'ALL') {
      document.getElementById('traspasoOrigenSelect').value = bodegaFiltroActivo;
    }
    abrirModal('modalTraspaso');
  });

  document.getElementById('btnOpenNuevoProd')?.addEventListener('click', () => {
    document.getElementById('formProducto')?.reset();
    document.getElementById('modalProductoTitle').textContent = "Agregar Nuevo Producto";
    document.getElementById('prodEditMode').value = "false";
    const codInput = document.getElementById('prodCodigo');
    codInput.readOnly = false;
    codInput.classList.remove('bg-slate-100');

    const bSelect = document.getElementById('prodBodegaSelect');
    if (bSelect) {
      bSelect.value = (bodegaFiltroActivo !== 'ALL' ? bodegaFiltroActivo : 'B3');
    }
    const stockInput = document.getElementById('prodStock');
    if (stockInput) stockInput.value = 0;
    const minInput = document.getElementById('prodStockMinimo');
    if (minInput) minInput.value = 5;

    abrirModal('modalProducto');
  });

  document.getElementById('btnOpenConfig')?.addEventListener('click', () => {
    const input = document.getElementById('configScriptUrl');
    if (input) input.value = scriptURL;
    document.getElementById('testConfigResult')?.classList.add('hidden');
    abrirModal('modalConfig');
  });

  // Botones para gestionar personal de intendencia
  document.getElementById('btnOpenIntendentes')?.addEventListener('click', () => {
    renderizarListaAdminIntendentes();
    abrirModal('modalIntendentes');
  });

  document.getElementById('btnAdminIntendentesDesdeSalida')?.addEventListener('click', () => {
    renderizarListaAdminIntendentes();
    abrirModal('modalIntendentes');
  });

  // Botones de cerrar modales
  document.querySelectorAll('.btnCerrarModal').forEach(btn => {
    btn.addEventListener('click', cerrarTodosLosModales);
  });

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarTodosLosModales();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarTodosLosModales();
  });

  // Formularios
  document.getElementById('formEntrada')?.addEventListener('submit', procesarEntradaForm);
  document.getElementById('formSalida')?.addEventListener('submit', procesarSalidaForm);
  document.getElementById('formTraspaso')?.addEventListener('submit', procesarTraspasoForm);
  document.getElementById('formProducto')?.addEventListener('submit', procesarProductoForm);
  document.getElementById('formAgregarIntendente')?.addEventListener('submit', procesarAgregarIntendente);
  document.getElementById('btnConfirmarEliminar')?.addEventListener('click', confirmarEliminacionProducto);

  // Previews dinámicos
  document.getElementById('entradaProductoSelect')?.addEventListener('change', actualizarPreviewEntrada);
  document.getElementById('entradaBodegaSelect')?.addEventListener('change', actualizarPreviewEntrada);

  document.getElementById('salidaProductoSelect')?.addEventListener('change', actualizarPreviewSalida);
  document.getElementById('salidaBodegaSelect')?.addEventListener('change', actualizarPreviewSalida);

  document.getElementById('traspasoProductoSelect')?.addEventListener('change', actualizarPreviewTraspaso);
  document.getElementById('traspasoOrigenSelect')?.addEventListener('change', actualizarPreviewTraspaso);

  // Búsqueda y filtros reactivos
  document.getElementById('inputBuscar')?.addEventListener('input', renderizarTablaProductos);
  document.getElementById('filterEstado')?.addEventListener('change', renderizarTablaProductos);
  document.getElementById('filterCategoria')?.addEventListener('change', renderizarTablaProductos);

  // Filtros de bitácora
  document.getElementById('filterMovAll')?.addEventListener('click', () => setFiltroMov('ALL'));
  document.getElementById('filterMovEntradas')?.addEventListener('click', () => setFiltroMov('ENTRADA'));
  document.getElementById('filterMovSalidas')?.addEventListener('click', () => setFiltroMov('SALIDA'));
  document.getElementById('filterMovTraspasos')?.addEventListener('click', () => setFiltroMov('TRASPASO'));

  // Sincronizar
  document.getElementById('btnSync')?.addEventListener('click', () => sincronizarConGoogleSheets(true));

  // Exportar a CSV
  document.getElementById('btnExportCSV')?.addEventListener('click', exportarInventarioCSV);

  // Configuración de Script
  document.getElementById('btnProbarConfig')?.addEventListener('click', probarConexionConfig);
  document.getElementById('formConfig')?.addEventListener('submit', guardarConfigScript);
}

function cambiarTab(tab) {
  tabActiva = tab;
  const secInv = document.getElementById('sectionInventario');
  const secBit = document.getElementById('sectionBitacora');
  const btnInv = document.getElementById('tabBtnInventario');
  const btnBit = document.getElementById('tabBtnBitacora');

  if (tab === 'inventario') {
    secInv.classList.remove('hidden');
    secBit.classList.add('hidden');
    btnInv.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs bg-white text-slate-900 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2";
    btnBit.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2";
  } else {
    secInv.classList.add('hidden');
    secBit.classList.remove('hidden');
    btnBit.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs bg-white text-slate-900 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2";
    btnInv.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2";
    renderizarTablaMovimientos();
  }
}

function setFiltroMov(tipo) {
  filtroMovTipo = tipo;
  const btnAll = document.getElementById('filterMovAll');
  const btnEnt = document.getElementById('filterMovEntradas');
  const btnSal = document.getElementById('filterMovSalidas');
  const btnTra = document.getElementById('filterMovTraspasos');

  const activeClass = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer";
  const inactiveClass = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer";

  btnAll.className = tipo === 'ALL' ? activeClass : inactiveClass;
  btnEnt.className = tipo === 'ENTRADA' ? activeClass : inactiveClass;
  btnSal.className = tipo === 'SALIDA' ? activeClass : inactiveClass;
  if (btnTra) btnTra.className = tipo === 'TRASPASO' ? activeClass : inactiveClass;

  renderizarTablaMovimientos();
}

function abrirModal(idModal) {
  cerrarTodosLosModales();
  const modal = document.getElementById(idModal);
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('overflow-hidden');
  }
}

function cerrarTodosLosModales() {
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.classList.remove('overflow-hidden');
}

// ========================================================
// 9. CONFIGURACIÓN Y TEST DE CONEXIÓN
// ========================================================
async function probarConexionConfig() {
  const input = document.getElementById('configScriptUrl');
  const result = document.getElementById('testConfigResult');
  const testUrl = (input?.value || "").trim();

  if (!testUrl) return mostrarToast("Ingresa una URL para probar.", "warning");

  result.className = "p-3 rounded-xl text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-2";
  result.innerHTML = `<span class="spin-slow inline-block">🔄</span> Probando conexión con Google Apps Script...`;
  result.classList.remove('hidden');

  try {
    const res = await fetch(`${testUrl}?action=ping&t=${Date.now()}`, { mode: 'cors' });
    const data = await res.json();

    if (data.success) {
      result.className = "p-3 rounded-xl text-xs font-medium border bg-emerald-50 text-emerald-800 border-emerald-200";
      result.innerHTML = `✅ <strong>Conexión Exitosa:</strong> Google Apps Script respondió correctamente (6 Bodegas activas).`;
    } else {
      throw new Error(data.error || "Respuesta sin éxito");
    }
  } catch (err) {
    result.className = "p-3 rounded-xl text-xs font-medium border bg-rose-50 text-rose-800 border-rose-200";
    result.innerHTML = `❌ <strong>Error:</strong> Verifica que la implementación esté en "Cualquier usuario" (Anyone). (${err.message})`;
  }
}

function guardarConfigScript(e) {
  e.preventDefault();
  const input = document.getElementById('configScriptUrl');
  const newUrl = (input?.value || "").trim();

  if (!newUrl) return mostrarToast("Por favor ingresa una URL válida.", "warning");

  scriptURL = newUrl;
  localStorage.setItem(STORAGE_KEY_URL, newUrl);
  mostrarToast("Configuración guardada exitosamente.", "success");
  cerrarTodosLosModales();
  sincronizarConGoogleSheets(true);
}

// ========================================================
// 10. EXPORTACIÓN A EXCEL (CSV CON UTF-8 BOM)
// ========================================================
function exportarInventarioCSV() {
  if (catalogoProductos.length === 0) {
    return mostrarToast("No hay productos en catálogo para exportar.", "warning");
  }

  const encabezados = [
    "CODIGO",
    "DESCRIPCION",
    "CATEGORIA",
    "BODEGA_ASIGNADA",
    "BODEGA_3_MANTENIMIENTO",
    "BODEGA_4_ELECTRONICA",
    "BODEGA_5_LOMA",
    "BODEGA_6_AUDIO",
    "BODEGA_7_PINTURAS",
    "BODEGA_8_JARDINERIA",
    "TOTAL_CONSOLIDADO",
    "STOCK_MINIMO",
    "ESTADO"
  ];

  const filas = catalogoProductos.map(p => {
    const b = p.bodegas || {};
    const b3 = b.bodega3 || 0;
    const b4 = b.bodega4 || 0;
    const b5 = b.bodega5 || 0;
    const b6 = b.bodega6 || 0;
    const b7 = b.bodega7 || 0;
    const b8 = b.bodega8 || 0;
    const total = p.stock || 0;
    const bodegaNombre = BODEGAS[p.bodegaId]?.nombre || "Bodega 3 - Mantenimiento";

    let estado = "EN STOCK";
    if (total === 0) estado = "AGOTADO";
    else if (total <= p.stockMinimo) estado = "STOCK BAJO";

    return [
      `"${p.codigo}"`,
      `"${p.descripcion.replace(/"/g, '""')}"`,
      `"${p.categoria.replace(/"/g, '""')}"`,
      `"${bodegaNombre}"`,
      b3,
      b4,
      b5,
      b6,
      b7,
      b8,
      total,
      p.stockMinimo,
      `"${estado}"`
    ].join(",");
  });

  const contenido = "\uFEFF" + [encabezados.join(","), ...filas].join("\r\n");
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fechaHoy = new Date().toISOString().slice(0, 10);

  link.setAttribute("href", url);
  link.setAttribute("download", `Inventario_6Bodegas_ESTi_${fechaHoy}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  mostrarToast("Inventario multibodega exportado a CSV.", "success");
}

// ========================================================
// 11. SISTEMA DE TOASTS
// ========================================================
function mostrarToast(mensaje, tipo = "info") {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;

  let iconSvg = '';
  if (tipo === 'success') {
    iconSvg = '<svg class="h-5 w-5 text-emerald-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
  } else if (tipo === 'error') {
    iconSvg = '<svg class="h-5 w-5 text-rose-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
  } else if (tipo === 'warning') {
    iconSvg = '<svg class="h-5 w-5 text-amber-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
  } else {
    iconSvg = '<svg class="h-5 w-5 text-blue-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="flex-1 text-xs font-semibold leading-relaxed">${escapeHtml(mensaje)}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
