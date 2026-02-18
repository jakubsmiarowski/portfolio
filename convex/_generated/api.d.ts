/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminSessions from "../adminSessions.js";
import type * as analytics from "../analytics.js";
import type * as lib_adminAuth from "../lib/adminAuth.js";
import type * as lib_dummyContent from "../lib/dummyContent.js";
import type * as lib_object from "../lib/object.js";
import type * as messages from "../messages.js";
import type * as projects from "../projects.js";
import type * as seed from "../seed.js";
import type * as siteSettings from "../siteSettings.js";
import type * as spotifyNowPlaying from "../spotifyNowPlaying.js";
import type * as testimonials from "../testimonials.js";
import type * as todos from "../todos.js";
import type * as wall from "../wall.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminSessions: typeof adminSessions;
  analytics: typeof analytics;
  "lib/adminAuth": typeof lib_adminAuth;
  "lib/dummyContent": typeof lib_dummyContent;
  "lib/object": typeof lib_object;
  messages: typeof messages;
  projects: typeof projects;
  seed: typeof seed;
  siteSettings: typeof siteSettings;
  spotifyNowPlaying: typeof spotifyNowPlaying;
  testimonials: typeof testimonials;
  todos: typeof todos;
  wall: typeof wall;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
