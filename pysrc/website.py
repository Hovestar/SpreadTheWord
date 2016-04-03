import html
import http.client
import io
import mimetypes
import os
import posixpath
import select
import shutil
import socket
import socketserver
import sys
import time
import urllib.parse
import copy
import argparse
import random

import http.server
import socketserver

import os

def sharemessage(argument):
    f = open('datastore','a')
    f.write(urllib.parse.unquote_plus(argument)+'\n')
    f.close()

def importmessages(messagelist):
    f = open('datastore','r')
    for line in f:
        messagelist.append(line)

class SpreadServer(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        try:
            if self.path[1] == '?':
                query = self.path.split('=') 
                sharemessage(query[1])
        except IndexError:
            pass
        messagelist = []
        importmessages(messagelist)
        f,path = self.send_head()
        pathls = path.split('/')
        if f:
            try:
                self.copyfile(f, self.wfile)
            finally:
                f.close()
        else:
            if pathls[-2] == "data":
                try:
                    self.wfile.write(messagelist[int(pathls[-1])].encode("utf-8"))
                except IndexError:
                    pass
            else:
                self.send_error(404, "File not found")


    def do_HEAD(self):
        """Serve a HEAD request."""
        f, path = self.send_head()
        print(path)
        if f:
            f.close()


    def send_head(self):
        """Common code for GET and HEAD commands.

        This sends the response code and MIME headers.

        Return value is either a file object (which has to be copied
        to the outputfile by the caller unless the command was HEAD,
        and must be closed by the caller under all circumstances), or
        None, in which case the caller has nothing further to do.

        """
        path = self.translate_path(self.path)
        f = None
        if os.path.isdir(path):
            parts = urllib.parse.urlsplit(self.path)
            if not parts.path.endswith('/'):
                # redirect browser - doing basically what apache does
                self.send_response(301)
                new_parts = (parts[0], parts[1], parts[2] + '/',
                             parts[3], parts[4])
                new_url = urllib.parse.urlunsplit(new_parts)
                self.send_header("Location", new_url)
                self.end_headers()
                return None, path
            for index in "index.html", "index.htm":
                index = os.path.join(path, index)
                if os.path.exists(index):
                    path = index
                    break
            else:
                return self.list_directory(path)
        ctype = self.guess_type(path)
        try:
            f = open(path, 'rb')
        except OSError:
            #self.send_error(404, "File not found")
            return None, path
        try:
            self.send_response(200)
            self.send_header("Content-type", ctype)
            fs = os.fstat(f.fileno())
            self.send_header("Content-Length", str(fs[6]))
            self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
            self.end_headers()
            return f, path
        except:
            f.close()
            raise

PORT = 8880 + random.randrange(20)

Handler = SpreadServer

httpd = socketserver.TCPServer(("localhost", PORT), Handler)

print("serving at port", PORT)
try:
    httpd.serve_forever()
finally:
    httpd.server_close()