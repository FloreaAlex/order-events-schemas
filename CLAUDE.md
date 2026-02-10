# Order Events Schemas

## System Architecture Overview

**Workspace**: Default Workspace
**Architecture Style**: Microservices with event-driven communication
**This Component's Role**: Shared npm package (@florea-alex/order-events-schemas) containing Zod schemas, event type constants, topic/consumer group constants, and helper functions for all order lifecycle Kafka events. Used by Order Service, Product Service, and Notification Worker.
**Component Type**: library
**Position in Flow**: Receives from: Order Service (other), Product Service (other), Notification Worker (other)

**Related Components**:
  - ← **Order Service** (service) - other
  - ← **Product Service** (service) - other
  - ← **Notification Worker** (worker) - other

## System-Wide Patterns

### Repository Pattern for Database Access
# Repository Pattern

All database access must go through repository classes to maintain clean separation of concerns.

## Structure
```typescript
// repositories/UserRepository.ts
export class UserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    return this.db.users.findUnique({ where: { id } })
  }

  async create(data: CreateUserDto): Promise<User> {
    return this.db.users.create({ data })
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return this.db.users.update({ where: { id }, data })
  }
}
```

## Usage in Services
```typescript
// services/UserService.ts
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async registerUser(email: string, password: string) {
    // Business logic here
    const hashedPassword = await hash(password)
    return this.userRepo.create({ email, password: hashedPassword })
  }
}
```

## Benefits
- Easy to mock for testing
- Database logic isolated
- Can swap ORMs easily
- Clear data access layer

## Component Details

**Purpose**: Shared npm package (@florea-alex/order-events-schemas) containing Zod schemas, event type constants, topic/consumer group constants, and helper functions for all order lifecycle Kafka events. Used by Order Service, Product Service, and Notification Worker.
**Tech Stack**: JavaScript/TypeScript
**Architecture**: *(To be documented - explore src/ directory)*

**Key Directories**:
- `src/` - Source code
- `tests/` - Test files
- `docs/` - Documentation

## Dependencies

**Databases**: *(To be documented)*
**Message Queues**: *(Check for Kafka/RabbitMQ)*
**External APIs**: *(To be documented)*

## API Contracts

### REST Endpoints
*(To be documented - check routes/controllers)*

### Events Published
*(To be documented - check event publishers)*

### Events Consumed
*(To be documented - check event consumers)*

## Conventions

### API Design Conventions
## REST API Conventions

### URL Structure
- Use plural nouns: `/users`, `/products`, `/orders`
- Nested resources: `/orders/:id/items`
- Use lowercase with hyphens: `/order-items`

### HTTP Methods
- `GET` - Retrieve resources
- `POST` - Create new resources
- `PUT` - Update entire resource
- `PATCH` - Partial update
- `DELETE` - Remove resource

### Response Format
```json
{
  "data": { },
  "error": null,
  "meta": { "page": 1, "total": 100 }
}
```

### Error Handling
- Return appropriate HTTP status codes
- Include error message and code in response body
- Log errors with correlation IDs

### Health Checks
All services expose `GET /health` returning `{ "status": "ok" }`

### API Response Format
# API Response Format

All API responses must follow this standard format:

```json
{
  "success": boolean,
  "data": any,
  "error": string | null,
  "timestamp": ISO8601
}
```

**Success responses:**
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-02-08T11:00:00Z"
}
```

**Error responses:**
```json
{
  "success": false,
  "data": null,
  "error": "User not found",
  "timestamp": "2026-02-08T11:00:00Z"
}
```

### Environment Variables Naming
# Environment Variables Naming Convention

## Format
All environment variables must use `SCREAMING_SNAKE_CASE`.

## Prefixes by Category

### Database
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

### API/Service
- `API_PORT`
- `API_BASE_URL`
- `SERVICE_NAME`

### External Services
- `KAFKA_BROKERS`
- `REDIS_URL`
- `AWS_REGION`
- `STRIPE_API_KEY`

### Authentication
- `JWT_SECRET`
- `JWT_EXPIRY`
- `OAUTH_CLIENT_ID`
- `OAUTH_CLIENT_SECRET`

## Required in .env.example
Every service must have a `.env.example` file with all required variables (without values):
```bash
# .env.example
DB_HOST=
DB_PORT=
DB_NAME=
API_PORT=
JWT_SECRET=
```

## Validation
All environment variables should be validated at startup:
```typescript
const requiredEnvVars = ["DB_HOST", "DB_PORT", "API_PORT"]
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required env var: ${varName}`)
  }
})
```

