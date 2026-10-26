export default function AuthBrandingPanel() {
  return (
    <div className="col-left-box">
      <img src="/crm/login_bg.png" alt="login" className="left-login-cover" />
      <div className="login-mono-div">
        <div className="logo_file" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M37.2313 44H6.76867C3.02867 44 0 40.9713 0 37.2313V6.76867C0 3.02867 3.02867 0 6.76867 0H37.2313C40.9713 0 44 3.02867 44 6.76867V37.2313C44 40.9713 40.9713 44 37.2313 44Z" fill="black" />
            <path d="M38.4927 15.0553V5.07465H5.50734V38.9253H22.1173L34.1513 26.8766V38.9253H38.4927V19.3966H34.1513H19.8293V23.738H31.1887L20.3353 34.584H9.84867V9.41598H34.1513V15.0553H38.4927Z" fill="white" />
          </svg>
        </div>
        <div className="logo_file_cnt">
          <h2>
            Work faster. <br />
            Grow smarter.
          </h2>
          <p>A powerful CRM to manage customers, automate processes, and drive better results.</p>
        </div>
      </div>
    </div>
  );
}
