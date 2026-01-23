# Ultra-Premium Portfolio Platform - Technical Documentation

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Document Type:** Technical Architecture & Implementation Reference

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack & Rationale](#2-technology-stack--rationale)
3. [Repository & Folder Structure](#3-repository--folder-structure)
4. [Data Model & Storage Layer](#4-data-model--storage-layer)
5. [Authentication & Security Model](#5-authentication--security-model)
6. [File Upload & Media Handling](#6-file-upload--media-handling)
7. [Admin Panel Behavior](#7-admin-panel-behavior)
8. [Public UI Behavior](#8-public-ui-behavior)
9. [GitHub Codespaces Hosting Model](#9-github-codespaces-hosting-model)
10. [Verification & Testing Checklist](#10-verification--testing-checklist)
11. [Known Limitations & Future Improvements](#11-known-limitations--future-improvements)
12. [Glossary](#12-glossary)

---

## 1. System Overview

### 1.1 What the Platform Does

The Ultra-Premium Portfolio Platform is a self-contained web application designed for data professionals (analysts, engineers, visualization specialists) to showcase their work. It provides:

- A **public-facing portfolio** displaying projects with images, videos, and downloadable PDFs
- A **protected admin panel** for managing project content via a web interface
- **Zero external dependencies** for data storage (JSON file-based)
- **Zero-cost hosting** via GitHub Codespaces with shareable preview URLs

### 1.2 Core Use Cases

#### Viewer (Public User)
| Action | Description |
|--------|-------------|
| Browse projects | View all projects on the homepage with filtering by tool type |
| View project details | Access individual project pages with full media galleries |
| Download PDFs | Download documentation or reports attached to projects |
| Toggle dark mode | Switch between light and dark themes |

#### Admin (Authenticated User)
| Action | Description |
|--------|-------------|
| Login | Authenticate via `/admin` using environment-configured credentials |
| Create project | Add new projects with title, description, tool type, tags, and media |
| Edit project | Modify existing project content and media |
| Delete project | Remove projects and associated uploaded files |
| Upload files | Drag-and-drop images, videos, and PDFs |

### 1.3 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (CLIENT)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  React Client Components                                                    │
│  ├── Public Pages (/, /projects/[id])                                       │
│  ├── Admin Pages (/admin, /admin/projects/new, /admin/projects/[id]/edit)   │
│  └── UI Components (Card, Badge, Button, Modal, etc.)                       │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ HTTP Requests
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NEXT.JS SERVER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Middleware Layer (src/middleware.js)                                       │
│  ├── Security headers (CSP, HSTS, X-Frame-Options)                          │
│  ├── Rate limiting (in-memory store)                                        │
│  └── Request validation                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  API Routes (src/app/api/)                                                  │
│  ├── /api/auth          → Authentication (login, logout, status check)      │
│  ├── /api/projects      → Project CRUD (list, create)                       │
│  ├── /api/projects/[id] → Single project (read, update, delete)             │
│  └── /api/upload        → File upload handling                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Library Layer (src/lib/)                                                   │
│  ├── auth.js      → Token generation, validation, cookie handling           │
│  ├── db.js        → JSON file read/write operations                         │
│  ├── upload.js    → File validation, sanitization, storage                  │
│  └── validation.js→ Input sanitization, data validation                     │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ File I/O
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FILE SYSTEM                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  /data/projects.json     → Project database (JSON array)                    │
│  /public/uploads/        → Uploaded media files                             │
│  ├── images/             → JPEG, PNG, WebP, GIF                             │
│  ├── videos/             → MP4, WebM, OGG                                   │
│  └── pdfs/               → PDF documents                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.4 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Zero external services** | No databases, no cloud storage, no third-party APIs |
| **Portable** | Runs identically in Codespaces, local dev, or production |
| **Secure by default** | HMAC-signed sessions, timing-safe comparisons, CSP headers |
| **File-based persistence** | All data stored in JSON and filesystem |
| **Progressive enhancement** | Works without JavaScript for basic viewing |
| **Separation of concerns** | API routes, library functions, and UI components are isolated |

---

## 2. Technology Stack & Rationale

### 2.1 Next.js 14 (App Router)

**Purpose:** Full-stack React framework providing server-side rendering, API routes, and file-based routing.

**Why Chosen:**
- App Router provides a clear separation between server and client components
- API routes eliminate the need for a separate backend server
- Built-in image optimization reduces client-side processing
- Middleware support enables security headers and rate limiting
- Native support for dynamic routes (`[id]`) simplifies URL handling

**Alternatives Rejected:**
| Alternative | Reason Rejected |
|-------------|-----------------|
| Express.js + React | Requires separate frontend/backend setup; more configuration |
| Remix | Smaller ecosystem; less mature for file-based API routes |
| Astro | Better for static sites; less suited for dynamic admin panels |
| Create React App | No server-side rendering; no API routes |

### 2.2 Tailwind CSS

**Purpose:** Utility-first CSS framework for consistent, maintainable styling.

**Why Chosen:**
- Utility classes prevent CSS bloat and specificity conflicts
- Design tokens (colors, spacing, typography) are centralized in `tailwind.config.js`
- Dark mode support via `dark:` variant with class-based toggling
- No runtime CSS-in-JS overhead
- Excellent IDE support with IntelliSense

**Alternatives Rejected:**
| Alternative | Reason Rejected |
|-------------|-----------------|
| CSS Modules | Requires more files; harder to maintain consistent design |
| Styled Components | Runtime overhead; hydration mismatches in SSR |
| Plain CSS | Difficult to maintain design consistency at scale |
| Bootstrap | Opinionated component styles; harder to customize |

### 2.3 Framer Motion

**Purpose:** Animation library for smooth UI transitions and interactions.

**Why Chosen:**
- Declarative animation API that integrates naturally with React
- `AnimatePresence` handles exit animations for removed elements
- Performance-optimized with hardware acceleration
- Works with Next.js App Router and server components

**Usage Pattern:**
- Used in admin components for list animations
- Public-facing pages use CSS animations for better performance
- Progressively enhanced (site works without animations)

**Alternatives Rejected:**
| Alternative | Reason Rejected |
|-------------|-----------------|
| React Spring | More complex API; better suited for physics-based animations |
| CSS-only animations | Difficult to coordinate complex sequences |
| GSAP | Heavier bundle size; overkill for simple transitions |

### 2.4 GitHub Codespaces

**Purpose:** Cloud-based development environment that doubles as free hosting for demos.

**Why Chosen:**
- **$0 cost** within GitHub Free tier limits (60 hours/month)
- Instant setup with no local machine requirements
- Public preview URLs enable sharing without deployment
- Persistent workspace survives browser refreshes
- Pre-configured via `.devcontainer/devcontainer.json`

**Alternatives Rejected:**
| Alternative | Reason Rejected |
|-------------|-----------------|
| Vercel/Netlify | Requires external account; potential costs |
| Heroku | Removed free tier |
| Railway | Requires credit card for verification |
| Self-hosted VPS | Cost; maintenance burden |

### 2.5 JSON File-Based Storage

**Purpose:** Store project data without external database dependencies.

**Why Chosen:**
- Zero setup required; works immediately on any system
- Human-readable format for debugging and manual edits
- Git-trackable for version control of content
- Sufficient performance for personal portfolio scale (<100 projects)

**Implementation:**
- Single file: `data/projects.json`
- Synchronous read/write via Node.js `fs` module
- UUID v4 for unique project identifiers

**Alternatives Rejected:**
| Alternative | Reason Rejected |
|-------------|-----------------|
| SQLite | Requires binary file; potential cross-platform issues |
| PostgreSQL/MySQL | External service; hosting cost; complexity |
| MongoDB | External service; overkill for simple data |
| localStorage | Client-only; no server access; data loss on clear |

### 2.6 Environment-Based Authentication

**Purpose:** Protect admin panel without external auth providers.

**Why Chosen:**
- No OAuth setup required
- Single admin user is sufficient for personal portfolio
- Credentials stored in `.env.local` (never committed)
- HMAC-signed session tokens prevent tampering

**Implementation:**
- Username/password in environment variables
- Timing-safe credential comparison
- 8-hour session duration
- HttpOnly cookies prevent XSS token theft

**Alternatives Rejected:**
| Alternative | Reason Rejected |
|-------------|-----------------|
| NextAuth.js | Overkill for single-user; requires OAuth provider setup |
| Firebase Auth | External dependency; requires Google account |
| Auth0 | External service; free tier limitations |
| JWT | Less secure without refresh tokens; requires more code |

---

## 3. Repository & Folder Structure

### 3.1 Top-Level Directory

```
Portfolio/
├── .devcontainer/          # GitHub Codespaces configuration
├── .next/                  # Next.js build output (gitignored)
├── data/                   # JSON database storage
├── node_modules/           # NPM dependencies (gitignored)
├── public/                 # Static assets (served at /)
├── src/                    # Application source code
├── .env.example            # Environment variable template
├── .env.local              # Actual environment variables (gitignored)
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── CODESPACES.md           # Codespaces setup guide
├── DEPLOYMENT.md           # Production deployment guide
├── next.config.mjs         # Next.js configuration
├── package.json            # NPM dependencies and scripts
├── postcss.config.js       # PostCSS configuration for Tailwind
├── README.md               # Project documentation
├── SECURITY.md             # Security policy
├── stop_server.bat         # Windows script to stop dev server
└── tailwind.config.js      # Tailwind CSS design tokens
```

### 3.2 Source Directory (`src/`)

```
src/
├── app/                    # Next.js App Router pages and API
│   ├── admin/              # Admin panel pages (protected)
│   │   ├── projects/       # Project management pages
│   │   │   ├── new/        # Create new project
│   │   │   │   └── page.jsx
│   │   │   └── [id]/       # Edit existing project
│   │   │       └── edit/
│   │   │           └── page.jsx
│   │   └── page.jsx        # Admin dashboard
│   ├── api/                # API route handlers
│   │   ├── auth/           # Authentication endpoints
│   │   │   └── route.js    # POST: login, DELETE: logout, GET: status
│   │   ├── projects/       # Project CRUD endpoints
│   │   │   ├── route.js    # GET: list all, POST: create
│   │   │   └── [id]/
│   │   │       └── route.js # GET: single, PUT: update, DELETE: remove
│   │   └── upload/
│   │       └── route.js    # POST: file upload
│   ├── projects/           # Public project pages
│   │   └── [id]/
│   │       └── page.jsx    # Project detail page
│   ├── globals.css         # Global styles and Tailwind layers
│   ├── layout.jsx          # Root layout with HTML structure
│   └── page.jsx            # Homepage
├── components/             # Reusable React components
│   ├── admin/              # Admin-specific components
│   │   ├── AdminLayout.jsx # Sidebar navigation wrapper
│   │   ├── FileDropzone.jsx# Drag-and-drop file upload
│   │   └── ProjectForm.jsx # Project create/edit form
│   ├── layout/             # Layout components
│   │   ├── Header.jsx      # Site header with navigation
│   │   └── Footer.jsx      # Site footer
│   └── ui/                 # UI primitives
│       ├── Badge.jsx       # Tool and tag badges
│       ├── Button.jsx      # Button with variants
│       ├── Card.jsx        # Project card
│       ├── Modal.jsx       # Lightbox and dialog modals
│       ├── ThemeToggle.jsx # Dark mode toggle
│       └── Toggle.jsx      # Switch/toggle component
├── lib/                    # Server-side utilities
│   ├── auth.js             # Authentication logic
│   ├── db.js               # JSON database operations
│   ├── upload.js           # File upload handling
│   └── validation.js       # Input validation/sanitization
└── middleware.js           # Next.js middleware for security
```

### 3.3 Critical File Responsibilities

#### `/src/app/api/projects/route.js`
- **GET:** Returns all projects from `projects.json` (public, cached 60s)
- **POST:** Creates new project (requires authentication, validates input, generates UUID)

#### `/src/app/api/projects/[id]/route.js`
- **GET:** Returns single project by ID (public, cached 60s)
- **PUT:** Updates project (requires authentication, validates input, preserves ID/createdAt)
- **DELETE:** Removes project and associated files (requires authentication)

#### `/src/components/admin/ProjectForm.jsx`
- Handles both create and edit modes based on `project` prop
- Manages form state for title, description, tool, tags, and media
- Integrates with `FileDropzone` for media uploads
- Submits to appropriate API endpoint (POST for create, PUT for update)

#### `/data/projects.json`
- Array of project objects
- Manually editable for seeding data
- Automatically created if missing

---

## 4. Data Model & Storage Layer

### 4.1 Project Schema

```typescript
interface Project {
  id: string;           // UUID v4
  title: string;        // 1-200 characters, required
  description: string;  // 0-5000 characters, optional
  tool: "Power BI" | "Tableau" | "Excel";  // Required
  tags: string[];       // 0-20 items
  status: "published" | "draft"; // [NEW] Visibility control
  order: number;                 // [NEW] Sort order (0-10000)
  images: string[];     // Paths like "/uploads/images/..."
  video: string | null; // Path starting with /uploads/videos/
  pdf: string | null;   // Path starting with /uploads/pdfs/
  documents: string[];  // [NEW] Paths starting with /uploads/documents/
  thumbnail: string | null; // Overrides first image
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

### 4.2 Field Definitions

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | string | UUID v4 format or `sample-*` prefix | Generated by `uuid.v4()`, immutable after creation |
| `title` | string | 1-200 chars, sanitized | Null bytes removed, whitespace normalized |
| `description` | string | 0-5000 chars, sanitized | Can be empty string |
| `tool` | string | Enum: Power BI, Tableau, Excel | Validated against whitelist |
| `tags` | string[] | Max 20 items, each max 50 chars | Filtered, trimmed, deduplicated |
| `images` | string[] | Max 50 items, valid paths | Must start with `/uploads/images/` |
| `video` | string/null | Valid path or null | Must start with `/uploads/videos/` |
| `pdf` | string/null | Valid path or null | Must start with `/uploads/pdfs/` |
| `thumbnail` | string/null | Valid path or null | Used as primary image if set |
| `createdAt` | string | ISO 8601 | Set once on creation, never modified |
| `updatedAt` | string | ISO 8601 | Updated on every modification |

### 4.3 ID Generation Logic

```javascript
import { v4 as uuidv4 } from 'uuid';

const newProject = {
    id: uuidv4(), // e.g., "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    ...projectData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
```

**UUID Validation:**
```javascript
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
return uuidRegex.test(id) || id.startsWith('sample-');
```

The `sample-` prefix allows sample/seed data to have simpler IDs.

### 4.4 Read/Write Lifecycle

**Read Operation:**
1. `ensureDataExists()` creates `data/` directory and empty `projects.json` if missing
2. `fs.readFileSync()` loads file content synchronously
3. `JSON.parse()` deserializes to JavaScript array
4. Error returns empty array `[]`

**Write Operation:**
1. `ensureDataExists()` ensures file exists
2. Read current projects via `getAllProjects()`
3. Modify array (push new, update existing, filter deleted)
4. `JSON.stringify(projects, null, 2)` serializes with formatting
5. `fs.writeFileSync()` atomically writes to disk

### 4.5 Concurrency Assumptions

**Single-Instance Model:**
- The application assumes single-process execution
- No file locking is implemented
- Concurrent writes may cause data loss

**Implications:**
- Safe for single-user admin access
- Safe for multiple simultaneous readers
- Not safe for multiple simultaneous writers

**Mitigation:**
- Admin panel is single-user by design
- Public endpoints are read-only
- Write operations complete synchronously (blocking)

### 4.6 File Path Mapping Logic

**Upload Path Format:**
```
/uploads/{category}/{timestamp}-{random}-{sanitized-name}.{ext}

Example:
/uploads/images/1706045123456-a1b2c3d4e5f6-dashboard.jpg
```

**Path Validation:**
```javascript
function isValidUploadPath(filePath) {
    if (!filePath.startsWith('/uploads/')) return false;
    if (!validPrefixes.some(prefix => filePath.startsWith(prefix))) return false;
    if (filePath.includes('..') || filePath.includes('//')) return false;
    if (!/^[a-zA-Z0-9\-_.]+$/.test(filename)) return false;
    return true;
}
```

### 4.7 Metrics Configuration (`data/config.json`)
Stores site-wide statistics that aren't derived from projects.

**Schema:**
```typescript
interface SiteConfig {
  experience: number; // Years of experience (e.g. 5.5)
  customStats: {
    label: string;    // e.g. "Clients Served"
    value: string;    // e.g. "50+"
  }[];
}
```

**Behavior:**
- Auto-created with safe defaults if missing
- Backed up to `config.bak.json` before every write
- Validated on load (falls back to defaults if invalid)

---

## 5. Authentication & Security Model

### 5.1 Admin Authentication Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Browser   │───▶│ POST /api/auth│───▶│ validateCredentials│
│  (username, ├────│              │    │  (timing-safe    │
│  password)  │    │              │    │   comparison)    │
└─────────────┘    └──────┬───────┘    └────────┬────────┘
                          │                      │
                          │ Valid?               │
                          ▼                      ▼
                   ┌──────────────┐    ┌─────────────────┐
                   │ Generate     │    │ Return 401      │
                   │ Session Token│    │ "Invalid        │
                   │ (HMAC-signed)│    │  credentials"   │
                   └──────┬───────┘    └─────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Set HttpOnly │
                   │ Cookie       │
                   │ (8hr expiry) │
                   └──────────────┘
```

**Token Structure:**
```javascript
{
    version: "v2",           // Token version for invalidation
    username: "admin",       // Authenticated username
    timestamp: 1706045123456,// Creation time (ms)
    nonce: "a1b2c3...",      // Random bytes to prevent replay
    fingerprint: "d4e5f6...",// Additional randomness
    signature: "..."         // HMAC-SHA256 of payload
}
```

### 5.2 Environment Variable Handling

**Required Variables:**
| Variable | Purpose | Example |
|----------|---------|---------|
| `ADMIN_USERNAME` | Login username | `admin` |
| `ADMIN_PASSWORD` | Login password | `Portfolio@2024` |
| `SESSION_SECRET` | Token signing key | 64-character hex string |

**Loading:**
- Variables loaded at server startup from `.env.local`
- Next.js automatically loads `.env*` files
- Missing variables trigger console warning

**Security:**
- `.env.local` is gitignored
- Never exposed to client-side code (no `NEXT_PUBLIC_` prefix)
- Validated at startup; missing vars disable authentication

### 5.3 Protected Routes

**API Route Protection:**
```javascript
// In every protected API route:
if (!isAuthenticated(request)) {
    return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
    );
}
```

### 7.1 Public Endpoints
- `GET /api/projects`: List all published projects (Admin gets all).
- `GET /api/projects/[id]`: Get single project. Drafts require authentication.
- `GET /api/metrics`: Real-time aggregated stats (Projects, Tool usage, Media counts). [NEW]
- `GET /api/health`: System status check (Database integrity, Upload permissions). [NEW]

### 7.2 Admin Endpoints (Protected)
- `POST /api/projects`: Create new project.
- `PUT /api/projects/[id]`: Update project.
- `DELETE /api/projects/[id]`: Delete project.
- `POST /api/upload`: Create new file upload.
- `POST /api/metrics`: Update site configuration (Experience, Custom Stats). [NEW]

### 5.4 API Security Boundaries

**Middleware Layer (`src/middleware.js`):**
- Rate limiting per IP address
- Security headers on all responses
- No caching for admin pages

**Security Headers Applied:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
Permissions-Policy: camera=(), microphone=(), ...
Strict-Transport-Security: max-age=31536000  (production only)
```

**Rate Limits:**
| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 60 requests | 1 minute |
| Auth (login) | 10 attempts | 1 minute |
| Upload | 20 requests | 1 minute |

### 5.5 Why This Model Is Acceptable for Personal Use

1. **Single admin user:** No need for user management, roles, or permissions
2. **Low traffic:** Rate limiting prevents brute force without Redis/external store
3. **Temporary hosting:** Codespaces URLs change, reducing attack surface
4. **No sensitive data:** Portfolio content is intentionally public
5. **HTTPS enforced:** Codespaces preview URLs use HTTPS by default

### 5.6 Explicit Limitations and Risks

| Limitation | Risk | Mitigation |
|------------|------|------------|
| Single admin user | No multi-user support | Design constraint; acceptable for portfolio |
| In-memory rate limits | Lost on restart; no cluster support | Single instance assumed |
| Password in env | Exposed if env file leaked | gitignore; Codespaces secrets |
| No refresh tokens | Session fixed at 8 hours | Acceptable for admin sessions |
| No audit logging | Cannot track who did what | Single user; not needed |
| No 2FA | Password-only authentication | Low-risk application |

---

## 6. File Upload & Media Handling

### 6.1 Drag & Drop Upload Flow

```
┌─────────────────┐   ┌───────────────┐   ┌─────────────────┐
│  FileDropzone   │──▶│  onDrop()     │──▶│  uploadFiles()  │
│  Component      │   │  Extracts     │   │  FormData +     │
│                 │   │  FileList     │   │  fetch()        │
└─────────────────┘   └───────────────┘   └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ POST /api/upload│
                                          │ multipart/      │
                                          │ form-data       │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ processFormData │
                                          │ Files()         │
                                          └────────┬────────┘
                                                   │
                      ┌────────────────────────────┴────────────────────────────┐
                      ▼                            ▼                            ▼
              ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
              │ validateFile()│          │ validateFile()│          │ validateFile()│
              │ MIME + magic  │          │ MIME + magic  │          │ MIME + magic  │
              └───────┬───────┘          └───────┬───────┘          └───────┬───────┘
                      │                          │                          │
                      ▼                          ▼                          ▼
              ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
              │ saveFile()    │          │ saveFile()    │          │ saveFile()    │
              │ Atomic write  │          │ Atomic write  │          │ Atomic write  │
              └───────────────┘          └───────────────┘          └───────────────┘
```

### 6.2 Multipart Form Handling in App Router

```javascript
// In /api/upload/route.js
export async function POST(request) {
    // Check content-type header
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
        return error(400, 'Content-Type must be multipart/form-data');
    }
    
    // Parse form data (Web Fetch API)
    const formData = await request.formData();
    
    // Iterate over files
    for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
            // Process file...
        }
    }
}
```

### 6.3 File Validation Rules

**MIME Type Whitelist:**
| Category | Allowed MIME Types | Extensions |
|----------|-------------------|------------|
| Images | `image/jpeg`, `image/png`, `image/gif`, `image/webp` | .jpg, .png, .gif, .webp |
| Videos | `video/mp4`, `video/webm`, `video/ogg` | .mp4, .webm, .ogg |
| PDFs | `application/pdf` | .pdf |

**Magic Number Validation:**
```javascript
const ALLOWED_TYPES = {
    images: {
        'image/jpeg': { ext: '.jpg', magic: [0xFF, 0xD8, 0xFF] },
        'image/png': { ext: '.png', magic: [0x89, 0x50, 0x4E, 0x47] },
        'image/webp': { ext: '.webp', magic: [0x52, 0x49, 0x46, 0x46] },
    },
    pdfs: {
        'application/pdf': { ext: '.pdf', magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
    },
};
```

**Size Limits:**
| Category | Max Size |
|----------|----------|
| Images | 10 MB |
| Videos | 100 MB |
| PDFs | 20 MB |
| Total per upload | 150 MB |

### 6.4 File Naming Strategy

**Format:**
```
{timestamp}-{random8hex}-{sanitized-basename}{extension}
```

**Example:**
```
1706045123456-a1b2c3d4-sales_dashboard.jpg
```

**Sanitization Rules:**
1. Remove path separators (`/`, `\`)
2. Remove null bytes
3. Remove `..` sequences
4. Replace non-alphanumeric with `_`
5. Truncate to 100 characters

### 6.5 Directory Structure

```
public/uploads/
├── images/
│   ├── 1706045123456-a1b2c3d4-dashboard.jpg
│   ├── 1706045123789-b2c3d4e5-chart.png
│   └── .gitkeep
├── videos/
│   ├── 1706045124000-c3d4e5f6-demo.mp4
│   └── .gitkeep
└── pdfs/
    ├── 1706045124500-d4e5f6a7-report.pdf
    └── .gitkeep
```

### 6.6 Media-Project Linking

Files are linked to projects via path strings in the project object:

```json
{
    "id": "uuid-here",
    "title": "Sales Dashboard",
    "images": [
        "/uploads/images/1706045123456-a1b2c3d4-dashboard.jpg",
        "/uploads/images/1706045123789-b2c3d4e5-chart.png"
    ],
    "video": "/uploads/videos/1706045124000-c3d4e5f6-demo.mp4",
    "pdf": "/uploads/pdfs/1706045124500-d4e5f6a7-report.pdf"
}
```

**On Project Delete:**
```javascript
// db.js deleteProject()
const safeDeleteFile = (filePath) => {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

project.images.forEach(safeDeleteFile);
safeDeleteFile(project.video);
safeDeleteFile(project.pdf);
```

### 6.7 GitHub Codespaces Persistence Behavior

**Critical Understanding:**

| State | Persisted? | Notes |
|-------|------------|-------|
| Committed files | ✅ Yes | Survive Codespace rebuild |
| Uncommitted files | ⚠️ Temporary | Lost on Codespace delete |
| `node_modules/` | 🔄 Recreated | Regenerated from `package.json` |
| `.next/` build output | 🔄 Recreated | Regenerated on build |
| `.env.local` | ⚠️ Temporary | Recreated from `.env.example` |

**User Warning:**
The admin dashboard displays a persistent warning:
> "Uploaded files exist only in this workspace. To persist them, commit to Git."

---

## 7. Admin Panel Behavior

### 7.1 Login Flow

1. User navigates to `/admin`
2. `AdminPage` checks auth status via `GET /api/auth`
3. If not authenticated, renders `LoginForm`
4. User enters username/password
5. `LoginForm` submits to `POST /api/auth`
6. On success, server sets HttpOnly cookie
7. UI re-renders showing `Dashboard`

**UI States:**
| State | Display |
|-------|---------|
| Checking auth | Spinner centered on page |
| Not authenticated | Login form |
| Authenticated | Dashboard with sidebar |

### 7.2 Project CRUD Lifecycle

**Create:**
1. Click "New Project" → navigates to `/admin/projects/new`
2. Fill form (title, description, tool, tags)
3. Upload files via dropzone
4. Click "Create Project"
5. `POST /api/projects` with JSON body
6. On success, redirect to `/admin`

**Read (Dashboard):**
1. Dashboard mounts
2. `useEffect` calls `GET /api/projects`
3. Projects rendered as list with thumbnails
4. Stats calculated and displayed

**Update:**
1. Click edit icon on project row
2. Navigate to `/admin/projects/[id]/edit`
3. Form pre-populated with existing data
4. Modify fields
5. Click "Save Changes"
6. `PUT /api/projects/[id]`
7. On success, redirect to `/admin`

**Delete:**
1. Click trash icon on project row
2. Browser `confirm()` dialog
3. If confirmed, `DELETE /api/projects/[id]`
4. On success, project removed from list

### 7.3 UI States

**Loading States:**
- Dashboard: Spinner in project list area
- Project form: Submit button shows spinner, disabled

**Success States:**
- Create: Redirect to dashboard
- Update: Redirect to dashboard
- Delete: Project removed from list, no page change

**Error States:**
- Login: Red banner with error message
- API errors: Logged to console, generic user message
- Validation: Inline form errors

### 7.4 Edit vs Create Behavior

| Aspect | Create Mode | Edit Mode |
|--------|-------------|-----------|
| **Route** | `/admin/projects/new` | `/admin/projects/[id]/edit` |
| **Form initial state** | Empty fields | Pre-populated from API |
| **API call** | `POST /api/projects` | `PUT /api/projects/[id]` |
| **Submit button text** | "Create Project" | "Save Changes" |
| **Page title** | "New Project" | "Edit Project" |
| **Auth check** | On mount | On mount + fetch project |

### 7.5 Delete Safeguards

1. **Confirmation dialog:** Browser `confirm()` required
2. **Auth check:** API verifies session token
3. **File cleanup:** Associated media files deleted
4. **Atomic operation:** Project removed from JSON, files deleted

---

## 8. Public UI Behavior

### 8.1 Homepage Rendering Logic

**Component:** `src/app/page.jsx`

**Data Fetching:**
```javascript
useEffect(() => {
    fetch('/api/projects')
        .then(res => res.json())
        .then(setProjects)
        .catch(console.error)
        .finally(() => setLoading(false));
}, []);
```

**Filtering:**
```javascript
const filtered = useMemo(() =>
    filter === 'all' ? projects : projects.filter(p => p.tool === filter),
    [projects, filter]
);
```

**Rendering Order:**
1. Header (fixed, z-40)
2. Hero section (title, subtitle, CTAs)
3. Metrics section (stats with accent)
4. Project grid (filtered cards)
5. Expertise section (skills with progress bars)
6. Contact section (email CTA)
7. Footer

### 8.2 Project Card Behavior

**Component:** `src/components/ui/Card.jsx`

**Features:**
- Entire card is clickable (wraps in `<Link>`)
- Image zoom on hover (scale 1.03, 500ms)
- Card lift on hover (translateY -2px)
- Shadow intensifies on hover
- Staggered animation delay based on index

**Image Handling:**
```javascript
const cover = thumbnail || images?.[0];
// If no cover, show placeholder bars
```

### 8.3 Project Detail Page

**Component:** `src/app/projects/[id]/page.jsx`

**Data Fetching:**
```javascript
useEffect(() => {
    fetch(`/api/projects/${id}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(setProject)
        .catch(() => router.push('/'))
        .finally(() => setLoading(false));
}, [id, router]);
```

**Sections (in order):**
1. Back navigation link
2. Badge row (tool + tags)
3. Title (h1)
4. Description paragraph
5. Main image (clickable for lightbox)
6. Thumbnail strip (if multiple images)
7. Video player (if video exists)
8. PDF download card (if PDF exists)
9. Metadata (tool, date, tags)
10. "View All Projects" link

### 8.4 Media Rendering Logic

**Images:**
- Next.js `<Image>` component with `fill` prop
- `object-cover` for consistent aspect ratios
- `priority` on first image, `loading="lazy"` on others
- Click opens Modal lightbox

**Videos:**
- Native `<video>` element with `controls`
- Poster set to first project image
- `preload="metadata"` for performance

**PDFs:**
- Download card with icon
- `<a href={pdf} download>` for one-click download

### 8.5 Responsive Behavior

**Breakpoints:**
| Breakpoint | Width | Notable Changes |
|------------|-------|-----------------|
| Default | < 640px | Single column, stacked layout |
| `sm` | ≥ 640px | Two column grids |
| `md` | ≥ 768px | Sidebar visible, three columns |
| `lg` | ≥ 1024px | Wider containers, larger text |

**Mobile Adaptations:**
- Hamburger menu in header
- Cards stack vertically
- Image thumbnails in 4-column grid
- Touch-friendly tap targets (min 44px)

### 8.6 Dark/Light Mode Handling

**Implementation:**
```javascript
// ThemeToggle.jsx
useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
}, []);

const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
};
```

**Tailwind Configuration:**
```javascript
// tailwind.config.js
darkMode: 'class'
```

**CSS Variables:**
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
}
```

---

## 9. GitHub Codespaces Hosting Model

### 9.1 How Codespaces Runs the App

1. **Container Creation:**
   - GitHub provisions a Linux container
   - Image: `mcr.microsoft.com/devcontainers/javascript-node:20`
   - Container runs in GitHub's cloud infrastructure

2. **Post-Create Setup:**
   ```bash
   npm install                              # Install dependencies
   cp -n .env.example .env.local 2>/dev/null || true  # Create env file
   ```

3. **Dev Server Start:**
   ```bash
   npm run dev  # next dev --hostname 0.0.0.0
   ```

4. **Port Exposure:**
   - Next.js binds to `0.0.0.0:3000`
   - Codespaces detects the port
   - Creates a tunnel to the container

### 9.2 Port Forwarding Logic

**Configuration (`.devcontainer/devcontainer.json`):**
```json
{
    "forwardPorts": [3000],
    "portsAttributes": {
        "3000": {
            "label": "Portfolio App",
            "onAutoForward": "openPreview",
            "visibility": "public"
        }
    }
}
```

**Behavior:**
| Setting | Effect |
|---------|--------|
| `forwardPorts` | Automatically forward when port is bound |
| `onAutoForward` | Open preview in browser tab |
| `visibility: public` | URL accessible without authentication |

### 9.3 Preview URL Behavior

**URL Format:**
```
https://{codespace-name}-3000.app.github.dev
```

**Characteristics:**
- HTTPS enforced
- URL changes with each new Codespace
- Accessible from any device/network
- No custom domain support
- Active only while Codespace is running

### 9.4 Environment Variable Loading

**Load Order:**
1. `.env` (committed, public values)
2. `.env.local` (local overrides, never committed)
3. `.env.development` (dev-specific)
4. `.env.production` (prod-specific)

**In Codespaces:**
- `.env.example` auto-copied to `.env.local` on create
- User must edit `.env.local` for custom credentials
- Changes require dev server restart

### 9.5 Restart Behavior

**Soft Restart (dev server):**
```bash
# Ctrl+C then:
npm run dev
```
- Environment reloaded
- Code changes reflected
- Uploaded files preserved

**Codespace Stop/Start:**
- Container paused/resumed
- All files preserved
- dev server must be manually restarted

**Codespace Rebuild:**
- Container recreated from scratch
- `npm install` runs again
- Uncommitted files **LOST**
- `.env.local` recreated from `.env.example`

### 9.6 Known Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| 60 hours/month free tier | Codespace times out | Stop when not in use |
| URL changes per Codespace | Links break when recreated | Use short-lived demo sessions |
| No custom domains | Unprofessional URLs | Deploy to production for permanent hosting |
| Uncommitted files lost on rebuild | Media uploads disappear | Commit uploads to Git |
| Single timezone | Timestamps may be off | Use ISO format everywhere |

### 9.7 Best Practices for Persistence

1. **Commit uploaded files regularly:**
   ```bash
   git add public/uploads/
   git commit -m "Add project media files"
   git push
   ```

2. **Commit `projects.json` changes:**
   ```bash
   git add data/projects.json
   git commit -m "Update project data"
   git push
   ```

3. **Set idle timeout to minimum:**
   - GitHub Settings → Codespaces → Default idle timeout: 30 minutes

4. **Stop Codespaces when not using:**
   - VS Code Command Palette → "Codespaces: Stop Current Codespace"

---

## 10. Verification & Testing Checklist

### 10.1 Environment Setup Verification

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open repo in Codespaces | Container builds without errors |
| 2 | Check terminal | "Dependencies installed" message |
| 3 | Verify `node_modules/` exists | Directory present |
| 4 | Verify `.env.local` exists | File present with default values |
| 5 | Run `npm run dev` | Server starts on port 3000 |
| 6 | Check Ports tab | Port 3000 listed |

### 10.2 Public Site Verification

| Step | Action | Expected Result |
|------|--------|----------------|
| 7 | Open preview URL | Homepage loads |
| 8 | Check hero section | Title and CTAs visible |
| 9 | Scroll to project grid | Sample projects displayed |
| 10 | Click tool filter pill | Projects filtered correctly |
| 11 | Click project card | Detail page loads |
| 12 | Click dark mode toggle | Theme switches smoothly |
| 13 | Open in incognito | Site accessible without cookies |

### 10.3 Admin Panel Verification

| Step | Action | Expected Result |
|------|--------|----------------|
| 14 | Navigate to `/admin` | Login form displayed |
| 15 | Enter wrong password | "Invalid credentials" error |
| 16 | Enter correct credentials | Dashboard loads |
| 17 | Click "New Project" | Form page loads |
| 18 | Fill and submit form | Project created, redirects |
| 19 | Click edit icon | Edit form pre-populated |
| 20 | Modify and save | Changes persist |
| 21 | Click delete icon | Confirmation appears |
| 22 | Confirm delete | Project removed |

### 10.4 File Upload Verification

| Step | Action | Expected Result |
|------|--------|----------------|
| 23 | Drag image to dropzone | File uploads, preview shown |
| 24 | Drag invalid file | Error message displayed |
| 25 | Drag file > 10MB | Size error displayed |
| 26 | Check project detail | Uploaded image visible |
| 27 | Upload video | Video player works |
| 28 | Upload PDF | Download link works |

### 10.5 Persistence Verification

| Step | Action | Expected Result |
|------|--------|----------------|
| 29 | Stop Codespace | Codespace pauses |
| 30 | Restart Codespace | All files preserved |
| 31 | Run `npm run dev` | Server starts normally |
| 32 | Check projects | Data preserved |
| 33 | Check uploads | Files preserved |

### 10.6 Common Failure Points

| Issue | Cause | Solution |
|-------|-------|----------|
| Port not appearing | Server not started | Run `npm run dev` |
| Preview shows error | Server still starting | Wait 10-15 seconds |
| Can't share URL | Port set to private | Change visibility to Public |
| Login fails | Wrong credentials | Check `.env.local` |
| Upload fails | Not authenticated | Login first |
| Files missing after rebuild | Not committed | Commit files to Git |
| `MODULE_NOT_FOUND` | Missing dependencies | `rm -rf node_modules && npm install` |
| Auth not configured warning | Missing env vars | Check `.env.local` exists |

---

## 11. Known Limitations & Future Improvements

### 11.1 What This System Is NOT Designed For

| Use Case | Reason Not Supported |
|----------|---------------------|
| Multiple admin users | Single-user auth model |
| User accounts (viewer login) | No user management |
| Comments/feedback system | No database for user content |
| Portfolio analytics | No tracking/analytics |
| Content scheduling | No scheduled jobs |
| Multiple portfolios | Single-tenant design |
| Custom domains in Codespaces | Platform limitation |
| Large file storage (GB+) | Git repo size limits |

### 11.2 Scaling Limits

| Constraint | Current Limit | Bottleneck |
|------------|---------------|------------|
| Projects | ~100 | JSON parse/stringify performance |
| Images per project | 50 | UI rendering, page size |
| Concurrent users | ~10 | Single-process Node.js |
| Upload size | 150 MB total | Memory for parsing |
| Storage | ~1 GB | Git repo size limits |

### 11.3 Security Limits

| Aspect | Current State | Production Requirement |
|--------|---------------|----------------------|
| Rate limiting | In-memory | Redis or edge function |
| Session storage | Signed cookie | Database-backed sessions |
| Password hashing | Plain comparison | bcrypt or Argon2 |
| Audit logging | None | Structured logging service |
| Secret management | `.env.local` file | Secrets manager (Vault, AWS Secrets) |
| 2FA | Not implemented | TOTP or WebAuthn |

### 11.4 Production SaaS Version Changes

If converting to a multi-tenant SaaS:

1. **Database:** Replace JSON with PostgreSQL
2. **Auth:** Implement NextAuth.js with OAuth providers
3. **File Storage:** Use S3/Cloudflare R2
4. **CDN:** Cloudflare or CloudFront for assets
5. **Rate Limiting:** Upstash Redis or Cloudflare Workers
6. **Logging:** Datadog, Logtail, or similar
7. **Monitoring:** Sentry for error tracking
8. **Email:** Resend or SendGrid for notifications
9. **Hosting:** Vercel, Railway, or Fly.io

---

## 12. Implementation Notes & Trade-offs

### 12.1 Concurrency & Data Consistency
The generic JSON file-based storage (`db.js`) uses synchronous file operations (`fs.readFileSync`, `fs.writeFileSync`).
- **Trade-off:** This blocks the event loop momentarily but ensures atomic writes without race conditions for a single-process runtime.
- **Limitation:** In a clustered environment (like PM2 with multiple instances), this would lead to data overwrites.
- **Decision:** acceptable for this specific single-user portfolio use case.

### 12.2 Middleware on Edge Runtime
The middleware (`middleware.js`) strictly adheres to Edge Runtime limitations.
- **Constraint:** No Node.js APIs (filesystem, path) are used.
- **Rate Limiting:** Uses an in-memory `Map`. This means rate limits reset if the server restarts or the lambda cold-boots (Vercel).
- **Decision:** Sufficient for preventing basic abuse on a personal site.

### 12.3 Client-Side Auditing
All Admin pages (`/admin/*`) explicitly use `'use client'` to handle:
- Browser-only APIs (localStorage for theme)
- React Hooks (`useState`, `useEffect`)
- Authentication state management
Client and Server components are strictly separated to prevent hydration mismatches.

---

## 13. Glossary

### App Router
Next.js 13+ routing system using the `app/` directory. Routes are defined by folder structure. Supports React Server Components, layouts, loading states, and API routes via `route.js` files.

### Codespaces Preview
A GitHub Codespaces feature that exposes locally running servers via a public HTTPS URL. Format: `https://{name}-{port}.app.github.dev`. Allows sharing development work without deployment.

### Admin Protection
The authentication mechanism preventing unauthorized access to admin routes. Implemented via:
- Environment-based credentials
- HMAC-signed session tokens
- HttpOnly cookies
- API route checks

### JSON DB
The storage layer using a plain JSON file (`data/projects.json`) instead of a traditional database. Provides:
- Zero configuration
- Human-readable format
- Git version control
- Sufficient performance for single-user scenarios

### Client vs Server Components

**Server Components (default in App Router):**
- Render on the server
- Can access filesystem, databases, env vars
- No React hooks (`useState`, `useEffect`)
- No browser APIs (`window`, `document`)

**Client Components (marked with `'use client'`):**
- Render on client after initial server render
- Can use React hooks and browser APIs
- Can handle user interactions
- Bundle size sent to browser

| Component | Type | Reason |
|-----------|------|--------|
| `page.jsx` (homepage) | Client | Uses `useState`, `useEffect` for filtering |
| `Header.jsx` | Client | Uses `useState` for mobile menu |
| API routes | Server | Node.js filesystem access |
| `db.js` | Server-only | Uses `fs` module |

### Magic Number Validation
Security technique that verifies file content matches its declared MIME type by checking the first bytes of the file:
- JPEG: `FF D8 FF`
- PNG: `89 50 4E 47`
- PDF: `25 50 44 46` ("%PDF")

Prevents attackers from uploading malicious files disguised as images.

### Timing-Safe Comparison
Cryptographic technique that compares two strings in constant time, regardless of how many characters match. Prevents attackers from determining password correctness by measuring response time. Implemented using `crypto.timingSafeEqual()`.

### CSRF (Cross-Site Request Forgery)
Attack where a malicious site tricks a user's browser into making unauthorized requests to another site where they're logged in. Mitigated by:
- Origin header validation
- SameSite=Strict cookies
- Request origin checking

### Rate Limiting
Technique to prevent abuse by limiting the number of requests from a single source. Implementation:
- In-memory Map storing request counts per IP
- 60 requests/minute for API
- 10 requests/minute for auth
- Returns 429 Too Many Requests when exceeded

---

**End of Documentation**

*This document should be updated whenever significant changes are made to the system architecture, security model, or user-facing behavior.*
