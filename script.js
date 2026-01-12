// Load data and initialize dashboard
let dashboardData = null;
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
        filteredCompanies = [...data.companies];
        initializeDashboard();
    })
    .catch(error => {
        console.error('Error loading data:', error);
        initializeDashboard(); // Initialize with default data if fetch fails
    });

function initializeDashboard() {
    // Update metrics
    updateMetrics();
    
    // Initialize filter dropdowns
    initializeFilters();
    
    // Initialize all charts
    createTechnologyCategoryChart();
    createGeographicDistributionChart();
    createFundingBubbleChart();
    createFundingTrendsChart();
    createFundingStageChart();
    createQuarterlyFundingChart();
    createGitHubReposChart();
    createPatentCategoryChart();
    
    // Initialize company table with pagination
    displayCompanies();
    
    // Set up event listeners
    setupEventListeners();
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
    const categories = [...new Set(dashboardData.companies.map(c => c.category))].sort();
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Populate stage filter
    const stageFilter = document.getElementById('stageFilter');
    const stages = [...new Set(dashboardData.companies.map(c => c.stage))].sort();
    stages.forEach(stage => {
        const option = document.createElement('option');
        option.value = stage;
        option.textContent = stage;
        stageFilter.appendChild(option);
    });
    
    // Populate region filter
    const regionFilter = document.getElementById('regionFilter');
    const countries = [...new Set(dashboardData.companies.map(c => c.country))].sort();
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        regionFilter.appendChild(option);
    });
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('companySearch');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    // Filter dropdowns
    document.getElementById('categoryFilter')?.addEventListener('change', applyFilters);
    document.getElementById('stageFilter')?.addEventListener('change', applyFilters);
    document.getElementById('regionFilter')?.addEventListener('change', applyFilters);
    document.getElementById('sortBy')?.addEventListener('change', applyFilters);
    
    // Pagination buttons
    document.getElementById('prevPage')?.addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage')?.addEventListener('click', () => changePage(1));
}

