const grid = document.getElementById("grid");
const containers = document.querySelectorAll(".grid__container");
const startHTML = grid.innerHTML;

// allow elements to be dragged
document.querySelectorAll(".grid__element").forEach(el => {
  el.draggable = true;

  el.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", e.target.closest(".grid__container").dataset.index);
  });
});

containers.forEach((container, i) => {
  container.dataset.index = i;

  container.addEventListener("dragover", e => e.preventDefault());

  container.addEventListener("drop", e => {
    e.preventDefault();
    const fromIndex = e.dataTransfer.getData("text/plain");
    const from = containers[fromIndex];
    const to = e.currentTarget;
    if (from === to) return;

    // swap children
    const fromChild = from.firstElementChild;
    const toChild = to.firstElementChild;
    from.replaceChildren(toChild);
    to.replaceChildren(fromChild);
  });
});

document.getElementById("reset").addEventListener("click", () => {
  grid.innerHTML = startHTML;
  location.reload(); // easiest way to reset
});
