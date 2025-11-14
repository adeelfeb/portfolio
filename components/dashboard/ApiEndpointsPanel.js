import { useState, useMemo } from 'react';
import { apiEndpointsMetadata } from '../../lib/apiEndpointsMetadata';

const METHOD_COLORS = {
  GET: { bg: '#10b981', text: '#ffffff' },
  POST: { bg: '#3b82f6', text: '#ffffff' },
  PUT: { bg: '#f59e0b', text: '#ffffff' },
  DELETE: { bg: '#ef4444', text: '#ffffff' },
  PATCH: { bg: '#8b5cf6', text: '#ffffff' },
};

function MethodBadge({ method }) {
  const colors = METHOD_COLORS[method] || { bg: '#6b7280', text: '#ffffff' };
  return (
    <span
      className="method-badge"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {method}
    </span>
  );
}

function SchemaDiagram({ schema, title }) {
  if (!schema) return null;

  const renderSchema = (obj, depth = 0) => {
    if (!obj || typeof obj !== 'object') return null;

    const isArray = Array.isArray(obj);
    const entries = isArray ? obj : Object.entries(obj);

    if (depth > 3) return <span className="schema-ellipsis">...</span>;

    return (
      <div className={`schema-level schema-level-${depth}`}>
        {isArray ? (
          <div className="schema-array">
            <span className="schema-bracket">[</span>
            {obj.length > 0 && (
              <div className="schema-content">
                {typeof obj[0] === 'object' ? renderSchema(obj[0], depth + 1) : <span>{String(obj[0])}</span>}
                {obj.length > 1 && <span className="schema-comma">, ...</span>}
              </div>
            )}
            <span className="schema-bracket">]</span>
          </div>
        ) : (
          entries
            .filter(([key]) => key !== 'type' && key !== 'description' && key !== 'example')
            .map(([key, value]) => {
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return (
                  <div key={key} className="schema-property">
                    <span className="schema-key">{key}:</span>
                    <div className="schema-nested">{renderSchema(value, depth + 1)}</div>
                  </div>
                );
              }
              if (Array.isArray(value)) {
                return (
                  <div key={key} className="schema-property">
                    <span className="schema-key">{key}:</span>
                    <div className="schema-nested">{renderSchema(value, depth + 1)}</div>
                  </div>
                );
              }
              return (
                <div key={key} className="schema-property">
                  <span className="schema-key">{key}:</span>
                  <span className="schema-value">{String(value)}</span>
                </div>
              );
            })
        )}
      </div>
    );
  };

  return (
    <div className="schema-diagram">
      <div className="schema-header">
        <span className="schema-title">{title}</span>
        <span className="schema-type">{schema.type || 'object'}</span>
      </div>
      <div className="schema-body">
        {schema.properties ? (
          <div className="schema-object">
            <span className="schema-brace">{'{'}</span>
            <div className="schema-content">{renderSchema(schema.properties)}</div>
            <span className="schema-brace">{'}'}</span>
          </div>
        ) : (
          renderSchema(schema)
        )}
      </div>
    </div>
  );
}

