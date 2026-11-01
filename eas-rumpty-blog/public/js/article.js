/* ============================================
   EDITORIAL ARTICLE — JavaScript
   Table of contents, reading progress, scroll
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initReadingProgress();
    initTableOfContents();
    initTocToggle();
    initTocCollapse();
    initReadingTime();
    initHeaderScroll();
    initRevealAnimations();
});

/* ---------- Reading Progress ---------- */
function initReadingProgress() {
    const fill = document.getElementById('readingProgressFill');
    const progress = document.getElementById('readingProgress');
    if (!fill || !progress) return;

    const update = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) {
            fill.style.width = '0%';
            return;
        }
        const scrolled = Math.min(window.scrollY / docHeight, 1);
        const percent = Math.round(scrolled * 100);
        fill.style.width = `${percent}%`;
        progress.setAttribute('aria-valuenow', percent);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
}

/* ---------- Table of Contents ---------- */
function initTableOfContents() {
    const tocNav = document.getElementById('tocNav');
    const tocSidebar = document.getElementById('tocSidebar');
    const articleBody = document.getElementById('articleBody');
    if (!tocNav || !articleBody) return;

    // Gather all h2 and h3 headings with IDs
    const headings = Array.from(articleBody.querySelectorAll('h2[id], h3[id]'));
    if (!headings.length) return;

    // Build ToC links
    const fragment = document.createDocumentFragment();
    headings.forEach(heading => {
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.className = `toc-link${heading.tagName === 'H3' ? ' toc-link--h3' : ''}`;
        link.textContent = heading.textContent;
        link.setAttribute('data-target', heading.id);
        fragment.appendChild(link);
    });
    tocNav.appendChild(fragment);

    const tocLinks = tocNav.querySelectorAll('.toc-link');

    // --- Scroll-based active section tracking ---
    // This is far more reliable than IntersectionObserver for all edge cases:
    // collapsed/expanded sidebar, rapid scrolling, opening at any position.

    let currentActiveId = null;
    let isUserClicking = false; // Debounce flag to prevent jitter on click navigation

    function getActiveHeadingId() {
        const headerHeight = document.getElementById('siteHeader')?.offsetHeight || 56;
        const triggerLine = headerHeight + 80;

        // Check if scrolled to the very bottom of the document
        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
        if (isAtBottom && headings.length > 0) {
            return headings[headings.length - 1].id;
        }

        let activeId = null;

        for (let i = headings.length - 1; i >= 0; i--) {
            const rect = headings[i].getBoundingClientRect();
            if (rect.top <= triggerLine) {
                activeId = headings[i].id;
                break;
            }
        }

        // If no heading has passed the trigger line yet, use the first one
        // only if user has scrolled a bit
        if (!activeId && window.scrollY > 50 && headings.length > 0) {
            activeId = headings[0].id;
        }

        return activeId;
    }

    function setActiveLink(id) {
        if (id === currentActiveId) return;
        currentActiveId = id;

        tocLinks.forEach(link => link.classList.remove('active'));

        if (id) {
            const activeLink = tocNav.querySelector(`[data-target="${id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                tocNav.classList.add('has-active');

                // Auto-scroll sidebar to keep active link visible (only if not user-clicking)
                if (!isUserClicking && tocSidebar) {
                    scrollTocToActive(tocSidebar, activeLink);
                }
            }
        } else {
            tocNav.classList.remove('has-active');
        }
    }

    function updateActiveSection() {
        if (isUserClicking) return;
        const id = getActiveHeadingId();
        setActiveLink(id);
    }

    // Throttled scroll handler using rAF
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                updateActiveSection();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // Initial calculation
    updateActiveSection();

    // Expose for use by the collapse toggle (recalculate on expand)
    window._tocRecalculate = (immediate = false) => {
        const id = getActiveHeadingId();
        currentActiveId = id;

        tocLinks.forEach(link => {
            if (link.getAttribute('data-target') === id) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        if (id) {
            tocNav.classList.add('has-active');
            if (tocSidebar) {
                const activeLink = tocNav.querySelector(`[data-target="${id}"]`);
                if (activeLink) {
                    scrollTocToActive(tocSidebar, activeLink, immediate);
                }
            }
        } else {
            tocNav.classList.remove('has-active');
        }
    };

    // Smooth scroll on ToC link click
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (!target) return;

            // Lock auto-scroll to prevent jitter during animated scroll
            isUserClicking = true;

            // Immediately set this link as active
            tocLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            tocNav.classList.add('has-active');
            currentActiveId = targetId;

            const headerHeight = document.getElementById('siteHeader')?.offsetHeight || 56;
            const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

            window.scrollTo({
                top: targetPos,
                behavior: 'smooth'
            });

            // Unlock after scroll animation completes
            setTimeout(() => {
                isUserClicking = false;
                // Re-verify active state after scroll settles
                updateActiveSection();
            }, 900);

            // Close mobile ToC
            closeTocMobile();
        });
    });
}

/* Auto-scroll the ToC sidebar so the active link stays visible */
function scrollTocToActive(sidebar, activeEl, immediate = false) {
    if (!sidebar || !activeEl) return;

    const layout = document.querySelector('.article-layout');
    if (layout?.classList.contains('toc-collapsed')) return;

    const sidebarRect = sidebar.getBoundingClientRect();
    if (sidebarRect.width < 10) return;

    const activeRect = activeEl.getBoundingClientRect();

    const visibleTop = sidebarRect.top + 30;
    const visibleBottom = sidebarRect.bottom - 30;

    // Already visible with comfortable margins — don't scroll unless forced
    if (!immediate && activeRect.top >= visibleTop && activeRect.bottom <= visibleBottom) return;

    // Calculate scroll to center the active element in the sidebar
    const activeTopInSidebar = activeRect.top - sidebarRect.top + sidebar.scrollTop;
    const targetScroll = activeTopInSidebar - (sidebarRect.height / 2) + (activeRect.height / 2);

    sidebar.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: immediate ? 'auto' : 'smooth'
    });
}

/* ---------- ToC Toggle (Mobile/Tablet) ---------- */
function initTocToggle() {
    const toggle = document.getElementById('tocToggle');
    const sidebar = document.getElementById('tocSidebar');
    const overlay = document.getElementById('tocOverlay');
    const close = document.getElementById('tocClose');

    if (!toggle || !sidebar) return;

    const open = () => {
        sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        // Recalculate active section when opening mobile ToC
        if (typeof window._tocRecalculate === 'function') {
            window._tocRecalculate(true);
            setTimeout(() => window._tocRecalculate(true), 200);
        }
    };

    const closeFunc = () => {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', closeFunc);
    if (overlay) overlay.addEventListener('click', closeFunc);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeFunc();
        }
    });

    window._closeTocMobile = closeFunc;
}

function closeTocMobile() {
    if (typeof window._closeTocMobile === 'function') {
        window._closeTocMobile();
    }
}

/* ---------- ToC Collapse/Expand ---------- */
function initTocCollapse() {
    const btn = document.getElementById('tocCollapseBtn');
    const layout = document.querySelector('.article-layout');
    if (!btn || !layout) return;

    // Restore saved state
    const saved = localStorage.getItem('toc-collapsed');
    if (saved === 'true') {
        layout.classList.add('toc-collapsed');
    }

    // Helper to find visible reading anchor
    function getAnchor() {
        const headerHeight = document.getElementById('siteHeader')?.offsetHeight || 56;
        const targetY = headerHeight + 50;
        const articleMain = document.querySelector('.article-main');
        if (!articleMain) return null;

        const candidates = articleMain.querySelectorAll('h1, h2, h3, h4, p, pre, ul, ol, .callout, blockquote, hr, figure, table');
        for (const el of candidates) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= targetY && rect.bottom >= targetY) {
                return { el, top: rect.top };
            }
            if (rect.top > targetY) {
                return { el, top: rect.top };
            }
        }
        return null;
    }

    btn.addEventListener('click', () => {
        const wasCollapsed = layout.classList.contains('toc-collapsed');
        const anchor = getAnchor();

        // Toggle state
        layout.classList.toggle('toc-collapsed');
        const isCollapsed = layout.classList.contains('toc-collapsed');
        localStorage.setItem('toc-collapsed', isCollapsed);

        // Correct any scroll drift if it occurs
        if (anchor) {
            const newTop = anchor.el.getBoundingClientRect().top;
            const drift = newTop - anchor.top;
            if (Math.abs(drift) > 0.5) {
                window.scrollBy(0, drift);
            }
        }

        // When expanding: recalculate active heading and scroll ToC to it
        if (wasCollapsed && !isCollapsed) {
            if (typeof window._tocRecalculate === 'function') {
                window._tocRecalculate(true);
            }
            // Follow up once the 280ms sidebar width transition settles
            setTimeout(() => {
                if (typeof window._tocRecalculate === 'function') {
                    window._tocRecalculate(true);
                }
            }, 300);
        } else {
            if (typeof window._tocRecalculate === 'function') {
                window._tocRecalculate(false);
            }
        }
    });
}

/* ---------- Reading Time ---------- */
function initReadingTime() {
    const el = document.getElementById('readingTime');
    const body = document.getElementById('articleBody');
    if (!el || !body) return;

    const text = body.textContent || '';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 230));
    el.textContent = `${minutes} min read`;
}

/* ---------- Header Scroll Behavior ---------- */
function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const currentScroll = window.scrollY;

                if (currentScroll > 300 && currentScroll > lastScroll) {
                    header.classList.add('hidden');
                } else {
                    header.classList.remove('hidden');
                }

                lastScroll = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ---------- Reveal Animations ---------- */
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        reveals.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}
