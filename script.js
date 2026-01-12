// Global variables
let dashboardData = null;
let allCompanies = [];
let filteredCompanies = [];
let currentPage = 1;
const companiesPerPage = 20;

// Smooth scrolling for navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Load data from JSON file
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        dashboardData = data;
        allCompanies = data.companies || [];
        filteredCompanies = [...allCompanies];
        initializeDashboard();
    })
    .catch(error => {
        console.error('Error loading data:', error);
        initializeDashboard();
    });

function initializeDashboard() {
    updateMetrics();
    initializeFilters();
    setupEventListeners();
    createTechnologyCategoryChart();
    createGeographicDistributionChart();
    createFundingBubbleChart();
    createFundingTrendsChart();
    createFundingStageChart();
    createQuarterlyFundingChart();
    createGitHubReposChart();
    createPatentCategoryChart();
    displayCompanies();
}

function updateMetrics() {
    if (dashboardData) {
        document.getElementById('companiesCount').textContent = dashboardData.overview.totalCompanies;
        document.getElementById('marketSize').textContent = '$' + dashboardData.overview.marketSize;
        document.getElementById('githubRepos').textContent = dashboardData.overview.githubRepos;
        document.getElementById('totalFunding').textContent = '$' + dashboardData.overview.totalFunding;
    }
}

// Initialize filter dropdowns
function initializeFilters() {
    if (!dashboardData) return;

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(allCompanies.map(c => c.category).filter(Boolean))];
    categories.sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Stage filter
    const stageFilter = document.getElementById('stageFilter');
    const stages = [...new Set(allCompanies.map(c => c.stage).filter(Boolean))];
    stages.sort().forEach(stage => {
        const option = document.createElement('option');
        option.value = stage;
        option.textContent = stage;
        stageFilter.appendChild(option);
    });

    // Country filter
    const countryFilter = document.getElementById('countryFilter');
    const countries = [...new Set(allCompanies.map(c => c.country).filter(Boolean))];
    countries.sort().forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('companySearch').addEventListener('input', applyFilters);

    // Filters
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('stageFilter').addEventListener('change', applyFilters);
    document.getElementById('countryFilter').addEventListener('change', applyFilters);
    document.getElementById('sortBy').addEventListener('change', applyFilters);

    // Reset button
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    // Pagination
    document.getElementById('firstPage').addEventListener('click', () => goToPage(1));
    document.getElementById('prevPage').addEventListener('click', () => goToPage(currentPage - 1));
    document.getElementById('nextPage').addEventListener('click', () => goToPage(currentPage + 1));
    document.getElementById('lastPage').addEventListener('click', () => goToPage(Math.ceil(filteredCompanies.length / companiesPerPage)));
}

