import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '../../styles/ScraperManager.module.css';

const FULL_ACCESS_ROLES = new Set(['superadmin', 'hr_admin', 'hr', 'admin']);

function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

function hasFullAccess(user) {
  return FULL_ACCESS_ROLES.has(normalizeRole(user?.role));
}

function formatDateForDisplay(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const SECTION_TONE_CLASS = {
  success: 'sectionCardToneSuccess',
  warning: 'sectionCardToneWarning',
  danger: 'sectionCardToneDanger',
  info: 'sectionCardToneInfo',
  neutral: 'sectionCardToneNeutral',
};

const SECTION_BADGE_CLASS = {
  success: 'sectionBadgeSuccess',
  warning: 'sectionBadgeWarning',
  danger: 'sectionBadgeDanger',
  info: 'sectionBadgeInfo',
  neutral: 'sectionBadgeNeutral',
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function deriveOutlineForView(entry) {
  if (Array.isArray(entry?.contentOutline) && entry.contentOutline.length) {
    return entry.contentOutline;
  }

  const headings = entry?.headings || entry?.mainHeadings || {};
  const h1 = safeArray(headings.h1);
  const h2 = safeArray(headings.h2);

  if (!h1.length && !h2.length) {
    return [];
  }

  if (!h1.length) {
    return h2.slice(0, 6).map((title, index) => ({
      id: `outline-h2-${index}`,
      title,
      level: 2,
      summary: '',
      paragraphs: [],
      bullets: [],
      links: [],
      images: [],
      subSections: [],
    }));
  }

  return h1.slice(0, 5).map((title, index) => ({
    id: `outline-h1-${index}`,
    title,
    level: 1,
    summary: '',
    paragraphs: [],
    bullets: [],
    links: [],
    images: [],
    subSections: h2.slice(index * 3, index * 3 + 3).map((childTitle, childIndex) => ({
      id: `outline-h2-${index}-${childIndex}`,
      title: childTitle,
      level: 2,
      summary: '',
      paragraphs: [],
      bullets: [],
      links: [],
      images: [],
      subSections: [],
    })),
  }));
}

function deriveSectionsForView(entry, outline) {
  if (Array.isArray(entry?.contentSections) && entry.contentSections.length) {
    return entry.contentSections;
  }

  if (!Array.isArray(outline) || !outline.length) {
    return [];
  }

  return outline.map((node) => ({
    id: `section-${node.id}`,
    heading: node.title,
    subheading: node.subSections?.[0]?.title || null,
    summary: node.summary || '',
    paragraphs: node.paragraphs || [],
    listItems: [],
    links: node.links || [],
    images: node.images || [],
    hasCallToAction: false,
    tag: 'section',
    classes: [],
  }));
}

function convertTextBlockToSection(block, index = 0) {
  const paragraphArray = safeArray(block?.paragraphs);
  let normalizedParagraphs = paragraphArray;
  if (!normalizedParagraphs.length && typeof block?.body === 'string') {
    normalizedParagraphs = block.body
      .split(/\n+/)
      .map((fragment) => fragment.trim())
      .filter(Boolean);
  }

  return {
    id: block?.id || `text-block-${index}`,
    heading: block?.heading || block?.summary || `Section ${index + 1}`,
    subheading: block?.subheading || '',
    summary: block?.summary || normalizedParagraphs[0] || '',
    paragraphs: normalizedParagraphs,
    listItems: [],
    links: [],
    images: [],
    hasCallToAction: false,
    tag: block?.tag || 'section',
    classes: [],
  };
}

function deriveLinkPool(entry) {
  if (Array.isArray(entry?.links) && entry.links.length) {
    return entry.links;
  }
  if (Array.isArray(entry?.importantLinks) && entry.importantLinks.length) {
    return entry.importantLinks;
  }
  return [];
}

function deriveNavigationLinks(entry) {
  if (Array.isArray(entry?.navigationLinks) && entry.navigationLinks.length) {
    return entry.navigationLinks;
  }
  if (Array.isArray(entry?.navigation) && entry.navigation.length) {
    return entry.navigation;
  }
  return [];
}

function deriveMetadataPairs(metadata) {
  if (!metadata || typeof metadata !== 'object') return [];
  return Object.entries(metadata)
    .filter(([_, value]) => Boolean(value))
    .map(([key, value]) => ({ key, value }))
    .slice(0, 24);
}

function deriveTextContent(entry) {
  const candidates = [entry?.fullText, entry?.text, entry?.textPreview];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length) {
      return candidate;
    }
  }
  return '';
}

