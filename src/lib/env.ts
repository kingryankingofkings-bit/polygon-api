// @app:shared — edit only through declared slots. Code installed by app/template-next@0.3.0.
//
// Typed env via @t3-oss/env-nextjs.
//
// Modules contribute env vars via their manifest `contributions` block.
// The installer regenerates this file's slots between the markers below.
// Hand-editing outside those slots is rejected by the ownership validator.
//
// The `no-secrets-in-client-bundle` validator scans the build output and rejects
// the install if any non-NEXT_PUBLIC_ env name appears in client chunks.

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // D24: Prisma is the framework-native DB client. DATABASE_URL is
    // injected by App at deploy time (D23). The actual Postgres is
    // provisioned by a separate App service; this module ships the
    // client only.
    DATABASE_URL: z.string().url(),
    // @app:slot env_vars_server start
    // Modules append additional server-side env vars here at install time.
    // @app:contrib manuscript start
    ENCRYPTION_KEY: z.string().optional(),
    STRIPE_PAYMENT_LINK_STANDARD: z.string().url().optional(),
    STRIPE_PAYMENT_LINK_LARGE: z.string().url().optional(),
    // @app:contrib manuscript end
    // @app:contrib ai start
    APP_AI_BASE_URL: z.string().url().default('https://app.com/ai/openai/v1'),
    APP_API_KEY: z.string().min(1).optional(),
    APP_API_TOKEN: z.string().min(1).optional(),
    // @app:contrib ai end
    // @app:contrib better-auth start
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    APP_OWNER_EMAIL: z.string().optional(),
    // @app:contrib better-auth end
    // @app:contrib stripe-billing start
    APP_API_BASE_URL: z.string().url().default('https://app.com'),
    // APP_API_KEY and APP_API_TOKEN already declared by ai module
    // @app:contrib stripe-billing end
    // @app:contrib email start
    APP_EMAIL_PROXY_URL: z.string().url(),
    // @app:contrib email end
    // @app:slot env_vars_server end
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    // Base for @/lib/api-client + proxy.ts connect-src. Default-empty
    // (unset) means same-origin `/api`; set only for an external API origin.
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    // @app:slot env_vars_client start
    // Modules append NEXT_PUBLIC_* env vars here at install time.
    // @app:slot env_vars_client end
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // @app:slot env_runtime start
    // Modules append runtime-env entries here at install time.
    // @app:contrib ai start
    APP_AI_BASE_URL: process.env.APP_AI_BASE_URL,
    APP_API_KEY: process.env.APP_API_KEY,
    APP_API_TOKEN: process.env.APP_API_TOKEN,
    // @app:contrib ai end
    // @app:contrib better-auth start
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    APP_OWNER_EMAIL: process.env.APP_OWNER_EMAIL,
    // @app:contrib better-auth end
    // @app:contrib manuscript start
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    STRIPE_PAYMENT_LINK_STANDARD: process.env.STRIPE_PAYMENT_LINK_STANDARD,
    STRIPE_PAYMENT_LINK_LARGE: process.env.STRIPE_PAYMENT_LINK_LARGE,
    // @app:contrib manuscript end
    // @app:contrib stripe-billing start
    APP_API_BASE_URL: process.env.APP_API_BASE_URL,
    // APP_API_KEY and APP_API_TOKEN already declared by ai module
    // @app:contrib stripe-billing end
    // @app:contrib email start
    APP_EMAIL_PROXY_URL: process.env.APP_EMAIL_PROXY_URL,
    // @app:contrib email end
    // @app:slot env_runtime end
  },
  emptyStringAsUndefined: true,
  // SKIP_ENV_VALIDATION=1 bypasses validation for envless builds (lint/CI/local).
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
