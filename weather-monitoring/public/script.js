async function fetchDailySummaries() {
    try {
        const response = await fetch('/api/daily-summary');
        const data = await response.json();
        const tableBody = document.getElementById('weather-summary');

        // Clear existing data
        tableBody.innerHTML = '';

        // Insert new data
        data.forEach(summary => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(summary.date).toLocaleDateString()}</td>
                <td>${summary.averageTemperature}</td>
                <td>${summary.maximumTemperature}</td>
                <td>${summary.minimumTemperature}</td>
                <td>${summary.dominantCondition}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching daily summary:', error);
    }
}

async function setThreshold() {
    const threshold = document.getElementById('threshold').value;
    try {
        const response = await fetch('/api/threshold', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ threshold: parseFloat(threshold) }),
        });

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error('Error setting threshold:', error);
    }
}

// Fetch summaries when the page loads
window.onload = fetchDailySummary;