// Apply all filters
function applyFilters() {
    const searchTerm = document.getElementById('companySearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stageFilter = document.getElementById('stageFilter').value;
    const countryFilter = document.getElementById('countryFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    // Filter companies
    filteredCompanies = allCompanies.filter(company => {
        const matchesSearch = !searchTerm || 
            company.name.toLowerCase().includes(searchTerm) ||
            (company.tech && company.tech.some(t => t.toLowerCase().includes(searchTerm))) ||
            (company.location && company.location.toLowerCase().includes(searchTerm)) ||
            (company.country && company.country.toLowerCase().includes(searchTerm));

        const matchesCategory = categoryFilter === 'all' || company.category === categoryFilter;
        const matchesStage = stageFilter === 'all' || company.stage === stageFilter;
        const matchesCountry = countryFilter === 'all' || company.country === countryFilter;

        return matchesSearch && matchesCategory && matchesStage && matchesCountry;
    });

    // Sort companies
    sortCompanies(sortBy);

    // Reset to first page
    currentPage = 1;
    displayCompanies();
}

// Sort companies
function sortCompanies(sortBy) {
    switch(sortBy) {
        case 'funding-desc':
            filteredCompanies.sort((a, b) => (b.funding || 0) - (a.funding || 0));
            break;
        case 'funding-asc':
            filteredCompanies.sort((a, b) => (a.funding || 0) - (b.funding || 0));
            break;
        case 'name-asc':
            filteredCompanies.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredCompanies.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'founded-desc':
            filteredCompanies.sort((a, b) => (b.founded || 0) - (a.founded || 0));
            break;
        case 'founded-asc':
            filteredCompanies.sort((a, b) => (a.founded || 0) - (b.founded || 0));
            break;
    }
}

// Reset filters
function resetFilters() {
    document.getElementById('companySearch').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('stageFilter').value = 'all';
    document.getElementById('countryFilter').value = 'all';
    document.getElementById('sortBy').value = 'funding-desc';
    applyFilters();
}

// Display companies with pagination
function displayCompanies() {
    const startIndex = (currentPage - 1) * companiesPerPage;
    const endIndex = Math.min(startIndex + companiesPerPage, filteredCompanies.length);
    const companiesToShow = filteredCompanies.slice(startIndex, endIndex);

    // Update results counter
    const totalCompanies = filteredCompanies.length;
    document.getElementById('resultsCounter').textContent = 
        totalCompanies > 0 ? `Showing ${startIndex + 1}-${endIndex} of ${totalCompanies} companies` : 'No companies found';

    // Create table
    const container = document.getElementById('companyTable');
    
    if (companiesToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No companies found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        updatePagination();
        return;
    }

    const table = `
        <div class="company-table">
            <table>
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Funding</th>
                        <th>Stage</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Founded</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${companiesToShow.map(company => `
                        <tr>
                            <td>
                                <div class="company-name">${company.name}</div>
                                <div class="company-tech">${Array.isArray(company.tech) ? company.tech.slice(0, 2).join(', ') : company.tech || 'N/A'}</div>
                            </td>
                            <td class="company-funding">${company.funding ? '$' + company.funding + 'M' : 'N/A'}</td>
                            <td><span class="company-stage ${getStageClass(company.stage)}">${company.stage || 'N/A'}</span></td>
                            <td>${company.category || 'N/A'}</td>
                            <td class="company-location">${company.location || company.country || 'N/A'}</td>
                            <td>${company.founded || 'N/A'}</td>
                            <td><span class="company-status ${getStatusClass(company.status)}">${company.status || 'Active'}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = table;
    updatePagination();
}

// Get stage CSS class
function getStageClass(stage) {
    if (!stage) return '';
    const stageClean = stage.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return 'stage-' + stageClean;
}

// Get status CSS class
function getStatusClass(status) {
    if (!status) return 'status-active';
    return 'status-' + status.toLowerCase();
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

    // Update button states
    document.getElementById('firstPage').disabled = currentPage === 1;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
    document.getElementById('lastPage').disabled = currentPage === totalPages || totalPages === 0;

    // Generate page numbers
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';

    if (totalPages <= 1) return;

    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
        pageNumbersContainer.appendChild(createPageButton(1));
        if (startPage > 2) {
            pageNumbersContainer.appendChild(createEllipsis());
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        pageNumbersContainer.appendChild(createPageButton(i));
    }

    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbersContainer.appendChild(createEllipsis());
        }
        pageNumbersContainer.appendChild(createPageButton(totalPages));
    }
}

// Create page button
function createPageButton(pageNum) {
    const button = document.createElement('div');
    button.className = 'page-number' + (pageNum === currentPage ? ' active' : '');
    button.textContent = pageNum;
    button.addEventListener('click', () => goToPage(pageNum));
    return button;
}

// Create ellipsis
function createEllipsis() {
    const ellipsis = document.createElement('div');
    ellipsis.className = 'page-number ellipsis';
    ellipsis.textContent = '...';
    return ellipsis;
}

// Go to specific page
function goToPage(pageNum) {
    const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);
    if (pageNum < 1 || pageNum > totalPages) return;
    currentPage = pageNum;
    displayCompanies();
    
    // Scroll to companies section
    document.getElementById('companies').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Technology Category Chart
function createTechnologyCategoryChart() {
    const ctx = document.getElementById('techCategoryChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.technologies.categories : [];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.value),
                backgroundColor: [
                    '#2c5f7c', '#3a8a5d', '#4a9f6e', '#5ab57f',
                    '#6bc990', '#7edfa1', '#8fe5b2', '#a0efc3'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { padding: 15, font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + ' companies';
                        }
                    }
                }
            }
        }
    });
}

// Geographic Distribution Chart
function createGeographicDistributionChart() {
    const ctx = document.getElementById('geoDistributionChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.geography.distribution.slice(0, 10) : [];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.country),
            datasets: [{
                label: 'Number of Companies',
                data: data.map(item => item.count),
                backgroundColor: '#3a8a5d',
                borderColor: '#2c5f7c',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Companies: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 5 } }
            }
        }
    });
}

