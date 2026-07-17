# Types

> The `types` directory contains shared TypeScript type definitions used throughout the Privel Trade backend.

Types provide consistency, improve developer productivity, and reduce runtime errors through strong compile-time validation.

---

# Purpose

The Types layer standardizes data structures shared across the application.

It ensures that every module speaks the same language when exchanging information.

---

# Responsibilities

Shared types include:

- User Models
- Broker Models
- Market Data Types
- Trading Types
- Order Types
- Position Types
- Portfolio Types
- AI Response Types
- Risk Models
- Notification Types
- API Response Types
- Error Types

---

# Typical Structure

```text
types/
├── user.types.ts
├── broker.types.ts
├── market.types.ts
├── trading.types.ts
├── ai.types.ts
├── portfolio.types.ts
├── notification.types.ts
└── api.types.ts
```

---

# Design Principles

Shared types should remain:

- Consistent
- Reusable
- Well documented
- Lightweight
- Strongly typed
- Version-aware

---

# Benefits

Using centralized types improves:

- Compile-time safety
- Code readability
- API consistency
- AI interoperability
- Long-term maintainability

---

**Status:** 🚧 Active Development
