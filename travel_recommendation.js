document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const resetBtn = document.getElementById("resetBtn");
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("results");

  let dataCache = null;

  async function fetchData() {
    try {
      const response = await fetch("travel_recommendation_api.json");
      if (!response.ok) throw new Error("Failed to load data");
      const data = await response.json();
      dataCache = data;
    } catch (error) {
      resultsContainer.innerHTML = `<p>Error loading data: ${error.message}</p>`;
    }
  }

  function getPlaceholderImage(title) {
    const encodedTitle = encodeURIComponent(title);
    return `https://via.placeholder.com/300x200?text=${encodedTitle}`;
  }

  function displayResults(results, title) {
    const section = document.createElement("section");
    section.innerHTML = `<h2>${title}</h2>`;
    
    if (results.length === 0) {
      section.innerHTML += "<p>No matches found.</p>";
    } else {
      results.forEach(item => {
        const imageUrl = item.imageUrl ? item.imageUrl : getPlaceholderImage(item.name);
        section.innerHTML += `
          <div class="card">
            <img src="${imageUrl}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
          </div>
        `;
      });
    }

    resultsContainer.appendChild(section);
  }

  function searchRecommendations(keyword) {
    resultsContainer.innerHTML = ""; // Clear previous results

    const query = keyword.toLowerCase();

    if (!dataCache) return;

    // Check for keyword-based matches
    const isBeachSearch = ["beach", "beaches"].includes(query);
    const isTempleSearch = ["temple", "temples"].includes(query);

    const matchedCities = [];
    const matchedCountries = [];
    const countries = dataCache.countries || [];

    // Search in cities and countries
    countries.forEach(country => {
      const countryName = country.name.toLowerCase();
      if (countryName.includes(query)) {
        matchedCountries.push({ name: country.name, description: `Explore ${country.name}`, imageUrl: "" });
      }

      country.cities.forEach(city => {
        const cityName = city.name.toLowerCase();
        const cityDesc = city.description.toLowerCase();
        if (cityName.includes(query) || cityDesc.includes(query)) {
          matchedCities.push(city);
        }
      });
    });

    const matchedBeaches = isBeachSearch
      ? dataCache.beaches
      : dataCache.beaches.filter(
          b => b.name.toLowerCase().includes(query) || b.description.toLowerCase().includes(query)
        );

    const matchedTemples = isTempleSearch
      ? dataCache.temples
      : dataCache.temples.filter(
          t => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
        );

    // Display all result sections
    if (matchedCountries.length) displayResults(matchedCountries, "Country Recommendations");
    if (matchedCities.length) displayResults(matchedCities, "City Recommendations");
    if (matchedTemples.length) displayResults(matchedTemples, "Temple Recommendations");
    if (matchedBeaches.length) displayResults(matchedBeaches, "Beach Recommendations");

    // If no results in any category
    if (
      matchedCountries.length === 0 &&
      matchedCities.length === 0 &&
      matchedTemples.length === 0 &&
      matchedBeaches.length === 0
    ) {
      resultsContainer.innerHTML = "<p>No matching travel recommendations found.</p>";
    }
  }

  // Event listeners
  searchBtn.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    if (keyword) searchRecommendations(keyword);
  });

  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    resultsContainer.innerHTML = "";
  });

  fetchData(); // Load data initially
});
