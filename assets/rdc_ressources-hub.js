/**
 * Ressources Hub functionality
 * Handles riddle validation and overlay transition
 */

function initRessourcesHub(hubElement, correctAnswer) {
  // Get section ID to find the corresponding overlay
  const sectionId = hubElement.getAttribute("data-section-id");

  // DOM elements
  const overlay = document.getElementById(`overlay-${sectionId}`);
  const content = hubElement.querySelector("[data-content]");
  const input = overlay.querySelector("[data-input]");
  const submitButton = overlay.querySelector("[data-submit-button]");
  const errorMessage = overlay.querySelector("[data-error-message]");
  const hintButton = overlay.querySelector("[data-hint-button]");
  const riddleHint = overlay.querySelector("[data-riddle-hint]");

  // Check if user has already solved the riddle
  const storageKey = `ressources_hub_${hubElement.getAttribute("data-id")}_solved`;
  const hasAccessGranted = sessionStorage.getItem(storageKey) === "true";

  if (hasAccessGranted) {
    // Skip overlay if already solved
    showContent();
  }

  // Event listeners
  if (submitButton) {
    submitButton.addEventListener("click", validateAnswer);
  }

  if (input) {
    input.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        validateAnswer();
      }
    });
  }

  if (hintButton && riddleHint) {
    hintButton.addEventListener("click", function () {
      riddleHint.classList.add("visible");
      hintButton.style.display = "none";
    });
  }

  /**
   * Validates the answer against the correct answer
   */
  function validateAnswer() {
    const userAnswer = input.value.trim();

    if (userAnswer === "") {
      showError("Veuillez entrer une réponse");
      return;
    }

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      // Store in session that user has solved the riddle
      sessionStorage.setItem(storageKey, "true");
      showContent();
    } else {
      showError("Réponse incorrecte, essayez encore");
      input.value = "";
      input.focus();

      // Add shake animation to input
      input.classList.add("shake");
      setTimeout(() => {
        input.classList.remove("shake");
      }, 500);
    }
  }

  /**
   * Shows error message
   */
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.opacity = 1;

    // Hide error message after 3 seconds
    setTimeout(() => {
      errorMessage.style.opacity = 0;
    }, 3000);
  }

  /**
   * Supprime l'overlay sans afficher de contenu
   */
  function showContent() {
    // Add transition class to hide overlay
    overlay.classList.add("hidden");

    // After transition completes, remove overlay from DOM completely
    setTimeout(() => {
      overlay.remove(); // Supprime complètement l'overlay du DOM
    }, 1200); // Match the transition duration in CSS (1.2s)
  }

  /**
   * Adds CSS for animations not included in the CSS file
   */
  function addDynamicStyles() {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(styleElement);
  }

  // Initialize dynamic styles
  addDynamicStyles();
}