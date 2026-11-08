Act as a Principal Security Engineer. We need to implement an end-to-end secure user authentication system.

Tech Stack: [ Next.js with Supabase, or React, Vercel, Google Console, Firebase ].

Please implement the following architecture in sequence:
1. SECURITY BACKBONE: Create a server-side authentication middleware that extracts, decodes, and validates a JWT token/session cookie from incoming API requests. Reject unauthorized requests with a clear 401 status.
2. DATABASE/STORE: Create a user registration/login flow that safely validates, hashes credentials, and issues an encrypted token.
3. SECURE FRONTEND STORE: Create a secure client-side state/cookie manager that handles token storage (HttpOnly cookie workflow preferred), automatic injection of authorization headers in fetch requests, and handles expired tokens (redirect to login).
4. END-TO-END VERIFICATION: Create one simple protected route (e.g., /api/dashboard) and a corresponding UI page that fetches data using this token to prove the end-to-end loop works securely.

Review your work against OWASP Top 10 guidelines before finalizing. Proceed step-by-step.
