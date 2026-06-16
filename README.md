# TaskFlow — Gestion des Utilisateurs

Projet universitaire full-stack : Spring Boot 3 + Angular 16 + MySQL.

---

## Arborescence du projet

```
TaskFlow/
├── taskflow-backend/               ← API Spring Boot
│   ├── pom.xml
│   └── src/main/java/com/taskflow/
│       ├── TaskflowApplication.java
│       ├── config/
│       │   ├── ApplicationConfig.java
│       │   ├── SecurityConfig.java
│       │   ├── SwaggerConfig.java
│       │   └── WebMvcConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── UserController.java
│       │   └── ProfileController.java
│       ├── dto/
│       │   ├── request/  (LoginRequest, RegisterRequest, UserCreateRequest,
│       │   │              UserUpdateRequest, ChangePasswordRequest, ProfileUpdateRequest)
│       │   └── response/ (AuthResponse, UserResponse, PageResponse, DashboardStatsResponse)
│       ├── entity/
│       │   ├── User.java
│       │   └── Role.java   ← enum: ADMIN, PROJECT_MANAGER, MEMBER
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java
│       │   ├── ErrorResponse.java
│       │   ├── ResourceNotFoundException.java
│       │   ├── EmailAlreadyExistsException.java
│       │   └── BadRequestException.java
│       ├── mapper/
│       │   └── UserMapper.java
│       ├── repository/
│       │   └── UserRepository.java
│       ├── security/
│       │   ├── JwtService.java
│       │   ├── JwtAuthenticationFilter.java
│       │   └── UserDetailsServiceImpl.java
│       └── service/
│           ├── AuthService.java
│           ├── UserService.java
│           ├── ProfileService.java
│           └── FileStorageService.java
│
└── taskflow-frontend/              ← Application Angular 16
    ├── angular.json
    ├── package.json
    └── src/app/
        ├── app.module.ts
        ├── app-routing.module.ts
        ├── app.component.*
        ├── core/
        │   ├── guards/     (auth.guard.ts, role.guard.ts)
        │   ├── interceptors/ (auth.interceptor.ts, error.interceptor.ts)
        │   ├── models/     (user.model.ts, auth.model.ts, page.model.ts)
        │   └── services/   (auth.service.ts, user.service.ts, notification.service.ts)
        ├── shared/
        │   ├── shared.module.ts
        │   └── components/
        │       ├── navbar/
        │       ├── sidebar/
        │       └── confirm-dialog/
        └── pages/
            ├── auth/       (login, register)
            ├── dashboard/
            ├── users/      (user-list, user-form)
            └── profile/
```

---

## Prérequis

| Outil    | Version minimale |
|----------|-----------------|
| Java     | 21              |
| Maven    | 3.9+            |
| Node.js  | 18+             |
| npm      | 9+              |
| MySQL    | 8.0+            |

---

## Installation & Démarrage

### 1. Base de données MySQL

```sql
-- Optionnel : la DB est créée automatiquement au démarrage
CREATE DATABASE IF NOT EXISTS taskflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Modifiez les identifiants dans `taskflow-backend/src/main/resources/application.yml` :

```yaml
spring:
  datasource:
    username: root
    password: votre_mot_de_passe
```

### 2. Backend Spring Boot

```bash
cd taskflow-backend
mvn clean install
mvn spring-boot:run
```

L'API démarre sur → **http://localhost:8080**

Swagger UI → **http://localhost:8080/swagger-ui.html**

### 3. Frontend Angular

```bash
cd taskflow-frontend
npm install
ng serve
```

L'application démarre sur → **http://localhost:4200**

---

## Endpoints API principaux

### Authentification (`/api/auth`)
| Méthode | Endpoint           | Description        | Auth |
|---------|--------------------|--------------------|------|
| POST    | `/auth/register`   | Inscription        | Non  |
| POST    | `/auth/login`      | Connexion → JWT    | Non  |

### Utilisateurs (`/api/users`) — ADMIN uniquement
| Méthode | Endpoint                   | Description               |
|---------|----------------------------|---------------------------|
| GET     | `/users`                   | Liste paginée + filtres   |
| GET     | `/users/stats`             | Statistiques dashboard    |
| GET     | `/users/{id}`              | Détail utilisateur        |
| POST    | `/users`                   | Créer un utilisateur      |
| PUT     | `/users/{id}`              | Modifier un utilisateur   |
| DELETE  | `/users/{id}`              | Supprimer                 |
| PATCH   | `/users/{id}/toggle-status`| Activer / Désactiver      |
| PATCH   | `/users/{id}/role`         | Changer le rôle           |
| POST    | `/users/{id}/avatar`       | Upload image              |
| PATCH   | `/users/{id}/password`     | Changer mot de passe      |

### Profil (`/api/profile`) — Utilisateur connecté
| Méthode | Endpoint           | Description              |
|---------|--------------------|--------------------------|
| GET     | `/profile`         | Obtenir son profil       |
| PUT     | `/profile`         | Modifier son profil      |
| POST    | `/profile/avatar`  | Uploader son avatar      |
| PATCH   | `/profile/password`| Changer son mot de passe |

---

## Paramètres de recherche (GET `/api/users`)

```
?page=0&size=10&sort=createdAt&direction=desc&search=jean&role=ADMIN&enabled=true
```

---

## Rôles

| Rôle              | Accès                                    |
|-------------------|------------------------------------------|
| `ADMIN`           | Accès complet (CRUD utilisateurs, stats) |
| `PROJECT_MANAGER` | Dashboard + Profil                       |
| `MEMBER`          | Dashboard + Profil                       |

---

## Technologies

**Backend :** Spring Boot 3.2, Java 21, Spring Security, JWT (jjwt 0.11.5), Spring Data JPA, MySQL, Lombok, SpringDoc OpenAPI 2.3

**Frontend :** Angular 16, Angular Material 16, Bootstrap 5, RxJS

---

## Compte administrateur initial

Créez un compte via `POST /api/auth/register` avec `role: "ADMIN"` ou utilisez Swagger pour le premier utilisateur.

```json
{
  "firstName": "Admin",
  "lastName": "TaskFlow",
  "email": "admin@taskflow.tn",
  "password": "Admin@1234",
  "role": "ADMIN"
}
```
