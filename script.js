document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all feature cards
    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });

    // Button interaction
    const btn = document.getElementById('exploreBtn');
    btn.addEventListener('click', () => {
        // Smooth scroll to features
        const featuresSection = document.querySelector('.features');
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    });

    // --- Live Agent Monitor Logic ---
    const API_URL = 'http://localhost:3000/agents';
    let agents = []; // Will be populated from API

    // --- Chart Initialization ---
    const ctx = document.getElementById('agentChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Active', 'Thinking', 'Idle'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#4ade80', // Green (Active)
                    '#facc15', // Yellow (Thinking)
                    '#94a3b8'  // Grey (Idle)
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f8fafc', font: { family: 'Inter' } }
                }
            }
        }
    });

    function updateChart() {
        const activeCount = agents.filter(a => a.status === 'Active').length;
        const thinkingCount = agents.filter(a => a.status === 'Thinking').length;
        const idleCount = agents.length - activeCount - thinkingCount;

        chart.data.datasets[0].data = [activeCount, thinkingCount, idleCount];
        chart.update();
    }

    const agentGrid = document.getElementById('agentGrid');

    async function fetchAgents() {
        try {
            const response = await fetch(API_URL);
            agents = await response.json();
            renderAgents();
        } catch (error) {
            console.error('Error fetching agents:', error);
            agentGrid.innerHTML = '<p style="color: red;">Error connecting to agent network (Is json-server running?)</p>';
        }
    }

    function renderAgents() {
        updateChart(); // Update chart whenever we render
        agentGrid.innerHTML = '';
        agents.forEach(agent => {
            const card = document.createElement('div');
            card.className = 'agent-card';

            // Determine badge class based on status
            let statusClass = 'status-idle';
            if (agent.status === 'Active') statusClass = 'status-active';
            if (agent.status === 'Thinking') statusClass = 'status-thinking';

            card.innerHTML = `
                <div class="agent-info">
                    <span class="agent-name">${agent.name}</span>
                    <span class="agent-role">${agent.role}</span>
                </div>
                <div class="status-badge ${statusClass}">
                    ${agent.status}
                </div>
            `;
            agentGrid.appendChild(card);
        });
    }

    // Initial Load
    fetchAgents();

    // Simulate real-time updates (Randomly update local state for visual effect)
    // Note: In a real app, we might poll the server or use WebSockets
    setInterval(() => {
        if (agents.length === 0) return;

        const randomAgentIndex = Math.floor(Math.random() * agents.length);
        const statuses = ['Active', 'Thinking', 'Idle', 'Processing', 'Optimizing'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        agents[randomAgentIndex].status = randomStatus;
        renderAgents();
    }, 200);

    // --- Add New Agent Logic ---
    const addBtn = document.getElementById('addAgentBtn');
    addBtn.addEventListener('click', async () => {
        const randomNum = Math.floor(Math.random() * 1000);
        const newAgent = {
            name: `Agent-${randomNum}`,
            role: 'Auto-Deployed',
            status: 'Idle'
        };

        try {
            // Save to Database
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newAgent)
            });

            const savedAgent = await response.json();
            agents.push(savedAgent); // Add the saved agent (with ID) to local list
            renderAgents();
        } catch (error) {
            console.error('Error deploying agent:', error);
            alert('Failed to deploy agent. check console.');
        }
    });
});
