var staticCacheName = 'psquiz-static-v1';

/**
 * Update the cache on install!!
 */
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(staticCacheName)
        .then(function(cache) {
            //critical resources
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
    //skip waiting for testing
    self.skipWaiting();

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
                //disable cache response for testing
                return /*response ||*/ fetch(event.request).then(function(response) {
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

/**
 * Responds to push messages from GCM.
 */
self.addEventListener('push', function (event) {
    console.log('Push message', event);
    var title = 'Push message';
    event.waitUntil(
        self.registration.showNotification(title, {
            body: 'Come and play with letters and numbers!',
            icon: 'icons/favicon-96x96.png',
            tag: 'preschool quiz'
        })
    );
});

/**
 * Launches web app on notification click.
 */
self.addEventListener('notificationclick', function (event) {
    console.log('On notification click: ', event.notification.tag);
    // Android doesn't close the notification when you click on it.
    event.notification.close();

    // This looks to see if the current window is already open and
    // focuses if it is
    event.waitUntil(
        clients.matchAll({
            type: "window"
        })
        .then(function (clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url == '/' && 'focus' in client)
                    return client.focus();
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});