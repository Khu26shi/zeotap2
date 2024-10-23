const ctx = document.getElementById('weatherChart').getContext('2d');
const weatherChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'],
    datasets: [{
      label: 'Average Temperature (°C)',
      data: [25, 30, 28, 27, 26, 29],  // Dummy data, replace with API data
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
