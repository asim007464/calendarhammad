import Script from "next/script";

const GA_ID = "G-6SH5MHBQBP";
const CLARITY_ID = "xex69937yv";

export function AnalyticsScripts() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_ID}");
        `}
      </Script>
    </>
  );
}

export function AnalyticsDashboard() {
  return (
    <div className="analytics-grid">
      <div className="panel analytics-card">
        <h3>Google Analytics</h3>
        <p className="section-sub">
          Property <strong>{GA_ID}</strong>. View full reports in{" "}
          <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
            Google Analytics
          </a>
          .
        </p>
        <div className="analytics-embed">
          <iframe
            title="Google Analytics"
            src={`https://lookerstudio.google.com/embed/reporting/create?c.reportId=&ds.ds0.connector=googleAnalytics&ds.ds0.type=TABLE&ds.ds0.datasourceName=GA4&ds.ds0.accountId=${GA_ID}`}
            className="analytics-frame"
            allowFullScreen
          />
        </div>
        <p className="hint">Real-time and historical data is tracked on every page via gtag.js.</p>
      </div>
      <div className="panel analytics-card">
        <h3>Microsoft Clarity</h3>
        <p className="section-sub">
          Project <strong>{CLARITY_ID}</strong>. Session recordings and heatmaps in{" "}
          <a href="https://clarity.microsoft.com/" target="_blank" rel="noopener noreferrer">
            Clarity Dashboard
          </a>
          .
        </p>
        <div className="analytics-embed clarity-placeholder">
          <p>Clarity is active on this site. Open the Clarity dashboard to view heatmaps, scroll maps, and session replays for qsodates.com.</p>
          <a
            href="https://clarity.microsoft.com/projects/view/xex69937yv/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            Open Clarity Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
