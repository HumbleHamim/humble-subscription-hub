# Firebase setup for local development

Stage 2 uses Firebase Authentication and Cloud Firestore from the browser. It does not connect to a production Firebase project automatically and does not include any credentials in the repository.

## Create a development Firebase project

1. In the Firebase Console, create a separate development project for Humble Subscription Hub.
2. Register a Web App and copy its configuration values into a local `.env.local` file based on `.env.example`.
3. Under **Authentication → Sign-in method**, enable **Email/Password**.
4. Create a Cloud Firestore database in a development region. Use the rules in `firestore.rules` before testing with real accounts.
5. Add `localhost` to **Authentication → Settings → Authorized domains** if Firebase does not already list it.

The Firebase Web App values beginning with `NEXT_PUBLIC_` are intended for the browser. They identify the Firebase project but do not replace Firestore Security Rules. Never put service-account JSON, Firebase Admin credentials, or Cloudflare R2 secrets in `.env.local` values beginning with `NEXT_PUBLIC_`.

## Local configuration

```bash
cp .env.example .env.local
```

Fill in only the six `NEXT_PUBLIC_FIREBASE_*` values for this stage. Restart `npm run dev` after changing them. Without these values, the storefront still builds and the login/register screens explain that Firebase setup is required.

## Data model

Successful registration creates `users/{uid}` with `uid`, `name`, `email`, `phone`, `createdAt`, and `updatedAt`. Sign-in loads the same document and creates it if it is missing. Profile writes are limited to the authenticated user by the rules.

## Production boundary

Do not point this branch at a production Firebase project until the rules, auth flows, backup strategy, monitoring, and deployment environment have been reviewed. Production setup will be a separate approved step.
