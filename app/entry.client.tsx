import { RemixBrowser } from "@remix-run/react";
import { hydrate } from "react-dom";
// import { useLocation, useMatches } from "@remix-run/react";
// import * as Sentry from "@sentry/remix";
// import { useEffect } from "react";

// Sentry.init({
//   dsn: "https://5c4951b4713443e18cb2e5871d45a782@o1293114.ingest.sentry.io/6564125",
//   tracesSampleRate: 1,
//   integrations: [
//     new Sentry.BrowserTracing({
//       routingInstrumentation: Sentry.remixRouterInstrumentation(
//         useEffect,
//         useLocation,
//         useMatches
//       ),
//     }),
//   ],
//   // ...
// });

hydrate(<RemixBrowser />, document);
