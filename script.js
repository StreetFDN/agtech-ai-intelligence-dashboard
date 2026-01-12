// Load data and initialize dashboard
let dashboardData = null;

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
        initializeDashboard();
    })
    .catch(error => {
        console.error('Error loading data:', error);
        initializeDashboard(); // Initialize with default data if fetch fails
    });

function initializeDashboard() {
    // Update metrics
    updateMetrics();
    
    // Initialize all charts
    createTechnologyCategoryChart();
    createGeographicDistributionChart();
    createFundingBubbleChart();
    createFundingTrendsChart();
    createFundingStageChart();
    createQuarterlyFundingChart();
    createGitHubReposChart();
    createPatentCategoryChart();
    createCompanyTable();
}

function updateMetrics() {
    // Metrics are already in HTML, but can be updated dynamically if needed
    if (dashboardData) {
        document.getElementById('companiesCount').textContent = dashboardData.overview.totalCompanies + '+';
        document.getElementById('marketSize').textContent = '$' + dashboardData.overview.marketSize;
        document.getElementById('githubRepos').textContent = dashboardData.overview.githubRepos;
        document.getElementById('totalFunding').textContent = '$' + dashboardData.overview.totalFunding;
    }
}

// Technology Category Chart (Pie Chart)
function createTechnologyCategoryChart() {
    const ctx = document.getElementById('techCategoryChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.technologies.categories : [
        { name: 'AI & Machine Learning', value: 24 },
        { name: 'Precision Agriculture', value: 18 },
        { name: 'Crop Management', value: 16 },
        { name: 'Data Analytics', value: 15 },
        { name: 'Farm Automation', value: 12 },
        { name: 'Biotechnology', value: 10 }
    ];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.value),
                backgroundColor: [
                    '#2c5f7c',
                    '#3a8a5d',
                    '#4a9f6e',
                    '#5ab57f',
                    '#6bc990',
                    '#7edfa1'
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
    const ctx = document.getElementById('geoDistributionChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.geography.distribution : [
        { country: 'United States', count: 28 },
        { country: 'India', count: 12 },
        { country: 'Israel', count: 8 },
        { country: 'Netherlands', count: 6 },
        { country: 'Germany', count: 5 },
        { country: 'Others', count: 4 }
    ];

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
    const ctx = document.getElementById('fundingBubbleChart').getContext('2d');
    
    const companies = dashboardData ? dashboardData.companies : [
        { name: 'Indigo Agriculture', funding: 1200, stage: 'Series F', year: 2021, employees: 850 },
        { name: 'Plenty', funding: 940, stage: 'Series E', year: 2022, employees: 500 },
        { name: 'Farmers Business Network', funding: 890, stage: 'Series G', year: 2021, employees: 600 },
        { name: 'Bowery Farming', funding: 647, stage: 'Series C', year: 2021, employees: 400 },
        { name: 'Pivot Bio', funding: 566, stage: 'Series D', year: 2022, employees: 350 },
        { name: 'Trace Genomics', funding: 185, stage: 'Series C', year: 2023, employees: 150 },
        { name: 'Taranis', funding: 150, stage: 'Series C', year: 2021, employees: 200 },
        { name: 'CropX', funding: 135, stage: 'Series C', year: 2022, employees: 120 },
        { name: 'AgShift', funding: 28, stage: 'Series B', year: 2023, employees: 80 },
        { name: 'FarmLogs', funding: 24, stage: 'Series B', year: 2020, employees: 60 },
        { name: 'Granular', funding: 110, stage: 'Acquired', year: 2017, employees: 200 },
        { name: 'Blue River Tech', funding: 92, stage: 'Acquired', year: 2017, employees: 150 },
        { name: 'OneSoil', funding: 15, stage: 'Series A', year: 2023, employees: 45 },
        { name: 'AgroStar', funding: 127, stage: 'Series D', year: 2022, employees: 300 },
        { name: 'eFishery', funding: 200, stage: 'Series C', year: 2022, employees: 250 }
    ];

    const stageColors = {
        'Series A': '#7edfa1',
        'Series B': '#6bc990',
        'Series C': '#5ab57f',
        'Series D': '#4a9f6e',
        'Series E': '#3a8a5d',
        'Series F': '#2c5f7c',
        'Series G': '#1e4a5f',
        'Acquired': '#e74c3c'
    };

    const datasets = Object.keys(stageColors).map(stage => {
        const stageCompanies = companies.filter(c => c.stage === stage);
        return {
            label: stage,
            data: stageCompanies.map(c => ({
                x: c.year,
                y: c.funding,
                r: Math.sqrt(c.funding) / 2,
                company: c.name,
                employees: c.employees
            })),
            backgroundColor: stageColors[stage] + '99',
            borderColor: stageColors[stage],
            borderWidth: 2
        };
    });

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

// Funding Trends Line Chart
function createFundingTrendsChart() {
    const ctx = document.getElementById('fundingTrendsChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.funding.trends : [
        { year: '2018', amount: 2100 },
        { year: '2019', amount: 2850 },
        { year: '2020', amount: 3400 },
        { year: '2021', amount: 5200 },
        { year: '2022', amount: 4100 },
        { year: '2023', amount: 3800 },
        { year: '2024', amount: 4500 },
        { year: '2025', amount: 5100 }
    ];

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
    const ctx = document.getElementById('fundingStageChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.funding.byStage : [
        { stage: 'Seed', amount: 245 },
        { stage: 'Series A', amount: 680 },
        { stage: 'Series B', amount: 1250 },
        { stage: 'Series C', amount: 2100 },
        { stage: 'Series D+', amount: 3850 },
        { stage: 'Acquired', amount: 4300 }
    ];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.stage),
            datasets: [{
                label: 'Total Funding ($M)',
                data: data.map(item => item.amount),
                backgroundColor: [
                    '#7edfa1',
                    '#6bc990',
                    '#5ab57f',
                    '#4a9f6e',
                    '#3a8a5d',
                    '#2c5f7c'
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
    const ctx = document.getElementById('quarterlyFundingChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.funding.quarterly : [
        { quarter: 'Q1 2024', amount: 950, deals: 23 },
        { quarter: 'Q2 2024', amount: 1100, deals: 28 },
        { quarter: 'Q3 2024', amount: 1250, deals: 31 },
        { quarter: 'Q4 2024', amount: 1200, deals: 27 },
        { quarter: 'Q1 2025', amount: 1350, deals: 34 }
    ];

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
    const ctx = document.getElementById('githubReposChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.github.topRepos : [
        { name: 'farmOS', stars: 2800, forks: 680 },
        { name: 'OpenAg-Brain', stars: 1950, forks: 420 },
        { name: 'AgDataCommons', stars: 1650, forks: 380 },
        { name: 'CropAnalyzer', stars: 1420, forks: 290 },
        { name: 'SmartFarm-AI', stars: 1280, forks: 315 },
        { name: 'AgroML', stars: 1150, forks: 265 },
        { name: 'PrecisionAg', stars: 980, forks: 210 },
        { name: 'FarmBot-OS', stars: 890, forks: 195 },
        { name: 'CropVision', stars: 750, forks: 165 },
        { name: 'SoilSense', stars: 620, forks: 140 }
    ];

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
    const ctx = document.getElementById('patentCategoryChart').getContext('2d');
    
    const data = dashboardData ? dashboardData.patents.byCategory : [
        { category: 'AI/ML Applications', count: 342 },
        { category: 'Sensor Technology', count: 285 },
        { category: 'Automation Systems', count: 218 },
        { category: 'Data Analytics', count: 196 },
        { category: 'Biotechnology', count: 156 },
        { category: 'IoT Devices', count: 145 },
        { category: 'Robotics', count: 128 },
        { category: 'Imaging Systems', count: 98 }
    ];

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

// Create Company Table
function createCompanyTable() {
    const container = document.getElementById('companyTable');
    
    const companies = dashboardData ? dashboardData.companies.slice(0, 10) : [
        { name: 'Indigo Agriculture', funding: 1200, location: 'USA', tech: 'Microbial Seed Treatments' },
        { name: 'Plenty', funding: 940, location: 'USA', tech: 'Vertical Farming' },
        { name: 'Farmers Business Network', funding: 890, location: 'USA', tech: 'Data Analytics' },
        { name: 'Bowery Farming', funding: 647, location: 'USA', tech: 'Indoor Farming' },
        { name: 'Pivot Bio', funding: 566, location: 'USA', tech: 'Nitrogen Fixation' },
        { name: 'eFishery', funding: 200, location: 'Indonesia', tech: 'Aquaculture Automation' },
        { name: 'Trace Genomics', funding: 185, location: 'USA', tech: 'Soil Testing' },
        { name: 'Taranis', funding: 150, location: 'Israel', tech: 'AI Crop Intelligence' },
        { name: 'CropX', funding: 135, location: 'Israel', tech: 'Soil Sensors' },
        { name: 'AgroStar', funding: 127, location: 'India', tech: 'AgTech Marketplace' }
    ];

    const table = `
        <div class="company-table">
            <table>
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Total Funding</th>
                        <th>Location</th>
                        <th>Technology</th>
                    </tr>
                </thead>
                <tbody>
                    ${companies.map(company => `
                        <tr>
                            <td><strong>${company.name}</strong></td>
                            <td>$${company.funding}M</td>
                            <td>${company.location}</td>
                            <td>${company.tech}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = table;
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
            link.style.borderBottomColor = '#3a8a5d';
        }
    });
});