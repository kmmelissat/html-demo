// ============================================
// 📚 SISTEMA ESCOLAR - VISUALIZACIÓN DE DATOS
// ============================================
// Este archivo muestra cómo LEER datos de Firebase Firestore

// 1️⃣ Importar la conexión a Firebase (db = database)
import { db } from "./firebase-config.js";

// 2️⃣ Importar funciones de Firestore que necesitamos
import {
  collection, // Para acceder a una colección (tabla)
  getDocs, // Para obtener todos los documentos
  query, // Para hacer consultas
  orderBy, // Para ordenar resultados
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// 3️⃣ Crear referencias a nuestras colecciones (como "tablas" en SQL)
const alumnosCollection = collection(db, "alumnos"); // Colección de alumnos
const materiasCollection = collection(db, "materias"); // Colección de materias
const notasCollection = collection(db, "notas"); // Colección de notas

// ============================================
// 🔍 VERIFICAR SI HAY DATOS
// ============================================
async function verificarDatos() {
  try {
    // Obtener todos los documentos de la colección "alumnos"
    const alumnosSnapshot = await getDocs(alumnosCollection);

    // Si está vacía, mostrar mensaje
    if (alumnosSnapshot.empty) {
      console.log("⚠️ No hay datos en Firebase");
      mostrarMensajeSinDatos();
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error al verificar datos:", error);
    return false;
  }
}

// Mostrar mensaje cuando no hay datos (solo HTML/CSS)
function mostrarMensajeSinDatos() {
  const mensaje = document.createElement("div");
  mensaje.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fff3cd;
    border: 2px solid #ffc107;
    border-radius: 10px;
    padding: 20px;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    z-index: 1000;
  `;
  mensaje.innerHTML = `
    <h3 style="color: #856404; margin-bottom: 10px;">⚠️ Base de datos vacía</h3>
    <p style="color: #856404; margin-bottom: 15px;">
      No hay datos en Firebase. Agrega datos manualmente desde Firebase Console.
    </p>
    <button onclick="this.parentElement.remove()" style="
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    ">
      Cerrar
    </button>
  `;
  document.body.appendChild(mensaje);
}

// ============================================
// 📖 FUNCIONES PARA LEER DATOS DE FIREBASE
// ============================================

// Obtener todos los alumnos ordenados por nombre
async function obtenerAlumnos() {
  // Crear una consulta ordenada
  const q = query(alumnosCollection, orderBy("nombre"));

  // Ejecutar la consulta
  const snapshot = await getDocs(q);

  // Convertir los documentos a objetos JavaScript
  // doc.id = ID del documento, doc.data() = datos del documento
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Obtener todas las materias ordenadas por nombre
async function obtenerMaterias() {
  const q = query(materiasCollection, orderBy("nombre"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Obtener todas las notas (sin ordenar)
async function obtenerNotas() {
  const snapshot = await getDocs(notasCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ============================================
// 🎨 FUNCIÓN AUXILIAR PARA ESTILOS
// ============================================
// Retorna una clase CSS según la nota (solo para colores)
function obtenerClaseNota(nota) {
  if (nota >= 90) return "excelente"; // Verde
  if (nota >= 80) return "bueno"; // Azul
  if (nota >= 70) return "regular"; // Amarillo
  return "bajo"; // Rojo
}

// ============================================
// 🖥️ MOSTRAR ALUMNOS EN EL HTML
// ============================================
async function mostrarAlumnos() {
  try {
    // 1️⃣ Obtener datos de Firebase
    const alumnos = await obtenerAlumnos();

    // 2️⃣ Encontrar el contenedor en el HTML
    const container = document.getElementById("alumnosList");

    // 3️⃣ Si no hay datos, mostrar mensaje
    if (alumnos.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><div class="icon">👨‍🎓</div><p>No hay alumnos registrados</p></div>';
      return;
    }

    // 4️⃣ Crear HTML para cada alumno
    container.innerHTML = alumnos
      .map(
        (alumno) => `
        <div class="data-item">
            <strong>${alumno.nombre}</strong>
            <div class="detail">
                <span class="badge badge-grado">${alumno.grado}</span>
            </div>
        </div>
    `
      )
      .join("");

    // 5️⃣ Actualizar contador
    document.getElementById("totalAlumnos").textContent = alumnos.length;
  } catch (error) {
    console.error("Error al mostrar alumnos:", error);
  }
}

// ============================================
// 🖥️ MOSTRAR MATERIAS EN EL HTML
// ============================================
async function mostrarMaterias() {
  try {
    // 1️⃣ Obtener datos de Firebase
    const materias = await obtenerMaterias();

    // 2️⃣ Encontrar el contenedor en el HTML
    const container = document.getElementById("materiasList");

    // 3️⃣ Si no hay datos, mostrar mensaje
    if (materias.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><div class="icon">📖</div><p>No hay materias registradas</p></div>';
      return;
    }

    // 4️⃣ Crear HTML para cada materia
    container.innerHTML = materias
      .map(
        (materia) => `
        <div class="data-item">
            <strong>${materia.nombre}</strong>
            <div class="detail">👨‍🏫 ${materia.profesor}</div>
        </div>
    `
      )
      .join("");

    // 5️⃣ Actualizar contador
    document.getElementById("totalMaterias").textContent = materias.length;
  } catch (error) {
    console.error("Error al mostrar materias:", error);
  }
}

// ============================================
// 🖥️ MOSTRAR NOTAS CON RELACIONES
// ============================================
// Esta es la parte MÁS IMPORTANTE: relacionar 3 colecciones
async function mostrarNotas() {
  try {
    // 1️⃣ Obtener datos de las 3 colecciones
    const notas = await obtenerNotas();
    const alumnos = await obtenerAlumnos();
    const materias = await obtenerMaterias();
    const container = document.getElementById("notasContainer");

    if (notas.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><div class="icon">📊</div><p>No hay notas registradas</p></div>';
      return;
    }

    // 2️⃣ Crear mapas para búsqueda rápida (como un diccionario)
    // Esto hace que sea más rápido buscar alumnos y materias por ID
    const alumnosMap = new Map(alumnos.map((a) => [a.id, a]));
    const materiasMap = new Map(materias.map((m) => [m.id, m]));

    // 3️⃣ RELACIONAR las colecciones
    // Cada nota tiene alumnoId y materiaId
    // Buscamos el alumno y materia correspondiente
    const notasConRelaciones = notas.map((nota) => {
      const alumno = alumnosMap.get(nota.alumnoId);
      const materia = materiasMap.get(nota.materiaId);
      return {
        ...nota,
        alumnoNombre: alumno ? alumno.nombre : "Desconocido",
        alumnoGrado: alumno ? alumno.grado : "",
        materiaNombre: materia ? materia.nombre : "Desconocida",
        materiaProfesor: materia ? materia.profesor : "",
      };
    });

    // 4️⃣ Ordenar por nombre de alumno
    notasConRelaciones.sort((a, b) =>
      a.alumnoNombre.localeCompare(b.alumnoNombre)
    );

    // 5️⃣ Crear tabla HTML con todos los datos relacionados
    container.innerHTML = `
        <table class="notas-table">
            <thead>
                <tr>
                    <th>Alumno</th>
                    <th>Grado</th>
                    <th>Materia</th>
                    <th>Profesor</th>
                    <th>Nota</th>
                </tr>
            </thead>
            <tbody>
                ${notasConRelaciones
                  .map(
                    (nota) => `
                    <tr>
                        <td><strong>${nota.alumnoNombre}</strong></td>
                        <td>${nota.alumnoGrado}</td>
                        <td>${nota.materiaNombre}</td>
                        <td>${nota.materiaProfesor}</td>
                        <td>
                            <span class="badge badge-nota ${obtenerClaseNota(
                              nota.nota
                            )}">
                                ${nota.nota}
                            </span>
                        </td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    `;

    // 6️⃣ Actualizar estadísticas
    document.getElementById("totalNotas").textContent = notas.length;

    const promedio =
      notas.reduce((sum, nota) => sum + nota.nota, 0) / notas.length;
    document.getElementById("promedioGeneral").textContent =
      promedio.toFixed(1);
  } catch (error) {
    console.error("Error al mostrar notas:", error);
  }
}

// ============================================
// 🚀 INICIALIZACIÓN DE LA APLICACIÓN
// ============================================

// Cargar y mostrar todos los datos
async function cargarDatos() {
  try {
    await mostrarAlumnos();
    await mostrarMaterias();
    await mostrarNotas();
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}

// Función principal que se ejecuta al cargar la página
async function init() {
  try {
    // Verificar si hay datos y cargarlos
    const hayDatos = await verificarDatos();

    if (hayDatos) {
      await cargarDatos();
    }
  } catch (error) {
    console.error("Error al inicializar:", error);

    // Mostrar mensaje de error más amigable
    const errorMsg = document.createElement("div");
    errorMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f8d7da;
      border: 2px solid #dc3545;
      border-radius: 10px;
      padding: 20px;
      max-width: 400px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 1000;
    `;
    errorMsg.innerHTML = `
      <h3 style="color: #721c24; margin-bottom: 10px;">❌ Error de conexión</h3>
      <p style="color: #721c24; margin-bottom: 10px; font-size: 0.9em;">
        ${error.message || "No se pudo conectar con Firebase"}
      </p>
      <p style="color: #721c24; font-size: 0.85em;">
        Verifica las reglas de Firestore en Firebase Console.
      </p>
    `;
    document.body.appendChild(errorMsg);
  }
}

// Ejecutar cuando el HTML esté completamente cargado
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
