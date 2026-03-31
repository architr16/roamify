document.addEventListener('DOMContentLoaded', () => {

    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => appearOnScroll.observe(fader));

    const initWishlistButtons = () => {
        const wishlist = JSON.parse(localStorage.getItem('roamify_wishlist') || '[]');
        
        // Add heart button to all .card elements on currently viewed page
        document.querySelectorAll('.card').forEach(card => {
            // Prevent adding twice if script runs multiple times
            if(card.querySelector('.wishlist-btn')) return;

            const btn = document.createElement('button');
            btn.className = 'wishlist-btn';
            btn.innerHTML = '♡';
            
            // Extract identifer details from card
            const title = card.querySelector('.card-title')?.textContent;
            const desc = card.querySelector('.card-desc')?.innerHTML;
            const imgSrc = card.querySelector('.card-img')?.src;
            
            if(!title) return; // Skip if it's a gallery image with no title

            // Check if already in wishlist
            const exists = wishlist.some(item => item.title === title);
            if(exists) {
                btn.classList.add('active');
                btn.innerHTML = '♥';
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                let currentList = JSON.parse(localStorage.getItem('roamify_wishlist') || '[]');
                const idx = currentList.findIndex(item => item.title === title);
                
                if (idx > -1) {
                    // Remove
                    currentList.splice(idx, 1);
                    btn.classList.remove('active');
                    btn.innerHTML = '♡';
                } else {
                    // Add
                    currentList.push({ title, desc, imgSrc });
                    btn.classList.add('active');
                    btn.innerHTML = '♥';
                }
                localStorage.setItem('roamify_wishlist', JSON.stringify(currentList));
            });

            card.appendChild(btn);
        });
    };
    initWishlistButtons();

    const wishlistGrid = document.getElementById('wishlist-grid');
    if (wishlistGrid) {
        const wishlist = JSON.parse(localStorage.getItem('roamify_wishlist') || '[]');
        if (wishlist.length === 0) {
            wishlistGrid.parentElement.innerHTML += '<p class="empty-state">Your wishlist is empty. Start exploring!</p>';
        } else {
            wishlist.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card fade-in appear'; // auto-appear
                card.innerHTML = `
                    <button class="wishlist-btn active" style="z-index:99" data-title="${item.title}">♥</button>
                    ${item.imgSrc ? `<img class="card-img" src="${item.imgSrc}" alt="${item.title}" />` : ''}
                    <div class="card-body">
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-desc">${item.desc}</p>
                    </div>
                `;
                // Add removal listener specifically for wishlist page
                const rmBtn = card.querySelector('.wishlist-btn');
                rmBtn.addEventListener('click', () => {
                    let currentList = JSON.parse(localStorage.getItem('roamify_wishlist') || '[]');
                    currentList = currentList.filter(i => i.title !== item.title);
                    localStorage.setItem('roamify_wishlist', JSON.stringify(currentList));
                    card.style.display = 'none'; // visually remove
                    if(currentList.length === 0) {
                        wishlistGrid.innerHTML = '';
                        wishlistGrid.parentElement.innerHTML += '<p class="empty-state">Your wishlist is empty. Start exploring!</p>';
                    }
                });
                wishlistGrid.appendChild(card);
            });
        }
    }


    // --- Dynamic Search & Filter Logic ---
    const bindSearch = (inputId, gridId) => {
        const input = document.getElementById(inputId);
        const grid = document.getElementById(gridId);
        if (!input || !grid) return;

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = grid.querySelectorAll('.card');
            
            cards.forEach(card => {
                const title = card.querySelector('.card-title')?.textContent.toLowerCase() || "";
                const desc = card.querySelector('.card-desc')?.textContent.toLowerCase() || "";
                
                if (title.includes(query) || desc.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    };
    bindSearch('dest-search', 'dest-grid');
    bindSearch('pkg-search', 'pkg-grid');


    // --- Fullscreen Gallery Lightbox ---
    const galleryGrid = document.querySelector('#gallery .grid');
    if (galleryGrid) {
        // Create lightbox overlay exactly once
        const lb = document.createElement('div');
        lb.id = 'lightbox';
        lb.innerHTML = `
            <span class="close-lightbox">&times;</span>
            <img id="lightbox-img" src="" alt="Zoomed image">
        `;
        document.body.appendChild(lb);

        const lbImg = document.getElementById('lightbox-img');
        
        galleryGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('card-img')) {
                lbImg.src = e.target.src;
                lb.classList.add('active');
            }
        });

        lb.addEventListener('click', (e) => {
            if (e.target.id === 'lightbox' || e.target.classList.contains('close-lightbox')) {
                lb.classList.remove('active');
            }
        });
    }

    // --- Modals Logic ---
    const setupModal = (modalId, closeBtnId, triggerSelector, onTriggerCb) => {
        const modal = document.getElementById(modalId);
        if(!modal) return;
        
        const closeBtn = document.getElementById(closeBtnId);
        const triggers = document.querySelectorAll(triggerSelector);

        triggers.forEach(btn => {
            btn.addEventListener('click', () => {
                if(onTriggerCb) onTriggerCb(btn);
                modal.classList.add('active');
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        }
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    };

    // Pricing Modal
    setupModal('pricing-modal', 'close-pricing', '.price-btn', (btn) => {
        document.getElementById('pricing-dest-name').textContent = btn.getAttribute('data-dest');
    });

    // Booking Modal
    let activePackageId = '';
    setupModal('booking-modal', 'close-booking', '.book-btn', (btn) => {
        activePackageId = btn.getAttribute('data-package');
        document.getElementById('booking-package-name').textContent = `Package: ${activePackageId}`;
    });

    // --- Form Validation & Submission ---
    
    // Email Regex
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    // Strict phone Regex (at least 10 digits/characters, allows +, brackets, spaces)
    const validatePhone = (phone) => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone);

    const showSuccessPopup = (title, message) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal-content" style="text-align: center; max-width: 400px; padding: 2.5rem;">
                <button class="close-modal" aria-label="Close">&times;</button>
                <div style="font-size: 3.5rem; color: #ea580c; margin-bottom: 1rem;">&#10003;</div>
                <h3 style="margin-bottom: 1rem; font-family: var(--font-serif); font-size: 2rem;">${title}</h3>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${message}</p>
                <button class="btn btn-primary" style="width: 100%;">Okay</button>
            </div>
        `;
        document.body.appendChild(overlay);

        const closeBtn = overlay.querySelector('.close-modal');
        const okayBtn = overlay.querySelector('.btn-primary');
        
        const closeOverlay = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };

        closeBtn.addEventListener('click', closeOverlay);
        okayBtn.addEventListener('click', closeOverlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOverlay();
        });
    };

    const bookingForm = document.getElementById('booking-form');
    if(bookingForm) {
        const emailInput = document.getElementById('book-email');
        const phoneInput = document.getElementById('book-phone');
        const errSpan = document.getElementById('book-error');

        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            errSpan.textContent = '';
            
            if (!validateEmail(emailInput.value)) {
                errSpan.textContent = 'Please enter a valid email address.';
                return;
            }
            if (!validatePhone(phoneInput.value)) {
                errSpan.textContent = 'Please enter a valid 10+ digit phone number.';
                return;
            }

            const btn = document.getElementById('book-submit');
            const og = btn.textContent;
            btn.textContent = 'Processing...';

            const payload = {
                fullName: document.getElementById('book-name').value,
                email: emailInput.value,
                phone: phoneInput.value,
                packageId: activePackageId
            };

            btn.disabled = true;
            fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    showSuccessPopup('Booking Confirmed!', 'Your booking has been successfully recorded. Our agents will contact you shortly.');
                    document.getElementById('booking-modal').classList.remove('active');
                    bookingForm.reset();
                } else {
                    alert('Error: ' + (data.error || 'Failed to submit booking.'));
                }
            })
            .catch(err => {
                console.error(err);
                alert('A network error occurred.');
            })
            .finally(() => {
                btn.textContent = og;
                btn.disabled = false;
            });
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const og = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            const payload = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                phone: document.getElementById('contact-phone').value,
                message: document.getElementById('contact-desc').value
            };

            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    showSuccessPopup('Inquiry Sent!', 'Your inquiry has been successfully sent. Our team will contact you shortly.');
                    contactForm.reset();
                } else {
                    alert('Error: ' + (data.error || 'Failed to send inquiry.'));
                }
            })
            .catch(err => {
                console.error(err);
                alert('A network error occurred.');
            })
            .finally(() => {
                btn.textContent = og;
                btn.disabled = false;
            });
        });
    }


});