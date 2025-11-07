const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas to full window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

// List of names - will be loaded from JSON file
let names = [];

// Load names from JSON file
fetch('names.json')
    .then(response => response.json())
    .then(data => {
        names = data.names;
        // Initialize after names are loaded
        initParticles();
        animate();
    })
    .catch(error => {
        console.error('Error loading names:', error);
        // Fallback names if JSON fails to load
        names = [
            'mohammed ramzi naim zaqqut',
            'ibrahim yasser mohammed mousa',
            'hamda shawqi diab al-awar',
            'yasser abdel rahman said shaheen',
            'mumin hussein mahmoud ishteiwi'
        ];
        initParticles();
        animate();
    });

// Mouse position
let mouse = {
    x: -1000,
    y: -1000
};

// Particle class
class Particle {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.size = 2;
        this.speedX = 0;
        this.speedY = 0;
    }
    
    update() {
        // Calculate distance from mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse repulsion radius - bigger on mobile for easier touch interaction
        const isMobile = window.innerWidth < 768;
        const maxDistance = isMobile ? 92.5 : 25;
        
        // Only move pixels if they're inside the circle
        if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            
            // Reduced randomness for less chaotic movement
            const randomForce = Math.random() * 0.3 + 0.7;
            const scatter = Math.random() * 5 + 3;
            
            // Push away from mouse with less variation
            const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
            this.speedX += -Math.cos(angle) * force * scatter * randomForce;
            this.speedY += -Math.sin(angle) * force * scatter * randomForce;
            
            // Less perpendicular motion
            this.speedX += Math.cos(angle + Math.PI / 2) * (Math.random() - 0.5) * 3;
            this.speedY += Math.sin(angle + Math.PI / 2) * (Math.random() - 0.5) * 3;
        }
        
        // Return to original position
        this.speedX += (this.targetX - this.x) * 0.08;
        this.speedY += (this.targetY - this.y) * 0.08;
        
        // Apply friction
        this.speedX *= 0.88;
        this.speedY *= 0.88;
        
        // Update position
        this.x += this.speedX;
        this.y += this.speedY;
    }
    
    draw() {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// Create particles from text
let particles = [];

function initParticles() {
    particles = [];
    
    // Responsive font size and spacing based on screen width
    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 28 : 22;
    const lineHeight = isMobile ? 65 : 60;
    const spacing = isMobile ? 100 : 120;
    
    ctx.font = `${fontSize}px serif`;
    ctx.fillStyle = '#fff';
    
    // Calculate how many rows we need
    const rows = Math.ceil(canvas.height / lineHeight) + 2;
    
    // For each row, place names and pixel fragments mixed together
    for (let row = 0; row < rows; row++) {
        const y = row * lineHeight + fontSize + (Math.random() * 30 - 15);
        let currentX = Math.random() * 100;
        
        while (currentX < canvas.width + 150) {
            // Randomly decide if this position should be a name or pixel fragment
            // Mobile: 60% names, 40% pixels | Desktop: 65% names, 35% pixels
            const nameThreshold = isMobile ? 0.40 : 0.35;
            const isName = Math.random() > nameThreshold;
            
            if (isName) {
                // Draw a name
                const name = names[Math.floor(Math.random() * names.length)];
                const text = name + ',';
                
                const textWidth = ctx.measureText(text).width;
                ctx.fillText(text, currentX, y);
                
                const imageData = ctx.getImageData(Math.floor(currentX), Math.floor(y - fontSize), Math.ceil(textWidth), fontSize + 2);
                const pixels = imageData.data;
                const imgWidth = Math.ceil(textWidth);
                
                for (let py = 0; py < fontSize + 2; py += 2) {
                    for (let px = 0; px < imgWidth; px += 2) {
                        const pixelIndex = (py * imgWidth + px) * 4;
                        const alpha = pixels[pixelIndex + 3];
                        
                        if (alpha > 128) {
                            const particleX = currentX + px;
                            const particleY = y - fontSize + py;
                            particles.push(new Particle(particleX, particleY, particleX, particleY));
                        }
                    }
                }
                
                currentX += textWidth + spacing + (Math.random() * 150);
            } else {
                // Draw a pixel fragment
                const fragmentLength = Math.floor(Math.random() * 40) + 20; // 20-60 pixels long
                const fragmentHeight = Math.floor(Math.random() * 8) + 2; // 2-10 pixels tall
                const yOffset = Math.random() * 12 - 6; // Random vertical offset
                
                for (let j = 0; j < fragmentLength; j += 2) {
                    // Add vertical variation - scatter pixels up and down
                    for (let k = 0; k < fragmentHeight; k += 2) {
                        if (Math.random() > 0.5) { // 50% chance for each pixel
                            const px = currentX + j;
                            const py = y + yOffset + (Math.random() * 6 - 3) + k - fragmentHeight/2;
                            particles.push(new Particle(px, py, px, py));
                        }
                    }
                }
                
                currentX += fragmentLength + spacing + (Math.random() * 150);
            }
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    console.log(`Initialized ${particles.length} particles`);
}

// Animation loop
function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animate);
}

// Mouse move event
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Touch move event for mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
}, { passive: false });

// Touch start event for mobile
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
});

// Touch end event for mobile
document.addEventListener('touchend', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

// Click to reload for desktop
canvas.addEventListener('click', () => {
    location.reload();
});

// Double-tap to reload for mobile
let lastTap = 0;
canvas.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    // If tapped twice within 300ms, it's a double-tap
    if (tapLength < 300 && tapLength > 0) {
        location.reload();
    }
    lastTap = currentTime;
});

// Mouse leave event
document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

// Window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});