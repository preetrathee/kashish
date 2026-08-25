"use strict";

/* =============================================================
   EASY CUSTOMIZATION
   Change funny NO button text + messages in the arrays below.
============================================================= */

const noButtonTexts = [
  "No 😏",
  "Are you sure? 👀",
  "Think again 😂",
  "Wrong button 😌",
  "Nice try 😜",
  "You can't escape 😂",
  "Really? 🥺",
  "Try again 😏",
  "Nope 😂",
  "Just press YES ❤️",
];

const noAttemptMessages = [
  "Hmm... 🤨",
  "Why are you chasing NO? 😂",
  "Bestie please 😭😂",
  "Accept your destiny ❤️😂",
  "The YES button is literally right there 👀❤️",
];

/* =============================================================
   ELEMENTS
============================================================= */

const sections = [...document.querySelectorAll(".story-section")];
const progressHearts = [...document.querySelectorAll(".progress-heart")];

const intro = document.getElementById("intro");
const question = document.getElementById("question");
const celebration = document.getElementById("celebration");
const planner = document.getElementById("planner");
const final = document.getElementById("final");

const openButton = document.getElementById("openButton");

const questionReveal = document.getElementById("questionReveal");
const buttonZone = document.getElementById("buttonZone");

const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const noMessage = document.getElementById("noMessage");

const planButton = document.getElementById("planButton");

const dateForm = document.getElementById("dateForm");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const noteInput = document.getElementById("noteInput");
const formMessage = document.getElementById("formMessage");

const finalDate = document.getElementById("finalDate");
const finalTime = document.getElementById("finalTime");
const finalNote = document.getElementById("finalNote");
const finalNoteRow = document.getElementById("finalNoteRow");

const heartsLayer = document.getElementById("heartsLayer");
const confettiLayer = document.getElementById("confettiLayer");

/* =============================================================
   STATE
============================================================= */

let noAttempts = 0;
let noMoveLocked = false;
let finalHeartTimer = null;

/* =============================================================
   PROGRESS INDICATOR
============================================================= */

function setProgress(step) {
  progressHearts.forEach((heart, index) => {
    const filled = index < step;

    heart.classList.toggle("is-filled", filled);
    heart.textContent = filled ? "❤️" : "○";
  });
}

/* =============================================================
   SECTION TRANSITION
============================================================= */

