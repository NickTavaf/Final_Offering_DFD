const canvas = document.createElement('canvas');
canvas.id = 'particleCanvas';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '1';
document.body.style.background = '#000';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

class Particle {
    constructor(x, y, isRed = false) {
        this.x = x;
        this.y = y;
        this.size = 2;
        this.isRed = isRed;
    }
    
    draw(grayscale = false) {
        if (grayscale && this.isRed) {
            ctx.fillStyle = '#505050'; // Gray color
        } else {
            ctx.fillStyle = this.isRed ? '#ff0000' : '#fff';
        }
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

let particles = [];
let statementParticles = [];
let statementBounds = null;
let isHoveringStatement = false;

function wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function convertToParticles() {
    particles = [];
    statementParticles = [];
    
    const isMobile = window.innerWidth < 768;
    
    // Header
    const headerFontSize = isMobile ? 28 : 36;
    ctx.font = `${headerFontSize}px serif`;
    
    const headerText = "Artist Statement";
    const headerWidth = ctx.measureText(headerText).width;
    const headerX = (canvas.width - headerWidth) / 2;
    const headerY = isMobile ? 60 : 80;
    
    // Calculate "Statement" bounds for click detection
    const artistWidth = ctx.measureText("Artist ").width;
    const statementWidth = ctx.measureText("Statement").width;
    statementBounds = {
        x: headerX + artistWidth,
        y: headerY - headerFontSize,
        width: statementWidth,
        height: headerFontSize + 10
    };
    
    ctx.fillStyle = '#ff0000';
    ctx.fillText(headerText, headerX, headerY);
    
    // Create particles for "Artist "
    createParticles("Artist ", headerX, headerY, headerFontSize, true, false);
    
    // Create particles for "Statement" separately so we can track them
    createParticles("Statement", headerX + artistWidth, headerY, headerFontSize, true, true);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Content
    const contentFontSize = isMobile ? 19 : 20;
    ctx.font = `${contentFontSize}px monospace`;
    ctx.fillStyle = '#fff';
    
    const maxWidth = isMobile ? canvas.width - 40 : 700;
    const contentX = (canvas.width - maxWidth) / 2;
    const contentStartY = headerY + (isMobile ? 80 : 120);
    
    const paragraph = "This work explores the fragmented nature of memory and testimony, rendering names as particles that disperse and reform. Each interaction disrupts the surface, scattering individual stories before they coalesce again—a visual metaphor for how collective memory is continuously shaped and reshaped. The particles respond to presence, acknowledging the viewer's role in bearing witness. Through this digital memorial, we confront the tension between remembering and forgetting, between permanence and erasure. The names persist, returning to their positions despite disruption, insisting on being seen, being counted, being remembered.";
    
    const lines = wrapText(ctx, paragraph, maxWidth);
    const lineHeight = contentFontSize * 1.8;
    
    lines.forEach((line, index) => {
        const y = contentStartY + (index * lineHeight);
        ctx.fillText(line, contentX, y);
        createParticles(line, contentX, y, contentFontSize, false, false);
    });
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Hide original elements
    const header = document.querySelector('header');
    const content = document.querySelector('.content');
    if (header) header.style.display = 'none';
    if (content) content.style.display = 'none';
}

function createParticles(text, x, y, fontSize, isRed, isStatement) {
    const textWidth = ctx.measureText(text).width;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = Math.ceil(textWidth);
    tempCanvas.height = fontSize + 4;
    
    tempCtx.font = ctx.font;
    tempCtx.fillStyle = isRed ? '#ff0000' : '#fff';
    tempCtx.fillText(text, 0, fontSize);
    
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    for (let py = 0; py < tempCanvas.height; py += 2) {
        for (let px = 0; px < tempCanvas.width; px += 2) {
            const index = (py * tempCanvas.width + px) * 4;
            const alpha = pixels[index + 3];
            
            if (alpha > 128) {
                const particle = new Particle(x + px, y - fontSize + py, isRed);
                if (isStatement) {
                    statementParticles.push(particle);
                } else {
                    particles.push(particle);
                }
            }
        }
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw regular particles
    particles.forEach(particle => {
        particle.draw(false);
    });
    
    // Draw statement particles with grayscale if hovering
    statementParticles.forEach(particle => {
        particle.draw(isHoveringStatement);
    });
    
    requestAnimationFrame(animate);
}

// Make canvas clickable for "Statement"
canvas.style.pointerEvents = 'auto';
canvas.style.cursor = 'default';

canvas.addEventListener('mousemove', (e) => {
    if (statementBounds && 
        e.clientX >= statementBounds.x && 
        e.clientX <= statementBounds.x + statementBounds.width &&
        e.clientY >= statementBounds.y && 
        e.clientY <= statementBounds.y + statementBounds.height) {
        canvas.style.cursor = 'pointer';
        isHoveringStatement = true;
    } else {
        canvas.style.cursor = 'default';
        isHoveringStatement = false;
    }
});

canvas.addEventListener('click', (e) => {
    if (statementBounds && 
        e.clientX >= statementBounds.x && 
        e.clientX <= statementBounds.x + statementBounds.width &&
        e.clientY >= statementBounds.y && 
        e.clientY <= statementBounds.y + statementBounds.height) {
        window.location.href = 'index.html';
    }
});

window.addEventListener('resize', () => {
    resizeCanvas();
    convertToParticles();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        convertToParticles();
        animate();
    }, 100);
});