"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/scrape/route";
exports.ids = ["app/api/scrape/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fscrape%2Froute&page=%2Fapi%2Fscrape%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fscrape%2Froute.ts&appDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fscrape%2Froute&page=%2Fapi%2Fscrape%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fscrape%2Froute.ts&appDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_jloui_OneDrive_Documents_cs_gt_cs_internships_app_api_scrape_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/scrape/route.ts */ \"(rsc)/./app/api/scrape/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/scrape/route\",\n        pathname: \"/api/scrape\",\n        filename: \"route\",\n        bundlePath: \"app/api/scrape/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\jloui\\\\OneDrive\\\\Documents\\\\cs\\\\gt-cs-internships\\\\app\\\\api\\\\scrape\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_jloui_OneDrive_Documents_cs_gt_cs_internships_app_api_scrape_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/scrape/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzY3JhcGUlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnNjcmFwZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnNjcmFwZSUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNqbG91aSU1Q09uZURyaXZlJTVDRG9jdW1lbnRzJTVDY3MlNUNndC1jcy1pbnRlcm5zaGlwcyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDamxvdWklNUNPbmVEcml2ZSU1Q0RvY3VtZW50cyU1Q2NzJTVDZ3QtY3MtaW50ZXJuc2hpcHMmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDd0M7QUFDckg7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUM2Sjs7QUFFN0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndC1jcy1pbnRlcm5zaGlwLXBvcnRhbC8/OTlkYyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxqbG91aVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcY3NcXFxcZ3QtY3MtaW50ZXJuc2hpcHNcXFxcYXBwXFxcXGFwaVxcXFxzY3JhcGVcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3NjcmFwZS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3NjcmFwZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvc2NyYXBlL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcamxvdWlcXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRzXFxcXGNzXFxcXGd0LWNzLWludGVybnNoaXBzXFxcXGFwcFxcXFxhcGlcXFxcc2NyYXBlXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL3NjcmFwZS9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fscrape%2Froute&page=%2Fapi%2Fscrape%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fscrape%2Froute.ts&appDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/scrape/route.ts":
/*!*********************************!*\
  !*** ./app/api/scrape/route.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n\n// This API route will be called every 30 minutes by Vercel Cron\nasync function GET(request) {\n    try {\n        // Security: Only allow Vercel cron or authorized requests\n        const authHeader = request.headers.get(\"authorization\");\n        const cronSecret = process.env.CRON_SECRET;\n        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Unauthorized\"\n            }, {\n                status: 401\n            });\n        }\n        console.log(\"\\uD83D\\uDD04 Starting scheduled scrape...\");\n        // Import and run the scraper logic\n        const { runScraperAPI } = await Promise.all(/*! import() */[__webpack_require__.e(\"vendor-chunks/@supabase\"), __webpack_require__.e(\"vendor-chunks/tr46\"), __webpack_require__.e(\"vendor-chunks/whatwg-url\"), __webpack_require__.e(\"vendor-chunks/webidl-conversions\"), __webpack_require__.e(\"_rsc_app_lib_scraper-api_ts\")]).then(__webpack_require__.bind(__webpack_require__, /*! ../../lib/scraper-api */ \"(rsc)/./app/lib/scraper-api.ts\"));\n        const result = await runScraperAPI();\n        if (result.success) {\n            console.log(\"✅ Scraper completed successfully\");\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                success: true,\n                message: \"Scraper completed successfully\",\n                internships: result.internshipsFound,\n                updated: result.updated,\n                timestamp: new Date().toISOString()\n            });\n        } else {\n            console.error(\"❌ Scraper failed:\", result.error);\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Scraper failed\",\n                details: result.error\n            }, {\n                status: 500\n            });\n        }\n    } catch (error) {\n        console.error(\"\\uD83D\\uDCA5 API error:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"Internal server error\",\n            details: error\n        }, {\n            status: 500\n        });\n    }\n}\n// Also allow manual POST requests for testing\nasync function POST(request) {\n    return GET(request);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3NjcmFwZS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBd0Q7QUFFeEQsZ0VBQWdFO0FBQ3pELGVBQWVDLElBQUlDLE9BQW9CO0lBQzVDLElBQUk7UUFDRiwwREFBMEQ7UUFDMUQsTUFBTUMsYUFBYUQsUUFBUUUsT0FBTyxDQUFDQyxHQUFHLENBQUM7UUFDdkMsTUFBTUMsYUFBYUMsUUFBUUMsR0FBRyxDQUFDQyxXQUFXO1FBRTFDLElBQUksQ0FBQ0gsY0FBY0gsZUFBZSxDQUFDLE9BQU8sRUFBRUcsV0FBVyxDQUFDLEVBQUU7WUFDeEQsT0FBT04sa0ZBQVlBLENBQUNVLElBQUksQ0FBQztnQkFBRUMsT0FBTztZQUFlLEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUNwRTtRQUVBQyxRQUFRQyxHQUFHLENBQUM7UUFFWixtQ0FBbUM7UUFDbkMsTUFBTSxFQUFFQyxhQUFhLEVBQUUsR0FBRyxNQUFNLGtaQUFPO1FBQ3ZDLE1BQU1DLFNBQVMsTUFBTUQ7UUFFckIsSUFBSUMsT0FBT0MsT0FBTyxFQUFFO1lBQ2xCSixRQUFRQyxHQUFHLENBQUM7WUFDWixPQUFPZCxrRkFBWUEsQ0FBQ1UsSUFBSSxDQUFDO2dCQUN2Qk8sU0FBUztnQkFDVEMsU0FBUztnQkFDVEMsYUFBYUgsT0FBT0ksZ0JBQWdCO2dCQUNwQ0MsU0FBU0wsT0FBT0ssT0FBTztnQkFDdkJDLFdBQVcsSUFBSUMsT0FBT0MsV0FBVztZQUNuQztRQUNGLE9BQU87WUFDTFgsUUFBUUYsS0FBSyxDQUFDLHFCQUFxQkssT0FBT0wsS0FBSztZQUMvQyxPQUFPWCxrRkFBWUEsQ0FBQ1UsSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztnQkFBa0JjLFNBQVNULE9BQU9MLEtBQUs7WUFBQyxHQUNqRDtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO0lBRUYsRUFBRSxPQUFPRCxPQUFPO1FBQ2RFLFFBQVFGLEtBQUssQ0FBQywyQkFBaUJBO1FBQy9CLE9BQU9YLGtGQUFZQSxDQUFDVSxJQUFJLENBQ3RCO1lBQUVDLE9BQU87WUFBeUJjLFNBQVNkO1FBQU0sR0FDakQ7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0Y7QUFFQSw4Q0FBOEM7QUFDdkMsZUFBZWMsS0FBS3hCLE9BQW9CO0lBQzdDLE9BQU9ELElBQUlDO0FBQ2IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndC1jcy1pbnRlcm5zaGlwLXBvcnRhbC8uL2FwcC9hcGkvc2NyYXBlL3JvdXRlLnRzPzkxNjQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcblxuLy8gVGhpcyBBUEkgcm91dGUgd2lsbCBiZSBjYWxsZWQgZXZlcnkgMzAgbWludXRlcyBieSBWZXJjZWwgQ3JvblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICB0cnkge1xuICAgIC8vIFNlY3VyaXR5OiBPbmx5IGFsbG93IFZlcmNlbCBjcm9uIG9yIGF1dGhvcml6ZWQgcmVxdWVzdHNcbiAgICBjb25zdCBhdXRoSGVhZGVyID0gcmVxdWVzdC5oZWFkZXJzLmdldCgnYXV0aG9yaXphdGlvbicpO1xuICAgIGNvbnN0IGNyb25TZWNyZXQgPSBwcm9jZXNzLmVudi5DUk9OX1NFQ1JFVDtcbiAgICBcbiAgICBpZiAoIWNyb25TZWNyZXQgfHwgYXV0aEhlYWRlciAhPT0gYEJlYXJlciAke2Nyb25TZWNyZXR9YCkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH0sIHsgc3RhdHVzOiA0MDEgfSk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coJ/CflIQgU3RhcnRpbmcgc2NoZWR1bGVkIHNjcmFwZS4uLicpO1xuICAgIFxuICAgIC8vIEltcG9ydCBhbmQgcnVuIHRoZSBzY3JhcGVyIGxvZ2ljXG4gICAgY29uc3QgeyBydW5TY3JhcGVyQVBJIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uL2xpYi9zY3JhcGVyLWFwaScpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1blNjcmFwZXJBUEkoKTtcbiAgICBcbiAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgU2NyYXBlciBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBtZXNzYWdlOiAnU2NyYXBlciBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgICAgaW50ZXJuc2hpcHM6IHJlc3VsdC5pbnRlcm5zaGlwc0ZvdW5kLFxuICAgICAgICB1cGRhdGVkOiByZXN1bHQudXBkYXRlZCxcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgU2NyYXBlciBmYWlsZWQ6JywgcmVzdWx0LmVycm9yKTtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogJ1NjcmFwZXIgZmFpbGVkJywgZGV0YWlsczogcmVzdWx0LmVycm9yIH0sXG4gICAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcign8J+SpSBBUEkgZXJyb3I6JywgZXJyb3IpO1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLCBkZXRhaWxzOiBlcnJvciB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufVxuXG4vLyBBbHNvIGFsbG93IG1hbnVhbCBQT1NUIHJlcXVlc3RzIGZvciB0ZXN0aW5nXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICByZXR1cm4gR0VUKHJlcXVlc3QpO1xufSJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJHRVQiLCJyZXF1ZXN0IiwiYXV0aEhlYWRlciIsImhlYWRlcnMiLCJnZXQiLCJjcm9uU2VjcmV0IiwicHJvY2VzcyIsImVudiIsIkNST05fU0VDUkVUIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwiY29uc29sZSIsImxvZyIsInJ1blNjcmFwZXJBUEkiLCJyZXN1bHQiLCJzdWNjZXNzIiwibWVzc2FnZSIsImludGVybnNoaXBzIiwiaW50ZXJuc2hpcHNGb3VuZCIsInVwZGF0ZWQiLCJ0aW1lc3RhbXAiLCJEYXRlIiwidG9JU09TdHJpbmciLCJkZXRhaWxzIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/scrape/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fscrape%2Froute&page=%2Fapi%2Fscrape%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fscrape%2Froute.ts&appDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();