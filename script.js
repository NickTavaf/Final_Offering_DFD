const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const namesImageLink = document.getElementById('namesImageLink');
const namesImage = document.getElementById('namesImage');

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
        this.isHeader = false;
    }
    
    update() {
        // Calculate distance from mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse repulsion radius - bigger on mobile for easier touch interaction
        const isMobile = window.innerWidth < 768;
        const maxDistance = isMobile ? 96 : 25;
        
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
        // Draw header particles in red, others in white
        ctx.fillStyle = this.isHeader ? '#ff0000' : '#fff';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// Create particles from text
let particles = [];

function initParticles() {
    particles = [];
    
    // Clear the entire canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Responsive font size and spacing based on screen width
    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 24 : 22;
    const lineHeight = isMobile ? 55 : 60;
    const spacing = isMobile ? 90 : 120;
    
    ctx.font = `${fontSize}px serif`;
    ctx.fillStyle = '#fff';
    
    // Add header text at the top
    const headerFontSize = isMobile ? 25 : 30;
    ctx.font = `${headerFontSize}px serif`;
    ctx.fillStyle = '#ff0000'; // Red color
    
    let headerY;
    
    if (isMobile) {
        // Mobile: Two lines
        headerY = 30;
        
        // Line 1: "These are the "
        const line1 = "These are the ";
        const line1Width = ctx.measureText(line1).width;
        const line1X = (canvas.width - line1Width) / 2 - 70; // Slight left offset
        
        ctx.fillText(line1, line1X, headerY);
        
        // Convert line 1 to particles
        let lineImageData = ctx.getImageData(Math.floor(line1X), Math.floor(headerY - headerFontSize), Math.ceil(line1Width), headerFontSize + 2);
        let linePixels = lineImageData.data;
        let lineImgWidth = Math.ceil(line1Width);
        
        for (let py = 0; py < headerFontSize + 2; py += 2) {
            for (let px = 0; px < lineImgWidth; px += 2) {
                const pixelIndex = (py * lineImgWidth + px) * 4;
                const alpha = linePixels[pixelIndex + 3];
                
                if (alpha > 128) {
                    const particleX = line1X + px;
                    const particleY = headerY - headerFontSize + py;
                    const particle = new Particle(particleX, particleY, particleX, particleY);
                    particle.isHeader = true;
                    particles.push(particle);
                }
            }
        }
        
        // Position the Names image
        const namesX = line1X + line1Width;
        const namesWidth = ctx.measureText("Names").width;
        
        // Set image size and position
        namesImage.style.height = `${headerFontSize * 1.2}px`;
        namesImageLink.style.top = `${headerY - headerFontSize + 3}px`;
        namesImageLink.style.left = `${namesX - 2}px`;
        namesImageLink.style.width = `${namesWidth}px`;
        
        // Line 2: " of the"
        const line2 = " of the";
        const line2X = namesX + namesWidth;
        ctx.fillText(line2, line2X, headerY);
        
        // Convert line 2 to particles
        const line2Width = ctx.measureText(line2).width;
        lineImageData = ctx.getImageData(Math.floor(line2X), Math.floor(headerY - headerFontSize), Math.ceil(line2Width), headerFontSize + 2);
        linePixels = lineImageData.data;
        lineImgWidth = Math.ceil(line2Width);
        
        for (let py = 0; py < headerFontSize + 2; py += 2) {
            for (let px = 0; px < lineImgWidth; px += 2) {
                const pixelIndex = (py * lineImgWidth + px) * 4;
                const alpha = linePixels[pixelIndex + 3];
                
                if (alpha > 128) {
                    const particleX = line2X + px;
                    const particleY = headerY - headerFontSize + py;
                    const particle = new Particle(particleX, particleY, particleX, particleY);
                    particle.isHeader = true;
                    particles.push(particle);
                }
            }
        }
        
        // Line 3: "journalists who have died in palestine"
        headerY += headerFontSize + 5;
        const line3 = "people who have died in palestine";
        const line3Width = ctx.measureText(line3).width;
        const line3X = (canvas.width - line3Width) / 2;
        
        ctx.fillText(line3, line3X, headerY);
        
        // Convert line 3 to particles
        lineImageData = ctx.getImageData(Math.floor(line3X), Math.floor(headerY - headerFontSize), Math.ceil(line3Width), headerFontSize + 2);
        linePixels = lineImageData.data;
        lineImgWidth = Math.ceil(line3Width);
        
        for (let py = 0; py < headerFontSize + 2; py += 2) {
            for (let px = 0; px < lineImgWidth; px += 2) {
                const pixelIndex = (py * lineImgWidth + px) * 4;
                const alpha = linePixels[pixelIndex + 3];
                
                if (alpha > 128) {
                    const particleX = line3X + px;
                    const particleY = headerY - headerFontSize + py;
                    const particle = new Particle(particleX, particleY, particleX, particleY);
                    particle.isHeader = true;
                    particles.push(particle);
                }
            }
        }
        
    } else {
        // Desktop: One line
        headerY = 50;
        
        const part1 = "These are the ";
        const part2 = " of the people who have died in palestine";
        
        // Calculate widths
        const part1Width = ctx.measureText(part1).width;
        const namesWidth = ctx.measureText("Names").width;
        const part2Width = ctx.measureText(part2).width;
        const totalWidth = part1Width + namesWidth + part2Width;
        
        const startX = (canvas.width - totalWidth) / 2;
        
        // Draw part 1: "These are the "
        ctx.fillText(part1, startX, headerY);
        
        // Convert part 1 to particles
        let lineImageData = ctx.getImageData(Math.floor(startX), Math.floor(headerY - headerFontSize), Math.ceil(part1Width), headerFontSize + 2);
        let linePixels = lineImageData.data;
        let lineImgWidth = Math.ceil(part1Width);
        
        for (let py = 0; py < headerFontSize + 2; py += 2) {
            for (let px = 0; px < lineImgWidth; px += 2) {
                const pixelIndex = (py * lineImgWidth + px) * 4;
                const alpha = linePixels[pixelIndex + 3];
                
                if (alpha > 128) {
                    const particleX = startX + px;
                    const particleY = headerY - headerFontSize + py;
                    const particle = new Particle(particleX, particleY, particleX, particleY);
                    particle.isHeader = true;
                    particles.push(particle);
                }
            }
        }
        
        // Position the Names image
        const namesX = startX + part1Width;
        
        // Set image size and position
        namesImage.style.height = `${headerFontSize * 1.19}px`;
        namesImageLink.style.top = `${headerY - headerFontSize + 3}px`;
        namesImageLink.style.left = `${namesX}px`;
        namesImageLink.style.width = `${namesWidth}px`;
        
        // Draw part 2: " of the journalists who have died in palestine"
        const part2X = namesX + namesWidth;
        ctx.fillText(part2, part2X, headerY);
        
        // Convert part 2 to particles
        lineImageData = ctx.getImageData(Math.floor(part2X), Math.floor(headerY - headerFontSize), Math.ceil(part2Width), headerFontSize + 2);
        linePixels = lineImageData.data;
        lineImgWidth = Math.ceil(part2Width);
        
        for (let py = 0; py < headerFontSize + 2; py += 2) {
            for (let px = 0; px < lineImgWidth; px += 2) {
                const pixelIndex = (py * lineImgWidth + px) * 4;
                const alpha = linePixels[pixelIndex + 3];
                
                if (alpha > 128) {
                    const particleX = part2X + px;
                    const particleY = headerY - headerFontSize + py;
                    const particle = new Particle(particleX, particleY, particleX, particleY);
                    particle.isHeader = true;
                    particles.push(particle);
                }
            }
        }
    }
    
    // Calculate where to start the names based on last header line
    const lastHeaderY = headerY;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px serif`;
    ctx.fillStyle = '#fff';
    
    // Calculate how many rows we need
    const rows = Math.ceil(canvas.height / lineHeight) + 2;
    
    // Edge padding to prevent cutoff
    const edgePadding = isMobile ? 20 : 30;
    
    // Start rows below the header
    const headerPadding = isMobile ? 5 : 10; // Can be any decimal value
    const startRow = Math.ceil((lastHeaderY + headerPadding) / lineHeight);
    
    // For each row, place names and pixel fragments mixed together
    for (let row = startRow; row < rows; row++) {
        const y = row * lineHeight + fontSize + (Math.random() * 30 - 15);
        let currentX = edgePadding + Math.random() * 50;
        
        while (currentX < canvas.width - edgePadding - (isMobile ? 0 : 150)) {
            // Randomly decide if this position should be a name or pixel fragment
            // Mobile: 60% names, 40% pixels | Desktop: 65% names, 35% pixels
            const nameThreshold = isMobile ? 0.40 : 0.35;
            const isName = Math.random() > nameThreshold;
            
            if (isName) {
                // Draw a name
                const name = names[Math.floor(Math.random() * names.length)];
                const text = name + ',';
                
                const textWidth = ctx.measureText(text).width;
                
                // Check if name would go past right edge
                if (currentX + textWidth > canvas.width - edgePadding) {
                    break; // Stop this row if name would be cut off
                }
                
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

// Click to regenerate names without page reload
canvas.addEventListener('click', () => {
    initParticles();
});

// Double-tap to regenerate for mobile
let lastTap = 0;
canvas.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    // If tapped twice within 300ms, it's a double-tap
    if (tapLength < 300 && tapLength > 0) {
        initParticles();
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