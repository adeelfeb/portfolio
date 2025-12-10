import React from 'react';

export default function ResourcesPanel() {
  const resources = [
    {
      category: 'Getting Started',
      items: [
        { title: 'Platform Overview', type: 'Guide', url: '#' },
        { title: 'Setting up your profile', type: 'Guide', url: '#' },
      ]
    },
    {
      category: 'Funding & Grants',
      items: [
        { title: 'Grant Application Template', type: 'Template', url: '#' },
        { title: 'Budget Calculator', type: 'Tool', url: '#' },
        { title: 'Success Stories', type: 'Case Study', url: '#' },
      ]
    },
    {
      category: 'Best Practices',
      items: [
        { title: 'Writing effective proposals', type: 'Article', url: '#' },
        { title: 'Community engagement tips', type: 'Article', url: '#' },
      ]
    }
  ];

  return (
    <div className="resources-panel">
      <div className="resources-header">
        <h2>Resources</h2>
        <p>Guides, templates, and tools to help you succeed.</p>
      </div>

      <div className="resources-grid">
        {resources.map((section) => (
          <div className="resource-section" key={section.category}>
            <h3 className="section-title">{section.category}</h3>
            <ul className="resource-list">
              {section.items.map((item, idx) => (
                <li key={idx} className="resource-item">
                  <div className="resource-icon">
                    {item.type === 'Guide' && '📖'}
                    {item.type === 'Template' && '📝'}
                    {item.type === 'Tool' && '🛠️'}
                    {item.type === 'Article' && '📰'}
                    {item.type === 'Case Study' && '💡'}
                  </div>
                  <div className="resource-content">
                    <a href={item.url} className="resource-link" onClick={(e) => e.preventDefault()}>
                      {item.title}
                    </a>
                    <span className="resource-type">{item.type}</span>
                  </div>
                  <button className="download-btn" aria-label="View resource">
                    →
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <style jsx>{`
        .resources-panel {
          display: grid;
          gap: 2rem;
        }
        .resources-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .resources-header p {
          color: #64748b;
        }
        .resources-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        .resource-section {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .resource-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 1rem;
        }
        .resource-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }
        .resource-item:hover {
          background: #f8fafc;
        }
        .resource-icon {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border-radius: 0.5rem;
          font-size: 1.25rem;
        }
        .resource-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .resource-link {
          color: #0f172a;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
        }
        .resource-link:hover {
          color: #2563eb;
        }
        .resource-type {
          font-size: 0.75rem;
          color: #64748b;
        }
        .download-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }
        .download-btn:hover {
          color: #2563eb;
          background: #eff6ff;
        }
      `}</style>
    </div>
  );
}

