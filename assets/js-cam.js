var cam = {
  // (A) INIT APP
  cache : null,  // pictures cache storage
  aClick : null, // click sound
  hViews : null, // html screens - [main, gallery, about]
  hFeed : null,  // html video tag
  hFlash : null, // html flash screen effect
  hTimer : null, // html flash screen effect timer
  init : async () => {
    // (A1) REQUIREMENTS CHECK - MEDIA DEVICES
    if (!"mediaDevices" in navigator) {
      alert("Your browser does not support media devices API.");
      return;
    }

    // (A2) REQUIREMENTS CHECK - CACHE STORAGE
    if (!"caches" in window) {
      alert("Your browser does not support cache storage.");
      return;
    }

    // (A3) REQUIREMENTS CHECK - SERVICE WORKER
    if (!"serviceWorker" in navigator) {
      alert("Your browser does not support service workers.");
      return;
    }

    // (A4) CREATE CACHE STORAGE FOR PICTURES
    cam.cache = await caches.open("MyPics");

    // (A5) REGISTER SERVICE WORKER
    try {
      await navigator.serviceWorker.register("CB-worker.js");
    } catch (err) {
      alert("Error registering service worker");
      console.error(err);
    }

    // (A6) GET CAMERA PERMISSION + START APP
    navigator.serviceWorker.ready.then(reg => {
      navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        // (A6-1) CAMERA CLICK SOUND
        // https://freesound.org/people/kwahmah_02/sounds/260138/
        cam.aClick = new Audio("assets/click.mp3");
  
        // (A6-2) GET HTML + ENABLE CONTROLS
        cam.hViews = [
          document.getElementById("camWrap"),
          document.getElementById("galWrap"),
          document.getElementById("aboutWrap")
        ];
        cam.hFeed = document.getElementById("camFeed");
        cam.hFlash = document.getElementById("camFlash");
        gallery.hPics = document.getElementById("galPics");
        gallery.hTemplate = document.getElementById("galTemplate").content;
        cam.hFeed.srcObject = stream;
        document.getElementById("btnPics").disabled = false;
        document.getElementById("btnSnap").disabled = false;
      })
      .catch(err => {
        alert("Error initializing camera.")
        console.error(err);
      });
    });
  },

  // (B) TAKE A SNAPSHOT
  snap : () => {
    // (B1) FEEDBACK
    if (!cam.aClick.ended) {
      cam.aClick.pause();
      cam.aClick.currentTime = 0;
    }
    cam.aClick.play();
    clearTimeout(cam.hTimer);
    cam.hFlash.classList.add("show");
    cam.hTimer = setTimeout(() => {
      cam.hFlash.classList.remove("show");
      clearTimeout(cam.hTimer);
    }, 100);

    // (B2) CAPTURE VIDEO FRAME TO CANVAS
    let canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        vw = cam.hFeed.videoWidth,
        vh = cam.hFeed.videoHeight;
    canvas.width = vw;
    canvas.height = vh;
    ctx.drawImage(cam.hFeed, 0, 0, vw, vh);

    // (B3) CANVAS TO CACHE STORAGE
    canvas.toBlob(blob => {
      let url = URL.createObjectURL(blob);
      fetch(url).then(async (res) => {
        // (B3-1) GET NEXT RUNNING NUMBER
        let i = 1;
        while (true) {
          let check = await cam.cache.match("pic-"+i+".png");
          if (check) { i++; continue; }
          else { break; }
        }

        // (B3-2) SAVE IMAGE INTO CACHE
        cam.cache.put("pic-"+i+".png", res);
        URL.revokeObjectURL(url);
      });
    });
  },

  // (C) SWITCH BETWEEN PAGES
  // 0 = main, 1 = gallery, 2 = about
  view : n => {
    for (let [i,v] of Object.entries(cam.hViews)) {
      if (i==n) { v.classList.remove("hide"); }
      else { v.classList.add("hide"); }
    }
    if (n==1) { gallery.list(); }
  }
};
window.addEventListener("load", cam.init);