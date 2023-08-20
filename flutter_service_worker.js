'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"index.html": "a0f0312f879e1d4505046ec290c05e6d",
"/": "a0f0312f879e1d4505046ec290c05e6d",
"flutter.js": "6fef97aeca90b426343ba6c5c9dc5d4a",
"main.dart.js": "6d6f8268000b5a5657da78cd52773f39",
"favicon.png": "5280cb02c15ae6f3f94786c1ed3e0f2e",
"icons/512x512.png": "581604136adf3345aebaeaa92ed7f826",
"icons/192x192.png": "bc143240b44f331f08989cc8cc36f818",
"manifest.json": "cc5a77dbe614fb2ca5625e97917ee40f",
"canvaskit/chromium/canvaskit.wasm": "fc18c3010856029414b70cae1afc5cd9",
"canvaskit/chromium/canvaskit.js": "8c8392ce4a4364cbb240aa09b5652e05",
"canvaskit/canvaskit.wasm": "f48eaf57cada79163ec6dec7929486ea",
"canvaskit/skwasm.js": "1df4d741f441fa1a4d10530ced463ef8",
"canvaskit/canvaskit.js": "76f7d822f42397160c5dfc69cbc9b2de",
"canvaskit/skwasm.wasm": "6711032e17bf49924b2b001cef0d3ea3",
"canvaskit/skwasm.worker.js": "19659053a277272607529ef87acf9d8a",
"version.json": "3ff78f4697c7fffa0b65cf945231edc1",
"assets/lib/src/assets/images/48x48.png": "5280cb02c15ae6f3f94786c1ed3e0f2e",
"assets/lib/src/assets/images/192x192.png": "bc143240b44f331f08989cc8cc36f818",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-ExtraLightItalic.ttf": "4d323d0f9dcfc8f2cec7dd181ddc6ada",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Regular.ttf": "7e173cf37bb8221ac504ceab2acfb195",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Bold.ttf": "0339b745f10bb01da181af1cdc33c361",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-ThinItalic.ttf": "adc49ca2fcfd159898decbcee230c865",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-SemiBoldItalic.ttf": "62e6605f714a9c782695bed8eb0882f3",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-BoldItalic.ttf": "a4cab46969174b31ea19a358243688c5",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-LightItalic.ttf": "ee67c6f89219bab25719962baf52abdd",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Italic.ttf": "9eb6854ad766566c29d1bb5711504345",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Light.ttf": "14fa2a726b29e8805e287c002ab64397",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-MediumItalic.ttf": "84aa53c3bad6d41469bc47846baa6183",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Thin.ttf": "d1a7b45f28bf337cab8adf3992f669a0",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-SemiBold.ttf": "e9372f334303337690d46c5a169f3b10",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-ExtraLight.ttf": "b8b8a584a0b8307e1aa11f9f037a0502",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Medium.ttf": "b090e3202375adb631519fab6bf121c2",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/AssetManifest.json": "66c5cb07e0c769c87466930edbdc7960",
"assets/NOTICES": "3bf7f57a6c44a4754e83c0a442ae52e9",
"assets/FontManifest.json": "f540ad7e32b06f3e13591dcbfc364df6",
"assets/AssetManifest.bin": "dd8127c6b878be271840df00390d4546",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/shaders/ink_sparkle.frag": "f8b80e740d33eb157090be4e995febdf"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
