// =====================================================
// SWIPEX - NOTIFICATION BELL
// =====================================================

(function () {

    console.log("🔔 notifications.js loaded");

    const API_URL = window.API_BASE_URL;
    const token =
        localStorage.getItem("token");

    console.log(
        "🔑 Token exists:",
        !!token
    );


    // =====================================================
    // STYLES
    // =====================================================

    const style =
        document.createElement("style");

    style.textContent = `

        #notifBellWrapper {

            position: fixed;

            top: 20px;

            right: 25px;

            z-index: 999999;

            font-family: Arial, sans-serif;

        }


        #notifBellBtn {

            width: 50px;

            height: 50px;

            border-radius: 50%;

            border: none;

            background: #1e293b;

            color: white;

            font-size: 23px;

            cursor: pointer;

            display: flex;

            align-items: center;

            justify-content: center;

            position: relative;

            box-shadow:
                0 4px 15px
                rgba(0,0,0,0.35);

        }


        #notifBellBtn:hover {

            transform: scale(1.05);

        }


        #notifBadge {

            position: absolute;

            top: -5px;

            right: -5px;

            min-width: 20px;

            height: 20px;

            padding: 0 5px;

            background: #ef4444;

            color: white;

            border-radius: 20px;

            font-size: 11px;

            font-weight: bold;

            display: none;

            align-items: center;

            justify-content: center;

        }


        #notifDropdown {

            position: absolute;

            top: 60px;

            right: 0;

            width: 350px;

            max-height: 450px;

            overflow-y: auto;

            background: #ffffff;

            border-radius: 14px;

            box-shadow:
                0 10px 35px
                rgba(0,0,0,0.3);

            border: 1px solid #e5e7eb;

            display: none;

            padding: 12px;

        }


        #notifDropdown.open {

            display: block;

        }


        #notifHeader {

            display: flex;

            justify-content: space-between;

            align-items: center;

            padding: 8px;

            margin-bottom: 8px;

        }


        #notifHeader h3 {

            margin: 0;

            font-size: 17px;

            color: #111827;

        }


        #markAllBtn {

            border: none;

            background: transparent;

            color: #4f46e5;

            cursor: pointer;

            font-size: 12px;

        }


        .notif-item {

            background: #f8fafc;

            border-radius: 10px;

            padding: 12px;

            margin-bottom: 8px;

            color: #1f2937;

            cursor: pointer;

            border-left: 4px solid #6366f1;

        }


        .notif-item.unread {

            background: #eef2ff;

            border-left-color: #22c55e;

        }


        .notif-title {

            font-weight: bold;

            margin-bottom: 5px;

        }


        .notif-message {

            font-size: 13px;

            line-height: 1.4;

        }


        .notif-time {

            margin-top: 6px;

            font-size: 11px;

            color: #6b7280;

        }


        .notif-empty {

            text-align: center;

            padding: 30px 10px;

            color: #6b7280;

        }


        .notif-error {

            text-align: center;

            padding: 20px 10px;

            color: #dc2626;

            font-size: 13px;

        }

    `;

    document.head.appendChild(style);


    // =====================================================
    // CREATE BELL
    // =====================================================

    const wrapper =
        document.createElement("div");

    wrapper.id =
        "notifBellWrapper";


    wrapper.innerHTML = `

        <button
            id="notifBellBtn"
            type="button"
            title="Notifications">

            🔔

            <span id="notifBadge">
                0
            </span>

        </button>


        <div id="notifDropdown">

            <div id="notifHeader">

                <h3>
                    🔔 Notifications
                </h3>

                <button
                    id="markAllBtn"
                    type="button">

                    Mark all read

                </button>

            </div>


            <div id="notifList">

                <div class="notif-empty">

                    Loading...

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(wrapper);


    // =====================================================
    // GET ELEMENTS
    // =====================================================

    const bellBtn =
        document.getElementById(
            "notifBellBtn"
        );

    const dropdown =
        document.getElementById(
            "notifDropdown"
        );

    const badge =
        document.getElementById(
            "notifBadge"
        );

    const list =
        document.getElementById(
            "notifList"
        );

    const markAllBtn =
        document.getElementById(
            "markAllBtn"
        );


    // =====================================================
    // BELL CLICK
    // =====================================================

    bellBtn.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();

            console.log(
                "🔔 Bell clicked"
            );


            const isOpen =
                dropdown.classList.contains(
                    "open"
                );


            if (isOpen) {

                dropdown.classList.remove(
                    "open"
                );

                return;

            }


            dropdown.classList.add(
                "open"
            );


            await loadNotifications();

        }
    );


    // =====================================================
    // PREVENT DROPDOWN CLOSING
    // =====================================================

    dropdown.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );


    // =====================================================
    // CLOSE WHEN CLICKING OUTSIDE
    // =====================================================

    document.addEventListener(
        "click",
        function () {

            dropdown.classList.remove(
                "open"
            );

        }
    );


    // =====================================================
    // ICON
    // =====================================================

    function iconFor(type) {

        const icons = {

            new_job: "🆕",

            high_match: "🎯",

            low_competition: "🟢",

            status_update: "📋"

        };

        return (
            icons[type] ||
            "🔔"
        );

    }


    // =====================================================
    // FORMAT TIME
    // =====================================================

    function formatTime(dateString) {

        if (!dateString) {

            return "";

        }

        try {

            return new Date(
                dateString
            ).toLocaleString();

        }

        catch {

            return "";

        }

    }


    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    async function loadNotifications() {

        console.log(
            "📥 Loading notifications..."
        );


        if (!token) {

            list.innerHTML = `

                <div class="notif-error">

                    🔐 Please login first.

                </div>

            `;

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/notifications/me?limit=20`,
                    {

                        method: "GET",

                        headers: {

                            "Authorization":
                                "Bearer " + token,

                            "Content-Type":
                                "application/json"

                        }

                    }
                );


            console.log(
                "📡 Notification status:",
                response.status
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    "❌ Notification API error:",
                    errorText
                );


                list.innerHTML = `

                    <div class="notif-error">

                        ❌ Unable to load notifications.

                        <br><br>

                        API Status:
                        ${response.status}

                    </div>

                `;

                return;

            }


            const notifications =
                await response.json();


            console.log(
                "🔔 Notifications:",
                notifications
            );


            if (
                !Array.isArray(
                    notifications
                ) ||
                notifications.length === 0
            ) {

                list.innerHTML = `

                    <div class="notif-empty">

                        🎉 You're all caught up!

                        <br><br>

                        No notifications yet.

                    </div>

                `;

                return;

            }


            list.innerHTML =
                notifications
                    .map(
                        notification => `

                    <div
                        class="notif-item ${
                            notification.is_read
                                ? ""
                                : "unread"
                        }"
                        data-id="${
                            notification.id
                        }">

                        <div class="notif-title">

                            ${
                                iconFor(
                                    notification.type
                                )
                            }

                            ${
                                notification.title ||
                                "Notification"
                            }

                        </div>


                        <div class="notif-message">

                            ${
                                notification.message ||
                                ""
                            }

                        </div>


                        <div class="notif-time">

                            ${
                                formatTime(
                                    notification.created_at
                                )
                            }

                        </div>

                    </div>

                `
                    )
                    .join("");


            // ---------------------------------------------
            // CLICK NOTIFICATION
            // ---------------------------------------------

            list
                .querySelectorAll(
                    ".notif-item"
                )
                .forEach(
                    item => {

                        item.addEventListener(
                            "click",
                            async function () {

                                const id =
                                    this.dataset.id;

                                await markRead(
                                    id,
                                    this
                                );

                            }
                        );

                    }
                );

        }

        catch (error) {

            console.error(
                "❌ Notification error:",
                error
            );


            list.innerHTML = `

                <div class="notif-error">

                    ❌ Could not connect to backend.

                    <br><br>

                    Make sure FastAPI is running.

                </div>

            `;

        }

    }


    // =====================================================
    // MARK READ
    // =====================================================

    async function markRead(
        id,
        item
    ) {

        try {

            await fetch(
                `${API_URL}/notifications/mark-read/${id}`,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }

                }
            );


            item.classList.remove(
                "unread"
            );


            fetchUnreadCount();

        }

        catch (error) {

            console.error(
                "Mark read error:",
                error
            );

        }

    }


    // =====================================================
    // MARK ALL READ
    // =====================================================

    markAllBtn.addEventListener(
        "click",
        async function () {

            try {

                await fetch(
                    `${API_URL}/notifications/mark-all-read`,
                    {

                        method: "POST",

                        headers: {

                            "Authorization":
                                "Bearer " + token

                        }

                    }
                );


                await loadNotifications();

                await fetchUnreadCount();

            }

            catch (error) {

                console.error(
                    "Mark all read error:",
                    error
                );

            }

        }
    );


    // =====================================================
    // UNREAD COUNT
    // =====================================================

    async function fetchUnreadCount() {

        if (!token) {

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/notifications/unread-count`,
                    {

                        headers: {

                            "Authorization":
                                "Bearer " + token

                        }

                    }
                );


            if (!response.ok) {

                console.error(
                    "Unread count status:",
                    response.status
                );

                return;

            }


            const data =
                await response.json();


            const count =
                Number(
                    data.unread_count
                ) || 0;


            if (count > 0) {

                badge.style.display =
                    "flex";

                badge.innerText =
                    count > 9
                        ? "9+"
                        : count;

            }

            else {

                badge.style.display =
                    "none";

            }

        }

        catch (error) {

            console.error(
                "Unread count error:",
                error
            );

        }

    }


    // =====================================================
    // START
    // =====================================================

    fetchUnreadCount();


    setInterval(
        fetchUnreadCount,
        30000
    );


})();