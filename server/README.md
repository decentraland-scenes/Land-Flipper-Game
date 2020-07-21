# Simple broadcasting websocket server

This project serve as an example on how to deploy a server with secure websocket.
It opens a websocket server on port 8080 which can then be proxied via nginx to add TLS certificate

## Docker container:
docker docker run -d -p 13370:13370 hprivakos/ws-broadcast