import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  InvalidCredentialsError,
  InvalidPasswordError,
  InvalidUserRoleError,
  InvalidUsernameError,
  UserExistsError,
  UserNotFoundError,
  type PublicUser
} from '@ratio1/cstore-auth-ts';

import { ensureAuthInitialized, getAuthClient } from '@/lib/auth/cstore';
import { readSessionFromCookie } from '@/lib/auth/session';
import { platformConfig } from '@/lib/config';

type BasicUser = PublicUser<Record<string, unknown>>;

type ListUsersResponse = {
  success: boolean;
  users?: Pick<BasicUser, 'username' | 'role' | 'metadata' | 'createdAt' | 'updatedAt'>[];
  error?: string;
};

type CreateUserPayload = {
  username?: unknown;
  password?: unknown;
  role?: unknown;
  displayName?: unknown;
};

type CreateUserResponse = {
  success: boolean;
  user?: Pick<BasicUser, 'username' | 'role' | 'metadata' | 'createdAt' | 'updatedAt'>;
  error?: string;
};

type UpdateUserPayload = {
  username?: unknown;
  role?: unknown;
  displayName?: unknown;
};

type UpdateUserResponse = {
  success: boolean;
  user?: Pick<BasicUser, 'username' | 'role' | 'metadata' | 'createdAt' | 'updatedAt'>;
  error?: string;
};

type ChangePasswordPayload = {
  username?: unknown;
  currentPassword?: unknown;
  newPassword?: unknown;
};

type ChangePasswordResponse = {
  success: boolean;
  error?: string;
};

function getSession() {
  const cookieStore = cookies();
  const sessionCookieValue = cookieStore.get(platformConfig.auth.sessionCookieName)?.value;
  return readSessionFromCookie(sessionCookieValue);
}

function isAdminSession() {
  const session = getSession();
  if (!session) {
    return false;
  }
  return session.role === 'admin' || session.username === 'admin';
}

