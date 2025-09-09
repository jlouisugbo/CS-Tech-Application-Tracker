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
exports.id = "app/api/status/route";
exports.ids = ["app/api/status/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstatus%2Froute&page=%2Fapi%2Fstatus%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstatus%2Froute.ts&appDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstatus%2Froute&page=%2Fapi%2Fstatus%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstatus%2Froute.ts&appDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_jloui_OneDrive_Documents_cs_gt_cs_internships_app_api_status_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/status/route.ts */ \"(rsc)/./app/api/status/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/status/route\",\n        pathname: \"/api/status\",\n        filename: \"route\",\n        bundlePath: \"app/api/status/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\jloui\\\\OneDrive\\\\Documents\\\\cs\\\\gt-cs-internships\\\\app\\\\api\\\\status\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_jloui_OneDrive_Documents_cs_gt_cs_internships_app_api_status_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/status/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzdGF0dXMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnN0YXR1cyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnN0YXR1cyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNqbG91aSU1Q09uZURyaXZlJTVDRG9jdW1lbnRzJTVDY3MlNUNndC1jcy1pbnRlcm5zaGlwcyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDamxvdWklNUNPbmVEcml2ZSU1Q0RvY3VtZW50cyU1Q2NzJTVDZ3QtY3MtaW50ZXJuc2hpcHMmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDd0M7QUFDckg7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUM2Sjs7QUFFN0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndC1jcy1pbnRlcm5zaGlwLXBvcnRhbC8/NmEwMyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxqbG91aVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcY3NcXFxcZ3QtY3MtaW50ZXJuc2hpcHNcXFxcYXBwXFxcXGFwaVxcXFxzdGF0dXNcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3N0YXR1cy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3N0YXR1c1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvc3RhdHVzL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcamxvdWlcXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRzXFxcXGNzXFxcXGd0LWNzLWludGVybnNoaXBzXFxcXGFwcFxcXFxhcGlcXFxcc3RhdHVzXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL3N0YXR1cy9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstatus%2Froute&page=%2Fapi%2Fstatus%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstatus%2Froute.ts&appDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/status/route.ts":
/*!*********************************!*\
  !*** ./app/api/status/route.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var _lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../lib/supabaseAdmin */ \"(rsc)/./app/lib/supabaseAdmin.ts\");\n\n\nasync function GET() {\n    try {\n        if (!_lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__.supabaseAdmin) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Database not available\"\n            }, {\n                status: 500\n            });\n        }\n        // Get the most recent scrape log\n        const { data: recentLog, error } = await _lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__.supabaseAdmin.from(\"scrape_logs\").select(\"*\").eq(\"status\", \"success\").order(\"completed_at\", {\n            ascending: false\n        }).limit(1).single();\n        if (error) {\n            console.error(\"Error fetching scrape logs:\", error);\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                lastUpdated: null,\n                status: \"unknown\",\n                internshipsFound: 0,\n                nextUpdate: \"Unknown\"\n            });\n        }\n        // Calculate next update time (30 minutes from last update)\n        const lastUpdated = new Date(recentLog.completed_at);\n        const nextUpdate = new Date(lastUpdated.getTime() + 30 * 60 * 1000);\n        const now = new Date();\n        const minutesUntilNext = Math.max(0, Math.floor((nextUpdate.getTime() - now.getTime()) / (1000 * 60)));\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            lastUpdated: recentLog.completed_at,\n            status: recentLog.status,\n            internshipsFound: recentLog.internships_found || 0,\n            nextUpdate: minutesUntilNext > 0 ? `${minutesUntilNext} minutes` : \"Soon\",\n            isRecent: now.getTime() - lastUpdated.getTime() < 35 * 60 * 1000 // Less than 35 minutes ago\n        });\n    } catch (error) {\n        console.error(\"Status API error:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"Failed to fetch status\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3N0YXR1cy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBMkM7QUFDYTtBQUVqRCxlQUFlRTtJQUNwQixJQUFJO1FBQ0YsSUFBSSxDQUFDRCw2REFBYUEsRUFBRTtZQUNsQixPQUFPRCxrRkFBWUEsQ0FBQ0csSUFBSSxDQUFDO2dCQUFFQyxPQUFPO1lBQXlCLEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUM5RTtRQUVBLGlDQUFpQztRQUNqQyxNQUFNLEVBQUVDLE1BQU1DLFNBQVMsRUFBRUgsS0FBSyxFQUFFLEdBQUcsTUFBTUgsNkRBQWFBLENBQ25ETyxJQUFJLENBQUMsZUFDTEMsTUFBTSxDQUFDLEtBQ1BDLEVBQUUsQ0FBQyxVQUFVLFdBQ2JDLEtBQUssQ0FBQyxnQkFBZ0I7WUFBRUMsV0FBVztRQUFNLEdBQ3pDQyxLQUFLLENBQUMsR0FDTkMsTUFBTTtRQUVULElBQUlWLE9BQU87WUFDVFcsUUFBUVgsS0FBSyxDQUFDLCtCQUErQkE7WUFDN0MsT0FBT0osa0ZBQVlBLENBQUNHLElBQUksQ0FBQztnQkFDdkJhLGFBQWE7Z0JBQ2JYLFFBQVE7Z0JBQ1JZLGtCQUFrQjtnQkFDbEJDLFlBQVk7WUFDZDtRQUNGO1FBRUEsMkRBQTJEO1FBQzNELE1BQU1GLGNBQWMsSUFBSUcsS0FBS1osVUFBVWEsWUFBWTtRQUNuRCxNQUFNRixhQUFhLElBQUlDLEtBQUtILFlBQVlLLE9BQU8sS0FBSyxLQUFLLEtBQUs7UUFDOUQsTUFBTUMsTUFBTSxJQUFJSDtRQUNoQixNQUFNSSxtQkFBbUJDLEtBQUtDLEdBQUcsQ0FBQyxHQUFHRCxLQUFLRSxLQUFLLENBQUMsQ0FBQ1IsV0FBV0csT0FBTyxLQUFLQyxJQUFJRCxPQUFPLEVBQUMsSUFBTSxRQUFPLEVBQUM7UUFFbEcsT0FBT3JCLGtGQUFZQSxDQUFDRyxJQUFJLENBQUM7WUFDdkJhLGFBQWFULFVBQVVhLFlBQVk7WUFDbkNmLFFBQVFFLFVBQVVGLE1BQU07WUFDeEJZLGtCQUFrQlYsVUFBVW9CLGlCQUFpQixJQUFJO1lBQ2pEVCxZQUFZSyxtQkFBbUIsSUFBSSxDQUFDLEVBQUVBLGlCQUFpQixRQUFRLENBQUMsR0FBRztZQUNuRUssVUFBVSxJQUFLUCxPQUFPLEtBQUtMLFlBQVlLLE9BQU8sS0FBTyxLQUFLLEtBQUssS0FBTSwyQkFBMkI7UUFDbEc7SUFFRixFQUFFLE9BQU9qQixPQUFPO1FBQ2RXLFFBQVFYLEtBQUssQ0FBQyxxQkFBcUJBO1FBQ25DLE9BQU9KLGtGQUFZQSxDQUFDRyxJQUFJLENBQ3RCO1lBQUVDLE9BQU87UUFBeUIsR0FDbEM7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndC1jcy1pbnRlcm5zaGlwLXBvcnRhbC8uL2FwcC9hcGkvc3RhdHVzL3JvdXRlLnRzPzRkNWUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuaW1wb3J0IHsgc3VwYWJhc2VBZG1pbiB9IGZyb20gJy4uLy4uL2xpYi9zdXBhYmFzZUFkbWluJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcbiAgdHJ5IHtcbiAgICBpZiAoIXN1cGFiYXNlQWRtaW4pIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnRGF0YWJhc2Ugbm90IGF2YWlsYWJsZScgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIG1vc3QgcmVjZW50IHNjcmFwZSBsb2dcbiAgICBjb25zdCB7IGRhdGE6IHJlY2VudExvZywgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlQWRtaW5cbiAgICAgIC5mcm9tKCdzY3JhcGVfbG9ncycpXG4gICAgICAuc2VsZWN0KCcqJylcbiAgICAgIC5lcSgnc3RhdHVzJywgJ3N1Y2Nlc3MnKVxuICAgICAgLm9yZGVyKCdjb21wbGV0ZWRfYXQnLCB7IGFzY2VuZGluZzogZmFsc2UgfSlcbiAgICAgIC5saW1pdCgxKVxuICAgICAgLnNpbmdsZSgpO1xuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBzY3JhcGUgbG9nczonLCBlcnJvcik7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgICBsYXN0VXBkYXRlZDogbnVsbCxcbiAgICAgICAgc3RhdHVzOiAndW5rbm93bicsXG4gICAgICAgIGludGVybnNoaXBzRm91bmQ6IDAsXG4gICAgICAgIG5leHRVcGRhdGU6ICdVbmtub3duJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIG5leHQgdXBkYXRlIHRpbWUgKDMwIG1pbnV0ZXMgZnJvbSBsYXN0IHVwZGF0ZSlcbiAgICBjb25zdCBsYXN0VXBkYXRlZCA9IG5ldyBEYXRlKHJlY2VudExvZy5jb21wbGV0ZWRfYXQpO1xuICAgIGNvbnN0IG5leHRVcGRhdGUgPSBuZXcgRGF0ZShsYXN0VXBkYXRlZC5nZXRUaW1lKCkgKyAzMCAqIDYwICogMTAwMCk7XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCBtaW51dGVzVW50aWxOZXh0ID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcigobmV4dFVwZGF0ZS5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvICgxMDAwICogNjApKSk7XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgbGFzdFVwZGF0ZWQ6IHJlY2VudExvZy5jb21wbGV0ZWRfYXQsXG4gICAgICBzdGF0dXM6IHJlY2VudExvZy5zdGF0dXMsXG4gICAgICBpbnRlcm5zaGlwc0ZvdW5kOiByZWNlbnRMb2cuaW50ZXJuc2hpcHNfZm91bmQgfHwgMCxcbiAgICAgIG5leHRVcGRhdGU6IG1pbnV0ZXNVbnRpbE5leHQgPiAwID8gYCR7bWludXRlc1VudGlsTmV4dH0gbWludXRlc2AgOiAnU29vbicsXG4gICAgICBpc1JlY2VudDogKG5vdy5nZXRUaW1lKCkgLSBsYXN0VXBkYXRlZC5nZXRUaW1lKCkpIDwgKDM1ICogNjAgKiAxMDAwKSAvLyBMZXNzIHRoYW4gMzUgbWludXRlcyBhZ29cbiAgICB9KTtcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1N0YXR1cyBBUEkgZXJyb3I6JywgZXJyb3IpO1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggc3RhdHVzJyB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufSJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJzdXBhYmFzZUFkbWluIiwiR0VUIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwiZGF0YSIsInJlY2VudExvZyIsImZyb20iLCJzZWxlY3QiLCJlcSIsIm9yZGVyIiwiYXNjZW5kaW5nIiwibGltaXQiLCJzaW5nbGUiLCJjb25zb2xlIiwibGFzdFVwZGF0ZWQiLCJpbnRlcm5zaGlwc0ZvdW5kIiwibmV4dFVwZGF0ZSIsIkRhdGUiLCJjb21wbGV0ZWRfYXQiLCJnZXRUaW1lIiwibm93IiwibWludXRlc1VudGlsTmV4dCIsIk1hdGgiLCJtYXgiLCJmbG9vciIsImludGVybnNoaXBzX2ZvdW5kIiwiaXNSZWNlbnQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/status/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/lib/supabaseAdmin.ts":
/*!**********************************!*\
  !*** ./app/lib/supabaseAdmin.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   supabaseAdmin: () => (/* binding */ supabaseAdmin)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\n// Admin client for server-side operations\nconst supabaseUrl = \"https://bgmppiwflytcvbpdudfq.supabase.co\";\nconst supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\nconst supabaseAdmin = supabaseServiceKey ? (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseServiceKey) : null;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (supabaseAdmin);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvbGliL3N1cGFiYXNlQWRtaW4udHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQW9EO0FBRXBELDBDQUEwQztBQUMxQyxNQUFNQyxjQUFjQywwQ0FBb0M7QUFDeEQsTUFBTUcscUJBQXFCSCxRQUFRQyxHQUFHLENBQUNHLHlCQUF5QjtBQUV6RCxNQUFNQyxnQkFBZ0JGLHFCQUN6QkwsbUVBQVlBLENBQUNDLGFBQWFJLHNCQUMxQixLQUFJO0FBRVIsaUVBQWVFLGFBQWFBLEVBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndC1jcy1pbnRlcm5zaGlwLXBvcnRhbC8uL2FwcC9saWIvc3VwYWJhc2VBZG1pbi50cz9jZTIyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcblxuLy8gQWRtaW4gY2xpZW50IGZvciBzZXJ2ZXItc2lkZSBvcGVyYXRpb25zXG5jb25zdCBzdXBhYmFzZVVybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCFcbmNvbnN0IHN1cGFiYXNlU2VydmljZUtleSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVlcblxuZXhwb3J0IGNvbnN0IHN1cGFiYXNlQWRtaW4gPSBzdXBhYmFzZVNlcnZpY2VLZXkgXG4gID8gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzdXBhYmFzZVNlcnZpY2VLZXkpXG4gIDogbnVsbFxuXG5leHBvcnQgZGVmYXVsdCBzdXBhYmFzZUFkbWluIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInN1cGFiYXNlU2VydmljZUtleSIsIlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkiLCJzdXBhYmFzZUFkbWluIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/lib/supabaseAdmin.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstatus%2Froute&page=%2Fapi%2Fstatus%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstatus%2Froute.ts&appDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjloui%5COneDrive%5CDocuments%5Ccs%5Cgt-cs-internships&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();