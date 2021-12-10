var jsc = {
  // (A) GLOBAL SUPPORT FUNCTION - GENERATE HTML ERROR MESSAGE
  err : (msg) => {
    let row = document.createElement("div");
    row.innerHTML = msg;
    row.className = "err";
    document.body.prepend(row);
  },

  // (B) TOGGLE BETWEEN "C"AMERA & "G"ALLERY SCREEN
  toggle : (screen) => {
    let cam = document.getElementById("jcam"),
        gal = document.getElementById("jgal");
    if (screen=="C") {
      gal.classList.add("ninja");
      cam.classList.remove("ninja");
    } else if (screen=="G") {
      cam.classList.add("ninja");
      gal.classList.remove("ninja");
    } else {
      cam.classList.add("ninja");
      gal.classList.add("ninja");
    }
  },

  // (C) INIT PART 1 - REQUIREMENTS CHECK
  iniA : () => {
    // (C1) REQUIREMENTS INIT
    let pass = true;

    // (C2) REQUIREMENT - MEDIA DEVICES
    if (!"mediaDevices" in navigator) {
      jsc.err("Your browser does not support media devices.");
      pass = false;
    }

    // (C3) REQUIREMENT - SERVICE WORKER
    if (!"serviceWorker" in navigator) {
      jsc.err("Your browser does not support service workers.");
      pass = false;
    }

    // (C4) REQUIREMENT - CACHE STORAGE
    if (!caches) {
      jsc.err("Your browser does not support cache storage.");
      pass = false;
    }

    // (C5) NO GO
    if (!pass) { return; }

    // (C6) OK - NEXT INIT
    jsc.iniB();
  },

  // (D) INIT PART 2 - SERVICE WORKER + CACHE + CAM ACCESS
  cPics : "MyPics", // CACHE FOR PICTURES
  iniB : () => {
    // (D1) SERVICE WORKER
    navigator.serviceWorker.register("js-cam-sw.js")
    .then((reg) => { jsc.iniC(); })
    .catch((err) => {
      jsc.err("Service worker init error - " + evt.message);
      console.error(err);
    });

    // (D2) CACHE STORAGE FOR PICTURES
    caches.open(jsc.cPics)
    .then((cache) => { jsc.iniC(); })
    .catch((err) => {
      jsc.err("Failed to create cache storage.");
      console.error(err)
    });

    // (D3) GET CAMERA PERMISSION
    navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      document.getElementById("jcamVid").srcObject = stream;
      jsc.iniC();
    })
    .catch((err) => {
      jsc.err("Please attach a webcam and give app permission.");
      console.error(err);
    });
  },

  // (E) INIT PART 3 - ENABLE HTML INTERFACE
  ready : 0, // NUMBER OF READY COMPONENTS
  iniC : () => { jsc.ready++; if (jsc.ready==3) {
    // (E1) TAKE PICTURE
    let btn = document.getElementById("jcamSnap");
    btn.onclick = jsc.snap;
    btn.disabled = false;

    // (E2) SHOW GALLERY
    btn = document.getElementById("jcamPics");
    btn.onclick = jsc.list;
    btn.disabled = false;

    // (E3) BACK TO CAMERA
    btn = document.getElementById("jgalHBack");
    btn.onclick = () => { jsc.toggle("C"); };
    btn.disabled = false;

    // (E4) ALL GOOD
    jsc.toggle("C");
  }},

  // (F) SUPPORT - SNAPSHOT FEEDBACK
  snaptime : null,
  snapped : (on) => {
    let snapped = document.getElementById("jcamSnapped");
    if (on) {
      clearTimeout(jsc.snaptime);
      snapped.classList.remove("ninja");
      jsc.snaptime = setTimeout(jsc.snapped, 100);
    } else {
      snapped.classList.add("ninja");
      jsc.snaptime = null;
    }
  },

  // (G) TAKE A PICTURE
  snap : () => {
    // (G1) SNAP FEEDBACK
    jsc.snapped(1);

    // (G2) CAPTURE VIDEO FRAME TO CANVAS
    let vid = document.getElementById("jcamVid"),
        canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        vWidth = vid.videoWidth,
        vHeight = vid.videoHeight;
    canvas.width = vWidth;
    canvas.height = vHeight;
    ctx.drawImage(vid, 0, 0, vWidth, vHeight);

    // (G3) PICTURE TO CACHE STORAGE
    canvas.toBlob((imgBlob) => {
      let url = URL.createObjectURL(imgBlob);
      fetch(url).then((res) => {
        caches.open(jsc.cPics).then(async (cache) => {
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
  },

  // (H) LIST GALLERY
  list : () => {
    // (H1) SWITCH TO GALLERY SCREEN
    let wrap = document.getElementById("jgalWrap");
    wrap.innerHTML = "";
    jsc.toggle("G");

    // (H2) DRAW IMAGES
    let pic, img, btn, del, dl;
    caches.open(jsc.cPics).then((cache) => {
      cache.keys().then((keys) => {
        keys.forEach((req) => {
          pic = document.createElement("div");
          img = document.createElement("img");
          btn = document.createElement("div");
          del = document.createElement("button");
          dl = document.createElement("button");

          pic.className = "pic";
          btn.className = "btn";
          img.src = req.url;
          del.innerHTML = "<span class='mi'>delete</span>";
          dl.innerHTML = "<span class='mi'>file_download</span>";
          del.onclick = () => { jsc.del(req.url); };
          dl.onclick = () => { jsc.get(req.url); };

          btn.appendChild(del);
          btn.appendChild(dl);
          pic.appendChild(img);
          pic.appendChild(btn);
          wrap.appendChild(pic);
        });
      });
    });
  },

  // (I) DELETE AN IMAGE
  del : (pic, go) => {
    if (go) {
      caches.open(jsc.cPics).then((cache) => {
        cache.delete(pic).then((res) => {
          jsc.list();
        });
      })
    } else { if (confirm("Delete image?")) {
      jsc.del(pic, 1);
    }}
  },

  // (J) DOWNLOAD AN IMAGE
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
window.addEventListener("load", jsc.iniA);
