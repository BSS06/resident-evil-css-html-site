#!/usr/bin/env python3
import http.server
import importlib.util
import json
import os
import sys
import webbrowser
PORT = int(os.environ.get('PORT', sys.argv[1] if len(sys.argv) > 1 else 8080))
ROOT = os.path.dirname(os.path.abspath(__file__))
SUBMIT_PATH = '/cgi-bin/submit.py'
os.chdir(ROOT)
os.makedirs('data', exist_ok=True)
spec = importlib.util.spec_from_file_location('submit', os.path.join(ROOT, 'cgi-bin', 'submit.py'))
submit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(submit)
class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8'}
    def send_json(self, status, data):
        payload = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(payload)
    def is_submit(self):
        return self.path.split('?', 1)[0] == SUBMIT_PATH
    def do_GET(self):
        if self.path.startswith('/cgi-bin/') or self.path.startswith('/data/'):
            self.send_error(403, 'Forbidden')
            return
        super().do_GET()
    def do_HEAD(self):
        if self.path.startswith('/cgi-bin/') or self.path.startswith('/data/'):
            self.send_error(403, 'Forbidden')
            return
        super().do_HEAD()
    def do_POST(self):
        if not self.is_submit():
            self.send_error(404, 'Not Found')
            return
        try:
            length = int(self.headers.get('Content-Length', 0) or 0)
        except ValueError:
            length = 0
        if length > submit.MAX_BODY:
            self.send_json(413, {'success': False, 'errors': {'server': 'Request is too large.'}})
            return
        body = self.rfile.read(length).decode('utf-8', errors='replace')
        self.send_json(200, submit.process(body))
def main():
    url = f"http://localhost:{PORT}/index.html"
    print("=" * 60)
    print("  Umbrella Corp — Archive Server Started")
    print("=" * 60)
    print(f"  Website     : {url}")
    print(f"  Assessment  : http://localhost:{PORT}/pages/page6.html")
    print(f"  Saved data  : {os.path.join('data', 'submissions.txt')}")
    print("  Press Ctrl+C to stop the server.")
    print("=" * 60)
    with http.server.ThreadingHTTPServer(('', PORT), Handler) as httpd:
        if os.environ.get('NO_BROWSER') != '1':
            try:
                webbrowser.open(url)
            except Exception:
                pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server stopped.")
if __name__ == '__main__':
    main()
