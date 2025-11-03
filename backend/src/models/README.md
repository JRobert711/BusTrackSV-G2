# Models

This directory contains OOP entity models with getters/setters.

## Purpose
- Define domain entities as classes
- Use proper encapsulation (private fields, getters/setters)
- No business logic (that belongs in services)
- Validation in constructors or setters

## Example
```javascript
class User {
  #id;
  #email;
  #role;

  constructor(data) {
    this.#id = data.id;
    this.#email = data.email;
    this.#role = data.role || 'user';
  }

  get id() { return this.#id; }
  get email() { return this.#email; }
  get role() { return this.#role; }
  
  setRole(role) {
    if (!['user', 'admin'].includes(role)) {
      throw new Error('Invalid role');
    }
    this.#role = role;
  }
}
```
