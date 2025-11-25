// Main grid container
const grid = document.getElementById("grid");
// Select individual puzzle pieces
const containers = document.querySelectorAll(".grid__container");
// Initial starting layout
const startHTML = grid.innerHTML;

// Allow elements to be dragged
document.querySelectorAll(".grid__element").forEach(el => {
  el.draggable = true;
  // When the user starts dragging a piece
  el.addEventListener("dragstart", e => {
    // Store the index of the parent so we know which position it came from
    e.dataTransfer.setData("text/plain", e.target.closest(".grid__container").dataset.index);
  });
});

// Assigns a unique index number to each container
containers.forEach((container, i) => {
  container.dataset.index = i;
  // Allow dragging over itself
  container.addEventListener("dragover", e => e.preventDefault());
  // Handle when element is dropped over itself
  container.addEventListener("drop", e => {
    e.preventDefault();
    // Get the index of the container it was dragged from
    const fromIndex = e.dataTransfer.getData("text/plain");
    // Reference the original container (the source)
    const from = containers[fromIndex];
    // Reference to the current container (the target)
    const to = e.currentTarget;
    // If they are the same, do nothing
    if (from === to) return;

    // Swap the elements between the 2 containers
    const fromChild = from.firstElementChild;
    const toChild = to.firstElementChild;
    from.replaceChildren(toChild);
    to.replaceChildren(fromChild);
  });
});
// Reset button to reset the intial layout
document.getElementById("reset").addEventListener("click", () => {
  grid.innerHTML = startHTML;
  location.reload(); 
});
