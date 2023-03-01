
// ////////////////////////////
// UNLOCK VIDEO COMPONENT
// ////////////////////////////
//
// note: to unlock a video with this component
// 1. have it present in DOM before aframe initializes
// 2. let it have the class "unlock-me"
// 3. must also have a unique ID
//
// This component grabs all videos with class "unlock-me"
// and attempts to free them from the user gesture requirement
// It does this by setting listeners on the canvas for all events iOS listeners
// (except for touchend, which can problematically duplicate click) that are valid
// events to count as a user gesture that can play video with audio.
// Any time one of those events fire, the listener will try to unlock all the videos.
// to clarify: unlock here means play, and then immediately pause, the video.
// (an unlocked video can then be played/paused, with audio, from JS without gestures from then on.)
// If any video fails to unlock, the listeners will remain and try again on future events.
// Once all videos unlock, it will politely remove all of its unlocking event listeners.
// This component exposes promises for each video that resolve once they are unlocked;
// it also exposes a boolean value that is set to true when all videos unlock.
// see properties at bottom of component.
// to access these, you can use a selector like this:
// document.querySelector('[unlock-video]').components['unlock-video'].allUnlocked
// document.querySelector('[unlock-video]').components['unlock-video']['video-id'].then(() => {
//   document.querySelector('#video-id').play() 
// })
//

AFRAME.registerComponent('unlock-video', {
  // these are all the events iOS will accept as valid unlock events, apparently -_-
  // note that touchend only counts if it was a click, not a swipe, apparently. yes, fr.
  unlockEvents: [
    // "touchend", 
    // removing touchend, because a valid touchend would fire a click anyways
    // leaving it in just causes doubling on click/touchend
    "click", "doubleclick", "keydown"
  ],

  init() {
    const allVideos = [...document.querySelectorAll('.unlock-me')];
    allVideos.forEach(vid => {
      this.unlocked[vid.id] = false;
      this.promises[vid.id] = new Promise((resolve, reject) => {
        this.resolvers[vid.id] = resolve;
        this.rejectors[vid.id] = reject;
      });
      this.allPromises.push(this.promises[vid.id]);
    });

    Promise.all(this.allPromises).then(() => {
      console.log("all unlocked!");
      this.allUnlocked = true;
      this.removeUnlockListeners()
    }).catch(e => {
      console.error("unlocking error! :(", e)
    })

    this.setupVideoClick = evt => { 
      console.log("attempt unlock");
      allVideos.forEach((video) => {
        if (this.unlocked[video.id]) {
          // added this to try to prevent double unlocking, but logs seem to indicate this still happens
          // weird
          console.log(`attempt to re-unlock an already unlocked video ${video.id}, skipping`, evt);
          return;
        }
        const playPromise = video.play();
        playPromise.then(() => {
          console.log(`unlock play success for <${video.id}>`, playPromise, evt)
          this.unlocked[video.id] = true;
          this.resolvers[video.id]();
          video.pause();
        }).catch((e) => {
          // I do worry about the situation where we fail to unlock,
          // (like maybe a synthetic click?)
          // but then succeed on a second event...

          // so, as a result, I think we'll not reject here, because we will keep trying
          // so it isn't truly finished, and they should keep waiting
          // this.rejectors[video.id]();
          console.error(`unlock play fail for <${video.id}>, will try again on future events`, e, playPromise, evt)
        })
      });
    };

    this.unlockEvents.forEach(eventName => {
      AFRAME.scenes[0].canvas.addEventListener(eventName, this.setupVideoClick);
    })

    // aaaand, we run this here once--this should work in more permissive, non-iOS-safari browsers:
    this.setupVideoClick({});
  },

  removeUnlockListeners() {
    // just covering our bases here, don't recall which one works
    // only one is necessary, feel free to narrow it down yourself and/or read MDN
    this.unlockEvents.forEach(eventName => {
      AFRAME.scenes[0].canvas.removeEventListener(eventName, this.setupVideoClick);
      AFRAME.scenes[0].canvas.removeEventListener(eventName, this.setupVideoClick, true);
      AFRAME.scenes[0].canvas.removeEventListener(eventName, this.setupVideoClick, false);
    })
  },

  resolvers: {},
  rejectors: {},
  promises: {},
  unlocked: {},
  allPromises: [],
  allUnlocked: false,
})
