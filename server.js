const liveServer = require('live-server');
const params = {
    port: 8000,
    root: '/public',
    file: 'index.html'
}

liveServer.start(params);