function deriveStructuredSamples(entry) {
  if (Array.isArray(entry?.structuredDataSamples) && entry.structuredDataSamples.length) {
    return entry.structuredDataSamples.slice(0, 6);
  }
  if (Array.isArray(entry?.structuredData) && entry.structuredData.length) {
    return entry.structuredData.slice(0, 6);
  }
  return [];
}

function OutlineTree({ nodes }) {
  if (!Array.isArray(nodes) || nodes.length === 0) return null;
  return (
    <ul className={styles.outlineList}>
      {nodes.map((node) => (
        <li key={node.id || node.title} className={styles.outlineItem}>
          <div className={styles.outlineNode}>
            <span className={styles.outlineBadge}>H{node.level || 1}</span>
            <span className={styles.outlineTitle}>{node.title}</span>
          </div>
          {node.summary && <p className={styles.outlineSummary}>{node.summary}</p>}
          {Array.isArray(node.subSections) && node.subSections.length > 0 && (
            <OutlineTree nodes={node.subSections} />
          )}
        </li>
      ))}
    </ul>
  );
}

function getSectionCount(entry) {
  if (!entry) return 0;
  if (Array.isArray(entry.contentSections)) return entry.contentSections.length;
  if (entry.stats && typeof entry.stats.sectionCount === 'number') return entry.stats.sectionCount;
  const headings = entry.mainHeadings || entry.headings || {};
  const h1 = Array.isArray(headings.h1) ? headings.h1.length : 0;
  const h2 = Array.isArray(headings.h2) ? headings.h2.length : 0;
  return h1 + h2;
}

function getImportantLinkCount(entry) {
  if (!entry) return 0;
  if (Array.isArray(entry.importantLinks)) return entry.importantLinks.length;
  if (Array.isArray(entry.links)) return Math.min(20, entry.links.length);
  if (entry.stats && typeof entry.stats.totalLinks === 'number') return entry.stats.totalLinks;
  return 0;
}

function getImageCount(entry) {
  if (!entry) return 0;
  if (typeof entry.imageCount === 'number') return entry.imageCount;
  if (Array.isArray(entry.images)) return entry.images.length;
  if (Array.isArray(entry.mainImages)) return entry.mainImages.length;
  if (entry.stats && typeof entry.stats.totalImages === 'number') return entry.stats.totalImages;
  return 0;
}

function getTextLength(entry) {
  if (!entry) return 0;
  if (typeof entry.fullText === 'string' && entry.fullText.length) return entry.fullText.length;
  if (typeof entry.text === 'string' && entry.text.length) return entry.text.length;
  if (typeof entry.textPreview === 'string' && entry.textPreview.length) return entry.textPreview.length;
  return 0;
}

