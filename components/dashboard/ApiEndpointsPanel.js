import { useState, useMemo } from 'react';
import { Lock } from 'lucide-react';
import { apiEndpointsMetadata } from '../../lib/apiEndpointsMetadata';
import styles from '../../styles/ApiEndpointsPanel.module.css';

function MethodBadge({ method }) {
  const methodClass = {
    GET: styles.methodBadgeGET,
    POST: styles.methodBadgePOST,
    PUT: styles.methodBadgePUT,
    DELETE: styles.methodBadgeDELETE,
    PATCH: styles.methodBadgePATCH,
  }[method] || '';

  return (
    <span className={`${styles.methodBadge} ${methodClass}`}>
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

    if (depth > 3) return <span className={styles.schemaEllipsis}>...</span>;

    return (
      <div className={`${styles[`schemaLevel${depth}`] || ''}`}>
        {isArray ? (
          <div className={styles.schemaArray}>
            <span className={styles.schemaBracket}>[</span>
            {obj.length > 0 && (
              <div className={styles.schemaContent}>
                {typeof obj[0] === 'object' ? renderSchema(obj[0], depth + 1) : <span>{String(obj[0])}</span>}
                {obj.length > 1 && <span className={styles.schemaComma}>, ...</span>}
              </div>
            )}
            <span className={styles.schemaBracket}>]</span>
          </div>
        ) : (
          entries
            .filter(([key]) => key !== 'type' && key !== 'description' && key !== 'example')
            .map(([key, value]) => {
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return (
                  <div key={key} className={styles.schemaProperty}>
                    <span className={styles.schemaKey}>{key}:</span>
                    <div className={styles.schemaNested}>{renderSchema(value, depth + 1)}</div>
                  </div>
                );
              }
              if (Array.isArray(value)) {
                return (
                  <div key={key} className={styles.schemaProperty}>
                    <span className={styles.schemaKey}>{key}:</span>
                    <div className={styles.schemaNested}>{renderSchema(value, depth + 1)}</div>
                  </div>
                );
              }
              return (
                <div key={key} className={styles.schemaProperty}>
                  <span className={styles.schemaKey}>{key}:</span>
                  <span className={styles.schemaValue}>{String(value)}</span>
                </div>
              );
            })
        )}
      </div>
    );
  };

  return (
    <div className={styles.schemaDiagram}>
      <div className={styles.schemaHeader}>
        <span className={styles.schemaTitle}>{title}</span>
        <span className={styles.schemaType}>{schema.type || 'object'}</span>
      </div>
      <div className={styles.schemaBody}>
        {schema.properties ? (
          <div className={styles.schemaObject}>
            <span className={styles.schemaBrace}>{'{'}</span>
            <div className={styles.schemaContent}>{renderSchema(schema.properties)}</div>
            <span className={styles.schemaBrace}>{'}'}</span>
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
  const primaryMethod = methods[0];

  const requestSchema = useMemo(() => {
    if (!endpoint.requestSchema) return null;
    if (typeof endpoint.requestSchema === 'object' && !endpoint.requestSchema.type) {
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
    <article
      className={`${styles.endpointCard} ${expanded ? styles.endpointCardExpanded : ''}`}
      data-method={methods.join(' ')}
    >
      <header className={styles.endpointHeader}>
        <div className={styles.endpointTitleGroup}>
          <div className={styles.endpointMethods}>
            {methods.map((method) => (
              <MethodBadge key={method} method={method} />
            ))}
          </div>
          <h3 className={styles.endpointPath}>{endpoint.path}</h3>
          {endpoint.requiresAuth && (
            <span className={`${styles.endpointBadge} ${styles.endpointBadgeAuth}`} title="Requires Authentication">
              <Lock size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }} />
              Auth Required
            </span>
          )}
        </div>
        <div className={styles.endpointDescription}>
          <p>{endpoint.description}</p>
        </div>
        <div className={styles.endpointActions}>
          <button
            type="button"
            className={`${styles.endpointToggle} ${
              expanded ? styles.endpointToggleExpand : styles.endpointToggleCollapse
            }`}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse endpoint details' : 'Expand endpoint details'}
          >
            <span aria-hidden="true">{expanded ? '▾' : '▴'}</span>
            <span className={styles.endpointToggleText}>{expanded ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>
      </header>

      {expanded && (
        <div className={styles.endpointContent}>
          {endpoint.operations && (
            <div className={styles.endpointSection}>
              <h4 className={styles.endpointSectionTitle}>Operations</h4>
              <p className={styles.endpointSectionText}>{endpoint.operations}</p>
            </div>
          )}

          {requestSchema && (
            <div className={styles.endpointSection}>
              <h4 className={styles.endpointSectionTitle}>Request Schema</h4>
              {typeof requestSchema === 'object' && !requestSchema.type ? (
                Object.entries(requestSchema).map(([method, schema]) => (
                  <div key={method} className={styles.endpointSchemaGroup}>
                    <div className={styles.endpointSchemaMethod}>
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
            <div className={styles.endpointSection}>
              <h4 className={styles.endpointSectionTitle}>Response Schema</h4>
              {typeof responseSchema === 'object' && !responseSchema.type ? (
                Object.entries(responseSchema).map(([key, schema]) => (
                  <div key={key} className={styles.endpointSchemaGroup}>
                    <div className={styles.endpointSchemaMethod}>
                      <span className={`${styles.endpointBadge} ${styles.endpointBadgeResponse}`}>{key}</span>
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
    <section className={styles.categorySection}>
      <header className={styles.categoryHeader}>
        <div className={styles.categoryHeaderContent}>
          <div>
            <h2 className={styles.categoryTitle}>{categoryData.category}</h2>
            <p className={styles.categoryDescription}>{categoryData.description}</p>
          </div>
          <button
            type="button"
            className={`${styles.categoryToggle} ${
              expanded ? styles.categoryToggleExpand : styles.categoryToggleCollapse
            }`}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse category' : 'Expand category'}
          >
            <span aria-hidden="true">{expanded ? '▾' : '▴'}</span>
            <span className={styles.categoryToggleText}>{expanded ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>
      </header>

      {expanded && (
        <div className={styles.endpointsGrid}>
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
    <div className={styles.panel}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>API Endpoints Documentation</h1>
          <p className={styles.subtitle}>
            Comprehensive reference for all available API routes, request/response schemas, and operations
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statBadge}>
            <span className={styles.statLabel}>Total Endpoints</span>
            <span className={styles.statValue}>{totalEndpoints}</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statLabel}>Categories</span>
            <span className={styles.statValue}>{Object.keys(apiEndpointsMetadata).length}</span>
          </div>
        </div>
      </header>

      <div className={styles.search}>
        <div className={styles.searchWrapper}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.searchIcon}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search endpoints by path, method, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.searchClear}
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

      <div className={styles.content}>
        {Object.keys(filteredCategories).length === 0 ? (
          <div className={styles.empty}>
            <p>No endpoints found matching "{searchQuery}"</p>
          </div>
        ) : (
          Object.entries(filteredCategories).map(([key, categoryData]) => (
            <CategorySection key={key} categoryKey={key} categoryData={categoryData} />
          ))
        )}
      </div>
    </div>
  );
}
