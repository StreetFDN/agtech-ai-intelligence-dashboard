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
        allCompanies = data.companies;
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

function initializeFilters() {
    if (!dashboardData) return;

    // Populate category filter
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(allCompanies.map(c => c.category))].sort();
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    // Populate stage filter
    const stageFilter = document.getElementById('stageFilter');
    const stages = [...new Set(allCompanies.map(c => c.stage))].sort();
    stages.forEach(stage => {
        const option = document.createElement('option');
        option.value = stage;
        option.textContent = stage;
        stageFilter.appendChild(option);
    });

    // Populate country filter
    const countryFilter = document.getElementById('countryFilter');
    const countries = [...new Set(allCompanies.map(c => c.country))].sort();
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Filter selects
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('stageFilter').addEventListener('change', applyFilters);
    document.getElementById('countryFilter').addEventListener('change', applyFilters);
    document.getElementById('sortSelect').addEventListener('change', applyFilters);

    // Reset button
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    // Pagination buttons
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stageFilter = document.getElementById('stageFilter').value;
    const countryFilter = document.getElementById('countryFilter').value;
    const sortSelect = document.getElementById('sortSelect').value;

    // Apply filters
    filteredCompanies = allCompanies.filter(company => {
        const matchesSearch = !searchTerm || 
            company.name.toLowerCase().includes(searchTerm) ||
            company.tech.some(t => t.toLowerCase().includes(searchTerm)) ||
            company.location.toLowerCase().includes(searchTerm) ||
            company.country.toLowerCase().includes(searchTerm);
        
        const matchesCategory = categoryFilter === 'all' || company.category === categoryFilter;
        const matchesStage = stageFilter === 'all' || company.stage === stageFilter;
        const matchesCountry = countryFilter === 'all' || company.country === countryFilter;

        return matchesSearch && matchesCategory && matchesStage && matchesCountry;
    });

    // Apply sorting
    sortCompanies(sortSelect);

    // Reset to first page
    currentPage = 1;
    displayCompanies();
}

function sortCompanies(sortBy) {
    switch(sortBy) {
        case 'funding-desc':
            filteredCompanies.sort((a, b) => b.funding - a.funding);
            break;
        case 'funding-asc':
            filteredCompanies.sort((a, b) => a.funding - b.funding);
            break;
        case 'name-asc':
            filteredCompanies.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredCompanies.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'year-desc':
            filteredCompanies.sort((a, b) => b.founded - a.founded);
            break;
        case 'year-asc':
            filteredCompanies.sort((a, b) => a.founded - b.founded);
            break;
    }
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('stageFilter').value = 'all';
    document.getElementById('countryFilter').value = 'all';
    document.getElementById('sortSelect').value = 'funding-desc';
    applyFilters();
}

