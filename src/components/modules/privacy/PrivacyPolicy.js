import styles from './privacyPolicy.module.scss';

const PRIVACY_REQUEST_EMAIL = 'sales@vikingmetalgarages.com';

const PrivacyRights = () => (
  <ul className={styles.privacy__list}>
    <li>Request access to or a copy of personal data.</li>
    <li>Request correction or deletion of personal data.</li>
    <li>Request information about categories of data collected, purposes, and disclosures.</li>
    <li>Opt out of certain sales, targeted advertising, or profiling activities.</li>
    <li>Limit certain uses of sensitive personal information.</li>
    <li>Appeal a denied privacy request.</li>
    <li>Receive equal service when exercising privacy rights, subject to lawful exceptions.</li>
  </ul>
);

const PrivacyPolicy = () => (
  <article className={styles.privacy}>
    <div className={styles.privacy__container}>
      <header className={styles.privacy__hero}>
        <h1 className={styles.privacy__title}>Data Privacy &amp; Legal Compliance</h1>
        <p className={styles.privacy__subtitle}>How GripEstimator handles data</p>
      </header>

      <section className={styles.privacy__section}>
        <h2 className={styles.privacy__heading}>How GripEstimator handles data</h2>
        <p className={styles.privacy__text}>
          GripEstimator is designed to use the information entered into the tool for the estimator
          services you request:
        </p>
        <ul className={styles.privacy__list}>
          <li>Building design data is used to create and operate the design or estimate.</li>
          <li>AI Chat inputs are used to provide building-related assistance.</li>
          <li>Personal data is not sold.</li>
          <li>
            Service providers may process information on our behalf to host, secure, support, or
            operate GripEstimator.
          </li>
          <li>
            We retain information only as long as reasonably needed for the disclosed purposes,
            legal obligations, and service operation.
          </li>
          <li>
            You can submit a privacy request at{' '}
            <a className={styles.privacy__link} href={`mailto:${PRIVACY_REQUEST_EMAIL}`}>
              {PRIVACY_REQUEST_EMAIL}
            </a>
            . Your rights depend on applicable law, and exceptions may apply.
          </li>
        </ul>
        <div className={styles.privacy__warning}>
          Do not enter sensitive personal information into the estimator or AI Chat.
        </div>
      </section>

      <section className={styles.privacy__section}>
        <h2 className={styles.privacy__heading}>Legal framework</h2>
        <p className={styles.privacy__text}>
          GripEstimator&rsquo;s privacy practices may be subject to applicable US federal and state
          privacy, consumer protection, data security, and breach-notification laws. Depending on
          the parties, data, and activities involved, these may include:
        </p>
        <ul className={styles.privacy__list}>
          <li>
            The Federal Trade Commission Act, including rules against unfair or deceptive practices.
          </li>
          <li>
            The Children&rsquo;s Online Privacy Protection Act and Rule, if the service is directed
            to children under 13 or has actual knowledge it collects personal information from a
            child under 13.
          </li>
          <li>
            State comprehensive privacy laws, including California&rsquo;s CCPA/CPRA and privacy
            laws in states such as Colorado and Delaware, when their coverage requirements are met.
          </li>
          <li>
            Other state laws that may apply to particular data types or activities, including
            breach-notification laws and, where relevant, laws concerning health, financial,
            biometric, or other sensitive information.
          </li>
        </ul>
        <p className={styles.privacy__text}>
          These laws do not all apply to every company or every data flow. The responsible business
          should determine applicability based on its role, the types and volume of data, user
          locations, and how the information is used. This summary is informational and is not a
          representation that every listed law applies.
        </p>
      </section>

      <section className={styles.privacy__section}>
        <h2 className={styles.privacy__heading}>Privacy rights</h2>
        <p className={styles.privacy__text}>
          Where applicable law provides these rights, individuals may be able to:
        </p>
        <PrivacyRights />
        <p className={styles.privacy__text}>
          Send requests to{' '}
          <a className={styles.privacy__link} href={`mailto:${PRIVACY_REQUEST_EMAIL}`}>
            {PRIVACY_REQUEST_EMAIL}
          </a>
          . We may ask for information needed to verify and process your request. We will not use
          that verification information for unrelated purposes.
        </p>
      </section>

      <section className={styles.privacy__section}>
        <h2 className={styles.privacy__heading}>Privacy compliance and developer notes</h2>
        <p className={styles.privacy__text}>
          Before launch, the website owner and GripEstimator operator should verify the published
          notice against the real configuration, including:
        </p>
        <ul className={styles.privacy__list}>
          <li>
            Which entity acts as the business/controller and which acts as a service
            provider/processor.
          </li>
          <li>
            Which information is collected by the estimator, website analytics, hosting, and AI
            provider.
          </li>
          <li>
            Whether design or chat data is retained, where it is stored, who can access it, and when
            it is deleted.
          </li>
          <li>
            Whether the AI provider uses prompts or outputs for model training, review, or product
            improvement.
          </li>
          <li>
            Whether cookies, analytics, advertising pixels, or session replay tools collect
            information or transmit it to third parties.
          </li>
          <li>How users submit, verify, track, and appeal privacy requests.</li>
          <li>
            Whether the site must honor recognized opt-out preference signals where applicable.
          </li>
          <li>
            Whether the service could collect information from children under 13 and, if so, what
            parental notice and consent process is required.
          </li>
        </ul>
      </section>
    </div>
  </article>
);

export default PrivacyPolicy;
