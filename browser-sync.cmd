@echo off
cd app
browser-sync start --server --port 8001 --files "css/*,js/*,js/*/*,partials/*,index.html"