function showSection(target, progressStep) {
  sections.forEach((section) => {
    const active = section === target;

    section.classList.toggle("is-active", active);

    section.setAttribute(
      "aria-hidden",
      String(!active)
    );
  });

  setProgress(progressStep);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =============================================================
   SHOW QUESTION
============================================================= */

function showQuestion() {
  showSection(question, 2);

  questionReveal.classList.remove("is-visible");

  window.setTimeout(() => {
    questionReveal.classList.add("is-visible");

    resetNoButtonPosition();
  }, 620);
}

/* =============================================================
   RESET NO BUTTON
============================================================= */

function resetNoButtonPosition() {
  const zoneWidth = buttonZone.clientWidth;

  const mobile = zoneWidth < 520;

  noButton.style.left = mobile
    ? "72%"
    : "68%";

  noButton.style.top = "28px";
}

/* =============================================================
   CHECK BUTTON OVERLAP
============================================================= */

function rectsOverlap(a, b, margin = 10) {
  return !(
    a.right + margin < b.left ||
    a.left - margin > b.right ||
    a.bottom + margin < b.top ||
    a.top - margin > b.bottom
  );
}

/* =============================================================
   UPDATE FUNNY NO MESSAGE
============================================================= */

function updateNoAttemptUI() {
  const messageIndex = Math.min(
    noAttempts - 1,
    noAttemptMessages.length - 1
  );

  noMessage.textContent =
    noAttemptMessages[messageIndex];

  noMessage.classList.remove("pop");

  // Restart animation
  void noMessage.offsetWidth;

  noMessage.classList.add("pop");

  /*
    Change NO button text every second attempt.
  */
  if (noAttempts % 2 === 0) {
    const nextTextIndex = Math.floor(
      Math.random() * noButtonTexts.length
    );

    noButton.textContent =
      noButtonTexts[nextTextIndex];
  }

  /*
    Make YES button grow after
    repeated attempts to click NO.
  */
  if (noAttempts >= 3) {
    const scale = Math.min(
      1.34,
      1 + (noAttempts - 2) * 0.045
    );

    yesButton.style.setProperty(
      "--yes-scale",
      scale.toFixed(2)
    );
  }
}

/* =============================================================
   MOVE NO BUTTON
============================================================= */

function moveNoButton() {
  if (
    noMoveLocked ||
    !question.classList.contains("is-active")
  ) {
    return;
  }

  noMoveLocked = true;

  noAttempts += 1;

  updateNoAttemptUI();

  const zoneRect =
    buttonZone.getBoundingClientRect();

  const buttonRect =
    noButton.getBoundingClientRect();

  const yesRectViewport =
    yesButton.getBoundingClientRect();

  const padding = 10;

  const maxX = Math.max(
    padding,
    zoneRect.width -
      buttonRect.width -
      padding
  );

  const maxY = Math.max(
    padding,
    zoneRect.height -
      buttonRect.height -
      padding
  );

  /*
    Convert YES button position
    into buttonZone coordinates.
  */
  const yesRect = {
    left:
      yesRectViewport.left -
      zoneRect.left,

    top:
      yesRectViewport.top -
      zoneRect.top,

    right:
      yesRectViewport.right -
      zoneRect.left,

    bottom:
      yesRectViewport.bottom -
      zoneRect.top,
  };

  let chosenX = padding;
  let chosenY = Math.min(maxY, 110);

  let foundSafeSpot = false;

  /*
    Try multiple random positions
    until one doesn't overlap YES.
  */
  for (
    let attempt = 0;
    attempt < 32;
    attempt += 1
  ) {
    const x =
      padding +
      Math.random() *
        Math.max(
          1,
          maxX - padding
        );

    const y =
      padding +
      Math.random() *
        Math.max(
          1,
          maxY - padding
        );

    const candidate = {
      left: x,
      top: y,
      right: x + buttonRect.width,
      bottom: y + buttonRect.height,
    };

    if (
      !rectsOverlap(
        candidate,
        yesRect,
        16
      )
    ) {
      chosenX = x;
      chosenY = y;

      foundSafeSpot = true;

      break;
    }
  }

  /*
    Fallback position.
  */
  if (!foundSafeSpot) {
    chosenX =
      zoneRect.width -
      buttonRect.width -
      padding;

    chosenY =
      zoneRect.height -
      buttonRect.height -
      padding;
  }

  noButton.style.left =
    `${chosenX}px`;

  noButton.style.top =
    `${chosenY}px`;

  noButton.style.transform =
    "translateX(0)";

  /*
    Small lock prevents multiple
    events firing immediately.
  */
  window.setTimeout(() => {
    noMoveLocked = false;
  }, 170);
}

/* =============================================================
   MOVE NO WHEN MOUSE GETS CLOSE
============================================================= */

function handlePointerNearNo(event) {
  /*
    On touch screens we use
    pointerdown instead.
  */
  if (
    noMoveLocked ||
    event.pointerType === "touch"
  ) {
    return;
  }

  const rect =
    noButton.getBoundingClientRect();

  const centerX =
    rect.left +
    rect.width / 2;

  const centerY =
    rect.top +
    rect.height / 2;

  const distance = Math.hypot(
    event.clientX - centerX,
    event.clientY - centerY
  );

  if (distance < 88) {
    moveNoButton();
  }
}

/* =============================================================
   FLOATING HEART
============================================================= */

function createHeart(options = {}) {
  const heart =
    document.createElement("span");

  const hearts = [
    "❤️",
    "💗",
    "💕",
    "💖",
  ];

  const duration =
    options.duration ??
    3.8 +
      Math.random() * 2.6;

  const left =
    options.left ??
    Math.random() * 100;

  const size =
    options.size ??
    14 +
      Math.random() * 18;

  const drift =
    -40 +
    Math.random() * 80;

  const rotate =
    -30 +
    Math.random() * 60;

  heart.className =
    "floating-heart";

  heart.textContent =
    hearts[
      Math.floor(
        Math.random() *
          hearts.length
      )
    ];

  heart.style.left =
    `${left}%`;

  heart.style.fontSize =
    `${size}px`;

  heart.style.setProperty(
    "--heart-duration",
    `${duration}s`
  );

  heart.style.setProperty(
    "--heart-drift",
    `${drift}px`
  );

  heart.style.setProperty(
    "--heart-rotate",
    `${rotate}deg`
  );

  heartsLayer.appendChild(heart);

  window.setTimeout(() => {
    heart.remove();
  }, duration * 1000 + 250);
}

/* =============================================================
   CONFETTI
============================================================= */

function createConfetti(count = 70) {
  const palette = [
    "#c95f70",
    "#eaa6ae",
    "#c6a15b",
    "#f7d9dc",
    "#9e4354",
    "#fffaf2",
  ];

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const piece =
      document.createElement("span");

    const duration =
      1.9 +
      Math.random() * 1.5;

    const drift =
      -100 +
      Math.random() * 200;

    const rotate =
      220 +
      Math.random() * 720;

    piece.className =
      "confetti-piece";

    piece.style.left =
      `${Math.random() * 100}%`;

    piece.style.width =
      `${6 + Math.random() * 7}px`;

    piece.style.height =
      `${8 + Math.random() * 10}px`;

    piece.style.setProperty(
      "--confetti-color",
      palette[
        index %
          palette.length
      ]
    );

    piece.style.setProperty(
      "--confetti-duration",
      `${duration}s`
    );

    piece.style.setProperty(
      "--confetti-drift",
      `${drift}px`
    );

    piece.style.setProperty(
      "--confetti-rotate",
      `${rotate}deg`
    );

    confettiLayer.appendChild(
      piece
    );

    window.setTimeout(() => {
      piece.remove();
    }, duration * 1000 + 250);
  }
}