function EndpointCard({ endpoint, category }) {
  const [expanded, setExpanded] = useState(false);
  const methods = Array.isArray(endpoint.methods) ? endpoint.methods : [endpoint.methods];

  const requestSchema = useMemo(() => {
    if (!endpoint.requestSchema) return null;
    if (typeof endpoint.requestSchema === 'object' && !endpoint.requestSchema.type) {
      // Multiple schemas for different methods
      return endpoint.requestSchema;
    }
    return endpoint.requestSchema;
  }, [endpoint.requestSchema]);

  const responseSchema = useMemo(() => {
    if (!endpoint.responseSchema) return null;
    if (typeof endpoint.responseSchema === 'object' && !endpoint.responseSchema.type) {
      return endpoint.responseSchema;
    }
    return endpoint.responseSchema;
  }, [endpoint.responseSchema]);

  return (
    <article className={`endpoint-card ${expanded ? 'endpoint-card--expanded' : ''}`}>
      <header className="endpoint-card__header" onClick={() => setExpanded(!expanded)}>
        <div className="endpoint-card__title-group">
          <div className="endpoint-card__methods">
            {methods.map((method) => (
              <MethodBadge key={method} method={method} />
            ))}
          </div>
          <h3 className="endpoint-card__path">{endpoint.path}</h3>
        </div>
        <div className="endpoint-card__meta">
          {endpoint.requiresAuth && (
            <span className="endpoint-badge endpoint-badge--auth" title="Requires Authentication">
              🔒 Auth
            </span>
          )}
          <button
            className="endpoint-card__toggle"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse endpoint details' : 'Expand endpoint details'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </header>

      <div className="endpoint-card__description">
        <p>{endpoint.description}</p>
      </div>

      {expanded && (
        <div className="endpoint-card__content">
          {endpoint.operations && (
            <div className="endpoint-card__section">
              <h4 className="endpoint-card__section-title">Operations</h4>
              <p className="endpoint-card__section-text">{endpoint.operations}</p>
            </div>
          )}

          {requestSchema && (
            <div className="endpoint-card__section">
              <h4 className="endpoint-card__section-title">Request Schema</h4>
              {typeof requestSchema === 'object' && !requestSchema.type ? (
                Object.entries(requestSchema).map(([method, schema]) => (
                  <div key={method} className="endpoint-card__schema-group">
                    <div className="endpoint-card__schema-method">
                      <MethodBadge method={method} />
                    </div>
                    <SchemaDiagram schema={schema} title={`${method} Request`} />
                  </div>
                ))
              ) : (
                <SchemaDiagram schema={requestSchema} title="Request" />
              )}
            </div>
          )}

          {responseSchema && (
            <div className="endpoint-card__section">
              <h4 className="endpoint-card__section-title">Response Schema</h4>
              {typeof responseSchema === 'object' && !responseSchema.type ? (
                Object.entries(responseSchema).map(([key, schema]) => (
                  <div key={key} className="endpoint-card__schema-group">
                    <div className="endpoint-card__schema-method">
                      <span className="endpoint-badge endpoint-badge--response">{key}</span>
                    </div>
                    <SchemaDiagram schema={schema} title={`${key} Response`} />
                  </div>
                ))
              ) : (
                <SchemaDiagram schema={responseSchema} title="Response" />
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function CategorySection({ categoryKey, categoryData }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="category-section">
      <header className="category-section__header" onClick={() => setExpanded(!expanded)}>
        <div>
          <h2 className="category-section__title">{categoryData.category}</h2>
          <p className="category-section__description">{categoryData.description}</p>
        </div>
        <button
          className="category-section__toggle"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse category' : 'Expand category'}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </header>

      {expanded && (
        <div className="category-section__endpoints">
          {categoryData.endpoints.map((endpoint, index) => (
            <EndpointCard key={`${endpoint.path}-${index}`} endpoint={endpoint} category={categoryData.category} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function ApiEndpointsPanel() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return apiEndpointsMetadata;

    const query = searchQuery.toLowerCase();
    const filtered = {};

    Object.entries(apiEndpointsMetadata).forEach(([key, categoryData]) => {
      const matchingEndpoints = categoryData.endpoints.filter((endpoint) => {
        const pathMatch = endpoint.path.toLowerCase().includes(query);
        const descMatch = endpoint.description.toLowerCase().includes(query);
        const methodMatch = endpoint.methods.some((m) => m.toLowerCase().includes(query));
        return pathMatch || descMatch || methodMatch;
      });

      if (matchingEndpoints.length > 0 || categoryData.category.toLowerCase().includes(query)) {
        filtered[key] = {
          ...categoryData,
          endpoints: matchingEndpoints.length > 0 ? matchingEndpoints : categoryData.endpoints,
        };
      }
    });

    return filtered;
  }, [searchQuery]);

  const totalEndpoints = useMemo(() => {
    return Object.values(apiEndpointsMetadata).reduce((sum, cat) => sum + cat.endpoints.length, 0);
  }, []);

  return (
    <div className="api-endpoints-panel">
      <header className="api-endpoints-panel__header">
        <div>
          <h1 className="api-endpoints-panel__title">API Endpoints Documentation</h1>
          <p className="api-endpoints-panel__subtitle">
            Comprehensive reference for all available API routes, request/response schemas, and operations
          </p>
        </div>
        <div className="api-endpoints-panel__stats">
          <div className="stat-badge">
            <span className="stat-badge__label">Total Endpoints</span>
            <span className="stat-badge__value">{totalEndpoints}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-badge__label">Categories</span>
            <span className="stat-badge__value">{Object.keys(apiEndpointsMetadata).length}</span>
          </div>
        </div>
      </header>

      <div className="api-endpoints-panel__search">
        <div className="search-input-wrapper">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search endpoints by path, method, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="api-endpoints-panel__content">
        {Object.keys(filteredCategories).length === 0 ? (
          <div className="api-endpoints-panel__empty">
            <p>No endpoints found matching "{searchQuery}"</p>
          </div>
        ) : (
          Object.entries(filteredCategories).map(([key, categoryData]) => (
            <CategorySection key={key} categoryKey={key} categoryData={categoryData} />
          ))
        )}
      </div>

      <style jsx>{`
        .api-endpoints-panel {
          display: grid;
          gap: 2rem;
          padding: 0;
        }

        .api-endpoints-panel__header {
          display: grid;
          gap: 1.5rem;
        }

        .api-endpoints-panel__title {
          margin: 0;
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .api-endpoints-panel__subtitle {
          margin: 0.5rem 0 0;
          color: #64748b;
          font-size: 1rem;
          line-height: 1.6;
          max-width: 60ch;
        }

        .api-endpoints-panel__stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat-badge {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.08));
          border-radius: 0.85rem;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }

        .stat-badge__label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-badge__value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e40af;
        }

        .api-endpoints-panel__search {
          position: sticky;
          top: 1rem;
          z-index: 10;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: #94a3b8;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 3rem;
          border: 2px solid rgba(148, 163, 184, 0.3);
          border-radius: 0.85rem;
          background: #ffffff;
          font-size: 0.95rem;
          color: #0f172a;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          transition: background 0.2s, color 0.2s;
        }

        .search-clear:hover {
          background: rgba(148, 163, 184, 0.1);
          color: #64748b;
        }

        .api-endpoints-panel__content {
          display: grid;
          gap: 2rem;
        }

        .api-endpoints-panel__empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #64748b;
          font-size: 1.1rem;
        }

        .category-section {
          background: #ffffff;
          border-radius: 1.1rem;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }

        .category-section__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .category-section__header:hover {
          background: rgba(15, 23, 42, 0.02);
        }

        .category-section__title {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }

        .category-section__description {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .category-section__toggle {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }

        .category-section__toggle:hover {
          background: rgba(148, 163, 184, 0.1);
          color: #0f172a;
        }

        .category-section__endpoints {
          display: grid;
          gap: 1rem;
          padding: 0 1.5rem 1.5rem;
        }

        .endpoint-card {
          background: #f8fafc;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 0.85rem;
          overflow: hidden;
          transition: box-shadow 0.2s, border-color 0.2s;
        }

        .endpoint-card:hover {
          border-color: rgba(37, 99, 235, 0.3);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }

        .endpoint-card--expanded {
          border-color: rgba(37, 99, 235, 0.4);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.15);
        }

        .endpoint-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          cursor: pointer;
        }

        .endpoint-card__title-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
        }

        .endpoint-card__methods {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .method-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem 0.65rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .endpoint-card__path {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          word-break: break-all;
        }

        .endpoint-card__meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .endpoint-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .endpoint-badge--auth {
          background: rgba(239, 68, 68, 0.1);
          color: #b91c1c;
        }

        .endpoint-badge--response {
          background: rgba(16, 185, 129, 0.1);
          color: #047857;
          text-transform: capitalize;
        }

        .endpoint-card__toggle {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          transition: background 0.2s, color 0.2s;
        }

        .endpoint-card__toggle:hover {
          background: rgba(148, 163, 184, 0.1);
          color: #0f172a;
        }

        .endpoint-card__description {
          padding: 0 1.25rem 1rem;
        }

        .endpoint-card__description p {
          margin: 0;
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .endpoint-card__content {
          padding: 0 1.25rem 1.25rem;
          display: grid;
          gap: 1.5rem;
          border-top: 1px solid rgba(148, 163, 184, 0.2);
          margin-top: 1rem;
          padding-top: 1.25rem;
        }

        .endpoint-card__section {
          display: grid;
          gap: 0.75rem;
        }

        .endpoint-card__section-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .endpoint-card__section-text {
          margin: 0;
          color: #475569;
          font-size: 0.9rem;
          line-height: 1.7;
        }

        .endpoint-card__schema-group {
          display: grid;
          gap: 0.75rem;
        }

        .endpoint-card__schema-method {
          display: flex;
          align-items: center;
        }

        .schema-diagram {
          background: #ffffff;
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 0.75rem;
          padding: 1rem;
          overflow-x: auto;
        }

        .schema-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }

        .schema-title {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.9rem;
        }

        .schema-type {
          font-size: 0.75rem;
          color: #64748b;
          background: rgba(148, 163, 184, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.35rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .schema-body {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.85rem;
          line-height: 1.6;
        }

        .schema-object,
        .schema-array {
          position: relative;
        }

        .schema-brace,
        .schema-bracket {
          color: #64748b;
          font-weight: 600;
        }

        .schema-content {
          margin-left: 1.5rem;
          margin-top: 0.25rem;
        }

        .schema-property {
          margin: 0.35rem 0;
        }

        .schema-key {
          color: #2563eb;
          font-weight: 600;
        }

        .schema-value {
          color: #059669;
          margin-left: 0.5rem;
        }

        .schema-nested {
          margin-left: 1rem;
          margin-top: 0.25rem;
        }

        .schema-level-0 .schema-key {
          color: #2563eb;
        }

        .schema-level-1 .schema-key {
          color: #7c3aed;
        }

        .schema-level-2 .schema-key {
          color: #c026d3;
        }

        .schema-ellipsis {
          color: #94a3b8;
          font-style: italic;
        }

        .schema-comma {
          color: #64748b;
        }

        @media (max-width: 960px) {
          .api-endpoints-panel__header {
            gap: 1.25rem;
          }

          .api-endpoints-panel__stats {
            gap: 0.75rem;
          }

          .stat-badge {
            padding: 0.65rem 1rem;
          }

          .stat-badge__value {
            font-size: 1.25rem;
          }

          .category-section__header {
            padding: 1.25rem;
          }

          .category-section__endpoints {
            padding: 0 1.25rem 1.25rem;
          }

          .endpoint-card__header {
            padding: 1rem;
          }

          .endpoint-card__description {
            padding: 0 1rem 1rem;
          }

          .endpoint-card__content {
            padding: 0 1rem 1rem;
          }
        }

        @media (max-width: 720px) {
          .api-endpoints-panel {
            gap: 1.5rem;
          }

          .api-endpoints-panel__header {
            gap: 1rem;
          }

          .api-endpoints-panel__stats {
            width: 100%;
          }

          .stat-badge {
            flex: 1;
            min-width: calc(50% - 0.375rem);
          }

          .category-section__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .category-section__toggle {
            align-self: flex-end;
          }

          .endpoint-card__header {
            flex-direction: column;
            gap: 0.75rem;
          }

          .endpoint-card__meta {
            align-self: flex-end;
          }

          .endpoint-card__path {
            font-size: 1rem;
            word-break: break-word;
          }

          .schema-diagram {
            padding: 0.75rem;
            font-size: 0.8rem;
          }

          .schema-content {
            margin-left: 1rem;
          }
        }

        @media (max-width: 480px) {
          .api-endpoints-panel__title {
            font-size: 1.5rem;
          }

          .api-endpoints-panel__subtitle {
            font-size: 0.9rem;
          }

          .stat-badge {
            min-width: 100%;
          }

          .search-input {
            padding: 0.75rem 0.85rem 0.75rem 2.75rem;
            font-size: 0.9rem;
          }

          .category-section__title {
            font-size: 1.25rem;
          }

          .endpoint-card__path {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}

