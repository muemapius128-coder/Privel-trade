# Middleware

> The `middleware` directory contains request-processing components that execute before requests reach application modules.

Middleware provides shared functionality across the entire backend.

---

# Purpose

Middleware enables centralized request handling, reducing duplicated logic across controllers and services.

---

# Responsibilities

Middleware handles:

- Authentication
- Authorization
- Request logging
- Rate limiting
- Request validation
- CORS
- Security headers
- Request tracing
- Performance monitoring
- API versioning

---

# Typical Structure

```text
middleware/
├── auth.middleware.ts
├── logger.middleware.ts
├── cors.middleware.ts
├── rate-limit.middleware.ts
└── request-id.middleware.ts
```

---

# Design Principles

Middleware should remain:

- Lightweight
- Reusable
- Stateless
- High performance

Business logic belongs inside modules—not middleware.

---

**Status:** 🚧 Active Development
