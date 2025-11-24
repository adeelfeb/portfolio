import axios from 'axios';

/**
 * Normalizes a URL to ensure it has a protocol
 * Accepts domains, URLs with or without protocol, and various formats
 * @param {string} url - The URL or domain to normalize
 * @returns {string} - Normalized URL with protocol
 */
function normalizeUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided');
  }

  let normalized = url.trim();

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
}

function truncateText(value, limit = 600) {
  if (!value || typeof value !== 'string') return '';
  if (value.length <= limit) return value.trim();
  return `${value.slice(0, limit).trim()}...`;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveUrl(candidate, baseUrl) {
  if (!candidate) return '';
  try {
    return new URL(candidate, baseUrl).href;
  } catch {
    return candidate;
  }
}

function dedupeByHref(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.href || item.src;
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function cleanParagraphText(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.replace(/\s+/g, ' ').trim();
  if (!text) return '';
  text = text.replace(/https?:\/\/\S+/gi, '').replace(/www\.\S+/gi, '');
  text = text.replace(/\biframe\b/gi, '').replace(/^\W+$/g, '');
  return text.trim();
}

function sanitizePlainText(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/www\.\S+/gi, '')
    .replace(/\biframe\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveSectionTheme($element) {
  const classes = ($element.attr('class') || '').toLowerCase();
  const styleAttr = ($element.attr('style') || '').toLowerCase();
  const palette = [
    { tone: 'success', keys: ['success', 'positive', 'approved', 'green', 'complete'] },
    { tone: 'warning', keys: ['warning', 'pending', 'amber', 'orange', 'notice'] },
    { tone: 'danger', keys: ['danger', 'error', 'critical', 'red', 'alert'] },
    { tone: 'info', keys: ['info', 'primary', 'blue', 'highlight', 'promo'] },
    { tone: 'neutral', keys: ['muted', 'secondary', 'gray'] },
  ];
  let tone = null;
  for (const entry of palette) {
    if (entry.keys.some((key) => classes.includes(key))) {
      tone = entry.tone;
      break;
    }
  }
  let accentColor = null;
  const colorMatch =
    styleAttr.match(/background(?:-color)?:\s*([^;]+)/i) ||
    styleAttr.match(/border(?:-color)?:\s*([^;]+)/i);
  if (colorMatch) {
    accentColor = colorMatch[1].trim();
  } else if ($element.attr('data-color')) {
    accentColor = $element.attr('data-color').trim();
  }
  return { tone, accentColor };
}

function extractNavigationLinks($, baseUrl) {
  if (!$) return [];
  const links = [];
  const selectors = ['nav a[href]', 'header a[href]', 'footer a[href]'];
  selectors.forEach((selector) => {
    $(selector).each((_, element) => {
      if (!element) return;
      const href = $(element).attr('href');
      if (!href) return;
      const absoluteUrl = resolveUrl(href, baseUrl);
      const text = $(element).text().replace(/\s+/g, ' ').trim() || absoluteUrl;
      const area =
        selector.startsWith('nav') ? 'navigation' : selector.startsWith('header') ? 'header' : 'footer';
      links.push({
        text: truncateText(text, 160),
        href: absoluteUrl,
        area,
      });
    });
  });
  return dedupeByHref(links).slice(0, 40);
}

function collectSectionContent($, $startingNode, level, baseUrl) {
  const paragraphs = [];
  const bullets = [];
  const inlineLinks = [];
  const inlineImages = [];
  let wordCount = 0;

  if (!$startingNode || !$startingNode.length) {
    return { paragraphs, bullets, links: inlineLinks, images: inlineImages, wordCount, body: '' };
  }

  let node = $startingNode.next();
  let guard = 0;
  while (node && node.length && guard < 120) {
    const tag = node[0]?.tagName ? node[0].tagName.toLowerCase() : '';
    if (/^h[1-6]$/.test(tag)) {
      const nextLevel = parseInt(tag.replace('h', ''), 10);
      if (!Number.isNaN(nextLevel) && nextLevel <= level) {
        break;
      }
    }

    if (tag === 'p') {
      const cleaned = cleanParagraphText(node.text());
      if (cleaned) {
        paragraphs.push(truncateText(cleaned, 650));
        wordCount += cleaned.split(/\s+/).filter(Boolean).length;
      }
    }

    if (tag === 'ul' || tag === 'ol') {
      const listItems = [];
      node.find('li').each((_, li) => {
        const listText = cleanParagraphText($(li).text());
        if (listText) {
          listItems.push(truncateText(listText, 280));
        }
      });
      if (listItems.length) {
        bullets.push(listItems.slice(0, 6));
      }
    }

    const scopedLinks = node.is('a[href]') ? node : node.find('a[href]');
    scopedLinks.each((_, linkEl) => {
      const href = $(linkEl).attr('href');
      if (!href) return;
      inlineLinks.push({
        text: truncateText($(linkEl).text().replace(/\s+/g, ' ').trim() || href, 200),
        href: resolveUrl(href, baseUrl),
      });
    });

    const scopedImages = node.is('img[src]') ? node : node.find('img[src]');
    scopedImages.each((_, imgEl) => {
      const src = $(imgEl).attr('src');
      if (!src) return;
      inlineImages.push({
        src: resolveUrl(src, baseUrl),
        alt: truncateText($(imgEl).attr('alt') || '', 200),
      });
    });

    node = node.next();
    guard += 1;
  }

  const flattenedBullets = bullets.flat();
  const narrativePieces = [...paragraphs, ...flattenedBullets].filter(Boolean);

  return {
    paragraphs: paragraphs.slice(0, 8),
    bullets: bullets.slice(0, 6),
    links: dedupeByHref(inlineLinks).slice(0, 12),
    images: dedupeByHref(inlineImages).slice(0, 6),
    wordCount,
    body: narrativePieces.join('\n\n'),
  };
}

function buildContentOutline($, baseUrl) {
  if (!$) return [];
  const outline = [];
  const stack = [];

  $('h1, h2, h3').each((index, element) => {
    if (!element || !element.tagName) return;
    const level = parseInt(element.tagName.replace('h', ''), 10);
    if (Number.isNaN(level)) return;
    const $element = $(element);
    const headingText = $element.text().replace(/\s+/g, ' ').trim();
    if (!headingText) return;

    const content = collectSectionContent($, $element, level, baseUrl);
    const node = {
      id: $element.attr('id') || `outline-${index + 1}`,
      title: truncateText(headingText, 200),
      level,
      summary: content.paragraphs[0] || '',
      paragraphs: content.paragraphs,
      bullets: content.bullets,
      links: content.links,
      images: content.images,
      wordCount: content.wordCount,
      body: content.body || '',
      subSections: [],
    };

    while (stack.length && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length) {
      stack[stack.length - 1].subSections.push(node);
    } else {
      outline.push(node);
    }

    stack.push(node);
  });

  return outline.slice(0, 25);
}

function buildSectionBlocks($, baseUrl) {
  if (!$) return [];
  const sections = [];
  const seen = new Set();

  $('main section, main article, section, article').each((index, element) => {
    if (!element) return;
    const $element = $(element);
    const key = $element.attr('id') || `${element.tagName}-${index}`;
    if (seen.has(key)) return;
    seen.add(key);

    const heading =
      $element.find('h1, h2').first().text().replace(/\s+/g, ' ').trim() ||
      $element.find('h3, h4').first().text().replace(/\s+/g, ' ').trim();
    const subheading = $element.find('h5, h6').first().text().replace(/\s+/g, ' ').trim();
    const paragraphs = [];
    $element.find('p').each((_, p) => {
      if (paragraphs.length >= 10) return false;
      const text = cleanParagraphText($(p).text());
      if (text) {
        paragraphs.push(truncateText(text, 700));
      }
      return undefined;
    });

    const listItems = [];
    $element.find('li').each((_, li) => {
      if (listItems.length >= 20) return false;
      const text = cleanParagraphText($(li).text());
      if (text) {
        listItems.push(truncateText(text, 300));
      }
      return undefined;
    });

    const links = [];
    $element.find('a[href]').each((_, linkEl) => {
      if (links.length >= 14) return false;
      const href = $(linkEl).attr('href');
      if (!href) return undefined;
      links.push({
        text: truncateText($(linkEl).text().replace(/\s+/g, ' ').trim() || href, 200),
        href: resolveUrl(href, baseUrl),
      });
      return undefined;
    });

    const images = [];
    $element.find('img[src]').each((_, imgEl) => {
      if (images.length >= 8) return false;
      const src = $(imgEl).attr('src');
      if (!src) return undefined;
      images.push({
        src: resolveUrl(src, baseUrl),
        alt: truncateText($(imgEl).attr('alt') || '', 200),
      });
      return undefined;
    });

    const hasContent = heading || paragraphs.length || listItems.length || images.length;
    if (!hasContent) return;

    const flattenedLists = listItems.flat();
    const body = [...paragraphs, ...flattenedLists].join('\n\n');
    const { tone, accentColor } = deriveSectionTheme($element);

    sections.push({
      id: key,
      heading: heading || null,
      subheading: subheading || null,
      summary: paragraphs[0] || listItems[0] || '',
      paragraphs,
      listItems,
      links: dedupeByHref(links),
      images: dedupeByHref(images),
      hasCallToAction: $element.find('button, a[class*="btn"], .cta').length > 0,
      tag: element.tagName?.toLowerCase() || 'section',
      classes: ($element.attr('class') || '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 6),
      body,
      tone,
      accentColor,
    });
  });

  return sections.slice(0, 20);
}

/**
 * Scrapes a website and extracts structured data
 * Optimized for multiple website scraping in the future
 * @param {string} url - The URL to scrape
 * @returns {Promise<Object>} - Structured scraped data
 */
export async function scrapeWebsite(url) {
  try {
    // Normalize URL
    let normalizedUrl;
    try {
      normalizedUrl = normalizeUrl(url);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }

    // Validate the normalized URL
    try {
      new URL(normalizedUrl);
    } catch {
      return {
        success: false,
        error: 'Invalid URL format',
        data: null,
      };
    }

    // Dynamically import cheerio to avoid webpack bundling issues
    let cheerio;
    try {
      // Use dynamic import for Next.js compatibility
      const cheerioModule = await import('cheerio');
      cheerio = cheerioModule.default || cheerioModule;
    } catch (importError) {
      console.error('Failed to import cheerio:', importError);
      return {
        success: false,
        error: 'Scraping library could not be loaded. Please ensure cheerio is installed.',
        data: null,
      };
    }

    if (!cheerio || typeof cheerio.load !== 'function') {
      console.error('Cheerio.load is not available. Cheerio object:', cheerio);
      return {
        success: false,
        error: 'Scraping library error. Please contact support.',
        data: null,
      };
    }

    // Fetch the webpage with timeout and user agent
    const response = await axios.get(normalizedUrl, {
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
      responseType: 'text', // Ensure we get text/html response
    });

    // Validate response data
    if (!response || !response.data) {
      return {
        success: false,
        error: 'No data received from the website',
        data: null,
      };
    }

    // Ensure response.data is a string
    const htmlContent = typeof response.data === 'string' ? response.data : String(response.data);
    
    if (!htmlContent || htmlContent.trim().length === 0) {
      return {
        success: false,
        error: 'Empty response received from the website',
        data: null,
      };
    }

    // Load HTML into cheerio
    let $;
    try {
      $ = cheerio.load(htmlContent);
      if (!$) {
        throw new Error('Failed to load HTML into cheerio');
      }
    } catch (loadError) {
      console.error('Error loading HTML into cheerio:', loadError);
      return {
        success: false,
        error: `Failed to parse website HTML: ${loadError.message}`,
        data: null,
      };
    }

    // Extract domain information
    let domainInfo = {};
    try {
      const urlObj = new URL(normalizedUrl);
      domainInfo = {
        domain: urlObj.hostname,
        protocol: urlObj.protocol.replace(':', ''),
        path: urlObj.pathname,
        host: urlObj.host,
        origin: urlObj.origin,
      };
    } catch (e) {
      // Invalid URL, skip domain info
    }

    // Extract structured data with safe fallbacks
    const title = extractTitle($) || '';
    const description = extractDescription($) || '';
    const keywords = extractKeywords($) || [];
    const metadata = extractMetadata($) || {};
    const headings = extractHeadings($) || { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
    const links = extractLinks($, normalizedUrl) || [];
    const images = extractImages($, normalizedUrl) || [];
    const navigation = extractNavigationLinks($, normalizedUrl);
    const contentOutline = buildContentOutline($, normalizedUrl);
    const contentSections = buildSectionBlocks($, normalizedUrl);
    const text = sanitizePlainText(extractMainText($) || '');
    const structuredData = extractStructuredData($) || [];

    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const paragraphCount = $('p').length;
    const listCount = $('ul, ol').length;
    const uniqueHostCount = (() => {
      const hosts = new Set();
      links.forEach((link) => {
        if (!link?.href) return;
        try {
          hosts.add(new URL(link.href).host);
        } catch {
          // ignore invalid URLs
        }
      });
      return hosts.size;
    })();

    // Calculate statistics
    const stats = {
      totalHeadings: Object.values(headings).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
      totalLinks: links.length,
      totalImages: images.length,
      totalKeywords: keywords.length,
      textLength: text.length,
      hasTitle: Boolean(title),
      hasDescription: Boolean(description),
      hasKeywords: keywords.length > 0,
      hasOpenGraph: Object.keys(metadata).some((key) => key.startsWith('og:')),
      hasTwitterCard: Object.keys(metadata).some((key) => key.startsWith('twitter:')),
      hasStructuredData: structuredData.length > 0,
      hasCanonical: Boolean(metadata.canonical),
      hasRobots: Boolean(metadata.robots),
      hasLanguage: Boolean(metadata.language),
      hasCharset: Boolean(metadata.charset),
      hasViewport: Boolean(metadata.viewport),
      sectionCount: contentSections.length,
      paragraphCount,
      listCount,
      navLinkCount: navigation.length,
      wordCount,
      readingTimeMinutes: wordCount ? Math.max(1, Math.round(wordCount / 200)) : 0,
      uniqueLinkHosts: uniqueHostCount,
    };

    const scrapedData = {
      url: normalizedUrl,
      domainInfo,
      title,
      description,
      keywords,
      headings,
      links,
      images,
      text,
      metadata,
      structuredData,
      stats,
      navigation,
      contentOutline,
      contentSections,
      scrapedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: scrapedData,
    };
  } catch (error) {
    console.error('Scraping error:', error.message);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused. The website may be down or unreachable.';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. The website took too long to respond.';
    } else if (error.response) {
      errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Domain not found. Please check the URL.';
    }
    
    return {
      success: false,
      error: errorMessage,
      data: null,
    };
  }
}

/**
 * Extract page title
 */
function extractTitle($) {
  return $('title').first().text().trim() || $('meta[property="og:title"]').attr('content') || '';
}

/**
 * Extract meta description
 */
function extractDescription($) {
  return (
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    ''
  );
}

/**
 * Extract meta keywords
 */
function extractKeywords($) {
  const keywords = $('meta[name="keywords"]').attr('content') || '';
  return keywords
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

/**
 * Extract all headings (h1-h6)
 */
function extractHeadings($) {
  if (!$) return { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
  
  const headings = {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
  };

  try {
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      if (!element || !element.tagName) return;
      const tag = element.tagName.toLowerCase();
      if (!headings[tag]) return;
      const text = $(element).text().trim();
      if (text) {
        headings[tag].push(text);
      }
    });
  } catch (error) {
    console.warn('Error extracting headings:', error.message);
  }

  return headings;
}

/**
 * Extract all links with their text and href
 */
function extractLinks($, baseUrl) {
  if (!$ || !baseUrl) return [];
  
  const links = [];
  try {
    $('a[href]').each((_, element) => {
      if (!element) return;
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      if (href) {
        // Resolve relative URLs
        let absoluteUrl = href;
        try {
          absoluteUrl = new URL(href, baseUrl).href;
        } catch {
          // Invalid URL, skip
          return;
        }
        links.push({
          text: text || href,
          href: absoluteUrl,
        });
      }
    });
  } catch (error) {
    console.warn('Error extracting links:', error.message);
  }
  return links.slice(0, 100); // Limit to first 100 links
}

/**
 * Extract all images with their alt text and src
 */
function extractImages($, baseUrl) {
  if (!$ || !baseUrl) return [];
  
  const images = [];
  try {
    $('img[src]').each((_, element) => {
      if (!element) return;
      const src = $(element).attr('src');
      const alt = $(element).attr('alt') || '';
      if (src) {
        // Resolve relative URLs
        let absoluteUrl = src;
        try {
          absoluteUrl = new URL(src, baseUrl).href;
        } catch {
          // Invalid URL, skip
          return;
        }
        images.push({
          alt,
          src: absoluteUrl,
        });
      }
    });
  } catch (error) {
    console.warn('Error extracting images:', error.message);
  }
  return images.slice(0, 50); // Limit to first 50 images
}

/**
 * Extract main text content (removes script and style tags)
 */
function extractMainText($) {
  if (!$) return '';
  
  try {
    // Clone to avoid modifying original
    const $clone = $.root().clone();
    $clone.find('script, style, nav, footer, header, aside').remove();
    const text = $clone.text();
    // Clean up whitespace
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit to 10000 characters
  } catch (error) {
    console.warn('Error extracting main text:', error.message);
    return '';
  }
}

/**
 * Extract additional metadata
 */
function extractMetadata($) {
  if (!$) return {};
  
  const metadata = {};

  try {
    // Language
    const lang = $('html').attr('lang') || $('html').attr('xml:lang') || '';
    if (lang) metadata.language = lang;

    // Charset
    const charset = $('meta[charset]').attr('charset') || 
                   $('meta[http-equiv="Content-Type"]').attr('content')?.match(/charset=([^;]+)/)?.[1] || '';
    if (charset) metadata.charset = charset;

    // Viewport
    const viewport = $('meta[name="viewport"]').attr('content') || '';
    if (viewport) metadata.viewport = viewport;

    // Canonical URL
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    if (canonical) metadata.canonical = canonical;

    // Robots
    const robots = $('meta[name="robots"]').attr('content') || '';
    if (robots) metadata.robots = robots;

    // Open Graph tags
    $('meta[property^="og:"]').each((_, element) => {
      if (!element) return;
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      if (property && content) {
        metadata[property] = content;
      }
    });

    // Twitter Card tags
    $('meta[name^="twitter:"]').each((_, element) => {
      if (!element) return;
      const name = $(element).attr('name');
      const content = $(element).attr('content');
      if (name && content) {
        metadata[name] = content;
      }
    });

    // Author
    const author =
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      '';
    if (author) {
      metadata.author = author;
    }

    // Generator
    const generator = $('meta[name="generator"]').attr('content') || '';
    if (generator) metadata.generator = generator;

    // Theme Color
    const themeColor = $('meta[name="theme-color"]').attr('content') || '';
    if (themeColor) metadata.themeColor = themeColor;
  } catch (error) {
    console.warn('Error extracting metadata:', error.message);
  }

  return metadata;
}

/**
 * Extract structured data (JSON-LD, microdata)
 */
function extractStructuredData($) {
  if (!$) return [];
  
  const structuredData = [];

  try {
    // Extract JSON-LD
    $('script[type="application/ld+json"]').each((_, element) => {
      if (!element) return;
      try {
        const jsonText = $(element).html();
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          structuredData.push(parsed);
        }
      } catch (error) {
        // Invalid JSON, skip
        console.warn('Failed to parse JSON-LD:', error.message);
      }
    });
  } catch (error) {
    console.warn('Error extracting structured data:', error.message);
  }

  return structuredData;
}

/**
 * Refine scraped data to extract only major/important information
 * This is what gets saved to the database
 */
export function refineScrapedData(scrapedData) {
  if (!scrapedData || !scrapedData.data) {
    return null;
  }

  const data = scrapedData.data;

  // Safely extract headings with null checks
  const headings = data.headings || {};
  const h1Array = Array.isArray(headings.h1) ? headings.h1 : [];
  const h2Array = Array.isArray(headings.h2) ? headings.h2 : [];

  // Safely extract links with null checks
  const links = Array.isArray(data.links) ? data.links : [];
  const importantLinks = links.slice(0, 20).map((link) => ({
    text: (link?.text || '').substring(0, 100), // Limit text length
    href: link?.href || '',
  }));

  // Safely extract images with null checks
  const images = Array.isArray(data.images) ? data.images : [];
  const mainImages = images.slice(0, 5).map((img) => ({
    alt: (img?.alt || '').substring(0, 200),
    src: img?.src || '',
  }));

  // Safely extract text with null checks
  const text = typeof data.text === 'string' ? data.text : '';
  const textPreview = text.substring(0, 2000); // First 2000 characters
  const fullText = text.substring(0, 20000);

  // Safely extract metadata with null checks
  const metadata = data.metadata && typeof data.metadata === 'object' ? data.metadata : {};
  const structuredData = Array.isArray(data.structuredData) ? data.structuredData : [];
  const navigationLinks = Array.isArray(data.navigation)
    ? data.navigation.slice(0, 40).map((item) => ({
        text: (item?.text || '').substring(0, 160),
        href: item?.href || '',
        area: item?.area || null,
      }))
    : [];

  const contentOutline = Array.isArray(data.contentOutline) && data.contentOutline.length
    ? data.contentOutline.slice(0, 20)
    : buildFallbackOutline(h1Array, h2Array);

  const rawSections =
    Array.isArray(data.contentSections) && data.contentSections.length
      ? data.contentSections.slice(0, 20)
      : buildFallbackSections(contentOutline);

  const normalizedSections = normalizeSectionsArray(rawSections).slice(0, 20);

  const sanitizedMetadata = sanitizeMetadata(metadata);
  const structuredDataSamples = structuredData.slice(0, 5);

  const stats = data.stats && typeof data.stats === 'object' ? data.stats : {};
  const domainInfo = data.domainInfo && typeof data.domainInfo === 'object' ? data.domainInfo : null;
  const textBlocks = buildTextBlocks(normalizedSections);

  return {
    url: data.url || '',
    title: data.title || '',
    description: data.description || '',
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    mainHeadings: {
      h1: h1Array.slice(0, 5), // First 5 h1 tags
      h2: h2Array.slice(0, 10), // First 10 h2 tags
    },
    importantLinks,
    imageCount: images.length,
    mainImages,
    textPreview,
    fullText,
    metadata: sanitizedMetadata,
    navigationLinks,
    contentOutline,
    contentSections: normalizedSections,
    textBlocks,
    stats,
    domainInfo,
    structuredDataCount: structuredData.length,
    structuredDataSamples,
    scrapedAt: data.scrapedAt || new Date().toISOString(),
  };
}

function sanitizeMetadata(metadata) {
  const allowedKeys = [
    'author',
    'og:title',
    'og:description',
    'og:image',
    'og:url',
    'og:type',
    'twitter:title',
    'twitter:description',
    'twitter:image',
    'twitter:card',
    'canonical',
    'language',
    'charset',
    'viewport',
    'robots',
    'generator',
    'themeColor',
  ];

  const sanitized = {};
  allowedKeys.forEach((key) => {
    if (metadata[key]) {
      sanitized[key] = metadata[key];
    }
  });

  if (Object.keys(sanitized).length < 20) {
    Object.entries(metadata).some(([key, value]) => {
      if (sanitized[key] || value == null || value === '') {
        return false;
      }
      sanitized[key] = value;
      return Object.keys(sanitized).length >= 20;
    });
  }

  return sanitized;
}

function buildFallbackOutline(h1Array, h2Array) {
  const outline = [];

  if (Array.isArray(h1Array) && h1Array.length) {
    h1Array.slice(0, 5).forEach((title, index) => {
      outline.push({
        id: `legacy-h1-${index}`,
        title,
        level: 1,
        summary: '',
        paragraphs: [],
        bullets: [],
        links: [],
        images: [],
        wordCount: 0,
        subSections: [],
      });
    });
  }

  if (!outline.length && Array.isArray(h2Array) && h2Array.length) {
    h2Array.slice(0, 8).forEach((title, index) => {
      outline.push({
        id: `legacy-h2-${index}`,
        title,
        level: 2,
        summary: '',
        paragraphs: [],
        bullets: [],
        links: [],
        images: [],
        wordCount: 0,
        subSections: [],
      });
    });
  } else if (outline.length && Array.isArray(h2Array) && h2Array.length) {
    const firstNode = outline[0];
    firstNode.subSections = h2Array.slice(0, 8).map((title, index) => ({
      id: `legacy-h2-child-${index}`,
      title,
      level: 2,
      summary: '',
      paragraphs: [],
      bullets: [],
      links: [],
      images: [],
      wordCount: 0,
      subSections: [],
    }));
  }

  return outline;
}

function buildFallbackSections(outline = []) {
  if (!Array.isArray(outline) || !outline.length) return [];
  return outline.slice(0, 6).map((section) => ({
    id: `legacy-section-${section.id}`,
    heading: section.title,
    subheading: section.subSections?.[0]?.title || null,
    summary: section.summary || '',
    paragraphs: section.paragraphs || [],
    listItems: [],
    links: section.links || [],
    images: section.images || [],
    hasCallToAction: false,
    tag: 'section',
    classes: [],
    tone: null,
    accentColor: null,
  }));
}

function normalizeSectionsArray(sections = []) {
  if (!Array.isArray(sections) || !sections.length) return [];
  return sections.map((section, index) => {
    const paragraphs = safeArray(section?.paragraphs)
      .map((paragraph) => truncateText(cleanParagraphText(paragraph), 700))
      .filter(Boolean);
    const listItems = safeArray(section?.listItems)
      .flat()
      .map((item) => truncateText(cleanParagraphText(item), 400))
      .filter(Boolean);
    const links = safeArray(section?.links).map((link) => ({
      text: truncateText(link?.text || '', 200),
      href: link?.href || '',
    }));
    const images = safeArray(section?.images).map((img) => ({
      src: img?.src || '',
      alt: truncateText(img?.alt || '', 200),
    }));

    return {
      id: section?.id || section?._id || `section-${index + 1}`,
      order: index + 1,
      heading: section?.heading || null,
      subheading: section?.subheading || null,
      summary: section?.summary || paragraphs[0] || listItems[0] || '',
      paragraphs,
      listItems,
      links,
      images,
      hasCallToAction: Boolean(section?.hasCallToAction),
      tag: section?.tag || null,
      classes: safeArray(section?.classes)
        .map((cls) => String(cls).trim())
        .filter(Boolean),
      body: section?.body ? sanitizePlainText(section.body).substring(0, 5000) : '',
      tone: section?.tone || null,
      accentColor: section?.accentColor || null,
    };
  });
}

function buildTextBlocks(sections = []) {
  if (!Array.isArray(sections) || !sections.length) return [];
  return sections.slice(0, 18).map((section, index) => {
    const paragraphArray = safeArray(section?.paragraphs);
    const listArray = safeArray(section?.listItems);
    const combined = [...paragraphArray, ...listArray]
      .map((entry) => (typeof entry === 'string' ? entry : JSON.stringify(entry)))
      .filter(Boolean);
    const body = combined.join('\n\n').substring(0, 5000);
    return {
      id: section.id || `text-block-${index}`,
      heading: section.heading || section.summary || section.tag || `Section ${index + 1}`,
      subheading: section.subheading || '',
      summary: section.summary || combined[0] || '',
      body,
      paragraphs: combined.slice(0, 12),
      tag: section.tag || null,
      tone: section.tone || null,
      accentColor: section.accentColor || null,
    };
  });
}

