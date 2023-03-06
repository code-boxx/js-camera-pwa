var gallery = {
  // (A) LIST GALLERY
  hPics : null, // html gallery wrapper
  hTemplate : null, // html image item template
  list : () => {
    gallery.hPics.innerHTML = "";
    cam.cache.keys().then(keys => keys.forEach(req => {
      let item = gallery.hTemplate.cloneNode(true);
      item.querySelector(".img").src = req.url;
      item.querySelector(".del").onclick = () => gallery.del(req.url);
      item.querySelector(".get").onclick = () => gallery.get(req.url);
      item.querySelector(".share").onclick = () => gallery.share(req.url);
      gallery.hPics.appendChild(item);
    }));
  },

  // (B) DELETE AN IMAGE
  del : pic => { if (confirm("Delete image?")) {
    cam.cache.delete(pic).then(res => gallery.list());
  }},

  // (C) DOWNLOAD AN IMAGE
  get : pic => 
    cam.cache.match(pic)
    .then(res => res.blob())
    .then(blob => {
      let a = document.createElement("a"),
      url = URL.createObjectURL(blob);
      a.href = url;
      a.download = "pic.png";
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }),

  // (D) SHARE AN IMAGE
  share : pic => 
    cam.cache.match(pic)
    .then(res => res.blob())
    .then(blob => navigator.share({
      files: [new File([blob], pic, { type: blob.type })],
      title: new URL(pic).pathname.replace(/^.*[\\\/]/, ""),
      text: "JSCamera Share Picture"
    }))
};