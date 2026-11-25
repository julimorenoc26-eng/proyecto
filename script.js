document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll("[data-tab]");
    const tabPanels = document.querySelectorAll(".tab-panel");
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const dropdownWrappers = document.querySelectorAll(".navbar-escalera");

    function closeAllDropdowns(exceptWrapper = null) {
        dropdownWrappers.forEach((wrapper) => {
            if (wrapper === exceptWrapper) return;
            wrapper.classList.remove("is-open");
            const trigger = wrapper.querySelector(".dropdown-trigger");
            if (trigger) trigger.setAttribute("aria-expanded", "false");
        });
    }

    function syncDropdownTriggers(tabName) {
        dropdownWrappers.forEach((wrapper) => {
            const trigger = wrapper.querySelector(".dropdown-trigger");
            if (!trigger) return;
            const hasActiveChild = Boolean(wrapper.querySelector(`[data-tab="${tabName}"]`));
            trigger.classList.toggle("is-active", hasActiveChild);
        });
    }

    function activateTab(tabName) {
        if (!tabName) return;

        const targetPanel = document.getElementById(`tab-${tabName}`);
        if (!targetPanel) return;

        // Ocultar todos los paneles y mostrar solo el seleccionado
        tabPanels.forEach((panel) => {
            const isTarget = panel === targetPanel;
            panel.hidden = !isTarget;
            panel.classList.toggle("active", isTarget);
        });

        // Actualizar estado activo en enlaces, pestañas y opciones del menú
        tabButtons.forEach((btn) => {
            const isTarget = btn.dataset.tab === tabName;
            btn.classList.toggle("active", isTarget);
            btn.classList.toggle("is-active", isTarget);
            if (btn.hasAttribute("aria-selected")) {
                btn.setAttribute("aria-selected", String(isTarget));
            }
        });

        syncDropdownTriggers(tabName);

        // Cerrar menús desplegables y menú móvil
        closeAllDropdowns(null);
        if (mobileMenu && mobileMenu.classList.contains("is-open")) {
            mobileMenu.classList.remove("is-open");
            if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
        }

        // Subir suavemente al inicio de la vista
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Exponer por si algún script externo la necesita
    window.activateTab = activateTab;

    // Evento único para todas las pestañas y botones con [data-tab]
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            const targetTab = btn.getAttribute("data-tab");
            if (!targetTab) return;

            if (btn.classList.contains("dropdown-item")) {
                event.stopPropagation();
            }
            activateTab(targetTab);
        });
    });

    // Menú desplegable en escalera para Sesión Didáctica 1 / Habilidades
    dropdownWrappers.forEach((wrapper) => {
        const trigger = wrapper.querySelector(".dropdown-trigger");
        if (!trigger) return;

        trigger.addEventListener("click", (event) => {
            event.stopPropagation();
            const willOpen = !wrapper.classList.contains("is-open");
            closeAllDropdowns(willOpen ? wrapper : null);
            wrapper.classList.toggle("is-open", willOpen);
            trigger.setAttribute("aria-expanded", String(willOpen));
        });
    });

    document.addEventListener("click", () => {
        closeAllDropdowns(null);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAllDropdowns(null);
        }
    });

    // Menú hamburguesa móvil
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("is-open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    // =========================================================
    // INVENTARIO INTERACTIVO: FILTROS
    // =========================================================
    const searchInput = document.getElementById("inv-search-input");
    const sedeSelect = document.getElementById("inv-filter-sede");
    const estadoSelect = document.getElementById("inv-filter-estado");
    const invCounter = document.getElementById("inv-counter");
    const invRows = document.querySelectorAll("#inv-table tbody tr");

    function filterInventory() {
        if (!invRows.length) return;
        const term = (searchInput?.value || "").toLowerCase().trim();
        const sedeVal = sedeSelect?.value || "all";
        const estadoVal = estadoSelect?.value || "all";
        let visibleCount = 0;

        invRows.forEach((row) => {
            const text = row.textContent.toLowerCase();
            const matchText = !term || text.includes(term);
            const matchSede = sedeVal === "all" || row.dataset.sede === sedeVal;
            const matchEstado = estadoVal === "all" || row.dataset.estado === estadoVal;

            const show = matchText && matchSede && matchEstado;
            row.style.display = show ? "" : "none";
            if (show) visibleCount++;
        });

        if (invCounter) {
            invCounter.textContent = `Mostrando ${visibleCount} de ${invRows.length} equipos`;
        }
    }

    searchInput?.addEventListener("input", filterInventory);
    sedeSelect?.addEventListener("change", filterInventory);
    estadoSelect?.addEventListener("change", filterInventory);

    // =========================================================
    // ARRASTRE HORIZONTAL (DRAG-TO-SCROLL) EN TABLAS
    // =========================================================
    function enableDragScroll(boxId) {
        const box = document.getElementById(boxId);
        if (!box) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        box.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            isDown = true;
            box.classList.add("is-dragging");
            startX = e.pageX - box.offsetLeft;
            scrollLeft = box.scrollLeft;
        });

        box.addEventListener("mouseleave", () => {
            isDown = false;
            box.classList.remove("is-dragging");
        });

        box.addEventListener("mouseup", () => {
            isDown = false;
            box.classList.remove("is-dragging");
        });

        box.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - box.offsetLeft;
            const walk = (x - startX) * 1.5;
            box.scrollLeft = scrollLeft - walk;
        });
    }

    enableDragScroll("inv-scroll-box");
    enableDragScroll("a1-scroll-box");
    enableDragScroll("a2-scroll-box");
    enableDragScroll("b1-scroll-box");
});