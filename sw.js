var staticCacheName = 'psquiz-static-v1';

/**
 * Update the cache on install
 */
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(staticCacheName)
        .then(function(cache) {
            //critical resources!!!
            return cache.addAll([
                'index.html',
                'js/all.js',
                'js/lib/angular.js',
                'js/lib/angular-route.js',
                'style/style.css',
                'data/shapes.json',
                'partials/main.html',
                'partials/quizthree.html',
                'data/smallletters1.json',
                'data/counting.json',
                'data/numbers.json',
                'data/bigletters1.json'
            ]);
        })
    );
});

/**
 * Cleanup cache on activation
 */
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('psquiz-') &&
                        cacheName != staticCacheName;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

/**
 * Responds with data from cache when the file/data is available
 */
self.addEventListener('fetch', function(event) {

    //Cache all the responses, except for browser-sync messages
    event.respondWith(
        caches.open(staticCacheName).then(function(cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function(response) {
                    if (event.request.url.indexOf('browser-sync')== -1)
                        cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );

/*
//This will cache only same location origins
    var requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        //this is a request for a static resource.
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }

    */
});

/**
 * Responds to messages from controller.
 */
self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});