// ===== Sidebar Nav Drawer — neumorphic morphing rail (Libra CareerForge) =====
// Adapted from the sn3n mockup: app routing, FontAwesome icons, Navy/Gold theme.

const SidebarNav = {
    drawer: null,
    backdrop: null,
    rail: null,
    panel: null,
    titleEl: null,
    subList: null,
    closeBtn: null,
    topBtns: [],
    openItem: null,
    _uid: 0,

    init() {
        this.drawer = document.getElementById('sidebar-drawer');
        this.backdrop = document.getElementById('sidebar-backdrop');
        this.rail = this.drawer.querySelector('.sn3n-rail');
        this.panel = this.rail.querySelector('.sn3n-panel');
        this.titleEl = this.rail.querySelector('.sn3n-panel-title');
        this.subList = this.rail.querySelector('.sn3n-sub');
        this.closeBtn = this.rail.querySelector('.sn3n-close');
        this.topBtns = Array.from(this.rail.querySelectorAll('.sn3n-bar .sn3n-btn'));
        this.brandBtn = this.rail.querySelector('.sn3n-brand-btn');

        this.panel.id = 'sn3n-panel-' + (++this._uid);
        this.rail.querySelectorAll('[data-sn3n-sub] > .sn3n-btn')
            .forEach(b => b.setAttribute('aria-controls', this.panel.id));
        this.panel.setAttribute('aria-hidden', 'true');

        // open / close drawer
        document.getElementById('menu-btn').addEventListener('click', () => this.openDrawer());
        this.backdrop.addEventListener('click', () => this.closeDrawer());

        // brand → home
        this.brandBtn.addEventListener('click', () => this.go('home'));

        // top-level buttons
        this.topBtns.forEach(btn => {
            const item = btn.closest('.sn3n-item');
            const hasSub = item && item.hasAttribute('data-sn3n-sub');
            btn.addEventListener('click', () => {
                if (hasSub) {
                    if (this.openItem === item) this.closeSub(true);
                    else this.openSub(item);
                } else {
                    this.go(btn.dataset.route);
                }
            });
        });

        // panel close collapses the submenu
        this.closeBtn.addEventListener('click', () => this.closeSub(true));

        // Escape: collapse submenu first, then drawer
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (this.openItem) this.closeSub(true);
            else if (this.drawer.classList.contains('open')) this.closeDrawer();
        });

        // sync active state with route changes
        this.syncActive();
        window.addEventListener('hashchange', () => this.syncActive());
    },

    // ---- drawer ----
    openDrawer() {
        this.drawer.classList.add('open');
        this.backdrop.classList.add('open');
        this.drawer.setAttribute('aria-hidden', 'false');
    },

    closeDrawer() {
        this.drawer.classList.remove('open');
        this.backdrop.classList.remove('open');
        this.drawer.setAttribute('aria-hidden', 'true');
        this.closeSub(false);
    },

    // ---- submenu morph ----
    openSub(item) {
        const btn = item.querySelector('.sn3n-btn');
        const tpl = item.querySelector('.sn3n-subdata');
        this.titleEl.textContent = tpl.getAttribute('data-title') || '';
        this.panel.setAttribute('aria-label', this.titleEl.textContent);
        this.subList.innerHTML = '';
        tpl.content.querySelectorAll('li').forEach(li => {
            const subBtn = document.createElement('button');
            subBtn.type = 'button';
            subBtn.className = 'sn3n-sub-btn';
            subBtn.textContent = li.textContent;
            subBtn.addEventListener('click', () => {
                this.subList.querySelectorAll('.sn3n-sub-btn')
                    .forEach(x => x.removeAttribute('aria-current'));
                subBtn.setAttribute('aria-current', 'true');
                this.go(li.dataset.route);
            });
            const liEl = document.createElement('li');
            liEl.appendChild(subBtn);
            this.subList.appendChild(liEl);
        });
        this.rail.setAttribute('data-open', '');
        this.panel.setAttribute('aria-hidden', 'false');
        this.topBtns.forEach(b => { if (b.hasAttribute('aria-haspopup')) b.setAttribute('aria-expanded', 'false'); });
        btn.setAttribute('aria-expanded', 'true');
        this.setActive(btn);
        this.openItem = item;
    },

    closeSub(returnFocus) {
        if (!this.openItem) return;
        const btn = this.openItem.querySelector('.sn3n-btn');
        this.rail.removeAttribute('data-open');
        this.panel.setAttribute('aria-hidden', 'true');
        btn.setAttribute('aria-expanded', 'false');
        if (returnFocus) btn.focus();
        this.openItem = null;
    },

    setActive(btn) {
        this.topBtns.forEach(b => b.removeAttribute('aria-current'));
        btn.setAttribute('aria-current', 'page');
    },

    // navigate + close
    go(route) {
        if (window.App && typeof App.navigate === 'function') App.navigate(route);
        else window.location.hash = '#/' + route;
        this.closeDrawer();
    },

    // keep the rail in sync with the current route
    syncActive() {
        const hash = (window.location.hash.slice(2) || 'home');
        const route = hash.split('/')[0];
        let target = route;
        // reports + interview live under Settings group
        if (route === 'reports' || route === 'interview') target = 'settings';
        this.topBtns.forEach(b => {
            const bRoute = (b.dataset.route || '').split('/')[0];
            if (bRoute === target) b.setAttribute('aria-current', 'page');
            else b.removeAttribute('aria-current');
        });
    },
};

document.addEventListener('DOMContentLoaded', () => SidebarNav.init());