### Task Creation Standards
# Task Creation Standards

When breaking down goals into tasks, follow this structure to ensure Developer agents can execute them successfully.

## Task Title Format
`[Action] [What] in [Component]`

Examples:
- ✅ "Add user registration endpoint to user-service"
- ✅ "Fix rate limiting bug in api-gateway"
- ✅ "Implement order cancellation in order-service"
- ❌ "Registration" (too vague)
- ❌ "Fix bug" (no context)

## Task Description Structure

### 1. Objective (Required)
Clear statement of what needs to be accomplished.

### 2. Acceptance Criteria (Required)
Specific, measurable requirements. Use bullet points:
- Feature works as described
- Tests pass
- Follows conventions
- Handles edge cases
- Error handling implemented

### 3. Technical Notes (Recommended)
- Relevant patterns to follow (reference knowledge entries)
- Constraints and boundaries to respect
- Existing code to modify or extend
- Database schema if applicable
- API contracts with other services

### 4. Dependencies (If applicable)
- Tasks that must complete first
- External services or APIs needed
- Shared code or libraries required

### 5. Testing Requirements (Recommended)
- Unit tests for business logic
- Integration tests for API endpoints
- Edge cases to cover

## Example: Good Task

**Title:** Add user registration endpoint to user-service

**Description:**
Create POST /api/users/register endpoint in user-service.

Acceptance Criteria:
- Accepts `{ email, password, name }` in request body
- Validates email format (RFC 5322)
- Validates password strength (min 8 chars, 1 uppercase, 1 number, 1 special)
- Hashes password with bcrypt (cost factor 12)
- Stores user in database via UserRepository
- Returns user object (without password) using standard API Response Format
- Returns 201 on success
- Returns 400 with validation errors
- Returns 409 if email already exists
- Includes unit tests (90%+ coverage)
- Includes integration test

Technical Notes:
- Follow **Repository Pattern** convention for database access
- Use **API Response Format** convention for responses
- Use **Environment Variables Naming** for bcrypt cost factor (BCRYPT_ROUNDS)
- Reference: UserRepository already exists at `src/repositories/UserRepository.ts`
- Database: `users` table has columns: id, email, password_hash, name, created_at

Testing:
- Unit test: Valid registration
- Unit test: Invalid email format
- Unit test: Weak password
- Unit test: Duplicate email
- Integration test: Full registration flow

**Dependencies:** None

## Example: Bad Task

**Title:** Registration

**Description:**
Let users register

❌ Problems:
- Vague title (no action, no component)
- No acceptance criteria
- No technical details
- No testing requirements
- Developer must guess everything

## Task Sizing Guidelines

### ✅ Good Size (1-3 hours)
- Single endpoint
- Single feature
- Specific bug fix
- Clear scope

### ⚠️ Too Large (split into smaller tasks)
- "Implement entire auth system"
- "Build user management"
- Multiple endpoints
- Affects 3+ files significantly

### ⚠️ Too Small (combine with related work)
- "Add a comment"
- "Fix typo"
- Trivial changes

## Referencing Knowledge

Always reference relevant knowledge entries:
- **Conventions**: Coding standards, patterns
- **Boundaries**: What NOT to do
- **ADRs**: Architectural decisions
- **Patterns**: Implementation approaches

Example:
```
Technical Notes:
- Follow Repository Pattern (see knowledge entry)
- Respect Gateway Database Boundary (no direct DB access)
- Use Kafka events per ADR-001 for order notifications
```

## When Developer Agents Execute

Developer agents will:
1. Read task description
2. Query MCP for relevant architecture context
3. Query MCP for referenced knowledge entries
4. Query MCP for component/repo details
5. Execute with full context

**Detailed tasks = successful execution!**

## Boundaries & Constraints

✅ **Responsibilities**:
- *(To be defined)*

❌ **NOT Responsible For**:
- *(To be defined)*

🚫 **Do NOT**:
- *(To be defined)*

---

*This file was auto-generated by Atelier. Update it as the component evolves.*