// Funding Bubble Chart
function createFundingBubbleChart() {
    const ctx = document.getElementById('fundingBubbleChart').getContext('2d');
    
    const companies = dashboardData ? dashboardData.companies.slice(0, 30) : [];

    const stageColors = {
        'Seed': '#7edfa1',
        'Series A': '#6bc990',
        'Series B': '#5ab57f',
        'Series C': '#4a9f6e',
        'Series D': '#3a8a5d',
        'Series E': '#2c5f7c',
        'Series F': '#1e4a5f',
        'Series G': '#0f3442',
        'Public': '#f39c12',
        'Acquired': '#e74c3c',
        'Corporate': '#3498db'
    };

    const datasets = Object.keys(stageColors).map(stage => {
        const stageCompanies = companies.filter(c => c.stage === stage);
        return {
            label: stage,
            data: stageCompanies.map(c => ({
                x: c.lastRoundYear || c.founded || 2020,
                y: c.funding || 0,
                r: Math.sqrt((c.funding || 0) * 10) / 3,
                company: c.name,
                employees: c.employees
            })),
            backgroundColor: stageColors[stage] + '99',
            borderColor: stageColors[stage],
            borderWidth: 2
        };
    }).filter(ds => ds.data.length > 0);

    new Chart(ctx, {
        type: 'bubble',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { padding: 10, font: { size: 10 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return [
                                point.company,
                                'Funding: $' + point.y + 'M',
                                'Year: ' + point.x,
                                'Employees: ' + (point.employees || 'N/A')
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Year' },
                    min: 2010,
                    max: 2024
                },
                y: {
                    title: { display: true, text: 'Funding ($M)' },
                    beginAtZero: true
                }
            }
        }
    });
}

// Funding Trends Chart
function createFundingTrendsChart() {
    const ctx = document.getElementById('fundingTrendsChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.funding.trends : [];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.year),
            datasets: [{
                label: 'Total Funding ($M)',
                data: data.map(item => item.amount),
                borderColor: '#2c5f7c',
                backgroundColor: 'rgba(44, 95, 124, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#2c5f7c',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Funding: $' + context.parsed.y.toLocaleString() + 'M';
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Funding Amount ($M)' } },
                x: { title: { display: true, text: 'Year' } }
            }
        }
    });
}

// Funding by Stage Chart
function createFundingStageChart() {
    const ctx = document.getElementById('fundingStageChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.funding.byStage : [];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.stage),
            datasets: [{
                label: 'Total Funding ($M)',
                data: data.map(item => item.amount),
                backgroundColor: [
                    '#7edfa1', '#6bc990', '#5ab57f', '#4a9f6e',
                    '#3a8a5d', '#2c5f7c', '#1e4a5f', '#0f3442'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Funding: $' + context.parsed.y.toLocaleString() + 'M';
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Total Funding ($M)' } }
            }
        }
    });
}

// Quarterly Funding Chart
function createQuarterlyFundingChart() {
    const ctx = document.getElementById('quarterlyFundingChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.funding.quarterly : [];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.quarter),
            datasets: [
                {
                    label: 'Funding Amount ($M)',
                    data: data.map(item => item.amount),
                    borderColor: '#2c5f7c',
                    backgroundColor: 'rgba(44, 95, 124, 0.1)',
                    yAxisID: 'y',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Number of Deals',
                    data: data.map(item => item.deals),
                    borderColor: '#3a8a5d',
                    backgroundColor: 'rgba(58, 138, 93, 0.1)',
                    yAxisID: 'y1',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: true } },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Funding ($M)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Number of Deals' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

// GitHub Repos Chart
function createGitHubReposChart() {
    const ctx = document.getElementById('githubReposChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.github.topRepos : [];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.name),
            datasets: [
                {
                    label: 'Stars',
                    data: data.map(item => item.stars),
                    backgroundColor: '#2c5f7c',
                    borderWidth: 0
                },
                {
                    label: 'Forks',
                    data: data.map(item => item.forks),
                    backgroundColor: '#3a8a5d',
                    borderWidth: 0
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: true } },
            scales: { x: { beginAtZero: true } }
        }
    });
}

// Patent Category Chart
function createPatentCategoryChart() {
    const ctx = document.getElementById('patentCategoryChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.patents.byCategory : [];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.category),
            datasets: [{
                label: 'Number of Patents',
                data: data.map(item => item.count),
                backgroundColor: '#3a8a5d',
                borderColor: '#2c5f7c',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of Patents' } },
                x: { ticks: { maxRotation: 45, minRotation: 45 } }
            }
        }
    });
}

// Highlight active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 100) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.style.borderBottomColor = 'transparent';
        if (link.getAttribute('href') === '#' + currentSection) {
            link.style.borderBottomColor = '#3a8a5d';
        }
    });
});