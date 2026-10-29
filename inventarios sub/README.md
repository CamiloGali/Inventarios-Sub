# Sistema de Control de Inventarios por Bodegas (ESTi)

Aplicación web moderna y reactiva diseñada para gestionar el inventario de insumos y materiales dividido en **6 Bodegas Especializadas**:

1. 🔧 **Bodega 3 - Mantenimiento** (`B3`)
2. ⚡ **Bodega 4 - Electrónica** (`B4`)
3. 🔬 **Bodega 5 - LOMA** (`B5`)
4. 🎙️ **Bodega 6 - Equipos de audio** (`B6`)
5. 🎨 **Bodega 7 - Pinturas y electricidad** (`B7`)
6. 🌱 **Bodega 8 - Jardinería** (`B8`)

---

## 🌟 Características Principales

1. **Gestión Multibodega**:
   - Selector interactivo de bodega activa en cabecera: consulta el inventario global consolidado o concéntrate en una bodega específica.
   - Desglose visual de existencias por bodega en cada fila del catálogo.
   - Tarjetas de resumen en tiempo real (KPIs) adaptativas al filtro de bodega seleccionado.

2. **Operaciones y Movimientos**:
   - 📥 **Registrar Entrada**: Ingresa insumos seleccionando la bodega de destino específica.
   - 📤 **Registrar Salida**: Despacha material indicando la bodega de origen y el **intendente** solicitante (11 intendentes con selección rápida por chips), con validación en tiempo real para no permitir sacar más del stock disponible en esa bodega.
   - 🔄 **Traspaso entre Bodegas**: Transfiere existencias de una bodega a otra con actualización simultánea y registro de responsable.
   - 🕒 **Bitácora en Vivo**: Historial completo de entradas, salidas y traspasos.

3. **Catálogo y Reportes**:
   - Búsqueda en vivo por código, descripción o categoría.
   - Alta de productos con distribución inicial de stock por cada una de las 6 bodegas.
   - Exportación completa del catálogo desglosado a **Excel / CSV** con codificación UTF-8.

---

## 👥 Intendentes Oficiales Autorizados
- Hermelinda
- Maika
- Lili
- Diego
- Anita
- Ricardo
- Oscar
- Jesus
- Gabriela
- Cynthia
- Enrique

---

## ⚙️ Conexión con Google Sheets y Google Apps Script

### 📋 Estructura de las Hojas en Google Sheets:
- **`Inventario`**: `[CODIGO, DESCRIPCION, CATEGORIA, BODEGA 3, BODEGA 4, BODEGA 5, BODEGA 6, BODEGA 7, BODEGA 8, TOTAL CONSOLIDADO, STOCK MINIMO, ULTIMA ACTUALIZACION]`
- **`Entradas`**: `[ID_MOVIMIENTO, FECHA, HORA, BODEGA_DESTINO, CODIGO, DESCRIPCION, CANTIDAD, ORIGEN_PROVEEDOR, OBSERVACIONES]`
- **`Salidas`**: `[ID_MOVIMIENTO, FECHA, HORA, BODEGA_ORIGEN, CODIGO, DESCRIPCION, CANTIDAD, INTENDENTE, OBSERVACIONES]`
- **`Traspasos`**: `[ID_MOVIMIENTO, FECHA, HORA, BODEGA_ORIGEN, BODEGA_DESTINO, CODIGO, DESCRIPCION, CANTIDAD, RESPONSABLE, OBSERVACIONES]`

### 🚀 Pasos para Actualizar en Google Apps Script:
1. Abre tu hoja de cálculo en **Google Drive**.
2. Ve a **Extensiones > Apps Script**.
3. Reemplaza el código con el contenido de [`google_apps_script.js`](google_apps_script.js) y guarda (`Ctrl + S`).
4. Selecciona la función **`inicializarHojas`** y presiona **Ejecutar**. Esto creará y formateará los encabezados de las 6 bodegas y las 4 hojas automáticamente.
5. Haz clic en **Implementar > Administrar implementaciones** (o Nueva implementación):
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario** (Anyone).
6. Copia la URL generada y guárdala en el botón de **Configuración (⚙️)** de la aplicación web.
