import 'reflect-metadata'

// Global test setup for NestJS + Vitest
// Extend this file with database seeding / teardown as tests are added
beforeAll(() => {
  // Ensure environment variables are available for tests
  process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://localhost:54321'
  process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-service-key'
  process.env.SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET ?? 'test-jwt-secret-32-chars-minimum!!'
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'
})
