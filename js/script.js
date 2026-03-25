(function() {
    const noButton = document.getElementById('noBtn');
    const yesButton = document.getElementById('yesBtn');
    const mainFrame = document.getElementById('mainFrame');
    const afterNoContent = document.getElementById('afterNoContent');
    const afterYesContent = document.getElementById('afterYesContent');
    const body = document.body;
    
    const secondContent = document.getElementById('secondContent');
    const firstImageContainer = document.getElementById('firstImageContainer');
    const firstTextContent = document.getElementById('firstTextContent');
    
    // Загрузка фото
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    const uploadedPhoto = document.getElementById('uploadedPhoto');
    
    const img = new Image();
    img.onload = function() {
        uploadedPhoto.src = 'images/1.jpg';
        uploadedPhoto.style.display = 'block';
        photoPlaceholder.style.display = 'none';
    };
    img.src = 'images/1.jpg';

    // Убегание кнопки Нет
    let mouseX = 0, mouseY = 0;
    let rafId = null;
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;
    let isNear = false;
    
    let lastMouseMoveTime = Date.now();
    const MOUSE_IDLE_TIME = 100;

    function updateMousePosition(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        lastMouseMoveTime = Date.now();
        
        if (!rafId) {
            rafId = requestAnimationFrame(animateButton);
        }
    }

    window.addEventListener('mousemove', updateMousePosition);

    function animateButton() {
        if (!noButton) return;

        const now = Date.now();
        const timeSinceLastMove = now - lastMouseMoveTime;
        
        if (timeSinceLastMove > MOUSE_IDLE_TIME) {
            targetX = 0;
            targetY = 0;
            isNear = false;
        } else {
            const rect = noButton.getBoundingClientRect();
            const buttonCenterX = rect.left + rect.width / 2;
            const buttonCenterY = rect.top + rect.height / 2;

            const distance = Math.hypot(mouseX - buttonCenterX, mouseY - buttonCenterY);
            
            if (distance < 180) {
                isNear = true;
                let dx = buttonCenterX - mouseX;
                let dy = buttonCenterY - mouseY;

                if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                    dx = 20;
                    dy = 20;
                }

                const length = Math.hypot(dx, dy);
                const intensity = Math.max(0, 1 - distance / 250);
                
                targetX = (dx / length) * 200 * intensity;
                targetY = (dy / length) * 160 * intensity;
                
                targetX = Math.max(-250, Math.min(250, targetX));
                targetY = Math.max(-150, Math.min(150, targetY));
            } else {
                targetX = 0;
                targetY = 0;
                isNear = false;
            }
        }

        const speed = 0.25;
        currentX += (targetX - currentX) * speed;
        currentY += (targetY - currentY) * speed;
        
        if (!isNear && Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
            currentX = 0;
            currentY = 0;
        }

        noButton.style.transform = `translate(${currentX}px, ${currentY}px)`;
        rafId = requestAnimationFrame(animateButton);
    }

    rafId = requestAnimationFrame(animateButton);

    // Таймеры для кнопки "Нет"
    let showSecondContentTimer = null;
    let returnToMainTimer = null;

    function resetToMainScreen() {
        afterNoContent.classList.remove('visible');
        secondContent.classList.remove('visible');
        body.classList.remove('bg-after-no');
        
        firstImageContainer.style.opacity = '1';
        firstTextContent.style.opacity = '1';
        
        mainFrame.classList.remove('hidden');
        
        noButton.style.display = 'inline-flex';
        yesButton.style.display = 'inline-flex';
        
        window.addEventListener('mousemove', updateMousePosition);
        
        if (!rafId) {
            rafId = requestAnimationFrame(animateButton);
        }
        
        if (showSecondContentTimer) {
            clearTimeout(showSecondContentTimer);
            showSecondContentTimer = null;
        }
        if (returnToMainTimer) {
            clearTimeout(returnToMainTimer);
            returnToMainTimer = null;
        }
    }

    // Обработчик кнопки "Нет"
    noButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        afterYesContent.classList.remove('visible');
        body.classList.remove('instagram-bg');
        
        mainFrame.classList.add('hidden');
        afterNoContent.classList.add('visible');
        
        window.removeEventListener('mousemove', updateMousePosition);
        
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        
        noButton.style.display = 'none';
        yesButton.style.display = 'none';

        showSecondContentTimer = setTimeout(() => {
            body.classList.add('bg-after-no');
            
            firstImageContainer.style.opacity = '0';
            firstTextContent.style.opacity = '0';
            
            secondContent.classList.add('visible');
            
            showSecondContentTimer = null;
            
            returnToMainTimer = setTimeout(() => {
                resetToMainScreen();
            }, 3000);
            
        }, 2000);
    });

    // Переменные для управления падающими смайликами
    let fallingEmojiInterval = null;
    const MAX_FALLING_EMOJIS = 45;

    // Функция для создания падающих смайликов
    function createFallingEmoji() {
        const existingEmojis = document.querySelectorAll('.falling-emoji').length;
        if (existingEmojis >= MAX_FALLING_EMOJIS) {
            const allEmojis = document.querySelectorAll('.falling-emoji');
            if (allEmojis.length > 0) {
                allEmojis[0].remove();
            }
        }

        const emojis = ['💖', '💝', '💖', '💝', '💖', '💝', '💖', '💝'];
        const emoji = document.createElement('div');
        emoji.classList.add('falling-emoji');
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        emoji.style.left = Math.random() * 100 + '%';
        
        const duration = Math.random() * 4 + 3;
        const delay = Math.random() * 2;
        emoji.style.animation = `fallRotate ${duration}s linear ${delay}s infinite`;
        
        const size = Math.random() * 1.2 + 2;
        emoji.style.fontSize = size + 'rem';
        
        document.body.appendChild(emoji);
        
        setTimeout(() => {
            if (emoji.parentNode) {
                emoji.remove();
            }
        }, (duration + delay) * 1000);
    }

    function startFallingEmojis() {
        const oldEmojis = document.querySelectorAll('.falling-emoji');
        oldEmojis.forEach(emoji => emoji.remove());
        
        for (let i = 0; i < 35; i++) {
            setTimeout(() => createFallingEmoji(), i * 80);
        }
        
        if (fallingEmojiInterval) {
            clearInterval(fallingEmojiInterval);
        }
        fallingEmojiInterval = setInterval(() => {
            createFallingEmoji();
        }, 250);
    }

    // Обработчик кнопки "Да"
    yesButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        afterNoContent.classList.remove('visible');
        secondContent.classList.remove('visible');
        body.classList.remove('bg-after-no');
        
        if (showSecondContentTimer) {
            clearTimeout(showSecondContentTimer);
            showSecondContentTimer = null;
        }
        if (returnToMainTimer) {
            clearTimeout(returnToMainTimer);
            returnToMainTimer = null;
        }
        
        mainFrame.classList.add('hidden');
        
        afterYesContent.classList.add('visible');
        
        body.classList.add('instagram-bg');
        
        startFallingEmojis();
        
        window.removeEventListener('mousemove', updateMousePosition);
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    });

    window.addEventListener('beforeunload', () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        if (showSecondContentTimer) {
            clearTimeout(showSecondContentTimer);
        }
        if (returnToMainTimer) {
            clearTimeout(returnToMainTimer);
        }
        if (fallingEmojiInterval) {
            clearInterval(fallingEmojiInterval);
        }
    });

    noButton.style.zIndex = '30';
    yesButton.style.zIndex = '25';
})();