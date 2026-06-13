#!/usr/bin/env python3
"""Petit serveur statique SANS cache, pratique pour le développement local.
   Lance : python serve.py   (puis http://localhost:8124)
   Multi-thread (gère le chargement parallèle des modules ES).
   En production (GitHub Pages), ce fichier est inutile."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8124


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    with ThreadingHTTPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"Serveur (no-cache) sur http://localhost:{PORT}")
        httpd.serve_forever()
