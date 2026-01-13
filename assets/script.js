function showNotification(title, message, type = "error", duration = 6000) {
  const notification = document.getElementById("notification");
  const notificationTitle = document.getElementById("notification-title");
  const notificationMessage = document.getElementById("notification-message");

  notificationTitle.textContent = title;
  notificationMessage.textContent = message;

  notification.className = "notification hidden bg-dark-800 text-gray-200 p-4 rounded-lg shadow-lg";
  if (type === "error") {
    notification.classList.add("border-l-4", "border-red-500");
    notification.querySelector("i").className = "fas fa-exclamation-circle text-red-400 text-xl";
  } else if (type === "success") {
    notification.classList.add("border-l-4", "border-green-500");
    notification.querySelector("i").className = "fas fa-check-circle text-green-400 text-xl";
  }

  notification.classList.remove("hidden");
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(hideNotification, duration);
}

function hideNotification() {
  const notification = document.getElementById("notification");
  notification.classList.remove("show");
  setTimeout(() => {
    notification.classList.add("hidden");
  }, 300);
}

const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");

mobileMenuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
  mobileMenu.classList.toggle("active");
  mobileMenuButton.innerHTML = mobileMenu.classList.contains("hidden") ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
});

const faqButtons = document.querySelectorAll(".faq-btn");

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = button.nextElementSibling;
    const icon = button.querySelector(".fa-chevron-down");

    document.querySelectorAll(".faq-content").forEach((item) => {
      if (item !== content && !item.classList.contains("hidden")) {
        item.classList.add("hidden");
        item.previousElementSibling.querySelector(".fa-chevron-down").classList.remove("rotate-180");
      }
    });

    content.classList.toggle("hidden");
    icon.classList.toggle("rotate-180");
  });
});

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsContainer");
const resultsList = document.getElementById("resultsList");

