/**
 * API Endpoints Metadata
 * Comprehensive definition of all API routes with schemas, methods, and documentation
 */

export const apiEndpointsMetadata = {
  auth: {
    category: 'Authentication',
    description: 'User authentication and session management endpoints',
    endpoints: [
      {
        path: '/api/auth/login',
        methods: ['POST'],
        description: 'Authenticate user credentials and establish a session',
        requiresAuth: false,
        requestSchema: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', description: 'User email address' },
            password: { type: 'string', minLength: 6, description: 'User password' },
          },
        },
        responseSchema: {
          success: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string' },
                    },
                  },
                  token: { type: 'string', description: 'JWT token' },
                },
              },
            },
          },
        },
        operations: 'Validates credentials, creates JWT session token, sets HTTP-only cookie',
      },
      {
        path: '/api/auth/signup',
        methods: ['POST'],
        description: 'Register a new user account',
        requiresAuth: false,
        requestSchema: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 1, description: 'Full name' },
            email: { type: 'string', format: 'email', description: 'Email address' },
            password: { type: 'string', minLength: 6, description: 'Password' },
          },
        },
        responseSchema: {
          success: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string', default: 'base_user' },
                    },
                  },
                },
              },
            },
          },
        },
        operations: 'Creates new user with hashed password, assigns default base_user role',
      },
      {
        path: '/api/auth/logout',
        methods: ['POST'],
        description: 'Terminate user session and clear authentication cookies',
        requiresAuth: true,
        requestSchema: null,
        responseSchema: {
          success: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
        operations: 'Clears JWT cookie, invalidates session',
      },
      {
        path: '/api/auth/me',
        methods: ['GET'],
        description: 'Get current authenticated user profile',
        requiresAuth: true,
        requestSchema: null,
        responseSchema: {
          success: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        operations: 'Validates JWT token, returns user profile from database',
      },
    ],
  },
  jobs: {
    category: 'Jobs Management',
    description: 'Job creation, listing, and management endpoints',
    endpoints: [
      {
        path: '/api/jobs',
        methods: ['GET', 'POST'],
        description: 'List all jobs or create a new job',
        requiresAuth: true,
        requestSchema: {
          GET: null,
          POST: {
            type: 'object',
            required: ['job_id'],
            properties: {
              job_id: { type: 'string', description: 'Unique job identifier' },
              source: { type: 'string', enum: ['phone', 'webform', 'partner'], default: 'phone' },
              customer_name: { type: 'string' },
              customer_phone: { type: 'string' },
              customer_email: { type: 'string' },
              address_street: { type: 'string' },
              address_city: { type: 'string' },
              address_postal: { type: 'string' },
              service_type: { type: 'string', enum: ['plumbing', 'hvac', 'restoration'] },
              subcategory: { type: 'string' },
              priority: { type: 'string', enum: ['emergency', 'same_day', 'scheduled'] },
              status: {
                type: 'string',
                enum: [
                  'confirmed',
                  'pending_approval',
                  'approved_for_outreach',
                  'dispatching',
                  'assigned',
                  'en_route',
                  'complete',
                  'canceled',
                ],
                default: 'pending_approval',
              },
            },
          },
        },
        responseSchema: {
          GET: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  jobs: { type: 'array', items: { type: 'object' } },
                  total: { type: 'number' },
                },
              },
            },
          },
          POST: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object', properties: { job: { type: 'object' } } },
            },
          },
        },
        operations: 'GET: Retrieves paginated list of jobs. POST: Creates new job with validation',
      },
      {
        path: '/api/jobs/[jobId]',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Get, update, or delete a specific job by ID',
        requiresAuth: true,
        requestSchema: {
          GET: null,
          PUT: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              assigned_vendor_id: { type: 'string' },
              notes_scope: { type: 'string' },
            },
          },
          DELETE: null,
        },
        responseSchema: {
          GET: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          PUT: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          DELETE: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } },
        },
        operations: 'GET: Fetches job details. PUT: Updates job fields. DELETE: Removes job record',
      },
    ],
  },
  candidates: {
    category: 'Candidates Management',
    description: 'Candidate profile and onboarding management',
    endpoints: [
      {
        path: '/api/candidates',
        methods: ['GET', 'POST'],
        description: 'List all candidates or create a new candidate profile',
        requiresAuth: true,
        requestSchema: {
          GET: {
            type: 'object',
            properties: {
              page: { type: 'number', default: 1 },
              limit: { type: 'number', default: 20 },
              onboard_status: { type: 'string' },
              service_type: { type: 'string' },
            },
          },
          POST: {
            type: 'object',
            required: ['candidate_id', 'source_system', 'service_type'],
            properties: {
              candidate_id: { type: 'string', description: 'Unique candidate identifier' },
              vendor_id: { type: 'string' },
              source_system: { type: 'string' },
              source_ref: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
              company_name: { type: 'string' },
              service_type: { type: 'string' },
              sub_service: { type: 'string' },
              service_area: { type: 'string' },
              address: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  postal_code: { type: 'string' },
                  province: { type: 'string' },
                },
              },
              onboard_status: {
                type: 'string',
                enum: ['pending', 'reviewing', 'approved', 'rejected', 'onboarded'],
                default: 'pending',
              },
            },
          },
        },
        responseSchema: {
          GET: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  candidates: { type: 'array', items: { type: 'object' } },
                  total: { type: 'number' },
                  page: { type: 'number' },
                  limit: { type: 'number' },
                },
              },
            },
          },
          POST: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object', properties: { candidate: { type: 'object' } } },
            },
          },
        },
        operations: 'GET: Paginated candidate list with filters. POST: Creates candidate with validation',
      },
      {
        path: '/api/candidates/[candidateId]',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Get, update, or delete a specific candidate',
        requiresAuth: true,
        requestSchema: {
          GET: null,
          PUT: {
            type: 'object',
            properties: {
              onboard_status: { type: 'string' },
              notes: { type: 'string' },
              documents: { type: 'array' },
            },
          },
          DELETE: null,
        },
        responseSchema: {
          GET: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          PUT: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          DELETE: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } },
        },
        operations: 'GET: Fetches candidate details. PUT: Updates candidate fields. DELETE: Removes candidate',
      },
    ],
  },
  transcripts: {
    category: 'Transcripts',
    description: 'Call transcript management and analysis',
    endpoints: [
      {
        path: '/api/transcripts',
        methods: ['GET', 'POST'],
        description: 'List transcripts or create a new transcript record',
        requiresAuth: true,
        requestSchema: {
          GET: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
          POST: {
            type: 'object',
            required: ['transcript_id'],
            properties: {
              transcript_id: { type: 'string' },
              call_duration: { type: 'number' },
              ai_confidence: { type: 'number', min: 0, max: 1 },
              raw_text: { type: 'string' },
              parsed_data: { type: 'object' },
            },
          },
        },
        responseSchema: {
          GET: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  transcripts: { type: 'array' },
                  total: { type: 'number' },
                },
              },
            },
          },
          POST: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
        operations: 'GET: Lists transcripts with pagination. POST: Stores new transcript with AI parsing data',
      },
      {
        path: '/api/transcripts/[transcriptId]',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Get, update, or delete a specific transcript',
        requiresAuth: true,
        requestSchema: {
          GET: null,
          PUT: {
            type: 'object',
            properties: {
              ai_confidence: { type: 'number' },
              parsed_data: { type: 'object' },
            },
          },
          DELETE: null,
        },
        responseSchema: {
          GET: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          PUT: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          DELETE: { type: 'object', properties: { success: { type: 'boolean' } } },
        },
        operations: 'GET: Retrieves transcript with parsed data. PUT: Updates transcript metadata. DELETE: Removes transcript',
      },
    ],
  },
  vendors: {
    category: 'Vendors',
    description: 'Vendor compliance and management',
    endpoints: [
      {
        path: '/api/vendors',
        methods: ['GET', 'POST'],
        description: 'List vendors or register a new vendor',
        requiresAuth: true,
        requestSchema: {
          GET: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              compliance_status: { type: 'string' },
            },
          },
          POST: {
            type: 'object',
            required: ['compliance_id'],
            properties: {
              compliance_id: { type: 'string' },
              legal_name: { type: 'string' },
              contact_name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              service_types: { type: 'array', items: { type: 'string' } },
              compliance_status: { type: 'string' },
            },
          },
        },
        responseSchema: {
          GET: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  vendors: { type: 'array' },
                  total: { type: 'number' },
                },
              },
            },
          },
          POST: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
        operations: 'GET: Lists vendors with compliance filters. POST: Registers new vendor with compliance tracking',
      },
      {
        path: '/api/vendors/[complianceId]',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Get, update, or delete vendor by compliance ID',
        requiresAuth: true,
        requestSchema: {
          GET: null,
          PUT: {
            type: 'object',
            properties: {
              compliance_status: { type: 'string' },
              documents: { type: 'array' },
            },
          },
          DELETE: null,
        },
        responseSchema: {
          GET: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          PUT: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          DELETE: { type: 'object', properties: { success: { type: 'boolean' } } },
        },
        operations: 'GET: Fetches vendor details. PUT: Updates compliance status. DELETE: Removes vendor',
      },
    ],
  },
  cityServiceRoutes: {
    category: 'City Service Routes',
    description: 'Dynamic city and service URL routing management',
    endpoints: [
      {
        path: '/api/city-service-routes',
        methods: ['GET', 'POST'],
        description: 'List all dynamic routes or create a new route',
        requiresAuth: true,
        requestSchema: {
          GET: null,
          POST: {
            type: 'object',
            required: ['province', 'city', 'service'],
            properties: {
              province: { type: 'string', description: 'Province code (e.g., AB, BC)' },
              city: { type: 'string', description: 'City name' },
              service: { type: 'string', description: 'Service type' },
              subservice: { type: 'array', items: { type: 'string' }, description: 'Subservice path segments' },
              is_active: { type: 'boolean', default: true },
            },
          },
        },
        responseSchema: {
          GET: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  routes: { type: 'array' },
                  total: { type: 'number' },
                },
              },
            },
          },
          POST: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
        operations: 'GET: Lists all configured routes. POST: Creates dynamic route for city/service combinations',
      },
      {
        path: '/api/city-service-routes/[id]',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Get, update, or delete a specific route',
        requiresAuth: true,
        requestSchema: {
          GET: null,
          PUT: {
            type: 'object',
            properties: {
              is_active: { type: 'boolean' },
              subservice: { type: 'array' },
            },
          },
          DELETE: null,
        },
        responseSchema: {
          GET: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          PUT: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
          DELETE: { type: 'object', properties: { success: { type: 'boolean' } } },
        },
        operations: 'GET: Fetches route configuration. PUT: Updates route settings. DELETE: Removes route',
      },
    ],
  },
  loxo: {
    category: 'Loxo Integration',
    description: 'Loxo ATS integration endpoints for jobs and candidates',
    endpoints: [
      {
        path: '/api/v1/loxo/jobs',
        methods: ['GET'],
        description: 'Fetch all jobs from Loxo ATS',
        requiresAuth: true,
        requestSchema: null,
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                jobs: {
                  type: 'object',
                  properties: {
                    results: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
        operations: 'Synchronizes with Loxo API to retrieve all available job postings',
      },
      {
        path: '/api/v1/loxo/jobs/[jobId]',
        methods: ['GET'],
        description: 'Get specific job details from Loxo',
        requiresAuth: true,
        requestSchema: null,
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
        operations: 'Fetches detailed job information from Loxo by job ID',
      },
      {
        path: '/api/v1/loxo/jobs/[jobId]/all-candidates',
        methods: ['GET'],
        description: 'Get all candidates for a specific job',
        requiresAuth: true,
        requestSchema: null,
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                candidates: { type: 'array' },
                total: { type: 'number' },
              },
            },
          },
        },
        operations: 'Retrieves all candidate applications for a given job from Loxo',
      },
      {
        path: '/api/v1/loxo/candidates/pre-qualified',
        methods: ['POST'],
        description: 'Get all pre-qualified candidates across all jobs',
        requiresAuth: true,
        requestSchema: null,
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                candidates: { type: 'array' },
                summary: {
                  type: 'object',
                  properties: {
                    totalCandidates: { type: 'number' },
                    preQualifiedCount: { type: 'number' },
                  },
                },
              },
            },
          },
        },
        operations: 'Searches across all jobs to find candidates in pre-qualified stage',
      },
    ],
  },
  reports: {
    category: 'Reports & Analytics',
    description: 'Analytics and reporting endpoints',
    endpoints: [
      {
        path: '/api/reports/kpis',
        methods: ['GET'],
        description: 'Get key performance indicators',
        requiresAuth: true,
        requestSchema: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                kpis: { type: 'object' },
              },
            },
          },
        },
        operations: 'Calculates and returns KPI metrics for the specified date range',
      },
      {
        path: '/api/reports/funnel',
        methods: ['GET'],
        description: 'Get pipeline funnel data',
        requiresAuth: true,
        requestSchema: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                funnel: { type: 'array' },
              },
            },
          },
        },
        operations: 'Generates pipeline funnel visualization data',
      },
      {
        path: '/api/reports/trends',
        methods: ['GET'],
        description: 'Get trend analysis data',
        requiresAuth: true,
        requestSchema: {
          type: 'object',
          properties: {
            metric: { type: 'string' },
            period: { type: 'string', enum: ['day', 'week', 'month'] },
          },
        },
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                trends: { type: 'array' },
              },
            },
          },
        },
        operations: 'Calculates trend data for specified metrics over time periods',
      },
    ],
  },
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
  funding: {
    category: 'Funding Opportunities',
    description: 'Funding opportunity and grant management',
    endpoints: [
      {
        path: '/api/funding-opportunity/list',
        methods: ['GET'],
        description: 'List all funding opportunities',
        requiresAuth: true,
        requestSchema: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            status: { type: 'string' },
          },
        },
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                opportunities: { type: 'array' },
                total: { type: 'number' },
              },
            },
          },
        },
        operations: 'Retrieves paginated list of funding opportunities with filters',
      },
      {
        path: '/api/funding-opportunity/create',
        methods: ['POST'],
        description: 'Create a new funding opportunity',
        requiresAuth: true,
        requestSchema: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            source: { type: 'string' },
            url: { type: 'string', format: 'uri' },
            deadline: { type: 'string', format: 'date' },
            amountMin: { type: 'number' },
            amountMax: { type: 'number' },
            currency: { type: 'string', default: 'USD' },
            eligibility: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['open', 'closed', 'upcoming'], default: 'open' },
          },
        },
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
        operations: 'Creates new funding opportunity record with validation',
      },
      {
        path: '/api/funding-opportunity/[id]',
        methods: ['GET'],
        description: 'Get specific funding opportunity by ID',
        requiresAuth: true,
        requestSchema: null,
        responseSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
        operations: 'Fetches detailed funding opportunity information',
      },
    ],
  },
};

