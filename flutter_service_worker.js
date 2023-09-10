'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"favicon.png": "5280cb02c15ae6f3f94786c1ed3e0f2e",
"flutter.js": "6fef97aeca90b426343ba6c5c9dc5d4a",
"js/exif.js": "b5d2a2507093fad88dca17efa4c1da53",
"js/croppie.min.js": "0380ad0a1bbf1f6c55d5c67a7ced16da",
"version.json": "3ff78f4697c7fffa0b65cf945231edc1",
"canvaskit/canvaskit.wasm": "d9f69e0f428f695dc3d66b3a83a4aa8e",
"canvaskit/skwasm.worker.js": "51253d3321b11ddb8d73fa8aa87d3b15",
"canvaskit/chromium/canvaskit.wasm": "393ec8fb05d94036734f8104fa550a67",
"canvaskit/chromium/canvaskit.js": "ffb2bb6484d5689d91f393b60664d530",
"canvaskit/skwasm.wasm": "d1fde2560be92c0b07ad9cf9acb10d05",
"canvaskit/canvaskit.js": "5caccb235fad20e9b72ea6da5a0094e6",
"canvaskit/skwasm.js": "95f16c6690f955a45b2317496983dbe9",
"icons/512x512.png": "581604136adf3345aebaeaa92ed7f826",
"icons/192x192.png": "bc143240b44f331f08989cc8cc36f818",
"index.html": "1941c9a62d2cfc719d26a69f7d956df4",
"/": "1941c9a62d2cfc719d26a69f7d956df4",
"main.dart.js": "5027e6b2e5eea5f2baf7ece7283d60a2",
"manifest.json": "50edb7fbea8cbf006c74fa008bdeedc4",
"css/croppie.css": "a48a6285899710b9302280aa963868bb",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Medium.ttf": "b090e3202375adb631519fab6bf121c2",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-BoldItalic.ttf": "a4cab46969174b31ea19a358243688c5",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-SemiBoldItalic.ttf": "62e6605f714a9c782695bed8eb0882f3",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Regular.ttf": "7e173cf37bb8221ac504ceab2acfb195",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Bold.ttf": "0339b745f10bb01da181af1cdc33c361",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-MediumItalic.ttf": "84aa53c3bad6d41469bc47846baa6183",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Thin.ttf": "d1a7b45f28bf337cab8adf3992f669a0",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-SemiBold.ttf": "e9372f334303337690d46c5a169f3b10",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-ExtraLightItalic.ttf": "4d323d0f9dcfc8f2cec7dd181ddc6ada",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-LightItalic.ttf": "ee67c6f89219bab25719962baf52abdd",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Light.ttf": "14fa2a726b29e8805e287c002ab64397",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-ThinItalic.ttf": "adc49ca2fcfd159898decbcee230c865",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-Italic.ttf": "9eb6854ad766566c29d1bb5711504345",
"assets/lib/src/assets/fonts/roboto_mono/RobotoMono-ExtraLight.ttf": "b8b8a584a0b8307e1aa11f9f037a0502",
"assets/lib/src/assets/images/48x48.png": "5280cb02c15ae6f3f94786c1ed3e0f2e",
"assets/lib/src/assets/images/192x192.png": "bc143240b44f331f08989cc8cc36f818",
"assets/AssetManifest.bin": "49655f25754c10e5f9d92d40ad7b55c6",
"assets/AssetManifest.json": "40a3de9f391b07f3379ac6ddd602513e",
"assets/shaders/ink_sparkle.frag": "f8b80e740d33eb157090be4e995febdf",
"assets/NOTICES": "6fae558ddbdbd0ba9f958eca8ef9ea04",
"assets/fonts/MaterialIcons-Regular.otf": "4faec91685e8bf321c33b641cb2a75df",
"assets/FontManifest.json": "f540ad7e32b06f3e13591dcbfc364df6",
"assets/packages/youtube_player_iframe/assets/player.html": "dc7a0426386dc6fd0e4187079900aea8",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347"};
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
