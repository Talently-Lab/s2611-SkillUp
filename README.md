# 🚀 SkillUp - Simulación Laboral

> Sistema integral desarrollado en el marco de la simulación laboral de SkillUp.

---

## 👥 Integrantes del Equipo

* **Christian Andrade** - *Data Analyst*
* **Mauricio Fernando Flores** - *Backend Developer*
* **Cristian Cañupan** - *Backend Developer*
* **Deison Jose Barreto Monte** - *Frontend Developer*
* **Daniela Homobono** - *Frontend Developer*
* **Daiana Ostrovsky** - *UX/UI Designer*
* **Alejandra Brito** - *Especialista de Marketing*
* **Leandro Mendoza** - *Project Manager*
* **Griselda Dayana Calle Cruz** - *QA Tester*

---

## 🛠️ Decisiones Técnicas y Stack

Para este proyecto se optó por un stack moderno, escalable y enfocado en la velocidad de entrega (MVP):

* **Frontend:** React + Vite, Tailwind CSS (para una interfaz rápida, limpia y responsive).
* **Backend:** Node.js (v24 LTS) + Express, estructurado bajo una arquitectura de API REST modular.
* **Base de Datos:** PostgreSQL (v17), elegida por su robustez relacional y garantía de consistencia de datos.
* **Control de Versiones y Gestión:** GitHub (con convenciones de commits y ramas `feature/`), Trello como tablero Kanban para el seguimiento ágil de tareas.
* **Documentación de API:** Postman (colección exportada en `/docs/api/` para sincronización con Frontend y QA).

---

## ⚙️ Metodología y Dinámica de Trabajo

Basándonos en las reglas de oro de la simulación, definimos los siguientes acuerdos de equipo tras nuestra reunión inicial:

* **Comunicación Asincrónica:** Reportes diarios de avances y bloqueos en el canal del equipo (Discord). La regla es: *si te trabás más de 30 minutos, documentá lo intentado y pedí ayuda*.
* **Sincronización y Retrospectiva:** Reunión corta de alineación y retrospectiva los fines de semana (sábado o domingo) para evaluar el estado del MVP y ajustar el backlog en Trello.
* **Criterio de Calidad:** Cada entregable se maneja bajo el estándar de que va a ser revisado directamente por el Director/Tech Lead.

---

## 📂 Estructura del Repositorio

```text
skillup-workspace/
├── backend/                  # API REST (Node.js + Express) 
├── frontend/                 # Aplicación Web (React)
├── docs/                     # Documentación general (PM, QA, Postman)
├── product_y_growth/         # Marketing, Data y Diseño (Manual de marca)
└── README.md                 # Documentación principal
