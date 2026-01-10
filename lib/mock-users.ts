import { InvalidCredentialsError } from '@ratio1/cstore-auth-ts';

import { platformConfig } from '@/lib/config';

type MockUserRecord = {
  username: string;
  password: string;
  role?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  type: 'simple';
};

export type MockUserSummary = Omit<MockUserRecord, 'password'>;

export class MockUserExistsError extends Error {
  constructor(message = 'User already exists.') {
    super(message);
    this.name = 'MockUserExistsError';
  }
}

export class MockUserValidationError extends Error {
  constructor(message = 'Invalid user details.') {
    super(message);
    this.name = 'MockUserValidationError';
  }
}

type GlobalWithMocks = typeof globalThis & {
  __mockUsers?: MockUserRecord[];
};

const globalWithMocks = globalThis as GlobalWithMocks;

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function buildMockUser({
  username,
  password,
  role,
  metadata
}: {
  username: string;
  password: string;
  role?: string;
  metadata?: Record<string, unknown>;
}): MockUserRecord {
  const now = new Date().toISOString();
  return {
    username,
    password,
    role,
    metadata,
    createdAt: now,
    updatedAt: now,
    type: 'simple'
  };
}

function ensureUsers(): MockUserRecord[] {
  if (!globalWithMocks.__mockUsers) {
    const demoUsername = platformConfig.demoCredentials.username.trim();
    const demoPassword = platformConfig.demoCredentials.password.trim();
    const adminUsername = platformConfig.adminCredentials.username.trim();
    const adminPassword = platformConfig.adminCredentials.password.trim();
    const users: MockUserRecord[] = [];

    if (adminUsername && adminPassword) {
      users.push(
        buildMockUser({
          username: adminUsername,
          password: adminPassword,
          role: 'admin',
          metadata: { displayName: 'Platform Admin' }
        })
      );
    }

    if (demoUsername && demoPassword && normalizeUsername(demoUsername) !== normalizeUsername(adminUsername)) {
      users.push(
        buildMockUser({
          username: demoUsername,
          password: demoPassword,
          role: 'operator',
          metadata: { displayName: 'Demo Clinician' }
        })
      );
    }

    globalWithMocks.__mockUsers = users;
  }

  return globalWithMocks.__mockUsers!;
}

function findUser(username: string): MockUserRecord | undefined {
  const normalized = normalizeUsername(username);
  return ensureUsers().find((candidate) => normalizeUsername(candidate.username) === normalized);
}

function toSummary(user: MockUserRecord): MockUserSummary {
  const { password: _password, ...summary } = user;
  return summary;
}

export function listMockUsers(): MockUserSummary[] {
  return ensureUsers().map((user) => toSummary(user));
}

export function addMockUser({
  username,
  password,
  role,
  displayName
}: {
  username: string;
  password: string;
  role?: string;
  displayName?: string;
}): MockUserSummary {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    throw new MockUserValidationError('Username and password are required.');
  }

  if (findUser(trimmedUsername)) {
    throw new MockUserExistsError();
  }

  const metadata = displayName ? { displayName } : undefined;
  const user = buildMockUser({
    username: trimmedUsername,
    password: trimmedPassword,
    role: role?.trim() || 'user',
    metadata
  });

  ensureUsers().push(user);
  return toSummary(user);
}

export function authenticateMockUser(username: string, password: string): MockUserSummary {
  const user = findUser(username);

  if (!user || user.password !== password) {
    throw new InvalidCredentialsError();
  }

  return toSummary(user);
}
