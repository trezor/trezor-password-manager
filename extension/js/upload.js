var RetryHandler = function() {
  (this.interval = 1e3), (this.maxInterval = 6e4);
};
(RetryHandler.prototype.retry = function(a) {
  setTimeout(a, this.interval), (this.interval = this.nextInterval_());
}),
  (RetryHandler.prototype.reset = function() {
    this.interval = 1e3;
  }),
  (RetryHandler.prototype.nextInterval_ = function() {
    var a = 2 * this.interval + this.getRandomInt_(0, 1e3);
    return Math.min(a, this.maxInterval);
  }),
  (RetryHandler.prototype.getRandomInt_ = function(a, b) {
    return Math.floor(Math.random() * (b - a + 1) + a);
  });
var MediaUploader = function(a) {
  var b = function() {};
  if (
    ((this.file = a.file),
    (this.contentType = a.contentType || this.file.type || 'application/octet-stream'),
    (this.metadata = a.metadata || { title: this.file.name, mimeType: this.contentType }),
    (this.token = a.token),
    (this.onComplete = a.onComplete || b),
    (this.onProgress = a.onProgress || b),
    (this.onError = a.onError || b),
    (this.offset = a.offset || 0),
    (this.chunkSize = a.chunkSize || 0),
    (this.retryHandler = new RetryHandler()),
    (this.url = a.url),
    !this.url)
  ) {
    var c = a.params || {};
    (c.uploadType = 'resumable'), (this.url = this.buildUrl_(a.fileId, c, a.baseUrl));
  }
  this.httpMethod = a.fileId ? 'PUT' : 'POST';
};
(MediaUploader.prototype.upload = function() {
  var b = new XMLHttpRequest();
  b.open(this.httpMethod, this.url, !0),
    b.setRequestHeader('Authorization', 'Bearer ' + this.token),
    b.setRequestHeader('Content-Type', 'application/json'),
    b.setRequestHeader('X-Upload-Content-Length', this.file.size),
    b.setRequestHeader('X-Upload-Content-Type', this.contentType),
    (b.onload = function(a) {
      if (a.target.status < 400) {
        var b = a.target.getResponseHeader('Location');
        (this.url = b), this.sendFile_();
      } else this.onUploadError_(a);
    }.bind(this)),
    (b.onerror = this.onUploadError_.bind(this)),
    b.send(JSON.stringify(this.metadata));
}),
  (MediaUploader.prototype.sendFile_ = function() {
    var a = this.file,
      b = this.file.size;
    (this.offset || this.chunkSize) &&
      (this.chunkSize && (b = Math.min(this.offset + this.chunkSize, this.file.size)),
      (a = a.slice(this.offset, b)));
    var c = new XMLHttpRequest();
    c.open('PUT', this.url, !0),
      c.setRequestHeader('Content-Type', this.contentType),
      c.setRequestHeader(
        'Content-Range',
        'bytes ' + this.offset + '-' + (b - 1) + '/' + this.file.size
      ),
      c.setRequestHeader('X-Upload-Content-Type', this.file.type),
      c.upload && c.upload.addEventListener('progress', this.onProgress),
      (c.onload = this.onContentUploadSuccess_.bind(this)),
      (c.onerror = this.onContentUploadError_.bind(this)),
      c.send(a);
  }),
  (MediaUploader.prototype.resume_ = function() {
    var a = new XMLHttpRequest();
    a.open('PUT', this.url, !0),
      a.setRequestHeader('Content-Range', 'bytes */' + this.file.size),
      a.setRequestHeader('X-Upload-Content-Type', this.file.type),
      a.upload && a.upload.addEventListener('progress', this.onProgress),
      (a.onload = this.onContentUploadSuccess_.bind(this)),
      (a.onerror = this.onContentUploadError_.bind(this)),
      a.send();
  }),
  (MediaUploader.prototype.extractRange_ = function(a) {
    var b = a.getResponseHeader('Range');
    b && (this.offset = parseInt(b.match(/\d+/g).pop(), 10) + 1);
  }),
  (MediaUploader.prototype.onContentUploadSuccess_ = function(a) {
    200 == a.target.status || 201 == a.target.status
      ? this.onComplete(a.target.response)
      : 308 == a.target.status
        ? (this.extractRange_(a.target), this.retryHandler.reset(), this.sendFile_())
        : this.onContentUploadError_(a);
  }),
  (MediaUploader.prototype.onContentUploadError_ = function(a) {
    a.target.status && a.target.status < 500
      ? this.onError(a.target.response)
      : this.retryHandler.retry(this.resume_.bind(this));
  }),
  (MediaUploader.prototype.onUploadError_ = function(a) {
    this.onError(a.target.response);
  }),
  (MediaUploader.prototype.buildQuery_ = function(a) {
    return (
      (a = a || {}),
      Object.keys(a)
        .map(function(b) {
          return encodeURIComponent(b) + '=' + encodeURIComponent(a[b]);
        })
        .join('&')
    );
  }),
  (MediaUploader.prototype.buildUrl_ = function(a, b, c) {
    var d = c || 'https://www.googleapis.com/upload/drive/v2/files/';
    a && (d += a);
    var e = this.buildQuery_(b);
    return e && (d += '?' + e), d;
  });
