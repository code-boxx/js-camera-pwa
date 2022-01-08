var cam = {
  // (A) HELPER FUNCTION TO GENERATE ERROR MESSAGE
  err : (msg) => {
    let row = document.createElement("div");
    row.className = "error";
    row.innerHTML = msg;
    document.getElementById("cb-main").appendChild(row);
  },

  // (B) INIT APP
  cPics : "MyPics", // cache to store pictures
  ready : 0, // number of components that are ready
  init : (ready) => {
    // (B1) ALL CHECKS & COMPONENTS GOOD TO GO?
    if (ready==1) {
      cam.ready++;
      if (cam.ready==3) { cb.load(); }
    }

    // (B2) REQUIREMENT CHECKS & SETUP
    else {
      // (B2-1) REQUIREMENT - MEDIA DEVICES
      let pass = true;
      if (!"mediaDevices" in navigator) {
        cam.err("Your browser does not support media devices.");
        pass = false;
      }

      // (B2-2) REQUIREMENT - SERVICE WORKER
      if (!"serviceWorker" in navigator) {
        cam.err("Your browser does not support service workers.");
        pass = false;
      }

      // (B2-3) REQUIREMENT - CACHE STORAGE
      if (!"caches" in window) {
        cam.err("Your browser does not support cache storage.");
        pass = false;
      }

      // (B2-4) SERVICE WORKER
      if (pass) {
        navigator.serviceWorker.register("js-cam-sw.js")
        .then((reg) => { cam.init(1); })
        .catch((err) => {
          cam.err("Service worker init error - " + evt.message);
          console.error(err);
        });
      }

      // (B2-5) CACHE STORAGE FOR PICTURES
      if (pass) {
        caches.open(cam.cPics)
        .then((cache) => { cam.init(1); })
        .catch((err) => {
          cam.err("Failed to create cache storage.");
          console.error(err)
        });
      }

      // (B2-6) GET CAMERA PERMISSION
      if (pass) {
        navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => { cam.init(1); })
        .catch((err) => {
          cam.err("Please attach a webcam and give app permission.");
          console.error(err);
        });
      }
    }
  },

  // (C) START CAMERA LIVE FEED & ENABLE CONTROLS
  start : () => {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      cam.snapfeed = document.getElementById("cam-feed");
      cam.snapflash = document.getElementById("cam-flash");
      cam.snapfeed .srcObject = stream;
      document.getElementById("cam-pics").disabled = false;
      document.getElementById("cam-snap").disabled = false;
    })
    .catch((err) => {
      alert("OPPS. Error while initializing camera.")
      console.error(err);
    });
  },

  // (D) SNAP!
  snapfeed : null, // html video
  snapflash : null, // html flash
  snaptimer : null, // flash timer
  snap : () => {
    // (D1) FEEDBACK
    clearTimeout(cam.snaptimer);
    cam.snapflash.classList.add("show");
    cam.snaptimer = setTimeout(() => {
      cam.snapflash.classList.remove("show");
      clearTimeout(cam.snaptimer);
    }, 100);

    // (D2) CAPTURE VIDEO FRAME TO CANVAS
    let canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        vWidth = cam.snapfeed.videoWidth,
        vHeight = cam.snapfeed.videoHeight;
    canvas.width = vWidth;
    canvas.height = vHeight;
    ctx.drawImage(cam.snapfeed, 0, 0, vWidth, vHeight);

    // (D3) PICTURE TO CACHE STORAGE
    canvas.toBlob((imgBlob) => {
      let url = URL.createObjectURL(imgBlob);
      fetch(url).then((res) => {
        caches.open(cam.cPics).then(async (cache) => {
          // GET NEXT RUNNING NUMBER
          let i = 1;
          while (true) {
            let check = await cache.match("pic-"+i+".png");
            if (check) { i++; continue; }
            else { break; }
          }

          // SAVE IMAGE INTO CACHE
          cache.put("pic-"+i+".png", res);
          URL.revokeObjectURL(url);
        });
      });
    });
  }
};

var gallery = {
  // (A) LIST GALLERY
  list : () => {
    // (A1) GET TEMPLATE + WRAPPER
    let wrap = document.getElementById("gallery-pics"),
        template = document.getElementById("gallery-template").content;

    // (A2) DRAW IMAGES
    wrap.innerHTML = "";
    caches.open(cam.cPics).then((cache) => {
      cache.keys().then((keys) => {
        keys.forEach((req) => {
          let item = template.cloneNode(true);
          item.querySelector(".img").src = req.url;
          item.querySelector(".del").onclick = () => { gallery.del(req.url); };
          item.querySelector(".get").onclick = () => { gallery.get(req.url); };
          wrap.appendChild(item);
        });
      });
    });
  },

  // (B) DELETE AN IMAGE
  del : (pic) => { if (confirm("Delete image?")) {
    caches.open(cam.cPics).then((cache) => {
      cache.delete(pic).then((res) => {
        gallery.list();
        cb.info("Image deleted");
      });
    });
  }},

  // (C) DOWNLOAD AN IMAGE
  get : (pic) => {
    caches.match(pic)
    .then((res) => { return res.blob(); })
    .then((imgBlob) => {
      let a = document.createElement("a"),
      url = URL.createObjectURL(imgBlob);
      a.href = url;
      a.download = "pic.png";
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }
};
window.addEventListener("load", cam.init);
