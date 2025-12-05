// ---------- Puzzle drag-and-drop (single-temp hover swap) ----------
const grid = document.getElementById("grid");
if (grid) {
  const containers = Array.from(document.querySelectorAll(".grid__container"));
  const startHTML = grid.innerHTML;

  // Everything draggable
  document.querySelectorAll(".grid__element").forEach(el => (el.draggable = true));

  let sourceIdx = -1;   // where the drag started
  let tempIdx = -1;     // current temporary swap target (if any)
  let dropped = false;  // did we finalize a drop?

  function swap(aIdx, bIdx) {
  if (aIdx === -1 || bIdx === -1 || aIdx === bIdx) return;

  const a = containers[aIdx];
  const b = containers[bIdx];
  const aChild = a.firstElementChild;
  const bChild = b.firstElementChild;
  if (!aChild || !bChild) return;

  // 1) FIRST: measure current positions
  const aFirst = aChild.getBoundingClientRect();
  const bFirst = bChild.getBoundingClientRect();

  // 2) DOM change (swap)
  a.replaceChildren(bChild);
  b.replaceChildren(aChild);

  // 3) LAST: measure new positions
  const aLast = b.firstElementChild.getBoundingClientRect(); // aChild is now in b
  const bLast = a.firstElementChild.getBoundingClientRect(); // bChild is now in a

  // The nodes have swapped places; figure out deltas from where they WERE
  const aDeltaX = aFirst.left - aLast.left;
  const aDeltaY = aFirst.top  - aLast.top;
  const bDeltaX = bFirst.left - bLast.left;
  const bDeltaY = bFirst.top  - bLast.top;

  // 4) INVERT: move elements back to where they came from (visually)
  const newA = b.firstElementChild; // aChild's new node reference
  const newB = a.firstElementChild; // bChild's new node reference

  // Set the inverted transform immediately (no transition yet)
  newA.style.transform = `translate(${aDeltaX}px, ${aDeltaY}px)`;
  newB.style.transform = `translate(${bDeltaX}px, ${bDeltaY}px)`;

  // Force reflow so the browser applies the transform before we animate it to 0
  // (reading offsetHeight is a common trick to flush the style)
  void newA.offsetHeight;

  // 5) PLAY: animate back to identity
  newA.classList.add('animating');
  newB.classList.add('animating');
  newA.style.transform = '';
  newB.style.transform = '';

  // Clean up after transition
  const onDone = (e) => {
    e.target.classList.remove('animating');
    e.target.removeEventListener('transitionend', onDone);
  };
  newA.addEventListener('transitionend', onDone);
  newB.addEventListener('transitionend', onDone);
}


  // Start drag: remember the start slot
  grid.addEventListener("dragstart", (e) => {
    const piece = e.target.closest(".grid__element");
    if (!piece) return;
    const slot = piece.closest(".grid__container");
    sourceIdx = containers.indexOf(slot);
    tempIdx = -1;
    dropped = false;

    // Required for some browsers
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
    piece.classList.add("is-dragging");
  });

  // Hovering over slots
  containers.forEach((container, overIdx) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    container.addEventListener("dragenter", (e) => {
      e.preventDefault();
      if (sourceIdx === -1) return;

      // If we returned to the original slot, revert any temp swap
      if (overIdx === sourceIdx) {
        if (tempIdx !== -1) {
          swap(sourceIdx, tempIdx); // put things back
          tempIdx = -1;
        }
        return;
      }

      // If we moved to a new slot, revert previous temp swap first
      if (tempIdx !== -1 && tempIdx !== overIdx) {
        swap(sourceIdx, tempIdx); // undo previous temp
        tempIdx = -1;
      }

      // If this slot isn't already the current temp, make a new temp swap
      if (tempIdx !== overIdx) {
        swap(sourceIdx, overIdx); // swap start <-> hover
        tempIdx = overIdx;
      }
    });

    // We handle the swap on enter; keep drop minimal
    container.addEventListener("drop", (e) => {
      e.preventDefault();
      dropped = true;
      // Finalize: if we have a temp swap, that becomes the new home
      if (tempIdx !== -1) {
        sourceIdx = tempIdx;
        tempIdx = -1;
      }
    });
  });

  // End drag: if no drop happened and a temp swap exists, revert it
  grid.addEventListener("dragend", () => {
    document.querySelectorAll(".is-dragging").forEach(n => n.classList.remove("is-dragging"));
    if (!dropped && tempIdx !== -1) {
      swap(sourceIdx, tempIdx); // revert preview
      tempIdx = -1;
    }
    sourceIdx = -1;
    dropped = false;
  });

  // Reset button: rebuild DOM and listeners the simple way
  const resetBtn = document.getElementById("reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      grid.innerHTML = startHTML;
      location.reload();
    });
  }
}


// ---------- Sidebar clocks (Local AM/PM + UTC 24h) ----------
function initClocks() {
  const elLocal = document.getElementById('local-time');
  const elUTC = document.getElementById('utc-time');
  if (!elLocal || !elUTC) return;

  function tick() {
    const now = new Date();

    elLocal.textContent = now.toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });

    const hh = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    const ss = String(now.getUTCSeconds()).padStart(2, '0');
    elUTC.textContent = `${hh}:${mm}:${ss}`;
  }

  tick();
  setInterval(tick, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClocks);
} else {
  initClocks();
}