function applyFilters() {
    if (!dashboardData) return;
    
    const searchTerm = document.getElementById('companySearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const stageFilter = document.getElementById('stageFilter')?.value || '';
    const regionFilter = document.getElementById('regionFilter')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'funding-desc';
    
    // Filter companies
    filteredCompanies = dashboardData.companies.filter(company => {
        const matchesSearch = !searchTerm || 
            company.name.toLowerCase().includes(searchTerm) ||
            company.location.toLowerCase().includes(searchTerm) ||
            (company.tech && company.tech.some(t => t.toLowerCase().includes(searchTerm)));
        
        const matchesCategory = !categoryFilter || company.category === categoryFilter;
        const matchesStage = !stageFilter || company.stage === stageFilter;
        const matchesRegion = !regionFilter || company.country === regionFilter;
        
        return matchesSearch && matchesCategory && matchesStage && matchesRegion;
    });
    
    // Sort companies
    filteredCompanies.sort((a, b) => {
        switch(sortBy) {
            case 'funding-desc':
                return b.funding - a.funding;
            case 'funding-asc':
                return a.funding - b.funding;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'year-desc':
                return b.founded - a.founded;
            case 'year-asc':
                return a.founded - b.founded;
            default:
                return 0;
        }
    });
    
    // Reset to first page
    currentPage = 1;
    displayCompanies();
}

function displayCompanies() {
    if (!filteredCompanies || filteredCompanies.length === 0) {
        document.getElementById('companyTable').innerHTML = '<p style="text-align: center; padding: 2rem;">No companies found matching your criteria.</p>';
        updateCompanyCounter();
        updatePagination();
        return;
    }
    
    const startIndex = (currentPage - 1) * companiesPerPage;
    const endIndex = Math.min(startIndex + companiesPerPage, filteredCompanies.length);
    const displayedCompanies = filteredCompanies.slice(startIndex, endIndex);
    
    const table = `
        <div class="company-table">
            <table>
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Location</th>
                        <th>Funding</th>
                        <th>Stage</th>
                        <th>Category</th>
                        <th>Founded</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${displayedCompanies.map(company => `
                        <tr>
                            <td>
                                <div class="company-name">${company.name}</div>
                                ${company.tech ? `<div class="company-tags">${company.tech.slice(0, 2).map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
                            </td>
                            <td>${company.location}</td>
                            <td><strong>$${company.funding}M</strong></td>
                            <td>${company.stage}</td>
                            <td>${company.category}</td>
                            <td>${company.founded}</td>
                            <td><span class="status-badge status-${company.status ? company.status.toLowerCase().replace(' ', '-') : 'active'}">${company.status || 'Active'}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('companyTable').innerHTML = table;
    updateCompanyCounter();
    updatePagination();
}

function updateCompanyCounter() {
    const counter = document.getElementById('companyCounter');
    if (!counter) return;
    
    const total = filteredCompanies.length;
    if (total === 0) {
        counter.textContent = 'No companies found';
        return;
    }
    
    const startIndex = (currentPage - 1) * companiesPerPage + 1;
    const endIndex = Math.min(startIndex + companiesPerPage - 1, total);
    counter.textContent = `Showing ${startIndex}-${endIndex} of ${total} companies`;
}

function updatePagination() {
    const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);
    
    // Update prev/next buttons
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Update page numbers
    const pageNumbersContainer = document.getElementById('pageNumbers');
    if (!pageNumbersContainer) return;
    
    pageNumbersContainer.innerHTML = '';
    
    // Show page numbers (max 7 visible)
    const maxVisible = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
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
        
        // Scroll to companies section
        document.getElementById('companies')?.scrollIntoView({ behavior: 'smooth' });
    }
}

function goToPage(page) {
    currentPage = page;
    displayCompanies();
    document.getElementById('companies')?.scrollIntoView({ behavior: 'smooth' });
}

// Technology Category Chart (Pie Chart)
function createTechnologyCategoryChart() {
    const ctx = document.getElementById('techCategoryChart')?.getContext('2d');
    if (!ctx) return;
    
    const data = dashboardData ? dashboardData.technologies.categories : [
        { name: 'AI & Machine Learning', value: 32 },
        { name: 'Precision Agriculture', value: 24 },
        { name: 'Crop Management', value: 18 },
        { name: 'Data Analytics', value: 16 },
        { name: 'Farm Automation', value: 15 },
        { name: 'Biotechnology', value: 12 }
    ];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.value),
                backgroundColor: [
                    '#0066cc',
                    '#0099ff',
                    '#00cccc',
                    '#33ccff',
                    '#66d9ff',
                    '#99e6ff'
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
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
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

// Geographic Distribution Chart (Bar Chart)
function createGeographicDistributionChart() {
    const ctx = document.getElementById('geoDistributionChart')?.getContext('2d');
    if (!ctx) return;
    
    const data = dashboardData ? dashboardData.geography.distribution.slice(0, 6) : [
        { country: 'United States', count: 38 },
        { country: 'India', count: 18 },
        { country: 'Israel', count: 12 },
        { country: 'Netherlands', count: 8 },
        { country: 'Germany', count: 7 },
        { country: 'Brazil', count: 6 }
    ];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.country),
            datasets: [{
                label: 'Number of Companies',
                data: data.map(item => item.count),
                backgroundColor: '#0099ff',
                borderColor: '#0066cc',
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
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// Funding Bubble Chart
function createFundingBubbleChart() {
    const ctx = document.getElementById('fundingBubbleChart')?.getContext('2d');
    if (!ctx) return;
    
    const companies = dashboardData ? dashboardData.companies.slice(0, 30) : [];

    const stageColors = {
        'Seed': '#99e6ff',
        'Series A': '#66d9ff',
        'Series B': '#33ccff',
        'Series C': '#00cccc',
        'Series D': '#0099ff',
        'Series E': '#0066cc',
        'Series F': '#0052a3',
        'Series G': '#003d7a',
        'Series H': '#002952',
        'Public': '#1a8cff',
        'Acquired': '#ffaa00',
        'Corporate': '#6c757d'
    };

    const datasets = Object.keys(stageColors).map(stage => {
        const stageCompanies = companies.filter(c => c.stage === stage);
        return {
            label: stage,
            data: stageCompanies.map(c => ({
                x: c.lastRoundYear || c.founded,
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
                    max: 2026
                },
                y: {
                    title: { display: true, text: 'Funding ($M)' },
                    beginAtZero: true
                }
            }
        }
    });
}

// Funding Trends Line Chart
function createFundingTrendsChart() {
    const ctx = document.getElementById('fundingTrendsChart')?.getContext('2d');
    if (!ctx) return;
    
    const data = dashboardData ? dashboardData.funding.trends : [];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.year),
            datasets: [{
                label: 'Total Funding ($M)',
                data: data.map(item => item.amount),
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#0066cc',
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

// Funding by Stage Chart
function createFundingStageChart() {
    const ctx = document.getElementById('fundingStageChart')?.getContext('2d');
    if (!ctx) return;
    
    const data = dashboardData ? dashboardData.funding.byStage : [];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.stage),
            datasets: [{
                label: 'Total Funding ($M)',
                data: data.map(item => item.amount),
                backgroundColor: [
                    '#99e6ff',
                    '#66d9ff',
                    '#33ccff',
                    '#00cccc',
                    '#0099ff',
                    '#0066cc',
                    '#0052a3',
                    '#003d7a'
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

// Quarterly Funding Chart
function createQuarterlyFundingChart() {
    const ctx = document.getElementById('quarterlyFundingChart')?.getContext('2d');
    if (!ctx) return;
    
    const data = dashboardData ? dashboardData.funding.quarterly : [];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.quarter),
            datasets: [
                {
                    label: 'Funding Amount ($M)',
                    data: data.map(item => item.amount),
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    yAxisID: 'y',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Number of Deals',
                    data: data.map(item => item.deals),
                    borderColor: '#00cccc',
                    backgroundColor: 'rgba(0, 204, 204, 0.1)',
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

// GitHub Repos Chart
function createGitHubReposChart() {
    const ctx = document.getElementById('githubReposChart')?.getContext('2d');
    if (!ctx) return;
    
    const data = dashboardData ? dashboardData.github.topRepos : [];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.name),
            datasets: [
                {
                    label: 'Stars',
                    data: data.map(item => item.stars),
                    backgroundColor: '#0066cc',
                    borderWidth: 0
                },
                {
                    label: 'Forks',
                    data: data.map(item => item.forks),
                    backgroundColor: '#00cccc',
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
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Patent Category Chart
function createPatentCategoryChart() {
    const ctx = document.getElementById('patentCategoryChart')?.getContext('2d');
    if (!ctx) return;
    
    const data = dashboardData ? dashboardData.patents.byCategory : [];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.category),
            datasets: [{
                label: 'Number of Patents',
                data: data.map(item => item.count),
                backgroundColor: '#0099ff',
                borderColor: '#0066cc',
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
            link.style.borderBottomColor = '#0099ff';
        }
    });
});