function SectionCard({ section, index = 0, isExpanded, onToggle }) {
  const paragraphs = safeArray(section?.paragraphs);
  const listItems = safeArray(section?.listItems);
  const links = safeArray(section?.links);
  const images = safeArray(section?.images);
  const fallbackBody =
    (!paragraphs.length || paragraphs.join('').length < 200) && typeof section?.body === 'string'
      ? section.body
          .split(/\n+/)
          .map((fragment) => fragment.trim())
          .filter(Boolean)
      : [];
  const displayedParagraphs = paragraphs.length ? paragraphs : fallbackBody;

  const shouldShowToggle =
    displayedParagraphs.length > 4 || listItems.length > 4 || links.length > 4 || images.length > 4;
  const toneClass =
    section?.tone && SECTION_TONE_CLASS[section.tone] ? styles[SECTION_TONE_CLASS[section.tone]] : '';
  const accentStyle = section?.accentColor ? { borderLeftColor: section.accentColor } : undefined;

  return (
    <article key={section.id} className={`${styles.sectionCard} ${toneClass}`.trim()} style={accentStyle}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionNumber}>
          <span>{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div>
          {section.tag && <span className={styles.sectionTag}>{section.tag}</span>}
          {section.heading && <h5 className={styles.sectionTitle}>{section.heading}</h5>}
          {section.subheading && <p className={styles.sectionSubtitle}>{section.subheading}</p>}
        </div>
        <div className={styles.sectionMeta}>
          {section.tone && (
            <span
              className={`${styles.sectionBadge} ${
                SECTION_BADGE_CLASS[section.tone] ? styles[SECTION_BADGE_CLASS[section.tone]] : ''
              }`.trim()}
            >
              {section.tone.charAt(0).toUpperCase() + section.tone.slice(1)}
            </span>
          )}
          {section.hasCallToAction && <span className={styles.sectionBadge}>CTA</span>}
          {images.length > 0 && <span className={styles.sectionBadge}>{images.length} images</span>}
          {links.length > 0 && <span className={styles.sectionBadge}>{links.length} links</span>}
        </div>
      </div>

      <div className={styles.sectionBody}>
        {displayedParagraphs.slice(0, isExpanded ? displayedParagraphs.length : 4).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}

        {listItems.length > 0 && (
          <ul>
            {listItems.slice(0, isExpanded ? listItems.length : 3).map((item, index) => (
              <li key={index}>{Array.isArray(item) ? item.join(' ') : item}</li>
            ))}
          </ul>
        )}

        {images.length > 0 && (
          <div className={styles.sectionImages}>
            {images.slice(0, isExpanded ? images.length : 3).map((image, index) => (
              <div key={index} className={styles.sectionImage}>
                <img src={image?.src || ''} alt={image?.alt || 'Section image'} />
              </div>
            ))}
          </div>
        )}
      </div>

      {isExpanded && links.length > 0 && (
        <div className={styles.sectionLinks}>
          {links.map((link, index) => (
            <a
              key={index}
              href={link?.href || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkItem}
            >
              {link?.text || link?.href || 'Link'}
            </a>
          ))}
        </div>
      )}

      {shouldShowToggle && (
        <button type="button" className={styles.toggleButton} onClick={onToggle}>
          {isExpanded ? 'Show less' : 'See more'}
        </button>
      )}
    </article>
  );
}

