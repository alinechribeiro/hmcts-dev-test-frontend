## HMCTS Task Manager Frontend

This repository contains a small end‑to‑end task management system designed for HMCTS caseworkers. It is intentionally simple, but built with production‑style patterns. For that, it was integrated to the project tests, Docker, Postgres, React on frontend and JAVA with APIs on backend.

The project is split into two services:

- **Backend**: Java 21, Spring Boot 4.0.3, Gradle, Postgres for database. Repo: [https://github.com/alinechribeiro/hmcts-dev-test-backend](https://github.com/alinechribeiro/hmcts-dev-test-backend)
- **Frontend**: ReactJS, TypeScriptJS, Vite, TailwindCSS. Repo: [https://github.com/alinechribeiro/hmcts-dev-test-frontend](https://github.com/alinechribeiro/hmcts-dev-test-frontend)

---

### Main features

- **Task list and details**
  - Shows title, optional description, current status and due date/time
- **Create / edit tasks**
  - Single form used for both creating a new task and editing an existing one
  - Fields: title (required), description (optional), due date/time (required)
- **Update status**
  - Status dropdown on each task card (`TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`)
- **Delete tasks**
  - Delete button per task with visual confirmation via toast
- **User feedback**
  - Toast popups in the bottom‑right corner:
    - Green for “Task created.” and “Task updated.”
    - Red for “Task deleted.”

All data is loaded and saved through the backend API at `/api/tasks`.

---

### Tech stack

- React 18 + TypeScript
- Vite 7
- Tailwind CSS 4
- Jest + React Testing Library for unit/feature tests

---

### Project structure

- `src/App.tsx`
- `src/api.ts` small client for the `/api/tasks` HTTP endpoints
- `src/types.ts` TypeScript types for tasks and payloads
- `src/styles.css` TailwindCSS setup and base styles
- `src/App.test.tsx` Jest tests for rendering and the create‑task flow

---

### Running the frontend

**Prerequisites**

- Node.js
- npm
- Backend running on `http://localhost:8080` (see backend repo [README.md](http://README.md) file)

Steps to run:

```bash
cd hmcts-task-frontend
npm install
npm run dev
```

Then open:

- `http://localhost:3000`

The dev server will proxy `/api` requests to `http://localhost:8080`, so as long as the backend is up, the UI will talk to the API without extra configuration.

---

### How it talks to the backend

The `src/api.ts` module is a small wrapper around `fetch`:

- `fetchTasks()` – `GET /api/tasks`
- `createTask(input)` – `POST /api/tasks`
- `updateTaskDetails(id, input)` – `PUT /api/tasks/{id}`
- `updateTaskStatus(id, status)` – `PATCH /api/tasks/{id}/status`
- `deleteTask(id)` – `DELETE /api/tasks/{id}`

The `dueAt` field from the form uses the browser’s `datetime-local` input and is converted to ISO‑8601 before being sent to the backend, so it can be deserialised into `OffsetDateTime` cleanly.

---

### Testing

To run the test suite:

```bash
cd hmcts-task-frontend
npm test
```

What is covered:

- The main page renders correctly with title present.
- Creating a task through the form:
  - Fills in title, description and due date and time.
  - Submits the form and asserts that:
    - The expected `POST /api/tasks` call is made.
    - The “Task created.” toast appears.

The tests use Jest and React Testing Library with a mocked `fetch`, so they run quickly and do not depend on a live backend.

---

### Notes

This frontend focuses on being easy to understand and adapt. For a fuller production setup you might add routing, more sophisticated state management or design system components; here, the goal is to keep the code approachable while still demonstrating good practices. 