let CACHE_STATIC_NAME = 'static-v1';
let CACHE_DYNAMIC_NAME = 'dynamic-v1';

// Evento para instalar o SW
self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker... ', event);
    //Abrir a cache
    //Criar um evento que retorna uma promise e armazena em cache os retornos 
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll([
                    '/',
                    '/index.html',
                    '/src/css/style.css',
                    '/src/js/script.js',
                    '/favicon.ico',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js'
                ]);

            })
    )
});

// Evento para Ativar o SW
self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker... ', event);
    //Evento para limpar a Cache 
    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) {
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[Service Worker] Removing old cache.', key);
                        return caches.delete(key);
                    }
                }));
            })
    )
    return self.clients.claim();
});

// Evento de busca para verificar se existe alguma solicitação em cache, caso não exista fazemos uma solicitação de rede
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request)
                        // Realizar uma nova busca, caso não tenha solicitações em cache e abrir um cache dinâmico
                        .then(function (res) {
                            return caches.open(CACHE_DYNAMIC_NAME)
                                .then(function (cache) {
                                    cache.put(event.request.url, res.clone()) // Para armazenar um cloned exato da resposta
                                    return res;
                                })
                        })
                        //Para não ficar a mostrar os erros e apresentar a página offline
                        .catch(function (err) {
                            return caches.open(CACHE_STATIC_NAME)
                                .then(function (cache) {
                                    return cache.match('/offline.html');
                                })
                        })
                }
            })
    );
});


// Ouvinte de evento de clique da notificação
self.addEventListener('notificationclick' , function(event) {
    let notification = event.notification;
    let action = event.action;

    console.log(notification);

    if (action === 'confirm') {
        console.log('confirm was chosen');
        notification.close();
    } else {
        console.log(action);
        notification.close();
    }

});

// Ouvinte de evento para fechar a notificação
self.addEventListener('notificationclose', function(event) {
    console.log('Notification was closed', event);
});