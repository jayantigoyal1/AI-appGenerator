# Dynamo — Metadata-Driven App Generator

A production-ready metadata-driven frontend runtime built with Next.js 15.

Users can paste JSON configuration and instantly generate fully functional UI components including dashboards, forms, tables, cards, alerts, progress trackers, and layouts.

Inspired by Base44's metadata-driven approach, the application demonstrates dynamic rendering, runtime validation, extensible architecture, and graceful error handling.

---

## Live Features

- Live JSON editing using Monaco Editor
- Instant UI rendering from metadata
- Dashboard generation
- Dynamic Forms
- Dynamic Tables
- Cards
- Alerts
- Progress Components
- Layout Composition
- Template Gallery
- Editor / Split / Preview modes
- Runtime Validation
- Error Boundaries
- Unsupported Component Fallbacks
- Zustand State Management
- Responsive Design

---

## Quick Start

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# Architecture

## Metadata Driven Rendering

The application treats JSON as the single source of truth.

Example:

```json
{
  "type": "dashboard",
  "title": "CRM Overview",
  "widgets": [
    {
      "type": "kpi",
      "title": "Revenue",
      "value": "$125K"
    }
  ]
}
```

The renderer dynamically converts metadata into React components without requiring page-level development.

---

## Registry-Based Component System

The renderer uses a registry pattern:

```ts
const componentRegistry = {
  form: DynamicForm,
  table: DynamicTable,
  dashboard: DynamicDashboard,
  card: DynamicCard,
  alert: DynamicAlert,
  progress: DynamicProgress
};
```

Adding new component types requires only:

1. Create renderer
2. Register component
3. Add validation schema

No other application logic needs modification.

---

## Rendering Flow

```txt
JSON Input
     │
     ▼
safeParseJson()
     │
     ▼
validateConfig()
     │
     ▼
ComponentRenderer
     │
     ▼
Dynamic Component
```

---

# Error Handling Strategy

The application implements multiple layers of protection.

## 1. Parse Errors

Invalid JSON is caught immediately.

Example:

```json
{
  "type": "dashboard"
```

Result:

- Validation Error
- Preview Disabled
- No Crash

---

## 2. Validation Errors

Invalid schemas are detected before rendering.

Example:

```json
{
  "type": "form",
  "fields": "wrong"
}
```

Result:

- Error Badge
- Validation Panel
- Safe Failure

---

## 3. Runtime Errors

Each component is wrapped in an isolated error boundary.

```txt
ComponentErrorBoundary
```

If one component crashes:

- Remaining UI continues working
- Error shown inline
- Application remains usable

---

## 4. Unsupported Components

Example:

```json
{
  "type": "magicWidget"
}
```

Result:

```txt
Unsupported Component
magicWidget
```

instead of a crash.

---

# State Management

The application uses Zustand.

## Metadata Store

Stores:

- Raw JSON
- Parsed Configuration
- Validation State

## UI Store

Stores:

- Active Template
- Active Panel
- Layout Mode

## Error Store

Stores:

- Runtime Errors
- Validation Errors

This separation prevents unnecessary re-renders and keeps state responsibilities isolated.

---

# Supported Components

## Dashboard

```json
{
  "type": "dashboard",
  "title": "CRM Overview"
}
```

Features:

- KPI Widgets
- Activity Widgets
- Summary Widgets
- Charts

---

## Form

```json
{
  "type": "form",
  "title": "Contact Form",
  "fields": [
    {
      "name": "email",
      "type": "email"
    }
  ]
}
```

Features:

- Validation
- Required Fields
- Multiple Input Types

---

## Table

```json
{
  "type": "table",
  "title": "Users"
}
```

Features:

- Search
- Sorting
- Pagination

---

## Card

```json
{
  "type": "card",
  "title": "Welcome"
}
```

---

## Alert

```json
{
  "type": "alert",
  "title": "Warning",
  "message": "System maintenance",
  "variant": "warning"
}
```

Supported Variants:

- info
- success
- warning
- danger

---

## Progress

```json
{
  "type": "progress",
  "title": "Project Status",
  "items": [
    {
      "label": "Frontend",
      "value": 90
    }
  ]
}
```

---

## Layout

```json
{
  "type": "layout",
  "layout": "two-column",
  "children": []
}
```

Supported Layouts:

- single
- two-column
- three-column
- grid
- sidebar

---

# Extensibility

## Add New Component

Create:

```txt
DynamicMyComponent.tsx
```

Register:

```ts
const componentRegistry = {
  ...
  myComponent: DynamicMyComponent
};
```

Add:

- Type definitions
- Validation rules

Done.

---

## Add New Templates

Update:

```txt
src/lib/templates.ts
```

New templates automatically appear in the sidebar.

---

# UI Modes

## Editor Mode

Full JSON editing experience.

## Split Mode

Editor + Preview side by side.

## Preview Mode

Focus on rendered application output.

---

# Tech Stack

| Technology | Purpose |
|------------|----------|
| Next.js 15 | Framework |
| React 18 | UI Runtime |
| TypeScript | Type Safety |
| TailwindCSS | Styling |
| Zustand | State Management |
| Monaco Editor | JSON Editor |
| React Hook Form | Forms |
| Zod | Validation |

---

# Assignment Requirement Coverage

## Metadata Driven UI

✔ Dynamic UI generation from JSON

## Forms

✔ Supported

## Dashboards

✔ Supported

## Tables

✔ Supported

## Layouts

✔ Supported

## Reusable Components

✔ Registry-based architecture

## Loading States

✔ Preview Skeletons

## Error States

✔ Parse Errors

✔ Validation Errors

✔ Runtime Errors

✔ Unsupported Components

## Responsive Layouts

✔ Mobile Friendly

✔ Desktop Friendly

## Extensible Architecture

✔ New components can be added without modifying existing rendering flow

---

# Deployment

## Local

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Vercel

```bash
git init
git add .
git commit -m "final submission"
```

Push to GitHub.

Import repository into Vercel.

Framework:

```txt
Next.js
```

Click Deploy.

---

# Project Structure

```txt
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── editor/
│   │   ├── JsonEditor.tsx
│   │   └── LivePreview.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── TemplateSidebar.tsx
│   │
│   └── renderer/
│       ├── ComponentRenderer.tsx
│       ├── DynamicForm.tsx
│       ├── DynamicTable.tsx
│       ├── DynamicDashboard.tsx
│       ├── DynamicCard.tsx
│       ├── DynamicAlert.tsx
│       └── DynamicProgress.tsx
│
├── stores/
│   └── index.ts
│
├── lib/
│   ├── templates.ts
│   └── utils.ts
│
└── types/
    └── index.ts
```

---

# Future Improvements

- Drag and Drop Layout Builder
- Theme Editor
- Custom Component Marketplace
- AI JSON Generation
- Backend Schema Generation
- API Generation
- Database Schema Generation

---

Built as part of the AI App Generator challenge using a metadata-driven architecture inspired by Base44.