searchBtn.addEventListener("click", async () => {
  const searchValue = searchInput.value.trim();

  resultsList.innerHTML = "";
  resultsContainer.classList.add("hidden");

  let query = searchValue;
  let isSim = false;
  let isCnic = false;

  if (searchValue.length === 11 && searchValue.startsWith("0")) {
    isSim = true;
    query = searchValue.substring(1);
  } else if (searchValue.length === 10 && !isNaN(searchValue)) {
    isSim = true;
  } else if (searchValue.length === 13 && !isNaN(searchValue)) {
    isCnic = true;
  } else {
    showNotification("Invalid Input", "Please provide a valid 10/11-digit SIM or 13-digit CNIC number.");
    return;
  }

  const originalBtnText = searchBtn.innerHTML;
  searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Searching...';
  searchBtn.disabled = true;

  const paid_api_key = "49d32e2308c704f3fa"; // replace this apikey with your paid apikey
  const free_api_key = "free_key@maher_apis";
  const whatsapp_contact_link = "https://whatsapp.com/channel/0029Vb5qnK2HbFUyftE5UP1X";

  try {
    let response = await fetch(`https://api.nexoracle.com/details/pak-sim-database?apikey=${paid_api_key}&q=${query}`);
    let data = await response.json();

    if (response.status === 402 || data.result === "Access Not Allowed. Please Contact Owner.") {
      showNotification("Paid ApiKey Required", "Using Free API Because You Didn't Have Paid ApiKey Access.", "error", 7000);
      response = await fetch(`https://api.nexoracle.com/details/pak-sim-database-free?apikey=${free_api_key}&q=${query}`);
      data = await response.json();
    }

    if (data.result === "No SIM or CNIC data found." || data.result === "No SIM data found.") {
      showNotification("No Details Found", data.result, "error", 6000);

      const noDataItem = document.createElement("div");
      noDataItem.className = "bg-gradient-to-br from-dark-800 to-dark-700 rounded-2xl overflow-hidden shadow-2xl result-card p-8 text-center";
      noDataItem.innerHTML = `
                <div class="text-xl text-white-400 mb-4 font-bold">No Detail Records Found in Database</div>
                <p class="mb-6">You can get this number details via paid service</p>
                <a href="${whatsapp_contact_link}" target="_blank" class="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg inline-flex items-center">
                    <i class="fab fa-whatsapp mr-2"></i> Contact on WhatsApp
                </a>
            `;
      resultsList.appendChild(noDataItem);
      resultsContainer.classList.remove("hidden");
      return;
    }

    if (!data.result || (typeof data.result === "string" && data.result !== "No SIM or CNIC data found." && data.result !== "No SIM data found.")) {
      showNotification("API Error", data.result || "Network error - please try again later");
      return;
    }

    if ((Array.isArray(data.result) && data.result.length === 0) || (typeof data.result === "object" && Object.keys(data.result).length === 0)) {
      showNotification("No Data Found", "No information available for this number");
      return;
    }

    if (Array.isArray(data.result)) {
      data.result.forEach((item, index) => {
        if (item && (item.name || item.number)) {
          const resultItem = document.createElement("div");
          resultItem.className = "bg-gradient-to-br from-dark-800 to-dark-700 rounded-2xl overflow-hidden shadow-2xl result-card p-8";
          resultItem.innerHTML = `
                        <div class="flex items-center mb-4">
                            <span class="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">Record #${index + 1}</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 class="text-xl font-bold mb-4 text-blue-400">Owner Information</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Name:</span>
                                        <span class="font-medium">${item.name || "N/A"}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Number:</span>
                                        <span class="font-medium">${item.number || "N/A"}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">CNIC:</span>
                                        <span class="font-medium">${item.cnic || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold mb-4 text-blue-400">Additional Details</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Operator:</span>
                                        <span class="font-medium">${item.operator || "N/A"}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Address:</span>
                                        <span class="font-medium text-right">${item.address || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
          resultsList.appendChild(resultItem);
        }
      });
    } else if (typeof data.result === "object" && (data.result.name || data.result.number)) {
      const resultItem = document.createElement("div");
      resultItem.className = "bg-gradient-to-br from-dark-800 to-dark-700 rounded-2xl overflow-hidden shadow-2xl result-card p-8";
      resultItem.innerHTML = `
                <div class="flex items-center mb-4">
                    <span class="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">Record #1</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-xl font-bold mb-4 text-blue-400">Owner Information</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Name:</span>
                                <span class="font-medium">${data.result.name || "N/A"}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Number:</span>
                                <span class="font-medium">${data.result.number || "N/A"}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">CNIC:</span>
                                <span class="font-medium">${data.result.cnic || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold mb-4 text-blue-400">Additional Details</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Operator:</span>
                                <span class="font-medium">${data.result.operator || "N/A"}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Address:</span>
                                <span class="font-medium text-right">${data.result.address || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      resultsList.appendChild(resultItem);
    } else {
      showNotification("Network Error", "Network error - please try again later");
      return;
    }

    if (resultsList.children.length > 0) {
      resultsContainer.classList.remove("hidden");
      document.getElementById("results").scrollIntoView({ behavior: "smooth" });
    } else {
      showNotification("No Data Found", "No valid information available for this number", "error", 7000);
    }
  } catch (error) {
    console.error("failed to get sim details:", error);
    showNotification("Network Error", "Network error - please try again later");
  } finally {
    searchBtn.innerHTML = originalBtnText;
    searchBtn.disabled = false;
  }
});

document.querySelectorAll("#mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
    mobileMenu.classList.remove("active");
    mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

ScrollReveal().reveal(".animate-fade-in", {
  delay: 200,
  duration: 1000,
  opacity: 0,
  easing: "ease-in-out",
});

ScrollReveal().reveal(".animate-slide-up", {
  delay: 300,
  duration: 800,
  distance: "30px",
  origin: "bottom",
  easing: "ease-out",
});
