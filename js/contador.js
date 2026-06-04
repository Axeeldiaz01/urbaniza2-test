document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counter");

  const startCounter = (counter) => {
    const target = parseInt(counter.dataset.target);
    let count = 0;
    const increment = target / 120;

    const updateCounter = () => {
      count += increment;

      if (count < target) {
        counter.textContent = Math.floor(count);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };

    updateCounter();
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(startCounter);
        observer.disconnect();
      }
    });
  }, {
    threshold: 0.3
  });

  const section = document.querySelector(".nosotros-features");

  if (section) {
    observer.observe(section);
  }
});