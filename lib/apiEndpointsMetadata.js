/**
 * API Endpoints Metadata
 * Comprehensive definition of all API routes with schemas, methods, and documentation
 */

export const apiEndpointsMetadata = {
  users: {
    category: 'User Management',
    description: 'User account and role management',
    endpoints: [
      {
        path: '/api/users',
        methods: ['GET'],
        description: 'List all users',
        requiresAuth: true,
        requestSchema: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            role: { type: 'string' },
          },
        },
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                users: { type: 'array' },
                total: { type: 'number' },
              },
            },
          },
        },
        operations: 'Retrieves paginated list of users with optional role filtering',
      },
      {
        path: '/api/users/[id]',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Get, update, or delete a user',
        requiresAuth: true,
        requestSchema: {
          GET: null,
          PUT: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string' },
            },
          },
          DELETE: null,
        },
        responseSchema: {
          GET: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          PUT: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          DELETE: { type: 'object', properties: { success: { type: 'boolean' } } },
        },
        operations: 'GET: Fetches user profile. PUT: Updates user details. DELETE: Removes user account',
      },
    ],
  },
  roles: {
    category: 'Role Management',
    description: 'Role definition and permission management',
    endpoints: [
      {
        path: '/api/roles/list',
        methods: ['GET'],
        description: 'List all available roles',
        requiresAuth: true,
        requestSchema: null,
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                roles: { type: 'array' },
              },
            },
          },
        },
        operations: 'Retrieves all role definitions from the database',
      },
      {
        path: '/api/roles/create',
        methods: ['POST'],
        description: 'Create a new role',
        requiresAuth: true,
        requestSchema: {
          type: 'object',
          required: ['name', 'permissions'],
          properties: {
            name: { type: 'string' },
            permissions: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' },
          },
        },
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
        operations: 'Creates a new role with specified permissions',
      },
      {
        path: '/api/roles/[id]',
        methods: ['DELETE'],
        description: 'Delete a role',
        requiresAuth: true,
        requestSchema: null,
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        operations: 'Removes role definition from the system',
      },
    ],
  },
};