function ScrapedDataset({ data, variant = 'inline' }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [showAllLinks, setShowAllLinks] = useState(false);

  useEffect(() => {
    setExpandedSections({});
    setShowAllLinks(false);
  }, [data]);

  const outline = useMemo(() => deriveOutlineForView(data), [data]);
  const storedBlocks = useMemo(() => safeArray(data?.textBlocks), [data?.textBlocks]);
  const sections = useMemo(() => {
    const derivedSections = deriveSectionsForView(data, outline);
    if (derivedSections.length > 0) {
      return derivedSections;
    }
    if (storedBlocks.length > 0) {
      return storedBlocks.map((block, index) => convertTextBlockToSection(block, index));
    }
    return [];
  }, [data, outline, storedBlocks]);
  const linkPool = useMemo(() => deriveLinkPool(data), [data]);
  const navigationLinks = useMemo(() => deriveNavigationLinks(data), [data]);
  const metadataPairs = useMemo(() => deriveMetadataPairs(data?.metadata), [data?.metadata]);
  const structuredSamples = useMemo(() => deriveStructuredSamples(data), [data]);
  const textContent = useMemo(() => deriveTextContent(data), [data]);

  const linksToRender = showAllLinks ? linkPool : linkPool.slice(0, 20);
  const hasMoreLinks = linkPool.length > linksToRender.length;

  const schemaTypes = structuredSamples
    .map((schema) => {
      if (!schema) return null;
      if (Array.isArray(schema['@type'])) return schema['@type'].join(', ');
      return schema['@type'] || schema.type || null;
    })
    .filter(Boolean)
    .slice(0, 10);

  const keywords = safeArray(data?.keywords);
  const domainInfo = data?.domainInfo;
  const stats = data?.stats || {};
  const sectionsToRender = sections;

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const summaryStats = [
    { label: 'Sections', value: stats.sectionCount ?? sections.length ?? 0 },
    { label: 'Words', value: stats.wordCount ?? (textContent ? textContent.split(/\s+/).filter(Boolean).length : 0) },
    {
      label: 'Read Time',
      value: stats.readingTimeMinutes
        ? `${stats.readingTimeMinutes} min`
        : textContent
        ? `≈ ${Math.max(1, Math.round(textContent.split(/\s+/).filter(Boolean).length / 200))} min`
        : '—',
    },
    { label: 'Links', value: stats.totalLinks ?? linkPool.length ?? 0 },
    {
      label: 'Images',
      value:
        stats.totalImages ??
        data?.imageCount ??
        safeArray(data?.images).length ??
        safeArray(data?.mainImages).length ??
        0,
    },
    { label: 'Nav Links', value: stats.navLinkCount ?? navigationLinks.length ?? 0 },
  ];

  return (
    <div className={styles.datasetRoot}>
      <section className={styles.sectionCluster}>
        <div className={styles.sectionClusterHeader}>
          <div>
            <h4 className={styles.sectionHeading}>Content Sections</h4>
            <p className={styles.sectionDescription}>
              Structured blocks pulled straight from the page—perfect for reviewing long-form content without
              leaving the dashboard.
            </p>
          </div>
        </div>
        {sectionsToRender.length > 0 ? (
          <div className={styles.sectionColumn} role="list">
            {sectionsToRender.map((section, idx) => (
              <SectionCard
                key={section.id}
                section={section}
                index={idx}
                isExpanded={Boolean(expandedSections[section.id])}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </div>
        ) : (
          <div className={`${styles.feedback} ${styles.feedbackInfo}`}>
            No structured sections detected for this page.
          </div>
        )}
      </section>

      <section className={styles.dataStack}>
        <div className={styles.dataStackHeader}>
          <h4 className={styles.sectionHeading}>Page Insights & Metadata</h4>
          <p className={styles.sectionDescription}>Supporting context, navigation cues, and media live here.</p>
        </div>
        <div className={styles.dataColumn}>
          {domainInfo && (
            <div className={`${styles.previewCard} ${styles.cardDomain}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Domain Information</h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Domain:</span>
                  <span className={styles.infoValue}>{domainInfo.domain || '—'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Protocol:</span>
                  <span className={styles.infoValue}>{domainInfo.protocol || '—'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Host:</span>
                  <span className={styles.infoValue}>{domainInfo.host || '—'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Path:</span>
                  <span className={styles.infoValue}>{domainInfo.path || '/'}</span>
                </div>
              </div>
            </div>
          )}

          <div className={`${styles.previewCard} ${styles.cardStats}`}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>Summary Statistics</h4>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.statsGrid}>
                {summaryStats.map((stat) => (
                  <div key={stat.label} className={styles.statItem}>
                    <span className={styles.statValue}>{stat.value ?? '—'}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {data?.title && (
            <div className={`${styles.previewCard} ${styles.cardTitle}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Page Title</h4>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardText}>{data.title}</p>
              </div>
            </div>
          )}

          {data?.description && (
            <div className={`${styles.previewCard} ${styles.cardDescription}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Description</h4>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardText}>{data.description}</p>
              </div>
            </div>
          )}

          {keywords.length > 0 && (
            <div className={`${styles.previewCard} ${styles.cardKeywords}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Keywords</h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.keywordsList}>
                  {keywords.map((keyword, index) => (
                    <span key={`${keyword}-${index}`} className={styles.keywordTag}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {metadataPairs.length > 0 && (
            <div className={`${styles.previewCard} ${styles.cardMetadata}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Metadata</h4>
              </div>
              <div className={`${styles.cardContent} ${styles.metadataGrid}`}>
                {metadataPairs.map(({ key, value }) => (
                  <div key={key} className={styles.metadataItem}>
                    <span className={styles.metadataKey}>{key}</span>
                    <span className={styles.metadataValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {outline.length > 0 && (
            <div className={`${styles.previewCard} ${styles.cardOutline}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Content Outline</h4>
              </div>
              <div className={styles.cardContent}>
                <OutlineTree nodes={outline} />
              </div>
            </div>
          )}

          {navigationLinks.length > 0 && (
            <div className={`${styles.previewCard} ${styles.cardNavigation}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Navigation Links</h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.navigationList}>
                  {navigationLinks.map((link, index) => (
                    <a
                      key={`${link.href}-${index}`}
                      href={link?.href || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.navItem}
                    >
                      <span className={styles.navLabel}>{link?.area || 'nav'}</span>
                      <span>{link?.text || link?.href || 'Link'}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {linkPool.length > 0 && (
            <div className={`${styles.previewCard} ${styles.cardLinks}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Links ({linkPool.length})</h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.linksList}>
                  {linksToRender.map((link, index) => (
                    <a
                      key={`${link.href}-${index}`}
                      href={link?.href || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkItem}
                    >
                      {link?.text || link?.href || 'Link'}
                    </a>
                  ))}
                </div>
                {hasMoreLinks && (
                  <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={() => setShowAllLinks(!showAllLinks)}
                  >
                    {showAllLinks ? 'Show fewer links' : 'See more links'}
                  </button>
                )}
              </div>
            </div>
          )}

          {(Array.isArray(data?.images) ? data.images : data?.mainImages)?.length > 0 && (
            <div className={`${styles.previewCard} ${styles.cardImages}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Images</h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.previewImages}>
                {safeArray(data.images?.length ? data.images : data.mainImages)
                  .slice(0, 8)
                  .map((img, index) => (
                    <div key={index} className={styles.previewImage}>
                      <img
                        src={img?.src || ''}
                        alt={img?.alt || 'Image'}
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(schemaTypes.length > 0 || data?.structuredDataCount) && (
            <div className={`${styles.previewCard} ${styles.cardStructured}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Structured Data</h4>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardText}>
                  {data?.structuredDataCount ?? structuredSamples.length} snippets detected
                </p>
                {schemaTypes.length > 0 && (
                  <div className={styles.keywordsList}>
                    {schemaTypes.map((type, index) => (
                      <span key={`${type}-${index}`} className={styles.schemaTag}>
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ScraperManager({ user }) {
  const canAccess = useMemo(() => hasFullAccess(user), [user]);

  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedItems, setSavedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [sortState, setSortState] = useState({ key: 'scrapedAt', direction: 'desc' });
  const [rescrapedData, setRescrapedData] = useState(null);
  const [isRescrapingSelected, setIsRescrapingSelected] = useState(false);
  const [isUpdatingSelected, setIsUpdatingSelected] = useState(false);
  const [modalStatusMessage, setModalStatusMessage] = useState('');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [changeSummary, setChangeSummary] = useState([]);
  const [hasDetectedChanges, setHasDetectedChanges] = useState(false);

  const loadSavedItems = useCallback(async () => {
    if (!canAccess) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/scraper?limit=50', {
        method: 'GET',
        credentials: 'include',
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        const message = payload?.message || 'Failed to load saved scraped data';
        throw new Error(message);
      }
      const data = payload?.data?.items || [];
      setSavedItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load saved scraped data');
      setSavedItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [canAccess]);

  useEffect(() => {
    if (!canAccess) return;
    loadSavedItems();
  }, [canAccess, loadSavedItems]);

  useEffect(() => {
    setRescrapedData(null);
    setModalStatusMessage('');
    setModalErrorMessage('');
    setChangeSummary([]);
    setHasDetectedChanges(false);
  }, [selectedItem?.id]);

  // Normalize URL to add protocol if missing
  const normalizeUrl = useCallback((inputUrl) => {
    if (!inputUrl || typeof inputUrl !== 'string') return '';
    
    let normalized = inputUrl.trim();
    
    // Remove any leading/trailing whitespace and slashes
    normalized = normalized.replace(/^\/+|\/+$/g, '');
    
    // If it already has http:// or https://, return as is
    if (/^https?:\/\//i.test(normalized)) {
      return normalized;
    }
    
    // If it starts with //, add https:
    if (/^\/\//.test(normalized)) {
      return `https:${normalized}`;
    }
    
    // If it looks like a domain (contains a dot and no spaces), add https://
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}/.test(normalized)) {
      return `https://${normalized}`;
    }
    
    // If it's a localhost or IP address, add http://
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/.test(normalized)) {
      return `http://${normalized}`;
    }
    
    // Default: try with https://
    return `https://${normalized}`;
  }, []);

  const handleScrape = useCallback(
    async (e) => {
      e.preventDefault();
      if (!canAccess || !url.trim()) return;

      setIsScraping(true);
      setError('');
      setStatusMessage('');
      setScrapedData(null);

      try {
        // Normalize the URL before sending
        const normalizedUrl = normalizeUrl(url.trim());
        
        const response = await fetch('/api/scraper/scrape', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: normalizedUrl }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
          const message = data?.message || 'Failed to scrape website';
          throw new Error(message);
        }

        setScrapedData(data.data?.scrapedData || null);
        setStatusMessage('Website scraped successfully! Review the data below and click "Save Scraped Data" to save it.');
      } catch (err) {
        setError(err.message || 'Unable to scrape website');
        setScrapedData(null);
      } finally {
        setIsScraping(false);
      }
    },
    [canAccess, url, normalizeUrl]
  );

  const handleSave = useCallback(async () => {
    if (!canAccess || !scrapedData) return;

    setIsSaving(true);
    setError('');
    setStatusMessage('');

    try {
      const response = await fetch('/api/scraper/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrapedData }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        const message = data?.message || 'Failed to save scraped data';
        throw new Error(message);
      }

      setStatusMessage('Scraped data saved successfully!');
      setScrapedData(null);
      setUrl('');
      await loadSavedItems();
    } catch (err) {
      setError(err.message || 'Unable to save scraped data');
    } finally {
      setIsSaving(false);
    }
  }, [canAccess, scrapedData, loadSavedItems]);

  const handleDelete = useCallback(
    async (id) => {
      if (!canAccess) return;
      const confirmed =
        typeof window === 'undefined'
          ? true
          : window.confirm('Delete this saved scraped data? This action cannot be undone.');
      if (!confirmed) return;

      setIsSaving(true);
      setError('');
      setStatusMessage('');

      try {
        const response = await fetch(`/api/scraper/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.success === false) {
          const message = payload?.message || 'Failed to delete scraped data';
          throw new Error(message);
        }

        setStatusMessage('Scraped data deleted successfully');
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(null);
        }
        await loadSavedItems();
      } catch (err) {
        setError(err.message || 'Unable to delete scraped data');
      } finally {
        setIsSaving(false);
      }
    },
    [canAccess, loadSavedItems, selectedItem]
  );

  const handleViewDetails = useCallback(
    async (id) => {
      if (!canAccess) return;
      setIsLoadingDetails(true);
      setError('');

      try {
        const response = await fetch(`/api/scraper/${id}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
          const message = data?.message || 'Failed to load scraped data details';
          throw new Error(message);
        }

        setSelectedItem(data.data?.scrapedData || null);
      } catch (err) {
        setError(err.message || 'Unable to load scraped data details');
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [canAccess]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
    setRescrapedData(null);
    setModalStatusMessage('');
    setModalErrorMessage('');
  }, []);

  const buildChangeSummary = useCallback((previousData, nextData) => {
    if (!previousData || !nextData) {
      return { hasChanges: false, summary: ['Unable to compare content.'] };
    }
    const summary = [];

    if ((previousData.title || '') !== (nextData.title || '')) {
      summary.push('Page title changed.');
    }
    if ((previousData.description || '') !== (nextData.description || '')) {
      summary.push('Description text updated.');
    }
    const prevKeywords = Array.isArray(previousData.keywords) ? previousData.keywords.length : 0;
    const nextKeywords = Array.isArray(nextData.keywords) ? nextData.keywords.length : 0;
    if (prevKeywords !== nextKeywords) {
      summary.push(`Keywords count changed (${prevKeywords} → ${nextKeywords}).`);
    }

    const prevSections = getSectionCount(previousData);
    const nextSections = getSectionCount(nextData);
    if (prevSections !== nextSections) {
      summary.push(`Section count changed (${prevSections} → ${nextSections}).`);
    }

    const prevLinks = getImportantLinkCount(previousData);
    const nextLinks = getImportantLinkCount(nextData);
    if (prevLinks !== nextLinks) {
      summary.push(`Important links count changed (${prevLinks} → ${nextLinks}).`);
    }

    const prevImages = getImageCount(previousData);
    const nextImages = getImageCount(nextData);
    if (prevImages !== nextImages) {
      summary.push(`Image count changed (${prevImages} → ${nextImages}).`);
    }

    const prevTextLength = getTextLength(previousData);
    const nextTextLength = getTextLength(nextData);
    if (prevTextLength !== nextTextLength) {
      summary.push('Body text length changed.');
    }

    if (summary.length === 0) {
      return {
        hasChanges: false,
        summary: ['No content differences detected between the stored data and the latest scrape.'],
      };
    }

    return {
      hasChanges: true,
      summary,
    };
  }, []);

  const handleRescrapeSelected = useCallback(async () => {
    if (!canAccess || !selectedItem?.url) return;
    setIsRescrapingSelected(true);
    setModalErrorMessage('');
    setModalStatusMessage('');
    try {
      const response = await fetch('/api/scraper/scrape', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: selectedItem.url }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        const message = data?.message || 'Failed to re-scrape website';
        throw new Error(message);
      }
      const latest = data.data?.scrapedData || null;
      setRescrapedData(latest);
      const { hasChanges, summary } = buildChangeSummary(selectedItem, latest);
      setChangeSummary(summary);
      setHasDetectedChanges(hasChanges);
      setModalStatusMessage('Latest content fetched successfully.');
    } catch (err) {
      setModalErrorMessage(err.message || 'Unable to re-scrape website');
    } finally {
      setIsRescrapingSelected(false);
    }
  }, [canAccess, selectedItem]);

  const handleSaveUpdatedData = useCallback(async () => {
    if (!canAccess || !selectedItem?.id || !rescrapedData) return;
    setIsUpdatingSelected(true);
    setModalErrorMessage('');
    setModalStatusMessage('');
    try {
      const response = await fetch(`/api/scraper/${selectedItem.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrapedData: rescrapedData }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        const message = data?.message || 'Failed to update scraped data';
        throw new Error(message);
      }
      const updated = data.data?.scrapedData || null;
      if (updated) {
        setSelectedItem(updated);
      }
      setChangeSummary([]);
      setHasDetectedChanges(false);
      setRescrapedData(null);
      setModalStatusMessage('Scraped data updated successfully.');
      await loadSavedItems();
    } catch (err) {
      setModalErrorMessage(err.message || 'Unable to update scraped data');
    } finally {
      setIsUpdatingSelected(false);
    }
  }, [canAccess, selectedItem, rescrapedData, loadSavedItems]);

  const sortedItems = useMemo(() => {
    if (!Array.isArray(savedItems)) return [];
    const items = [...savedItems];
    const { key, direction } = sortState;
    const multiplier = direction === 'asc' ? 1 : -1;

    items.sort((a, b) => {
      if (key === 'scrapedAt') {
        const dateA = new Date(a?.scrapedAt || 0).getTime();
        const dateB = new Date(b?.scrapedAt || 0).getTime();
        return (dateA - dateB) * multiplier;
      }

      const valueA = (a?.[key] || '').toString().toLowerCase();
      const valueB = (b?.[key] || '').toString().toLowerCase();
      return valueA.localeCompare(valueB) * multiplier;
    });

    return items;
  }, [savedItems, sortState]);

  const handleSortToggle = (key) => {
    setSortState((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const renderSortButton = (label, key) => {
    const isActive = sortState.key === key;
    const directionIndicator = isActive ? (sortState.direction === 'asc' ? '↑' : '↓') : '';
    return (
      <button
        type="button"
        className={`${styles.sortButton} ${isActive ? styles.sortButtonActive : ''}`}
        onClick={() => handleSortToggle(key)}
      >
        {label} {directionIndicator}
      </button>
    );
  };

  if (!canAccess) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headingGroup}>
            <h2 className={styles.heading}>Web Scraper</h2>
          </div>
        </div>
        <div className={styles.feedback + ' ' + styles.feedbackError}>
          You do not have permission to access the web scraper.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headingGroup}>
          <h2 className={styles.heading}>Web Scraper</h2>
          <p className={styles.subtitle}>
            Scrape websites and extract structured data. Save important information for future reference.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className={`${styles.feedback} ${styles.feedbackSuccess}`}>{statusMessage}</div>
      )}
      {error && <div className={`${styles.feedback} ${styles.feedbackError}`}>{error}</div>}

      {/* Scraping Form */}
      <form className={styles.form} onSubmit={handleScrape}>
        <h3 className={styles.formTitle}>Scrape Website</h3>
        <div className={styles.formGrid}>
          <label className={`${styles.formField} ${styles.formFieldFullWidth}`}>
            <span>Website URL or Domain *</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://example.com"
              required
              disabled={isScraping}
            />
          </label>
        </div>
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isScraping || !url.trim()}
          >
            {isScraping ? 'Scraping...' : 'Scrape Website'}
          </button>
        </div>
      </form>

      {/* Scraped Data Preview */}
      {scrapedData && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h3 className={styles.formTitle}>Scraped Data Preview</h3>
            <button
              type="button"
              onClick={handleSave}
              className={styles.primaryButton}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Scraped Data'}
            </button>
          </div>

          <ScrapedDataset data={scrapedData} />
        </div>
      )}

      {/* Saved Items List */}
      <div className={styles.listHeader}>
        <div className={styles.sortControls}>
          {renderSortButton('Sort by Title', 'title')}
          {renderSortButton('Sort by Date', 'scrapedAt')}
        </div>
        <h3 className={styles.headingCenter}>
          Saved Scraped Data ({savedItems.length})
        </h3>
        <button
          type="button"
          onClick={loadSavedItems}
          className={styles.refreshButton}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={`${styles.feedback} ${styles.feedbackInfo}`}>
            Loading saved scraped data…
          </div>
        ) : savedItems.length === 0 ? (
          <div className={`${styles.feedback} ${styles.feedbackInfo}`}>
            No saved scraped data yet. Scrape a website and save it to see it here.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>URL</th>
                <th>Title</th>
                <th>Description</th>
                <th>Images</th>
                <th>Links</th>
                <th>Sections</th>
                <th>Scraped At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.previewLink}
                    >
                      {item.url.length > 50 ? `${item.url.substring(0, 50)}...` : item.url}
                    </a>
                  </td>
                  <td>{item.title || '—'}</td>
                  <td>
                    {item.description
                      ? item.description.length > 100
                        ? `${item.description.substring(0, 100)}...`
                        : item.description
                      : '—'}
                  </td>
                  <td>{item.imageCount || 0}</td>
                  <td>{item.importantLinks?.length || 0}</td>
                  <td>{item.stats?.sectionCount ?? item.contentSections?.length ?? item.mainHeadings?.h1?.length ?? '—'}</td>
                  <td>{formatDateForDisplay(item.scrapedAt)}</td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => handleViewDetails(item.id)}
                        disabled={isLoadingDetails}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className={styles.linkButtonDanger}
                        onClick={() => handleDelete(item.id)}
                        disabled={isSaving}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderMain}>
              <h3 className={styles.modalTitle}>Scraped Data Details</h3>
                <div className={styles.modalHeaderActions}>
              <button
                type="button"
                    className={styles.secondaryButton}
                    onClick={handleRescrapeSelected}
                    disabled={isRescrapingSelected}
              >
                    {isRescrapingSelected ? 'Rescraping…' : 'Rescrape'}
              </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleSaveUpdatedData}
                    disabled={!rescrapedData || isUpdatingSelected}
                  >
                    {isUpdatingSelected ? 'Saving…' : 'Save Updated Data'}
              </button>
            </div>
                    </div>
              <button type="button" className={styles.modalClose} onClick={handleCloseModal}>
                ×
              </button>
                      </div>
            <div className={styles.modalBody}>
              {modalStatusMessage && (
                <div className={`${styles.feedback} ${styles.feedbackSuccess}`}>{modalStatusMessage}</div>
              )}
              {modalErrorMessage && (
                <div className={`${styles.feedback} ${styles.feedbackError}`}>{modalErrorMessage}</div>
              )}
              {changeSummary.length > 0 && (
                <div
                  className={`${styles.feedback} ${
                    hasDetectedChanges ? styles.feedbackInfo : styles.feedbackSuccess
                  }`}
                >
                  <strong>
                    {hasDetectedChanges
                      ? 'Changes detected between stored data and the latest scrape:'
                      : 'No differences detected between the stored data and the latest scrape.'}
                  </strong>
                  {hasDetectedChanges && (
                    <ul className={styles.changeList}>
                      {changeSummary.map((item, idx) => (
                        <li key={`change-${idx}`}>{item}</li>
                                  ))}
                                </ul>
                  )}
                              </div>
                            )}
              <ScrapedDataset data={rescrapedData || selectedItem} variant="modal" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

