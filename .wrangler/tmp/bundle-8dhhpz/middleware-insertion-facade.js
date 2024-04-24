				import worker, * as OTHER_EXPORTS from "/Users/ctw03258/personal_projects/INVERN/invern-be/.wrangler/tmp/pages-3BmDHY/functionsWorker-0.9526530312571502.mjs";
				import * as __MIDDLEWARE_0__ from "/Users/ctw03258/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts";
import * as __MIDDLEWARE_1__ from "/Users/ctw03258/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts";
				
				worker.middleware = [
					__MIDDLEWARE_0__.default,__MIDDLEWARE_1__.default,
					...(worker.middleware ?? []),
				].filter(Boolean);
				
				export * from "/Users/ctw03258/personal_projects/INVERN/invern-be/.wrangler/tmp/pages-3BmDHY/functionsWorker-0.9526530312571502.mjs";
				export default worker;