export async function GET() {
  if (!isAdminSession()) {
    return NextResponse.json<ListUsersResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const client = getAuthClient();

  try {
    await ensureAuthInitialized(client);
    const allUsers = await client.simple.getAllUsers();
    const users = allUsers
      .map((user) => ({
        username: user.username,
        role: user.role,
        metadata: user.metadata ?? {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json<ListUsersResponse>({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error('[users] Failed to list users', error);
    return NextResponse.json<ListUsersResponse>({ success: false, error: 'Failed to list users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminSession()) {
    return NextResponse.json<CreateUserResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  let payload: CreateUserPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json<CreateUserResponse>({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { username, password, role, displayName } = payload;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json<CreateUserResponse>(
      { success: false, error: 'Username and password are required' },
      { status: 400 }
    );
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    return NextResponse.json<CreateUserResponse>(
      { success: false, error: 'Username and password cannot be empty' },
      { status: 400 }
    );
  }

  let desiredRole: 'admin' | 'user' | undefined;
  if (role !== undefined) {
    if (role === 'admin' || role === 'user') {
      desiredRole = role;
    } else {
      return NextResponse.json<CreateUserResponse>(
        { success: false, error: 'Role must be "admin" or "user"' },
        { status: 400 }
      );
    }
  }

  const displayNameValue = typeof displayName === 'string' ? displayName.trim() : undefined;
  const metadata = displayNameValue ? { displayName: displayNameValue } : undefined;

  const client = getAuthClient();

  try {
    await ensureAuthInitialized(client);
    const createdUser = await client.simple.createUser(trimmedUsername, trimmedPassword, {
      ...(desiredRole ? { role: desiredRole } : {}),
      ...(metadata ? { metadata } : {})
    });

    return NextResponse.json<CreateUserResponse>(
      {
        success: true,
        user: {
          username: createdUser.username,
          role: createdUser.role,
          metadata: createdUser.metadata,
          createdAt: createdUser.createdAt,
          updatedAt: createdUser.updatedAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof InvalidUsernameError || error instanceof InvalidPasswordError || error instanceof InvalidUserRoleError) {
      return NextResponse.json<CreateUserResponse>({ success: false, error: error.message }, { status: 400 });
    }

    if (error instanceof UserExistsError) {
      return NextResponse.json<CreateUserResponse>({ success: false, error: 'User already exists' }, { status: 409 });
    }

    console.error('[users] Failed to create user', error);
    return NextResponse.json<CreateUserResponse>({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isAdminSession()) {
    return NextResponse.json<UpdateUserResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  let payload: UpdateUserPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json<UpdateUserResponse>({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { username, role, displayName } = payload;

  if (typeof username !== 'string') {
    return NextResponse.json<UpdateUserResponse>({ success: false, error: 'Username is required' }, { status: 400 });
  }

  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    return NextResponse.json<UpdateUserResponse>({ success: false, error: 'Username cannot be empty' }, { status: 400 });
  }

  let desiredRole: 'admin' | 'user' | undefined;
  if (role !== undefined) {
    if (role === 'admin' || role === 'user') {
      desiredRole = role;
    } else {
      return NextResponse.json<UpdateUserResponse>(
        { success: false, error: 'Role must be "admin" or "user"' },
        { status: 400 }
      );
    }
  }

  const displayNameValue = typeof displayName === 'string' ? displayName.trim() : undefined;

  if (desiredRole === undefined && displayNameValue === undefined) {
    return NextResponse.json<UpdateUserResponse>({ success: false, error: 'No updates provided' }, { status: 400 });
  }

  const client = getAuthClient();

  try {
    await ensureAuthInitialized(client);

    let metadataUpdate: Record<string, unknown> | undefined;
    if (displayNameValue !== undefined) {
      const existing = await client.simple.getUser(trimmedUsername);
      if (!existing) {
        return NextResponse.json<UpdateUserResponse>({ success: false, error: 'User not found' }, { status: 404 });
      }
      metadataUpdate = { ...(existing.metadata ?? {}) };
      if (displayNameValue) {
        metadataUpdate.displayName = displayNameValue;
      } else {
        delete metadataUpdate.displayName;
      }
    }

    const updatedUser = await client.simple.updateUser(trimmedUsername, {
      ...(desiredRole ? { role: desiredRole } : {}),
      ...(metadataUpdate ? { metadata: metadataUpdate } : {})
    });

    return NextResponse.json<UpdateUserResponse>(
      {
        success: true,
        user: {
          username: updatedUser.username,
          role: updatedUser.role,
          metadata: updatedUser.metadata,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof InvalidUsernameError || error instanceof InvalidUserRoleError) {
      return NextResponse.json<UpdateUserResponse>({ success: false, error: error.message }, { status: 400 });
    }

    if (error instanceof UserNotFoundError) {
      return NextResponse.json<UpdateUserResponse>({ success: false, error: 'User not found' }, { status: 404 });
    }

    console.error('[users] Failed to update user', error);
    return NextResponse.json<UpdateUserResponse>({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json<ChangePasswordResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let payload: ChangePasswordPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json<ChangePasswordResponse>({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { username, currentPassword, newPassword } = payload;

  if (typeof username !== 'string' || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return NextResponse.json<ChangePasswordResponse>(
      { success: false, error: 'Username, current password, and new password are required' },
      { status: 400 }
    );
  }

  const trimmedUsername = username.trim();
  const trimmedCurrentPassword = currentPassword.trim();
  const trimmedNewPassword = newPassword.trim();

  if (!trimmedUsername || !trimmedCurrentPassword || !trimmedNewPassword) {
    return NextResponse.json<ChangePasswordResponse>(
      { success: false, error: 'Username and passwords cannot be empty' },
      { status: 400 }
    );
  }

  if (session.role !== 'admin' && session.username !== trimmedUsername) {
    return NextResponse.json<ChangePasswordResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const client = getAuthClient();

  try {
    await ensureAuthInitialized(client);
    await client.simple.changePassword(trimmedUsername, trimmedCurrentPassword, trimmedNewPassword);
    return NextResponse.json<ChangePasswordResponse>({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof InvalidPasswordError) {
      return NextResponse.json<ChangePasswordResponse>({ success: false, error: error.message }, { status: 400 });
    }

    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json<ChangePasswordResponse>(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    if (error instanceof UserNotFoundError) {
      return NextResponse.json<ChangePasswordResponse>({ success: false, error: 'User not found' }, { status: 404 });
    }

    console.error('[users] Failed to change password', error);
    return NextResponse.json<ChangePasswordResponse>({ success: false, error: 'Failed to change password' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