/* =============================================================
   YES CLICK
============================================================= */

function handleYes() {
  showSection(
    celebration,
    3
  );

  createConfetti(82);

  for (
    let index = 0;
    index < 22;
    index += 1
  ) {
    window.setTimeout(() => {
      createHeart({
        duration:
          3.1 +
          Math.random() * 1.7,
      });
    }, index * 85);
  }
}

/* =============================================================
   SHOW DATE PLANNER
============================================================= */

function showDatePlanner() {
  showSection(
    planner,
    3
  );

  setDateMinimum();

  window.setTimeout(() => {
    dateInput.focus({
      preventScroll: true,
    });
  }, 400);
}

/* =============================================================
   GET TODAY AS YYYY-MM-DD
============================================================= */

function getTodayLocalISO() {
  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =============================================================
   PREVENT PAST DATES
============================================================= */

function setDateMinimum() {
  dateInput.min =
    getTodayLocalISO();
}

/* =============================================================
   FORMAT DATE
============================================================= */

function formatSelectedDate(value) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const localDate =
    new Date(
      year,
      month - 1,
      day
    );

  return new Intl.DateTimeFormat(
    undefined,
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(localDate);
}

/* =============================================================
   FORMAT TIME
============================================================= */

function formatSelectedTime(value) {
  const [
    hours,
    minutes,
  ] = value
    .split(":")
    .map(Number);

  const localTime =
    new Date();

  localTime.setHours(
    hours,
    minutes,
    0,
    0
  );

  return new Intl.DateTimeFormat(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(localTime);
}

/* =============================================================
   CONFIRM DATE
============================================================= */

function confirmDate(event) {
  event.preventDefault();

  formMessage.textContent = "";

  const dateValue =
    dateInput.value;

  const timeValue =
    timeInput.value;

  const noteValue =
    noteInput.value.trim();

  const today =
    getTodayLocalISO();

  /*
    Date/time validation
  */
  if (
    !dateValue ||
    !timeValue
  ) {
    formMessage.textContent =
      "Pick both a date and a time first, bestie 👀❤️";

    return;
  }

  /*
    Prevent manually entering
    an old date.
  */
  if (dateValue < today) {
    formMessage.textContent =
      "Time travel is cute, but please choose today or a future date 😂";

    dateInput.focus();

    return;
  }

  /*
    Add selected values
    to final screen.
  */
  finalDate.textContent =
    formatSelectedDate(
      dateValue
    );

  finalTime.textContent =
    formatSelectedTime(
      timeValue
    );

  /*
    Optional note.
  */
  if (noteValue) {
    finalNote.textContent =
      noteValue;

    finalNoteRow.classList.remove(
      "is-hidden"
    );
  } else {
    finalNote.textContent = "";

    finalNoteRow.classList.add(
      "is-hidden"
    );
  }

  showSection(
    final,
    4
  );

  createConfetti(46);

  startFinalHearts();
}

/* =============================================================
   HEARTS ON FINAL SCREEN
============================================================= */

function startFinalHearts() {
  if (finalHeartTimer) {
    window.clearInterval(
      finalHeartTimer
    );
  }

  /*
    Initial hearts
  */
  for (
    let index = 0;
    index < 10;
    index += 1
  ) {
    window.setTimeout(() => {
      createHeart({
        duration:
          4.6 +
          Math.random() * 1.5,
      });
    }, index * 110);
  }

  /*
    Keep creating hearts
    while final page is visible.
  */
  finalHeartTimer =
    window.setInterval(() => {
      if (
        !final.classList.contains(
          "is-active"
        )
      ) {
        window.clearInterval(
          finalHeartTimer
        );

        finalHeartTimer = null;

        return;
      }

      createHeart({
        duration:
          5.2 +
          Math.random() * 1.2,

        size:
          13 +
          Math.random() * 12,
      });
    }, 650);
}

/* =============================================================
   BUTTON EVENTS
============================================================= */

openButton.addEventListener(
  "click",
  showQuestion
);

yesButton.addEventListener(
  "click",
  handleYes
);

planButton.addEventListener(
  "click",
  showDatePlanner
);

dateForm.addEventListener(
  "submit",
  confirmDate
);

/* =============================================================
   NO BUTTON EVENTS
============================================================= */

/*
  Desktop:
  Move when mouse gets near NO.
*/
buttonZone.addEventListener(
  "pointermove",
  handlePointerNearNo
);

/*
  Desktop:
  Move immediately when
  pointer enters the button.
*/
noButton.addEventListener(
  "pointerenter",
  moveNoButton
);

/*
  Mobile + desktop:
  Move before a tap/click
  can complete.
*/
noButton.addEventListener(
  "pointerdown",
  (event) => {
    event.preventDefault();

    moveNoButton();
  }
);

/*
  Extra protection in case
  click is triggered.
*/
noButton.addEventListener(
  "click",
  (event) => {
    event.preventDefault();

    moveNoButton();
  }
);

/* =============================================================
   WINDOW RESIZE
============================================================= */

window.addEventListener(
  "resize",
  () => {
    if (
      question.classList.contains(
        "is-active"
      )
    ) {
      resetNoButtonPosition();
    }
  }
);

/* =============================================================
   PHOTO CLICK / ZOOM
============================================================= */

document
  .querySelectorAll(
    ".photo-collage .polaroid"
  )
  .forEach((photo) => {
    photo.addEventListener(
      "click",
      () => {
        const wasZoomed =
          photo.classList.contains(
            "is-zoomed"
          );

        document
          .querySelectorAll(
            ".photo-collage .polaroid"
          )
          .forEach((item) =>
            item.classList.remove(
              "is-zoomed"
            )
          );

        if (!wasZoomed) {
          photo.classList.add(
            "is-zoomed"
          );
        }
      }
    );
  });

/* =============================================================
   INITIAL SETUP
============================================================= */

setDateMinimum();
setProgress(1);