function displayCompanies() {
    const container = document.getElementById('companyTable');
    const start = (currentPage - 1) * companiesPerPage;
    const end = start + companiesPerPage;
    const pageCompanies = filteredCompanies.slice(start, end);

    if (pageCompanies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">No companies found matching your criteria</div>
                <p style="color: #666; margin-top: 0.5rem;">Try adjusting your filters or search terms</p>
            </div>
        `;
        updateResultsCounter(0, 0, 0);
        updatePagination();
        return;
    }

    const table = `
        <table>
            <thead>
                <tr>
                    <th>Company</th>
                    <th>Category</th>
                    <th>Stage</th>
                    <th>Funding</th>
                    <th>Location</th>
                    <th>Founded</th>
                    <th>Employees</th>
                </tr>
            </thead>
            <tbody>
                ${pageCompanies.map(company => `
                    <tr>
                        <td>
                            <div class="company-name">${company.name}</div>
                            <div class="company-tech">${company.tech.slice(0, 2).join(', ')}</div>
                        </td>
                        <td>${company.category}</td>
                        <td><span class="funding-badge stage-${getStageClass(company.stage)}">${company.stage}</span></td>
                        <td><strong>$${company.funding}M</strong></td>
                        <td>${company.location}</td>
                        <td>${company.founded}</td>
                        <td>${company.employees}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
    updateResultsCounter(start + 1, Math.min(end, filteredCompanies.length), filteredCompanies.length);
    updatePagination();
}

function getStageClass(stage) {
    return stage.toLowerCase().replace(/\s+/g, '-').replace(/\+/g, '');
}

function updateResultsCounter(start, end, total) {
    const counter = document.getElementById('resultsCounter');
    counter.textContent = `Showing ${start}-${end} of ${total} companies`;
}

function updatePagination() {
    const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumbersContainer = document.getElementById('pageNumbers');

    // Update button states
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Generate page numbers
    pageNumbersContainer.innerHTML = '';
    const maxPageNumbers = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

    if (endPage - startPage < maxPageNumbers - 1) {
        startPage = Math.max(1, endPage - maxPageNumbers + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-number' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToPage(i));
        pageNumbersContainer.appendChild(pageBtn);
    }
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayCompanies();
        document.getElementById('companies').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function goToPage(page) {
    currentPage = page;
    displayCompanies();
    document.getElementById('companies').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Chart creation functions (keeping existing implementations)
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
                    '#0369a1', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc',
                    '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc'
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

function createGeographicDistributionChart() {
    const ctx = document.getElementById('geoDistributionChart').getContext('2d');
    const data = dashboardData ? dashboardData.geography.distribution.filter(d => d.country !== 'Others') : [];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.country),
            datasets: [{
                label: 'Number of Companies',
                data: data.map(item => item.count),
                backgroundColor: '#0891b2',
                borderColor: '#0369a1',
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

function createFundingBubbleChart() {
    const ctx = document.getElementById('fundingBubbleChart').getContext('2d');
    const companies = dashboardData ? dashboardData.companies.filter(c => c.lastRoundYear && c.funding > 0).slice(0, 30) : [];

    const stageColors = {
        'Seed': '#a5f3fc',
        'Series A': '#67e8f9',
        'Series B': '#22d3ee',
        'Series C': '#06b6d4',
        'Series D': '#0891b2',
        'Series E': '#0284c7',
        'Series F': '#0369a1',
        'Series G': '#075985',
        'Series H': '#0c4a6e',
        'Public': '#1e40af',
        'Acquired': '#64748b',
        'Corporate': '#475569'
    };

    const datasets = Object.keys(stageColors).map(stage => {
        const stageCompanies = companies.filter(c => c.stage === stage);
        return {
            label: stage,
            data: stageCompanies.map(c => ({
                x: c.lastRoundYear,
                y: c.funding,
                r: Math.sqrt(c.funding) / 2,
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
                    labels: { padding: 15, font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return [
                                point.company,
                                'Funding: $' + point.y + 'M',
                                'Year: ' + point.x,
                                'Employees: ' + point.employees
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Year' },
                    min: 2016,
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
                borderColor: '#0369a1',
                backgroundColor: 'rgba(3, 105, 161, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#0369a1',
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
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Funding Amount ($M)' }
                },
                x: {
                    title: { display: true, text: 'Year' }
                }
            }
        }
    });
}

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
                    '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4',
                    '#0891b2', '#0284c7', '#0369a1', '#075985'
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
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Total Funding ($M)' }
                }
            }
        }
    });
}

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
                    borderColor: '#0369a1',
                    backgroundColor: 'rgba(3, 105, 161, 0.1)',
                    yAxisID: 'y',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Number of Deals',
                    data: data.map(item => item.deals),
                    borderColor: '#0891b2',
                    backgroundColor: 'rgba(8, 145, 178, 0.1)',
                    yAxisID: 'y1',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: true }
            },
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
                    backgroundColor: '#0369a1',
                    borderWidth: 0
                },
                {
                    label: 'Forks',
                    data: data.map(item => item.forks),
                    backgroundColor: '#0891b2',
                    borderWidth: 0
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

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
                backgroundColor: '#0891b2',
                borderColor: '#0369a1',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Patents' }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
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
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 100) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.style.borderBottomColor = 'transparent';
        if (link.getAttribute('href') === '#' + currentSection) {
            link.style.borderBottomColor = '#0284c7';
        }
    });
});