import styles from '../styles/Overview.module.css';

export default function Overview() {
  return (
    <section className={styles.section}>
      <div className="container">
        <section id="centralization" className={styles.diagramSection}>
          <h2 className={styles.diagramHeading}>Funding Intelligence System</h2>
          <div className={styles.centralizationDiagram}>
            <div className={styles.centerHub}>
              <div className={`${styles.hubIcon} ${styles.iconGear}`}></div>
              <h4>Central Platform</h4>
              <p>All tasks in one place</p>
            </div>
            <div className={styles.connections}>
              <div className={styles.connection}>
                <div className={styles.connectionLine}></div>
                <div className={styles.connectionNode}>
                  <div className={`${styles.nodeIcon} ${styles.iconSearch}`}></div>
                  <h5>Discovery</h5>
                  <p>Automated finding of opportunities</p>
                </div>
              </div>
              <div className={styles.connection}>
                <div className={styles.connectionLine}></div>
                <div className={styles.connectionNode}>
                  <div className={`${styles.nodeIcon} ${styles.iconChart}`}></div>
                  <h5>Structuring</h5>
                  <p>Normalize and organize data</p>
                </div>
              </div>
              <div className={styles.connection}>
                <div className={styles.connectionLine}></div>
                <div className={styles.connectionNode}>
                  <div className={`${styles.nodeIcon} ${styles.iconSend}`}></div>
                  <h5>Distribution</h5>
                  <p>Send and share opportunities</p>
                </div>
              </div>
              <div className={styles.connection}>
                <div className={styles.connectionLine}></div>
                <div className={styles.connectionNode}>
                  <div className={`${styles.nodeIcon} ${styles.iconCheck}`}></div>
                  <h5>Management</h5>
                  <p>Track and perform tasks</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className={styles.card}>
          <h3>How It Works</h3>
          <div className={styles.workflowDiagram}>
            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Automated Discovery</h4>
                <p>Continuously finds funding opportunities across public and private sources</p>
              </div>
            </div>
            <div className={styles.workflowArrow}>→</div>
            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Structured Processing</h4>
                <p>Normalizes region, vertical, eligibility, and assigns ProofScore</p>
              </div>
            </div>
            <div className={styles.workflowArrow}>→</div>
            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Centralized Storage</h4>
                <p>All opportunities stored and organized in one platform</p>
              </div>
            </div>
            <div className={styles.workflowArrow}>→</div>
            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Easy Access & Activation</h4>
                <p>Access, send, and perform tasks directly from the platform</p>
              </div>
            </div>
          </div>
        </section>

        <section id="types" className={styles.card}>
          <h3>Funding Types Supported</h3>
          <div className={styles.typesGrid}>
            <div className={styles.typeCard}>
              <h4>Grants</h4>
              <p>Government and private grants for businesses and consumers</p>
            </div>
            <div className={styles.typeCard}>
              <h4>Rebates</h4>
              <p>Energy rebates and incentive programs</p>
            </div>
            <div className={styles.typeCard}>
              <h4>RFPs & RFQs</h4>
              <p>Request for Proposals and Quotations</p>
            </div>
            <div className={styles.typeCard}>
              <h4>Bursaries</h4>
              <p>Educational and training funding opportunities</p>
            </div>
            <div className={styles.typeCard}>
              <h4>Co-Marketing Funds</h4>
              <p>Partnership and marketing funding programs</p>
            </div>
            <div className={styles.typeCard}>
              <h4>B2B & B2C</h4>
              <p>Both business-to-business and business-to-consumer opportunities</p>
            </div>
          </div>
        </section>

        <section id="benefits" className={styles.card}>
          <h3>Key Benefits</h3>
          <ul className={styles.benefitsList}>
            <li><strong>Centralization:</strong> All automation tasks and funding opportunities in one unified platform</li>
            <li><strong>Accessibility:</strong> Easy access to all related tasks and information from a single location</li>
            <li><strong>Automation:</strong> Automated discovery and processing reduces manual work</li>
            <li><strong>Organization:</strong> Structured data with normalized fields and scoring for better management</li>
            <li><strong>Efficiency:</strong> Send and perform tasks directly without switching between multiple systems</li>
          </ul>
        </section>
      </div>
    </section>
  );
}
