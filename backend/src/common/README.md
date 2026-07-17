# Common

> The `common` directory contains reusable components shared across the entire backend.

These resources are not tied to any specific module and are designed to eliminate duplication while promoting consistency throughout the application.

---

# Purpose

The Common layer provides foundational building blocks used by multiple modules.

Rather than implementing the same functionality repeatedly, shared components are centralized here.

---

# Typical Contents

```text
common/
├── decorators/
├── guards/
├── interceptors/
├── filters/
├── pipes/
├── exceptions/
├── constants/
└── helpers/
```

---

# Responsibilities

The Common directory provides:

- Custom decorators
- Authorization guards
- Request interceptors
- Exception filters
- Validation pipes
- Shared constants
- Helper functions
- Base classes
- Common utilities

---

# Design Principles

Components inside this directory should be:

- Generic
- Reusable
- Independent
- Lightweight
- Well-tested

Business-specific logic should never be placed here.

---

# Benefits

Using a centralized Common layer improves:

- Code consistency
- Maintainability
- Developer productivity
- Testability
- Scalability

---

**Status:** 🚧 Active Development
